# AGIOS Owner Guide

AGIOS is a supervised operating system. Its daily loop is:

**Ask → Approve → Watch → Verify → Learn**

You do not need the Advanced screens for normal work.

## Quick start

Open: <http://127.0.0.1:9120>

### 1. Ask Ari for an outcome

Select **Ask Ari** from the top-right of any screen.

Write what should be true when the work is finished. Prefer an outcome over a tool instruction.

Good example:

> Inspect the AGIOS dashboard tests and propose a simpler home page. Do not edit yet.

Choose the data class:

- **public** — safe public information.
- **internal** — ordinary owner/project work.
- **private_business** — private business material; external routes can require approval.
- **customer_restricted** — client-restricted material; use only explicitly approved routes.

Submitting this form creates a route proposal. It does not silently run consequential work.

### 2. Approve the exact route

Open **Approvals**.

Before choosing **Approve & run**, check:

1. The objective is exactly what you asked for.
2. The correct specialist is selected.
3. The runtime and model make sense.
4. The data class is correct.
5. Workspace access is no broader than necessary.
6. Attached memories and skills are relevant.
7. No external communication, payment, publishing, deployment, or account change is included.

If any field is wrong, cancel the route and ask Ari again. Approval is bound to the displayed route digest; changed context requires a new approval.

### 3. Watch the real work

Open **Work**.

Run states mean:

- **awaiting approval** — nothing has executed.
- **queued** — the approved job has entered the local worker queue.
- **running** — the named runtime is executing.
- **completed** — a response was saved; this is not automatically proof that every claim is true.
- **failed** — AGIOS stopped and records a bounded failure reason.
- **canceled** — the owner stopped the route.

Every run identifies its runtime, workspace boundary, attached memory, skills, images, and local audit state.

### 4. Review evidence

Open **Evidence**.

Use evidence, not prose claims, to decide whether work is done:

- Attached memory and skill chips show what context the run actually received.
- Files and images are listed as artifacts.
- Repository changes must exist in Git.
- Tests, builds, status codes, screenshots, or reviewer findings must be real outputs.
- A builder's statement is not independent review.

Sending, publishing, production deployment, final delivery, purchases, contracts, and account changes still require your exact approval for that action and destination.

### 5. Save only durable learning

Open **Memory**.

Save:

- stable owner decisions;
- project constraints;
- approved policies;
- facts that future agents need;
- long-term goals and definitions.

Do not save:

- passwords, tokens, cookies, payment details, or identity documents;
- temporary task progress;
- whole chat transcripts;
- claims without a source;
- short-lived IDs, commits, or issue numbers as permanent facts.

A skill improvement should be proposed only from completed-run evidence, reviewed, validated, and installed with owner approval.

## The six daily screens

| Screen | Use it for |
|---|---|
| **Home** | Your next action and live source health. |
| **Work** | Requests, routes, execution state, and responses. |
| **Approvals** | Exact decisions that need the owner. |
| **Evidence** | Artifacts and grounded run context. |
| **Memory** | Durable owner-controlled knowledge. |
| **Apps & models** | Connected runtimes and truthful setup blockers. |

Everything else is under **Advanced**.

## Runtime selection

Let Ari route by default.

- **Hermes** — main orchestrator; tools, research, memory, schedules, and governed specialist profiles.
- **Codex** — difficult approved coding in a registered workspace and Codex sandbox.
- **OpenCode** — second workspace coding runtime. AGIOS uses deny-by-default permissions, blocks external directories and shell commands, never enables `--auto`, and allows edits only for an explicitly approved write workspace.
- **Local workers** — private extraction, coding, classification, and drafts with no hosted fallback.

The runtime is not the same as the model. AGIOS records both.

## How the Home data is sourced

The Home screen reads local metadata only:

- AGIOS runtime sessions, memory, artifacts, improvement proposals, and CEO route examples;
- Hermes session counts, message counts, memory count, and installed skills;
- Codex session index and rollout-file metadata;
- OpenCode local database totals, token totals, and recorded cost;
- Git commit metadata from the registered AGIOS/HermesOS repositories.

It does not expose transcript bodies, prompts, credential values, or private filesystem paths.

## Personal NotebookLM source bridge

AGIOS supports the personal NotebookLM product without an unofficial API or browser-cookie capture:

1. Open **Apps & models**.
2. Select only the approved local Markdown notes needed for the notebook.
3. Review the transfer warning. Preparing the pack is local; a later manual upload sends the selected files to Google.
4. Prepare the ZIP. AGIOS includes a manifest with relative source paths and SHA-256 hashes and records `uploaded: false`.
5. Download the pack, open NotebookLM in the owner's browser, and upload the selected files manually.

AGIOS never signs in to Google, reads NotebookLM cookies, or uploads automatically. Credential-like notes and symlinks are excluded. A source is limited to 2 MB; a pack is limited to 50 sources and 20 MB.

## Image Studio (Microsoft MAI-Image-2.5)

**Apps & models → Image Studio** generates design images through the OpenRouter Images API:

1. Type the prompt and pick an aspect ratio (1:1, 4:3, 3:4, 16:9, 9:16, 3:2, 2:3).
2. Click **Generate image**. Because the owner types the prompt, every external call is an explicit owner action.
3. The PNG is saved locally under the AGIOS state directory with a metadata file: prompt, aspect ratio, model, timestamp, SHA-256, and any usage the provider returns.

Honesty rules: the model, endpoint, and listed price are vendor-reported constants. OpenRouter returns no per-image cost in the Images response, so AGIOS shows the vendor-listed pricing as a reference and never guesses a spent amount. Provider failures are classified (invalid key, credits exhausted, rate limit) and shown without raw response bodies. The provider key is loaded from the owner's local Hermes credential pool; its value is never shown, logged, or committed.

## Planned tools

A tool is marked connected only when its executable, authentication, permission boundary, and measurable role are verified.

- OpenCode is connected as a supervised workspace adapter.
- Cline remains unconnected because its default autonomous/auto-approval posture overlaps with existing coding runtimes and needs a separate least-privilege design.
- Gemini/NotebookLM has a local owner-mediated source-pack bridge. AGIOS does not inspect Google authentication and does not describe the personal account as API-connected.
- Pokee requires an approved enterprise/API setup and is not a local runtime.
- OpenClaw overlaps heavily with Hermes and requests broad device/chat authority; it is not connected without a separate security decision.
- Antigravity remains planned until a callable, auditable local interface is verified.
- Paperclip is installed with the official installer in private loopback mode and attached as a supervised web surface (http://127.0.0.1:3100). AGIOS remains the approval source of truth: Paperclip never receives AGIOS credentials, and its board is opened from AGIOS surfaces, not granted dispatch authority.
- Buzz remains on hold. Its developer-preview collaboration model overlaps with AGIOS, while its development MCP and shell runner would add broad local authority.

## If something fails

1. Read the bounded error shown on the run.
2. Confirm the runtime is marked **live** in **Apps & models**.
3. Confirm a registered workspace is selected for Codex/OpenCode.
4. Confirm the chosen data class is allowed by the model route.
5. Cancel rather than broadening permissions automatically.
6. Ask Ari to re-route when a provider, model, or sandbox is unavailable.
