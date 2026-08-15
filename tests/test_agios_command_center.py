import unittest
from pathlib import Path
from types import SimpleNamespace

from agios.adapters.hermes import collect_hermes_snapshot
from agios.adapters.shared_fabric import collect_shared_fabric
from agios.config import load_config
from agios.control_plane import build_command_center


ROOT = Path(__file__).resolve().parents[1]


class HermesAdapterTests(unittest.TestCase):
    def test_adapter_allowlists_profile_and_schedule_fields(self):
        profile = SimpleNamespace(
            name="default",
            provider="openai-codex",
            model="gpt-test",
            description="Coordinator",
            skill_count=12,
            gateway_running=True,
            is_default=True,
            path="C:/private/profile",
            has_env=True,
        )
        job = {
            "id": "job-1",
            "name": "Research pulse",
            "state": "scheduled",
            "enabled": True,
            "schedule_display": "every 4h",
            "prompt": "private instruction",
            "script": "dangerous.py",
            "workdir": "C:/customer",
            "next_run_at": "2026-08-11T09:00:00+04:00",
        }
        snapshot = collect_hermes_snapshot(
            profile_loader=lambda: [profile],
            cron_loader=lambda: [job],
        )

        self.assertEqual("healthy", snapshot["status"])
        self.assertEqual("online", build_command_center(
            load_config(ROOT / "configs" / "agios.json"), hermes_snapshot=snapshot
        )["agents"][0]["state"])
        serialized = repr(snapshot)
        for forbidden in ("private instruction", "dangerous.py", "C:/customer", "C:/private/profile"):
            self.assertNotIn(forbidden, serialized)

    def test_command_center_contains_the_full_operating_hierarchy(self):
        snapshot = collect_hermes_snapshot(profile_loader=lambda: [], cron_loader=lambda: [])
        result = build_command_center(ROOT / "configs" / "agios.json", hermes_snapshot=snapshot)

        self.assertEqual("AGIOS", result["product"]["name"])
        self.assertEqual(7, result["summary"]["businesses"])
        self.assertEqual(7, result["summary"]["departments"])
        self.assertEqual(9, result["summary"]["agents"])
        self.assertEqual(15, result["summary"]["model_routes"])
        self.assertEqual("unavailable", result["usage"]["cost_status"])
        self.assertEqual([], result["sessions"]["items"])
        self.assertFalse(result["privacy"]["customer_content_included"])
        self.assertFalse(result["privacy"]["runtime_writes_enabled"])
        self.assertEqual(15, result["summary"]["systems"])
        self.assertGreater(result["summary"]["shared_skills"], 0)
        self.assertEqual("scoped_live_fabric", result["shared_fabric"]["memory"]["sharing"])

    def test_shared_fabric_exposes_catalog_and_aggregates_without_content(self):
        fabric = collect_shared_fabric(
            skill_loader=lambda: [{"name": "research", "category": "work", "description": "Verify sources", "path": "C:/private"}],
            memory_loader=lambda: {
                "status": "healthy",
                "metrics": {"provider": "holographic", "facts": 4, "entities": 2, "categories": {"project": 4}, "trust": {"high": 1, "medium": 3}},
                "updated_at": "2026-08-10T00:00:00Z",
                "facts": ["private memory"],
            },
        )

        self.assertEqual(1, fabric["skills"]["inventory"])
        self.assertEqual(4, fabric["memory"]["fact_count"])
        self.assertFalse(fabric["privacy"]["memory_content_included"])
        self.assertNotIn("private memory", repr(fabric))
        self.assertNotIn("C:/private", repr(fabric))

    def test_agent_mesh_merges_specialists_and_systems_into_one_registry(self):
        snapshot = collect_hermes_snapshot(profile_loader=lambda: [], cron_loader=lambda: [])
        result = build_command_center(ROOT / "configs" / "agios.json", hermes_snapshot=snapshot)

        mesh = result["mesh"]
        agents = [node for node in mesh if node["kind"] == "agent"]
        systems = [node for node in mesh if node["kind"] == "system"]
        self.assertEqual(9, len(agents))
        self.assertEqual(15, len(systems))
        self.assertEqual(9 + 15, len(mesh))
        self.assertIn("writer", {node["id"] for node in agents})
        self.assertIn("closer", {node["id"] for node in agents})
        self.assertIn("openclaw", {node["id"] for node in systems})
        self.assertTrue(all(node["collaboration"]["a2a"] for node in agents))


if __name__ == "__main__":
    unittest.main()
