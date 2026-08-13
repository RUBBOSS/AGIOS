from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Mapping

from .config import AGIOSConfig, ConfigError, load_config
from .events import EventStoreError, read_journal_summary
from .routing import ModelRouter, RoutingError


@dataclass(frozen=True)
class Check:
    id: str
    status: str
    detail: str


def _profile_inventory(profiles_dir: Path) -> tuple[set[str], list[Check]]:
    found: set[str] = set()
    checks: list[Check] = []
    if not profiles_dir.is_dir():
        return found, [Check("profiles", "failed", "profile directory is unavailable")]
    for path in sorted(profiles_dir.glob("*.json")):
        if path.name == "agios.json":
            continue
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError):
            checks.append(Check("profile-readable", "failed", "a profile file is invalid"))
            continue
        profile = value.get("profile") if isinstance(value, dict) else None
        if not isinstance(profile, str) or profile != path.stem:
            checks.append(Check("profile-identity", "failed", "a profile identity is inconsistent"))
            continue
        found.add(profile)
    return found, checks


def run_doctor(
    *,
    config_path: str | Path,
    profiles_dir: str | Path,
    journal_path: str | Path | None = None,
) -> Mapping[str, Any]:
    checks: list[Check] = []
    try:
        config = load_config(config_path)
    except ConfigError as exc:
        return {
            "schema_version": 1,
            "status": "failed",
            "checks": [asdict(Check("configuration", "failed", str(exc)))],
        }
    checks.append(Check("configuration", "healthy", "authoritative configuration is valid"))

    expected_profiles = {
        str(agent["profile"])
        for agent in config.agents.values()
        if agent.get("runtime") == "hermes" and isinstance(agent.get("profile"), str)
    }
    found_profiles, profile_checks = _profile_inventory(Path(profiles_dir))
    checks.extend(profile_checks)
    missing = expected_profiles - found_profiles
    extra = found_profiles - expected_profiles
    if missing:
        checks.append(Check("profile-drift", "failed", f"missing desired profiles: {sorted(missing)}"))
    elif extra:
        checks.append(Check("profile-drift", "warning", f"non-authoritative profiles remain: {sorted(extra)}"))
    else:
        checks.append(Check("profile-drift", "healthy", "checked-in profiles match the agent registry"))

    checks.extend(_privacy_checks(config))

    if journal_path is None:
        checks.append(Check("event-journal", "not-configured", "no runtime journal was selected"))
        journal_summary = None
    else:
        try:
            journal_summary = read_journal_summary(journal_path)
            checks.append(Check("event-journal", "healthy", "runtime journal is readable in query-only mode"))
        except (OSError, EventStoreError) as exc:
            journal_summary = None
            checks.append(Check("event-journal", "failed", str(exc)))

    statuses = {check.status for check in checks}
    overall = "failed" if "failed" in statuses else "warning" if "warning" in statuses else "healthy"
    return {
        "schema_version": 1,
        "status": overall,
        "checks": [asdict(check) for check in checks],
        "inventory": {
            "agent_count": len(config.agents),
            "model_count": len(config.models),
            "runtime_count": len(config.runtimes),
            "route_count": len(config.routes),
        },
        "journal": journal_summary,
    }


def _privacy_checks(config: AGIOSConfig) -> list[Check]:
    router = ModelRouter(config)
    available = set(config.models)
    failures: list[str] = []
    for workload in config.routes:
        try:
            decision = router.select(
                task_id=f"doctor-{workload}",
                workload=workload,
                data_class="customer_restricted",
                available_models=available,
            )
        except RoutingError:
            continue
        if decision.location != "local":
            failures.append(workload)
    try:
        router.select(
            task_id="doctor-credential",
            workload="private_general",
            data_class="credential",
            available_models=available,
        )
        failures.append("credential")
    except RoutingError:
        pass
    if failures:
        return [Check("privacy-routing", "failed", f"unsafe routes: {sorted(failures)}")]
    return [Check("privacy-routing", "healthy", "private routes remain local and credentials are denied")]
