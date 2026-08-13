from __future__ import annotations

import hashlib
import json
import re
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Mapping


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


@contextmanager
def _database(path: Path):
    connection = sqlite3.connect(path)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


CHANNELS = {"social", "email", "landing", "listing", "ad"}
LEAD_STAGES = {
    "captured",
    "qualified",
    "outreach_drafted",
    "awaiting_approval",
    "approved",
    "closed",
    "discarded",
}
CONTENT_STAGES = {"draft", "awaiting_owner_review", "approved", "rejected"}
_CREDENTIAL_PATTERNS = (
    r"(?i)-----BEGIN [A-Z ]*PRIVATE KEY-----",
    r"(?i)(?:api[_-]?key|password|secret)\s*[:=]\s*['\"]?[A-Za-z0-9_\-/+=]{16,}",
    r"\bsk-[A-Za-z0-9_-]{16,}\b",
)


class GrowthFunnelStore:
    """Evidence-led pipeline for content drafts and outreach leads.

    The writer role authors bounded content drafts; the closer role moves
    leads through a staged funnel. Nothing here sends external messages:
    approved drafts and outreach leads still require the owner to perform
    the exact external action through an approved integration.
    """

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path).expanduser().absolute()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with _database(self.path) as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS content_drafts (
                    draft_id TEXT PRIMARY KEY,
                    agent_id TEXT NOT NULL,
                    business_id TEXT NOT NULL,
                    channel TEXT NOT NULL,
                    objective TEXT NOT NULL,
                    body TEXT NOT NULL,
                    body_digest TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    reviewed_at TEXT
                );
                CREATE TABLE IF NOT EXISTS leads (
                    lead_id TEXT PRIMARY KEY,
                    agent_id TEXT NOT NULL,
                    business_id TEXT NOT NULL,
                    contact_label TEXT NOT NULL,
                    source TEXT NOT NULL,
                    stage TEXT NOT NULL,
                    notes TEXT NOT NULL,
                    evidence_run_ids_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS drafts_created_at
                    ON content_drafts(created_at DESC);
                CREATE INDEX IF NOT EXISTS leads_updated_at
                    ON leads(updated_at DESC);
                """
            )

    @staticmethod
    def _digest(value: str) -> str:
        return hashlib.sha256(value.encode("utf-8")).hexdigest()

    @staticmethod
    def _bounded_text(value: Any, *, label: str, limit: int) -> str:
        selected = " ".join(str(value or "").split())
        if not selected or len(selected) > limit:
            raise ValueError(f"{label} must be between 1 and {limit} characters")
        return selected

    @staticmethod
    def _screen_credentials(body: str) -> None:
        if any(re.search(pattern, body) for pattern in _CREDENTIAL_PATTERNS):
            raise ValueError("content appears to contain credential material")

    # ------------------------------------------------------------------
    # Content drafts (writer role)
    # ------------------------------------------------------------------

    def create_draft(
        self,
        *,
        agent_id: str,
        business_id: str,
        channel: str,
        objective: str,
        body: str,
    ) -> Mapping[str, Any]:
        if channel not in CHANNELS:
            raise ValueError("content channel is invalid")
        selected_objective = self._bounded_text(objective, label="objective", limit=400)
        selected_body = self._bounded_text(body, label="content body", limit=12000)
        self._screen_credentials(selected_body)
        draft_id = str(uuid.uuid4())
        with _database(self.path) as connection:
            connection.execute(
                """
                INSERT INTO content_drafts(
                    draft_id, agent_id, business_id, channel, objective,
                    body, body_digest, status, created_at, reviewed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, NULL)
                """,
                (
                    draft_id,
                    agent_id,
                    business_id,
                    channel,
                    selected_objective,
                    selected_body,
                    self._digest(selected_body),
                    _now(),
                ),
            )
        return self.get_draft(draft_id)

    def submit_draft(self, draft_id: str) -> Mapping[str, Any]:
        with _database(self.path) as connection:
            cursor = connection.execute(
                "UPDATE content_drafts SET status='awaiting_owner_review' "
                "WHERE draft_id=? AND status='draft'",
                (draft_id,),
            )
        if cursor.rowcount != 1:
            raise ValueError("content draft is not ready for owner review")
        return self.get_draft(draft_id)

    def review_draft(self, draft_id: str, *, approved: bool) -> Mapping[str, Any]:
        status = "approved" if approved else "rejected"
        with _database(self.path) as connection:
            cursor = connection.execute(
                "UPDATE content_drafts SET status=?, reviewed_at=? "
                "WHERE draft_id=? AND status='awaiting_owner_review'",
                (status, _now(), draft_id),
            )
        if cursor.rowcount != 1:
            raise ValueError("content draft is not awaiting owner review")
        return self.get_draft(draft_id)

    def get_draft(self, draft_id: str) -> Mapping[str, Any]:
        with _database(self.path) as connection:
            connection.row_factory = sqlite3.Row
            row = connection.execute(
                "SELECT * FROM content_drafts WHERE draft_id=?", (draft_id,)
            ).fetchone()
        if row is None:
            raise ValueError("content draft was not found")
        return dict(row)

    def list_drafts(
        self, *, agent_id: str | None = None, business_id: str | None = None
    ) -> list[Mapping[str, Any]]:
        clauses = []
        values: list[str] = []
        if agent_id:
            clauses.append("agent_id=?")
            values.append(agent_id)
        if business_id:
            clauses.append("business_id=?")
            values.append(business_id)
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        with _database(self.path) as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(
                f"SELECT * FROM content_drafts {where} ORDER BY created_at DESC",
                values,
            ).fetchall()
        return [dict(row) for row in rows]

    # ------------------------------------------------------------------
    # Leads (closer role)
    # ------------------------------------------------------------------

    def create_lead(
        self,
        *,
        agent_id: str,
        business_id: str,
        contact_label: str,
        source: str,
        notes: str = "",
    ) -> Mapping[str, Any]:
        selected_label = self._bounded_text(contact_label, label="contact label", limit=120)
        selected_source = self._bounded_text(source, label="lead source", limit=120)
        selected_notes = self._bounded_text(notes, label="lead notes", limit=800) if notes else ""
        lead_id = str(uuid.uuid4())
        with _database(self.path) as connection:
            connection.execute(
                """
                INSERT INTO leads(
                    lead_id, agent_id, business_id, contact_label, source,
                    stage, notes, evidence_run_ids_json, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'captured', ?, '[]', ?, ?)
                """,
                (
                    lead_id,
                    agent_id,
                    business_id,
                    selected_label,
                    selected_source,
                    selected_notes,
                    _now(),
                    _now(),
                ),
            )
        return self.get_lead(lead_id)

    def advance_lead(
        self, lead_id: str, stage: str, evidence_run_ids: Iterable[str] = ()
    ) -> Mapping[str, Any]:
        if stage not in LEAD_STAGES:
            raise ValueError("lead stage is invalid")
        lead = self.get_lead(lead_id)
        allowed = {
            "captured": {"qualified", "discarded"},
            "qualified": {"outreach_drafted", "discarded"},
            "outreach_drafted": {"awaiting_approval", "discarded"},
            "awaiting_approval": {"approved", "discarded"},
            "approved": {"closed", "discarded"},
            "closed": set(),
            "discarded": set(),
        }
        if stage not in allowed[lead["stage"]]:
            raise ValueError(f"lead cannot move from {lead['stage']} to {stage}")
        evidence = tuple(dict.fromkeys(str(item) for item in evidence_run_ids))[:12]
        if stage == "closed" and not evidence:
            raise ValueError("closing a lead requires evidence run ids")
        with _database(self.path) as connection:
            connection.execute(
                "UPDATE leads SET stage=?, evidence_run_ids_json=?, updated_at=? "
                "WHERE lead_id=?",
                (stage, json.dumps(evidence), _now(), lead_id),
            )
        return self.get_lead(lead_id)

    def get_lead(self, lead_id: str) -> Mapping[str, Any]:
        with _database(self.path) as connection:
            connection.row_factory = sqlite3.Row
            row = connection.execute(
                "SELECT * FROM leads WHERE lead_id=?", (lead_id,)
            ).fetchone()
        if row is None:
            raise ValueError("lead was not found")
        item = dict(row)
        item["evidence_run_ids"] = json.loads(item.pop("evidence_run_ids_json"))
        return item

    def list_leads(
        self, *, agent_id: str | None = None, business_id: str | None = None
    ) -> list[Mapping[str, Any]]:
        clauses = []
        values: list[str] = []
        if agent_id:
            clauses.append("agent_id=?")
            values.append(agent_id)
        if business_id:
            clauses.append("business_id=?")
            values.append(business_id)
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        with _database(self.path) as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(
                f"SELECT * FROM leads {where} ORDER BY updated_at DESC", values
            ).fetchall()
        return [dict(row) for row in rows]

    def summary(self) -> Mapping[str, Any]:
        with _database(self.path) as connection:
            connection.row_factory = sqlite3.Row
            draft_rows = connection.execute(
                "SELECT status, COUNT(*) AS total FROM content_drafts GROUP BY status"
            ).fetchall()
            lead_rows = connection.execute(
                "SELECT stage, COUNT(*) AS total FROM leads GROUP BY stage"
            ).fetchall()
        return {
            "status": "ready",
            "content_drafts": sum(int(row["total"]) for row in draft_rows),
            "drafts_by_status": {str(row["status"]): int(row["total"]) for row in draft_rows},
            "leads": sum(int(row["total"]) for row in lead_rows),
            "leads_by_stage": {str(row["stage"]): int(row["total"]) for row in lead_rows},
        }
