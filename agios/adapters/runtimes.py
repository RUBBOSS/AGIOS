from __future__ import annotations

import os
import shutil
from typing import Any, Callable, Iterable, Mapping


ExecutableFinder = Callable[[str], str | None]


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


def collect_runtime_catalog(
    systems: Mapping[str, Mapping[str, Any]],
    *,
    executable_finder: ExecutableFinder = shutil.which,
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
