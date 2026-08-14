"""Tests for gauntlet prompts/parsing and the /learn-style knowledge intake."""

import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from agios.gauntlet import build_gauntlet_prompt, gauntlet_summary, parse_gauntlet_response
from agios.learning import LearningStore, LearningStoreError
from agios.server import create_app

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "configs" / "agios.json"


class GauntletTests(unittest.TestCase):
    def test_prompt_contains_three_independent_critics_and_strict_verdict_format(self):
        prompt = build_gauntlet_prompt(
            objective="Fix the login bug", data_class="internal",
            response="The login bug was fixed by adding a null check.", mode="goal", agent_id="builder",
        )
        self.assertIn("CRITIC 1", prompt)
        self.assertIn("CRITIC 2", prompt)
        self.assertIn("CRITIC 3", prompt)
        self.assertIn("BRIEF critic", prompt)
        self.assertIn("SYSTEM critic", prompt)
        self.assertIn("CRAFT critic", prompt)
        self.assertIn("VERDICT: PASS|REVISE|FAIL", prompt)
        self.assertIn("The critics never see each other's answers", prompt)
        self.assertLessEqual(len(prompt), 8000)

    def test_long_responses_are_bounded(self):
        prompt = build_gauntlet_prompt(
            objective="x", data_class="public", response="word " * 5000, mode="chat", agent_id="default",
        )
        self.assertLessEqual(len(prompt), 8000)

    def test_parse_extracts_critics_and_verdict_without_fabrication(self):
        parsed = parse_gauntlet_response(
            "CRITIC 1: PASS - the brief was met.\n"
            "CRITIC 2: CONCERN - governance says no external sends.\n"
            "CRITIC 3: FAIL - the claim has no citation.\n"
            "VERDICT: REVISE - fix the unsupported claim."
        )
        self.assertEqual("PASS", parsed["critics"][0]["result"])
        self.assertEqual("CONCERN", parsed["critics"][1]["result"])
        self.assertEqual("FAIL", parsed["critics"][2]["result"])
        self.assertEqual("REVISE", parsed["verdict"])

    def test_unparseable_verdict_is_inconclusive(self):
        parsed = parse_gauntlet_response("CRITIC 1: PASS - ok\ngarbage without verdict")
        self.assertEqual("INCONCLUSIVE", parsed["verdict"])
        summary = gauntlet_summary(parsed)
        self.assertEqual("INCONCLUSIVE", summary["verdict"])


class LearningStoreTests(unittest.TestCase):
    SAMPLE = (
        "Hermes Agent is an operating system for agents.\n\n"
        "Shared Memory keeps durable facts. Each fact has a scope and trust level.\n\n"
        "AGIOS routes every run through exact approval. AGIOS never sends messages without approval."
    )

    def test_add_builds_deterministic_index_and_skips_duplicates(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            store = LearningStore(temp_dir)
            doc = store.add(title="AGIOS rules", source_name="handbook", text=self.SAMPLE)
            self.assertEqual(3, doc["chunk_count"])
            self.assertTrue(doc["cheat_sheet"])
            again = store.add(title="duplicate", source_name="handbook", text=self.SAMPLE)
            self.assertEqual(doc["doc_id"], again["doc_id"])
            self.assertEqual(1, store.summary()["documents"])
            self.assertEqual(3, store.summary()["indexed_chunks"])

    def test_glossary_extracts_frequent_technical_terms(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            store = LearningStore(temp_dir)
            text = "\n\n".join("Shared Memory Scope Trust AGIOS" for _ in range(8))
            doc = store.add(title="terms", source_name="test", text=text)
            self.assertTrue(doc["glossary"])
            joined = " | ".join(doc["glossary"])
            self.assertTrue("Shared Memory" in joined or "AGIOS" in joined)

    def test_rejects_empty_and_oversized_documents(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            store = LearningStore(temp_dir)
            with self.assertRaises(LearningStoreError):
                store.add(title="empty", source_name="x", text="   ")
            with self.assertRaises(LearningStoreError):
                store.add(title="huge", source_name="x", text="a" * 300_000)


class LearningServerTests(unittest.TestCase):
    def test_learn_endpoints_require_session_and_return_brain_files(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                state_dir=temp_dir,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as anon:
                self.assertEqual(401, anon.get("/api/v1/learn").status_code)

            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                csrf = client.cookies.get("agios_csrf")
                headers = {"X-AGIOS-CSRF": csrf}
                created = client.post(
                    "/api/v1/learn",
                    json={"title": "Intro", "source_name": "docs", "text": "AGIOS routes runs with exact approval. Memory keeps durable facts."},
                    headers=headers,
                )
                self.assertEqual(201, created.status_code)
                payload = created.json()
                self.assertFalse(payload["doc"]["privacy"]["synthetic"])
                self.assertGreater(payload["doc"]["index"]["chunk_count"], 0)
                doc_id = payload["doc"]["doc_id"]
                listing = client.get("/api/v1/learn")
                self.assertEqual(1, listing.json()["summary"]["documents"])
                fetched = client.get(f"/api/v1/learn/{doc_id}")
                self.assertEqual(200, fetched.status_code)
                self.assertEqual(doc_id, fetched.json()["brain_file"]["doc_id"])
                self.assertIn(
                    client.get("/api/v1/learn/..%2Fetc", headers=headers).status_code,
                    {400, 404},
                )


if __name__ == "__main__":
    unittest.main()
