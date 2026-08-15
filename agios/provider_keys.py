"""Local provider-key resolver for AGIOS.

AGIOS runs on the owner's own machine next to Hermes. Provider API keys the
owner has already authorized for Hermes live in Hermes' local credential pool
(~/.local/share equivalent: %LOCALAPPDATA%/hermes/auth.json). This module
loads only those API-key entries into the AGIOS process environment so that
vendor adapters (costs, image studio) can call the same authorized routes.

Safety rules:
  - Values are loaded into os.environ with setdefault: never overwrite an
    explicitly exported environment variable.
  - Values are never logged, returned, journaled, or written anywhere.
  - Only auth_type == "api_key" entries are read; OAuth tokens are ignored.
  - A missing or unreadable auth file is tolerated (returns empty metadata).
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

# Hermes credential-pool name -> AGIOS environment variable.
_POOL_TO_ENV: dict[str, str] = {
    "openrouter": "OPENROUTER_API_KEY",
    "deepseek": "DEEPSEEK_API_KEY",
    "pokee": "POKEE_API_KEY",
}


def _hermes_auth_path() -> Path:
    local_appdata = os.environ.get("LOCALAPPDATA") or str(Path.home() / "AppData" / "Local")
    return Path(local_appdata) / "hermes" / "auth.json"


def _agios_env_path() -> Path:
    return Path(__file__).resolve().parents[1] / ".env.local"


def load_env_file(env_path: str | Path | None = None) -> dict[str, str]:
    """Load KEY=VALUE lines from the AGIOS local secrets file into env.

    Values use setdefault: an explicitly exported environment variable always
    wins. Returns the loaded variable names only, never values.
    """
    path = Path(env_path) if env_path else _agios_env_path()
    loaded: dict[str, str] = {}
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return loaded
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if "=" not in stripped:
            continue
        name, _, value = stripped.partition("=")
        name = name.strip()
        if not name or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", name):
            continue
        os.environ.setdefault(name, value.strip())
        loaded[name] = name
    return loaded


def load_provider_keys(
    auth_path: str | Path | None = None,
    env_path: str | Path | None = None,
) -> dict[str, dict[str, Any]]:
    """Load authorized API keys from Hermes' local credential pool into env.

    Returns metadata (provider name, loaded flag, provider-reported status)
    without any secret values.
    """
    path = Path(auth_path) if auth_path else _hermes_auth_path()
    meta: dict[str, dict[str, Any]] = {}
    load_env_file(env_path=env_path)
    for pool_name, env_name in _POOL_TO_ENV.items():
        if os.environ.get(env_name):
            meta.setdefault(pool_name, {"loaded": True, "source": "agios-env"})
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, json.JSONDecodeError):
        return meta
    pool = raw.get("credential_pool") if isinstance(raw, dict) else None
    if not isinstance(pool, dict):
        return meta
    for pool_name, env_name in _POOL_TO_ENV.items():
        entries = pool.get(pool_name)
        if not isinstance(entries, list) or not entries:
            meta[pool_name] = {"loaded": False, "reason": "no-credential"}
            continue
        entry = entries[0] if isinstance(entries[0], dict) else {}
        token = entry.get("access_token") if entry.get("auth_type") == "api_key" else None
        if not token or not isinstance(token, str) or len(token) < 8:
            meta[pool_name] = {"loaded": False, "reason": "not-an-api-key"}
            continue
        os.environ.setdefault(env_name, token)
        meta[pool_name] = {
            "loaded": True,
            "provider_last_status": entry.get("last_status") or "unknown",
            "provider_last_error_code": entry.get("last_error_code"),
        }
    return meta
