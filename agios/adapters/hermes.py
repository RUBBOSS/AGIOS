from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Callable, Iterable, Mapping


ProfileLoader = Callable[[], Iterable[Any]]
CronLoader = Callable[[], Iterable[Mapping[str, Any]]]


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _clean_text(value: Any, *, limit: int = 240) -> str:
    return str(value or "").strip()[:limit]


def _safe_int(value: Any) -> int:
    try:
        return max(0, int(value))
    except (TypeError, ValueError, OverflowError):
        return 0


def _default_profile_loader() -> Iterable[Any]:
    from hermes_cli.profiles import list_profiles

    return list_profiles()


def _default_cron_loader() -> Iterable[Mapping[str, Any]]:
    from cron.jobs import list_jobs

    return list_jobs(include_disabled=True)


def collect_hermes_snapshot(
    *,
    profile_loader: ProfileLoader | None = None,
    cron_loader: CronLoader | None = None,
) -> dict[str, Any]:
    """Return an allowlisted, read-only snapshot of the local Hermes runtime.

    Hermes records include paths, prompts, scripts, delivery configuration and
    credentials. This boundary deliberately copies only fields needed by AGIOS.
    """

    load_profiles = profile_loader or _default_profile_loader
    load_cron = cron_loader or _default_cron_loader
    issues: list[str] = []

    try:
        raw_profiles = list(load_profiles())
        profiles = [
            {
                "id": _clean_text(getattr(profile, "name", None), limit=80),
                "provider": _clean_text(getattr(profile, "provider", None), limit=100),
                "model": _clean_text(getattr(profile, "model", None), limit=160),
                "description": _clean_text(getattr(profile, "description", None)),
                "skill_count": _safe_int(getattr(profile, "skill_count", 0)),
                "gateway_running": bool(getattr(profile, "gateway_running", False)),
                "is_default": bool(getattr(profile, "is_default", False)),
            }
            for profile in raw_profiles
            if _clean_text(getattr(profile, "name", None), limit=80)
        ]
        profiles.sort(key=lambda item: (not item["is_default"], item["id"]))
        profiles_status = "healthy"
    except (ImportError, OSError, RuntimeError, ValueError, TypeError):
        profiles = []
        profiles_status = "unavailable"
        issues.append("profiles_unavailable")

    try:
        raw_jobs = list(load_cron())
        schedules = []
        for job in raw_jobs:
            if not isinstance(job, Mapping):
                continue
            schedule = job.get("schedule")
            schedule_display = ""
            if isinstance(schedule, Mapping):
                schedule_display = _clean_text(schedule.get("display"), limit=100)
            schedules.append(
                {
                    "id": _clean_text(job.get("id"), limit=80),
                    "name": _clean_text(job.get("name"), limit=160),
                    "state": _clean_text(job.get("state"), limit=40) or "unknown",
                    "enabled": job.get("enabled", True) is not False,
                    "schedule": _clean_text(job.get("schedule_display"), limit=100)
                    or schedule_display,
                    "last_run_at": _clean_text(job.get("last_run_at"), limit=64) or None,
                    "next_run_at": _clean_text(job.get("next_run_at"), limit=64) or None,
                    "last_status": _clean_text(job.get("last_status"), limit=40) or None,
                }
            )
        schedules.sort(key=lambda item: (item["next_run_at"] is None, item["next_run_at"] or ""))
        schedules_status = "healthy"
    except (ImportError, OSError, RuntimeError, ValueError, TypeError):
        schedules = []
        schedules_status = "unavailable"
        issues.append("schedules_unavailable")

    return {
        "schema_version": 1,
        "runtime": "hermes",
        "status": "healthy" if not issues else "degraded",
        "generated_at": _utc_now(),
        "privacy": {"mode": "allowlisted_metadata", "prompts_included": False, "writes_enabled": False},
        "profiles": {"status": profiles_status, "items": profiles},
        "schedules": {"status": schedules_status, "items": schedules},
        "gateway_running": any(item["gateway_running"] for item in profiles),
        "issues": issues,
    }
