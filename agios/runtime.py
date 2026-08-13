from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping, Protocol

from .contracts import WorkOrder


@dataclass(frozen=True)
class RuntimeHealth:
    runtime_id: str
    status: str
    detail_code: str


class RuntimeAdapter(Protocol):
    """Boundary implemented by Hermes and future OpenClaw/Cline/Pokee adapters."""

    runtime_id: str

    def health(self) -> RuntimeHealth: ...

    def dispatch(self, work_order: WorkOrder) -> Mapping[str, Any]: ...


class RecordingAdapter:
    """Side-effect-free adapter used by Foundation tests and demonstrations."""

    def __init__(self, runtime_id: str = "fixture") -> None:
        self.runtime_id = runtime_id
        self.dispatched: list[Mapping[str, Any]] = []

    def health(self) -> RuntimeHealth:
        return RuntimeHealth(self.runtime_id, "healthy", "fixture-ready")

    def dispatch(self, work_order: WorkOrder) -> Mapping[str, Any]:
        envelope = work_order.envelope()
        self.dispatched.append(envelope)
        return {"accepted": True, "task_id": work_order.task_id}
