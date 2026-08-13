from __future__ import annotations

import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Mapping


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


@contextmanager
def _database(path: Path):
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _is_reparse_point(path: Path) -> bool:
    try:
        attributes = path.stat().st_file_attributes
    except AttributeError:
        return path.is_symlink()
    return bool(attributes & 0x400)


class WorkspaceRegistry:
    """Owner-registered local workspaces; raw paths never leave the server."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path).expanduser().absolute()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with _database(self.path) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS workspaces (
                    workspace_id TEXT PRIMARY KEY,
                    label TEXT NOT NULL,
                    root_path TEXT NOT NULL UNIQUE,
                    data_class TEXT NOT NULL,
                    write_allowed INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )

    @staticmethod
    def _public(row: sqlite3.Row) -> dict[str, Any]:
        return {
            "workspace_id": row["workspace_id"],
            "label": row["label"],
            "data_class": row["data_class"],
            "write_allowed": bool(row["write_allowed"]),
            "status": row["status"],
            "created_at": row["created_at"],
        }

    @staticmethod
    def _validated_root(value: str | Path) -> Path:
        candidate = Path(value).expanduser()
        if not candidate.is_absolute():
            raise ValueError("workspace path must be absolute")
        try:
            resolved = candidate.resolve(strict=True)
        except (OSError, RuntimeError) as exc:
            raise ValueError("workspace path is unavailable") from exc
        if not resolved.is_dir() or candidate.is_symlink() or _is_reparse_point(candidate):
            raise ValueError("workspace must be a regular local directory")
        git_marker = resolved / ".git"
        if not git_marker.exists():
            raise ValueError("workspace must be a Git repository or worktree")
        if git_marker.is_symlink() or _is_reparse_point(git_marker):
            raise ValueError("workspace Git metadata cannot be a link")
        return resolved

    def register(
        self,
        *,
        label: str,
        root_path: str,
        data_class: str,
        write_allowed: bool,
    ) -> Mapping[str, Any]:
        selected_label = str(label or "").strip()[:120]
        if not selected_label:
            raise ValueError("workspace label is required")
        if data_class not in {"public", "internal", "private_business", "customer_restricted"}:
            raise ValueError("workspace data class is invalid")
        resolved = self._validated_root(root_path)
        workspace_id = str(uuid.uuid4())
        with _database(self.path) as connection:
            try:
                connection.execute(
                    "INSERT INTO workspaces VALUES (?, ?, ?, ?, ?, 'active', ?)",
                    (
                        workspace_id,
                        selected_label,
                        os.fspath(resolved),
                        data_class,
                        int(bool(write_allowed)),
                        _now(),
                    ),
                )
            except sqlite3.IntegrityError as exc:
                raise ValueError("workspace is already registered") from exc
        return self.get(workspace_id)

    def get(self, workspace_id: str) -> Mapping[str, Any]:
        with _database(self.path) as connection:
            row = connection.execute(
                "SELECT * FROM workspaces WHERE workspace_id=?", (workspace_id,)
            ).fetchone()
        if row is None:
            raise ValueError("workspace was not found")
        return self._public(row)

    def resolve(self, workspace_id: str) -> tuple[Mapping[str, Any], Path]:
        with _database(self.path) as connection:
            row = connection.execute(
                "SELECT * FROM workspaces WHERE workspace_id=? AND status='active'",
                (workspace_id,),
            ).fetchone()
        if row is None:
            raise ValueError("workspace is not active")
        root = self._validated_root(row["root_path"])
        return self._public(row), root

    def list(self) -> list[Mapping[str, Any]]:
        with _database(self.path) as connection:
            rows = connection.execute(
                "SELECT * FROM workspaces ORDER BY created_at DESC"
            ).fetchall()
        return [self._public(row) for row in rows]
