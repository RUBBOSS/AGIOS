# AGIOS — Agentic Intelligence Operating System

AGIOS is a standalone, human-supervised operating layer that controls AI systems
(Hermes, Codex, OpenClaw, Cline, Pokee, Ollama, and future runtimes) as managed
nodes behind one governance contract.

AGIOS is **not** a module of any single agent runtime. Runtimes join AGIOS as
registered systems; Hermes is one adapter among many, never a hard dependency.

## Layout

- `agios/` — runtime-neutral Python core (control plane, routing, events,
  orchestration, workspaces, A2A gateway, operational service, server).
- `configs/agios.json` — the authoritative registry: agents, models, routes,
  runtimes, departments, businesses, systems.
- `apps/agios-command-center/` — the command center frontend (built with esbuild).
- `tests/` — Python unit tests + frontend tests.
- `scripts/` — frontend build script.

## Run

```bat
scripts\start-agios.bat    :: create venv if needed and serve on 127.0.0.1:9120
scripts\stop-agios.bat     :: stop the running server
scripts\doctor.bat         :: read-only health report
```

Manual:

```bash
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m agios serve --port 9120
```

## Verify

```bash
.venv\Scripts\python -m unittest discover -s tests -p "test_agios_*.py" -v
npm run test
npm run check
```

## Governance (non-negotiable)

- Deny-by-default. A fallback must never weaken an approval or data-class rule.
- Exact approval before external, destructive, financial, or deployment actions.
- Evidence-bound: nothing is reported as complete without an observable result.
- Never commit credentials, customer content, private memory, or raw event payloads.
