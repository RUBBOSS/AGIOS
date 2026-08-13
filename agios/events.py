from __future__ import annotations

import hashlib
import json
import re
import sqlite3
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator, Mapping

from .contracts import canonical_json, utc_now


SCHEMA_VERSION = 1
ZERO_HASH = "0" * 64
FORBIDDEN_KEYS = {
    "password",
    "secret",
    "api_key",
    "access_token",
    "credential",
    "prompt",
    "message",
    "content",
    "body",
}
SECRET_VALUE = re.compile(r"(?:sk|pk|api)[-_][A-Za-z0-9_-]{12,}", re.IGNORECASE)


class EventStoreError(RuntimeError):
    pass


class UnsafeEventPayload(EventStoreError):
    pass


@dataclass(frozen=True)
class EventRecord:
    sequence: int
    event_id: str
    kind: str
    occurred_at: str
    actor_id: str
    subject_id: str
    correlation_id: str
    causation_id: str | None
    idempotency_key: str | None
    payload: Mapping[str, Any]
    payload_hash: str
    previous_hash: str
    event_hash: str


def _assert_safe_payload(value: Any, path: str = "payload") -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            if not isinstance(key, str):
                raise UnsafeEventPayload(f"{path} contains a non-string key")
            normalized = key.lower()
            if normalized in FORBIDDEN_KEYS or normalized.endswith("_secret"):
                raise UnsafeEventPayload(f"{path}.{key} is forbidden in the event journal")
            _assert_safe_payload(child, f"{path}.{key}")
    elif isinstance(value, (list, tuple)):
        for index, child in enumerate(value):
            _assert_safe_payload(child, f"{path}[{index}]")
    elif isinstance(value, str):
        if len(value) > 2048:
            raise UnsafeEventPayload(f"{path} exceeds the event field limit")
        if SECRET_VALUE.search(value):
            raise UnsafeEventPayload(f"{path} resembles a credential")
    elif value is not None and not isinstance(value, (bool, int, float)):
        raise UnsafeEventPayload(f"{path} contains an unsupported value")


def _event_hash(
    *,
    event_id: str,
    kind: str,
    occurred_at: str,
    actor_id: str,
    subject_id: str,
    correlation_id: str,
    causation_id: str | None,
    idempotency_key: str | None,
    payload_hash: str,
    previous_hash: str,
) -> str:
    material = canonical_json(
        {
            "event_id": event_id,
            "kind": kind,
            "occurred_at": occurred_at,
            "actor_id": actor_id,
            "subject_id": subject_id,
            "correlation_id": correlation_id,
            "causation_id": causation_id,
            "idempotency_key": idempotency_key,
            "payload_hash": payload_hash,
            "previous_hash": previous_hash,
        }
    )
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


class EventJournal:
    """Local append-only, hash-chained AGIOS activity journal."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path).expanduser().absolute()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if self.path.exists() and self.path.is_symlink():
            raise EventStoreError("event journal cannot be a symbolic link")
        self.connection = sqlite3.connect(self.path, timeout=5)
        self.connection.row_factory = sqlite3.Row
        self.connection.execute("PRAGMA journal_mode=WAL")
        self.connection.execute("PRAGMA foreign_keys=ON")
        self.connection.execute("PRAGMA busy_timeout=5000")
        self._initialize()

    def _initialize(self) -> None:
        self.connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS metadata (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS events (
                sequence INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT NOT NULL UNIQUE,
                kind TEXT NOT NULL,
                occurred_at TEXT NOT NULL,
                actor_id TEXT NOT NULL,
                subject_id TEXT NOT NULL,
                correlation_id TEXT NOT NULL,
                causation_id TEXT,
                idempotency_key TEXT UNIQUE,
                payload_json TEXT NOT NULL,
                payload_hash TEXT NOT NULL,
                previous_hash TEXT NOT NULL,
                event_hash TEXT NOT NULL UNIQUE
            );
            CREATE INDEX IF NOT EXISTS events_correlation_sequence
                ON events(correlation_id, sequence);
            CREATE INDEX IF NOT EXISTS events_kind_sequence
                ON events(kind, sequence);
            CREATE TRIGGER IF NOT EXISTS events_no_update
                BEFORE UPDATE ON events
                BEGIN SELECT RAISE(ABORT, 'AGIOS events are append-only'); END;
            CREATE TRIGGER IF NOT EXISTS events_no_delete
                BEFORE DELETE ON events
                BEGIN SELECT RAISE(ABORT, 'AGIOS events are append-only'); END;
            """
        )
        row = self.connection.execute(
            "SELECT value FROM metadata WHERE key='schema_version'"
        ).fetchone()
        if row is None:
            self.connection.execute(
                "INSERT INTO metadata(key, value) VALUES('schema_version', ?)",
                (str(SCHEMA_VERSION),),
            )
        elif row["value"] != str(SCHEMA_VERSION):
            raise EventStoreError("unsupported event journal schema")
        self.connection.commit()

    def close(self) -> None:
        self.connection.close()

    def __enter__(self) -> "EventJournal":
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def append(
        self,
        *,
        kind: str,
        actor_id: str,
        subject_id: str,
        correlation_id: str,
        payload: Mapping[str, Any],
        causation_id: str | None = None,
        idempotency_key: str | None = None,
        occurred_at: str | None = None,
        event_id: str | None = None,
    ) -> EventRecord:
        for label, value in (
            ("kind", kind),
            ("actor_id", actor_id),
            ("subject_id", subject_id),
            ("correlation_id", correlation_id),
        ):
            if not isinstance(value, str) or not value or len(value) > 128:
                raise EventStoreError(f"{label} is invalid")
        _assert_safe_payload(payload)
        payload_json = canonical_json(payload)
        payload_hash = hashlib.sha256(payload_json.encode("utf-8")).hexdigest()

        if idempotency_key is not None:
            existing = self.connection.execute(
                "SELECT * FROM events WHERE idempotency_key=?", (idempotency_key,)
            ).fetchone()
            if existing is not None:
                record = self._record(existing)
                if (
                    record.kind != kind
                    or record.actor_id != actor_id
                    or record.subject_id != subject_id
                    or record.correlation_id != correlation_id
                    or record.causation_id != causation_id
                    or record.payload_hash != payload_hash
                ):
                    raise EventStoreError("idempotency key was reused for a different event")
                return record

        try:
            self.connection.execute("BEGIN IMMEDIATE")
            previous = self.connection.execute(
                "SELECT event_hash FROM events ORDER BY sequence DESC LIMIT 1"
            ).fetchone()
            previous_hash = previous["event_hash"] if previous is not None else ZERO_HASH
            selected_event_id = event_id or str(uuid.uuid4())
            selected_time = occurred_at or utc_now()
            selected_hash = _event_hash(
                event_id=selected_event_id,
                kind=kind,
                occurred_at=selected_time,
                actor_id=actor_id,
                subject_id=subject_id,
                correlation_id=correlation_id,
                causation_id=causation_id,
                idempotency_key=idempotency_key,
                payload_hash=payload_hash,
                previous_hash=previous_hash,
            )
            cursor = self.connection.execute(
                """
                INSERT INTO events(
                    event_id, kind, occurred_at, actor_id, subject_id,
                    correlation_id, causation_id, idempotency_key, payload_json,
                    payload_hash, previous_hash, event_hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    selected_event_id,
                    kind,
                    selected_time,
                    actor_id,
                    subject_id,
                    correlation_id,
                    causation_id,
                    idempotency_key,
                    payload_json,
                    payload_hash,
                    previous_hash,
                    selected_hash,
                ),
            )
            self.connection.commit()
        except sqlite3.IntegrityError as exc:
            self.connection.rollback()
            raise EventStoreError("event append violated journal integrity") from exc
        row = self.connection.execute(
            "SELECT * FROM events WHERE sequence=?", (cursor.lastrowid,)
        ).fetchone()
        if row is None:
            raise EventStoreError("appended event could not be read back")
        return self._record(row)

    def events(self, correlation_id: str | None = None) -> Iterator[EventRecord]:
        if correlation_id is None:
            rows = self.connection.execute("SELECT * FROM events ORDER BY sequence")
        else:
            rows = self.connection.execute(
                "SELECT * FROM events WHERE correlation_id=? ORDER BY sequence",
                (correlation_id,),
            )
        for row in rows:
            yield self._record(row)

    @staticmethod
    def _record(row: sqlite3.Row) -> EventRecord:
        return EventRecord(
            sequence=row["sequence"],
            event_id=row["event_id"],
            kind=row["kind"],
            occurred_at=row["occurred_at"],
            actor_id=row["actor_id"],
            subject_id=row["subject_id"],
            correlation_id=row["correlation_id"],
            causation_id=row["causation_id"],
            idempotency_key=row["idempotency_key"],
            payload=json.loads(row["payload_json"]),
            payload_hash=row["payload_hash"],
            previous_hash=row["previous_hash"],
            event_hash=row["event_hash"],
        )

    def verify_chain(self) -> bool:
        previous_hash = ZERO_HASH
        for event in self.events():
            if event.previous_hash != previous_hash:
                return False
            payload_hash = hashlib.sha256(
                canonical_json(event.payload).encode("utf-8")
            ).hexdigest()
            if payload_hash != event.payload_hash:
                return False
            expected = _event_hash(
                event_id=event.event_id,
                kind=event.kind,
                occurred_at=event.occurred_at,
                actor_id=event.actor_id,
                subject_id=event.subject_id,
                correlation_id=event.correlation_id,
                causation_id=event.causation_id,
                idempotency_key=event.idempotency_key,
                payload_hash=event.payload_hash,
                previous_hash=event.previous_hash,
            )
            if expected != event.event_hash:
                return False
            previous_hash = event.event_hash
        return True

    def recovery_plan(self, correlation_id: str) -> tuple[str, ...]:
        pending: list[str] = []
        for event in self.events(correlation_id):
            if event.kind == "handoff.created":
                recipient = event.payload.get("recipient_id")
                if isinstance(recipient, str) and recipient not in pending:
                    pending.append(recipient)
            elif event.kind == "work.result":
                worker = event.payload.get("worker_id")
                if isinstance(worker, str) and worker in pending:
                    pending.remove(worker)
            elif event.kind == "workflow.completed":
                pending.clear()
        return tuple(pending)

    def summary(self) -> Mapping[str, Any]:
        event_count = self.connection.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        task_count = self.connection.execute(
            "SELECT COUNT(DISTINCT correlation_id) FROM events"
        ).fetchone()[0]
        route_count = self.connection.execute(
            "SELECT COUNT(*) FROM events WHERE kind='route.selected'"
        ).fetchone()[0]
        approval_requested = self.connection.execute(
            "SELECT COUNT(*) FROM events WHERE kind='approval.requested'"
        ).fetchone()[0]
        approval_resolved = self.connection.execute(
            "SELECT COUNT(*) FROM events WHERE kind IN ('approval.granted','approval.rejected','approval.expired')"
        ).fetchone()[0]
        last = self.connection.execute(
            "SELECT occurred_at FROM events ORDER BY sequence DESC LIMIT 1"
        ).fetchone()
        return {
            "schema_version": SCHEMA_VERSION,
            "status": "healthy" if self.verify_chain() else "invalid-chain",
            "event_count": event_count,
            "task_count": task_count,
            "route_decision_count": route_count,
            "pending_approval_count": max(0, approval_requested - approval_resolved),
            "last_event_at": last["occurred_at"] if last is not None else None,
        }


def read_journal_summary(path: str | Path) -> Mapping[str, Any]:
    candidate = Path(path).expanduser().resolve(strict=True)
    uri = f"file:{candidate.as_posix()}?mode=ro"
    connection = sqlite3.connect(uri, uri=True, timeout=1)
    connection.row_factory = sqlite3.Row
    try:
        connection.execute("PRAGMA query_only=ON")
        schema = connection.execute(
            "SELECT value FROM metadata WHERE key='schema_version'"
        ).fetchone()
        if schema is None or schema["value"] != str(SCHEMA_VERSION):
            raise EventStoreError("unsupported event journal schema")
        event_count = connection.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        task_count = connection.execute(
            "SELECT COUNT(DISTINCT correlation_id) FROM events"
        ).fetchone()[0]
        route_count = connection.execute(
            "SELECT COUNT(*) FROM events WHERE kind='route.selected'"
        ).fetchone()[0]
        pending = connection.execute(
            """
            SELECT
              SUM(CASE WHEN kind='approval.requested' THEN 1 ELSE 0 END) -
              SUM(CASE WHEN kind IN ('approval.granted','approval.rejected','approval.expired') THEN 1 ELSE 0 END)
            FROM events
            """
        ).fetchone()[0]
        last = connection.execute(
            "SELECT occurred_at FROM events ORDER BY sequence DESC LIMIT 1"
        ).fetchone()
        return {
            "schema_version": SCHEMA_VERSION,
            "status": "available",
            "event_count": int(event_count),
            "task_count": int(task_count),
            "route_decision_count": int(route_count),
            "pending_approval_count": max(0, int(pending or 0)),
            "last_event_at": last["occurred_at"] if last is not None else None,
        }
    except sqlite3.DatabaseError as exc:
        raise EventStoreError("event journal is unreadable") from exc
    finally:
        connection.close()
