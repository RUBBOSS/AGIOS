"""Daily 'dreaming' digest: real, evidence-gated recommendations for AGIOS.

Eight dimensions, each honest about what the operating system can currently
measure. A recommendation is only produced when a real signal exists; every
number traces to a live store (memory, sessions, growth, plans, runtime
catalog). Nothing here is synthetic and nothing is fabricated.
"""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any, Iterable, Mapping

from .contracts import utc_now


SCHEMA_VERSION = 1
MAX_RECOMMENDATIONS = 4

# (dimension_id, label, status_source)
DIMENSIONS: tuple[tuple[str, str], ...] = (
    ("conversation-analysis", "Conversation analysis"),
    ("cost-intelligence", "Cost intelligence"),
    ("skill-performance", "Skill performance"),
    ("memory-health", "Memory health"),
    ("session-hygiene", "Session hygiene"),
    ("workflow-patterns", "Workflow patterns"),
    ("external-opportunity", "External opportunity"),
    ("business-outcomes", "Business outcomes"),
)


class DreamingStore:
    """Accepted/dismissed digest state. Small local JSON, never content."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._state: dict[str, dict[str, str]] = {"accepted": {}, "dismissed": {}}
        if self.path.exists():
            try:
                loaded = json.loads(self.path.read_text(encoding="utf-8"))
                if isinstance(loaded, dict):
                    for key in ("accepted", "dismissed"):
                        if isinstance(loaded.get(key), dict):
                            self._state[key] = loaded[key]
            except (OSError, ValueError):
                self._state = {"accepted": {}, "dismissed": {}}

    def _save(self) -> None:
        self.path.write_text(
            json.dumps(self._state, indent=2), encoding="utf-8"
        )

    def accept(self, recommendation_id: str) -> None:
        self._state["accepted"][recommendation_id] = utc_now()
        self._state["dismissed"].pop(recommendation_id, None)
        self._save()

    def dismiss(self, recommendation_id: str) -> None:
        self._state["dismissed"][recommendation_id] = utc_now()
        self._state["accepted"].pop(recommendation_id, None)
        self._save()

    def state(self) -> Mapping[str, Any]:
        return self._state


def _count_runs(runs: Iterable[Mapping[str, Any]]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for run in runs:
        status = str(run.get("status") or "unknown")
        counts[status] = counts.get(status, 0) + 1
    return counts


def build_dreaming_digest(
    *,
    memory_summary: Mapping[str, Any],
    runs: Iterable[Mapping[str, Any]],
    proposals: Iterable[Mapping[str, Any]],
    plans_summary: Mapping[str, Any],
    runtime_catalog: Iterable[Mapping[str, Any]],
    hermes_session_count: int,
    store: DreamingStore,
) -> dict[str, Any]:
    """Build the honest daily digest from live stores only."""

    run_counts = _count_runs(runs)
    proposals_list = list(proposals)
    pending_proposals = [
        p for p in proposals_list if p.get("status") != "installed"
    ]
    plans_by_status = {
        str(k): int(v) for k, v in (plans_summary.get("by_status") or {}).items()
    }
    awaiting_plans = plans_by_status.get("awaiting_approval", 0)
    planned_plans = plans_by_status.get("planned", 0)
    fact_count = int(memory_summary.get("fact_count") or 0)
    runtimes = {str(item.get("id")): item for item in runtime_catalog}
    provider_reported_cost = bool(runtimes.get("openrouter", {}).get("configured"))

    recommendations: list[dict[str, Any]] = []
    dimensions: list[dict[str, Any]] = []

    def recommend(kind: str, dimension: str, title: str, detail: str, evidence: Mapping[str, Any], action: Mapping[str, str]) -> None:
        if len(recommendations) >= MAX_RECOMMENDATIONS:
            return
        recommendations.append(
            {
                "id": f"{dimension}-{len(recommendations) + 1}",
                "kind": kind,
                "dimension": dimension,
                "title": title,
                "detail": detail,
                "evidence": dict(evidence),
                "action": dict(action),
            }
        )

    # ---- 1. conversation analysis ----
    if hermes_session_count > 0:
        dimensions.append({
            "id": "conversation-analysis",
            "label": "Conversation analysis",
            "status": "evidence",
            "detail": f"{hermes_session_count} Hermes sessions available for pattern analysis",
            "evidence": {"sessions": hermes_session_count},
        })
        # A recommendation only fires when a repeated pattern exists; AGIOS
        # does not yet ingest per-session content, so none is fabricated here.
    else:
        dimensions.append({
            "id": "conversation-analysis",
            "label": "Conversation analysis",
            "status": "no-evidence",
            "detail": "No Hermes sessions to analyze yet. Run work through AGIOS and patterns will surface here.",
            "evidence": {"sessions": 0},
        })

    # ---- 2. cost intelligence ----
    dimensions.append({
        "id": "cost-intelligence",
        "label": "Cost intelligence",
        "status": "unavailable" if not provider_reported_cost else "evidence",
        "detail": "Providers do not report usage to AGIOS yet; missing usage never appears as zero."
        if not provider_reported_cost
        else "Provider-reported usage is available; per-route cost is visible next to each model choice.",
        "evidence": {"provider_reported": provider_reported_cost},
    })

    # ---- 3. skill performance ----
    if pending_proposals:
        dimensions.append({
            "id": "skill-performance",
            "label": "Skill performance",
            "status": "evidence",
            "detail": f"{len(pending_proposals)} proposals waiting for owner review",
            "evidence": {"pending_proposals": len(pending_proposals)},
        })
        recommend(
            "review-proposals",
            "skill-performance",
            f"Review {len(pending_proposals)} pending skill proposal{'s' if len(pending_proposals) > 1 else ''}",
            "Proposals stay dormant until you validate or reject them. Open the Skill Lab to decide.",
            {"pending": len(pending_proposals)},
            {"type": "navigate", "label": "Open Skill Lab", "target": "skills"},
        )
    else:
        dimensions.append({
            "id": "skill-performance",
            "label": "Skill performance",
            "status": "no-evidence",
            "detail": "No pending proposals. Completed evidence-linked work can propose new skills.",
            "evidence": {"pending_proposals": 0},
        })

    # ---- 4. memory health ----
    if fact_count == 0:
        dimensions.append({
            "id": "memory-health",
            "label": "Memory health",
            "status": "evidence",
            "detail": "Shared memory is empty: workers start every session without durable context.",
            "evidence": {"fact_count": 0},
        })
        recommend(
            "write-memory",
            "memory-health",
            "Write the first durable fact",
            "Shared memory has zero scoped facts. One written fact makes it available to every authorized worker.",
            {"fact_count": 0},
            {"type": "navigate", "label": "Open Memory", "target": "memory"},
        )
    else:
        dimensions.append({
            "id": "memory-health",
            "label": "Memory health",
            "status": "evidence",
            "detail": f"{fact_count} durable scoped facts shared across workers",
            "evidence": {"fact_count": fact_count},
        })

    # ---- 5. session hygiene ----
    queued = run_counts.get("queued", 0)
    running = run_counts.get("running", 0)
    completed = run_counts.get("completed", 0)
    failed = run_counts.get("failed", 0)
    total = sum(run_counts.values())
    if queued > 0:
        dimensions.append({
            "id": "session-hygiene",
            "label": "Session hygiene",
            "status": "evidence",
            "detail": f"{queued} queued run{'s' if queued > 1 else ''} waiting to start",
            "evidence": run_counts,
        })
        recommend(
            "unblock-runs",
            "session-hygiene",
            f"{queued} run{'s' if queued > 1 else ''} waiting in the queue",
            "Queued runs hold approvals. Dispatch or cancel them so the queue stays clean.",
            {"queued": queued},
            {"type": "navigate", "label": "Open work", "target": "work"},
        )
    elif total > 0:
        dimensions.append({
            "id": "session-hygiene",
            "label": "Session hygiene",
            "status": "evidence",
            "detail": f"{completed} completed, {running} running, {failed} failed",
            "evidence": run_counts,
        })
    else:
        dimensions.append({
            "id": "session-hygiene",
            "label": "Session hygiene",
            "status": "no-evidence",
            "detail": "No runs yet. The first directive will appear here step by step.",
            "evidence": {"runs": 0},
        })

    # ---- 6. workflow patterns ----
    if awaiting_plans > 0 or planned_plans > 0:
        dimensions.append({
            "id": "workflow-patterns",
            "label": "Workflow patterns",
            "status": "evidence",
            "detail": f"{awaiting_plans} awaiting approval, {planned_plans} planned",
            "evidence": {"awaiting_approval": awaiting_plans, "planned": planned_plans},
        })
        recommend(
            "review-routes",
            "workflow-patterns",
            f"{awaiting_plans + planned_plans} route{'s' if awaiting_plans + planned_plans > 1 else ''} waiting for your call",
            "Ari mapped these routes and stopped for your approval. Review them so work can start.",
            {"awaiting_approval": awaiting_plans, "planned": planned_plans},
            {"type": "navigate", "label": "Review routes", "target": "approvals"},
        )
    else:
        dimensions.append({
            "id": "workflow-patterns",
            "label": "Workflow patterns",
            "status": "no-evidence",
            "detail": "No routed plans waiting. Routing decisions remain inspectable before execution.",
            "evidence": {"awaiting_approval": 0, "planned": 0},
        })

    # ---- 7. external opportunity ----
    dimensions.append({
        "id": "external-opportunity",
        "label": "External opportunity",
        "status": "unavailable",
        "detail": "No permitted source adapter is connected yet, so no opportunity claim is made.",
        "evidence": {},
    })

    # ---- 8. business outcomes ----
    dimensions.append({
        "id": "business-outcomes",
        "label": "Business outcomes",
        "status": "unavailable",
        "detail": "Revenue and outcome signals appear only from verified sources. None are connected yet.",
        "evidence": {},
    })

    accepted = {str(k): v for k, v in store.state().get("accepted", {}).items()}
    dismissed = {str(k): v for k, v in store.state().get("dismissed", {}).items()}

    return {
        "schema_version": SCHEMA_VERSION,
        "generated_at": utc_now(),
        "privacy": {
            "synthetic": False,
            "contents_included": False,
            "evidence_sources": ["memory store", "runtime sessions", "skill proposals", "orchestration plans", "runtime catalog"],
        },
        "dimensions": dimensions,
        "recommendations": [
            rec for rec in recommendations
            if rec["id"] not in dismissed and rec["id"] not in accepted
        ],
        "accepted": accepted,
        "dismissed": dismissed,
    }
