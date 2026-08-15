# AGIOS Scope Boundary — Control Plane, Not a Second Hermes

**Decision approved by Ruben Martirosyan · 2026-08-15 · status: authoritative until explicitly revised**

## The decision

AGIOS exists to do three jobs — and only three:

1. **Supervised control plane** — one owner-approved surface to see and govern everything Hermes
   and the other runtimes do: runs, approvals, costs, surfaces, workspaces, evidence.
2. **Brand product** — the planned creator phase (Q&A content engine, build video, shorts,
   OS packaging) modeled on Jack Roberts / Julian Goldie.
3. **Ari Vale training host** — the local model trained on real routing decisions.

AGIOS is **not** a second Hermes. Hermes owns execution: chat, voice, memory, skills,
sessions, delegation, cron, MCPs, plugins. AGIOS owns visibility, governance, and the
bridges Hermes does not have.

## Boundary rules

1. New chat, memory, agent, or skill **execution** logic goes in Hermes (tool, skill, plugin,
   or profile). AGIOS displays and governs it.
2. AGIOS-only surfaces are allowed to grow: cost truth, surface registry, approvals lane,
   owner-mediated bridges (NotebookLM, Image Studio), Memory map, Ari training data, brand
   phase engines (dreaming digest, gauntlet, /learn, ROI/cost notes).
3. Existing AGIOS duplicates of Hermes features are **frozen**, not deleted (reversible):
   bugfixes only, no new features. They are re-reviewed when the brand phase starts.
4. Every number in AGIOS traces to a real source; synthetic data stays badged and separate.
5. The loop stays: **Ask → Approve → Watch → Verify → Learn.**

## Audit (2026-08-15) — 22 views, ~50 endpoints, 145 Python + 20 frontend tests

### A. Govern — Hermes executes, AGIOS displays and approves (core, keep)

| AGIOS surface | Hermes equivalent it governs |
|---|---|
| Home / command-center payload | Hermes status aggregation |
| Hermes runs list, events, approve, cancel | Hermes delegation / runs |
| Approvals lane | Hermes approval prompts |
| Agent Fleet / workspaces readout | Hermes profiles + delegation |
| Orchestrator route / plans | Hermes routing decisions |
| Performance / run traces ("Verified activity") | Hermes journal |

### B. Unique — AGIOS does it, Hermes does not (keep and grow)

| Feature | Why it stays in AGIOS |
|---|---|
| Cost panel (live DeepSeek/OpenRouter balances, Gemini/Pokee key checks) | No other place shows real provider truth |
| Surface registry + terminal tabs (Codex, OpenCode, Cline, OpenClaw, Paperclip, Freebuff, Antigravity) | Single launcher with honest readiness |
| NotebookLM owner-mediated source packs | Local ZIP + SHA-256 provenance, manual upload |
| Image Studio (MAI-Image-2.5, provenance + honest pricing) | Evidence-first image generation lane |
| Memory map (three.js, real nodes/links, 360°) | Requested visualization; Hermes has none |
| /learn brain files (deterministic index, no model summaries) | Built for the brand playbook |
| Dreaming digest, gauntlet critics, growth funnel | Brand-phase content engine |
| A2A agent mesh surface | Inter-agent tasks with policy gates |
| Skill Lab proposals with validation gates | Skill governance with approval trail |

### C. Duplicate — Hermes already does this natively (frozen: bugfix only)

| AGIOS surface | Hermes equivalent | Status |
|---|---|---|
| `/api/v1/voice/synthesize` + transcribe | Hermes TTS (Fish Audio) + STT | Frozen |
| `/api/v1/memory` shared memory store | Hermes memory tool + store | Frozen |
| `/api/v1/retrieval/query` (vault search) | Hermes vault/session search | Frozen |
| `/api/v1/vision/assets` | Hermes vision tooling | Frozen |
| Skills registry listing | Hermes skills + curator | Frozen |
| Sessions archive | Hermes session search | Frozen |

**Real duplicate count: 6 endpoints/surfaces.** Not catastrophic, but these must not grow.

## What changes today

- No code is deleted. Frozen duplicates remain functional and tested.
- New work lands per the boundary rules above.
- Re-audit trigger: when the brand phase starts, or when any frozen duplicate needs a
  non-bugfix change — then it moves to Hermes and AGIOS loses the endpoint.

## Evidence trail

- Audit source: `apps/agios-command-center/src/app.js` view registry (22 views) and
  `agios/server.py` route table (~50 routes), both inspected 2026-08-15.
- Hermes capability reference: the Hermes desktop app (chat, voice, memory, skills,
  delegation, cron, MCPs, plugins, profiles).
