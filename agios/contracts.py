from __future__ import annotations

import hashlib
import json
import re
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping


ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9._:-]{0,127}$")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=True, separators=(",", ":"), sort_keys=True)


def digest(value: Any) -> str:
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def _validate_id(value: str, label: str) -> None:
    if not isinstance(value, str) or ID_PATTERN.fullmatch(value) is None:
        raise ValueError(f"{label} is invalid")


@dataclass(frozen=True)
class WorkOrder:
    project_id: str
    task_id: str
    requester_id: str
    workload: str
    data_class: str
    objective_digest: str
    input_refs: tuple[str, ...] = ()
    budget_tokens: int | None = None
    budget_seconds: int | None = None

    def __post_init__(self) -> None:
        for label, value in (
            ("project_id", self.project_id),
            ("task_id", self.task_id),
            ("requester_id", self.requester_id),
            ("workload", self.workload),
            ("data_class", self.data_class),
        ):
            _validate_id(value, label)
        if not re.fullmatch(r"[0-9a-f]{64}", self.objective_digest):
            raise ValueError("objective_digest must be a SHA-256 digest")
        if any(
            not ref.startswith(("artifact:", "evidence:", "memory:"))
            or len(ref) > 512
            for ref in self.input_refs
        ):
            raise ValueError("inputs must be bounded artifact, evidence, or memory references")
        for value in (self.budget_tokens, self.budget_seconds):
            if value is not None and value <= 0:
                raise ValueError("budgets must be positive")

    def envelope(self) -> Mapping[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class Handoff:
    task_id: str
    sender_id: str
    recipient_id: str
    expected_result_schema: str
    evidence_refs: tuple[str, ...] = ()
    unresolved_questions: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        for label, value in (
            ("task_id", self.task_id),
            ("sender_id", self.sender_id),
            ("recipient_id", self.recipient_id),
            ("expected_result_schema", self.expected_result_schema),
        ):
            _validate_id(value, label)
        if self.sender_id == self.recipient_id:
            raise ValueError("handoff sender and recipient must differ")

    def envelope(self) -> Mapping[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class ApprovalRequest:
    category: str
    requester_id: str
    task_id: str
    action_digest: str
    destination_digest: str | None
    expires_at: str
    approval_id: str = field(default_factory=lambda: str(uuid.uuid4()))

    def __post_init__(self) -> None:
        for label, value in (
            ("category", self.category),
            ("requester_id", self.requester_id),
            ("task_id", self.task_id),
        ):
            _validate_id(value, label)
        for label, value in (
            ("action_digest", self.action_digest),
            ("destination_digest", self.destination_digest),
        ):
            if value is not None and re.fullmatch(r"[0-9a-f]{64}", value) is None:
                raise ValueError(f"{label} must be a SHA-256 digest")

    def matches(self, *, action: Any, destination: Any | None) -> bool:
        return self.action_digest == digest(action) and self.destination_digest == (
            digest(destination) if destination is not None else None
        )

    def envelope(self) -> Mapping[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class RouteDecision:
    task_id: str
    workload: str
    data_class: str
    model_id: str
    provider: str
    location: str
    trust: str
    cost_status: str
    external_approval_id: str | None
    considered: tuple[str, ...]

    def envelope(self) -> Mapping[str, Any]:
        return asdict(self)
