from __future__ import annotations

import base64
import hashlib
import json
import re
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from agios.server import create_app


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "configs" / "agios.json"
FRONTEND_PATH = ROOT / "apps" / "agios-command-center" / "dist"


class GraphifyServerTests(unittest.TestCase):
    def _fixture(self, root: Path, *, built_commit: str = "abc1234") -> Path:
        repository = root / "HermesOS"
        graphify_root = repository / "graphify-out"
        graphify_root.mkdir(parents=True)
        (repository / ".git" / "refs" / "heads").mkdir(parents=True)
        (repository / ".git" / "HEAD").write_text("ref: refs/heads/main\n", encoding="utf-8")
        (repository / ".git" / "refs" / "heads" / "main").write_text(
            f"{built_commit}ffff\n", encoding="utf-8"
        )
        (graphify_root / "graph.json").write_text(
            json.dumps(
                {
                    "directed": False,
                    "nodes": [
                        {"id": "one", "community": 0},
                        {"id": "two", "community": 1},
                    ],
                    "links": [{"source": "one", "target": "two"}],
                    "built_at_commit": built_commit,
                }
            ),
            encoding="utf-8",
        )
        (graphify_root / "graph.html").write_text(
            "<!doctype html><html><head>"
            '<script src="https://unpkg.com/vis-network@9.1.6/standalone/umd/vis-network.min.js" '
            'integrity="sha384-Ux6phic9PEHJ38YtrijhkzyJ8yQlH8i/+buBR8s3mAZOJrP1gwyvAcIYl3GWtpX1" '
            'crossorigin="anonymous"></script>'
            "<style>body { display: flex; }</style></head>"
            '<body>GRAPHIFY FIXTURE<script>const RAW_NODES = '
            '[{"color":{"background":"#123456"}},{"color":{"background":"#abcdef"}}];'
            "window.GRAPHIFY_FIXTURE = true;</script>"
            "<script>// Render hyperedges as shaded regions\n"
            "const hyperedges = [];\n"
            "network.on('afterDrawing', function(ctx) {});</script></body></html>",
            encoding="utf-8",
        )
        return graphify_root

    def test_status_requires_session_and_reports_real_graph_counts(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            temp = Path(temp_dir)
            graphify_root = self._fixture(temp)
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=FRONTEND_PATH,
                state_dir=temp / "state",
                graphify_root=graphify_root,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                self.assertEqual(401, client.get("/api/v1/graphify").status_code)
                client.get("/")
                response = client.get("/api/v1/graphify")
                self.assertEqual(200, response.status_code)
                payload = response.json()
                self.assertEqual("ready", payload["status"])
                self.assertEqual(2, payload["nodes"])
                self.assertEqual(1, payload["links"])
                self.assertEqual(2, payload["communities"])
                self.assertEqual("abc1234", payload["built_at_commit"])
                self.assertEqual("current", payload["freshness"])
                self.assertEqual("/graphify/view", payload["view_url"])
                self.assertEqual("no-store", response.headers["cache-control"])
                self.assertEqual("DENY", response.headers["x-frame-options"])

    def test_view_requires_session_and_is_same_origin_sandbox_compatible(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            temp = Path(temp_dir)
            graphify_root = self._fixture(temp)
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=FRONTEND_PATH,
                state_dir=temp / "state",
                graphify_root=graphify_root,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                self.assertEqual(401, client.get("/graphify/view").status_code)
                client.get("/")
                response = client.get("/graphify/view")
                self.assertEqual(200, response.status_code)
                self.assertIn("GRAPHIFY FIXTURE", response.text)
                self.assertEqual("no-store", response.headers["cache-control"])
                self.assertEqual("SAMEORIGIN", response.headers["x-frame-options"])
                csp = response.headers["content-security-policy"]
                self.assertIn("frame-ancestors 'self'", csp)
                self.assertIn("sandbox allow-scripts", csp)
                self.assertNotIn("unsafe-inline", csp)
                nonce_match = re.search(r"script-src 'nonce-([^']+)'", csp)
                self.assertIsNotNone(nonce_match)
                nonce = nonce_match.group(1)
                self.assertIn(f"style-src-elem 'nonce-{nonce}'", csp)
                for renderer_hash in (
                    "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=",
                    "4cgFR0//m8/eHo2G/esYsuZetUHlzCUWYM59sfgE9zY=",
                    "IY7YKNHjbzQ1NfAKrBZvBZohgXMtxrqB9PaqhAaT3vg=",
                    "OutIf5hnp68ctx4ThtV5J02g5HTJ5bbu/hkNfqVXWWo=",
                    "QE7TOEDW7YIlMzvUUnm8boDWeNBN7PBbaaYJjnp34WI=",
                    "QuPewnJYr+SnQiTnCNHFBw99ExTsz9f8w5320PimEPw=",
                    "gGUn/VMBXCeWm86qX/pOf+4ZDSbe0JcaXXb4rJjw1mA=",
                    "uepMTym1NwItBa/XV6ef6fQobLL0A0CNVDM5km5L+nQ=",
                ):
                    self.assertIn(f"'sha256-{renderer_hash}'", csp)
                self.assertIn("style-src-attr 'unsafe-hashes'", csp)
                self.assertRegex(csp, r"'sha256-[A-Za-z0-9+/=]+'")
                color_hash = base64.b64encode(
                    hashlib.sha256(b"background:#123456").digest()
                ).decode("ascii")
                self.assertIn(f"'sha256-{color_hash}'", csp)
                self.assertEqual(5, response.text.count(f'nonce="{nonce}"'))
                self.assertIn("@media (max-width: 720px)", response.text)
                self.assertIn("#sidebar", response.text)
                self.assertIn("position: absolute", response.text)
                self.assertIn("#legend-wrap", response.text)

    def test_view_rejects_unexpected_executable_blocks_in_the_artifact(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            temp = Path(temp_dir)
            graphify_root = self._fixture(temp)
            graph_path = graphify_root / "graph.html"
            graph_path.write_text(
                graph_path.read_text(encoding="utf-8").replace(
                    "</body>", "<script>alert('unexpected')</script></body>"
                ),
                encoding="utf-8",
            )
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=FRONTEND_PATH,
                state_dir=temp / "state",
                graphify_root=graphify_root,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                self.assertEqual(404, client.get("/graphify/view").status_code)

    def test_view_rejects_external_script_attributes_that_only_contain_expected_values(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            temp = Path(temp_dir)
            graphify_root = self._fixture(temp)
            graph_path = graphify_root / "graph.html"
            expected_src = (
                "https://unpkg.com/vis-network@9.1.6/standalone/umd/vis-network.min.js"
            )
            graph_path.write_text(
                graph_path.read_text(encoding="utf-8").replace(
                    f'src="{expected_src}"',
                    f'src="https://evil.invalid/?next={expected_src}"',
                ),
                encoding="utf-8",
            )
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=FRONTEND_PATH,
                state_dir=temp / "state",
                graphify_root=graphify_root,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                self.assertEqual(404, client.get("/graphify/view").status_code)

    def test_missing_artifacts_are_reported_without_exposing_local_paths(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            temp = Path(temp_dir)
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=FRONTEND_PATH,
                state_dir=temp / "state",
                graphify_root=temp / "missing-graph",
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                response = client.get("/api/v1/graphify")
                self.assertEqual(200, response.status_code)
                payload = response.json()
                self.assertEqual("unavailable", payload["status"])
                self.assertEqual(0, payload["nodes"])
                self.assertIsNone(payload["view_url"])
                self.assertNotIn(str(temp), json.dumps(payload))
                self.assertEqual(404, client.get("/graphify/view").status_code)


if __name__ == "__main__":
    unittest.main()
