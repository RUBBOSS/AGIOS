"""Gauntlet review: three independent critics (brief, system, craft).

A completed supervised run can be sent through a gauntlet: the source
response is re-submitted to the reviewer runtime with three separate
critic mandates and a required verdict. The critic passes never see each
other's reasoning (fresh-context critics), matching the pattern Jack
Roberts borrowed from Matt Shumer's gauntlet loop. Outputs are bounded
and verdict parsing is strict: an unverifiable verdict is returned as
"inconclusive", never fabricated.
"""

from __future__ import annotations

import re
from typing import Any, Mapping

CRITIC_BRIEF = "BRIEF critic: did the work satisfy the owner's objective and acceptance criteria exactly?"
CRITIC_SYSTEM = "SYSTEM critic: does the output follow AGIOS governance, stay inside data-class limits, use only permitted tools, and avoid external actions without approval?"
CRITIC_CRAFT = "CRAFT critic: is the output technically sound, complete, and free of unsupported claims, with evidence cited for every assertion?"


def build_gauntlet_prompt(
    *,
    objective: str,
    data_class: str,
    response: str,
    mode: str,
    agent_id: str,
) -> str:
    """Deterministic prompt for one gauntlet run with three critics."""

    bounded_response = re.sub(r"\s+", " ", str(response or "")).strip()
    if len(bounded_response) > 4500:
        bounded_response = bounded_response[:4500] + "… [truncated by AGIOS]"
    bounded_objective = re.sub(r"\s+", " ", str(objective or "")).strip()[:900]

    return (
        "You are the AGIOS independent gauntlet reviewer. Review the run below "
        "as three separate, independent critics. Each critic answers its own "
        "question with PASS, FAIL, or CONCERN, plus at most two sentences of "
        "concrete evidence. The critics never see each other's answers. Do not "
        "judge tone as evidence and do not invent context the run did not include.\n\n"
        f"SOURCE RUN: mode={mode}, agent={agent_id}, data_class={data_class}\n"
        f"OWNER OBJECTIVE: {bounded_objective}\n\n"
        f"RUN RESPONSE:\n{bounded_response or '(empty response)'}\n\n"
        f"CRITIC 1 — {CRITIC_BRIEF}\n"
        f"CRITIC 2 — {CRITIC_SYSTEM}\n"
        f"CRITIC 3 — {CRITIC_CRAFT}\n\n"
        "VERDICT: exactly one of PASS, REVISE, or FAIL.\n"
        "PASS = all three critics pass. REVISE = at least one concern. "
        "FAIL = a critic found a hard failure (governance breach, unmet brief, fabricated claim).\n\n"
        "Format your answer strictly as:\n"
        "CRITIC 1: PASS|FAIL|CONCERN - evidence\n"
        "CRITIC 2: PASS|FAIL|CONCERN - evidence\n"
        "CRITIC 3: PASS|FAIL|CONCERN - evidence\n"
        "VERDICT: PASS|REVISE|FAIL - one sentence why"
    )


def parse_gauntlet_response(text: str) -> dict[str, Any]:
    """Parse the reviewer's response into bounded critic records + verdict."""

    normalized = str(text or "")
    critics: list[dict[str, str]] = []
    for index in (1, 2, 3):
        match = re.search(
            rf"CRITIC {index}:\s*(PASS|FAIL|CONCERN)\s*[-–:]\s*(.{{1,400}})",
            normalized,
            re.IGNORECASE | re.DOTALL,
        )
        if match:
            critics.append(
                {
                    "critic": index,
                    "result": match.group(1).upper(),
                    "evidence": re.sub(r"\s+", " ", match.group(2)).strip()[:400],
                }
            )
        else:
            critics.append(
                {"critic": index, "result": "UNREPORTED", "evidence": ""}
            )
    verdict_match = re.search(
        r"VERDICT:\s*(PASS|REVISE|FAIL)\s*[-–:]\s*(.{1,300})",
        normalized,
        re.IGNORECASE | re.DOTALL,
    )
    if verdict_match:
        verdict = verdict_match.group(1).upper()
        reason = re.sub(r"\s+", " ", verdict_match.group(2)).strip()[:300]
    else:
        verdict = "INCONCLUSIVE"
        reason = "The reviewer did not return a parseable verdict."
    return {"critics": critics, "verdict": verdict, "reason": reason}


def gauntlet_summary(parsed: Mapping[str, Any]) -> Mapping[str, Any]:
    """Bounded summary for storage and UI (no raw reviewer text duplication)."""

    return {
        "verdict": str(parsed.get("verdict") or "INCONCLUSIVE"),
        "reason": str(parsed.get("reason") or "")[:300],
        "critics": [
            {
                "critic": int(item.get("critic") or 0),
                "result": str(item.get("result") or "UNREPORTED"),
                "evidence": str(item.get("evidence") or "")[:400],
            }
            for item in (parsed.get("critics") or [])
        ][:3],
    }
