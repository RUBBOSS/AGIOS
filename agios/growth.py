from __future__ import annotations

import json
import hashlib
import os
import re
import sqlite3
import tempfile
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


class AgentGrowthStore:
    """Evidence ledger for agent-authored skill improvements."""

    def __init__(self, path: str | Path, skill_root: str | Path | None = None) -> None:
        self.path = Path(path).expanduser().absolute()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.skill_root = Path(skill_root or self.path.parent / "shared-skills").expanduser().absolute()
        self.skill_root.mkdir(parents=True, exist_ok=True)
        with _database(self.path) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS skill_proposals (
                    proposal_id TEXT PRIMARY KEY,
                    agent_id TEXT NOT NULL,
                    skill_name TEXT NOT NULL,
                    change_kind TEXT NOT NULL,
                    rationale TEXT NOT NULL,
                    evidence_run_ids_json TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    reviewed_at TEXT,
                    draft_body TEXT,
                    draft_digest TEXT,
                    validation_json TEXT,
                    installed_at TEXT
                )
                """
            )
            columns = {
                row[1]
                for row in connection.execute("PRAGMA table_info(skill_proposals)")
            }
            for name, definition in {
                "draft_body": "TEXT",
                "draft_digest": "TEXT",
                "validation_json": "TEXT",
                "installed_at": "TEXT",
            }.items():
                if name not in columns:
                    connection.execute(
                        f"ALTER TABLE skill_proposals ADD COLUMN {name} {definition}"
                    )

    @staticmethod
    def _record(row: sqlite3.Row) -> dict[str, Any]:
        item = dict(row)
        item["evidence_run_ids"] = json.loads(item.pop("evidence_run_ids_json"))
        validation = item.pop("validation_json", None)
        item["validation"] = json.loads(validation) if validation else None
        return item

    def create(
        self,
        *,
        agent_id: str,
        skill_name: str,
        change_kind: str,
        rationale: str,
        evidence_run_ids: Iterable[str],
    ) -> Mapping[str, Any]:
        proposal_id = str(uuid.uuid4())
        evidence = tuple(dict.fromkeys(str(item) for item in evidence_run_ids))[:12]
        status = "awaiting_owner_review" if evidence else "needs_evidence"
        with _database(self.path) as connection:
            connection.execute(
                """
                INSERT INTO skill_proposals(
                    proposal_id, agent_id, skill_name, change_kind, rationale,
                    evidence_run_ids_json, status, created_at, reviewed_at,
                    draft_body, draft_digest, validation_json, installed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL)
                """,
                (
                    proposal_id,
                    agent_id,
                    skill_name,
                    change_kind,
                    rationale,
                    json.dumps(evidence),
                    status,
                    _now(),
                ),
            )
        return self.get(proposal_id)

    def get(self, proposal_id: str) -> Mapping[str, Any]:
        with _database(self.path) as connection:
            connection.row_factory = sqlite3.Row
            row = connection.execute(
                "SELECT * FROM skill_proposals WHERE proposal_id=?", (proposal_id,)
            ).fetchone()
        if row is None:
            raise ValueError("skill proposal was not found")
        return self._record(row)

    def list(self, *, agent_id: str | None = None) -> list[Mapping[str, Any]]:
        with _database(self.path) as connection:
            connection.row_factory = sqlite3.Row
            if agent_id:
                rows = connection.execute(
                    "SELECT * FROM skill_proposals WHERE agent_id=? ORDER BY created_at DESC",
                    (agent_id,),
                ).fetchall()
            else:
                rows = connection.execute(
                    "SELECT * FROM skill_proposals ORDER BY created_at DESC"
                ).fetchall()
        return [self._record(row) for row in rows]

    def approve_for_authoring(self, proposal_id: str) -> Mapping[str, Any]:
        with _database(self.path) as connection:
            cursor = connection.execute(
                "UPDATE skill_proposals SET status='approved_for_authoring', reviewed_at=? "
                "WHERE proposal_id=? AND status='awaiting_owner_review'",
                (_now(), proposal_id),
            )
        if cursor.rowcount != 1:
            raise ValueError("skill proposal is not ready for owner approval")
        proposal = self.get(proposal_id)
        return self.save_draft(proposal_id, self._starter_draft(proposal))

    @staticmethod
    def _starter_draft(proposal: Mapping[str, Any]) -> str:
        rationale = " ".join(str(proposal["rationale"]).split())
        description = rationale[:220].rstrip(" .") or "A governed AGIOS professional skill."
        return (
            "---\n"
            f"name: {proposal['skill_name']}\n"
            f"description: {description}\n"
            "---\n\n"
            f"# {str(proposal['skill_name']).replace('-', ' ').title()}\n\n"
            "## Purpose\n\n"
            f"{rationale}\n\n"
            "## Operating workflow\n\n"
            "1. Confirm the request, authority boundary, data class, and expected evidence.\n"
            "2. Perform the smallest permitted action that satisfies the request.\n"
            "3. Verify the result from primary evidence and state any uncertainty.\n"
            "4. Stop for owner approval before external, destructive, financial, or deployment actions.\n\n"
            "## Verification\n\n"
            "- Record the evidence used and the checks that passed.\n"
            "- Never claim completion without an observable result.\n"
        )

    @staticmethod
    def _digest(body: str) -> str:
        return hashlib.sha256(body.encode("utf-8")).hexdigest()

    @staticmethod
    def _validate_body(skill_name: str, body: str) -> list[str]:
        errors: list[str] = []
        if not body or len(body.encode("utf-8")) > 20_000:
            errors.append("draft must be between 1 byte and 20 KB")
        if "\x00" in body:
            errors.append("draft contains an invalid null byte")
        frontmatter = re.match(r"\A---\r?\n(.*?)\r?\n---\r?\n", body, re.DOTALL)
        if frontmatter is None:
            errors.append("draft requires YAML frontmatter")
        else:
            header = frontmatter.group(1)
            name_match = re.search(r"(?m)^name:\s*([^\r\n]+)$", header)
            description_match = re.search(r"(?m)^description:\s*([^\r\n]+)$", header)
            if not name_match or name_match.group(1).strip() != skill_name:
                errors.append("frontmatter name must match the approved skill name")
            if not description_match or not description_match.group(1).strip():
                errors.append("frontmatter requires a description")
        credential_patterns = (
            r"(?i)-----BEGIN [A-Z ]*PRIVATE KEY-----",
            r"(?i)(?:api[_-]?key|password|secret)\s*[:=]\s*['\"]?[A-Za-z0-9_\-/+=]{16,}",
            r"\bsk-[A-Za-z0-9_-]{16,}\b",
        )
        if any(re.search(pattern, body) for pattern in credential_patterns):
            errors.append("draft appears to contain credential material")
        return errors

    def save_draft(self, proposal_id: str, body: str) -> Mapping[str, Any]:
        proposal = self.get(proposal_id)
        if proposal["status"] not in {
            "approved_for_authoring",
            "draft_ready",
            "validated",
        }:
            raise ValueError("skill proposal is not approved for authoring")
        selected = str(body or "")
        if not selected or len(selected.encode("utf-8")) > 20_000:
            raise ValueError("skill draft must be between 1 byte and 20 KB")
        digest = self._digest(selected)
        with _database(self.path) as connection:
            connection.execute(
                """
                UPDATE skill_proposals
                SET draft_body=?, draft_digest=?, validation_json=NULL, status='draft_ready'
                WHERE proposal_id=?
                """,
                (selected, digest, proposal_id),
            )
        return self.get(proposal_id)

    def validate_draft(self, proposal_id: str) -> Mapping[str, Any]:
        proposal = self.get(proposal_id)
        if proposal["status"] not in {"draft_ready", "validated"} or not proposal.get(
            "draft_body"
        ):
            raise ValueError("skill draft is not ready for validation")
        errors = self._validate_body(
            str(proposal["skill_name"]), str(proposal["draft_body"])
        )
        validation = {
            "passed": not errors,
            "errors": errors,
            "checks": [
                "bounded-markdown",
                "matching-frontmatter",
                "credential-screen",
                "owner-install-gate",
            ],
            "validated_at": _now(),
        }
        with _database(self.path) as connection:
            connection.execute(
                "UPDATE skill_proposals SET validation_json=?, status=? WHERE proposal_id=?",
                (json.dumps(validation), "validated" if not errors else "draft_ready", proposal_id),
            )
        return self.get(proposal_id)

    def install(self, proposal_id: str, draft_digest: str) -> Mapping[str, Any]:
        proposal = self.get(proposal_id)
        if proposal["status"] != "validated" or not (proposal.get("validation") or {}).get(
            "passed"
        ):
            raise ValueError("skill draft has not passed validation")
        if proposal.get("draft_digest") != draft_digest:
            raise ValueError("skill installation digest no longer matches the draft")
        skill_name = str(proposal["skill_name"])
        target_dir = self.skill_root / skill_name
        if target_dir.exists() and (target_dir.is_symlink() or not target_dir.is_dir()):
            raise ValueError("shared skill target is unsafe")
        target = target_dir / "SKILL.md"
        existing = target.exists()
        if proposal["change_kind"] == "create" and existing:
            raise ValueError("shared skill already exists; submit an update proposal")
        if proposal["change_kind"] == "update" and not existing:
            raise ValueError("shared skill does not exist; submit a create proposal")
        target_dir.mkdir(parents=True, exist_ok=True)
        if existing:
            prior = target.read_bytes()
            history = self.skill_root / ".history" / skill_name / _now().replace(":", "-")
            history.mkdir(parents=True, exist_ok=False)
            history.joinpath("SKILL.md").write_bytes(prior)
        descriptor, temporary_name = tempfile.mkstemp(
            prefix=".agios-skill-", suffix=".md", dir=target_dir
        )
        try:
            with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
                handle.write(str(proposal["draft_body"]))
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary_name, target)
        except Exception:
            Path(temporary_name).unlink(missing_ok=True)
            raise
        installed_at = _now()
        with _database(self.path) as connection:
            connection.execute(
                "UPDATE skill_proposals SET status='installed', installed_at=? WHERE proposal_id=?",
                (installed_at, proposal_id),
            )
        return self.get(proposal_id)

    def load_installed(self, skill_ids: Iterable[str]) -> tuple[str, tuple[str, ...]]:
        blocks: list[str] = []
        loaded: list[str] = []
        for skill_id in tuple(dict.fromkeys(str(item) for item in skill_ids))[:3]:
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", skill_id):
                continue
            path = self.skill_root / skill_id / "SKILL.md"
            if path.is_file() and not path.is_symlink() and path.stat().st_size <= 20_000:
                blocks.append(path.read_text(encoding="utf-8"))
                loaded.append(skill_id)
        return "\n\n".join(blocks), tuple(loaded)
