from __future__ import annotations

import base64
import binascii
import hashlib
import json
import sqlite3
import uuid
from pathlib import Path
from typing import Any, Mapping

from .events import EventJournal
from .operational import OperationalError, _bounded_text, _database, utc_now


A2A_VERSION = "1.0"
TERMINAL_STATES = {
    "TASK_STATE_COMPLETED", "TASK_STATE_FAILED", "TASK_STATE_CANCELED", "TASK_STATE_REJECTED"
}


class A2AError(RuntimeError):
    def __init__(self, code: int, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class A2ATaskStore:
    """Private local A2A state. The audit journal receives digests and status only."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path).expanduser().absolute()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if self.path.exists() and self.path.is_symlink():
            raise OperationalError("A2A task store cannot be a symbolic link")
        with _database(self.path) as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS a2a_tasks (
                    task_id TEXT PRIMARY KEY,
                    context_id TEXT NOT NULL,
                    skill_id TEXT NOT NULL,
                    agent_id TEXT NOT NULL,
                    project_id TEXT,
                    data_class TEXT NOT NULL,
                    status TEXT NOT NULL,
                    request_digest TEXT NOT NULL,
                    run_id TEXT,
                    artifact_json TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_a2a_tasks_updated
                    ON a2a_tasks(updated_at DESC, task_id);
                CREATE INDEX IF NOT EXISTS idx_a2a_tasks_context_updated
                    ON a2a_tasks(context_id, updated_at DESC);
                """
            )
            connection.execute("PRAGMA optimize")

    @staticmethod
    def _record(row: sqlite3.Row) -> dict[str, Any]:
        item = dict(row)
        item["artifact"] = json.loads(item.pop("artifact_json")) if item["artifact_json"] else None
        return item

    def create(
        self,
        *,
        context_id: str,
        skill_id: str,
        agent_id: str,
        project_id: str | None,
        data_class: str,
        status: str,
        request_digest: str,
        run_id: str | None = None,
        artifact: Mapping[str, Any] | None = None,
    ) -> Mapping[str, Any]:
        task_id = str(uuid.uuid4())
        now = utc_now()
        with _database(self.path) as connection:
            connection.execute(
                """
                INSERT INTO a2a_tasks(
                    task_id, context_id, skill_id, agent_id, project_id, data_class,
                    status, request_digest, run_id, artifact_json, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    task_id, context_id, skill_id, agent_id, project_id, data_class,
                    status, request_digest, run_id,
                    json.dumps(artifact, separators=(",", ":")) if artifact else None,
                    now, now,
                ),
            )
        return self.get(task_id)

    def get(self, task_id: str) -> Mapping[str, Any]:
        with _database(self.path) as connection:
            row = connection.execute(
                "SELECT * FROM a2a_tasks WHERE task_id=?", (str(task_id),)
            ).fetchone()
        if row is None:
            raise A2AError(-32001, "task was not found")
        return self._record(row)

    @staticmethod
    def _encode_cursor(updated_at: str, task_id: str) -> str:
        raw = json.dumps({"updated_at": updated_at, "task_id": task_id}, separators=(",", ":"))
        return base64.urlsafe_b64encode(raw.encode("utf-8")).decode("ascii").rstrip("=")

    @staticmethod
    def _decode_cursor(token: str) -> tuple[str, str]:
        try:
            padded = str(token) + "=" * (-len(str(token)) % 4)
            value = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))
            return str(value["updated_at"]), str(value["task_id"])
        except (binascii.Error, KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
            raise A2AError(-32602, "page token is not recognized") from exc

    def page(
        self,
        *,
        context_id: str | None = None,
        status: str | None = None,
        page_token: str = "",
        limit: int = 50,
    ) -> tuple[list[Mapping[str, Any]], str, int]:
        clauses: list[str] = []
        values: list[Any] = []
        if context_id:
            clauses.append("context_id=?")
            values.append(context_id)
        if status:
            clauses.append("status=?")
            values.append(status)
        filter_clauses = list(clauses)
        filter_values = list(values)
        if page_token:
            updated_at, task_id = self._decode_cursor(page_token)
            clauses.append("(updated_at < ? OR (updated_at = ? AND task_id > ?))")
            values.extend((updated_at, updated_at, task_id))
        where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
        selected_limit = max(1, min(int(limit), 100))
        values.append(selected_limit + 1)
        filter_where = f" WHERE {' AND '.join(filter_clauses)}" if filter_clauses else ""
        with _database(self.path) as connection:
            rows = connection.execute(
                f"SELECT * FROM a2a_tasks{where} ORDER BY updated_at DESC, task_id LIMIT ?",
                values,
            ).fetchall()
            total = connection.execute(
                f"SELECT COUNT(*) FROM a2a_tasks{filter_where}", filter_values
            ).fetchone()[0]
        records = [self._record(row) for row in rows[:selected_limit]]
        next_token = ""
        if len(rows) > selected_limit and records:
            last = records[-1]
            next_token = self._encode_cursor(str(last["updated_at"]), str(last["task_id"]))
        return records, next_token, int(total)

    def list(
        self, *, context_id: str | None = None, status: str | None = None, limit: int = 50
    ) -> list[Mapping[str, Any]]:
        records, _, _ = self.page(context_id=context_id, status=status, limit=limit)
        return records

    def update(
        self, task_id: str, *, status: str, artifact: Mapping[str, Any] | None = None
    ) -> Mapping[str, Any]:
        with _database(self.path) as connection:
            cursor = connection.execute(
                "UPDATE a2a_tasks SET status=?, artifact_json=?, updated_at=? WHERE task_id=?",
                (
                    status,
                    json.dumps(artifact, separators=(",", ":")) if artifact else None,
                    utc_now(),
                    task_id,
                ),
            )
            if cursor.rowcount != 1:
                raise A2AError(-32001, "task was not found")
        return self.get(task_id)


class A2AService:
    skill_ids = {"scoped-knowledge-retrieval", "supervised-research-planning"}

    def __init__(self, *, config: Any, operational: Any, state_dir: Path, journal_path: Path) -> None:
        self.config = config
        self.operational = operational
        self.retrieval = operational.retrieval
        self.store = A2ATaskStore(state_dir / "a2a-tasks.sqlite3")
        self.journal_path = journal_path

    @staticmethod
    def agent_card(base_url: str) -> Mapping[str, Any]:
        return {
            "name": "AGIOS Local Agent Gateway",
            "description": "Single-owner authenticated local gateway for scoped knowledge retrieval and supervised planning.",
            "supportedInterfaces": [
                {"url": f"{base_url.rstrip('/')}/a2a/v1", "protocolBinding": "JSONRPC", "protocolVersion": A2A_VERSION}
            ],
            "version": "0.3.0",
            "capabilities": {"streaming": False, "pushNotifications": False, "extendedAgentCard": False},
            "securitySchemes": {
                "localSession": {"apiKeySecurityScheme": {"name": "agios_session", "in": "cookie"}},
                "csrfHeader": {"apiKeySecurityScheme": {"name": "X-AGIOS-CSRF", "in": "header"}},
            },
            "securityRequirements": [{"schemes": {"localSession": {"list": []}, "csrfHeader": {"list": []}}}],
            "defaultInputModes": ["text/plain", "application/json"],
            "defaultOutputModes": ["text/plain", "application/json"],
            "skills": [
                {
                    "id": "scoped-knowledge-retrieval",
                    "name": "Scoped knowledge retrieval",
                    "description": "Returns citation-ready AGIOS memory evidence limited to the caller's authorized agent and project scopes.",
                    "tags": ["rag", "memory", "citations"],
                    "examples": ["Find our verified studio operating principles."],
                },
                {
                    "id": "supervised-research-planning",
                    "name": "Supervised research planning",
                    "description": "Creates an exact-approval AGIOS goal; it never dispatches autonomously.",
                    "tags": ["research", "planning", "human-in-the-loop"],
                    "examples": ["Prepare a sourced market research plan."],
                },
            ],
        }

    @staticmethod
    def _message(params: Mapping[str, Any]) -> tuple[str, Mapping[str, Any], Mapping[str, Any]]:
        message = params.get("message")
        if not isinstance(message, Mapping):
            raise A2AError(-32602, "message is required")
        if message.get("role") not in {"ROLE_USER", "user"}:
            raise A2AError(-32602, "only user messages are accepted")
        if message.get("taskId"):
            raise A2AError(-32004, "task continuation is not supported by this local subset")
        parts = message.get("parts")
        if not isinstance(parts, list) or not parts:
            raise A2AError(-32602, "a text part is required")
        if any(not isinstance(part, Mapping) or set(part).difference({"text", "metadata"}) for part in parts):
            raise A2AError(-32005, "only text parts are supported")
        text = "\n".join(str(part.get("text") or "") for part in parts).strip()
        text = _bounded_text(text, label="A2A message", limit=8000)
        metadata = message.get("metadata") or {}
        if not isinstance(metadata, Mapping):
            raise A2AError(-32602, "message metadata is invalid")
        return text, metadata, message

    def _task(self, record: Mapping[str, Any], *, include_artifacts: bool = True) -> Mapping[str, Any]:
        current = dict(record)
        run_id = current.get("run_id")
        if run_id and current["status"] not in TERMINAL_STATES:
            try:
                run = self.operational.sessions.get(str(run_id))
                mapped = {
                    "awaiting_approval": "TASK_STATE_AUTH_REQUIRED",
                    "queued": "TASK_STATE_WORKING",
                    "running": "TASK_STATE_WORKING",
                    "completed": "TASK_STATE_COMPLETED",
                    "failed": "TASK_STATE_FAILED",
                    "interrupted": "TASK_STATE_FAILED",
                    "canceled": "TASK_STATE_CANCELED",
                }.get(str(run["status"]), "TASK_STATE_UNKNOWN")
                artifact = current.get("artifact")
                if mapped == "TASK_STATE_COMPLETED":
                    artifact = {
                        "artifactId": str(uuid.uuid4()),
                        "name": "AGIOS supervised result",
                        "parts": [{"text": str(run.get("response") or "")}],
                    }
                if mapped != current["status"] or artifact != current.get("artifact"):
                    current = dict(self.store.update(str(current["task_id"]), status=mapped, artifact=artifact))
            except OperationalError:
                current = dict(self.store.update(str(current["task_id"]), status="TASK_STATE_FAILED"))
        task: dict[str, Any] = {
            "id": current["task_id"],
            "contextId": current["context_id"],
            "status": {"state": current["status"], "timestamp": current["updated_at"]},
            "metadata": {
                "skillId": current["skill_id"],
                "agentId": current["agent_id"],
                "dataClass": current["data_class"],
                "localRunId": current.get("run_id"),
            },
        }
        if include_artifacts and current.get("artifact"):
            task["artifacts"] = [current["artifact"]]
        return task

    def _journal(self, record: Mapping[str, Any], kind: str) -> None:
        audit_status = str(record["status"]).removeprefix("TASK_STATE_").lower().replace("_", "-")
        with EventJournal(self.journal_path) as journal:
            journal.append(
                kind=kind,
                actor_id="owner-via-local-a2a",
                subject_id=str(record["task_id"]),
                correlation_id=str(record["context_id"]),
                payload={
                    "skill_id": record["skill_id"],
                    "agent_id": record["agent_id"],
                    "data_class": record["data_class"],
                    "request_digest": record["request_digest"],
                    "status": audit_status,
                },
                idempotency_key=f"{kind}:{record['task_id']}:{record['status']}",
            )

    def send_message(self, params: Mapping[str, Any]) -> Mapping[str, Any]:
        text, metadata, message = self._message(params)
        skill_id = str(metadata.get("skillId") or "scoped-knowledge-retrieval")
        if skill_id not in self.skill_ids:
            raise A2AError(-32602, "requested skill is not advertised")
        agent_id = str(metadata.get("agentId") or "default")
        if agent_id not in self.config.agents:
            raise A2AError(-32602, "agent is not registered")
        project_id = str(metadata.get("projectId") or "").strip() or None
        data_class = str(metadata.get("dataClass") or "internal")
        if data_class not in {"public", "internal", "private_business", "customer_restricted"}:
            raise A2AError(-32602, "data class is invalid")
        context_id = str(message.get("contextId") or metadata.get("contextId") or uuid.uuid4())[:160]
        request_material = json.dumps(
            {
                "text": text,
                "skill_id": skill_id,
                "agent_id": agent_id,
                "project_id": project_id,
                "data_class": data_class,
                "context_id": context_id,
            },
            sort_keys=True,
            separators=(",", ":"),
        )
        request_digest = hashlib.sha256(request_material.encode("utf-8")).hexdigest()

        if skill_id == "scoped-knowledge-retrieval":
            result = self.retrieval.retrieve(
                agent_id=agent_id, project_id=project_id, query=text, limit=8
            )
            citations = [
                {
                    "citationId": hit["citation_id"], "title": hit["title"],
                    "text": hit["body"], "scopeKind": hit["scope_kind"],
                    "scopeId": hit["scope_id"], "trust": hit["trust"],
                    "score": hit["score"], "updatedAt": hit["updated_at"],
                }
                for hit in result.hits
            ]
            artifact = {
                "artifactId": str(uuid.uuid4()),
                "name": "AGIOS scoped evidence",
                "parts": [
                    {"text": f"Retrieved {len(citations)} authorized memory records. Evidence may be insufficient when this count is zero."},
                    {"data": {"mode": result.mode, "citations": citations}, "mediaType": "application/json"},
                ],
            }
            record = self.store.create(
                context_id=context_id, skill_id=skill_id, agent_id=agent_id,
                project_id=project_id, data_class=data_class,
                status="TASK_STATE_COMPLETED", request_digest=request_digest, artifact=artifact,
            )
        else:
            try:
                run = self.operational.create_run(
                    mode="goal", agent_id=agent_id, objective=text, data_class=data_class,
                    project_id=project_id, skill_ids=(), memory_ids=(),
                )
            except OperationalError as exc:
                raise A2AError(-32602, str(exc)) from exc
            record = self.store.create(
                context_id=context_id, skill_id=skill_id, agent_id=agent_id,
                project_id=project_id, data_class=data_class,
                status="TASK_STATE_AUTH_REQUIRED", request_digest=request_digest,
                run_id=str(run["run_id"]),
            )
        self._journal(record, "a2a.task.created")
        return {"task": self._task(record)}

    def handle(self, request: Mapping[str, Any]) -> Mapping[str, Any]:
        request_id = request.get("id")
        if request.get("jsonrpc") != "2.0" or not isinstance(request.get("method"), str):
            return {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32600, "message": "invalid request"}}
        params = request.get("params") or {}
        if not isinstance(params, Mapping):
            return {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32602, "message": "invalid params"}}
        try:
            method = request["method"]
            if method == "SendMessage":
                result = self.send_message(params)
            elif method == "GetTask":
                result = {"task": self._task(self.store.get(str(params.get("id") or "")))}
            elif method == "ListTasks":
                records, next_token, total = self.store.page(
                    context_id=str(params.get("contextId") or "") or None,
                    status=str(params.get("status") or "") or None,
                    page_token=str(params.get("pageToken") or ""),
                    limit=int(params.get("pageSize") or 50),
                )
                include_artifacts = bool(params.get("includeArtifacts", False))
                result = {
                    "tasks": [self._task(item, include_artifacts=include_artifacts) for item in records],
                    "totalSize": total, "pageSize": len(records), "nextPageToken": next_token,
                }
            elif method == "CancelTask":
                record = self.store.get(str(params.get("id") or ""))
                if record["status"] != "TASK_STATE_AUTH_REQUIRED":
                    raise A2AError(-32002, "task is not cancelable")
                if record.get("run_id"):
                    self.operational.sessions.cancel(str(record["run_id"]))
                record = self.store.update(str(record["task_id"]), status="TASK_STATE_CANCELED")
                self._journal(record, "a2a.task.canceled")
                result = {"task": self._task(record)}
            else:
                raise A2AError(-32601, "method not found")
            return {"jsonrpc": "2.0", "id": request_id, "result": result}
        except (A2AError, OperationalError, ValueError, TypeError) as exc:
            code = exc.code if isinstance(exc, A2AError) else -32602
            message = exc.message if isinstance(exc, A2AError) else str(exc)
            return {"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": message}}

    def summary(self) -> Mapping[str, Any]:
        return {
            "status": "ready",
            "protocol": "A2A",
            "protocol_version": A2A_VERSION,
            "binding": "JSONRPC",
            "transport": "loopback-authenticated",
            "advertised_skills": len(self.skill_ids),
            "task_count": len(self.store.list(limit=100)),
            "streaming": False,
            "push_notifications": False,
            "outbound_peers": "locked",
        }
