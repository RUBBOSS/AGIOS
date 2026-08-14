from __future__ import annotations

import os
import shutil
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping


ExecutableFinder = Callable[[str], str | None]
OpenCodeAuthChecker = Callable[[], bool]


COMMAND_CANDIDATES: Mapping[str, tuple[str, ...]] = {
    "hermes": ("hermes", "hermes.exe"),
    "codex": ("codex", "codex.exe"),
    "gemini": ("gemini", "gemini.cmd"),
    "antigravity": ("antigravity", "antigravity.exe"),
    "ollama": ("ollama", "ollama.exe"),
    "opencode": ("opencode.cmd", "opencode"),
    "openclaw": ("openclaw", "openclaw.exe"),
    "cline": ("cline", "cline.cmd"),
    "pokee": ("pokee", "pokee.exe"),
}


def _find(candidates: Iterable[str], finder: ExecutableFinder) -> bool:
    return any(bool(finder(candidate)) for candidate in candidates)


def _opencode_auth_present() -> bool:
    """Check credential-container presence without reading or exposing its values."""

    data_root = Path(
        os.environ.get("XDG_DATA_HOME") or Path.home() / ".local" / "share"
    )
    candidate = data_root / "opencode" / "auth.json"
    try:
        return candidate.is_file() and not candidate.is_symlink() and candidate.stat().st_size > 2
    except OSError:
        return False


def collect_runtime_catalog(
    systems: Mapping[str, Mapping[str, Any]],
    *,
    executable_finder: ExecutableFinder = shutil.which,
    opencode_auth_checker: OpenCodeAuthChecker = _opencode_auth_present,
) -> list[dict[str, Any]]:
    """Return truthful, path-free runtime availability and adapter policy."""

    items: list[dict[str, Any]] = []
    for system_id, definition in systems.items():
        detected = _find(COMMAND_CANDIDATES.get(system_id, (system_id,)), executable_finder)
        declared = str(definition.get("status") or "planned")
        status = declared
        adapter = str(definition.get("adapter") or "planned")
        actions: list[str] = []
        approval = "not-executable"
        sandbox = "none"
        configured = False

        if system_id == "hermes" and detected:
            configured = True
            status = "live"
            adapter = "supervised-execution"
            actions = ["chat", "goal", "workspace-read", "workspace-write", "vision"]
            approval = "goal-and-sensitive-route"
            sandbox = "model-only-or-isolated-worktree"
        elif system_id == "codex" and detected:
            configured = True
            status = "live"
            adapter = "supervised-workspace"
            actions = ["workspace-read", "workspace-write", "vision"]
            approval = "exact-run"
            sandbox = "read-only-or-workspace-write"
        elif system_id == "opencode" and detected and opencode_auth_checker():
            configured = True
            status = "live"
            adapter = "supervised-workspace"
            actions = ["workspace-read", "workspace-write"]
            approval = "exact-run"
            sandbox = "deny-by-default-workspace-policy"
        elif system_id == "ollama" and detected:
            configured = True
            status = "live"
            adapter = "via-governed-model-route"
            actions = ["local-inference"]
            approval = "route-policy"
            sandbox = "runtime-route"
        elif system_id == "deepseek":
            configured = bool(os.environ.get("DEEPSEEK_API_KEY"))
            status = "routed" if configured else "unavailable"
            adapter = "via-hermes-or-codex-profile"
            actions = ["chat", "workspace-read", "workspace-write"] if configured else []
            approval = "data-class-and-exact-workspace-run"
            sandbox = "selected-runtime"
        elif system_id in {"glm", "kimi", "mistral", "openrouter"}:
            configured = bool(os.environ.get("OPENROUTER_API_KEY"))
            status = "routed" if configured else "unavailable"
            adapter = "via-hermes-openrouter"
            actions = ["chat"] if configured else []
            approval = "data-class-and-exact-run"
            sandbox = "selected-runtime"
        elif detected:
            status = "detected"
            adapter = "execution-locked"

        items.append(
            {
                "id": system_id,
                "name": str(definition.get("name") or system_id)[:120],
                "kind": str(definition.get("kind") or "runtime")[:80],
                "status": status,
                "adapter": adapter,
                "detected": detected,
                "configured": configured,
                "execution_enabled": bool(actions),
                "actions": actions,
                "approval": approval,
                "sandbox": sandbox,
            }
        )
    return items
