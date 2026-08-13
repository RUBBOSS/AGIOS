from __future__ import annotations

import hashlib
import hmac
import json
import re
import sqlite3
import uuid
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterable, Mapping

from .config import AGIOSConfig
from .contracts import canonical_json, utc_now
from .events import EventJournal
from .routing import ModelRouter, RoutingError


class OrchestrationError(RuntimeError):
    """A Chief-of-Staff routing plan is invalid or no longer current."""


DATA_CLASSES = {"public", "internal", "private_business", "customer_restricted"}
PLAN_ID = re.compile(r"^[0-9a-f-]{36}$")
SECRET_TEXT = re.compile(
    r"(?:sk|pk|api)[-_][A-Za-z0-9_-]{12,}|"
    r"(?:password|passwd|api[_ -]?key|access[_ -]?token|bearer)\s*[:=]\s*\S+",
    re.IGNORECASE,
)

DEPARTMENT_SIGNALS: Mapping[str, tuple[str, ...]] = {
    "executive-operations": (
        "plan", "priority", "prioritize", "business", "operation", "schedule",
        "strategy", "budget", "decide", "portfolio", "organize",
    ),
    "research-intelligence": (
        "research", "investigate", "compare", "market", "source", "evidence",
        "opportunity", "regulation", "analysis", "find", "learn", "audit",
    ),
    "engineering": (
        "code", "software", "app", "api", "repository", "debug", "build",
        "implement", "website", "frontend", "backend", "database", "fix",
    ),
    "quality-security": (
        "review", "audit", "security", "test", "qa", "verify", "risk",
        "critic", "quality", "release", "validate",
    ),
    "design-experience": (
        "design", "ui", "ux", "interface", "animation", "motion", "brand",
        "visual", "figma", "adobe", "layout", "dashboard", "experience",
    ),
    "growth-marketing": (
        "seo", "content", "campaign", "marketing", "lead", "outreach",
        "position", "growth", "sales", "funnel", "social",
    ),
    "creative-media": (
        "image", "video", "audio", "voice", "thumbnail", "music", "media",
        "render", "illustration", "creative",
    ),
}

DEPARTMENT_DEFAULTS: Mapping[str, tuple[str, str]] = {
    "executive-operations": ("manager", "operations"),
    "research-intelligence": ("researcher", "research"),
    "engineering": ("builder", "coding"),
    "quality-security": ("reviewer", "review"),
    "design-experience": ("builder", "coding"),
    "growth-marketing": ("researcher", "research"),
    "creative-media": ("builder", "coding"),
}

DEPARTMENT_BUSINESSES: Mapping[str, str] = {
    "executive-operations": "main-operations",
    "research-intelligence": "armenia-income",
    "engineering": "software-studio",
    "quality-security": "main-operations",
    "design-experience": "design-studio",
    "growth-marketing": "growth-studio",
    "creative-media": "creative-studio",
}

CRITICS = (
    {
        "id": "brief",
        "name": "Brief critic",
        "question": "Did the proposed result answer the owner's actual outcome?",
        "status": "planned",
    },
    {
        "id": "system",
        "name": "System critic",
        "question": "Does the work fit AGIOS policy, memory and the selected system?",
        "status": "planned",
    },
    {
        "id": "craft",
        "name": "Craft critic",
        "question": "Does the rendered or verified result meet the required quality bar?",
        "status": "planned",
    },
)

WORK_SIGNALS = {
    "analyze", "audit", "build", "change", "compare", "create", "design",
    "edit", "find", "fix", "implement", "improve", "install", "integrate",
    "investigate", "plan", "redesign", "refactor", "research", "review",
    "test", "update", "verify",
}
WORKSPACE_WRITE_SIGNALS = {
    "build", "change", "create", "edit", "fix", "implement", "improve",
    "install", "integrate", "redesign", "refactor", "update",
}
WORKSPACE_CONTEXT_SIGNALS = {
    "app", "backend", "code", "dashboard", "database", "file", "frontend",
    "interface", "project", "repo", "repository", "software", "website",
    "worktree",
}
RESEARCH_SIGNALS = {
    "analyze", "compare", "evidence", "find", "investigate", "research",
    "review", "source", "study", "video",
}
URL_TEXT = re.compile(r"https?://|www\.", re.IGNORECASE)


def classify_ari_intent(objective: str, *, intent: str = "auto") -> dict[str, Any]:
    """Classify Ari's front-door request without sending it to a model."""

    selected_objective = str(objective or "").strip()
    if not selected_objective:
        raise OrchestrationError("Tell Ari what you need")
    if intent not in {"auto", "conversation", "work"}:
        raise OrchestrationError("Ari's routing preference is invalid")

    words = _tokens(selected_objective)
    has_url = bool(URL_TEXT.search(selected_objective))
    work_hits = words & WORK_SIGNALS
    workspace_context = words & WORKSPACE_CONTEXT_SIGNALS
    write_hits = words & WORKSPACE_WRITE_SIGNALS
    research_hits = words & RESEARCH_SIGNALS
    is_work = bool(work_hits or has_url)
    if intent == "conversation":
        is_work = False
    elif intent == "work":
        is_work = True

    if not is_work:
        return {
            "kind": "conversation",
            "execution_mode": "chat",
            "workspace_access": "none",
            "required_capabilities": [],
            "reason": "Ari kept this as a direct answer because no supervised work signal was detected.",
        }

    # A creation verb alone does not imply repository access (for example,
    # "create a marketing plan").  Ari only selects the workspace lane when
    # the request also names a software/project surface.
    needs_workspace = bool(workspace_context)
    execution_mode = "workspace" if needs_workspace else "goal"
    workspace_access = "write" if needs_workspace and write_hits else (
        "read" if needs_workspace else "none"
    )
    capabilities: list[str] = []
    if has_url or research_hits:
        capabilities.append("research_web")
    if needs_workspace:
        capabilities.append(
            "write_workspace" if workspace_access == "write" else "read_workspace"
        )
    if workspace_access == "write":
        capabilities.append("run_tests")

    lane = "a registered workspace" if needs_workspace else "a supervised goal"
    return {
        "kind": "work",
        "execution_mode": execution_mode,
        "workspace_access": workspace_access,
        "required_capabilities": capabilities,
        "reason": f"Ari detected directed work and prepared {lane} route before execution.",
    }


def _digest(value: Mapping[str, Any]) -> str:
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def _tokens(value: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", value.lower()))


def _score_departments(objective: str) -> list[tuple[str, int]]:
    lowered = objective.lower()
    words = _tokens(objective)
    scores: list[tuple[str, int]] = []
    for department_id, signals in DEPARTMENT_SIGNALS.items():
        score = 0
        for signal in signals:
            if signal in words:
                score += 3
            elif len(signal) > 3 and signal in lowered:
                score += 2
        scores.append((department_id, score))
    scores.sort(key=lambda item: (-item[1], list(DEPARTMENT_SIGNALS).index(item[0])))
    return scores


def _available_models(
    config: AGIOSConfig, runtime_catalog: Iterable[Mapping[str, Any]]
) -> set[str]:
    runtimes = {str(item.get("id")): item for item in runtime_catalog}
    available: set[str] = set()
    for model_id, model in config.models.items():
        provider = str(model.get("provider") or "")
        if model.get("location") == "local":
            available.add(model_id)
        elif provider == "openai-codex" and any(
            runtimes.get(item, {}).get("execution_enabled") for item in ("hermes", "codex")
        ):
            available.add(model_id)
        elif provider == "deepseek" and runtimes.get("deepseek", {}).get("configured"):
            available.add(model_id)
    return available


def build_routing_plan(
    config: AGIOSConfig,
    *,
    objective: str,
    data_class: str,
    business_id: str | None = None,
    runtime_catalog: Iterable[Mapping[str, Any]] = (),
) -> dict[str, Any]:
    selected_objective = str(objective or "").strip()
    if not selected_objective:
        raise OrchestrationError("Tell Ari the outcome you want")
    if len(selected_objective) > 7200:
        raise OrchestrationError("The requested outcome is too long")
    if SECRET_TEXT.search(selected_objective):
        raise OrchestrationError("Do not put credentials in a Chief-of-Staff directive")
    if data_class not in DATA_CLASSES:
        raise OrchestrationError("The data class is invalid")
    if business_id and business_id not in config.businesses:
        raise OrchestrationError("The selected business is not registered")

    intent = classify_ari_intent(selected_objective, intent="work")

    ranked = _score_departments(selected_objective)
    primary_department_id, primary_score = ranked[0]
    if primary_score == 0:
        primary_department_id = "executive-operations"
    if intent["execution_mode"] == "workspace":
        workspace_departments = {
            department_id: score
            for department_id, score in ranked
            if department_id in {"engineering", "design-experience", "creative-media"}
        }
        primary_department_id = max(
            workspace_departments,
            key=lambda department_id: (
                workspace_departments[department_id],
                -list(DEPARTMENT_SIGNALS).index(department_id),
            ),
        )
    elif "research_web" in intent["required_capabilities"]:
        primary_department_id = "research-intelligence"
    supporting_department_ids = [
        item_id for item_id, score in ranked
        if score > 0 and item_id != primary_department_id
    ][:2]
    if primary_department_id != "quality-security":
        supporting_department_ids = [
            *[item for item in supporting_department_ids if item != "quality-security"],
            "quality-security",
        ][:3]

    selected_business_id = business_id or DEPARTMENT_BUSINESSES[primary_department_id]
    lead_agent_id, workload = DEPARTMENT_DEFAULTS[primary_department_id]
    if intent["execution_mode"] == "workspace":
        lead_agent_id, workload = "builder", "coding"
    if data_class == "customer_restricted":
        if primary_department_id in {"engineering", "design-experience", "creative-media"}:
            lead_agent_id, workload = "codinglocal", "private_coding"
        elif primary_department_id != "quality-security":
            lead_agent_id, workload = "fastworker", "private_general"

    # team_agent_ids only names agents that have a real lifecycle in this
    # plan.  A combined research/build route is executed by a workspace lead
    # granted the declared web capability; it must not display a decorative
    # researcher run that dispatch cannot create.
    team_ids = list(dict.fromkeys(["default", lead_agent_id, "reviewer"]))
    available = _available_models(config, runtime_catalog)
    if not available:
        available = {
            model_id for model_id, model in config.models.items()
            if model.get("location") == "local"
        }
    try:
        decision = ModelRouter(config).select(
            task_id=str(uuid.uuid4()),
            workload=workload,
            data_class=data_class,
            available_models=available,
        )
    except RoutingError as exc:
        raise OrchestrationError("No approved model route is currently available") from exc

    plan_id = str(uuid.uuid4())
    route = {
        "plan_id": plan_id,
        "created_at": utc_now(),
        "status": "planned",
        "objective": selected_objective,
        "objective_digest": hashlib.sha256(selected_objective.encode("utf-8")).hexdigest(),
        "data_class": data_class,
        "business_id": selected_business_id,
        "orchestrator_agent_id": "default",
        "department_id": primary_department_id,
        "supporting_department_ids": supporting_department_ids,
        "lead_agent_id": lead_agent_id,
        "team_agent_ids": team_ids,
        "workload": workload,
        "model_id": decision.model_id,
        "model_provider": decision.provider,
        "model_location": decision.location,
        "runtime_id": "hermes",
        "execution_mode": intent["execution_mode"],
        "workspace_access": intent["workspace_access"],
        "required_capabilities": intent["required_capabilities"],
        "critics": [dict(item) for item in CRITICS],
        "approval": {
            "required": True,
            "mode": "exact-run",
            "reason": "Ari prepares the route; no model work starts until you approve the bound run.",
        },
        "rationale": [
            f"Ari matched the outcome to {config.departments[primary_department_id]['name']}.",
            f"{config.agents[lead_agent_id]['name']} is the specialist lead for {workload.replace('_', ' ')} work.",
            f"{decision.model_id} is allowed for {data_class.replace('_', ' ')} data.",
            f"The route requires {', '.join(intent['required_capabilities']) or 'no tools'} through the {intent['execution_mode']} lane.",
            "Vera Quinn remains an independent planned review gate.",
        ],
    }
    bound = {key: value for key, value in route.items() if key not in {"status"}}
    route["plan_digest"] = _digest(bound)
    return route


class OrchestrationStore:
    """Private local plans. The event journal receives digests, never objectives."""

    def __init__(self, path: str | Path, journal_path: str | Path) -> None:
        self.path = Path(path).expanduser().absolute()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.journal_path = Path(journal_path).expanduser().absolute()
        if self.path.exists() and self.path.is_symlink():
            raise OrchestrationError("orchestration store cannot be a symbolic link")
        with self._connection() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS plans (
                    plan_id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    plan_json TEXT NOT NULL,
                    plan_digest TEXT NOT NULL,
                    status TEXT NOT NULL,
                    run_id TEXT
                );
                CREATE INDEX IF NOT EXISTS plans_created_at ON plans(created_at DESC);
                """
            )

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path, timeout=5)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA journal_mode=WAL")
        connection.execute("PRAGMA busy_timeout=5000")
        return connection

    @contextmanager
    def _connection(self):
        connection = self._connect()
        try:
            yield connection
            connection.commit()
        finally:
            connection.close()

    def create(self, plan: Mapping[str, Any]) -> dict[str, Any]:
        stored = dict(plan)
        with self._connection() as connection:
            connection.execute(
                "INSERT INTO plans(plan_id, created_at, plan_json, plan_digest, status) VALUES(?,?,?,?,?)",
                (
                    stored["plan_id"], stored["created_at"], canonical_json(stored),
                    stored["plan_digest"], stored["status"],
                ),
            )
        with EventJournal(self.journal_path) as journal:
            journal.append(
                kind="orchestration.planned",
                actor_id="default",
                subject_id=str(stored["plan_id"]),
                correlation_id=str(stored["plan_id"]),
                payload={
                    "objective_digest": stored["objective_digest"],
                    "plan_digest": stored["plan_digest"],
                    "business_id": stored["business_id"],
                    "department_id": stored["department_id"],
                    "lead_agent_id": stored["lead_agent_id"],
                    "model_id": stored["model_id"],
                    "data_class": stored["data_class"],
                    "team_size": len(stored["team_agent_ids"]),
                },
                idempotency_key=f"orchestration-plan:{stored['plan_id']}",
            )
        return stored

    def get(self, plan_id: str) -> dict[str, Any]:
        if PLAN_ID.fullmatch(str(plan_id)) is None:
            raise OrchestrationError("routing plan is invalid")
        with self._connection() as connection:
            row = connection.execute("SELECT * FROM plans WHERE plan_id=?", (plan_id,)).fetchone()
        if row is None:
            raise OrchestrationError("routing plan was not found")
        result = json.loads(row["plan_json"])
        bound = {
            key: value for key, value in result.items()
            if key not in {"status", "plan_digest", "run_id"}
        }
        if not hmac_compare(str(result.get("plan_digest") or ""), _digest(bound)):
            raise OrchestrationError("routing plan integrity check failed")
        result["status"] = row["status"]
        result["run_id"] = row["run_id"]
        return result

    def list(self, limit: int = 20) -> list[dict[str, Any]]:
        bounded = max(1, min(int(limit), 100))
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT * FROM plans ORDER BY created_at DESC LIMIT ?", (bounded,)
            ).fetchall()
        items: list[dict[str, Any]] = []
        for row in rows:
            item = json.loads(row["plan_json"])
            item["status"] = row["status"]
            item["run_id"] = row["run_id"]
            items.append(item)
        return items

    def bind_run(self, plan_id: str, plan_digest: str, run_id: str) -> dict[str, Any]:
        plan = self.get(plan_id)
        if plan["status"] != "dispatching":
            raise OrchestrationError("routing plan is not reserved for dispatch")
        if not isinstance(plan_digest, str) or not hmac_compare(plan["plan_digest"], plan_digest):
            raise OrchestrationError("routing plan no longer matches your review")
        with self._connection() as connection:
            cursor = connection.execute(
                "UPDATE plans SET status='awaiting_approval', run_id=? WHERE plan_id=? AND status='dispatching'",
                (run_id, plan_id),
            )
            if cursor.rowcount != 1:
                raise OrchestrationError("routing plan changed before dispatch")
        with EventJournal(self.journal_path) as journal:
            journal.append(
                kind="orchestration.dispatched",
                actor_id="owner",
                subject_id=plan_id,
                correlation_id=plan_id,
                payload={"plan_digest": plan_digest, "run_id": run_id, "lead_agent_id": plan["lead_agent_id"]},
                idempotency_key=f"orchestration-dispatch:{plan_id}",
            )
        return self.get(plan_id)

    def reserve_dispatch(self, plan_id: str, plan_digest: str) -> dict[str, Any]:
        plan = self.get(plan_id)
        if plan["status"] != "planned" or not hmac_compare(
            str(plan["plan_digest"]), str(plan_digest)
        ):
            raise OrchestrationError("routing plan no longer matches your review")
        with self._connection() as connection:
            cursor = connection.execute(
                "UPDATE plans SET status='dispatching' WHERE plan_id=? AND status='planned' AND plan_digest=?",
                (plan_id, plan_digest),
            )
            if cursor.rowcount != 1:
                raise OrchestrationError("routing plan was already dispatched")
        return self.get(plan_id)

    def release_dispatch(self, plan_id: str, plan_digest: str) -> None:
        with self._connection() as connection:
            connection.execute(
                "UPDATE plans SET status='planned' WHERE plan_id=? AND status='dispatching' AND plan_digest=? AND run_id IS NULL",
                (plan_id, plan_digest),
            )

    def summary(self) -> dict[str, Any]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT status, COUNT(*) AS total FROM plans GROUP BY status"
            ).fetchall()
        counts = {str(row["status"]): int(row["total"]) for row in rows}
        return {"status": "ready", "chief_of_staff": "default", "plans": sum(counts.values()), "by_status": counts}


def hmac_compare(left: str, right: str) -> bool:
    return hmac.compare_digest(left, right)
