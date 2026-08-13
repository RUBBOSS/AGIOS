import tempfile
import unittest
from pathlib import Path

from agios.config import load_config
from agios.events import EventJournal
from agios.orchestration import (
    OrchestrationError,
    OrchestrationStore,
    build_routing_plan,
    classify_ari_intent,
)


ROOT = Path(__file__).resolve().parents[1]


def runtime_catalog(*, deepseek=False):
    return [
        {"id": "hermes", "execution_enabled": True, "configured": True},
        {"id": "codex", "execution_enabled": True, "configured": True},
        {"id": "deepseek", "execution_enabled": deepseek, "configured": deepseek},
        {"id": "ollama", "execution_enabled": True, "configured": True},
    ]


class ChiefOfStaffRoutingTests(unittest.TestCase):
    def setUp(self):
        self.config = load_config(ROOT / "configs" / "agios.json")

    def test_customer_interface_routes_to_private_builder_and_local_model(self):
        plan = build_routing_plan(
            self.config,
            objective="Improve the customer dashboard interface, design and motion animation",
            data_class="customer_restricted",
            runtime_catalog=runtime_catalog(deepseek=True),
        )

        self.assertEqual("default", plan["orchestrator_agent_id"])
        self.assertEqual("design-experience", plan["department_id"])
        self.assertEqual("design-studio", plan["business_id"])
        self.assertEqual("codinglocal", plan["lead_agent_id"])
        self.assertEqual("ornith-hermes", plan["model_id"])
        self.assertEqual("local", plan["model_location"])
        self.assertEqual(["default", "codinglocal", "reviewer"], plan["team_agent_ids"])
        self.assertTrue(all(item["status"] == "planned" for item in plan["critics"]))

    def test_ari_keeps_questions_in_chat_and_routes_directed_work(self):
        conversation = classify_ari_intent("What does scoped memory mean?")
        self.assertEqual("conversation", conversation["kind"])
        self.assertEqual("chat", conversation["execution_mode"])

        work = classify_ari_intent(
            "Review https://youtube.com/watch?v=example and improve our OS interface"
        )
        self.assertEqual("work", work["kind"])
        self.assertEqual("workspace", work["execution_mode"])
        self.assertEqual("write", work["workspace_access"])
        self.assertEqual(
            ["research_web", "write_workspace", "run_tests"],
            work["required_capabilities"],
        )

    def test_video_design_plan_declares_research_and_workspace_lane(self):
        plan = build_routing_plan(
            self.config,
            objective=(
                "Review https://youtube.com/watch?v=example and integrate the useful "
                "visualizations into our interface"
            ),
            data_class="internal",
            runtime_catalog=runtime_catalog(),
        )

        self.assertEqual("workspace", plan["execution_mode"])
        self.assertEqual("write", plan["workspace_access"])
        self.assertIn("research_web", plan["required_capabilities"])
        self.assertNotIn("researcher", plan["team_agent_ids"])
        self.assertEqual("design-experience", plan["department_id"])
        self.assertEqual("builder", plan["lead_agent_id"])
        self.assertIn("write_workspace", self.config.agents[plan["lead_agent_id"]]["capabilities"])
        self.assertIn("research_web", self.config.agents[plan["lead_agent_id"]]["capabilities"])

    def test_research_routes_to_intelligence_and_deepseek_is_only_used_when_configured(self):
        research = build_routing_plan(
            self.config,
            objective="Research and compare market evidence with verified sources",
            data_class="internal",
            runtime_catalog=runtime_catalog(),
        )
        self.assertEqual("research-intelligence", research["department_id"])
        self.assertEqual("researcher", research["lead_agent_id"])
        self.assertEqual("gpt-5.6-terra", research["model_id"])

        coding = build_routing_plan(
            self.config,
            objective="Build and test the software API",
            data_class="public",
            runtime_catalog=runtime_catalog(deepseek=True),
        )
        self.assertEqual("engineering", coding["department_id"])
        self.assertEqual("deepseek-v4-flash", coding["model_id"])

    def test_plan_store_journals_only_digest_and_binds_one_run(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            journal_path = root / "events.sqlite3"
            store = OrchestrationStore(root / "plans.sqlite3", journal_path)
            objective = "Design a private animated command interface"
            plan = store.create(
                build_routing_plan(
                    self.config,
                    objective=objective,
                    data_class="internal",
                    runtime_catalog=runtime_catalog(),
                )
            )
            reserved = store.reserve_dispatch(plan["plan_id"], plan["plan_digest"])
            self.assertEqual("dispatching", reserved["status"])
            with self.assertRaisesRegex(OrchestrationError, "no longer matches|already dispatched"):
                store.reserve_dispatch(plan["plan_id"], plan["plan_digest"])
            saved = store.bind_run(plan["plan_id"], plan["plan_digest"], "run-1")

            self.assertEqual("awaiting_approval", saved["status"])
            self.assertEqual("run-1", saved["run_id"])
            with EventJournal(journal_path) as journal:
                serialized = repr([event.payload for event in journal.events()])
            self.assertNotIn(objective, serialized)
            self.assertIn(plan["objective_digest"], serialized)


if __name__ == "__main__":
    unittest.main()
