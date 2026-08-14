"""Training-data collector for the CEO (chief-of-staff) fine-tune.

Every owner-approved routing dispatch is appended as one JSON line to a
local file OUTSIDE the repository (%LOCALAPPDATA%\\hermes\\agios\\training).
This is Ruben's own decision history on his own machine, used exclusively
as fine-tuning data for the AGIOS CEO model. Nothing here is ever sent to
a third party; deleting the file removes the dataset.

The file deliberately holds the objective text (training needs real
examples), but credential-like text is rejected before writing.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Mapping

from .contracts import utc_now

# Mirrors the secret guard used at routing time so training data can
# never carry credential-like text either.
SECRET_TEXT = re.compile(
    r"(sk|pk|api|token)[-_][A-Za-z0-9_-]{12,}", re.IGNORECASE
)


class TrainingCollector:
    """Append-only local JSONL of approved routing decisions."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def record_route(
        self,
        plan: Mapping[str, Any],
        *,
        mode: str,
        runtime_id: str,
    ) -> int:
        objective = str(plan.get("objective") or "").strip()
        if SECRET_TEXT.search(objective):
            return self.count()
        record = {
            "kind": "route",
            "created_at": utc_now(),
            "objective": objective,
            "data_class": str(plan.get("data_class") or "internal"),
            "business_id": str(plan.get("business_id") or ""),
            "department_id": str(plan.get("department_id") or ""),
            "lead_agent_id": str(plan.get("lead_agent_id") or ""),
            "model_id": str(plan.get("model_id") or ""),
            "mode": mode,
            "runtime_id": runtime_id,
        }
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
        return self.count()

    def count(self) -> int:
        if not self.path.exists():
            return 0
        try:
            with self.path.open("r", encoding="utf-8") as handle:
                return sum(1 for line in handle if line.strip())
        except OSError:
            return 0
