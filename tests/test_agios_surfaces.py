"""Tests for registry-driven AGIOS surfaces (web / terminal / native)."""

import os
import socket
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from agios.config import load_config
from agios.server import create_app
from agios.surfaces import (
    SurfaceConfigError,
    collect_surfaces,
    launch_surface,
    probe_surface,
    validate_surface,
    validate_surfaces,
)

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "configs" / "agios.json"


class SurfaceValidationTests(unittest.TestCase):
    def test_web_surface_requires_loopback_http_url(self):
        with self.assertRaises(SurfaceConfigError):
            validate_surface(
                {"id": "bad", "name": "Bad", "kind": "web", "url": "https://example.com"},
                "[0]",
            )
        with self.assertRaises(SurfaceConfigError):
            validate_surface(
                {"id": "bad", "name": "Bad", "kind": "web", "url": "http://192.168.1.2"},
                "[0]",
            )
        with self.assertRaises(SurfaceConfigError):
            validate_surface({"id": "bad", "name": "Bad", "kind": "web"}, "[0]")
        surface = validate_surface(
            {"id": "ok", "name": "Ok", "kind": "web", "url": "http://127.0.0.1:9119"},
            "[0]",
        )
        self.assertEqual("http://127.0.0.1:9119", surface["url"])

    def test_terminal_surface_requires_a_bounded_command(self):
        with self.assertRaises(SurfaceConfigError):
            validate_surface({"id": "t", "name": "T", "kind": "terminal"}, "[0]")
        with self.assertRaises(SurfaceConfigError):
            validate_surface(
                {"id": "t", "name": "T", "kind": "terminal", "command": []}, "[0]"
            )
        with self.assertRaises(SurfaceConfigError):
            validate_surface(
                {"id": "t", "name": "T", "kind": "terminal", "command": ["a", ""]}, "[0]"
            )
        surface = validate_surface(
            {"id": "t", "name": "T", "kind": "terminal", "command": ["cmd.exe"]}, "[0]"
        )
        self.assertEqual(["cmd.exe"], surface["command"])

    def test_native_surface_requires_launch_and_unknown_kinds_are_denied(self):
        with self.assertRaises(SurfaceConfigError):
            validate_surface({"id": "n", "name": "N", "kind": "native"}, "[0]")
        with self.assertRaises(SurfaceConfigError):
            validate_surface(
                {"id": "x", "name": "X", "kind": "teleporter", "command": ["x"]}, "[0]"
            )
        surface = validate_surface(
            {"id": "n", "name": "N", "kind": "native", "launch": ["hermes", "desktop"]},
            "[0]",
        )
        self.assertEqual(["hermes", "desktop"], surface["launch"])

    def test_duplicate_ids_and_oversized_lists_are_rejected(self):
        with self.assertRaises(SurfaceConfigError):
            validate_surfaces(
                [
                    {"id": "a", "name": "A", "kind": "terminal", "command": ["cmd.exe"]},
                    {"id": "a", "name": "B", "kind": "terminal", "command": ["cmd.exe"]},
                ]
            )
        with self.assertRaises(SurfaceConfigError):
            validate_surfaces(
                [
                    {"id": f"s{index}", "name": "S", "kind": "terminal", "command": ["cmd.exe"]}
                    for index in range(20)
                ]
            )

    def test_registry_surfaces_load_through_config_validation(self):
        config = load_config(CONFIG_PATH)
        self.assertGreaterEqual(len(config.surfaces), 3)
        ids = {surface["id"] for surface in config.surfaces}
        self.assertEqual(
            {
                "hermes-cli",
                "codex-cli",
                "opencode-cli",
                "local-shell",
                "paperclip",
                "cline-cli",
                "openclaw-cli",
                "antigravity-cli",
            },
            ids,
        )


class SurfaceProbeTests(unittest.TestCase):
    def test_web_probe_detects_live_and_dead_loopback_ports(self):
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.bind(("127.0.0.1", 0))
        server.listen(1)
        port = server.getsockname()[1]
        try:
            surface = {"id": "live", "name": "Live", "kind": "web", "url": f"http://127.0.0.1:{port}"}
            self.assertEqual("live", probe_surface(surface)["status"])
            dead_port = self._closed_port()
            dead = {"id": "dead", "name": "Dead", "kind": "web", "url": f"http://127.0.0.1:{dead_port}"}
            self.assertEqual("unreachable", probe_surface(dead)["status"])
        finally:
            server.close()

    @staticmethod
    def _closed_port() -> int:
        probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
        probe.close()
        return port

    @unittest.skipUnless(os.name == "nt", "cmd.exe probe is Windows-only")
    def test_terminal_probe_reports_cmd_exe_available(self):
        surface = {"id": "shell", "name": "Shell", "kind": "terminal", "command": ["cmd.exe"]}
        self.assertEqual("available", probe_surface(surface)["status"])

    def test_terminal_probe_reports_missing_binary(self):
        surface = {
            "id": "ghost",
            "name": "Ghost",
            "kind": "terminal",
            "command": ["agios-ghost-binary-that-does-not-exist"],
        }
        self.assertEqual("missing", probe_surface(surface)["status"])

    def test_collect_surfaces_returns_fixed_shape_without_commands(self):
        surfaces = [
            {"id": "w", "name": "W", "kind": "web", "url": "http://127.0.0.1:1"},
            {"id": "t", "name": "T", "kind": "terminal", "command": ["cmd.exe"]},
        ]
        items = collect_surfaces(surfaces)
        self.assertEqual(2, len(items))
        for item in items:
            self.assertIn("id", item)
            self.assertIn("kind", item)
            self.assertIn("status", item)
            self.assertNotIn("command", item)
            self.assertNotIn("launch", item)


class SurfaceLaunchTests(unittest.TestCase):
    def test_launch_requires_a_declared_command(self):
        with self.assertRaises(ValueError):
            launch_surface({"id": "t", "name": "T", "kind": "terminal", "command": ["cmd.exe"]})

    def test_launch_rejects_missing_binary(self):
        with self.assertRaises(FileNotFoundError):
            launch_surface(
                {
                    "id": "ghost",
                    "name": "Ghost",
                    "kind": "native",
                    "launch": ["agios-ghost-binary-that-does-not-exist"],
                }
            )

    def test_launch_uses_resolved_binary_and_registry_args_only(self):
        with mock.patch("agios.surfaces.shutil.which", return_value="C:\\tools\\fake.exe"):
            with mock.patch("agios.surfaces.subprocess.Popen") as popen:
                launch_surface({"id": "n", "name": "N", "kind": "native", "launch": ["fake", "desktop"]})
                popen.assert_called_once()
                args = popen.call_args
                command = args[0][0]
                self.assertEqual(["C:\\tools\\fake.exe", "desktop"], command)

    def test_spawned_processes_never_inherit_desktop_bridge_variables(self):
        with mock.patch.dict(
            "os.environ",
            {"HERMES_SERVE_HEADLESS": "1", "HERMES_WEB_DIST": "C:\\desktop\\dist"},
            clear=False,
        ):
            from agios.surfaces import child_environment

            environment = child_environment()
            self.assertNotIn("HERMES_SERVE_HEADLESS", environment)
            self.assertNotIn("HERMES_WEB_DIST", environment)
            self.assertIn("PATH", environment)
        with mock.patch("agios.surfaces.shutil.which", return_value="C:\\tools\\fake.exe"):
            with mock.patch("agios.surfaces.subprocess.Popen") as popen:
                launch_surface({"id": "n", "name": "N", "kind": "native", "launch": ["fake", "desktop"]})
                child_env = popen.call_args.kwargs.get("env", {})
                self.assertNotIn("HERMES_SERVE_HEADLESS", child_env)
                self.assertNotIn("HERMES_WEB_DIST", child_env)


class SurfaceServerTests(unittest.TestCase):
    def test_surfaces_endpoint_requires_session_and_lists_registry_surfaces(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                state_dir=temp_dir,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as anon:
                self.assertEqual(401, anon.get("/api/v1/surfaces").status_code)

        with tempfile.TemporaryDirectory() as temp_dir:
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                state_dir=temp_dir,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                response = client.get("/api/v1/surfaces")
                self.assertEqual(200, response.status_code)
                payload = response.json()
                self.assertEqual(1, payload["schema_version"])
                ids = {item["id"] for item in payload["items"]}
                # Terminal surfaces, the Paperclip web surface, and the Antigravity native surface
                expected = {
                    "hermes-cli",
                    "codex-cli",
                    "opencode-cli",
                    "local-shell",
                    "paperclip",
                    "cline-cli",
                    "openclaw-cli",
                    "antigravity-cli",
                }
                self.assertEqual(ids, expected)

    def test_launch_endpoint_denies_terminal_surfaces_and_unknown_ids(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                state_dir=temp_dir,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                csrf = client.cookies.get("agios_csrf")
                self.assertEqual(
                    404,
                    client.post(
                        "/api/v1/surfaces/codex-cli/launch",
                        headers={"X-AGIOS-CSRF": csrf},
                    ).status_code,
                )
                self.assertEqual(
                    404,
                    client.post(
                        "/api/v1/surfaces/does-not-exist/launch",
                        headers={"X-AGIOS-CSRF": csrf},
                    ).status_code,
                )

    def test_launch_endpoint_requires_csrf(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                state_dir=temp_dir,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                self.assertEqual(
                    403,
                    client.post("/api/v1/surfaces/codex-cli/launch").status_code,
                )

    def test_shell_socket_rejects_unknown_surfaces(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                state_dir=temp_dir,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                with self.assertRaises(WebSocketDisconnect):
                    with client.websocket_connect("/ws/shell/does-not-exist"):
                        pass


if __name__ == "__main__":
    unittest.main()
