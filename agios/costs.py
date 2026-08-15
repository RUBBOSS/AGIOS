"""Live provider cost adapter: real balances and usage, never fabricated.

Sources (GET-only, vendor-reported):
  - OpenRouter  GET https://openrouter.ai/api/v1/auth/key  (Authorization header)
  - DeepSeek    GET https://api.deepseek.com/user/balance  (Authorization header)

Keys come ONLY from the environment (OPENROUTER_API_KEY, DEEPSEEK_API_KEY).
Keys are never stored, logged, or returned. Results are cached for 300 s so
the UI never hammers provider APIs. A provider without a key is honestly
"not-configured"; a failing provider call is "error" with a bounded reason.
"""

from __future__ import annotations

import json
import os
import threading
import time
import urllib.error
import urllib.request
from typing import Any, Mapping

from .contracts import utc_now

SCHEMA_VERSION = 1
CACHE_SECONDS = 300
REQUEST_TIMEOUT = 10


class _Cache:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._value: dict[str, Any] | None = None
        self._at = 0.0

    def get(self) -> dict[str, Any] | None:
        with self._lock:
            if self._value is not None and time.monotonic() - self._at < CACHE_SECONDS:
                return self._value
            return None

    def put(self, value: dict[str, Any]) -> None:
        with self._lock:
            self._value = value
            self._at = time.monotonic()


_cache = _Cache()


def _get(url: str, key: str) -> Mapping[str, Any]:
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {key}",
            "Accept": "application/json",
            "User-Agent": "AGIOS/0.5 (local operator)",
        },
    )
    with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT) as response:
        body = response.read(64_000).decode("utf-8", errors="replace")
        payload = json.loads(body)
    if not isinstance(payload, dict):
        raise ValueError("provider returned a non-object payload")
    return payload


def _openrouter_snapshot() -> dict[str, Any]:
    key = os.environ.get("OPENROUTER_API_KEY")
    if not key:
        return {
            "id": "openrouter",
            "label": "OpenRouter (GLM · Kimi · Mistral)",
            "status": "not-configured",
            "reason": "Set OPENROUTER_API_KEY as a Windows user environment variable and restart AGIOS.",
        }
    try:
        payload = _get("https://openrouter.ai/api/v1/auth/key", key)
    except (urllib.error.URLError, OSError, ValueError, json.JSONDecodeError) as exc:
        return {
            "id": "openrouter",
            "label": "OpenRouter (GLM · Kimi · Mistral)",
            "status": "error",
            "reason": "provider call failed",
            "detail": str(exc)[:160],
        }
    usage_cents = payload.get("usage")
    limit_cents = payload.get("limit")
    snapshot: dict[str, Any] = {
        "id": "openrouter",
        "label": "OpenRouter (GLM · Kimi · Mistral)",
        "status": "reported",
        "currency": "USD",
        "label_key": str(payload.get("label"))[:120] if payload.get("label") else None,
    }
    if isinstance(usage_cents, (int, float)):
        snapshot["usage_30d"] = round(float(usage_cents) / 100, 2)
    if isinstance(limit_cents, (int, float)):
        snapshot["limit"] = round(float(limit_cents) / 100, 2)
        if "usage_30d" in snapshot:
            snapshot["remaining"] = round(float(limit_cents) / 100 - float(usage_cents) / 100, 2)
    if payload.get("is_free_tier") is True:
        snapshot["tier"] = "free"
    snapshot["note"] = "vendor-reported; usage is USD cents divided by 100"
    return snapshot


def _deepseek_snapshot() -> dict[str, Any]:
    key = os.environ.get("DEEPSEEK_API_KEY")
    if not key:
        return {
            "id": "deepseek",
            "label": "DeepSeek (V4 Pro · V4 Flash)",
            "status": "not-configured",
            "reason": "Set DEEPSEEK_API_KEY as a Windows user environment variable and restart AGIOS.",
        }
    try:
        payload = _get("https://api.deepseek.com/user/balance", key)
    except (urllib.error.URLError, OSError, ValueError, json.JSONDecodeError) as exc:
        return {
            "id": "deepseek",
            "label": "DeepSeek (V4 Pro · V4 Flash)",
            "status": "error",
            "reason": "provider call failed",
            "detail": str(exc)[:160],
        }
    infos = payload.get("balance_infos") if isinstance(payload.get("balance_infos"), list) else []
    balances: list[dict[str, Any]] = []
    for info in infos[:8]:
        if not isinstance(info, dict):
            continue
        row: dict[str, Any] = {}
        for field in ("currency", "total_balance", "granted_balance", "topped_up_balance"):
            if field in info:
                row[field] = info[field]
        balances.append(row)
    snapshot: dict[str, Any] = {
        "id": "deepseek",
        "label": "DeepSeek (V4 Pro · V4 Flash)",
        "status": "reported" if balances else "reported-empty",
        "available": bool(payload.get("is_available")),
        "balances": balances,
        "note": "vendor-reported account balance; no usage timeline is exposed by this endpoint",
    }
    return snapshot


def _gemini_snapshot() -> dict[str, Any]:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return {
            "id": "gemini",
            "label": "Gemini API (AI Studio)",
            "status": "not-configured",
            "reason": "Set GEMINI_API_KEY in the local .env.local file and restart AGIOS.",
        }
    request = urllib.request.Request(
        "https://generativelanguage.googleapis.com/v1beta/models?pageSize=1",
        headers={
            "x-goog-api-key": key,
            "Accept": "application/json",
            "User-Agent": "AGIOS/0.5 (local operator)",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT) as response:
            payload = json.loads(response.read(64_000).decode("utf-8", errors="replace"))
        if not isinstance(payload, dict):
            raise ValueError("provider returned a non-object payload")
    except (urllib.error.URLError, OSError, ValueError, json.JSONDecodeError) as exc:
        return {
            "id": "gemini",
            "label": "Gemini API (AI Studio)",
            "status": "error",
            "reason": "key check failed",
            "detail": str(exc)[:160],
        }
    return {
        "id": "gemini",
        "label": "Gemini API (AI Studio)",
        "status": "reported-empty",
        "tier": "free",
        "note": "key verified via the models endpoint; Gemini exposes no balance or usage endpoint, so no figures are shown",
    }


def _pokee_snapshot() -> dict[str, Any]:
    key = os.environ.get("POKEE_API_KEY")
    if not key:
        return {
            "id": "pokee",
            "label": "Pokee (pokee-isaac)",
            "status": "not-configured",
            "reason": "Set POKEE_API_KEY in the local .env.local file and restart AGIOS.",
        }
    request = urllib.request.Request(
        "https://api.pokee.ai/v1/models",
        headers={
            "Authorization": f"Bearer {key}",
            "Accept": "application/json",
            "User-Agent": "AGIOS/0.5 (local operator)",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT) as response:
            payload = json.loads(response.read(64_000).decode("utf-8", errors="replace"))
        if not isinstance(payload, dict):
            raise ValueError("provider returned a non-object payload")
    except (urllib.error.URLError, OSError, ValueError, json.JSONDecodeError) as exc:
        return {
            "id": "pokee",
            "label": "Pokee (pokee-isaac)",
            "status": "error",
            "reason": "key check failed",
            "detail": str(exc)[:160],
        }
    models = [str(item.get("id")) for item in payload.get("data", []) if isinstance(item, dict)][:8]
    return {
        "id": "pokee",
        "label": "Pokee (pokee-isaac)",
        "status": "reported-empty",
        "models": models,
        "note": "key verified via /v1/models; Pokee exposes no balance endpoint, so no figures are shown",
    }


def _codex_snapshot() -> dict[str, Any]:
    return {
        "id": "codex",
        "label": "Codex / gpt-5.6 family",
        "status": "not-wired",
        "reason": "OpenAI does not expose billing usage without an org-admin key; AGIOS will not guess.",
    }


def _local_snapshot() -> dict[str, Any]:
    return {
        "id": "local",
        "label": "Local models (Qwen · Ornith · embeddings)",
        "status": "reported",
        "currency": "USD",
        "usage_30d": 0.0,
        "remaining": None,
        "note": "compute-only: local inference has no per-token API cost",
    }


def build_cost_snapshot(force: bool = False) -> dict[str, Any]:
    cached = None if force else _cache.get()
    if cached is not None:
        return cached

    providers = [
        _openrouter_snapshot(),
        _deepseek_snapshot(),
        _gemini_snapshot(),
        _pokee_snapshot(),
        _codex_snapshot(),
        _local_snapshot(),
    ]
    reported = [p for p in providers if p["status"] in {"reported", "reported-empty"}]
    usage_total = sum(
        float(p["usage_30d"]) for p in reported if isinstance(p.get("usage_30d"), (int, float))
    )
    snapshot = {
        "schema_version": SCHEMA_VERSION,
        "generated_at": utc_now(),
        "privacy": {
            "synthetic": False,
            "keys_handled": "environment only; never stored, logged, or returned",
            "sources": [
                "OpenRouter auth/key endpoint",
                "DeepSeek balance endpoint",
                "Gemini models endpoint (key check only)",
                "Pokee models endpoint (key check only)",
            ],
        },
        "providers": providers,
        "total": {
            "reported_usage_usd": round(usage_total, 2),
            "reported": bool(reported),
            "note": "Sum of vendor-reported provider figures only; unreported providers stay invisible instead of zero.",
        },
    }
    _cache.put(snapshot)
    return snapshot
