const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "apps/agios-command-center/dist/index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "apps/agios-command-center/dist/assets/app.js"), "utf8");
const css = ["style.css", "signal-room.css"].map((file) => fs.readFileSync(path.join(root, "apps/agios-command-center/dist/assets", file), "utf8")).join("\n");
const buildScript = fs.readFileSync(path.join(root, "scripts/build_agios_frontend.mjs"), "utf8");
const packageJson = fs.readFileSync(path.join(root, "package.json"), "utf8");
const guide = fs.readFileSync(path.join(root, "docs/USER_GUIDE.md"), "utf8");

test("standalone AGIOS shell exposes core operating surfaces", () => {
  for (const label of ["Home", "Work", "Approvals", "Evidence", "Memory", "Operator guide", "Systems", "Advanced system", "Portfolio", "Departments", "Agent fleet", "Skills & improvements", "Repositories", "AI systems"]) assert.match(html, new RegExp(label));
  assert.match(html, /Create a directive/);
  assert.match(js, /\/api\/v1\/command-center/);
  for (const mode of ["Chat", "Goal Mode", "Workspace", "Skills", "Sessions", "Control Room"]) assert.match(js, new RegExp(mode));
  assert.match(js, /cost.*Unavailable|Unavailable.*price/is);
  assert.match(html, /assets\/app\.js\?v=[a-f0-9]{7}/);
  assert.match(html, /assets\/style\.css\?v=[a-f0-9]{7}/);
});

test("AI systems share governed memory and skills without faking connectivity", () => {
  for (const system of ["Hermes", "Codex", "Gemini", "Antigravity", "DeepSeek", "Ollama", "OpenCode"]) assert.match(js, new RegExp(system));
  for (const mode of ["Models", "Agents", "Goals", "Memory", "Tools", "MCPs", "Repositories"]) assert.match(js, new RegExp(mode));
  assert.match(js, /Memory \\u2014 Obsidian/);
  assert.match(js, /Search \$\{count\} shared memor/);
  assert.match(js, /Install once\. Use everywhere/);
  assert.match(js, /credentials remain unreadable|Never include credentials/i);
  assert.match(js, /Only AGIOS runs that used this runtime/);
  assert.match(js, /runtimeForSystem/);
  assert.match(js, /data-route-system-action/);
  assert.match(js, /No execution buttons are exposed/);
  assert.match(js, /AGIOS blocks silent provider fallback/);
  assert.match(js, /authentication and an audited action adapter are not verified/);
});

test("frontend exposes authenticated supervised Hermes operations", () => {
  assert.match(html, /Tell Ari the outcome/i);
  assert.match(js, /Ask Ari anything/);
  assert.match(js, /\/api\/v1\/hermes\/runs/);
  assert.match(js, /\/api\/v1\/hermes\/runs\/\$\{encodeURIComponent\(button\.dataset\.cancelRun\)\}\/cancel/);
  assert.match(js, /\/api\/v1\/memory/);
  assert.match(js, /Exact run approval required/);
  assert.match(js, /Live AGIOS chat/);
  assert.match(js, /AGIOS shared store/);
  assert.match(js, /X-AGIOS-CSRF/);
  assert.match(js, /Ari mapped the route/);
  assert.match(js, /const form = event\.currentTarget/);
  assert.match(js, /form\.reset\(\)/);
  assert.match(js, /function renderPerformance/);
  assert.match(js, /exact approval is waiting/);
  assert.match(css, /\.decision-pending/);
  assert.match(css, /prefers-reduced-motion/);
});

test("simple owner workflow connects one request to supervised execution", () => {
  for (const label of ["Execution spine", "Intent", "Route", "Approve", "Runtime", "Evidence", "Learn", "Open operator guide"]) assert.match(js, new RegExp(label, "i"));
  assert.match(js, /function renderGuide/);
  assert.match(js, /function renderExecutionSpine/);
  assert.match(js, /\/api\/v1\/orchestrator\/plans/);
  assert.match(js, /data-dispatch-form/);
  assert.match(js, /\/api\/v1\/live-work/);
  assert.match(js, /loadLiveWork/);
  assert.match(js, /animateLiveMetricChanges/);
  assert.match(css, /\.signal-hero/);
  assert.match(css, /\.execution-spine-card/);
  assert.doesNotMatch(packageJson, /"gsap"|"motion"/);
  assert.match(css, /prefers-reduced-motion/);
});

test("Work cards open a truthful chat-style run record", () => {
  for (const label of ["Open run", "Run timeline", "Owner request", "Final result", "Execution provenance", "Detailed runtime stream was not captured for this run"]) {
    assert.match(js, new RegExp(label, "i"));
  }
  assert.match(js, /data-work-run/);
  assert.match(js, /state\.selectedWorkRunId/);
  assert.match(js, /function workRunInspector/);
  assert.match(js, /function loadWorkRunTrace/);
  assert.match(js, /\/api\/v1\/hermes\/runs\/\$\{encodeURIComponent\(runId\)\}\/events/);
  assert.match(js, /Verified activity/);
  assert.match(js, /persisted event/);
  assert.match(js, /run\.response/);
  assert.match(js, /Live runtime output/);
  assert.match(js, /progress_output/);
  assert.match(js, /run\.started_at/);
  assert.match(js, /run\.completed_at/);
  assert.match(css, /\.work-run-inspector/);
  assert.match(css, /\.work-run-transcript/);
});

test("Ari front door routes directed work instead of silently starting model-only chat", () => {
  for (const label of ["Ari intent router", "Ask Ari anything", "Automatic", "Ari is the front door"]) assert.match(js, new RegExp(label, "i"));
  assert.match(js, /data-ari-router/);
  assert.match(js, /\/api\/v1\/orchestrator\/route/);
  assert.match(js, /data-dispatch-form/);
  assert.match(js, /workspace_id: values\.get\("workspaceId"\)/);
  assert.match(js, /eligibleWorkspaces/);
  assert.match(js, /\["command", "approvals", "work", "repositories"\]/);
  assert.match(js, /renderRepositories\(\)[\s\S]*workspaceRegistryCard\(\)/);
  assert.match(js, /state\.workspaces = \[payload\.workspace/);
  assert.match(js, /state\.view === "repositories"\) renderRepositories/);
  assert.match(js, /Manage workspaces/);
  assert.doesNotMatch(js, /Open Repositories first/);
  assert.match(css, /\.ari-route-contract/);
});

test("home shows real local work sources instead of a decorative operating map", () => {
  for (const label of ["SOURCE MATRIX", "Four runtimes", "Runs & evidence", "Recent activity", "Repository improvements", "Hermes", "Codex", "OpenCode", "AGIOS"]) assert.match(js, new RegExp(label, "i"));
  assert.match(js, /function liveSourceCard/);
  assert.match(js, /data-live-key/);
  assert.match(js, /Safe local metadata only/);
  assert.match(js, /Repository improvements/i);
  assert.match(css, /\.live-source-grid/);
  assert.match(css, /\.live-source-card/);
  assert.match(css, /\.home-two-column/);
});

test("self-improvement preserves evidence, validation, ROI and owner approval gates", () => {
  for (const label of ["Owner review", "Validate", "Install", "ROI", "evidence run"]) assert.match(js, new RegExp(label, "i"));
  assert.match(js, /nothing installs itself/i);
  assert.match(js, /completed runs will be attached as evidence/i);
  assert.match(js, /data-install-skill/);
  assert.match(js, /draft_digest/);
  assert.match(js, /roiBadge/);
  assert.match(css, /\.roi-badge/);
  assert.match(css, /prefers-reduced-motion/);
});

test("frontend exposes scoped RAG evidence and the governed A2A gateway", () => {
  assert.match(html, /Agent network/);
  assert.match(js, /RAG evidence console/);
  assert.match(js, /\/api\/v1\/retrieval\/query/);
  assert.match(js, /scoped-lexical-v1/);
  assert.match(js, /A2A 1\.0 JSON-RPC gateway/);
  assert.match(js, /\/a2a\/v1/);
  assert.match(js, /TASK_STATE_AUTH_REQUIRED/);
  assert.match(js, /No peer receives data until explicitly trusted/);
  assert.match(css, /\.protocol-strip/);
  assert.match(css, /\.evidence-card/);
});

test("Phase 4 exposes real voice, model routing, professional agents, growth, and a readable Memory vault", () => {
  for (const label of ["Push to talk", "Model route", "Professional identity", "Governed skill evolution", "Memory Studio", "Memory \\\\u2014 Obsidian", "Recent", "Notes", "OMI"]) assert.match(js, new RegExp(label));
  assert.match(js, /Chat \+ Voice/);
  assert.match(js, /\/api\/v1\/voice\/transcribe/);
  assert.match(js, /\/api\/v1\/voice\/synthesize/);
  assert.match(js, /model_id/);
  assert.match(js, /skill-proposals/);

  assert.match(css, /\.memory-vault/);
  assert.match(css, /\.memory-vault-tree/);
  assert.match(css, /\.memory-panel-header/);
  assert.match(css, /\.memory-omi-pill/);
  assert.match(css, /\.memory-mode-tabs/);
  assert.match(js, /Folders are authorization scopes/);
  assert.match(js, /memory-vault-reader/);
  assert.match(css, /\.memory-vault-reader/);
  assert.doesNotMatch(js, /Profile memory telemetry/);
});

test("Phase 4B exposes supervised workspaces, explicit vision, and validated shared-skill installation", () => {
  assert.match(js, /data-workspace-form/);
  assert.match(js, /data-vision-input/);
  assert.match(js, /workspace_access/);
  assert.match(js, /runtime_id/);
  assert.match(js, /data-validate-skill/);
  assert.match(js, /data-install-skill/);
  assert.match(js, /Delete after run/);
  assert.match(js, /Paths stay on the private server/);
  assert.match(css, /\.workspace-registry/);
  assert.match(css, /\.vision-upload/);
});

test("advanced tools remain available without crowding the owner workflow", () => {
  for (const label of ["Advanced", "Orchestration", "Agent network", "Cost & performance", "Settings"]) assert.match(html, new RegExp(label));
  for (const mode of ["Hermes Apollo", "Hermes Oracle", "Hermes Astros", "Studio", "Outreach", "Mixture", "Manage", "Goal Mode"]) assert.match(js, new RegExp(mode));
  for (const capability of ["hey hermes", "Every AGIOS session, searchable", "Two-click model manager", "Loop Engineering", "Music Studio", "Video Agent", "SEO Content System", "JCode Workspace"]) assert.match(js, new RegExp(capability, "i"));
  assert.match(js, /SpeechRecognition/);
  assert.match(js, /agios\.modelPreferences/);
  assert.match(js, /agios\.hiddenStudios/);
  assert.match(js, /data-model-preference-form/);
  assert.match(js, /model_id: values\.get\("modelId"\) \|\| state\.modelPreferences/);
  assert.match(js, /preferredModel === model\.id \? "selected"/);
  assert.match(js, /function renderPaperclip/);
  assert.match(js, /Paperclip runs as a supervised loopback surface/);
  assert.match(css, /\.orchestration-boundary/);
  assert.match(js, /"Agent Kanban", "File a ticket/);
  assert.match(css, /\.paperclip-command/);
  assert.match(css, /\.wake-word-panel/);
  assert.match(css, /\.agent-kanban/);
  assert.match(css, /\.studio-module-grid/);
  assert.match(css, /\.model-manager/);
});

test("research pass adds a guide, live-source evidence and honest connection decisions", () => {
  assert.match(html, /Evidence/);
  for (const capability of [
    "Execution spine",
    "Four runtimes. One truthful view",
    "Recent activity",
    "Repository improvements",
    "Vault Mode",
    "CAPABILITY ROUTER",
    "CONNECTION DECISIONS",
    "Callable means executable",
  ]) assert.match(js, new RegExp(capability, "i"));
  assert.match(guide, /Ask → Approve → Watch → Verify → Learn/);
  assert.match(guide, /OpenCode/);
  assert.match(js, /\/api\/v1\/vision\/assets/);
  assert.match(js, /No implicit downgrade/);
  assert.match(css, /\.signal-hero/);
  assert.match(css, /\.live-source-grid/);
  assert.match(css, /\.connection-decisions/);
  assert.match(css, /\.artifact-grid/);
  assert.match(buildScript, /preserveSymlinks:\s*true/);
});

test("registry surfaces attach the real applications through live tabs", () => {
  assert.match(js, /"webui", "Web UI", "\\u25A3"/);
  assert.match(js, /webui"\) return hermesWebSurface\(\)/);
  assert.match(js, /terminalSurfaceForSystem/);
  assert.match(js, /"terminal", "Terminal", ">_"/);
  assert.match(js, /\/api\/v1\/surfaces/);
  assert.match(js, /\/ws\/shell\//);
  assert.match(js, /new WebSocket/);
  assert.match(js, /cursorBlink/);
  assert.match(js, /scrollback:\s*4e3/);
  assert.match(js, /session closed/);
  assert.match(js, /surface-tab/);
  assert.match(js, /data-surface-launch/);
  assert.match(js, /data-surface-terminal/);
  assert.match(js, /Live Apps/);
  assert.match(js, /never a sandbox imitation/);
  assert.match(js, /registry-declared/);
  assert.match(css, /\.surface-tabs/);
  assert.match(css, /\.surface-frame/);
  assert.match(css, /\.surface-terminal/);
  assert.match(css, /\.xterm/);
});

test("improvement proposals measure eight dimensions and only show real recommendations", () => {
  assert.match(js, /\/api\/v1\/dreaming/);
  assert.match(js, /VERIFIED IMPROVEMENTS/);
  assert.match(js, /Eight local dimensions are measured/);
  assert.match(js, /improvementRecommendationsSurface/);
  assert.match(js, /data-dreaming-accept/);
  assert.match(js, /data-dreaming-dismiss/);
  assert.match(js, /acceptDreaming/);
  assert.match(js, /dismissDreaming/);
  assert.match(js, /A proposal appears only when a stored count or status supports it/);
  assert.match(css, /\.improvement-proposals/);
  assert.match(css, /\.improvement-evidence/);
});

test("evidence chips, gauntlet reviews, ROI estimates, cost notes and knowledge intake", () => {
  assert.match(js, /evidenceChips/);
  assert.match(js, /evidence-chip tone-/);
  assert.match(js, /data-gauntlet-run/);
  assert.match(js, /launchGauntlet/);
  assert.match(js, /\/api\/v1\/gauntlet\//);
  assert.match(js, /roiBadge/);
  assert.match(js, /minutes_saved_per_future_run/);
  assert.match(js, /cost_note/);
  assert.match(js, /\/api\/v1\/learn/);
  assert.match(js, /data-learn-form/);
  assert.match(js, /submitLearnForm/);
  assert.match(js, /KNOWLEDGE INTAKE/);
  assert.match(js, /No model-generated summary, so nothing can be hallucinated/);
  assert.match(css, /\.evidence-chip/);
  assert.match(css, /\.gauntlet-launch/);
  assert.match(css, /\.roi-badge/);
  assert.match(css, /\.knowledge-intake/);
  assert.match(css, /\.learned-doc/);
});

test("live provider costs are vendor-reported and never guessed", () => {
  assert.match(js, /\/api\/v1\/costs/);
  assert.match(js, /loadCosts/);
  assert.match(js, /costSurface/);
  assert.match(js, /Live provider costs/);
  assert.match(js, /vendor-reported/);
  assert.match(js, /usage 30d/);
  assert.match(js, /Keys stay in the environment/);
  assert.match(css, /\.cost-panel/);
  assert.match(css, /\.cost-row/);
  assert.match(css, /\.cost-honesty/);
});

test("personal NotebookLM uses a visible owner-mediated source-pack boundary", () => {
  assert.match(js, /\/api\/v1\/notebooklm\/sources/);
  assert.match(js, /\/api\/v1\/notebooklm\/packs/);
  assert.match(js, /data-notebooklm-form/);
  assert.match(js, /external_upload_acknowledged/);
  assert.match(js, /No automatic upload/i);
  assert.match(js, /Owner browser only/i);
  assert.match(js, /https:\/\/notebooklm\.google\.com\//);
  assert.match(js, /selected notes leave this PC only after I upload them/i);
  assert.match(js, /Local loopback dashboard/);
  assert.match(js, /freebuff CLI/);
  assert.match(js, /DeepSeek API/);
  assert.match(js, /Gemini API/);
  assert.match(js, /Free-tier key wired/);
  assert.match(js, /Key wired/);
  assert.match(js, /pokee-isaac registered/);
  assert.match(js, /Sakana AI/);
  assert.match(js, /Paid-only API/);
  assert.match(js, /Routed via Hermes/);
  assert.match(js, /"glm-5.2"\]/);
  assert.match(js, /"kimi-k3"\]/);
  assert.match(js, /agy 1\.1\.13/);
  assert.match(js, /Developer preview \+ broad local tooling/);
  assert.match(css, /\.notebooklm-bridge/);
  assert.match(css, /prefers-reduced-motion/);
});

test("systems view guides the owner to NotebookLM and the governed Image Studio", () => {
  assert.match(js, /integrations-quick-nav/);
  assert.match(js, /href="#notebooklm-bridge"/);
  assert.match(js, /id="notebooklm-bridge"/);
  assert.match(js, /id="image-studio"/);
  assert.match(js, /data-image-studio-form/);
  assert.match(js, /\/api\/v1\/image-studio\/generate/);
  assert.match(js, /microsoft\/mai-image-2\.5/);
  assert.match(js, /key_state === "configured"/);
  assert.match(js, /credits exhausted/i);
  assert.match(js, /Generate image/);
  assert.match(js, /Local artifacts only/);
  assert.match(css, /\.image-studio-gallery/);
});

test("memory map is the default real-data visualization with event-driven motion", () => {
  assert.match(js, /"graph"\s*,\s*"[^"]*Memory map"/);
  assert.match(js, /memoryTab: "graph"/);
  assert.match(js, /MEMORY MAP/);
  assert.match(js, /LIVE DATA/);
  assert.match(js, /real notes/);
  assert.match(js, /real links/);
  assert.match(js, /every node is a saved memory/);
  assert.match(js, /TRUST H/);
  assert.match(js, /orbit 360/);
  assert.match(js, /vertexColors: true/);
  assert.match(js, /dashOffset/);
});
