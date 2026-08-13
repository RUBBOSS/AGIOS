from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping


class ConfigError(ValueError):
    """The authoritative AGIOS configuration is invalid."""


def _require_mapping(value: Any, label: str) -> Mapping[str, Any]:
    if not isinstance(value, dict):
        raise ConfigError(f"{label} must be an object")
    return value


def _unique_records(records: Any, label: str) -> dict[str, Mapping[str, Any]]:
    if not isinstance(records, list) or not records:
        raise ConfigError(f"{label} must be a non-empty array")
    result: dict[str, Mapping[str, Any]] = {}
    for index, value in enumerate(records):
        record = _require_mapping(value, f"{label}[{index}]")
        record_id = record.get("id")
        if not isinstance(record_id, str) or not record_id:
            raise ConfigError(f"{label}[{index}].id must be a non-empty string")
        if record_id in result:
            raise ConfigError(f"duplicate {label} id: {record_id}")
        result[record_id] = record
    return result


@dataclass(frozen=True)
class AGIOSConfig:
    path: Path
    raw: Mapping[str, Any]
    data_classes: Mapping[str, Mapping[str, Any]]
    capabilities: Mapping[str, Mapping[str, Any]]
    agents: Mapping[str, Mapping[str, Any]]
    models: Mapping[str, Mapping[str, Any]]
    routes: Mapping[str, tuple[str, ...]]
    runtimes: Mapping[str, Mapping[str, Any]]
    portfolio: Mapping[str, Any]
    businesses: Mapping[str, Mapping[str, Any]]
    departments: Mapping[str, Mapping[str, Any]]
    integrations: Mapping[str, Mapping[str, Any]]
    systems: Mapping[str, Mapping[str, Any]]


def validate_config(raw: Any, *, path: Path) -> AGIOSConfig:
    root = _require_mapping(raw, "configuration")
    if root.get("schema_version") != 1:
        raise ConfigError("unsupported AGIOS schema_version")

    system = _require_mapping(root.get("system"), "system")
    if system.get("id") != "agios" or system.get("event_schema_version") != 1:
        raise ConfigError("system identity or event schema is invalid")

    data_classes = _require_mapping(root.get("data_classes"), "data_classes")
    required_classes = {
        "public",
        "internal",
        "private_business",
        "customer_restricted",
        "credential",
    }
    if set(data_classes) != required_classes:
        raise ConfigError("data_classes must contain the fixed AGIOS classification set")
    ranks: set[int] = set()
    for name, value in data_classes.items():
        policy = _require_mapping(value, f"data_classes.{name}")
        rank = policy.get("rank")
        if not isinstance(rank, int) or rank < 0 or rank in ranks:
            raise ConfigError(f"data_classes.{name}.rank must be a unique nonnegative integer")
        ranks.add(rank)
        if policy.get("model_access") not in {"allowed", "denied"}:
            raise ConfigError(f"data_classes.{name}.model_access is invalid")
        if policy.get("external_policy") not in {
            "allowed",
            "trusted-only",
            "explicit-approval",
            "denied",
        }:
            raise ConfigError(f"data_classes.{name}.external_policy is invalid")
    if data_classes["credential"].get("model_access") != "denied":
        raise ConfigError("credential data must be denied to every model")

    capabilities = _require_mapping(root.get("capabilities"), "capabilities")
    agents = _unique_records(root.get("agents"), "agents")
    models = _unique_records(root.get("models"), "models")
    runtimes = _unique_records(root.get("runtimes"), "runtimes")
    portfolio = _require_mapping(root.get("portfolio"), "portfolio")
    if not isinstance(portfolio.get("id"), str) or not isinstance(
        portfolio.get("name"), str
    ):
        raise ConfigError("portfolio requires string id and name")
    businesses = _unique_records(root.get("businesses"), "businesses")
    departments = _unique_records(root.get("departments"), "departments")
    integrations = _unique_records(root.get("integrations"), "integrations")
    systems = _unique_records(root.get("systems"), "systems")

    for agent_id, agent in agents.items():
        runtime = agent.get("runtime")
        if runtime not in runtimes:
            raise ConfigError(f"agent {agent_id} references unknown runtime {runtime}")
        grants = agent.get("capabilities")
        if not isinstance(grants, list) or len(grants) != len(set(grants)):
            raise ConfigError(f"agent {agent_id} capabilities must be a unique array")
        unknown = set(grants) - set(capabilities)
        if unknown:
            raise ConfigError(f"agent {agent_id} has unknown capabilities: {sorted(unknown)}")

    for model_id, model in models.items():
        if model.get("location") not in {"local", "external"}:
            raise ConfigError(f"model {model_id} location is invalid")
        allowed = model.get("allowed_data_classes")
        if not isinstance(allowed, list) or not allowed:
            raise ConfigError(f"model {model_id} allowed_data_classes must be non-empty")
        unknown = set(allowed) - set(data_classes)
        if unknown or "credential" in allowed:
            raise ConfigError(f"model {model_id} has unsafe data-class grants")
        if model.get("location") == "external" and model.get("trust") == "local":
            raise ConfigError(f"external model {model_id} cannot claim local trust")

    route_values = _require_mapping(root.get("routes"), "routes")
    routes: dict[str, tuple[str, ...]] = {}
    for workload, candidates in route_values.items():
        if not isinstance(candidates, list) or not candidates:
            raise ConfigError(f"route {workload} must have candidates")
        if len(candidates) != len(set(candidates)):
            raise ConfigError(f"route {workload} contains duplicate candidates")
        unknown = set(candidates) - set(models)
        if unknown:
            raise ConfigError(f"route {workload} references unknown models: {sorted(unknown)}")
        routes[workload] = tuple(candidates)

    workloads = {
        workload
        for agent in agents.values()
        for workload in agent.get("workloads", [])
    }
    missing_routes = workloads - set(routes)
    if missing_routes:
        raise ConfigError(f"agent workloads lack routes: {sorted(missing_routes)}")

    for department_id, department in departments.items():
        agent_ids = department.get("agent_ids")
        if not isinstance(agent_ids, list) or len(agent_ids) != len(set(agent_ids)):
            raise ConfigError(
                f"department {department_id} agent_ids must be a unique array"
            )
        unknown_agents = set(agent_ids) - set(agents)
        if unknown_agents:
            raise ConfigError(
                f"department {department_id} references unknown agents: {sorted(unknown_agents)}"
            )

    for business_id, business in businesses.items():
        department_ids = business.get("department_ids")
        if not isinstance(department_ids, list) or not department_ids:
            raise ConfigError(
                f"business {business_id} department_ids must be a non-empty array"
            )
        unknown_departments = set(department_ids) - set(departments)
        if unknown_departments:
            raise ConfigError(
                f"business {business_id} references unknown departments: {sorted(unknown_departments)}"
            )
        owner_agent_id = business.get("owner_agent_id")
        if owner_agent_id not in agents:
            raise ConfigError(
                f"business {business_id} references unknown owner agent {owner_agent_id}"
            )

    allowed_integration_states = {"connected", "planned", "disabled", "degraded"}
    for integration_id, integration in integrations.items():
        if integration.get("status") not in allowed_integration_states:
            raise ConfigError(f"integration {integration_id} status is invalid")

    allowed_system_states = {"live", "detected", "routed", "planned", "unavailable"}
    for system_id, system in systems.items():
        if system.get("status") not in allowed_system_states:
            raise ConfigError(f"system {system_id} status is invalid")
        system_capabilities = system.get("capabilities")
        if not isinstance(system_capabilities, list) or not system_capabilities:
            raise ConfigError(f"system {system_id} capabilities must be a non-empty array")

    return AGIOSConfig(
        path=path,
        raw=root,
        data_classes=data_classes,
        capabilities=capabilities,
        agents=agents,
        models=models,
        routes=routes,
        runtimes=runtimes,
        portfolio=portfolio,
        businesses=businesses,
        departments=departments,
        integrations=integrations,
        systems=systems,
    )


def load_config(path: str | Path) -> AGIOSConfig:
    candidate = Path(path).expanduser().resolve(strict=True)
    if not candidate.is_file() or candidate.is_symlink():
        raise ConfigError("AGIOS configuration must be a regular file")
    try:
        raw = json.loads(candidate.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ConfigError("AGIOS configuration is unreadable") from exc
    return validate_config(raw, path=candidate)
