import json
import sqlite3
import sys
import tempfile
import time
import unittest
from contextlib import closing
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

from agios.config import load_config
from agios.events import EventJournal
from agios.operational import (
    HermesExecutionResult,
    OperationalError,
    OperationalService,
    SharedMemoryStore,
    _run_runtime_process,
    _runtime_error_code,
    run_hermes_cli,
)
from agios.server import create_app


ROOT = Path(__file__).resolve().parents[1]


class SharedMemoryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / "memory.sqlite3"
        self.store = SharedMemoryStore(self.path)
        self.config = load_config(ROOT / "configs" / "agios.json")

    def tearDown(self):
        self.temp.cleanup()

    def test_portfolio_memory_is_shared_but_private_memory_is_agent_scoped(self):
        portfolio = self.store.add(
            scope_kind="portfolio",
            scope_id="portfolio",
            title="Operating principle",
            body="Prefer verified evidence.",
            created_by="owner",
            trust="high",
        )
        private = self.store.add(
            scope_kind="private",
            scope_id="reviewer",
            title="Review note",
            body="Keep independent review separate.",
            created_by="owner",
        )

        default_ids = {
            item["memory_id"]
            for item in self.store.list_for_agent(self.config, agent_id="default")
        }
        reviewer_ids = {
            item["memory_id"]
            for item in self.store.list_for_agent(self.config, agent_id="reviewer")
        }
        self.assertIn(portfolio["memory_id"], default_ids)
        self.assertNotIn(private["memory_id"], default_ids)
        self.assertIn(portfolio["memory_id"], reviewer_ids)
        self.assertIn(private["memory_id"], reviewer_ids)

    def test_memory_rejects_credentials(self):
        with self.assertRaisesRegex(OperationalError, "credential"):
            self.store.add(
                scope_kind="portfolio",
                scope_id="portfolio",
                title="Unsafe",
                body="api_key=sk-example1234567890",
                created_by="owner",
            )


class OperationalServiceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.state = Path(self.temp.name)
        self.calls = []

        def runner(run, memory_context, skill_context, workspace):
            self.calls.append((run, memory_context, skill_context, workspace))
            return HermesExecutionResult("completed", "Verified result", None, "session-1")

        self.service = OperationalService(
            config=load_config(ROOT / "configs" / "agios.json"),
            state_dir=self.state,
            runner=runner,
            skill_loader=lambda selected: (
                "Shared skill instructions" if tuple(selected) else "",
                tuple(selected),
            ),
        )

    def tearDown(self):
        self.service.executor.shutdown(wait=True)
        self.temp.cleanup()

    def wait_for_run(self, run_id):
        for _ in range(100):
            run = self.service.sessions.get(run_id)
            if run["status"] not in {"queued", "running"}:
                return run
            time.sleep(0.01)
        self.fail("run did not finish")

    def test_chat_receives_shared_memory_and_skill_without_journaling_content(self):
        memory = self.service.add_memory(
            scope_kind="portfolio",
            scope_id="portfolio",
            title="Studio rule",
            body="Keep customer work isolated.",
            created_by="owner",
            trust="high",
        )
        run = self.service.create_run(
            mode="chat",
            agent_id="default",
            objective="Summarize our operating posture",
            data_class="internal",
            skill_ids=["governance"],
            memory_ids=[memory["memory_id"]],
        )
        completed = self.wait_for_run(run["run_id"])

        self.assertEqual("completed", completed["status"])
        self.assertEqual("Verified result", completed["response"])
        self.assertIn("Keep customer work isolated", self.calls[0][1])
        self.assertEqual("Shared skill instructions", self.calls[0][2])
        with EventJournal(self.service.journal_path) as journal:
            serialized = repr([event.payload for event in journal.events()])
        self.assertNotIn("Summarize our operating posture", serialized)
        self.assertNotIn("Keep customer work isolated", serialized)
        self.assertNotIn("Verified result", serialized)

    def test_runtime_stdout_progress_is_persisted_with_workspace_and_secret_redaction(self):
        def streaming_runner(run, memory_context, skill_context, workspace):
            for index in range(6):
                run["_progress"](f"chunk-{index}:" + ("x" * 9990) + "\n")
            run["_progress"](f"Inspecting {workspace}\n")
            run["_progress"]("api_key=abcdefghijklmnop\nTests passed\n")
            return HermesExecutionResult("completed", "Verified result", None, "session-stream")

        self.service.runner = streaming_runner
        run = self.service.create_run(
            mode="chat",
            agent_id="default",
            objective="Report bounded runtime progress",
            data_class="internal",
        )

        completed = self.wait_for_run(run["run_id"])

        self.assertEqual("completed", completed["status"])
        self.assertIn("Inspecting [WORKSPACE]", completed["progress_output"])
        self.assertIn("[REDACTED]", completed["progress_output"])
        self.assertLessEqual(len(completed["progress_output"]), 50000)
        self.assertTrue(completed["progress_output"].startswith("[Earlier runtime output truncated]"))
        self.assertNotIn(str(ROOT), completed["progress_output"])
        self.assertNotIn("abcdefghijklmnop", completed["progress_output"])

    def test_hermes_run_trace_exposes_real_tool_events_without_reasoning_or_secrets(self):
        run = self.service.create_run(
            mode="chat",
            agent_id="default",
            objective="Inspect stored execution evidence",
            data_class="internal",
        )
        completed = self.wait_for_run(run["run_id"])
        workspace = self.state / "runs" / completed["run_id"]
        private_home_path = Path.home() / "Downloads" / "private-client.txt"
        profile = self.state / "profiles" / "default"
        profile.mkdir(parents=True)
        with closing(sqlite3.connect(profile / "state.db")) as connection:
            connection.executescript(
                """
                CREATE TABLE sessions(id TEXT PRIMARY KEY, source TEXT, started_at REAL);
                CREATE TABLE messages(
                    id INTEGER PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT,
                    tool_call_id TEXT,
                    tool_calls TEXT,
                    tool_name TEXT,
                    effect_disposition TEXT,
                    timestamp REAL,
                    active INTEGER DEFAULT 1,
                    reasoning TEXT
                );
                """
            )
            connection.execute(
                "INSERT INTO sessions(id, source, started_at) VALUES (?, ?, ?)",
                (completed["hermes_session_id"], f"agios:{completed['run_id']}", 1.0),
            )
            connection.executemany(
                "INSERT INTO messages(session_id, role, content, timestamp) VALUES (?, 'user', 'old context', ?)",
                [
                    (completed["hermes_session_id"], index / 1000)
                    for index in range(250)
                ],
            )
            tool_calls = json.dumps([
                {
                    "id": "call-1",
                    "type": "function",
                    "function": {
                        "name": "terminal",
                        "arguments": json.dumps({
                            "command": f"inspect {workspace} api_key=abcdefghijklmnop"
                        }),
                    },
                }
            ])
            connection.execute(
                "INSERT INTO messages(session_id, role, content, tool_calls, timestamp, reasoning) VALUES (?, 'assistant', '', ?, 2.0, ?)",
                (completed["hermes_session_id"], tool_calls, "private hidden reasoning"),
            )
            connection.execute(
                "INSERT INTO messages(session_id, role, content, tool_call_id, tool_name, effect_disposition, timestamp) VALUES (?, 'tool', ?, 'call-1', 'terminal', 'confirmed', 3.0)",
                (
                    completed["hermes_session_id"],
                    f"finished in {workspace}; read {private_home_path}; token=qrstuvwxyzabcdef",
                ),
            )
            connection.execute(
                "INSERT INTO messages(session_id, role, content, timestamp) VALUES (?, 'assistant', 'Checking the result for the owner.', 4.0)",
                (completed["hermes_session_id"],),
            )
            connection.execute(
                "INSERT INTO messages(session_id, role, content, timestamp) VALUES (?, 'assistant', 'Verified result', 5.0)",
                (completed["hermes_session_id"],),
            )
            connection.commit()

        self.service.profile_dir_resolver = lambda _name: profile
        trace = self.service.run_trace(completed["run_id"])
        serialized = json.dumps(trace)

        self.assertTrue(trace["available"], trace)
        self.assertEqual(2, len(trace["events"]))
        self.assertEqual("terminal", trace["events"][0]["tool"])
        self.assertIn("[WORKSPACE]", trace["events"][0]["input"])
        self.assertNotIn("abcdefghijklmnop", serialized)
        self.assertNotIn("qrstuvwxyzabcdef", serialized)
        self.assertNotIn(str(workspace), serialized)
        self.assertNotIn(str(private_home_path), serialized)
        self.assertNotIn(str(workspace), trace["events"][0]["output"])
        self.assertNotIn(str(private_home_path), trace["events"][0]["output"])
        self.assertNotIn("private hidden reasoning", serialized)
        self.assertNotIn("Verified result", serialized)

        app = create_app(
            config_path=ROOT / "configs" / "agios.json",
            frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
            operational_service=self.service,
        )
        with TestClient(app, base_url="http://127.0.0.1:9120") as client:
            client.get("/")
            response = client.get(f"/api/v1/hermes/runs/{completed['run_id']}/events")
            self.assertEqual(200, response.status_code)
            self.assertEqual("terminal", response.json()["trace"]["events"][0]["tool"])

    def test_goal_requires_exact_approval_before_dispatch(self):
        run = self.service.create_run(
            mode="goal",
            agent_id="builder",
            objective="Create a harmless text artifact in the AGIOS scratch workspace",
            data_class="internal",
        )
        self.assertEqual("awaiting_approval", run["status"])
        self.assertEqual([], self.calls)
        with self.assertRaisesRegex(OperationalError, "no longer matches"):
            self.service.approve_run(run["run_id"], "0" * 64)

        self.service.approve_run(run["run_id"], run["approval_digest"])
        completed = self.wait_for_run(run["run_id"])
        self.assertEqual("completed", completed["status"])
        self.assertEqual(1, len(self.calls))

    def test_auto_retrieved_memory_context_remains_approvable(self):
        self.service.add_memory(
            scope_kind="portfolio",
            scope_id="portfolio",
            title="Alpha Beta Gamma",
            body="Use all three signals when reviewing the route.",
            created_by="owner",
            trust="high",
        )
        self.service.add_memory(
            scope_kind="portfolio",
            scope_id="portfolio",
            title="Alpha",
            body="Keep the first signal visible.",
            created_by="owner",
            trust="high",
        )
        run = self.service.create_run(
            mode="goal",
            agent_id="builder",
            objective="Review alpha beta gamma",
            data_class="internal",
        )

        self.assertEqual(2, len(run["memory_ids"]))
        self.service.approve_run(run["run_id"], run["approval_digest"])

        completed = self.wait_for_run(run["run_id"])
        self.assertEqual("completed", completed["status"])
        self.assertEqual(1, len(self.calls))

    def test_memory_content_drift_is_blocked_with_a_precise_reason(self):
        memory = self.service.add_memory(
            scope_kind="portfolio",
            scope_id="portfolio",
            title="Approval boundary",
            body="Use the reviewed memory content.",
            created_by="owner",
            trust="high",
        )
        run = self.service.create_run(
            mode="goal",
            agent_id="builder",
            objective="Review the approval boundary",
            data_class="internal",
            memory_ids=[memory["memory_id"]],
        )
        connection = sqlite3.connect(self.service.memory.path)
        try:
            connection.execute(
                "UPDATE memories SET body=? WHERE memory_id=?",
                ("This content changed after the approval request.", memory["memory_id"]),
            )
            connection.commit()
        finally:
            connection.close()

        with self.assertRaisesRegex(OperationalError, "memory content"):
            self.service.approve_run(run["run_id"], run["approval_digest"])

        waiting = self.service.sessions.get(run["run_id"])
        self.assertEqual("awaiting_approval", waiting["status"])
        self.assertEqual([], self.calls)

    def test_context_drift_keeps_goal_waiting_for_approval(self):
        run = self.service.create_run(
            mode="goal",
            agent_id="builder",
            objective="Inspect the isolated AGIOS scratch workspace",
            data_class="internal",
            skill_ids=["governance"],
        )
        self.service.skill_loader = lambda selected: (
            "Changed shared skill instructions",
            tuple(selected),
        )

        with self.assertRaisesRegex(OperationalError, "context changed"):
            self.service.approve_run(run["run_id"], run["approval_digest"])

        waiting = self.service.sessions.get(run["run_id"])
        self.assertEqual("awaiting_approval", waiting["status"])
        self.assertEqual([], self.calls)

    def test_pending_goal_can_be_canceled_and_cannot_later_dispatch(self):
        run = self.service.create_run(
            mode="goal",
            agent_id="builder",
            objective="Prepare a bounded implementation plan",
            data_class="internal",
        )

        canceled = self.service.cancel_run(run["run_id"])
        self.assertEqual("canceled", canceled["status"])
        self.assertIsNotNone(canceled["completed_at"])
        with self.assertRaisesRegex(OperationalError, "not awaiting approval"):
            self.service.approve_run(run["run_id"], run["approval_digest"])
        self.assertEqual([], self.calls)
        with EventJournal(self.service.journal_path) as journal:
            canceled_events = [
                event
                for event in journal.events()
                if event.kind == "approval.resolved"
                and event.subject_id == run["run_id"]
            ]
        self.assertEqual(1, len(canceled_events))
        self.assertEqual("canceled", canceled_events[0].payload["status"])

    def test_external_private_chat_requires_exact_approval(self):
        self.service._profile_runtime = lambda _agent: ("test-model", "external", True)
        run = self.service.create_run(
            mode="chat",
            agent_id="default",
            objective="Summarize a private business note",
            data_class="private_business",
        )

        self.assertEqual("awaiting_approval", run["status"])
        self.assertEqual([], self.calls)

    def test_unknown_provider_fails_closed_for_private_chat(self):
        self.service._profile_runtime = lambda _agent: (None, None, True)
        run = self.service.create_run(
            mode="chat",
            agent_id="default",
            objective="Summarize a private business note",
            data_class="private_business",
        )
        self.assertEqual("awaiting_approval", run["status"])

    def test_memory_scope_must_reference_registered_organization(self):
        with self.assertRaisesRegex(OperationalError, "not registered"):
            self.service.add_memory(
                scope_kind="business",
                scope_id="unknown-business",
                title="Invalid scope",
                body="This must not be stored.",
                created_by="owner",
            )

    def test_owner_can_choose_only_a_policy_approved_model_route(self):
        run = self.service.create_run(
            mode="chat",
            agent_id="default",
            objective="Summarize the operating plan",
            data_class="internal",
            model_id="qwen3.5-hermes",
        )
        completed = self.wait_for_run(run["run_id"])
        self.assertEqual("qwen3.5-hermes", completed["model"])
        self.assertEqual("ollama", completed["provider"])

        with self.assertRaisesRegex(OperationalError, "not approved for this agent"):
            self.service.create_run(
                mode="chat",
                agent_id="builder",
                objective="Use an unassigned route",
                data_class="internal",
                model_id="qwen3.5-hermes",
            )
        with self.assertRaisesRegex(OperationalError, "not approved for this data class"):
            self.service.create_run(
                mode="chat",
                agent_id="default",
                objective="Keep customer content restricted",
                data_class="customer_restricted",
                model_id="deepseek-v4-flash",
            )

    def test_agent_skill_growth_requires_completed_evidence_before_owner_review(self):
        no_evidence = self.service.create_skill_proposal(
            agent_id="default",
            skill_name="decision-quality-review",
            change_kind="create",
            rationale="Repeated decisions should be checked against evidence and owner intent.",
        )
        self.assertEqual("needs_evidence", no_evidence["status"])
        with self.assertRaisesRegex(OperationalError, "not ready"):
            self.service.approve_skill_proposal(no_evidence["proposal_id"])

        run = self.service.create_run(
            mode="chat",
            agent_id="default",
            objective="Review the operating decision",
            data_class="internal",
        )
        completed = self.wait_for_run(run["run_id"])
        proposal = self.service.create_skill_proposal(
            agent_id="default",
            skill_name="decision-quality-review",
            change_kind="create",
            rationale="A completed review exposed a recurring decision-quality check.",
            evidence_run_ids=[completed["run_id"]],
        )
        self.assertEqual("awaiting_owner_review", proposal["status"])
        approved = self.service.approve_skill_proposal(proposal["proposal_id"])
        self.assertEqual("draft_ready", approved["status"])
        self.assertIn("name: decision-quality-review", approved["draft_body"])


class HermesRuntimePolicyTests(unittest.TestCase):
    def test_streaming_process_publishes_stdout_but_never_stderr(self):
        chunks = []
        completed = _run_runtime_process(
            [
                sys.executable,
                "-u",
                "-c",
                "import sys; print('visible line'); print('private diagnostic', file=sys.stderr)",
            ],
            progress=chunks.append,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
            shell=False,
            check=False,
        )

        self.assertEqual(0, completed.returncode)
        self.assertIn("visible line", "".join(chunks))
        self.assertNotIn("private diagnostic", "".join(chunks))
        self.assertIn("private diagnostic", completed.stderr)

    def invoke(self, *, mode, data_class, required_capabilities=()):
        captured = {}

        def fake_subprocess(command, **kwargs):
            captured["command"] = command
            captured["kwargs"] = kwargs
            return SimpleNamespace(
                returncode=0,
                stdout="Warning: Unknown toolsets: none\nsafe result",
                stderr="session_id: s1",
            )

        run = {
            "run_id": "run-123",
            "mode": mode,
            "data_class": data_class,
            "agent_id": "default",
            "objective": "Inspect only",
            "required_capabilities": required_capabilities,
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("hermes_cli.profiles.resolve_profile_env", return_value=temp_dir):
                with patch("agios.operational.subprocess.run", side_effect=fake_subprocess):
                    result = run_hermes_cli(run, "shared memory", "shared skill", Path(temp_dir))
        return captured, result

    def test_workspace_research_route_gets_web_and_workspace_tools(self):
        captured, _ = self.invoke(
            mode="workspace",
            data_class="internal",
            required_capabilities=("research_web", "write_workspace", "run_tests"),
        )
        command = captured["command"]
        self.assertEqual("web,file,terminal,todo", command[command.index("-t") + 1])

    def test_chat_is_model_only_and_never_yolo(self):
        captured, result = self.invoke(mode="chat", data_class="internal")
        command = captured["command"]
        self.assertEqual("completed", result.status)
        self.assertEqual("safe result", result.response)
        self.assertEqual("none", command[command.index("-t") + 1])
        self.assertNotIn("--yolo", command)
        self.assertNotIn("--checkpoints", command)
        self.assertEqual("agios:run-123", command[command.index("--source") + 1])
        self.assertFalse(captured["kwargs"]["shell"])

    def test_customer_goal_has_planning_only_and_no_workspace_tools(self):
        captured, _ = self.invoke(mode="goal", data_class="customer_restricted")
        command = captured["command"]
        self.assertEqual("todo", command[command.index("-t") + 1])
        self.assertIn("--checkpoints", command)
        self.assertNotIn("--yolo", command)

    def test_internal_goal_can_research_but_cannot_access_workspace_tools(self):
        captured, _ = self.invoke(mode="goal", data_class="internal")
        command = captured["command"]
        self.assertEqual("web,todo", command[command.index("-t") + 1])
        self.assertNotIn("file", command[command.index("-t") + 1])
        self.assertNotIn("terminal", command[command.index("-t") + 1])

    def test_selected_model_and_provider_are_forwarded_without_shell_interpolation(self):
        captured = {}

        def fake_subprocess(command, **kwargs):
            captured["command"] = command
            captured["kwargs"] = kwargs
            return SimpleNamespace(returncode=0, stdout="safe result", stderr="")

        run = {
            "mode": "chat",
            "data_class": "internal",
            "agent_id": "default",
            "objective": "Inspect only",
            "model": "qwen3.5-hermes",
            "provider": "ollama",
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("hermes_cli.profiles.resolve_profile_env", return_value=temp_dir):
                with patch("agios.operational.subprocess.run", side_effect=fake_subprocess):
                    result = run_hermes_cli(run, "", "", Path(temp_dir))
        self.assertEqual("completed", result.status)
        self.assertEqual("qwen3.5-hermes", captured["command"][captured["command"].index("--model") + 1])
        self.assertEqual("ollama", captured["command"][captured["command"].index("--provider") + 1])
        self.assertFalse(captured["kwargs"]["shell"])

    def test_hermes_provider_fallback_is_rejected(self):
        completed = SimpleNamespace(
            returncode=0,
            stdout="⚠️ Primary auth failed — switching to fallback: nvidia / model\nnot accepted",
            stderr="session_id: fallback-session",
        )
        run = {
            "mode": "chat",
            "data_class": "public",
            "agent_id": "default",
            "objective": "Use only the requested route",
            "model": "opencode-free",
            "provider": "opencode",
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("hermes_cli.profiles.resolve_profile_env", return_value=temp_dir):
                with patch("agios.operational.subprocess.run", return_value=completed):
                    result = run_hermes_cli(run, "", "", Path(temp_dir))
        self.assertEqual("failed", result.status)
        self.assertEqual("fallback_blocked", result.error_code)
        self.assertEqual("", result.response)

    def test_runtime_failures_are_classified_without_exposing_raw_secrets(self):
        cases = {
            "429 rate limit exceeded": "rate_limited",
            "invalid API key": "authentication_failed",
            "provider deepseek is not configured": "provider_unavailable",
            "model example does not exist": "model_unavailable",
            "approval is required": "tool_approval_required",
            "unexpected process exit": "runtime_failed",
        }
        for stderr, expected in cases.items():
            with self.subTest(stderr=stderr):
                self.assertEqual(expected, _runtime_error_code(stderr))


class OperationalServerTests(unittest.TestCase):
    def test_chief_of_staff_plans_and_dispatches_an_exact_approval_run(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            service = OperationalService(
                config=load_config(ROOT / "configs" / "agios.json"),
                state_dir=temp_dir,
                runner=lambda *_: HermesExecutionResult("completed", "ok", None, "s1"),
                skill_loader=lambda selected: ("", tuple(selected)),
            )
            try:
                app = create_app(
                    config_path=ROOT / "configs" / "agios.json",
                    frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                    operational_service=service,
                )
                with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                    client.get("/")
                    headers = {"X-AGIOS-CSRF": client.cookies.get("agios_csrf")}
                    response = client.post(
                        "/api/v1/orchestrator/plans",
                        headers=headers,
                        json={
                            "objective": (
                                "Review https://youtube.com/watch?v=example and improve "
                                "the customer dashboard design and animation"
                            ),
                            "data_class": "customer_restricted",
                        },
                    )
                    self.assertEqual(201, response.status_code)
                    plan = response.json()["plan"]
                    self.assertEqual("default", plan["orchestrator_agent_id"])
                    self.assertEqual("codinglocal", plan["lead_agent_id"])
                    self.assertEqual("workspace", plan["execution_mode"])

                    missing_workspace = client.post(
                        f"/api/v1/orchestrator/plans/{plan['plan_id']}/dispatch",
                        headers=headers,
                        json={"plan_digest": plan["plan_digest"]},
                    )
                    self.assertEqual(409, missing_workspace.status_code)

                    workspace = Path(temp_dir) / "approved-worktree"
                    workspace.mkdir()
                    (workspace / ".git").mkdir()
                    registered = service.register_workspace(
                        label="Approved worktree",
                        root_path=str(workspace),
                        data_class="customer_restricted",
                        write_allowed=True,
                    )

                    dispatched = client.post(
                        f"/api/v1/orchestrator/plans/{plan['plan_id']}/dispatch",
                        headers=headers,
                        json={
                            "plan_digest": plan["plan_digest"],
                            "workspace_id": registered["workspace_id"],
                            "runtime_id": "hermes",
                        },
                    )
                    self.assertEqual(202, dispatched.status_code)
                    payload = dispatched.json()
                    self.assertEqual("awaiting_approval", payload["plan"]["status"])
                    self.assertEqual("awaiting_approval", payload["run"]["status"])
                    self.assertEqual("codinglocal", payload["run"]["agent_id"])
                    self.assertEqual("ornith-hermes", payload["run"]["model"])
                    self.assertEqual("workspace", payload["run"]["mode"])
                    self.assertEqual("write", payload["run"]["workspace_access"])
                    self.assertEqual(
                        ["research_web", "write_workspace", "run_tests"],
                        payload["run"]["required_capabilities"],
                    )
            finally:
                service.executor.shutdown(wait=True)

    def test_voice_routes_require_session_and_forward_bounded_audio(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            service = OperationalService(
                config=load_config(ROOT / "configs" / "agios.json"),
                state_dir=temp_dir,
                runner=lambda *_: HermesExecutionResult("completed", "ok", None, "s1"),
                skill_loader=lambda selected: ("", tuple(selected)),
            )
            try:
                app = create_app(
                    config_path=ROOT / "configs" / "agios.json",
                    frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                    operational_service=service,
                )
                with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                    client.get("/")
                    csrf = client.cookies.get("agios_csrf")
                    headers = {"X-AGIOS-CSRF": csrf}
                    audio_payload = {
                        "data_url": "data:audio/webm;base64,YXVkaW8=",
                        "mime_type": "audio/webm",
                    }
                    with patch.object(
                        service.voice,
                        "transcribe",
                        return_value={"success": True, "transcript": "Plan the day"},
                    ) as transcribe:
                        denied = client.post("/api/v1/voice/transcribe", json=audio_payload)
                        self.assertEqual(403, denied.status_code)
                        response = client.post(
                            "/api/v1/voice/transcribe", json=audio_payload, headers=headers
                        )
                        self.assertEqual(200, response.status_code)
                        self.assertEqual("Plan the day", response.json()["transcript"])
                        transcribe.assert_called_once_with(b"audio", "audio/webm")

                    with patch.object(
                        service.voice,
                        "synthesize",
                        return_value={
                            "success": True,
                            "audio_data_url": "data:audio/mpeg;base64,YXVkaW8=",
                        },
                    ) as synthesize:
                        response = client.post(
                            "/api/v1/voice/synthesize",
                            json={"text": "Ready for review"},
                            headers=headers,
                        )
                        self.assertEqual(200, response.status_code)
                        self.assertTrue(response.json()["audio_data_url"].startswith("data:audio/"))
                        synthesize.assert_called_once_with("Ready for review")
            finally:
                service.executor.shutdown(wait=True)

    def test_write_routes_require_session_and_csrf(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            service = OperationalService(
                config=load_config(ROOT / "configs" / "agios.json"),
                state_dir=temp_dir,
                runner=lambda *_: HermesExecutionResult("completed", "ok", None, "s1"),
                skill_loader=lambda selected: ("", tuple(selected)),
            )
            try:
                app = create_app(
                    config_path=ROOT / "configs" / "agios.json",
                    frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                    operational_service=service,
                )
                with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                    self.assertEqual(200, client.get("/").status_code)
                    payload = {
                        "scope_kind": "portfolio",
                        "scope_id": "portfolio",
                        "title": "Shared fact",
                        "body": "Visible to registered agents.",
                        "created_by": "owner",
                    }
                    self.assertEqual(403, client.post("/api/v1/memory", json=payload).status_code)
                    csrf = client.cookies.get("agios_csrf")
                    response = client.post(
                        "/api/v1/memory", json=payload, headers={"X-AGIOS-CSRF": csrf}
                    )
                    self.assertEqual(201, response.status_code)

                    goal = service.create_run(
                        mode="goal",
                        agent_id="builder",
                        objective="Prepare a bounded plan",
                        data_class="internal",
                    )
                    cancel_path = f"/api/v1/hermes/runs/{goal['run_id']}/cancel"
                    self.assertEqual(403, client.post(cancel_path).status_code)
                    canceled = client.post(
                        cancel_path, headers={"X-AGIOS-CSRF": csrf}
                    )
                    self.assertEqual(200, canceled.status_code)
                    self.assertEqual("canceled", canceled.json()["run"]["status"])
            finally:
                service.executor.shutdown(wait=True)


if __name__ == "__main__":
    unittest.main()
