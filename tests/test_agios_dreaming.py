"""Tests for the evidence-gated dreaming digest."""

import json
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from agios.dreaming import DreamingStore, build_dreaming_digest
from agios.server import create_app

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "configs" / "agios.json"


def empty_evidence() -> dict:
    return {
        "memory_summary": {"status": "healthy", "fact_count": 0},
        "runs": [],
        "proposals": [],
        "plans_summary": {"status": "ready", "plans": 0, "by_status": {}},
        "runtime_catalog": [],
        "hermes_session_count": 0,
    }


class DreamingDigestTests(unittest.TestCase):
    def test_empty_stores_produce_honest_dimensions_and_one_real_recommendation(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            store = DreamingStore(Path(temp_dir) / "dreaming.json")
            digest = build_dreaming_digest(**empty_evidence(), store=store)
            self.assertEqual(1, digest["schema_version"])
            self.assertFalse(digest["privacy"]["synthetic"])
            self.assertEqual(8, len(digest["dimensions"]))
            by_id = {d["id"]: d for d in digest["dimensions"]}
            self.assertEqual("no-evidence", by_id["conversation-analysis"]["status"])
            self.assertEqual("unavailable", by_id["business-outcomes"]["status"])
            # Memory health is the one real, actionable signal (zero facts)
            self.assertEqual("evidence", by_id["memory-health"]["status"])
            ids = [rec["id"] for rec in digest["recommendations"]]
            self.assertEqual(["memory-health-1"], ids)
            rec = digest["recommendations"][0]
            self.assertEqual("write-memory", rec["kind"])
            self.assertEqual({"fact_count": 0}, rec["evidence"])

    def test_populated_stores_fire_recommendations_with_real_evidence(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            store = DreamingStore(Path(temp_dir) / "dreaming.json")
            evidence = {
                "memory_summary": {"status": "healthy", "fact_count": 3},
                "runs": [
                    {"run_id": "a", "status": "queued"},
                    {"run_id": "b", "status": "completed"},
                    {"run_id": "c", "status": "running"},
                ],
                "proposals": [{"proposal_id": "p1", "status": "awaiting_owner_review"}],
                "plans_summary": {
                    "status": "ready",
                    "plans": 2,
                    "by_status": {"awaiting_approval": 1, "planned": 1},
                },
                "runtime_catalog": [],
                "hermes_session_count": 5,
            }
            digest = build_dreaming_digest(**evidence, store=store)
            kinds = [rec["kind"] for rec in digest["recommendations"]]
            self.assertIn("review-proposals", kinds)
            self.assertIn("unblock-runs", kinds)
            self.assertIn("review-routes", kinds)
            for rec in digest["recommendations"]:
                if rec["kind"] == "review-proposals":
                    self.assertEqual({"pending": 1}, rec["evidence"])
                if rec["kind"] == "unblock-runs":
                    self.assertEqual({"queued": 1}, rec["evidence"])

    def test_recommendations_are_capped_at_four(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            store = DreamingStore(Path(temp_dir) / "dreaming.json")
            evidence = {
                "memory_summary": {"status": "healthy", "fact_count": 0},
                "runs": [{"run_id": f"r{i}", "status": "queued"} for i in range(3)],
                "proposals": [
                    {"proposal_id": f"p{i}", "status": "awaiting_owner_review"}
                    for i in range(6)
                ],
                "plans_summary": {
                    "status": "ready",
                    "plans": 3,
                    "by_status": {"awaiting_approval": 2, "planned": 1},
                },
                "runtime_catalog": [],
                "hermes_session_count": 9,
            }
            digest = build_dreaming_digest(**evidence, store=store)
            self.assertLessEqual(len(digest["recommendations"]), 4)

    def test_accept_and_dismiss_persist_and_hide_recommendations(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            store = DreamingStore(Path(temp_dir) / "dreaming.json")
            first = build_dreaming_digest(**empty_evidence(), store=store)
            rec_id = first["recommendations"][0]["id"]
            store.accept(rec_id)
            second = build_dreaming_digest(**empty_evidence(), store=store)
            self.assertNotIn(rec_id, [r["id"] for r in second["recommendations"]])
            self.assertIn(rec_id, second["accepted"])
            store.dismiss(rec_id)
            third = build_dreaming_digest(**empty_evidence(), store=store)
            self.assertIn(rec_id, third["dismissed"])
            self.assertNotIn(rec_id, third["accepted"])
            # Dismissed recommendations stay hidden
            self.assertNotIn(rec_id, [r["id"] for r in third["recommendations"]])


class DreamingServerTests(unittest.TestCase):
    def test_digest_endpoint_requires_session_and_returns_honest_shape(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                state_dir=temp_dir,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as anon:
                self.assertEqual(401, anon.get("/api/v1/dreaming").status_code)

            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                response = client.get("/api/v1/dreaming")
                self.assertEqual(200, response.status_code)
                payload = response.json()
                self.assertEqual(1, payload["schema_version"])
                self.assertFalse(payload["privacy"]["synthetic"])
                self.assertEqual(8, len(payload["dimensions"]))
                # CSRF is required for state-changing posts
                self.assertEqual(403, client.post("/api/v1/dreaming/x/accept").status_code)

    def test_accept_endpoint_validates_recommendation_ids(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                state_dir=temp_dir,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                csrf = client.cookies.get("agios_csrf")
                headers = {"X-AGIOS-CSRF": csrf}
                # Encoded traversal never reaches the dreaming handler; the
                # router/catch-all rejects it (405 here). Either way it is denied.
                self.assertIn(
                    client.post("/api/v1/dreaming/..%2Fetc/accept", headers=headers).status_code,
                    {400, 404, 405},
                )
                # Oversized ids pass routing but fail handler validation
                self.assertEqual(
                    400,
                    client.post(
                        "/api/v1/dreaming/" + "a" * 121 + "/accept", headers=headers
                    ).status_code,
                )
                ok = client.post("/api/v1/dreaming/memory-health-1/accept", headers=headers)
                self.assertEqual(200, ok.status_code)
                self.assertEqual("memory-health-1", ok.json()["accepted"])


if __name__ == "__main__":
    unittest.main()
