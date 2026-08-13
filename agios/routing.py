from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from .config import AGIOSConfig
from .contracts import RouteDecision


class RoutingError(RuntimeError):
    """No model can satisfy the requested workload and privacy policy."""


@dataclass(frozen=True)
class ExternalApproval:
    approval_id: str
    task_id: str
    model_id: str
    data_class: str

    def matches(self, *, task_id: str, model_id: str, data_class: str) -> bool:
        return (
            self.task_id == task_id
            and self.model_id == model_id
            and self.data_class == data_class
        )


class ModelRouter:
    def __init__(self, config: AGIOSConfig) -> None:
        self.config = config

    def select(
        self,
        *,
        task_id: str,
        workload: str,
        data_class: str,
        available_models: Iterable[str],
        external_approval: ExternalApproval | None = None,
    ) -> RouteDecision:
        if workload not in self.config.routes:
            raise RoutingError("unknown workload")
        policy = self.config.data_classes.get(data_class)
        if policy is None:
            raise RoutingError("unknown data class")
        if policy.get("model_access") == "denied":
            raise RoutingError("data class is denied to every model")

        available = set(available_models)
        considered: list[str] = []
        for model_id in self.config.routes[workload]:
            considered.append(model_id)
            if model_id not in available:
                continue
            model = self.config.models[model_id]
            if data_class not in model.get("allowed_data_classes", []):
                continue
            if not self._privacy_allows(
                model_id=model_id,
                model=model,
                policy=policy,
                task_id=task_id,
                data_class=data_class,
                external_approval=external_approval,
            ):
                continue
            approval_id = (
                external_approval.approval_id
                if model.get("location") == "external"
                and external_approval is not None
                and external_approval.matches(
                    task_id=task_id, model_id=model_id, data_class=data_class
                )
                else None
            )
            return RouteDecision(
                task_id=task_id,
                workload=workload,
                data_class=data_class,
                model_id=model_id,
                provider=str(model["provider"]),
                location=str(model["location"]),
                trust=str(model["trust"]),
                cost_status=str(model["cost_status"]),
                external_approval_id=approval_id,
                considered=tuple(considered),
            )
        raise RoutingError("no available model satisfies routing and privacy policy")

    @staticmethod
    def _privacy_allows(
        *,
        model_id: str,
        model: object,
        policy: object,
        task_id: str,
        data_class: str,
        external_approval: ExternalApproval | None,
    ) -> bool:
        model_map = model if isinstance(model, dict) else {}
        policy_map = policy if isinstance(policy, dict) else {}
        if model_map.get("location") == "local":
            return True
        external_policy = policy_map.get("external_policy")
        trust = model_map.get("trust")
        if external_policy == "allowed":
            return True
        if external_policy == "trusted-only":
            return trust == "trusted"
        if external_policy == "explicit-approval":
            return (
                trust == "trusted"
                and external_approval is not None
                and external_approval.matches(
                    task_id=task_id, model_id=model_id, data_class=data_class
                )
            )
        return False
