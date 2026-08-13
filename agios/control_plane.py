from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json
from typing import Any, Mapping

from .adapters.hermes import collect_hermes_snapshot
from .adapters.shared_fabric import collect_shared_fabric
from .adapters.runtimes import collect_runtime_catalog
from .config import AGIOSConfig, load_config
from .events import EventStoreError, read_journal_summary


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _record(record_id: str, value: Mapping[str, Any]) -> dict[str, Any]:
    return {"id": record_id, **dict(value)}


def _agent_state(profile: Mapping[str, Any] | None) -> str:
    if profile is None:
        return "unavailable"
    if profile.get("gateway_running"):
        return "online"
    return "ready"


def _journal_snapshot(path: str | Path | None) -> dict[str, Any]:
    if path is None:
        return {
            "status": "not_configured",
            "event_count": 0,
            "task_count": 0,
            "pending_approval_count": 0,
            "last_event_at": None,
        }
    try:
        return dict(read_journal_summary(path))
    except (OSError, ValueError, EventStoreError):
        return {
            "status": "unavailable",
            "event_count": 0,
            "task_count": 0,
            "pending_approval_count": 0,
            "last_event_at": None,
        }


def _repository_registry(config: AGIOSConfig) -> list[dict[str, Any]]:
    registry_path = config.path.parents[1] / "modules" / "registry.json"
    try:
        raw = json.loads(registry_path.read_text(encoding="utf-8"))
        modules = raw.get("modules") if isinstance(raw, dict) else None
        if not isinstance(modules, list):
            return []
        return [
            {
                "id": str(item.get("id") or "")[:100],
                "name": str(item.get("name") or "")[:160],
                "status": str(item.get("status") or "unknown")[:40],
                "owner_agent_id": str(item.get("owner_profile") or "")[:80],
                "visibility": "private_business" if item.get("id") == "freelance-agency" else "internal",
                "external_actions": str(item.get("external_actions") or "explicit-user-approval")[:80],
            }
            for item in modules
            if isinstance(item, dict) and item.get("id") and item.get("name")
        ]
    except (OSError, UnicodeError, json.JSONDecodeError):
        return []


def build_command_center(
    config: AGIOSConfig | str | Path,
    *,
    hermes_snapshot: Mapping[str, Any] | None = None,
    journal_path: str | Path | None = None,
) -> dict[str, Any]:
    selected = load_config(config) if isinstance(config, (str, Path)) else config
    hermes = dict(hermes_snapshot or collect_hermes_snapshot())
    fabric = collect_shared_fabric()
    profile_items = hermes.get("profiles", {}).get("items", [])
    profiles = {
        str(item.get("id")): item
        for item in profile_items
        if isinstance(item, Mapping) and item.get("id")
    }

    agents = []
    for agent_id, definition in selected.agents.items():
        profile = profiles.get(agent_id)
        agents.append(
            {
                **_record(agent_id, definition),
                "state": _agent_state(profile),
                "provider": profile.get("provider") if profile else None,
                "model": profile.get("model") if profile else None,
                "description": profile.get("description") if profile else None,
                "skill_count": profile.get("skill_count") if profile else None,
                "gateway_running": bool(profile and profile.get("gateway_running")),
                "wake_policy": "event_or_schedule",
            }
        )

    departments = []
    for department_id, definition in selected.departments.items():
        member_states = [agent["state"] for agent in agents if agent["id"] in definition["agent_ids"]]
        departments.append(
            {
                **_record(department_id, definition),
                "ready_agents": sum(state in {"ready", "online"} for state in member_states),
                "agent_count": len(member_states),
            }
        )

    businesses = []
    for business_id, definition in selected.businesses.items():
        businesses.append(
            {
                **_record(business_id, definition),
                "department_count": len(definition["department_ids"]),
                "operational": definition.get("status") in {"active", "setup"},
            }
        )

    integrations = [_record(item_id, value) for item_id, value in selected.integrations.items()]
    models = [_record(item_id, value) for item_id, value in selected.models.items()]
    systems = [_record(item_id, value) for item_id, value in selected.systems.items()]
    runtime_status = {
        item["id"]: item for item in collect_runtime_catalog(selected.systems)
    }
    for system in systems:
        system.update(runtime_status.get(system["id"], {}))
        if system["id"] == "hermes" and hermes.get("status") != "healthy":
            system["status"] = "unavailable"
        system["shared_skills"] = "skills" in system.get("capabilities", [])
        system["shared_memory"] = "memory" in system.get("capabilities", [])
    repositories = _repository_registry(selected)
    techniques = []
    for department in departments:
        for bundle in department.get("skill_bundles", []):
            if not any(item["id"] == bundle for item in techniques):
                techniques.append(
                    {
                        "id": bundle,
                        "name": str(bundle).replace("-", " ").title(),
                        "department_ids": [department["id"]],
                        "status": "available",
                    }
                )
            else:
                next(item for item in techniques if item["id"] == bundle)["department_ids"].append(department["id"])
    schedules = list(hermes.get("schedules", {}).get("items", []))
    journal = _journal_snapshot(journal_path)
    connected = sum(item.get("status") == "connected" for item in integrations)
    available_agents = sum(agent["state"] in {"ready", "online"} for agent in agents)
    skill_assignments = sum(int(agent.get("skill_count") or 0) for agent in agents)

    return {
        "schema_version": 1,
        "generated_at": _now(),
        "product": {
            "id": "agios",
            "name": "AGIOS",
            "edition": "Foundation · Phase 4B",
            "mode": "supervised",
        },
        "privacy": {
            "mode": "allowlisted_metadata",
            "customer_content_included": False,
            "runtime_writes_enabled": False,
        },
        "portfolio": dict(selected.portfolio),
        "summary": {
            "businesses": len(businesses),
            "active_businesses": sum(item["status"] == "active" for item in businesses),
            "departments": len(departments),
            "agents": len(agents),
            "available_agents": available_agents,
            "scheduled_jobs": sum(item.get("enabled", False) for item in schedules),
            "pending_approvals": journal.get("pending_approval_count", 0),
            "connected_integrations": connected,
            "skill_assignments": skill_assignments,
            "model_routes": len(models),
            "systems": len(systems),
            "live_or_detected_systems": sum(item.get("status") in {"live", "detected", "routed"} for item in systems),
            "shared_skills": fabric["skills"]["inventory"],
            "memory_facts": fabric["memory"]["fact_count"],
            "repositories": len(repositories),
        },
        "businesses": businesses,
        "departments": departments,
        "agents": agents,
        "schedules": schedules,
        "integrations": integrations,
        "models": models,
        "routes": {name: list(items) for name, items in selected.routes.items()},
        "systems": systems,
        "mesh": [
            {
                **_record(agent["id"], agent),
                "kind": "agent",
                "provider": agent.get("provider"),
                "model": agent.get("model"),
                "state": agent["state"],
                "capabilities": list(agent.get("capabilities") or []),
                "collaboration": {"a2a": True, "shared_memory": True, "shared_skills": True},
            }
            for agent in agents
        ]
        + [
            {
                **_record(system["id"], system),
                "kind": "system",
                "state": system.get("status", "planned"),
                "capabilities": list(system.get("capabilities") or []),
                "collaboration": {
                    "a2a": system.get("status") in {"live", "detected", "routed"},
                    "shared_memory": bool(system.get("shared_memory")),
                    "shared_skills": bool(system.get("shared_skills")),
                },
            }
            for system in systems
        ],
        "apps": integrations,
        "repositories": repositories,
        "techniques": techniques,
        "shared_fabric": {
            **fabric,
            "skills": {**fabric["skills"], "attached_agents": len(agents), "eligible_systems": sum(item["shared_skills"] for item in systems)},
            "memory": {**fabric["memory"], "attached_agents": len(agents), "eligible_systems": sum(item["shared_memory"] for item in systems)},
        },
        "usage": {
            "status": "unavailable",
            "cost_status": "unavailable",
            "period": "28d",
            "sessions": None,
            "tokens": None,
            "cost": None,
            "reason": "Hermes does not expose trusted portfolio-wide usage and pricing through this adapter yet.",
        },
        "sessions": {"status": "unavailable", "items": []},
        "approvals": {"status": "healthy", "items": [], "pending": journal.get("pending_approval_count", 0)},
        "activity": journal,
        "runtime": {
            "id": "hermes",
            "status": hermes.get("status", "unavailable"),
            "gateway_running": bool(hermes.get("gateway_running")),
            "profiles_status": hermes.get("profiles", {}).get("status", "unavailable"),
            "schedules_status": hermes.get("schedules", {}).get("status", "unavailable"),
            "issues": list(hermes.get("issues", [])),
        },
    }
