const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "apps/agios-command-center/dist/index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "apps/agios-command-center/dist/assets/app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "apps/agios-command-center/dist/assets/style.css"), "utf8");
const buildScript = fs.readFileSync(path.join(root, "scripts/build_agios_frontend.mjs"), "utf8");

test("standalone AGIOS shell exposes core operating surfaces", () => {
  for (const label of ["Command Center", "Portfolio", "Departments", "Agent Fleet", "Approvals", "Models & Tools", "Shared Memory", "Shared Skills", "Repositories", "AI systems"]) assert.match(html, new RegExp(label));
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
  assert.match(js, /Route work with Ari/);
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
  assert.match(js, /exact run approval.*waiting/);
  assert.match(css, /\.decision-pending/);
  assert.match(css, /prefers-reduced-motion/);
});

test("Chief of Staff is the living connector between one command and supervised execution", () => {
  for (const label of ["CHIEF OF STAFF", "Route work with Ari", "GAUNTLET REVIEW", "Independent quality gates", "ARI'S ROUTING DECISION"]) assert.match(js, new RegExp(label));
  assert.match(js, /data-chief-form/);
  assert.match(js, /\/api\/v1\/orchestrator\/plans/);
  assert.match(js, /data-dispatch-form/);
  assert.match(js, /Critics run only when a real review run exists/);
  assert.match(css, /\.chief-desk/);
  assert.match(css, /@keyframes critic-arrive/);
  assert.match(css, /prefers-reduced-motion/);
});

test("Ari front door routes directed work instead of silently starting model-only chat", () => {
  for (const label of ["Ari intent router", "Ask Ari anything", "Automatic", "Work never falls back to powerless chat"]) assert.match(js, new RegExp(label, "i"));
  assert.match(js, /data-ari-router/);
  assert.match(js, /\/api\/v1\/orchestrator\/route/);
  assert.match(js, /data-dispatch-form/);
  assert.match(js, /workspace_id: values\.get\("workspaceId"\)/);
  assert.match(js, /eligibleWorkspaces/);
  assert.match(js, /\["command", "repositories"\]/);
  assert.match(js, /renderRepositories\(\)[\s\S]*workspaceRegistryCard\(\)/);
  assert.match(js, /state\.workspaces = \[payload\.workspace/);
  assert.match(js, /state\.view === "repositories"\) renderRepositories/);
  assert.match(css, /\.ari-route-contract/);
});

test("living OS intelligence turns the authoritative registry into an explorable truthful map", () => {
  for (const label of ["ONE SHARED BRAIN", "Your operating system, as one explorable map", "Everything has one address", "Adapter-ready", "Claude and future runtimes"]) assert.match(js, new RegExp(label, "i"));
  assert.match(js, /function osMapRegistry/);
  assert.match(js, /function renderLivingOSMap/);
  assert.match(js, /data-os-map-layer/);
  assert.match(js, /Private contents remain server-side/);
  assert.match(js, /Only real queued or running work receives an activity pulse/);
  assert.match(js, /runtimeForSystem/);
  assert.match(css, /\.living-os-map/);
  assert.match(css, /\.os-map-node\.node-core/);
  assert.match(css, /@keyframes active-work-pulse/);
});

test("self-improvement visualization preserves evidence, validation, and owner approval gates", () => {
  for (const label of ["SELF-IMPROVEMENT", "Observe", "Find pattern", "Owner review", "Author", "Validate", "Install & measure", "INTELLIGENCE RADAR"]) assert.match(js, new RegExp(label, "i"));
  assert.match(js, /Nothing installs itself/);
  assert.match(js, /Every improvement remains attached to source runs/);
  assert.match(js, /No monitoring claim until a permitted source adapter exists/);
  assert.match(js, /const needsGrowth = \["command", "approvals", "skills"\]/);
  assert.match(css, /\.improvement-loop/);
  assert.match(css, /@keyframes improvement-step/);
  assert.match(css, /prefers-reduced-motion/);
});

test("frontend exposes scoped RAG evidence and the governed A2A gateway", () => {
  assert.match(html, /Agent Network/);
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

test("Phase 4 exposes real voice, model routing, professional agents, growth, and one Memory Studio", () => {
  for (const label of ["Push to talk", "Model route", "Professional identity", "Governed skill evolution", "Memory Studio", "Memory \\\\u2014 Obsidian", "MEMORY GALAXY", "OMI"]) assert.match(js, new RegExp(label));
  assert.match(js, /Chat \+ Voice/);
  assert.match(js, /\/api\/v1\/voice\/transcribe/);
  assert.match(js, /\/api\/v1\/voice\/synthesize/);
  assert.match(js, /model_id/);
  assert.match(js, /skill-proposals/);
  assert.match(js, /simulation_default/);
  assert.match(css, /\.memory-vault/);
  assert.match(css, /\.memory-vault-tree/);
  assert.match(css, /\.memory-panel-header/);
  assert.match(css, /\.memory-omi-pill/);
  assert.match(css, /\.memory-mode-tabs/);
  assert.match(js, /MEMORY GALAXY/);
  assert.match(js, /memory-galaxy-canvas/);
  assert.match(js, /new WebGLRenderer/);
  assert.match(js, /OrbitControls/);
  assert.match(js, /brighter &amp; whiter = more recently touched/);
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

test("Phase 5 mirrors the unified Hermes operating desk with real AGIOS workflows", () => {
  for (const label of ["Mission Control", "Paperclip", "AI Agent Mastermind", "Agent Kanban"]) assert.match(html, new RegExp(label));
  for (const mode of ["Hermes Apollo", "Hermes Oracle", "Hermes Astros", "Studio", "Outreach", "Mixture", "Manage", "Goal Mode"]) assert.match(js, new RegExp(mode));
  for (const capability of ["hey hermes", "Every AGIOS session, searchable", "Two-click model manager", "Loop Engineering", "Music Studio", "Video Agent", "SEO Content System", "JCode Workspace"]) assert.match(js, new RegExp(capability, "i"));
  assert.match(js, /SpeechRecognition/);
  assert.match(js, /agios\.modelPreferences/);
  assert.match(js, /agios\.hiddenStudios/);
  assert.match(js, /data-model-preference-form/);
  assert.match(js, /model_id: values\.get\("modelId"\) \|\| state\.modelPreferences/);
  assert.match(js, /preferredModel === model\.id \? "selected"/);
  assert.match(js, /function renderPaperclip/);
  assert.match(js, /Paperclip is the supervised orchestration desk/);
  assert.match(js, /"Agent Kanban", "File a ticket/);
  assert.match(css, /\.paperclip-command/);
  assert.match(css, /\.wake-word-panel/);
  assert.match(css, /\.agent-kanban/);
  assert.match(css, /\.studio-module-grid/);
  assert.match(css, /\.model-manager/);
});

test("final Agent OS research pass adds evidence-backed operating depth", () => {
  assert.match(html, /Artifacts/);
  for (const capability of [
    "NOW BRIEF",
    "Home. Brain. Memory. Skills. Clock. Team.",
    "Artifact Library",
    "Model Once",
    "Vault Mode",
    "CAPABILITY ROUTER",
    "INTELLIGENCE RADAR",
    "MEMORY VAULT",
    "SKILL LAB",
    "Change only",
  ]) assert.match(js, new RegExp(capability, "i"));
  assert.match(js, /\/api\/v1\/vision\/assets/);
  assert.match(js, /AGIOS will not invent trend signals/);
  assert.match(js, /No implicit downgrade/);
  assert.match(js, /Use the fewest capable workers/);
  assert.match(css, /\.operating-brief/);
  assert.match(css, /\.artifact-grid/);
  assert.match(css, /\.memory-layers/);
  assert.match(css, /\.oracle-radar/);
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

test("dreaming digest measures eight dimensions and only fires real recommendations", () => {
  assert.match(js, /\/api\/v1\/dreaming/);
  assert.match(js, /DREAMING DIGEST/);
  assert.match(js, /evidence-gated/i);
  assert.match(js, /dreamingDigestSurface/);
  assert.match(js, /data-dreaming-accept/);
  assert.match(js, /data-dreaming-dismiss/);
  assert.match(js, /acceptDreaming/);
  assert.match(js, /dismissDreaming/);
  assert.match(js, /Nothing here is synthetic/);
  assert.match(js, /dreaming-chip is-\$\{esc\(dim\.status\)\}/);
  assert.match(css, /\.dreaming-digest/);
  assert.match(css, /\.dreaming-card/);
  assert.match(css, /\.dreaming-chip/);
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
