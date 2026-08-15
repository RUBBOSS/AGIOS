"""Tests for the local provider-key resolver."""

import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from agios.provider_keys import load_env_file, load_provider_keys


def _auth_json(pool: dict) -> str:
    return json.dumps(
        {
            "version": 1,
            "providers": {},
            "credential_pool": pool,
        }
    )


class ProviderKeyResolverTests(unittest.TestCase):
    def test_loads_api_key_entries_and_reports_metadata_without_values(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "auth.json"
            path.write_text(
                _auth_json(
                    {
                        "openrouter": [
                            {
                                "auth_type": "api_key",
                                "access_token": "sk-or-test-1234567890",
                                "last_status": "exhausted",
                                "last_error_code": 402,
                            }
                        ],
                        "deepseek": [
                            {
                                "auth_type": "api_key",
                                "access_token": "sk-deepseek-test",
                                "last_status": "available",
                                "last_error_code": None,
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )
            with mock.patch.dict("os.environ", {}, clear=False):
                os.environ.pop("OPENROUTER_API_KEY", None)
                os.environ.pop("DEEPSEEK_API_KEY", None)
                meta = load_provider_keys(auth_path=path)
            self.assertTrue(meta["openrouter"]["loaded"])
            self.assertEqual("exhausted", meta["openrouter"]["provider_last_status"])
            self.assertEqual(402, meta["openrouter"]["provider_last_error_code"])
            self.assertTrue(meta["deepseek"]["loaded"])
            self.assertNotIn("access_token", json.dumps(meta))

    def test_never_overwrites_an_explicitly_exported_key(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "auth.json"
            path.write_text(
                _auth_json(
                    {"openrouter": [{"auth_type": "api_key", "access_token": "sk-from-pool"}]}
                ),
                encoding="utf-8",
            )
            with mock.patch.dict("os.environ", {"OPENROUTER_API_KEY": "sk-explicit"}, clear=False):
                load_provider_keys(auth_path=path)
                self.assertEqual("sk-explicit", os.environ["OPENROUTER_API_KEY"])

    def test_ignores_oauth_entries_and_tolerates_missing_files(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "auth.json"
            path.write_text(
                _auth_json({"openrouter": [{"auth_type": "oauth", "access_token": "opaque"}]}),
                encoding="utf-8",
            )
            meta = load_provider_keys(auth_path=path)
            self.assertFalse(meta["openrouter"]["loaded"])
            self.assertEqual("not-an-api-key", meta["openrouter"]["reason"])
        with mock.patch.dict("os.environ", {}, clear=False):
            os.environ.pop("DEEPSEEK_API_KEY", None)
            os.environ.pop("OPENROUTER_API_KEY", None)
            os.environ.pop("POKEE_API_KEY", None)
            missing = load_provider_keys(
                auth_path=Path(temp_dir) / "nope.json",
                env_path=Path(temp_dir) / "nope.env",
            )
        self.assertEqual({}, missing)

    def test_env_file_loads_keys_without_overwriting_explicit_env(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / ".env.local"
            path.write_text(
                "# comment\n\nGEMINI_API_KEY=test-gemini\nINVALID KEY=skipme\nDEEPSEEK_API_KEY = test-deepseek\n",
                encoding="utf-8",
            )
            with mock.patch.dict("os.environ", {"GEMINI_API_KEY": "explicit-wins"}, clear=False):
                os.environ.pop("DEEPSEEK_API_KEY", None)
                loaded = load_env_file(env_path=path)
                self.assertEqual("explicit-wins", os.environ["GEMINI_API_KEY"])
                self.assertEqual("test-deepseek", os.environ["DEEPSEEK_API_KEY"])
                self.assertIn("DEEPSEEK_API_KEY", loaded)
                self.assertNotIn("INVALID KEY", loaded)


if __name__ == "__main__":
    unittest.main()
