from __future__ import annotations

import hashlib
import json
import re
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


MAX_SOURCE_BYTES = 2 * 1024 * 1024
MAX_PACK_BYTES = 20 * 1024 * 1024
MAX_PACK_SOURCES = 50


class NotebookLMSourcePackService:
    """Builds local source packs for owner-mediated NotebookLM uploads."""

    def __init__(self, *, vault_root: str | Path, artifact_root: str | Path) -> None:
        self.vault_root = Path(vault_root).expanduser().resolve()
        self.artifact_root = Path(artifact_root).expanduser().resolve()

    @staticmethod
    def _credential_like(content: bytes) -> bool:
        text = content.decode("utf-8", errors="ignore")
        patterns = (
            r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
            r"\bsk-[A-Za-z0-9_-]{20,}\b",
            r"\bgh[pousr]_[A-Za-z0-9]{20,}\b",
            r"\bAKIA[0-9A-Z]{16}\b",
            r"\bAIza[0-9A-Za-z_-]{30,}\b",
            r"(?im)^\s*(?:api[_ -]?key|password|secret|token)\s*[:=]\s*[\"']?[A-Za-z0-9/+=_.-]{16,}",
        )
        return any(re.search(pattern, text) for pattern in patterns)

    def list_sources(self) -> list[dict[str, Any]]:
        if not self.vault_root.is_dir():
            return []
        items: list[dict[str, Any]] = []
        for path in self.vault_root.rglob("*.md"):
            if path.is_symlink() or not path.is_file():
                continue
            try:
                resolved = path.resolve(strict=True)
            except OSError:
                continue
            if not resolved.is_relative_to(self.vault_root):
                continue
            relative = path.relative_to(self.vault_root)
            if any(part.startswith(".") for part in relative.parts):
                continue
            size = path.stat().st_size
            if size > MAX_SOURCE_BYTES:
                continue
            content = path.read_bytes()
            blocked = self._credential_like(content)
            items.append(
                {
                    "path": relative.as_posix(),
                    "title": path.stem,
                    "bytes": size,
                    "sha256": hashlib.sha256(content).hexdigest(),
                    "blocked": blocked,
                    "blocked_reason": "credential-like content" if blocked else None,
                    "modified_at": datetime.fromtimestamp(
                        path.stat().st_mtime, tz=timezone.utc
                    ).isoformat(),
                }
            )
        return sorted(items, key=lambda item: str(item["path"]).casefold())

    def prepare_pack(
        self,
        *,
        title: str,
        source_paths: list[str],
        external_upload_acknowledged: bool,
    ) -> dict[str, Any]:
        if not external_upload_acknowledged:
            raise ValueError("external upload acknowledgement is required")
        selected_title = title.strip()
        if not selected_title or len(selected_title) > 160:
            raise ValueError("source pack title must contain 1 to 160 characters")
        selected = {item["path"]: item for item in self.list_sources()}
        sources: list[dict[str, Any]] = []
        archive_entries: list[tuple[dict[str, Any], bytes]] = []
        for relative_path in tuple(dict.fromkeys(source_paths)):
            source = selected.get(relative_path)
            if source is None:
                raise ValueError(f"source is not available: {relative_path}")
            if source["blocked"]:
                raise ValueError(f"credential-like content blocks export: {relative_path}")
            sources.append(source)
            if len(sources) > MAX_PACK_SOURCES:
                raise ValueError("source pack exceeds the 50-source limit")
            if sum(int(item["bytes"]) for item in sources) > MAX_PACK_BYTES:
                raise ValueError("source pack exceeds the 20 MB local export limit")
            source_path = self.vault_root / relative_path
            try:
                if source_path.is_symlink():
                    raise ValueError(f"source changed during preparation: {relative_path}")
                resolved = source_path.resolve(strict=True)
                if not resolved.is_relative_to(self.vault_root):
                    raise ValueError(f"source changed during preparation: {relative_path}")
                content = resolved.read_bytes()
            except OSError as exc:
                raise ValueError(f"source changed during preparation: {relative_path}") from exc
            if (
                len(content) != int(source["bytes"])
                or hashlib.sha256(content).hexdigest() != source["sha256"]
                or self._credential_like(content)
            ):
                raise ValueError(f"source changed during preparation: {relative_path}")
            archive_entries.append((source, content))
        if not sources:
            raise ValueError("at least one source is required")

        pack_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        packs_dir = self.artifact_root / "notebooklm"
        packs_dir.mkdir(parents=True, exist_ok=True)
        archive_path = packs_dir / f"{pack_id}.zip"
        manifest = {
            "schema_version": 1,
            "pack_id": pack_id,
            "title": selected_title,
            "created_at": created_at,
            "destination": "https://notebooklm.google.com/",
            "upload_mode": "owner-mediated",
            "uploaded": False,
            "sources": sources,
        }
        with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
            for source, content in archive_entries:
                bundle.writestr(source["path"], content)
            bundle.writestr("manifest.json", json.dumps(manifest, indent=2, ensure_ascii=False))
        return {**manifest, "archive_path": str(archive_path)}

    def archive_for(self, pack_id: str) -> Path:
        try:
            normalized = str(uuid.UUID(pack_id))
        except ValueError as exc:
            raise ValueError("invalid NotebookLM pack id") from exc
        archive = (self.artifact_root / "notebooklm" / f"{normalized}.zip").resolve()
        if not archive.is_relative_to(self.artifact_root) or not archive.is_file():
            raise ValueError("NotebookLM pack not found")
        return archive
