import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

from fastapi.testclient import TestClient

from agios.live_work import (
    collect_codex_activity,
    collect_hermes_activity,
    collect_live_work,
    collect_opencode_activity,
    collect_repository_improvements,
)
from agios.server import create_app


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "configs" / "agios.json"


def create_db(path: Path, statements: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(path)) as connection:
        for statement in statements:
            connection.execute(statement)
        connection.commit()


class LiveWorkSourceTests(unittest.TestCase):
    def test_hermes_reports_safe_metadata_without_transcript_content(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            create_db(
                root / "state.db",
                [
                    "CREATE TABLE sessions(id TEXT, display_name TEXT, started_at TEXT, message_count INTEGER, model TEXT, source TEXT)",
                    "INSERT INTO sessions VALUES('s1','AGIOS dashboard work','2026-08-14T12:00:00Z',7,'gpt-test','desktop')",
                    "CREATE TABLE messages(id INTEGER, session_id TEXT, role TEXT, content TEXT)",
                    "INSERT INTO messages VALUES(1,'s1','user','PRIVATE TRANSCRIPT BODY')",
                ],
            )
            create_db(
                root / "memory_store.db",
                [
                    "CREATE TABLE facts(fact_id INTEGER, content TEXT)",
                    "INSERT INTO facts VALUES(1,'PRIVATE FACT BODY')",
                ],
            )
            (root / "skills" / "one").mkdir(parents=True)
            (root / "skills" / "one" / "SKILL.md").write_text("# One", encoding="utf-8")

            snapshot = collect_hermes_activity(root)

            self.assertEqual(1, snapshot["sessions"])
            self.assertEqual(1, snapshot["messages"])
            self.assertEqual(1, snapshot["memory_facts"])
            self.assertEqual(1, snapshot["skills"])
            self.assertEqual("AGIOS dashboard work", snapshot["recent"][0]["title"])
            self.assertNotIn("PRIVATE TRANSCRIPT BODY", repr(snapshot))
            self.assertNotIn("PRIVATE FACT BODY", repr(snapshot))
            self.assertNotIn(str(root), repr(snapshot))

    def test_codex_reports_indexed_sessions_and_rollout_count(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "sessions" / "2026" / "08" / "14").mkdir(parents=True)
            (root / "sessions" / "2026" / "08" / "14" / "rollout-a.jsonl").write_text("{}\n", encoding="utf-8")
            (root / "session_index.jsonl").write_text(
                json.dumps({"id": "c1", "thread_name": "Review AGIOS", "updated_at": "2026-08-14T13:00:00Z"}) + "\n",
                encoding="utf-8",
            )

            snapshot = collect_codex_activity(root)

            self.assertEqual(1, snapshot["sessions"])
            self.assertEqual(1, snapshot["indexed_sessions"])
            self.assertEqual("Review AGIOS", snapshot["recent"][0]["title"])
            self.assertNotIn(str(root), repr(snapshot))

    def test_opencode_reports_local_database_totals_without_message_data(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            create_db(
                root / "opencode.db",
                [
                    "CREATE TABLE session(id TEXT, title TEXT, cost REAL, tokens_input INTEGER, tokens_output INTEGER, time_updated INTEGER)",
                    "INSERT INTO session VALUES('o1','OpenCode check',0.25,120,30,1786700000000)",
                    "CREATE TABLE message(id TEXT, data TEXT)",
                    "INSERT INTO message VALUES('m1','PRIVATE MESSAGE DATA')",
                    "CREATE TABLE project(id TEXT, name TEXT)",
                    "INSERT INTO project VALUES('p1','AGIOS')",
                ],
            )

            snapshot = collect_opencode_activity(root)

            self.assertEqual(1, snapshot["sessions"])
            self.assertEqual(1, snapshot["messages"])
            self.assertEqual(1, snapshot["projects"])
            self.assertEqual(150, snapshot["tokens"])
            self.assertEqual(0.25, snapshot["reported_cost_usd"])
            self.assertEqual("OpenCode check", snapshot["recent"][0]["title"])
            self.assertNotIn("PRIVATE MESSAGE DATA", repr(snapshot))
            self.assertNotIn(str(root), repr(snapshot))

    def test_repository_improvements_are_bounded_and_path_free(self):
        def fake_run(command, **_kwargs):
            self.assertEqual(["git", "-C", "C:/private/repo", "log", "-3", "--pretty=format:%H%x1f%aI%x1f%s"], command)
            return SimpleNamespace(returncode=0, stdout="abcdef1234567890\x1f2026-08-14T10:00:00Z\x1fAdd live work dashboard\n", stderr="")

        items = collect_repository_improvements(
            [("AGIOS", Path("C:/private/repo"))],
            limit=3,
            runner=fake_run,
        )

        self.assertEqual("AGIOS", items[0]["repository"])
        self.assertEqual("abcdef12", items[0]["revision"])
        self.assertEqual("Add live work dashboard", items[0]["title"])
        self.assertNotIn("C:/private", repr(items))

    def test_live_work_combines_sources_with_explicit_provenance(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            snapshot = collect_live_work(
                hermes_home=root / "hermes",
                codex_home=root / "codex",
                opencode_home=root / "opencode",
                repositories=[],
            )

            self.assertFalse(snapshot["synthetic"])
            self.assertEqual({"hermes", "codex", "opencode"}, set(snapshot["sources"]))
            self.assertTrue(all("status" in source for source in snapshot["sources"].values()))
            self.assertIn("generated_at", snapshot)


class LiveWorkServerTests(unittest.TestCase):
    def test_live_work_endpoint_is_private_and_returns_source_snapshot(self):
        fixture = {
            "schema_version": 1,
            "generated_at": "2026-08-14T12:00:00Z",
            "synthetic": False,
            "sources": {
                "hermes": {"status": "live", "sessions": 2},
                "codex": {"status": "live", "sessions": 3},
                "opencode": {"status": "live", "sessions": 1},
            },
            "improvements": [],
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                state_dir=temp_dir,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as anonymous:
                self.assertEqual(401, anonymous.get("/api/v1/live-work").status_code)
            with mock.patch("agios.server.collect_live_work", return_value=fixture):
                with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                    client.get("/")
                    response = client.get("/api/v1/live-work")
                    self.assertEqual(200, response.status_code)
                    self.assertFalse(response.json()["synthetic"])
                    self.assertEqual("live", response.json()["sources"]["codex"]["status"])


if __name__ == "__main__":
    unittest.main()
