"""Tests for the Image Studio service and its server routes."""

import base64
import json
import tempfile
import unittest
import urllib.error
from pathlib import Path
from unittest import mock

from fastapi.testclient import TestClient

from agios.image_studio import ImageStudioError, ImageStudioService
from agios.server import create_app

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "configs" / "agios.json"
FRONTEND_PATH = ROOT / "apps" / "agios-command-center" / "dist"

TINY_PNG = base64.b64encode(bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63fcffff3f0300050001ff894b0000000049454e44ae426082")).decode("ascii")


class FakeResponse:
    def __init__(self, payload: dict, status: int = 200) -> None:
        self._payload = json.dumps(payload).encode("utf-8")
        self.status = status

    def __enter__(self):
        return self

    def __exit__(self, *args) -> None:
        pass

    def read(self, _limit: int | None = None) -> bytes:
        return self._payload

    def decode(self, *args, **kwargs):
        return self._payload.decode(*args, **kwargs)


class ImageStudioServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.service = ImageStudioService(artifact_root=self.root / "artifacts")

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_status_reports_key_missing_without_a_key(self) -> None:
        with mock.patch.dict("os.environ", {}, clear=False):
            os_environ = __import__("os").environ
            os_environ.pop("OPENROUTER_API_KEY", None)
            try:
                status = self.service.status()
            finally:
                pass
        self.assertEqual("key-missing", status["status"])
        self.assertEqual("microsoft/mai-image-2.5", status["model"])
        self.assertIn("16:9", status["aspect_ratios"])

    def test_generate_persists_image_with_provenance(self) -> None:
        with mock.patch.dict("os.environ", {"OPENROUTER_API_KEY": "sk-test"}, clear=False):
            with mock.patch(
                "agios.image_studio.urllib.request.urlopen",
                return_value=FakeResponse(
                    {"data": [{"b64_json": TINY_PNG}], "usage": {"total_tokens": 101}}
                ),
            ):
                record = self.service.generate("A small test graphic", "1:1")
        self.assertEqual("1:1", record["aspect_ratio"])
        self.assertEqual(64, record["sha256"].__len__())
        png = self.root / "artifacts" / "image-studio" / f"{record['artifact_id']}.png"
        self.assertTrue(png.is_file())
        self.assertEqual({"total_tokens": 101}, record["usage"])
        self.assertIn(f"/api/v1/image-studio/artifacts/{record['artifact_id']}.png", record["image_url"])
        recent = self.service.recent()
        self.assertEqual(record["artifact_id"], recent[0]["artifact_id"])

    def test_generate_rejects_unknown_aspect_and_oversized_prompt(self) -> None:
        with mock.patch.dict("os.environ", {"OPENROUTER_API_KEY": "sk-test"}, clear=False):
            with self.assertRaises(ValueError):
                self.service.generate("test", "21:9")
            with self.assertRaises(ValueError):
                self.service.generate("x" * 4001, "16:9")

    def test_generate_classifies_provider_errors_honestly(self) -> None:
        def raise_http(request, timeout):
            raise urllib.error.HTTPError(
                "https://openrouter.ai/api/v1/images", 402, "Payment Required", {}, None
            )

        with mock.patch.dict("os.environ", {"OPENROUTER_API_KEY": "sk-test"}, clear=False):
            with mock.patch("agios.image_studio.urllib.request.urlopen", raise_http):
                with self.assertRaisesRegex(ImageStudioError, "credits exhausted"):
                    self.service.generate("test", "16:9")

    def test_artifact_file_rejects_bad_ids(self) -> None:
        with self.assertRaises(ValueError):
            self.service.artifact_file("../secrets")
        with self.assertRaises(ValueError):
            self.service.artifact_file("missing-artifact")


class ImageStudioServerTests(unittest.TestCase):
    def _client(self):
        temp = tempfile.TemporaryDirectory()
        root = Path(temp.name)
        studio = ImageStudioService(artifact_root=root / "artifacts")
        app = create_app(
            config_path=CONFIG_PATH,
            frontend_path=FRONTEND_PATH,
            state_dir=root / "state",
            image_studio_service=studio,
        )
        return TestClient(app, base_url="http://127.0.0.1:9120"), temp

    def test_status_endpoint_reports_honest_key_state(self) -> None:
        client, temp = self._client()
        with client:
            client.get("/")
            payload = client.get("/api/v1/image-studio")
            self.assertEqual(200, payload.status_code)
            self.assertIn(payload.json()["key_state"], {"configured", "missing"})
            self.assertEqual("microsoft/mai-image-2.5", payload.json()["model"])
        temp.cleanup()

    def test_generate_route_persists_and_returns_record(self) -> None:
        client, temp = self._client()
        with client:
            client.get("/")
            with mock.patch.dict("os.environ", {"OPENROUTER_API_KEY": "sk-test"}, clear=False):
                with mock.patch(
                    "agios.image_studio.urllib.request.urlopen",
                    return_value=FakeResponse({"data": [{"b64_json": TINY_PNG}]}),
                ):
                    response = client.post(
                        "/api/v1/image-studio/generate",
                        headers={"X-AGIOS-CSRF": client.cookies.get("agios_csrf")},
                        json={"prompt": "Test image", "aspect_ratio": "4:3"},
                    )
            self.assertEqual(200, response.status_code)
            record = response.json()["record"]
            artifact = client.get(record["image_url"])
            self.assertEqual(200, artifact.status_code)
            self.assertEqual("image/png", artifact.headers["content-type"])
        temp.cleanup()

    def test_generate_route_rejects_invalid_aspect_before_any_provider_call(self) -> None:
        client, temp = self._client()
        with client:
            client.get("/")
            with mock.patch.dict("os.environ", {"OPENROUTER_API_KEY": "sk-test"}, clear=False):
                with mock.patch("agios.image_studio.urllib.request.urlopen") as urlopen:
                    response = client.post(
                        "/api/v1/image-studio/generate",
                        headers={"X-AGIOS-CSRF": client.cookies.get("agios_csrf")},
                        json={"prompt": "Test", "aspect_ratio": "21:9"},
                    )
            self.assertEqual(422, response.status_code)
            urlopen.assert_not_called()
        temp.cleanup()

    def test_generate_route_reports_missing_key_as_bad_gateway(self) -> None:
        client, temp = self._client()
        with client:
            client.get("/")
            with mock.patch.dict("os.environ", {}, clear=False):
                os_environ = __import__("os").environ
                os_environ.pop("OPENROUTER_API_KEY", None)
                with mock.patch("agios.image_studio.urllib.request.urlopen") as urlopen:
                    response = client.post(
                        "/api/v1/image-studio/generate",
                        headers={"X-AGIOS-CSRF": client.cookies.get("agios_csrf")},
                        json={"prompt": "Test", "aspect_ratio": "16:9"},
                    )
            self.assertEqual(502, response.status_code)
            self.assertIn("not configured", response.json()["detail"])
            urlopen.assert_not_called()
        temp.cleanup()

    def test_artifact_route_returns_404_for_unknown_ids(self) -> None:
        client, temp = self._client()
        with client:
            client.get("/")
            response = client.get("/api/v1/image-studio/artifacts/does-not-exist.png")
            self.assertEqual(404, response.status_code)
        temp.cleanup()


if __name__ == "__main__":
    unittest.main()
