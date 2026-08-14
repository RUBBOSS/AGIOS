from __future__ import annotations

import tempfile
import unittest
import json
import zipfile
from pathlib import Path

from fastapi.testclient import TestClient

from agios.notebooklm import NotebookLMSourcePackService
from agios.server import create_app


ROOT = Path(__file__).resolve().parents[1]


class NotebookLMSourcePackTests(unittest.TestCase):
    def test_lists_only_markdown_sources_with_stable_relative_paths(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            vault = root / "vault"
            artifacts = root / "artifacts"
            vault.joinpath("Strategy").mkdir(parents=True)
            vault.joinpath("Strategy", "Goals.md").write_text("# Goals\n", encoding="utf-8")
            vault.joinpath("Brand Voice.md").write_text("# Voice\n", encoding="utf-8")
            vault.joinpath("ignore.txt").write_text("not a source", encoding="utf-8")
            vault.joinpath(".obsidian").mkdir()
            vault.joinpath(".obsidian", "internal.md").write_text("hidden", encoding="utf-8")

            service = NotebookLMSourcePackService(vault_root=vault, artifact_root=artifacts)

            self.assertEqual(
                ["Brand Voice.md", "Strategy/Goals.md"],
                [item["path"] for item in service.list_sources()],
            )
            self.assertTrue(all(item["sha256"] for item in service.list_sources()))
            self.assertTrue(all("body" not in item for item in service.list_sources()))

    def test_prepares_a_local_pack_only_after_owner_acknowledges_external_upload(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            vault = root / "vault"
            artifacts = root / "artifacts"
            vault.mkdir()
            vault.joinpath("Goals.md").write_text("# Goals\nBuild safely.\n", encoding="utf-8")
            service = NotebookLMSourcePackService(vault_root=vault, artifact_root=artifacts)

            with self.assertRaisesRegex(ValueError, "acknowledgement"):
                service.prepare_pack(
                    title="AGIOS core context",
                    source_paths=["Goals.md"],
                    external_upload_acknowledged=False,
                )

            pack = service.prepare_pack(
                title="AGIOS core context",
                source_paths=["Goals.md"],
                external_upload_acknowledged=True,
            )

            archive = Path(pack["archive_path"])
            self.assertTrue(archive.is_file())
            self.assertFalse(pack["uploaded"])
            self.assertEqual("owner-mediated", pack["upload_mode"])
            with zipfile.ZipFile(archive) as bundle:
                self.assertEqual(["Goals.md", "manifest.json"], sorted(bundle.namelist()))
                manifest = json.loads(bundle.read("manifest.json"))
                self.assertEqual("https://notebooklm.google.com/", manifest["destination"])
                self.assertEqual("Goals.md", manifest["sources"][0]["path"])
                self.assertEqual(vault.joinpath("Goals.md").read_bytes(), bundle.read("Goals.md"))

    def test_blocks_credential_like_content_without_exposing_the_value(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            vault = root / "vault"
            vault.mkdir()
            secret = "sk-proj-abcdefghijklmnopqrstuvwxyz0123456789"
            vault.joinpath("Unsafe.md").write_text(
                f"# Do not export\nAPI key: {secret}\n", encoding="utf-8"
            )
            service = NotebookLMSourcePackService(
                vault_root=vault,
                artifact_root=root / "artifacts",
            )

            source = service.list_sources()[0]
            self.assertTrue(source["blocked"])
            self.assertNotIn(secret, json.dumps(source))
            with self.assertRaisesRegex(ValueError, "credential-like"):
                service.prepare_pack(
                    title="Unsafe",
                    source_paths=["Unsafe.md"],
                    external_upload_acknowledged=True,
                )

    def test_excludes_symlinks_and_oversized_sources_from_the_export_boundary(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            vault = root / "vault"
            vault.mkdir()
            outside = root / "outside.md"
            outside.write_text("# Private outside the approved vault\n", encoding="utf-8")
            linked = vault / "Linked.md"
            try:
                linked.symlink_to(outside)
            except OSError:
                pass
            vault.joinpath("Huge.md").write_bytes(b"x" * (2 * 1024 * 1024 + 1))
            service = NotebookLMSourcePackService(
                vault_root=vault,
                artifact_root=root / "artifacts",
            )

            self.assertEqual([], service.list_sources())

    def test_rejects_source_drift_between_selection_and_archive_write(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            vault = root / "vault"
            vault.mkdir()
            source = vault / "Goals.md"
            source.write_text("# Approved goals\n", encoding="utf-8")
            service = NotebookLMSourcePackService(
                vault_root=vault,
                artifact_root=root / "artifacts",
            )
            approved_catalog = service.list_sources()
            source.write_text("# Changed after review\n", encoding="utf-8")
            service.list_sources = lambda: approved_catalog

            with self.assertRaisesRegex(ValueError, "changed during preparation"):
                service.prepare_pack(
                    title="Drifted",
                    source_paths=["Goals.md"],
                    external_upload_acknowledged=True,
                )

    def test_api_prepares_and_downloads_a_pack_without_uploading_it(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            vault = root / "vault"
            vault.mkdir()
            vault.joinpath("Goals.md").write_text("# Goals\n", encoding="utf-8")
            service = NotebookLMSourcePackService(
                vault_root=vault,
                artifact_root=root / "artifacts",
            )
            app = create_app(
                config_path=ROOT / "configs" / "agios.json",
                frontend_path=ROOT / "apps" / "agios-command-center" / "dist",
                state_dir=root / "state",
                notebooklm_service=service,
            )

            with TestClient(app, base_url="http://127.0.0.1:9120") as client:
                client.get("/")
                sources = client.get("/api/v1/notebooklm/sources")
                self.assertEqual(200, sources.status_code)
                self.assertEqual("personal", sources.json()["account_mode"])
                self.assertFalse(sources.json()["automatic_upload"])
                self.assertNotIn(str(vault), sources.text)

                response = client.post(
                    "/api/v1/notebooklm/packs",
                    headers={"X-AGIOS-CSRF": client.cookies.get("agios_csrf")},
                    json={
                        "title": "Core context",
                        "source_paths": ["Goals.md"],
                        "external_upload_acknowledged": True,
                    },
                )
                self.assertEqual(200, response.status_code)
                pack = response.json()["pack"]
                self.assertNotIn("archive_path", pack)
                self.assertFalse(pack["uploaded"])
                download = client.get(pack["download_url"])
                self.assertEqual(200, download.status_code)
                self.assertEqual("application/zip", download.headers["content-type"])


if __name__ == "__main__":
    unittest.main()
