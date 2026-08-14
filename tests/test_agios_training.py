"""Tests for the CEO training-data collector."""

import json
import tempfile
import unittest
from pathlib import Path

from agios.training import TrainingCollector


class TrainingCollectorTests(unittest.TestCase):
    def test_records_approved_routes_as_jsonl_and_counts_them(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            collector = TrainingCollector(Path(temp_dir) / "training" / "routes.jsonl")
            plan = {
                "objective": "Research Armenian market evidence",
                "data_class": "internal",
                "business_id": "armenia-income",
                "department_id": "research-intelligence",
                "lead_agent_id": "researcher",
                "model_id": "nemotron-hosted",
            }
            self.assertEqual(0, collector.count())
            collector.record_route(plan, mode="goal", runtime_id="hermes")
            collector.record_route(plan, mode="goal", runtime_id="hermes")
            self.assertEqual(2, collector.count())
            with Path(collector.path).open("r", encoding="utf-8") as handle:
                rows = [json.loads(line) for line in handle]
            self.assertEqual("route", rows[0]["kind"])
            self.assertEqual("Research Armenian market evidence", rows[0]["objective"])
            self.assertEqual("researcher", rows[0]["lead_agent_id"])

    def test_rejects_credential_like_objectives(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            collector = TrainingCollector(Path(temp_dir) / "training" / "routes.jsonl")
            plan = {
                "objective": "Log in with api-key-abcdefghijklmnop",
                "data_class": "internal",
                "business_id": "x",
                "department_id": "x",
                "lead_agent_id": "x",
                "model_id": "x",
            }
            collector.record_route(plan, mode="goal", runtime_id="hermes")
            self.assertEqual(0, collector.count())
            self.assertFalse(Path(collector.path).exists())


if __name__ == "__main__":
    unittest.main()
