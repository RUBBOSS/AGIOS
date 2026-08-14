from __future__ import annotations

import json
import sqlite3
import subprocess
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping


GitRunner = Callable[..., Any]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _bounded_title(value: object, fallback: str) -> str:
    text = " ".join(str(value or "").split()).strip()
    return (text or fallback)[:160]


def _open_read_only(path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(f"file:{path.as_posix()}?mode=ro", uri=True, timeout=2)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA query_only=ON")
    connection.execute("PRAGMA busy_timeout=2000")
    return connection


def _table_exists(connection: sqlite3.Connection, table: str) -> bool:
    return connection.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,)
    ).fetchone() is not None


def _table_count(path: Path, table: str) -> int:
    if not path.is_file() or path.is_symlink():
        return 0
    try:
        with closing(_open_read_only(path)) as connection:
            if not _table_exists(connection, table):
                return 0
            return int(connection.execute(f'SELECT count(*) FROM "{table}"').fetchone()[0])
    except (OSError, sqlite3.Error, ValueError):
        return 0


def collect_hermes_activity(home: str | Path, *, limit: int = 5) -> dict[str, Any]:
    """Collect path-free Hermes metadata without reading transcript or fact bodies."""

    root = Path(home).expanduser().absolute()
    state_db = root / "state.db"
    memory_db = root / "memory_store.db"
    recent: list[dict[str, Any]] = []
    sessions = _table_count(state_db, "sessions")
    messages = _table_count(state_db, "messages")
    if state_db.is_file() and not state_db.is_symlink():
        try:
            with closing(_open_read_only(state_db)) as connection:
                if _table_exists(connection, "sessions"):
                    columns = {
                        row[1] for row in connection.execute("PRAGMA table_info(sessions)")
                    }
                    if {"display_name", "started_at"}.issubset(columns):
                        model = "model" if "model" in columns else "NULL AS model"
                        source = "source" if "source" in columns else "NULL AS source"
                        count = (
                            "message_count"
                            if "message_count" in columns
                            else "NULL AS message_count"
                        )
                        rows = connection.execute(
                            f"SELECT display_name, started_at, {model}, {source}, {count} "
                            "FROM sessions ORDER BY started_at DESC LIMIT ?",
                            (max(1, min(int(limit), 10)),),
                        ).fetchall()
                        recent = [
                            {
                                "title": _bounded_title(row["display_name"], "Hermes session"),
                                "updated_at": str(row["started_at"] or ""),
                                "model": _bounded_title(row["model"], "not reported"),
                                "source": _bounded_title(row["source"], "Hermes"),
                                "messages": int(row["message_count"] or 0),
                            }
                            for row in rows
                        ]
        except (OSError, sqlite3.Error, ValueError, TypeError):
            recent = []
    skills_root = root / "skills"
    try:
        skills = sum(
            1
            for item in skills_root.rglob("SKILL.md")
            if item.is_file() and not item.is_symlink()
        )
    except OSError:
        skills = 0
    available = state_db.is_file() or memory_db.is_file() or skills_root.is_dir()
    return {
        "status": "live" if available else "unavailable",
        "sessions": sessions,
        "messages": messages,
        "memory_facts": _table_count(memory_db, "facts"),
        "skills": skills,
        "recent": recent,
    }


def collect_codex_activity(home: str | Path, *, limit: int = 5) -> dict[str, Any]:
    """Collect safe Codex session-index metadata; never read rollout bodies."""

    root = Path(home).expanduser().absolute()
    try:
        sessions = sum(
            1
            for item in (root / "sessions").rglob("rollout-*.jsonl")
            if item.is_file() and not item.is_symlink()
        )
    except OSError:
        sessions = 0
    index_path = root / "session_index.jsonl"
    indexed: list[dict[str, Any]] = []
    if index_path.is_file() and not index_path.is_symlink():
        try:
            with index_path.open(encoding="utf-8", errors="replace") as handle:
                for line in handle:
                    if not line.strip():
                        continue
                    try:
                        row = json.loads(line)
                    except (json.JSONDecodeError, TypeError):
                        continue
                    indexed.append(
                        {
                            "title": _bounded_title(row.get("thread_name"), "Codex session"),
                            "updated_at": str(row.get("updated_at") or ""),
                        }
                    )
        except OSError:
            indexed = []
    indexed.sort(key=lambda item: item["updated_at"], reverse=True)
    available = (root / "sessions").is_dir() or index_path.is_file()
    return {
        "status": "live" if available else "unavailable",
        "sessions": sessions,
        "indexed_sessions": len(indexed),
        "recent": indexed[: max(1, min(int(limit), 10))],
    }


def _timestamp(value: object) -> str:
    try:
        number = float(value or 0)
        if number <= 0:
            return ""
        if number > 10_000_000_000:
            number /= 1000
        return datetime.fromtimestamp(number, timezone.utc).isoformat().replace("+00:00", "Z")
    except (OverflowError, TypeError, ValueError, OSError):
        return ""


def collect_opencode_activity(home: str | Path, *, limit: int = 5) -> dict[str, Any]:
    """Collect aggregate OpenCode metadata from its local database, path-free."""

    root = Path(home).expanduser().absolute()
    database = root / "opencode.db"
    snapshot: dict[str, Any] = {
        "status": "unavailable",
        "sessions": 0,
        "messages": 0,
        "projects": 0,
        "tokens": 0,
        "reported_cost_usd": 0.0,
        "recent": [],
    }
    if not database.is_file() or database.is_symlink():
        return snapshot
    try:
        with closing(_open_read_only(database)) as connection:
            snapshot["status"] = "live"
            snapshot["sessions"] = (
                int(connection.execute('SELECT count(*) FROM "session"').fetchone()[0])
                if _table_exists(connection, "session")
                else 0
            )
            snapshot["messages"] = (
                int(connection.execute('SELECT count(*) FROM "message"').fetchone()[0])
                if _table_exists(connection, "message")
                else 0
            )
            snapshot["projects"] = (
                int(connection.execute('SELECT count(*) FROM "project"').fetchone()[0])
                if _table_exists(connection, "project")
                else 0
            )
            if _table_exists(connection, "session"):
                columns = {
                    row[1] for row in connection.execute('PRAGMA table_info("session")')
                }
                if {"tokens_input", "tokens_output"}.issubset(columns):
                    totals = connection.execute(
                        "SELECT COALESCE(sum(tokens_input),0), COALESCE(sum(tokens_output),0), "
                        "COALESCE(sum(cost),0) FROM session"
                    ).fetchone()
                    snapshot["tokens"] = int(totals[0] or 0) + int(totals[1] or 0)
                    snapshot["reported_cost_usd"] = round(float(totals[2] or 0), 6)
                if {"title", "time_updated"}.issubset(columns):
                    rows = connection.execute(
                        "SELECT title, time_updated FROM session ORDER BY time_updated DESC LIMIT ?",
                        (max(1, min(int(limit), 10)),),
                    ).fetchall()
                    snapshot["recent"] = [
                        {
                            "title": _bounded_title(row["title"], "OpenCode session"),
                            "updated_at": _timestamp(row["time_updated"]),
                        }
                        for row in rows
                    ]
    except (OSError, sqlite3.Error, TypeError, ValueError):
        return {**snapshot, "status": "unavailable", "recent": []}
    return snapshot


def collect_repository_improvements(
    repositories: Iterable[tuple[str, Path]],
    *,
    limit: int = 5,
    runner: GitRunner = subprocess.run,
) -> list[dict[str, Any]]:
    """Return bounded commit metadata from approved local repositories."""

    selected_limit = max(1, min(int(limit), 10))
    improvements: list[dict[str, Any]] = []
    for label, root in repositories:
        try:
            completed = runner(
                [
                    "git",
                    "-C",
                    root.as_posix(),
                    "log",
                    f"-{selected_limit}",
                    "--pretty=format:%H%x1f%aI%x1f%s",
                ],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=5,
                shell=False,
                check=False,
            )
        except (OSError, subprocess.SubprocessError):
            continue
        if completed.returncode != 0:
            continue
        for line in str(completed.stdout or "").splitlines():
            fields = line.split("\x1f", 2)
            if len(fields) != 3:
                continue
            revision, updated_at, title = fields
            improvements.append(
                {
                    "repository": _bounded_title(label, "Repository"),
                    "revision": revision[:8],
                    "updated_at": updated_at[:40],
                    "title": _bounded_title(title, "Repository update"),
                }
            )
    improvements.sort(key=lambda item: item["updated_at"], reverse=True)
    return improvements[:selected_limit]


def collect_live_work(
    *,
    hermes_home: str | Path,
    codex_home: str | Path,
    opencode_home: str | Path,
    repositories: Iterable[tuple[str, Path]],
) -> dict[str, Any]:
    return {
        "schema_version": 1,
        "generated_at": _now(),
        "synthetic": False,
        "sources": {
            "hermes": collect_hermes_activity(hermes_home),
            "codex": collect_codex_activity(codex_home),
            "opencode": collect_opencode_activity(opencode_home),
        },
        "improvements": collect_repository_improvements(repositories),
    }
