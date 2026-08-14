import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from agios.adapters.runtimes import collect_runtime_catalog
from agios.config import load_config
from agios.growth import AgentGrowthStore
from agios.operational import (
    OperationalError,
    OperationalService,
    run_codex_cli,
    run_opencode_cli,
)
from agios.vision import VisionAssetStore
from agios.workspaces import WorkspaceRegistry


ROOT = Path(__file__).resolve().parents[1]
PNG = b"\x89PNG\r\n\x1a\nphase-4b"


class Phase4BStoresTests(unittest.TestCase):
    def test_workspace_registry_never_returns_the_raw_path(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            workspace = root / "workspace"
            workspace.mkdir()
            (workspace / ".git").mkdir()
            registry = WorkspaceRegistry(root / "registry.sqlite3")
            item = registry.register(
                label="Studio worktree",
                root_path=str(workspace),
                data_class="private_business",
                write_allowed=True,
            )
            self.assertNotIn("root_path", item)
            self.assertNotIn(str(workspace), repr(registry.list()))
            public, resolved = registry.resolve(item["workspace_id"])
            self.assertNotIn("root_path", public)
            self.assertEqual(workspace.resolve(), resolved)

    def test_vision_store_checks_signature_integrity_and_session_retention(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            store = VisionAssetStore(Path(temp_dir) / "vision")
            with self.assertRaisesRegex(ValueError, "signature"):
                store.add(label="bad", data=b"not an image", mime_type="image/png", data_class="internal", retention="session")
            asset = store.add(label="screen", data=PNG, mime_type="image/png", data_class="internal", retention="session")
            resolved = store.resolve_many([asset["asset_id"]])
            self.assertEqual(1, len(resolved))
            self.assertNotIn("file_path", asset)
            store.release_session_assets([asset["asset_id"]])
            with self.assertRaisesRegex(ValueError, "not active"):
                store.resolve_many([asset["asset_id"]])

    def test_runtime_catalog_is_truthful_and_path_free(self):
        systems = {"hermes": {"name": "Hermes"}, "codex": {"name": "Codex"}, "opencode": {"name": "OpenCode"}, "cline": {"name": "Cline"}}
        found = {"hermes", "codex", "opencode"}
        items = collect_runtime_catalog(
            systems,
            executable_finder=lambda name: f"C:/private/{name}" if name.split(".")[0] in found else None,
            opencode_auth_checker=lambda: False,
        )
        by_id = {item["id"]: item for item in items}
        self.assertTrue(by_id["hermes"]["execution_enabled"])
        self.assertIn("workspace-write", by_id["hermes"]["actions"])
        self.assertTrue(by_id["codex"]["execution_enabled"])
        self.assertFalse(by_id["opencode"]["execution_enabled"])
        self.assertEqual("detected", by_id["opencode"]["status"])
        self.assertEqual([], by_id["opencode"]["actions"])
        self.assertFalse(by_id["opencode"]["configured"])
        self.assertFalse(by_id["cline"]["execution_enabled"])
        self.assertNotIn("C:/private", repr(items))

    def test_runtime_catalog_enables_authenticated_opencode_workspace_adapter(self):
        systems = {"opencode": {"name": "OpenCode", "kind": "development-runtime"}}
        items = collect_runtime_catalog(
            systems,
            executable_finder=lambda _name: "C:/private/opencode.cmd",
            opencode_auth_checker=lambda: True,
        )
        runtime = items[0]
        self.assertEqual("live", runtime["status"])
        self.assertTrue(runtime["configured"])
        self.assertTrue(runtime["execution_enabled"])
        self.assertEqual("supervised-workspace", runtime["adapter"])
        self.assertEqual(["workspace-read", "workspace-write"], runtime["actions"])
        self.assertEqual("exact-run", runtime["approval"])


class Phase4BExecutionTests(unittest.TestCase):
    def test_codex_adapter_is_non_escalating_and_passes_prompt_over_stdin(self):
        run = {"objective": "Review this workspace", "workspace_access": "write", "provider": "deepseek", "model": "deepseek-v4-flash", "_vision_paths": ("screen.png",)}
        completed = SimpleNamespace(returncode=0, stdout="verified", stderr="")
        with patch("agios.operational.subprocess.run", return_value=completed) as execute:
            result = run_codex_cli(run, "memory", "skill", Path("C:/registered"))
        command = execute.call_args.args[0]
        self.assertEqual("completed", result.status)
        self.assertIn("--ask-for-approval", command)
        self.assertIn("never", command)
        self.assertIn("workspace-write", command)
        self.assertIn("--profile", command)
        self.assertNotIn("danger-full-access", command)
        self.assertNotIn("--yolo", command)
        self.assertEqual(False, execute.call_args.kwargs["shell"])
        self.assertIn("Owner-approved task", execute.call_args.kwargs["input"])

    def test_opencode_adapter_uses_deny_by_default_policy_without_auto_mode(self):
        run = {
            "objective": "Review this workspace",
            "workspace_access": "read",
            "model": "deepseek-v4-flash",
            "run_id": "run-safe",
        }
        completed = SimpleNamespace(
            returncode=0,
            stdout=(
                '{"type":"text","sessionID":"ses-safe","part":{"type":"text","text":"verified"}}\n'
                '{"type":"step_finish","part":{"tokens":{"total":12},"cost":0}}\n'
            ),
            stderr="",
        )
        with patch("agios.operational.subprocess.run", return_value=completed) as execute:
            result = run_opencode_cli(run, "memory", "skill", Path("C:/registered"))
        command = execute.call_args.args[0]
        environment = execute.call_args.kwargs["env"]
        permission = __import__("json").loads(environment["OPENCODE_PERMISSION"])
        self.assertEqual("completed", result.status)
        self.assertEqual("verified", result.response)
        self.assertIn("--pure", command)
        self.assertIn("--format", command)
        self.assertIn("opencode/deepseek-v4-flash", command)
        self.assertNotIn("--auto", command)
        self.assertNotIn("--share", command)
        self.assertEqual("allow", permission["read"])
        self.assertEqual("deny", permission["edit"])
        self.assertEqual("deny", permission["bash"])
        self.assertEqual("deny", permission["external_directory"])
        self.assertEqual(False, execute.call_args.kwargs["shell"])

    def test_workspace_run_binds_runtime_access_and_vision_to_exact_approval(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            workspace = root / "workspace"
            workspace.mkdir()
            (workspace / ".git").mkdir()
            service = OperationalService(config=load_config(ROOT / "configs" / "agios.json"), state_dir=root / "state", runner=lambda *args: None, skill_loader=lambda selected: ("", tuple(selected)))
            try:
                registered = service.register_workspace(label="Builder worktree", root_path=str(workspace), data_class="internal", write_allowed=True)
                asset = service.add_vision_asset(label="reference", data=PNG, mime_type="image/png", data_class="internal", retention="manual")
                run = service.create_run(mode="workspace", agent_id="builder", objective="Implement the approved change", data_class="internal", runtime_id="codex", workspace_id=registered["workspace_id"], workspace_access="write", vision_asset_ids=[asset["asset_id"]], model_id="deepseek-v4-flash")
                self.assertEqual("awaiting_approval", run["status"])
                self.assertEqual("codex", run["runtime_id"])
                self.assertEqual("write", run["workspace_access"])
                self.assertEqual([asset["asset_id"]], run["vision_asset_ids"])
                with self.assertRaisesRegex(OperationalError, "OpenCode.*images"):
                    service.create_run(mode="workspace", agent_id="builder", objective="Inspect the reference", data_class="internal", runtime_id="opencode", workspace_id=registered["workspace_id"], workspace_access="read", vision_asset_ids=[asset["asset_id"]], model_id="gpt-5.6-sol")
            finally:
                service.executor.shutdown(wait=True)


class Phase4BSkillLifecycleTests(unittest.TestCase):
    def test_skill_requires_owner_authoring_validation_and_digest_bound_install(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            store = AgentGrowthStore(Path(temp_dir) / "growth.sqlite3")
            proposal = store.create(agent_id="builder", skill_name="release-evidence", change_kind="create", rationale="Standardize release verification.", evidence_run_ids=["run-1"])
            proposal = store.approve_for_authoring(proposal["proposal_id"])
            self.assertEqual("draft_ready", proposal["status"])
            proposal = store.validate_draft(proposal["proposal_id"])
            self.assertTrue(proposal["validation"]["passed"])
            with self.assertRaisesRegex(ValueError, "digest"):
                store.install(proposal["proposal_id"], "0" * 64)
            installed = store.install(proposal["proposal_id"], proposal["draft_digest"])
            self.assertEqual("installed", installed["status"])
            body, loaded = store.load_installed(["release-evidence"])
            self.assertEqual(("release-evidence",), loaded)
            self.assertIn("Verification", body)


if __name__ == "__main__":
    unittest.main()
