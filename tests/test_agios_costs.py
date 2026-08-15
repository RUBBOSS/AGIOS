"""Tests for the live provider cost adapter."""

import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from fastapi.testclient import TestClient

from agios import costs
from agios.server import create_app

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "configs" / "agios.json"


class FakeResponse:
    def __init__(self, payload: dict) -> None:
        self._payload = json.dumps(payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, *args) -> None:
        pass

    def read(self, _limit: int) -> bytes:
        return self._payload


def _urlopen_openrouter(request, timeout):
    return FakeResponse({"label": "sk-test", "usage": 1234, "limit": 5000, "is_free_tier": False})


def _urlopen_deepseek(request, timeout):
    return FakeResponse(
        {
            "is_available": True,
            "balance_infos": [
                {"currency": "USD", "total_balance": "12.50", "granted_balance": "5.00", "topped_up_balance": "7.50"}
            ],
        }
    )


class CostAdapterTests(unittest.TestCase):
    def setUp(self) -> None:
        costs._cache._value = None
        costs._cache._at = 0.0
        self._saved_env = {
            "OPENROUTER_API_KEY": os.environ.get("OPENROUTER_API_KEY"),
            "DEEPSEEK_API_KEY": os.environ.get("DEEPSEEK_API_KEY"),
        }
        os.environ.pop("OPENROUTER_API_KEY", None)
        os.environ.pop("DEEPSEEK_API_KEY", None)

    def tearDown(self) -> None:
        costs._cache._value = None
        costs._cache._at = 0.0
        for key, value in self._saved_env.items():
            if value is not None:
                os.environ[key] = value
            else:
                os.environ.pop(key, None)

    def test_no_keys_yield_honest_not_configured(self):
        snapshot = costs.build_cost_snapshot(force=True)
        self.assertFalse(snapshot["privacy"]["synthetic"])
        statuses = {p["id"]: p["status"] for p in snapshot["providers"]}
        self.assertEqual("not-configured", statuses["openrouter"])
        self.assertEqual("not-configured", statuses["deepseek"])
        self.assertEqual("not-wired", statuses["codex"])
        self.assertEqual("reported", statuses["local"])
        # Local compute honestly reports $0.00, so a total IS reported (zero).
        self.assertTrue(snapshot["total"]["reported"])
        self.assertEqual(0.0, snapshot["total"]["reported_usage_usd"])

    @mock.patch("agios.costs.urllib.request.urlopen", side_effect=_urlopen_openrouter)
    def test_openrouter_reports_usage_and_remaining(self, _mock_urlopen):
        os.environ["OPENROUTER_API_KEY"] = "test-key"
        snapshot = costs.build_cost_snapshot(force=True)
        provider = next(p for p in snapshot["providers"] if p["id"] == "openrouter")
        self.assertEqual("reported", provider["status"])
        self.assertEqual(12.34, provider["usage_30d"])
        self.assertEqual(50.0, provider["limit"])
        self.assertEqual(37.66, provider["remaining"])
        self.assertTrue(snapshot["total"]["reported"])
        self.assertNotIn("test-key", json.dumps(snapshot))

    @mock.patch("agios.costs.urllib.request.urlopen", side_effect=_urlopen_deepseek)
    def test_deepseek_reports_balances(self, _mock_urlopen):
        os.environ["DEEPSEEK_API_KEY"] = "test-key"
        snapshot = costs.build_cost_snapshot(force=True)
        provider = next(p for p in snapshot["providers"] if p["id"] == "deepseek")
        self.assertEqual("reported", provider["status"])
        self.assertTrue(provider["available"])
        self.assertEqual("USD", provider["balances"][0]["currency"])
        self.assertEqual("12.50", provider["balances"][0]["total_balance"])
        self.assertNotIn("test-key", json.dumps(snapshot))

    @mock.patch("agios.costs.urllib.request.urlopen", side_effect=OSError("network down"))
    def test_failing_provider_is_error_not_zero(self, _mock_urlopen):
        os.environ["DEEPSEEK_API_KEY"] = "test-key"
        snapshot = costs.build_cost_snapshot(force=True)
        provider = next(p for p in snapshot["providers"] if p["id"] == "deepseek")
        self.assertEqual("error", provider["status"])
        self.assertIn("provider call failed", provider["reason"])

    def test_gemini_reports_not_configured_without_key(self) -> None:
        with mock.patch.dict("os.environ", {}, clear=False):
            os.environ.pop("GEMINI_API_KEY", None)
            snapshot = costs._gemini_snapshot()
        self.assertEqual("not-configured", snapshot["status"])
        self.assertIn("GEMINI_API_KEY", snapshot["reason"])

    @mock.patch("agios.costs.urllib.request.urlopen", return_value=FakeResponse({"models": []}))
    def test_gemini_verifies_key_and_reports_free_tier_without_figures(self, _mock_urlopen):
        with mock.patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}, clear=False):
            snapshot = costs._gemini_snapshot()
        self.assertEqual("reported-empty", snapshot["status"])
        self.assertEqual("free", snapshot["tier"])
        self.assertIn("no balance", snapshot["note"])

    def test_pokee_reports_not_configured_without_key(self) -> None:
        with mock.patch.dict("os.environ", {}, clear=False):
            os.environ.pop("POKEE_API_KEY", None)
            snapshot = costs._pokee_snapshot()
        self.assertEqual("not-configured", snapshot["status"])
        self.assertIn("POKEE_API_KEY", snapshot["reason"])

    @mock.patch(
        "agios.costs.urllib.request.urlopen",
        return_value=FakeResponse({"data": [{"id": "pokee-isaac", "object": "model"}]}),
    )
    def test_pokee_verifies_key_and_lists_models_without_figures(self, _mock_urlopen):
        with mock.patch.dict("os.environ", {"POKEE_API_KEY": "pk-test"}, clear=False):
            snapshot = costs._pokee_snapshot()
        self.assertEqual("reported-empty", snapshot["status"])
        self.assertEqual(["pokee-isaac"], snapshot["models"])
        self.assertIn("no balance", snapshot["note"])


class CostServerTests(unittest.TestCase):
    def test_costs_endpoint_requires_session(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            app = create_app(
                config_path=CONFIG_PATH,
                frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                state_dir=temp_dir,
            )
            with TestClient(app, base_url="http://127.0.0.1:9120") as anon:
                self.assertEqual(401, anon.get("/api/v1/costs").status_code)
            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                response = client.get("/api/v1/costs")
                self.assertEqual(200, response.status_code)
                payload = response.json()
                self.assertEqual(1, payload["schema_version"])
                self.assertIn("keys_handled", payload["privacy"])
                self.assertEqual(6, len(payload["providers"]))


if __name__ == "__main__":
    unittest.main()
