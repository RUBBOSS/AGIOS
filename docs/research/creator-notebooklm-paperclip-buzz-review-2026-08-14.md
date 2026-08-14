# Creator workflows, NotebookLM, Paperclip, and Buzz review

**Evidence cut:** 2026-08-14 23:14 +04:00  
**AGIOS decision:** use a personal NotebookLM source-pack bridge; keep Buzz uninstalled; adopt verified operating patterns inside AGIOS. **Update 2026-08-15:** the owner requested Paperclip in AGIOS, so Paperclip is installed with the official installer in private loopback mode and attached as a supervised AGIOS web surface (127.0.0.1:3100). Boundaries are unchanged: Paperclip receives no AGIOS credentials, and approvals/task state stay in AGIOS.

## Evidence standard

This review separates three levels:

1. **Source-verified:** official documentation or code at a pinned commit.
2. **Transcript-reviewed:** captions reviewed with timestamps; claims may still be marketing unless the video visibly demonstrates them.
3. **Title-triaged:** title and public playlist metadata only. This is enough for relevance/risk triage, not for implementation claims.

The full title inventory is [creator-video-inventory.csv](creator-video-inventory.csv). It contains **6,610 unique public entries** across Jack Roberts and Julian Goldie SEO (`videos` and `shorts` surfaces):

| Channel | Videos | Shorts | Total |
|---|---:|---:|---:|
| Jack Roberts | 1,146 | 845 | 1,991 |
| Julian Goldie SEO | 4,619 | 1,707 | 6,326 |
| **Raw surface entries** | 5,765 | 2,552 | 8,317 |
| **Unique channel/video IDs** |  |  | **6,610** |

Every accessible entry was inventoried and deterministically triaged by title. **Twelve highest-relevance entries were transcript-reviewed in this pass.** The inventory never labels title-only triage as a full review. A visual or transcript-level review of 6,610 changing videos would be a long-running research program, not an honest one-shot claim.

Title-level disposition counts were verified from the CSV: 2,256 candidates for evidence review, 3,112 out of AGIOS scope, 201 requiring source review before any install, 1,020 involving owner-gated external action, and 21 requiring rejection or explicit manual security review. These are triage labels, not endorsements.

The timestamped decisions for the 12 transcript-reviewed videos are in [creator-technique-catalog.csv](creator-technique-catalog.csv): **25 observed patterns, 12 video IDs, and no missing timestamps**.

## NotebookLM: what the videos actually do

### Unsafe mechanism shown

Two videos demonstrate an **unofficial browser-session automation** rather than a supported personal NotebookLM API:

- Jack Roberts, [Hermes Agent has a NEW SuperPower (NotebookLM)](https://youtu.be/9rXH2ssCe9E?t=351), 05:51–06:35: download a skill, ask an agent to install it, sign in through a browser, and let the skill obtain the NotebookLM cookie so Claude Code or Hermes can act programmatically.
- [Claude Code + NotebookLM = Infinite Memory](https://youtu.be/6t32nPxeJb8?t=181), 03:01–04:50: install a supplied skill; the narrator calls the connection unofficial, describes a GitHub Python script, and says it obtains a token/cookie after browser sign-in.

This route was **not installed**. It would give third-party code access to an authenticated Google session, depends on private web behavior, and has no stable least-privilege authorization boundary.

### Supported Google boundary

The supported programmable documentation found is for **NotebookLM Enterprise**, including the [Enterprise overview](https://cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/overview), [notebook API](https://cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks), and [source API](https://cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks-sources). Google's personal-product help describes owner source uploads but does not publish a supported personal automation API.

### Safe pattern adopted

AGIOS implements the useful workflow without cookie capture:

1. Select approved local Markdown notes.
2. Review an explicit warning that a later manual upload sends those files to Google.
3. Create a local ZIP containing only selected notes.
4. Include source-relative paths, SHA-256 hashes, timestamps, destination, and `uploaded: false` in `manifest.json`.
5. Let the owner download the ZIP, open NotebookLM, and upload manually.

The five-file context pattern extracted from the creator workflow is stored at:

`C:\Users\Acer\Documents\Freelance-Agency-Vault\70 NotebookLM\AGIOS Core Context`

- `01 Goals.md`
- `02 Offer.md`
- `03 Last Three Decisions.md`
- `04 Customer Questions.md`
- `05 Brand Voice.md`

Safety controls:

- no Google credentials or browser cookies;
- no unofficial personal API;
- no automatic upload;
- owner-selected files only;
- credential-like content blocked without returning the matched value;
- symlinks and paths outside the approved vault excluded;
- hidden Obsidian internals excluded;
- content is re-read and hash-checked immediately before archive writing, so post-selection drift fails closed;
- 2 MB per source, 50 sources and 20 MB per pack;
- authenticated local API plus CSRF for pack creation;
- path and SHA-256 provenance in every pack.

### Live evidence

A real five-source pack was prepared through the live AGIOS UI. It was **not uploaded**.

- Artifact: `C:\Users\Acer\AppData\Local\AGIOS\artifacts\notebooklm\00efbb6f-a2b5-4d08-b7fa-69e211b54b05.zip`
- Archive SHA-256: `01435722702381c244516900c45ad83117c3f0157821f65045e73eeea4b87266`
- Entries: five approved context files plus `manifest.json`
- Manifest/source verification: all five source hashes matched

## Creator techniques: adoption matrix

| Observed technique | Evidence | AGIOS decision | State |
|---|---|---|---|
| Curated business context pack rather than dumping the whole vault | NotebookLM videos above | Adopt with per-file approval and provenance | Implemented and live-tested |
| Plain local Markdown as the durable memory source | [Hermes Agent OS + Obsidian](https://youtu.be/ipYz0hFa8qA?t=211), 03:31–03:58 | Adopt; Obsidian remains canonical and locally owned | Existing, retained |
| Shared agent memory | Same video, 03:48–04:11 | Adopt only through scoped retrieval; never give every agent the whole vault | Existing authorization scopes retained |
| Kanban assignment, triage and done evidence | [Hermes + Obsidian + Kanban + Paperclip](https://youtu.be/6QLzDqB5YKU?t=224), 03:44–04:52 | Adopt in native Hermes/AGIOS board | Existing, retained |
| Organization view for multiple heterogeneous runtimes | Same video, 04:55–05:45 | Keep as an advanced orchestration view, but one task/approval source of truth | Clarified in UI |
| Persisted tool/activity trail | Mission-control and agent-OS videos | Expose only safe persisted tool/commentary events, not private chain-of-thought | Implemented and tested |
| Skill source review before installation | [OpenClaw Skills](https://youtu.be/RRMP5paN-TI?t=53), 00:53–04:38 | Strengthen: source-level review, least privilege, independent review, and isolated execution; an LLM opinion alone is insufficient | Existing AGIOS/Hermes policy retained |
| Source-derived audio/video/slides | NotebookLM videos | Treat as optional derived artifacts; never as canonical evidence until reviewed | Manual NotebookLM step only |
| Animated memory galaxy | Multiple creator videos | Reject for AGIOS Memory; it obscures reading and authority boundaries | Not implemented |
| Continuous ambient motion | Creator dashboard footage | Reject. Motion is limited to real state/progress/hierarchy changes and respects reduced motion | Retained |
| Automated outreach/backlinks/publishing | Large parts of both catalogs | Reject without exact content-and-destination approval; no platform automation or fabricated evidence | Not implemented |

## Paperclip source review

**Repository:** [paperclipai/paperclip](https://github.com/paperclipai/paperclip)  
**Pinned commit reviewed:** [`8cb0ce0de597542d1fec971d83a9a6725d7e195d`](https://github.com/paperclipai/paperclip/tree/8cb0ce0de597542d1fec971d83a9a6725d7e195d)  
**License:** MIT

### Valuable patterns

- Goal → project → issue → run lineage.
- Atomic task checkout and conflict response, avoiding duplicate workers.
- Event/assignment-driven heartbeats rather than continuous token use.
- Adapter-neutral execution and preserved session state.
- Cost-event reporting and hard budget blocks.
- Separate board/operator approvals and visible task ownership.

Sources:

- [Heartbeat protocol](https://github.com/paperclipai/paperclip/blob/8cb0ce0de597542d1fec971d83a9a6725d7e195d/docs/guides/agent-developer/heartbeat-protocol.md)
- [Costs and budgets](https://github.com/paperclipai/paperclip/blob/8cb0ce0de597542d1fec971d83a9a6725d7e195d/docs/guides/board-operator/costs-and-budgets.md)
- [Approval guide](https://github.com/paperclipai/paperclip/blob/8cb0ce0de597542d1fec971d83a9a6725d7e195d/docs/guides/board-operator/approvals.md)
- [External adapters](https://github.com/paperclipai/paperclip/blob/8cb0ce0de597542d1fec971d83a9a6725d7e195d/docs/adapters/external-adapters.md)

### Risks and mismatches

- It would be a second task, approval, identity, budget, session and audit control plane beside AGIOS/Hermes.
- The default deployment mode is `local_trusted`; source enforcement limits it to loopback, but requests become the local board principal rather than user-authenticated sessions.
- External adapters launch processes with the local user's permissions. Their security remains the operator's responsibility.
- Budget enforcement depends on cost events being reported; it is not independent provider billing proof.
- Most importantly, current migration `0071_default_hire_approval_off.sql` sets `requireBoardApprovalForNewAgents` to `false` by default. AGIOS must not inherit that default even though the product site emphasizes board control.

### Decision

**Initial (2026-08-14): do not install.** AGIOS already had the required owner workflow; the page was renamed **Orchestration**.

**Update (2026-08-15, owner-directed):** Paperclip is now installed with the official installer in **private loopback mode** and attached as a supervised AGIOS web surface (127.0.0.1:3100). The earlier risk list remains binding: Paperclip receives no AGIOS credentials, its default `requireBoardApprovalForNewAgents=false` is not adopted, and AGIOS keeps approvals, task state and evidence. The Orchestration page states both facts honestly.

## Buzz source review

**Repository:** [block/buzz](https://github.com/block/buzz)  
**Pinned commit reviewed:** [`207154706c87cbf207f2a2abbc096d17737b091a`](https://github.com/block/buzz/tree/207154706c87cbf207f2a2abbc096d17737b091a)  
**License:** Apache-2.0

### Valuable patterns

- Shared human/agent rooms with explicit plans and review.
- Git-aware project collaboration.
- Signed event model and local-first identity architecture.
- Bounded process/output design goals and explicit tool trust levels.
- Linux microVM isolation for selected agent workloads.

Sources:

- [Architecture](https://github.com/block/buzz/blob/207154706c87cbf207f2a2abbc096d17737b091a/ARCHITECTURE.md)
- [Agent vision](https://github.com/block/buzz/blob/207154706c87cbf207f2a2abbc096d17737b091a/VISION_AGENT.md)
- [Security](https://github.com/block/buzz/blob/207154706c87cbf207f2a2abbc096d17737b091a/SECURITY.md)

### Risks and mismatches

- The product remains a developer-preview collaboration system and overlaps heavily with AGIOS sessions, projects, agents and Git work.
- Its `buzz-dev-mcp` intentionally allows absolute paths and symlink resolution outside the workspace (`resolve_path_allows_outside_workspace`). That directly conflicts with Ruben's strict project-isolation rule.
- Its shell operates at the owner's trust level; therefore the desktop integration is not a least-privilege sandbox on this Windows host.
- The stronger Firecracker microVM isolation described in the repository is Linux-specific and does not make the Windows desktop tooling equally isolated.
- Adding it would introduce another identity, relay, secret and project-context boundary without a proven capability gap.

### Decision

**Do not install or connect Buzz now.** Borrow the clear human/agent room and explicit review concepts, but keep private/client work inside AGIOS's loopback, project-scoped control plane.

## Motion and design rules extracted

The videos repeatedly use dense dashboards, status cards, agent avatars, Kanban movement, graph-like memory canvases, and animated media previews. AGIOS adopts only the parts that communicate state:

- 100–150 ms state transitions;
- progress/output appearing because a real persisted event arrived;
- clear active/queued/blocked/completed hierarchy;
- reduced-motion support;
- no zoom, drift, parallax, pulsing decoration or fake live activity;
- no memory galaxy: Memory stays an Obsidian-style folder tree, note list and reader;
- synthetic/demo data remains visibly separate from real runtime evidence.

## Remaining work and non-claims

- No Google upload occurred.
- No NotebookLM cookie or token was read.
- Paperclip and Buzz were cloned to temporary review directories only; neither was installed or executed.
- Title triage is not presented as transcript or visual review.
- Cross-provider hard cost budgets are not enabled until actual vendor usage/cost telemetry can be enforced without guessed numbers.
- Any external publication, outreach, application, purchase or client delivery remains exact-approval gated.
