from __future__ import annotations

import asyncio
import hmac
import hashlib
import json
import secrets
import base64
import binascii
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Literal

from fastapi import Cookie, FastAPI, Header, HTTPException, Query, Request, WebSocket
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .config import ConfigError, load_config
from .control_plane import build_command_center
from .a2a import A2AService, A2A_VERSION
from .dreaming import DreamingStore, build_dreaming_digest
from .gauntlet import build_gauntlet_prompt
from .learning import LearningStore, LearningStoreError, build_brain_file
from .operational import OperationalError, OperationalService, default_state_dir
from .adapters.runtimes import collect_runtime_catalog
from .orchestration import OrchestrationError, build_routing_plan, classify_ari_intent
from .surfaces import (
    collect_surfaces,
    launch_surface,
    pump_pty,
    spawn_surface_pty,
)


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "configs" / "agios.json"
DEFAULT_FRONTEND = ROOT / "apps" / "agios-command-center" / "dist"


class RunRequest(BaseModel):
    mode: Literal["chat", "goal", "workspace"] = "chat"
    agent_id: str = Field(min_length=1, max_length=128)
    objective: str = Field(min_length=1, max_length=8000)
    data_class: Literal["public", "internal", "private_business", "customer_restricted"] = "internal"
    project_id: str | None = Field(default=None, max_length=128)
    skill_ids: list[str] = Field(default_factory=list, max_length=3)
    memory_ids: list[str] = Field(default_factory=list, max_length=12)
    model_id: str | None = Field(default=None, min_length=1, max_length=160)
    runtime_id: str = Field(default="hermes", min_length=1, max_length=80)
    workspace_id: str | None = Field(default=None, max_length=128)
    workspace_access: Literal["none", "read", "write"] = "none"
    vision_asset_ids: list[str] = Field(default_factory=list, max_length=3)


class OrchestrationPlanRequest(BaseModel):
    objective: str = Field(min_length=1, max_length=7200)
    data_class: Literal["public", "internal", "private_business", "customer_restricted"] = "internal"
    business_id: str | None = Field(default=None, max_length=128)


class AriRouteRequest(OrchestrationPlanRequest):
    intent: Literal["auto", "conversation", "work"] = "auto"


class OrchestrationDispatchRequest(BaseModel):
    plan_digest: str = Field(pattern=r"^[0-9a-f]{64}$")
    workspace_id: str | None = Field(default=None, max_length=128)
    runtime_id: Literal["hermes", "codex"] = "hermes"


class VoiceTranscriptionRequest(BaseModel):
    data_url: str = Field(min_length=1, max_length=14_000_000)
    mime_type: str = Field(default="audio/webm", min_length=1, max_length=80)


class VoiceSynthesisRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


class SkillProposalRequest(BaseModel):
    skill_name: str = Field(min_length=1, max_length=100)
    change_kind: Literal["create", "update"]
    rationale: str = Field(min_length=1, max_length=1200)
    evidence_run_ids: list[str] = Field(default_factory=list, max_length=12)


class SkillDraftRequest(BaseModel):
    body: str = Field(min_length=1, max_length=20_000)


class SkillInstallRequest(BaseModel):
    draft_digest: str = Field(pattern=r"^[0-9a-f]{64}$")


class ContentDraftRequest(BaseModel):
    agent_id: str = Field(min_length=1, max_length=128)
    business_id: str = Field(min_length=1, max_length=128)
    channel: Literal["social", "email", "landing", "listing", "ad"]
    objective: str = Field(min_length=1, max_length=400)
    body: str = Field(min_length=1, max_length=12_000)


class ContentDraftReviewRequest(BaseModel):
    approved: bool


class LeadCaptureRequest(BaseModel):
    agent_id: str = Field(min_length=1, max_length=128)
    business_id: str = Field(min_length=1, max_length=128)
    contact_label: str = Field(min_length=1, max_length=120)
    source: str = Field(min_length=1, max_length=120)
    notes: str = Field(default="", max_length=800)


class LeadAdvanceRequest(BaseModel):
    agent_id: str = Field(min_length=1, max_length=128)
    stage: Literal[
        "captured", "qualified", "outreach_drafted", "awaiting_approval",
        "approved", "closed", "discarded",
    ]
    evidence_run_ids: list[str] = Field(default_factory=list, max_length=12)


class WorkspaceRequest(BaseModel):
    label: str = Field(min_length=1, max_length=120)
    root_path: str = Field(min_length=3, max_length=1024)
    data_class: Literal["public", "internal", "private_business", "customer_restricted"]
    write_allowed: bool = False


class VisionAssetRequest(BaseModel):
    label: str = Field(default="image", min_length=1, max_length=120)
    data_url: str = Field(min_length=1, max_length=12_000_000)
    mime_type: Literal["image/png", "image/jpeg", "image/webp"]
    data_class: Literal["public", "internal", "private_business", "customer_restricted"]
    retention: Literal["session", "24_hours", "manual"] = "session"


class ApprovalBody(BaseModel):
    approval_digest: str = Field(pattern=r"^[0-9a-f]{64}$")


class LearnRequest(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    source_name: str = Field(default="pasted", min_length=1, max_length=160)
    text: str = Field(min_length=1, max_length=200_000)


class MemoryRequest(BaseModel):
    scope_kind: Literal["portfolio", "business", "department", "project", "private"]
    scope_id: str = Field(min_length=1, max_length=128)
    title: str = Field(min_length=1, max_length=160)
    body: str = Field(min_length=1, max_length=4000)
    created_by: str = Field(default="owner", min_length=1, max_length=128)
    trust: Literal["high", "medium", "low"] = "medium"


class RetrievalRequest(BaseModel):
    agent_id: str = Field(default="default", min_length=1, max_length=128)
    query: str = Field(min_length=1, max_length=8000)
    project_id: str | None = Field(default=None, max_length=128)
    limit: int = Field(default=8, ge=1, le=12)


def create_app(
    *,
    config_path: str | Path = DEFAULT_CONFIG,
    frontend_path: str | Path = DEFAULT_FRONTEND,
    journal_path: str | Path | None = None,
    state_dir: str | Path | None = None,
    operational_service: OperationalService | None = None,
) -> FastAPI:
    config = load_config(config_path)
    frontend = Path(frontend_path).expanduser().resolve()
    if not frontend.joinpath("index.html").is_file():
        raise RuntimeError("AGIOS frontend is not built")

    owns_service = operational_service is None
    service = operational_service or OperationalService(
        config=config,
        state_dir=state_dir or default_state_dir(),
        journal_path=journal_path,
    )
    selected_journal = journal_path or service.journal_path
    dreaming_store = DreamingStore(Path(service.state_dir) / "dreaming.json")
    learning_store = LearningStore(service.state_dir)
    a2a = A2AService(
        config=config,
        operational=service,
        state_dir=service.state_dir,
        journal_path=Path(selected_journal).expanduser().absolute(),
    )
    session_token = secrets.token_urlsafe(32)
    csrf_token = secrets.token_urlsafe(32)
    @asynccontextmanager
    async def lifespan(_: FastAPI):
        try:
            yield
        finally:
            if owns_service:
                service.executor.shutdown(wait=False)

    app = FastAPI(
        title="AGIOS Command Center",
        version="0.5.0",
        docs_url=None,
        redoc_url=None,
        lifespan=lifespan,
    )
    app.state.operational_service = service
    app.state.a2a_service = a2a

    @app.middleware("http")
    async def private_runtime_headers(request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith(("/api/v1/hermes", "/api/v1/orchestrator", "/api/v1/memory", "/api/v1/retrieval", "/api/v1/a2a", "/api/v1/voice", "/api/v1/vision", "/api/v1/workspaces", "/api/v1/runtimes", "/api/v1/agents", "/api/v1/growth", "/api/v1/surfaces", "/api/v1/dreaming", "/api/v1/learn", "/api/v1/gauntlet", "/a2a/")):
            response.headers["Cache-Control"] = "no-store"
            response.headers["X-Frame-Options"] = "DENY"
        return response

    def require_local_session(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> None:
        if request.url.hostname not in {"127.0.0.1", "localhost", "::1"}:
            raise HTTPException(status_code=403, detail="loopback host required")
        origin = request.headers.get("origin")
        port = request.url.port or 9120
        if origin and origin not in {
            f"http://127.0.0.1:{port}",
            f"http://localhost:{port}",
            f"http://[::1]:{port}",
        }:
            raise HTTPException(status_code=403, detail="cross-origin request denied")
        if not agios_session or not hmac.compare_digest(agios_session, session_token):
            raise HTTPException(status_code=401, detail="local session required")
        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            if not x_agios_csrf or not hmac.compare_digest(x_agios_csrf, csrf_token):
                raise HTTPException(status_code=403, detail="CSRF check failed")

    def require_loopback(request: Request) -> None:
        if request.url.hostname not in {"127.0.0.1", "localhost", "::1"}:
            raise HTTPException(status_code=403, detail="loopback host required")

    @app.get("/api/v1/health")
    def health() -> dict[str, object]:
        return {"schema_version": 1, "status": "healthy", "product": "agios"}

    @app.get("/api/v1/command-center")
    def command_center() -> dict[str, object]:
        try:
            result = build_command_center(config, journal_path=selected_journal)
            result["operational"] = {
                "status": "ready",
                "runtime": "hermes",
                "writes_enabled": True,
                "approval_mode": "exact-run",
                "shared_memory": service.memory.summary(),
                "retrieval": service.retrieval.summary(),
                "a2a": a2a.summary(),
                "orchestration": service.orchestration.summary(),
                "runtime_adapters": collect_runtime_catalog(config.systems),
                "workspaces": {"registered": len(service.workspaces.list())},
                "vision": {"assets": len(service.vision.list()), "max_bytes": 8 * 1024 * 1024},
            }
            installed = [item for item in service.growth.list() if item["status"] == "installed"]
            shared_skills = result["shared_fabric"]["skills"]
            known_skill_ids = {item["id"] for item in shared_skills["items"]}
            for proposal in installed:
                skill_id = str(proposal["skill_name"])
                if skill_id in known_skill_ids:
                    continue
                shared_skills["items"].append(
                    {
                        "id": skill_id,
                        "name": skill_id,
                        "category": "agios",
                        "description": "Owner-validated AGIOS professional skill",
                        "source": "agios",
                    }
                )
                known_skill_ids.add(skill_id)
            if installed:
                shared_skills["inventory"] = len(shared_skills["items"])
                shared_skills["categories"]["agios"] = sum(
                    item.get("category") == "agios" for item in shared_skills["items"]
                )
                result["summary"]["shared_skills"] = shared_skills["inventory"]
            result["privacy"]["runtime_writes_enabled"] = True
            return result
        except (ConfigError, OSError, RuntimeError, ValueError) as exc:
            raise HTTPException(status_code=503, detail="command center unavailable") from exc

    @app.get("/api/v1/voice/capabilities")
    def voice_capabilities(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {"schema_version": 1, **service.voice.capabilities()}

    @app.post("/api/v1/voice/transcribe")
    def transcribe_voice(
        body: VoiceTranscriptionRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        data_url = body.data_url.strip()
        if not data_url.startswith("data:") or "," not in data_url:
            raise HTTPException(status_code=400, detail="invalid audio payload")
        header, encoded = data_url.split(",", 1)
        if ";base64" not in header:
            raise HTTPException(status_code=400, detail="audio payload must be base64 encoded")
        try:
            audio = base64.b64decode(encoded, validate=True)
        except (binascii.Error, ValueError) as exc:
            raise HTTPException(status_code=400, detail="audio payload is not valid base64") from exc
        try:
            result = service.voice.transcribe(audio, body.mime_type)
            return {"schema_version": 1, **result}
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.post("/api/v1/voice/synthesize")
    def synthesize_voice(
        body: VoiceSynthesisRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            return {"schema_version": 1, **service.voice.synthesize(body.text)}
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    surfaces_by_id = {surface["id"]: surface for surface in config.surfaces}

    @app.get("/api/v1/surfaces")
    def list_surfaces(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {
            "schema_version": 1,
            "items": collect_surfaces(list(surfaces_by_id.values())),
        }

    @app.post("/api/v1/surfaces/{surface_id}/launch")
    def launch_surface_endpoint(
        surface_id: str,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        surface = surfaces_by_id.get(surface_id)
        if not surface or surface["kind"] == "terminal":
            raise HTTPException(status_code=404, detail="surface has no launch action")
        try:
            return {"schema_version": 1, **launch_surface(surface)}
        except (FileNotFoundError, ValueError) as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.websocket("/ws/shell/{surface_id}")
    async def shell_socket(websocket: WebSocket, surface_id: str) -> None:
        # Uvicorn reports real TCP peers; "testclient" only exists under
        # FastAPI's TestClient, which never leaves the local process.
        if websocket.client.host not in {"127.0.0.1", "::1", "testclient"}:
            await websocket.close(code=4403)
            return
        if not hmac.compare_digest(websocket.cookies.get("agios_session", ""), session_token):
            await websocket.close(code=4401)
            return
        surface = surfaces_by_id.get(surface_id)
        if not surface or surface["kind"] != "terminal":
            await websocket.close(code=4404)
            return
        await websocket.accept()
        try:
            pty_handle = await asyncio.get_running_loop().run_in_executor(
                None, spawn_surface_pty, surface
            )
        except (FileNotFoundError, ValueError, OSError):
            await websocket.send_text(chr(13) + chr(10) + "[x] terminal could not start" + chr(13) + chr(10))
            await websocket.close(code=4404)
            return
        stop_event = asyncio.Event()

        async def receive_input() -> None:
            try:
                while True:
                    message = await websocket.receive_text()
                    if message.startswith('{"type":"resize"'):
                        import json as _json

                        try:
                            payload = _json.loads(message)
                            cols = int(payload.get("cols", 100))
                            rows = int(payload.get("rows", 30))
                            pty_handle.resize(cols, rows)
                        except (ValueError, TypeError, _json.JSONDecodeError):
                            pass
                        continue
                    await asyncio.get_running_loop().run_in_executor(
                        None, pty_handle.write, message
                    )
            except Exception:
                pass
            finally:
                stop_event.set()

        receiver = asyncio.create_task(receive_input())
        try:
            await pump_pty(pty_handle, websocket.send_text, stop_event)
        finally:
            stop_event.set()
            pty_handle.terminate()
            receiver.cancel()
            await websocket.close()

    @app.get("/api/v1/agents/growth/proposals")
    def list_skill_proposals(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {"schema_version": 1, "items": service.growth.list()}

    @app.get("/api/v1/agents/{agent_id}/growth")
    def agent_growth(
        agent_id: str,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        if agent_id not in config.agents:
            raise HTTPException(status_code=404, detail="agent is not registered")
        completed = sum(
            item["status"] == "completed" for item in service.sessions.list(agent_id=agent_id, limit=100)
        )
        return {
            "schema_version": 1,
            "agent_id": agent_id,
            "verified_completions": completed,
            "proposals": service.growth.list(agent_id=agent_id),
        }

    @app.post("/api/v1/agents/{agent_id}/skill-proposals", status_code=201)
    def create_skill_proposal(
        agent_id: str,
        body: SkillProposalRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            proposal = service.create_skill_proposal(agent_id=agent_id, **body.model_dump())
            return {"schema_version": 1, "proposal": proposal}
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.post("/api/v1/agents/growth/proposals/{proposal_id}/approve")
    def approve_skill_proposal(
        proposal_id: str,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            return {"schema_version": 1, "proposal": service.approve_skill_proposal(proposal_id)}
        except OperationalError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @app.post("/api/v1/agents/growth/proposals/{proposal_id}/draft")
    def save_skill_draft(
        proposal_id: str,
        body: SkillDraftRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            return {"schema_version": 1, "proposal": service.save_skill_draft(proposal_id, body.body)}
        except OperationalError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @app.post("/api/v1/agents/growth/proposals/{proposal_id}/validate")
    def validate_skill_draft(
        proposal_id: str,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            return {"schema_version": 1, "proposal": service.validate_skill_draft(proposal_id)}
        except OperationalError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @app.post("/api/v1/agents/growth/proposals/{proposal_id}/install")
    def install_skill(
        proposal_id: str,
        body: SkillInstallRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            return {
                "schema_version": 1,
                "proposal": service.install_skill(proposal_id, body.draft_digest),
            }
        except OperationalError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @app.get("/api/v1/growth/drafts")
    def list_content_drafts(
        request: Request,
        agent_id: str | None = None,
        business_id: str | None = None,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {
            "schema_version": 1,
            "items": service.funnel.list_drafts(agent_id=agent_id, business_id=business_id),
        }

    @app.post("/api/v1/growth/drafts", status_code=201)
    def create_content_draft(
        body: ContentDraftRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            draft = service.create_content_draft(**body.model_dump())
            return {"schema_version": 1, "draft": draft}
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.post("/api/v1/growth/drafts/{draft_id}/submit")
    def submit_content_draft(
        draft_id: str,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            return {"schema_version": 1, "draft": service.submit_content_draft(draft_id)}
        except OperationalError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @app.post("/api/v1/growth/drafts/{draft_id}/review")
    def review_content_draft(
        draft_id: str,
        body: ContentDraftReviewRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            return {
                "schema_version": 1,
                "draft": service.review_content_draft(draft_id, approved=body.approved),
            }
        except OperationalError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @app.get("/api/v1/growth/leads")
    def list_leads(
        request: Request,
        agent_id: str | None = None,
        business_id: str | None = None,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {
            "schema_version": 1,
            "items": service.funnel.list_leads(agent_id=agent_id, business_id=business_id),
        }

    @app.post("/api/v1/growth/leads", status_code=201)
    def capture_lead(
        body: LeadCaptureRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            lead = service.capture_lead(**body.model_dump())
            return {"schema_version": 1, "lead": lead}
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.post("/api/v1/growth/leads/{lead_id}/advance")
    def advance_lead(
        lead_id: str,
        body: LeadAdvanceRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            lead = service.advance_lead(
                lead_id,
                agent_id=body.agent_id,
                stage=body.stage,
                evidence_run_ids=body.evidence_run_ids,
            )
            return {"schema_version": 1, "lead": lead}
        except OperationalError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @app.get("/api/v1/growth/summary")
    def growth_summary(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {"schema_version": 1, **service.funnel.summary()}

    @app.get("/api/v1/dreaming")
    def dreaming_digest(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        hermes_sessions = 0
        try:
            snapshot = build_command_center(config, journal_path=selected_journal)
            hermes_sessions = int(snapshot.get("sessions", {}).get("total") or 0)
        except (ConfigError, OSError, RuntimeError, ValueError):
            hermes_sessions = 0
        digest = build_dreaming_digest(
            memory_summary=service.memory.summary(),
            runs=service.sessions.list(limit=200),
            proposals=service.growth.list(),
            plans_summary=service.orchestration.summary(),
            runtime_catalog=collect_runtime_catalog(config.systems),
            hermes_session_count=hermes_sessions,
            store=dreaming_store,
        )
        return digest

    @app.post("/api/v1/dreaming/{recommendation_id}/accept")
    def dreaming_accept(
        recommendation_id: str,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        if not recommendation_id or len(recommendation_id) > 120 or "/" in recommendation_id or ".." in recommendation_id:
            raise HTTPException(status_code=400, detail="recommendation id is invalid")
        dreaming_store.accept(recommendation_id)
        return {"schema_version": 1, "accepted": recommendation_id}

    @app.post("/api/v1/dreaming/{recommendation_id}/dismiss")
    def dreaming_dismiss(
        recommendation_id: str,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        if not recommendation_id or len(recommendation_id) > 120 or "/" in recommendation_id or ".." in recommendation_id:
            raise HTTPException(status_code=400, detail="recommendation id is invalid")
        dreaming_store.dismiss(recommendation_id)
        return {"schema_version": 1, "dismissed": recommendation_id}

    @app.post("/api/v1/gauntlet/{run_id}", status_code=202)
    def gauntlet_review(
        run_id: str,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        if not run_id or len(run_id) > 128 or "/" in run_id or ".." in run_id:
            raise HTTPException(status_code=400, detail="run id is invalid")
        try:
            source = service.sessions.get(run_id)
        except (OperationalError, ValueError, KeyError):
            raise HTTPException(status_code=404, detail="run was not found") from None
        if source.get("status") != "completed":
            raise HTTPException(status_code=422, detail="only completed runs can enter the gauntlet")
        if not str(source.get("response") or "").strip():
            raise HTTPException(status_code=422, detail="the run has no response to review")
        objective = build_gauntlet_prompt(
            objective=str(source.get("objective") or ""),
            data_class=str(source.get("data_class") or "internal"),
            response=str(source.get("response") or ""),
            mode=str(source.get("mode") or "goal"),
            agent_id=str(source.get("agent_id") or "unknown"),
        )
        try:
            created = service.create_run(
                mode="goal",
                agent_id="reviewer",
                objective=objective,
                data_class=str(source.get("data_class") or "internal"),
                runtime_id="hermes",
            )
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        return {
            "schema_version": 1,
            "source_run_id": run_id,
            "review_run_id": str(created["run_id"]),
            "critics": ["brief", "system", "craft"],
            "state": "awaiting exact approval before the reviewer runtime wakes",
        }

    @app.get("/api/v1/learn")
    def learn_list(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {"schema_version": 1, "summary": learning_store.summary(), "documents": learning_store.list()}

    @app.post("/api/v1/learn", status_code=201)
    def learn_add(
        body: LearnRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            doc = learning_store.add(
                title=body.title, source_name=body.source_name, text=body.text
            )
        except LearningStoreError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        return {"schema_version": 1, "doc": build_brain_file(doc)}

    @app.get("/api/v1/learn/{doc_id}")
    def learn_get(
        doc_id: str,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        if not doc_id or len(doc_id) > 128 or "/" in doc_id or ".." in doc_id:
            raise HTTPException(status_code=400, detail="document id is invalid")
        try:
            doc = learning_store.get(doc_id)
        except LearningStoreError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        return {"schema_version": 1, "brain_file": build_brain_file(doc)}

    @app.get("/api/v1/runtimes")
    def list_runtimes(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {"schema_version": 1, "items": collect_runtime_catalog(config.systems)}

    @app.get("/api/v1/workspaces")
    def list_workspaces(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {"schema_version": 1, "items": service.workspaces.list()}

    @app.post("/api/v1/workspaces", status_code=201)
    def register_workspace(
        body: WorkspaceRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            return {"schema_version": 1, "workspace": service.register_workspace(**body.model_dump())}
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.get("/api/v1/vision/assets")
    def list_vision_assets(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {"schema_version": 1, "items": service.vision.list()}

    @app.post("/api/v1/vision/assets", status_code=201)
    def add_vision_asset(
        body: VisionAssetRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        data_url = body.data_url.strip()
        expected_header = f"data:{body.mime_type};base64,"
        if not data_url.startswith(expected_header):
            raise HTTPException(status_code=400, detail="image payload type does not match")
        try:
            data = base64.b64decode(data_url[len(expected_header) :], validate=True)
        except (binascii.Error, ValueError) as exc:
            raise HTTPException(status_code=400, detail="image payload is not valid base64") from exc
        try:
            asset = service.add_vision_asset(
                label=body.label,
                data=data,
                mime_type=body.mime_type,
                data_class=body.data_class,
                retention=body.retention,
            )
            return {"schema_version": 1, "asset": asset}
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.get("/api/v1/hermes/runs")
    def list_runs(
        request: Request,
        agent_id: str | None = Query(default=None, max_length=128),
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {"schema_version": 1, "items": service.sessions.list(agent_id=agent_id)}

    @app.get("/api/v1/orchestrator/plans")
    def list_orchestration_plans(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        return {
            "schema_version": 1,
            "items": service.orchestration.list(),
            "summary": service.orchestration.summary(),
        }

    @app.post("/api/v1/orchestrator/plans", status_code=201)
    def create_orchestration_plan(
        body: OrchestrationPlanRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            plan = build_routing_plan(
                config,
                objective=body.objective,
                data_class=body.data_class,
                business_id=body.business_id,
                runtime_catalog=collect_runtime_catalog(config.systems),
            )
            return {"schema_version": 1, "plan": service.orchestration.create(plan)}
        except OrchestrationError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.post("/api/v1/orchestrator/route")
    def route_ari_request(
        body: AriRouteRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        """Route Ari's front door to either conversation or governed work."""
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            decision = classify_ari_intent(body.objective, intent=body.intent)
            if decision["kind"] == "conversation":
                return {"schema_version": 1, "decision": decision, "plan": None}
            plan = build_routing_plan(
                config,
                objective=body.objective,
                data_class=body.data_class,
                business_id=body.business_id,
                runtime_catalog=collect_runtime_catalog(config.systems),
            )
            return {
                "schema_version": 1,
                "decision": decision,
                "plan": service.orchestration.create(plan),
            }
        except OrchestrationError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.post("/api/v1/orchestrator/plans/{plan_id}/dispatch", status_code=202)
    def dispatch_orchestration_plan(
        plan_id: str,
        body: OrchestrationDispatchRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            plan = service.orchestration.reserve_dispatch(plan_id, body.plan_digest)
            workspace_id = body.workspace_id
            mode = str(plan.get("execution_mode") or "goal")
            workspace_access = str(plan.get("workspace_access") or "none")
            runtime_id = body.runtime_id
            if mode == "workspace" and not workspace_id:
                service.orchestration.release_dispatch(plan_id, body.plan_digest)
                raise OrchestrationError(
                    "This route needs a registered workspace before a run can be prepared"
                )
            if mode != "workspace":
                workspace_id = None
                workspace_access = "none"
                runtime_id = "hermes"
            objective = (
                "Chief of Staff route\n"
                f"Business: {config.businesses[plan['business_id']]['name']}\n"
                f"Department: {config.departments[plan['department_id']]['name']}\n"
                f"Lead: {config.agents[plan['lead_agent_id']]['name']}\n"
                "Independent review: Vera Quinn is a planned gate after the lead result.\n\n"
                f"Owner outcome: {plan['objective']}"
            )
            try:
                run = service.create_run(
                    mode=mode,
                    agent_id=str(plan["lead_agent_id"]),
                    objective=objective,
                    data_class=str(plan["data_class"]),
                    project_id=str(plan["business_id"]),
                    model_id=str(plan["model_id"]),
                    runtime_id=runtime_id,
                    workspace_id=workspace_id,
                    workspace_access=workspace_access,
                    required_capabilities=plan.get("required_capabilities", ()),
                )
            except OperationalError:
                service.orchestration.release_dispatch(plan_id, body.plan_digest)
                raise
            saved = service.orchestration.bind_run(plan_id, body.plan_digest, str(run["run_id"]))
            return {"schema_version": 1, "plan": saved, "run": run}
        except OrchestrationError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.get("/api/v1/hermes/runs/{run_id}")
    def get_run(
        run_id: str,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            return {"schema_version": 1, "run": service.sessions.get(run_id)}
        except OperationalError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc

    @app.post("/api/v1/hermes/runs", status_code=202)
    def create_run(
        body: RunRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            run = service.create_run(**body.model_dump())
            return {"schema_version": 1, "run": run}
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.post("/api/v1/hermes/runs/{run_id}/approve", status_code=202)
    def approve_run(
        run_id: str,
        body: ApprovalBody,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            run = service.approve_run(run_id, body.approval_digest)
            return {"schema_version": 1, "run": run}
        except OperationalError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @app.post("/api/v1/hermes/runs/{run_id}/cancel")
    def cancel_run(
        run_id: str,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            run = service.cancel_run(run_id)
            return {"schema_version": 1, "run": run}
        except OperationalError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @app.get("/api/v1/memory")
    def list_memory(
        request: Request,
        agent_id: str = Query(default="default", max_length=128),
        project_id: str | None = Query(default=None, max_length=128),
        query: str = Query(default="", max_length=300),
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            items = service.memory.list_for_agent(
                config, agent_id=agent_id, project_id=project_id, query=query
            )
            return {"schema_version": 1, "items": items, "summary": service.memory.summary()}
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.post("/api/v1/memory", status_code=201)
    def add_memory(
        body: MemoryRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            memory = service.add_memory(**body.model_dump())
            return {"schema_version": 1, "memory": memory}
        except OperationalError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.post("/api/v1/retrieval/query")
    def query_retrieval(
        body: RetrievalRequest,
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        try:
            result = service.retrieval.retrieve(**body.model_dump())
            return {
                "schema_version": 1,
                "mode": result.mode,
                "query_digest": hashlib.sha256(body.query.encode("utf-8")).hexdigest(),
                "items": list(result.hits),
            }
        except (OperationalError, ValueError) as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    @app.get("/.well-known/agent-card.json")
    def agent_card(request: Request, if_none_match: str | None = Header(default=None)) -> Response:
        require_loopback(request)
        card = a2a.agent_card(str(request.base_url).rstrip("/"))
        payload = json.dumps(card, sort_keys=True, separators=(",", ":")).encode("utf-8")
        etag = f'"{hashlib.sha256(payload).hexdigest()}"'
        if if_none_match and hmac.compare_digest(if_none_match, etag):
            return Response(status_code=304, headers={"ETag": etag, "Cache-Control": "public, max-age=60"})
        return JSONResponse(card, headers={"ETag": etag, "Cache-Control": "public, max-age=60"})

    @app.post("/a2a/v1")
    def a2a_jsonrpc(
        body: dict[str, Any],
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
        a2a_version: str | None = Header(default=None),
    ) -> dict[str, Any]:
        require_local_session(request, agios_session, x_agios_csrf)
        if a2a_version and a2a_version != A2A_VERSION:
            return {
                "jsonrpc": "2.0", "id": body.get("id"),
                "error": {"code": -32006, "message": f"unsupported A2A version; use {A2A_VERSION}"},
            }
        return dict(a2a.handle(body))

    @app.get("/api/v1/a2a/tasks")
    def list_a2a_tasks(
        request: Request,
        agios_session: str | None = Cookie(default=None),
        x_agios_csrf: str | None = Header(default=None),
    ) -> dict[str, object]:
        require_local_session(request, agios_session, x_agios_csrf)
        items = [a2a._task(item, include_artifacts=False) for item in a2a.store.list(limit=50)]
        return {"schema_version": 1, "items": items, "summary": a2a.summary()}

    assets = frontend / "assets"
    if assets.is_dir():
        app.mount("/assets", StaticFiles(directory=assets), name="assets")

    def frontend_response() -> FileResponse:
        response = FileResponse(frontend / "index.html")
        response.set_cookie("agios_session", session_token, httponly=True, samesite="strict")
        response.set_cookie("agios_csrf", csrf_token, httponly=False, samesite="strict")
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Frame-Options"] = "DENY"
        return response

    @app.get("/")
    def index() -> FileResponse:
        return frontend_response()

    @app.get("/{route:path}")
    def application_route(route: str) -> FileResponse:
        if route.startswith("api/"):
            raise HTTPException(status_code=404)
        return frontend_response()

    return app


def serve(
    *,
    config_path: str | Path = DEFAULT_CONFIG,
    frontend_path: str | Path = DEFAULT_FRONTEND,
    journal_path: str | Path | None = None,
    state_dir: str | Path | None = None,
    host: str = "127.0.0.1",
    port: int = 9120,
) -> None:
    import uvicorn

    if host not in {"127.0.0.1", "localhost", "::1"}:
        raise ValueError("Foundation Sprint 1 serves on loopback only")
    uvicorn.run(
        create_app(
            config_path=config_path,
            frontend_path=frontend_path,
            journal_path=journal_path,
            state_dir=state_dir,
        ),
        host=host,
        port=port,
        log_level="warning",
    )
