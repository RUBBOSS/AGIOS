"""AGIOS Image Studio — governed image generation via OpenRouter.

Uses the OpenRouter Images API (OpenAI-compatible) with Microsoft
MAI-Image-2.5. Every generation is an explicit owner action: the owner types
the prompt and clicks Generate, so the external call is inherently approved.
Outputs are stored locally with provenance (SHA-256 + metadata); nothing is
uploaded anywhere else.

Honesty rules (AGIOS):
  - The model, endpoint and listed pricing are vendor-reported constants.
  - Provider errors are classified (invalid key, credits exhausted, rate
    limit, provider error) and surfaced without raw response bodies.
  - API key presence is reported, never the value.
  - Usage data is recorded only when the provider returns it.
"""

from __future__ import annotations

import base64
import binascii
import hashlib
import json
import os
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path
from typing import Any

MODEL = "microsoft/mai-image-2.5"
IMAGES_ENDPOINT = "https://openrouter.ai/api/v1/images"
VENDOR_LISTED_PRICE = "$5.00/M image tokens (OpenRouter model page, listed price)"
ASPECT_RATIOS: tuple[str, ...] = ("1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3")
MAX_PROMPT_CHARS = 4000
REQUEST_TIMEOUT_SECONDS = 150
ARTIFACT_PREFIX = "agios-image"


class ImageStudioError(Exception):
    """Classified provider failure, safe to show to the owner."""


class ImageStudioService:
    def __init__(self, artifact_root: Path) -> None:
        self.artifact_root = Path(artifact_root) / "image-studio"
        self.artifact_root.mkdir(parents=True, exist_ok=True)

    # ── status ──────────────────────────────────────────────────────────────
    def status(self, pool_meta: dict[str, Any] | None = None) -> dict[str, object]:
        key_state = "configured" if os.environ.get("OPENROUTER_API_KEY") else "missing"
        meta = (pool_meta or {}).get("openrouter", {})
        return {
            "schema_version": 1,
            "status": "ready" if key_state == "configured" else "key-missing",
            "model": MODEL,
            "endpoint": IMAGES_ENDPOINT,
            "aspect_ratios": list(ASPECT_RATIOS),
            "key_state": key_state,
            "provider_last_status": meta.get("provider_last_status") or "unknown",
            "provider_last_error_code": meta.get("provider_last_error_code"),
            "vendor_listed_price": VENDOR_LISTED_PRICE,
            "cost_note": "OpenRouter returns no per-image cost in the Images response; only provider-returned usage is recorded.",
            "recent": self.recent(limit=12),
        }

    # ── generate ────────────────────────────────────────────────────────────
    def generate(self, prompt: str, aspect_ratio: str = "16:9") -> dict[str, object]:
        prompt = (prompt or "").strip()
        if not prompt:
            raise ValueError("prompt is required")
        if len(prompt) > MAX_PROMPT_CHARS:
            raise ValueError(f"prompt exceeds {MAX_PROMPT_CHARS} characters")
        if aspect_ratio not in ASPECT_RATIOS:
            raise ValueError(f"aspect_ratio must be one of {', '.join(ASPECT_RATIOS)}")
        key = os.environ.get("OPENROUTER_API_KEY")
        if not key:
            raise ImageStudioError("OpenRouter API key is not configured on this machine")
        payload = json.dumps(
            {
                "model": MODEL,
                "prompt": prompt,
                "n": 1,
                "aspect_ratio": aspect_ratio,
            }
        ).encode("utf-8")
        request = urllib.request.Request(
            IMAGES_ENDPOINT,
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://127.0.0.1:9120/",
                "X-Title": "AGIOS",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
                body = response.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as exc:
            raise self._classify(exc.code, exc.read()[:200]) from exc
        except (urllib.error.URLError, OSError) as exc:
            raise ImageStudioError("provider unreachable; check network and try again") from exc
        try:
            result = json.loads(body)
            images = result.get("data") or []
            b64 = images[0].get("b64_json")
            usage = result.get("usage")
        except (ValueError, IndexError, AttributeError, TypeError) as exc:
            raise ImageStudioError("provider returned an unexpected response shape") from exc
        if not b64:
            raise ImageStudioError("provider returned no image data")
        try:
            image_bytes = base64.b64decode(b64)
        except (ValueError, binascii.Error) as exc:
            raise ImageStudioError("provider image data was not valid base64") from exc
        return self._persist(prompt, aspect_ratio, image_bytes, usage)

    @staticmethod
    def _classify(code: int, body: bytes) -> ImageStudioError:
        if code == 401:
            return ImageStudioError("OpenRouter rejected the API key (401)")
        if code == 402:
            return ImageStudioError("OpenRouter credits exhausted (402); top up at openrouter.ai/settings/credits")
        if code == 429:
            return ImageStudioError("OpenRouter rate limit reached (429); wait a moment and retry")
        return ImageStudioError(f"OpenRouter generation failed (HTTP {code})")

    def _persist(
        self, prompt: str, aspect_ratio: str, image_bytes: bytes, usage: Any
    ) -> dict[str, object]:
        artifact_id = str(uuid.uuid4())
        png_path = self.artifact_root / f"{artifact_id}.png"
        png_path.write_bytes(image_bytes)
        digest = hashlib.sha256(image_bytes).hexdigest()
        metadata = {
            "artifact_id": artifact_id,
            "model": MODEL,
            "prompt": prompt,
            "aspect_ratio": aspect_ratio,
            "sha256": digest,
            "bytes": len(image_bytes),
            "created_at": time.time(),
            "usage": usage if isinstance(usage, dict) else None,
            "cost_note": VENDOR_LISTED_PRICE,
        }
        (self.artifact_root / f"{artifact_id}.json").write_text(
            json.dumps(metadata, indent=2), encoding="utf-8"
        )
        return {
            "artifact_id": artifact_id,
            "model": MODEL,
            "aspect_ratio": aspect_ratio,
            "sha256": digest,
            "bytes": len(image_bytes),
            "created_at": metadata["created_at"],
            "usage": metadata["usage"],
            "image_url": f"/api/v1/image-studio/artifacts/{artifact_id}.png",
        }

    # ── artifacts ───────────────────────────────────────────────────────────
    def recent(self, limit: int = 12) -> list[dict[str, object]]:
        records: list[dict[str, object]] = []
        for meta_path in self.artifact_root.glob("*.json"):
            try:
                record = json.loads(meta_path.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                continue
            records.append(
                {
                    "artifact_id": record.get("artifact_id"),
                    "aspect_ratio": record.get("aspect_ratio"),
                    "prompt": str(record.get("prompt", ""))[:200],
                    "sha256": record.get("sha256"),
                    "bytes": record.get("bytes"),
                    "created_at": record.get("created_at"),
                    "usage": record.get("usage"),
                    "image_url": f"/api/v1/image-studio/artifacts/{record.get('artifact_id')}.png"
                    if record.get("artifact_id")
                    else None,
                }
            )
        records.sort(key=lambda item: item.get("created_at") or 0, reverse=True)
        return records[:limit]

    def artifact_file(self, artifact_id: str) -> Path:
        if not artifact_id or not artifact_id.replace("-", "").isalnum():
            raise ValueError("invalid artifact id")
        path = self.artifact_root / f"{artifact_id}.png"
        if not path.is_file():
            raise ValueError("artifact not found")
        return path
