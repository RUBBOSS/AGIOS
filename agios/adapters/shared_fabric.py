from __future__ import annotations

import importlib.util
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from types import ModuleType
from typing import Any, Callable, Iterable, Mapping


SkillLoader = Callable[[], Iterable[Mapping[str, Any]]]
MemoryLoader = Callable[[], Mapping[str, Any]]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _text(value: Any, limit: int) -> str:
    return " ".join(str(value or "").split())[:limit]


def _load_live_skills() -> Iterable[Mapping[str, Any]]:
    from tools.skills_tool import _find_all_skills

    return _find_all_skills(skip_disabled=True)


def _load_main_os_module() -> ModuleType:
    root = Path(__file__).resolve().parents[2]
    source = root / "plugins" / "main-os" / "dashboard" / "plugin_api.py"
    spec = importlib.util.spec_from_file_location("agios_shared_memory_collector", source)
    if spec is None or spec.loader is None:
        raise RuntimeError("memory collector unavailable")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _load_live_memory() -> Mapping[str, Any]:
    module = _load_main_os_module()
    provider = module._configured_memory_provider()
    return module.collect_memory_provider(provider)


def collect_shared_fabric(
    *,
    skill_loader: SkillLoader | None = None,
    memory_loader: MemoryLoader | None = None,
) -> dict[str, Any]:
    """Collect safe live metadata for AGIOS-wide skills and memory.

    Skill bodies, memory facts, entity names, tags, paths and credentials never
    cross this boundary. Agents access those through separately governed runtime
    calls, not through the command-center browser response.
    """

    try:
        raw_skills = list((skill_loader or _load_live_skills)())
        skills = []
        for raw in raw_skills:
            if not isinstance(raw, Mapping):
                continue
            name = _text(raw.get("name"), 100)
            if not name:
                continue
            skills.append(
                {
                    "id": name,
                    "name": name,
                    "category": _text(raw.get("category"), 80) or "uncategorized",
                    "description": _text(raw.get("description"), 240),
                    "status": "available",
                    "sharing": "policy-authorized",
                }
            )
        skills.sort(key=lambda item: (item["category"], item["name"]))
        categories = dict(sorted(Counter(item["category"] for item in skills).items()))
        skill_status = "healthy"
    except (ImportError, OSError, RuntimeError, TypeError, ValueError):
        skills = []
        categories = {}
        skill_status = "unavailable"

    try:
        memory = dict((memory_loader or _load_live_memory)())
        raw_metrics = memory.get("metrics")
        metrics = raw_metrics if isinstance(raw_metrics, Mapping) else {}
        categories_value = metrics.get("categories")
        trust_value = metrics.get("trust")
        raw_categories = categories_value if isinstance(categories_value, Mapping) else {}
        raw_trust = trust_value if isinstance(trust_value, Mapping) else {}
        memory_snapshot = {
            "status": _text(memory.get("status"), 32) or "unavailable",
            "provider": _text(metrics.get("provider"), 48) or "unavailable",
            "fact_count": max(0, int(metrics.get("facts") or 0)),
            "entity_count": max(0, int(metrics.get("entities") or 0)),
            "categories": {
                key: max(0, int(raw_categories.get(key) or 0))
                for key in ("general", "user_pref", "project", "tool", "other")
            },
            "trust": {
                key: max(0, int(raw_trust.get(key) or 0))
                for key in ("high", "medium", "low")
            },
            "updated_at": _text(memory.get("updated_at"), 64) or None,
            "issue": _text(memory.get("issue"), 64) or None,
        }
    except (AttributeError, ImportError, OSError, RuntimeError, TypeError, ValueError):
        memory_snapshot = {
            "status": "unavailable",
            "provider": "unavailable",
            "fact_count": 0,
            "entity_count": 0,
            "categories": {},
            "trust": {},
            "updated_at": None,
            "issue": "collector_unavailable",
        }

    return {
        "schema_version": 1,
        "generated_at": _now(),
        "skills": {
            "status": skill_status,
            "sharing": "global_registry_with_policy",
            "inventory": len(skills),
            "categories": categories,
            "items": skills,
        },
        "memory": {
            **memory_snapshot,
            "availability": "always_on_service",
            "sharing": "scoped_live_fabric",
            "scopes": [
                {"id": "portfolio", "label": "Portfolio shared", "policy": "all-authorized-agents"},
                {"id": "business", "label": "Business", "policy": "assigned-business-agents"},
                {"id": "department", "label": "Department", "policy": "department-members"},
                {"id": "project", "label": "Project", "policy": "assigned-project-agents"},
                {"id": "private", "label": "Private", "policy": "explicit-grant"},
            ],
        },
        "privacy": {
            "skill_bodies_included": False,
            "memory_content_included": False,
            "paths_included": False,
            "credentials_model_readable": False,
        },
    }
