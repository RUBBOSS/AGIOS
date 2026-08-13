import copy
import json
import tempfile
import unittest
from pathlib import Path

from agios.config import ConfigError, load_config, validate_config
from agios.contracts import ApprovalRequest, WorkOrder, digest
from agios.routing import ExternalApproval, ModelRouter, RoutingError


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "configs" / "agios.json"


class AGIOSConfigTests(unittest.TestCase):
    def test_authoritative_configuration_is_valid_and_runtime_neutral(self):
        config = load_config(CONFIG_PATH)

        self.assertEqual(1, config.raw["schema_version"])
        self.assertEqual(9, len(config.agents))
        self.assertNotIn("localworker", config.agents)
        self.assertEqual("active", config.runtimes["hermes"]["status"])
        self.assertEqual("planned", config.runtimes["openclaw"]["status"])
        self.assertEqual("planned", config.runtimes["cline"]["status"])
        self.assertEqual("planned", config.runtimes["pokee"]["status"])
        self.assertEqual("Ruben's Portfolio", config.portfolio["name"])
        self.assertEqual(7, len(config.businesses))
        self.assertEqual(7, len(config.departments))
        self.assertEqual("connected", config.integrations["hermes"]["status"])
        self.assertEqual("live", config.systems["hermes"]["status"])
        self.assertEqual("routed", config.systems["deepseek"]["status"])
        self.assertIn("memory", config.systems["gemini"]["capabilities"])
        self.assertIn("research_web", config.capabilities)

    def test_organization_rejects_unknown_department_agent_and_business_owner(self):
        raw = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        unknown_agent = copy.deepcopy(raw)
        unknown_agent["departments"][0]["agent_ids"].append("ghost")
        with self.assertRaisesRegex(ConfigError, "unknown agents"):
            validate_config(unknown_agent, path=CONFIG_PATH)

        unknown_owner = copy.deepcopy(raw)
        unknown_owner["businesses"][0]["owner_agent_id"] = "ghost"
        with self.assertRaisesRegex(ConfigError, "unknown owner agent"):
            validate_config(unknown_owner, path=CONFIG_PATH)

    def test_configuration_rejects_unknown_capabilities_and_credential_routes(self):
        raw = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        unknown_capability = copy.deepcopy(raw)
        unknown_capability["agents"][0]["capabilities"].append("root-everything")
        with self.assertRaisesRegex(ConfigError, "unknown capabilities"):
            validate_config(unknown_capability, path=CONFIG_PATH)

        credential_model = copy.deepcopy(raw)
        credential_model["models"][0]["allowed_data_classes"].append("credential")
        with self.assertRaisesRegex(ConfigError, "unsafe data-class grants"):
            validate_config(credential_model, path=CONFIG_PATH)

    def test_work_orders_use_references_instead_of_raw_paths(self):
        valid = WorkOrder(
            project_id="demo",
            task_id="task-1",
            requester_id="default",
            workload="research",
            data_class="public",
            objective_digest=digest("objective"),
            input_refs=("evidence:source-1",),
        )
        self.assertEqual("task-1", valid.task_id)
        with self.assertRaisesRegex(ValueError, "artifact, evidence, or memory"):
            WorkOrder(
                project_id="demo",
                task_id="task-2",
                requester_id="default",
                workload="research",
                data_class="customer_restricted",
                objective_digest=digest("private objective"),
                input_refs=("C:/Customers/private.txt",),
            )

    def test_approval_is_bound_to_exact_action_and_destination(self):
        request = ApprovalRequest(
            category="external-message",
            requester_id="manager",
            task_id="task-1",
            action_digest=digest({"draft_ref": "artifact:draft-1"}),
            destination_digest=digest({"recipient_ref": "contact:client-1"}),
            expires_at="2026-08-11T00:00:00Z",
        )
        self.assertTrue(
            request.matches(
                action={"draft_ref": "artifact:draft-1"},
                destination={"recipient_ref": "contact:client-1"},
            )
        )
        self.assertFalse(
            request.matches(
                action={"draft_ref": "artifact:changed"},
                destination={"recipient_ref": "contact:client-1"},
            )
        )


class ModelRouterTests(unittest.TestCase):
    def setUp(self):
        self.config = load_config(CONFIG_PATH)
        self.router = ModelRouter(self.config)
        self.all_models = set(self.config.models)

    def test_public_route_uses_first_available_candidate(self):
        decision = self.router.select(
            task_id="public-1",
            workload="research",
            data_class="public",
            available_models=self.all_models,
        )
        self.assertEqual("nemotron-hosted", decision.model_id)
        self.assertEqual("external", decision.location)

    def test_internal_data_skips_untrusted_public_only_models(self):
        decision = self.router.select(
            task_id="internal-1",
            workload="research",
            data_class="internal",
            available_models=self.all_models,
        )
        self.assertEqual("gpt-5.6-terra", decision.model_id)
        self.assertEqual("trusted", decision.trust)

    def test_customer_data_stays_local_without_exact_approval(self):
        decision = self.router.select(
            task_id="customer-1",
            workload="architecture",
            data_class="customer_restricted",
            available_models=self.all_models,
        )
        self.assertEqual("ornith-hermes", decision.model_id)
        self.assertEqual("local", decision.location)

        wrong_approval = ExternalApproval(
            approval_id="approval-1",
            task_id="another-task",
            model_id="gpt-5.6-sol",
            data_class="customer_restricted",
        )
        still_local = self.router.select(
            task_id="customer-1",
            workload="architecture",
            data_class="customer_restricted",
            available_models=self.all_models,
            external_approval=wrong_approval,
        )
        self.assertEqual("local", still_local.location)

    def test_exact_approval_allows_only_the_bound_trusted_route(self):
        approval = ExternalApproval(
            approval_id="approval-1",
            task_id="customer-1",
            model_id="gpt-5.6-sol",
            data_class="customer_restricted",
        )
        decision = self.router.select(
            task_id="customer-1",
            workload="architecture",
            data_class="customer_restricted",
            available_models=self.all_models,
            external_approval=approval,
        )
        self.assertEqual("gpt-5.6-sol", decision.model_id)
        self.assertEqual("approval-1", decision.external_approval_id)

    def test_free_routes_cannot_receive_nonpublic_data_and_credentials_are_denied(self):
        with self.assertRaises(RoutingError):
            self.router.select(
                task_id="private-1",
                workload="research",
                data_class="customer_restricted",
                available_models={"nemotron-hosted", "opencode-free"},
            )
        with self.assertRaisesRegex(RoutingError, "denied"):
            self.router.select(
                task_id="secret-1",
                workload="private_general",
                data_class="credential",
                available_models=self.all_models,
            )


if __name__ == "__main__":
    unittest.main()
