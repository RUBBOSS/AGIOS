from __future__ import annotations

import tempfile
from pathlib import Path
from typing import Any, Mapping

from .config import load_config
from .contracts import Handoff, WorkOrder, digest
from .events import EventJournal
from .routing import ModelRouter
from .runtime import RecordingAdapter


def run_demo(
    *, config_path: str | Path, state_path: str | Path | None = None
) -> Mapping[str, Any]:
    config = load_config(config_path)
    temporary: tempfile.TemporaryDirectory[str] | None = None
    if state_path is None:
        temporary = tempfile.TemporaryDirectory(prefix="agios-demo-")
        selected_state = Path(temporary.name) / "events.sqlite3"
    else:
        selected_state = Path(state_path)

    router = ModelRouter(config)
    adapter = RecordingAdapter("fixture")
    correlation_id = "demo-research-workflow"
    public_order = WorkOrder(
        project_id="agios-demo",
        task_id="research-public",
        requester_id="default",
        workload="research",
        data_class="public",
        objective_digest=digest("Compare governed agent-runtime adapter patterns"),
        input_refs=("evidence:official-runtime-docs",),
        budget_tokens=12000,
        budget_seconds=900,
    )

    journal = EventJournal(selected_state)
    created = journal.append(
        kind="workflow.created",
        actor_id="default",
        subject_id=public_order.task_id,
        correlation_id=correlation_id,
        payload={"work_order": public_order.envelope()},
        idempotency_key="demo-workflow-created",
    )
    adapter.dispatch(public_order)
    research_handoff = Handoff(
        task_id=public_order.task_id,
        sender_id="default",
        recipient_id="researcher",
        expected_result_schema="evidence-brief-v1",
        evidence_refs=("evidence:official-runtime-docs",),
    )
    handoff_event = journal.append(
        kind="handoff.created",
        actor_id="default",
        subject_id=public_order.task_id,
        correlation_id=correlation_id,
        causation_id=created.event_id,
        payload=research_handoff.envelope(),
        idempotency_key="demo-research-handoff",
    )
    research_route = router.select(
        task_id=public_order.task_id,
        workload="research",
        data_class="public",
        available_models={"nemotron-hosted", "gpt-5.6-terra", "qwen3.5-hermes"},
    )
    journal.append(
        kind="route.selected",
        actor_id="agios-router",
        subject_id=public_order.task_id,
        correlation_id=correlation_id,
        causation_id=handoff_event.event_id,
        payload=research_route.envelope(),
        idempotency_key="demo-research-route",
    )
    journal.append(
        kind="work.result",
        actor_id="researcher",
        subject_id=public_order.task_id,
        correlation_id=correlation_id,
        payload={"worker_id": "researcher", "result_ref": "artifact:research-brief", "status": "completed"},
        idempotency_key="demo-research-result",
    )
    review_handoff = Handoff(
        task_id=public_order.task_id,
        sender_id="researcher",
        recipient_id="reviewer",
        expected_result_schema="review-verdict-v1",
        evidence_refs=("artifact:research-brief",),
    )
    journal.append(
        kind="handoff.created",
        actor_id="researcher",
        subject_id=public_order.task_id,
        correlation_id=correlation_id,
        payload=review_handoff.envelope(),
        idempotency_key="demo-review-handoff",
    )
    journal.close()

    # A new connection represents a process restart. Pending work is replayed.
    journal = EventJournal(selected_state)
    recovered = journal.recovery_plan(correlation_id)
    review_route = router.select(
        task_id=public_order.task_id,
        workload="review",
        data_class="public",
        available_models={"gpt-5.6-sol", "ornith-hermes"},
    )
    journal.append(
        kind="route.selected",
        actor_id="agios-router",
        subject_id=public_order.task_id,
        correlation_id=correlation_id,
        payload=review_route.envelope(),
        idempotency_key="demo-review-route",
    )
    journal.append(
        kind="work.result",
        actor_id="reviewer",
        subject_id=public_order.task_id,
        correlation_id=correlation_id,
        payload={"worker_id": "reviewer", "result_ref": "artifact:review-verdict", "status": "accepted"},
        idempotency_key="demo-review-result",
    )
    confidential_route = router.select(
        task_id="private-probe",
        workload="research",
        data_class="customer_restricted",
        available_models={"nemotron-hosted", "opencode-free", "qwen3.5-hermes"},
    )
    journal.append(
        kind="route.selected",
        actor_id="agios-router",
        subject_id="private-probe",
        correlation_id=correlation_id,
        payload=confidential_route.envelope(),
        idempotency_key="demo-private-route",
    )
    journal.append(
        kind="workflow.completed",
        actor_id="default",
        subject_id=public_order.task_id,
        correlation_id=correlation_id,
        payload={"status": "completed", "receipt_ref": "artifact:demo-audit-receipt"},
        idempotency_key="demo-workflow-completed",
    )
    summary = journal.summary()
    chain_valid = journal.verify_chain()
    journal.close()
    if temporary is not None:
        temporary.cleanup()
    return {
        "schema_version": 1,
        "status": "passed" if chain_valid else "failed",
        "delegated_agents": ["researcher", "reviewer"],
        "recovered_recipients": list(recovered),
        "public_routes": [research_route.model_id, review_route.model_id],
        "customer_route": confidential_route.model_id,
        "customer_route_location": confidential_route.location,
        "external_customer_data_blocked": confidential_route.location == "local",
        "journal": summary,
    }
