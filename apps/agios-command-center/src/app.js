import { drag, forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, select, zoom } from "d3";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const page = document.querySelector("#page");
const viewName = document.querySelector("#view-name");
const modal = document.querySelector("#directive-modal");
const palette = document.querySelector("#command-palette");
const paletteInput = document.querySelector("#palette-input");
const paletteResults = document.querySelector("#palette-results");
const sidebar = document.querySelector("#sidebar");
const toast = document.querySelector("#toast");

const viewLabels = {
  command: "Home",
  portfolio: "Portfolio",
  departments: "Departments",
  agents: "Agent Fleet",
  mesh: "Agent Mesh",
  work: "Goals & Work",
  artifacts: "Artifact Library",
  paperclip: "Orchestration",
  approvals: "Approvals",
  systems: "All Systems",
  system: "AI System",
  memory: "Shared Memory",
  skills: "Shared Skills",
  repositories: "Repositories",
  automations: "Automations",
  integrations: "Models & Tools",
  network: "Agent Network",
  performance: "Performance",
  settings: "Settings",
  agent: "Agent Workspace",
  surfaces: "Live Apps",
  guide: "How to use AGIOS",
};

const state = {
  data: null,
  view: "command",
  dreaming: null,
  liveWork: null,
  liveMetrics: null,
  changedLiveMetrics: [],
  memoryFolder: "all",
  memoryNote: null,
  memoryComposeOpen: false,
  memorySearchOpen: false,
  memoryTab: "graph",
  memoryGalaxy: null,
  executionSpineCleanup: null,
  memoryGalaxyFilter: "all",
  learned: null,
  costs: null,
  selectedAgent: "default",
  agentMode: "overview",
  selectedSystem: "hermes",
  systemMode: "chat",
  skillQuery: "",
  skillCategory: "all",
  sessionQuery: "",
  period: "28d",
  directiveDrafts: loadDrafts(),
  modelPreferences: loadLocalObject("agios.modelPreferences"),
  dataClassPreferences: {},
  runtimePreferences: {},
  hiddenStudios: loadLocalObject("agios.hiddenStudios"),
  runs: [],
  memories: [],
  retrievalHits: [],
  a2aTasks: [],
  skillProposals: [],
  workspaces: [],
  visionAssets: [],
  runtimeAdapters: [],
  orchestrationPlans: [],
  selectedWorkRunId: null,
  workRunAutoOpened: false,
  runTraces: {},
  voice: null,
  recorder: null,
  voiceTimer: null,
  wakeRecognition: null,
  wakeArmed: false,
  osMapSimulation: null,
  osMapLayer: "all",
  operationalLoading: false,
  surfaces: [],
  activeSurface: null,
  surfaceProbes: {},
  notebooklm: null,
  notebooklmPack: null,
  imageStudio: null,
};

function esc(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function loadDrafts() {
  try { return JSON.parse(localStorage.getItem("agios.directiveDrafts") || "[]"); }
  catch { return []; }
}

function loadLocalObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

function saveLocalObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function cookie(name) {
  return document.cookie.split("; ").find((item) => item.startsWith(`${name}=`))?.split("=").slice(1).join("=") || "";
}

async function api(path, options = {}) {
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  if (options.body) headers["Content-Type"] = "application/json";
  if (!/^(GET|HEAD)$/i.test(options.method || "GET")) headers["X-AGIOS-CSRF"] = decodeURIComponent(cookie("agios_csrf"));
  const response = await fetch(path, { ...options, headers, credentials: "same-origin" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || "AGIOS operation failed");
  return payload;
}

function titleCase(value) {
  return String(value || "").replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function status(value) {
  const selected = String(value || "unavailable");
  return `<span class="status-pill"><i class="status-dot status-${esc(selected)}"></i>${esc(titleCase(selected))}</span>`;
}

function initials(value) {
  return String(value || "AG").split(/\s|-/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function relativeTime(value) {
  if (!value) return "Not scheduled";
  const target = new Date(value);
  if (Number.isNaN(target.valueOf())) return "Scheduled";
  const minutes = Math.round((target.valueOf() - Date.now()) / 60000);
  if (minutes < -1) return `${Math.abs(minutes)}m ago`;
  if (minutes <= 1) return "Now";
  if (minutes < 60) return `in ${minutes}m`;
  if (minutes < 1440) return `in ${Math.round(minutes / 60)}h`;
  return `in ${Math.round(minutes / 1440)}d`;
}

function runsForPeriod(period = state.period) {
  if (period === "live") {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return state.runs.filter((run) => ["queued", "running", "awaiting_approval"].includes(run.status) || new Date(run.created_at).valueOf() >= cutoff);
  }
  const days = period === "7d" ? 7 : 28;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return state.runs.filter((run) => new Date(run.created_at).valueOf() >= cutoff);
}

function heading(eyebrow, title, description, meta = "") {
  return `<div class="page-heading"><div><p class="eyebrow">${esc(eyebrow)}</p><h1>${title}</h1><p>${esc(description)}</p></div>${meta ? `<div class="heading-meta">${meta}</div>` : ""}</div>`;
}

function periodControl() {
  return `<div class="period-control" aria-label="Reporting period">${[["live", "Live"], ["7d", "7d"], ["28d", "28d"]].map(([id, label]) => `<button class="${state.period === id ? "is-active" : ""}" data-period="${id}">${label}</button>`).join("")}</div>`;
}

function signalCard(label, value, note, tone, bars) {
  return `<article class="signal-card tone-${tone}"><div class="signal-card-top"><span>${esc(label)}</span><small>LIVE VIEW</small></div><strong>${value}</strong><p>${esc(note)}</p><div class="micro-bars" aria-hidden="true">${bars.map((height) => `<i style="height:${height}%"></i>`).join("")}</div></article>`;
}

function operatingBrief() {
  const active = state.runs.filter((run) => ["queued", "running"].includes(run.status));
  const approvals = state.runs.filter((run) => run.status === "awaiting_approval");
  const periodRuns = runsForPeriod();
  const completed = periodRuns.filter((run) => run.status === "completed");
  const failed = periodRuns.filter((run) => ["failed", "interrupted"].includes(run.status));
  const next = state.data.schedules.find((job) => job.next_run_at) || state.data.schedules[0];
  const latest = completed[0];
  return `<section class="operating-brief"><header><div><p class="eyebrow">NOW BRIEF</p><h2>The studio knows what needs attention.</h2></div><span>REAL LOCAL STATE</span></header><div class="brief-grid">
    <article><small>WORKING NOW</small><strong>${active.length}</strong><p>${active.length ? esc(active[0].objective) : "No worker is consuming tokens."}</p></article>
    <article class="brief-judgment"><small>NEEDS JUDGMENT</small><strong>${approvals.length}</strong><p>${approvals.length ? "Exact run approval is waiting." : "No runtime decision is waiting."}</p></article>
    <article><small>NEXT WAKE</small><strong>${next ? esc(relativeTime(next.next_run_at)) : "Not set"}</strong><p>${next ? esc(next.name) : "No schedule is registered."}</p></article>
    <article><small>LATEST VERIFIED RESULT</small><strong>${latest ? esc(titleCase(latest.agent_id)) : "None yet"}</strong><p>${latest ? esc(latest.objective) : failed.length ? `${failed.length} run needs review.` : "Completed work will appear here."}</p></article>
  </div><footer><span>${state.data.operational?.shared_memory?.fact_count ?? 0} durable memories</span><span>${state.data.summary.shared_skills} shared skills</span><button data-view-link="artifacts">Open evidence and artifacts →</button></footer></section>`;
}

function renderAgentNavigation() {
  const target = document.querySelector("#agent-nav");
  if (!target || !state.data) return;
  target.innerHTML = state.data.agents.map((agent, index) => `<button class="agent-nav-item ${state.view === "agent" && state.selectedAgent === agent.id ? "is-active" : ""}" data-agent="${esc(agent.id)}"><span class="agent-orb agent-${index % 5}">${initials(agent.name || agent.id)}</span><span><strong>${esc(agent.name || titleCase(agent.id))}</strong><small>${esc(agent.profession || titleCase(agent.role))}</small></span><i class="status-dot status-${esc(agent.state)}"></i></button>`).join("");
}

function renderSystemNavigation() {
  const target = document.querySelector("#system-nav");
  if (!target || !state.data) return;
  target.innerHTML = state.data.systems.map((system, index) => {
    const runtime = runtimeForSystem(system.id);
    const indicator = runtime.status === "live" ? "online" : runtime.execution_enabled ? "ready" : runtime.detected ? "attention" : "planned";
    return `<button class="system-nav-item ${state.view === "system" && state.selectedSystem === system.id ? "is-active" : ""}" data-system="${esc(system.id)}"><span class="system-glyph system-${index % 6}">${initials(system.name)}</span><span><strong>${esc(system.name)}</strong><small>${runtime.execution_enabled ? `${runtime.actions.length} live actions` : esc(titleCase(runtime.status))}</small></span><i class="status-dot status-${esc(indicator)}"></i></button>`;
  }).join("");
}

function chiefVoiceControl() {
  const enabled = Boolean(state.voice?.input?.enabled && navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  return `<button class="chief-voice" type="button" data-voice-record ${enabled ? "" : "disabled"} title="${enabled ? "Speak, then review the transcript" : "Voice transcription is unavailable"}"><span>●</span><b>${enabled ? "Speak" : "Voice off"}</b></button>`;
}

function renderChiefOfStaffBoard() {
  const d = state.data;
  const plan = state.orchestrationPlans[0] || null;
  const ari = d.agents.find((item) => item.id === "default");
  const department = plan ? d.departments.find((item) => item.id === plan.department_id) : null;
  const lead = plan ? d.agents.find((item) => item.id === plan.lead_agent_id) : null;
  const linkedRun = plan?.run_id ? state.runs.find((item) => item.run_id === plan.run_id) : null;
  const routeState = linkedRun?.status || plan?.status || "listening";
  const businessOptions = d.businesses.map((item) => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("");
  const critics = (plan?.critics || [
    { id: "brief", name: "Brief critic", question: "Checks the requested outcome", status: "waiting" },
    { id: "system", name: "System critic", question: "Checks policy and consistency", status: "waiting" },
    { id: "craft", name: "Craft critic", question: "Checks the rendered result", status: "waiting" },
  ]).map((critic, index) => `<article style="--critic-index:${index}"><i></i><div><small>${esc(titleCase(critic.status))} review</small><strong>${esc(critic.name)}</strong><p>${esc(critic.question)}</p></div></article>`).join("");
  const rationale = (plan?.rationale || []).map((item) => `<li>${esc(item)}</li>`).join("");
  const destination = routeState === "awaiting_approval" ? ["approvals", "Route prepared", "Open exact approval →"] : ["work", routeState === "completed" ? "Route completed" : "Work in motion", "Open live work →"];
  const dataRanks = { public: 0, internal: 1, private_business: 2, customer_restricted: 3 };
  const eligibleWorkspaces = state.workspaces.filter((workspace) => {
    const classAllowed = (dataRanks[workspace.data_class] ?? 99) <= (dataRanks[plan?.data_class] ?? -1);
    const accessAllowed = plan?.workspace_access !== "write" || workspace.write_allowed;
    return classAllowed && accessAllowed;
  });
  const workspaceOptions = eligibleWorkspaces.map((workspace) => `<option value="${esc(workspace.workspace_id)}">${esc(workspace.label)} · ${esc(titleCase(workspace.data_class))}</option>`).join("");
  const requiredCapabilities = plan?.required_capabilities || [];
  const runtimeOptions = state.runtimeAdapters.filter((runtime) => ["hermes", "codex"].includes(runtime.id) && runtime.execution_enabled && (!requiredCapabilities.includes("research_web") || runtime.id === "hermes")).map((runtime) => `<option value="${esc(runtime.id)}">${esc(runtime.name)} · ${esc(titleCase(runtime.status))}</option>`).join("");
  const workspaceRoute = plan?.execution_mode === "workspace";
  const dispatch = !plan ? "" : plan.status === "planned"
    ? `<form class="chief-dispatch-form" data-dispatch-form data-plan-id="${esc(plan.plan_id)}" data-plan-digest="${esc(plan.plan_digest)}">${workspaceRoute ? `<label>REGISTERED WORKSPACE<select name="workspaceId" required><option value="">Choose workspace</option>${workspaceOptions}</select></label><label>WORKER RUNTIME<select name="runtimeId" required>${runtimeOptions}</select></label>` : ""}<button class="chief-dispatch" type="submit" ${workspaceRoute && !eligibleWorkspaces.length ? "disabled" : ""}><span>${workspaceRoute ? "Bind the approved workspace" : "Prepare supervised run"}</span><b>Approval next →</b></button>${workspaceRoute && !eligibleWorkspaces.length ? `<small>No compatible write-approved workspace is registered. Open Repositories to add a clean worktree first.</small>` : ""}</form>`
    : `<button class="chief-dispatch is-ready" type="button" data-view-link="${destination[0]}"><span>${destination[1]}</span><b>${destination[2]}</b></button>`;

  return `<section class="chief-desk route-${esc(routeState)}" aria-label="Ari Vale Chief of Staff">
    <header class="chief-header">
      <div class="chief-identity"><p class="eyebrow">CHIEF OF STAFF · ARI VALE</p><h1>Route work with Ari.</h1><p>One outcome in. Ari chooses business, department, lead and model — you approve before anything runs.</p></div>
      <div class="chief-presence"><i></i><span><strong>${esc(ari?.name || "Ari Vale")}</strong><small>${plan ? esc(titleCase(plan.status)) : "Listening for your outcome"}</small></span></div>
    </header>
    <form class="chief-command" data-chief-form>
      <label class="chief-input"><span>TELL ARI THE OUTCOME</span><textarea name="objective" required maxlength="7200" placeholder="Example: Improve the customer dashboard, research the best motion system, build it safely and have an independent critic review the result."></textarea></label>
      <div class="chief-command-actions">${chiefVoiceControl()}<label><span>Business</span><select name="businessId"><option value="">Ari decides</option>${businessOptions}</select></label><label><span>Data</span><select name="dataClass"><option value="internal">Internal</option><option value="public">Public</option><option value="private_business">Private business</option><option value="customer_restricted">Customer restricted</option></select></label><button class="chief-plan" type="submit"><span>Route with Ari</span><b>⌁</b></button></div>
      <p class="chief-command-note">Planning is local and starts no model. Voice always becomes editable text first.</p>
    </form>
    ${plan ? `<div class="route-review"><div><small>ARI'S ROUTING DECISION</small><h2>${esc(department?.name || plan.department_id)} → ${esc(lead?.name || plan.lead_agent_id)} → ${esc(plan.model_id)}</h2><ul>${rationale}</ul></div>${dispatch}</div>` : ""}
    <aside class="critic-rail"><header><div><small>GAUNTLET REVIEW</small><strong>Independent quality gates</strong></div><span>${plan ? "PLANNED" : "STANDBY"}</span></header>${critics}<p class="critic-truth">Critics run only when a real review run exists.</p></aside>
  </section>`;
}

function osMapRegistry() {
  const d = state.data;
  const nodes = [
    { id: "owner", label: d.portfolio.owner || "Owner", detail: "Human authority", kind: "owner", radius: 23 },
    { id: "agent:default", label: d.agents.find((item) => item.id === "default")?.name || "Ari Vale", detail: "Chief of Staff", kind: "core", radius: 30, agentId: "default" },
  ];
  const links = [{ source: "owner", target: "agent:default", kind: "authority" }];
  const addNode = (node) => { if (!nodes.some((item) => item.id === node.id)) nodes.push(node); };
  const addLink = (source, target, kind = "registry") => {
    if (nodes.some((item) => item.id === source) && nodes.some((item) => item.id === target)) links.push({ source, target, kind });
  };

  for (const business of d.businesses) {
    addNode({ id: `business:${business.id}`, label: business.name, detail: titleCase(business.status), kind: "business", radius: 15, businessId: business.id, status: business.status });
    addLink("agent:default", `business:${business.id}`, "portfolio");
  }
  for (const department of d.departments) {
    addNode({ id: `department:${department.id}`, label: department.name, detail: `${department.ready_agents}/${department.agent_count} ready`, kind: "department", radius: 13, departmentId: department.id });
    for (const business of d.businesses.filter((item) => item.department_ids.includes(department.id))) addLink(`business:${business.id}`, `department:${department.id}`, "organization");
  }
  for (const agent of d.agents.filter((item) => item.id !== "default")) {
    addNode({ id: `agent:${agent.id}`, label: agent.name || titleCase(agent.id), detail: agent.profession || titleCase(agent.role), kind: "agent", radius: 12, agentId: agent.id, status: agent.state });
    for (const department of d.departments.filter((item) => item.agent_ids.includes(agent.id))) addLink(`department:${department.id}`, `agent:${agent.id}`, "workforce");
  }

  addNode({ id: "fabric:memory", label: "Shared memory", detail: `${d.operational?.shared_memory?.fact_count ?? 0} durable facts`, kind: "fabric", radius: 17, view: "memory" });
  addNode({ id: "fabric:skills", label: "Shared skills", detail: `${d.summary.shared_skills} available`, kind: "fabric", radius: 17, view: "skills" });
  addLink("agent:default", "fabric:memory", "intelligence");
  addLink("agent:default", "fabric:skills", "intelligence");
  for (const system of d.systems) {
    const runtime = runtimeForSystem(system.id);
    const live = runtime.execution_enabled || ["live", "routed", "detected"].includes(runtime.status);
    addNode({ id: `system:${system.id}`, label: system.name, detail: live ? titleCase(runtime.status) : "Planned adapter", kind: live ? "system" : "planned", radius: live ? 13 : 10, systemId: system.id, status: runtime.status });
    addLink("agent:default", `system:${system.id}`, live ? "runtime" : "future");
    if (system.shared_memory) addLink(`system:${system.id}`, "fabric:memory", "fabric");
    if (system.shared_skills) addLink(`system:${system.id}`, "fabric:skills", "fabric");
  }

  for (const plan of state.orchestrationPlans.slice(0, 4)) {
    addNode({ id: `plan:${plan.plan_id}`, label: plan.objective, detail: titleCase(plan.status), kind: "work", radius: 11, view: plan.run_id ? "work" : "command", status: plan.status });
    addLink("agent:default", `plan:${plan.plan_id}`, "live-work");
    addLink(`plan:${plan.plan_id}`, `agent:${plan.lead_agent_id}`, "assignment");
  }
  for (const run of state.runs.filter((item) => ["queued", "running", "awaiting_approval"].includes(item.status)).slice(0, 6)) {
    addNode({ id: `run:${run.run_id}`, label: run.objective, detail: titleCase(run.status), kind: "work", radius: 11, view: run.status === "awaiting_approval" ? "approvals" : "work", status: run.status });
    addLink(`agent:${run.agent_id}`, `run:${run.run_id}`, "live-work");
  }
  return { nodes, links };
}

function livingOSMapSurface() {
  const layers = [["all", "Whole OS"], ["organization", "Studios & team"], ["intelligence", "Memory & skills"], ["systems", "Models & systems"], ["work", "Live work"]];
  const runtimeCount = state.data.systems.filter((item) => ["live", "routed", "detected"].includes(runtimeForSystem(item.id).status)).length;
  return `<section class="living-os-map">
    <header><div><p class="eyebrow">ONE SHARED BRAIN · LIVE REGISTRY</p><h2>Your operating system, as one explorable map.</h2><p>Ari, studios, departments, professional agents, shared intelligence and runtimes are connected here. Select any node to inspect it or open its real AGIOS surface.</p></div><div class="map-truth"><i></i><span><strong>Registry live</strong><small>Private contents remain server-side</small></span></div></header>
    <div class="os-map-layers" aria-label="Map layers">${layers.map(([id, label]) => `<button class="${state.osMapLayer === id ? "is-active" : ""}" data-os-map-layer="${id}">${label}</button>`).join("")}</div>
    <div class="living-os-map-grid"><div id="living-os-map-canvas" class="living-os-map-canvas" role="img" aria-label="Interactive map of the AGIOS operating registry"></div><aside id="living-os-map-inspector" class="living-os-map-inspector"><small>ARI'S SHARED MAP</small><h3>Everything has one address.</h3><p>Drag to reorganize, scroll to zoom and select a node. Motion means topology—not fabricated work. Only real queued or running work receives an activity pulse.</p><div class="map-inspector-stats"><span><strong>${state.data.businesses.length}</strong> studios</span><span><strong>${state.data.agents.length}</strong> agents</span><span><strong>${runtimeCount}</strong> routed systems</span></div><div class="future-adapter-note"><i>+</i><span><strong>Adapter-ready</strong><small>Claude and future runtimes join this same registry when installed, authenticated and audited.</small></span></div></aside></div>
  </section>`;
}

function renderLivingOSMap() {
  const host = document.querySelector("#living-os-map-canvas");
  if (!host) return;
  if (state.osMapSimulation) state.osMapSimulation.stop();
  host.replaceChildren();
  const registry = osMapRegistry();
  const allowKinds = {
    organization: new Set(["owner", "core", "business", "department", "agent"]),
    intelligence: new Set(["owner", "core", "agent", "fabric"]),
    systems: new Set(["owner", "core", "system", "planned", "fabric"]),
    work: new Set(["owner", "core", "agent", "work"]),
  };
  const allowed = allowKinds[state.osMapLayer];
  const nodes = registry.nodes.filter((item) => !allowed || allowed.has(item.kind));
  const nodeIds = new Set(nodes.map((item) => item.id));
  const links = registry.links.filter((item) => nodeIds.has(String(item.source)) && nodeIds.has(String(item.target)));
  const width = Math.max(640, host.clientWidth || 920);
  const height = Math.max(510, host.clientHeight || 560);
  const svg = select(host).append("svg").attr("viewBox", [0, 0, width, height]).attr("aria-hidden", "true");
  const defs = svg.append("defs");
  defs.append("radialGradient").attr("id", "os-core-glow").selectAll("stop").data([["0%", "#f8dfab"], ["35%", "#bc77f0"], ["100%", "#30234c"]]).join("stop").attr("offset", (item) => item[0]).attr("stop-color", (item) => item[1]);
  const stage = svg.append("g");
  svg.call(zoom().scaleExtent([.55, 2.7]).on("zoom", (event) => stage.attr("transform", event.transform)));
  const line = stage.append("g").attr("class", "os-map-links").selectAll("line").data(links).join("line").attr("class", (item) => `link-${item.kind}`);
  const node = stage.append("g").selectAll("g").data(nodes).join("g").attr("class", (item) => `os-map-node node-${item.kind} ${["queued", "running"].includes(item.status) ? "is-active-work" : ""}`).attr("tabindex", 0);
  node.append("circle").attr("r", (item) => item.radius);
  node.append("text").attr("text-anchor", "middle").attr("dy", (item) => item.radius + 14).text((item) => item.label.length > 24 ? `${item.label.slice(0, 22)}…` : item.label);
  node.append("title").text((item) => `${item.label} · ${item.detail}`);
  const inspect = (_event, item) => {
    const panel = document.querySelector("#living-os-map-inspector");
    if (!panel) return;
    const action = item.agentId ? `<button data-agent="${esc(item.agentId)}">Open agent workspace →</button>` : item.systemId ? `<button data-system="${esc(item.systemId)}">Open system →</button>` : item.view ? `<button data-view-link="${esc(item.view)}">Open ${esc(titleCase(item.view))} →</button>` : item.businessId ? `<button data-view-link="portfolio">Open portfolio →</button>` : "";
    panel.innerHTML = `<small>${esc(titleCase(item.kind))} · SHARED REGISTRY</small><h3>${esc(item.label)}</h3><p>${esc(item.detail)}</p><div class="map-node-policy"><span><strong>Truthful state</strong><small>${esc(item.status ? titleCase(item.status) : "Registered")}</small></span><span><strong>Access</strong><small>AGIOS policy scoped</small></span></div>${action}<p class="map-inspector-foot">Selecting a node does not start work or spend tokens.</p>`;
  };
  node.on("click", inspect).on("keydown", (event, item) => { if (["Enter", " "].includes(event.key)) inspect(event, item); });
  node.call(drag().on("start", (event, item) => { if (!event.active) state.osMapSimulation.alphaTarget(.18).restart(); item.fx = item.x; item.fy = item.y; }).on("drag", (event, item) => { item.fx = event.x; item.fy = event.y; }).on("end", (event, item) => { if (!event.active) state.osMapSimulation.alphaTarget(0); item.fx = null; item.fy = null; }));
  state.osMapSimulation = forceSimulation(nodes)
    .force("link", forceLink(links).id((item) => item.id).distance((item) => ["fabric", "future"].includes(item.kind) ? 82 : item.kind === "live-work" ? 72 : 108).strength(.42))
    .force("charge", forceManyBody().strength((item) => item.kind === "core" ? -720 : item.kind === "business" ? -260 : -105))
    .force("collide", forceCollide().radius((item) => item.radius + 19))
    .force("center", forceCenter(width * .48, height * .49))
    .on("tick", () => {
      line.attr("x1", (item) => item.source.x).attr("y1", (item) => item.source.y).attr("x2", (item) => item.target.x).attr("y2", (item) => item.target.y);
      node.attr("transform", (item) => `translate(${item.x},${item.y})`);
    });
}

function improvementIntelligenceSurface() {
  const proposals = state.skillProposals;
  const statusCount = (statuses) => proposals.filter((item) => statuses.includes(item.status)).length;
  const activeRuns = state.runs.filter((item) => ["queued", "running"].includes(item.status)).length;
  const failedRuns = state.runs.filter((item) => ["failed", "interrupted"].includes(item.status)).length;
  const completedRuns = state.runs.filter((item) => item.status === "completed").length;
  const loop = [
    ["01", "Observe", state.runs.length, "Sessions and outcomes"],
    ["02", "Find pattern", statusCount(["needs_evidence", "awaiting_owner_review"]), "Evidence-linked proposals"],
    ["03", "Owner review", statusCount(["awaiting_owner_review"]), "Your judgment gate"],
    ["04", "Author", statusCount(["approved_for_authoring", "draft_ready"]), "Bounded skill draft"],
    ["05", "Validate", statusCount(["validated"]), "Safety and quality checks"],
    ["06", "Install & measure", statusCount(["installed"]), "Shared, versioned capability"],
  ];
  const dimensions = [
    ["Conversation analysis", state.runs.length ? `${state.runs.length} sessions` : "Standby", "Turns repeated requests into evidence, never automatic changes."],
    ["Cost & limits", state.data.usage?.cost == null ? "Unavailable" : String(state.data.usage.cost), "Provider-reported only; missing usage never appears as zero."],
    ["Skill performance", proposals.length ? `${proposals.length} proposals` : "No proposals", "Every improvement remains attached to source runs."],
    ["Memory health", titleCase(state.data.operational?.shared_memory?.status || "unavailable"), `${state.data.operational?.shared_memory?.fact_count ?? 0} durable scoped facts.`],
    ["Session hygiene", failedRuns ? `${failedRuns} need review` : "Clear", `${completedRuns} completed · ${activeRuns} active.`],
    ["Workflow patterns", state.orchestrationPlans.length ? `${state.orchestrationPlans.length} Ari routes` : "Listening", "Routing decisions remain inspectable before execution."],
    ["External opportunity", "Not connected", "No monitoring claim until a permitted source adapter exists."],
    ["Business outcomes", "Needs metrics", "Revenue and outcome signals will appear only from verified sources."],
  ];
  return `<section class="improvement-intelligence"><header><div><p class="eyebrow">SELF-IMPROVEMENT · EVIDENCE BEFORE CHANGE</p><h2>AGIOS can grow without rewriting itself in the dark.</h2><p>Professional agents learn from verified work, propose skills in their specialty and share approved capabilities across the studio. Nothing installs itself.</p></div><button data-view-link="skills">Open Skill Lab →</button></header><div class="improvement-loop">${loop.map(([index, label, count, note], position) => `<article style="--loop-index:${position}"><small>${index}</small><i></i><strong>${count}</strong><h3>${label}</h3><p>${note}</p></article>`).join("")}</div><div class="intelligence-radar"><div><p class="eyebrow">INTELLIGENCE RADAR</p><h3>What is worth your attention?</h3><p>Each dimension is honest about what AGIOS can currently measure.</p></div><div class="radar-grid">${dimensions.map(([name, value, note], index) => `<article class="radar-${index % 4}"><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${esc(name)}</strong><small>${esc(note)}</small></div><em>${esc(value)}</em></article>`).join("")}</div></div></section>`;
}

function dreamingDigestSurface() {
  const digest = state.dreaming;
  if (!digest) return "";
  const cards = digest.recommendations.map((rec, index) => {
    const evidence = Object.entries(rec.evidence || {}).map(([key, value]) => `${key} ${value}`).join(" · ");
    return `<article class="dreaming-card" style="--dreaming-index:${index}">
      <header><span class="dreaming-dim">${esc(digest.dimensions.find((d) => d.id === rec.dimension)?.label || rec.dimension)}</span><span class="dreaming-evidence">${esc(evidence)}</span></header>
      <h3>${esc(rec.title)}</h3>
      <p>${esc(rec.detail)}</p>
      <footer>
        <button class="dreaming-accept" data-dreaming-accept="${esc(rec.id)}" data-dreaming-target="${esc(rec.action.target || "")}">${esc(rec.action.label || "Accept")}</button>
        <button class="dreaming-dismiss" data-dreaming-dismiss="${esc(rec.id)}">Not now</button>
      </footer>
    </article>`;
  }).join("");
  const dimensionChips = digest.dimensions.map((dim) =>
    `<span class="dreaming-chip is-${esc(dim.status)}" title="${esc(dim.detail)}">${esc(dim.label)}</span>`).join("");
  const empty = digest.recommendations.length
    ? ""
    : `<div class="dreaming-empty"><b>Nothing needs you right now.</b> <span>Every dimension is measured, and no real signal produced a recommendation. New evidence appears here automatically.</span></div>`;
  return `<section class="dreaming-digest"><header><div><p class="eyebrow">DREAMING DIGEST · EVERY DAY</p><h2>${digest.recommendations.length} high-leverage recommendation${digest.recommendations.length === 1 ? "" : "s"} for you.</h2><p>Eight dimensions measured against real local stores; only genuine signals become cards. Nothing here is synthetic.</p></div><span class="dreaming-stamp">LOCAL · EVIDENCE-GATED</span></header><div class="dreaming-dims">${dimensionChips}</div><div class="dreaming-cards">${cards || empty}</div></section>`;
}

function liveCount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function liveMetricSnapshot(snapshot = state.liveWork) {
  const sources = snapshot?.sources || {};
  return {
    "source-agios": liveCount(sources.agios?.runs) + liveCount(sources.agios?.memory_facts) + liveCount(sources.agios?.artifacts),
    "source-hermes": liveCount(sources.hermes?.sessions) + liveCount(sources.hermes?.messages) + liveCount(sources.hermes?.skills),
    "source-codex": liveCount(sources.codex?.sessions) + liveCount(sources.codex?.rollout_files),
    "source-opencode": liveCount(sources.opencode?.sessions) + liveCount(sources.opencode?.messages) + liveCount(sources.opencode?.tokens),
    improvements: (snapshot?.improvements || []).length,
  };
}

function liveSourceCard(id, title, primary, label, metrics, source) {
  const statusValue = source?.status || "unavailable";
  return `<article class="live-source-card" data-live-key="source-${esc(id)}">
    <header><div class="source-mark source-${esc(id)}">${esc(title.slice(0, 1))}</div><div><strong>${esc(title)}</strong><small>${esc(statusValue)}</small></div><span class="source-status is-${esc(statusValue)}">${statusValue === "live" ? "LIVE" : "OFF"}</span></header>
    <div class="source-primary"><strong>${esc(primary)}</strong><span>${esc(label)}</span></div>
    <dl>${metrics.map(([term, value]) => `<div><dt>${esc(term)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>
    <footer>${esc(source?.provenance || "AGIOS local control plane")}</footer>
  </article>`;
}

function recentLocalWork(sources) {
  const rows = [
    ...(sources.hermes?.recent || []).map((item) => ({ ...item, runtime: "Hermes" })),
    ...(sources.codex?.recent || []).map((item) => ({ ...item, runtime: "Codex" })),
  ].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)).slice(0, 6);
  if (!rows.length) return `<div class="simple-empty">No session metadata has been indexed yet.</div>`;
  return rows.map((item) => `<div class="recent-work-row"><span class="runtime-tag">${esc(item.runtime)}</span><div><strong>${esc(item.title || `${item.runtime} session`)}</strong><small>${esc(item.source || "local")} · ${esc(relativeTime(item.updated_at))}</small></div></div>`).join("");
}

function improvementRows(items) {
  if (!items.length) return `<div class="simple-empty">No verified repository improvements found.</div>`;
  return items.slice(0, 6).map((item) => `<div class="improvement-row"><span>${esc(item.repository)}</span><div><strong>${esc(item.subject)}</strong><small>${esc(item.short_hash)} · ${esc(relativeTime(item.committed_at))}</small></div></div>`).join("");
}

function executionSpineStages() {
  const routes = state.orchestrationPlans || [];
  const pendingPlans = routes.filter((plan) => plan.status === "planned").length;
  const pendingRuns = state.runs.filter((run) => run.status === "awaiting_approval").length;
  const activeRuns = state.runs.filter((run) => ["queued", "running"].includes(run.status)).length;
  const evidenceRuns = state.runs.filter((run) => run.response || ["completed", "failed", "interrupted"].includes(run.status)).length;
  const learnedSkills = state.skillProposals.filter((proposal) => proposal.status === "installed").length;
  const current = pendingPlans || pendingRuns ? "approve" : activeRuns ? "run" : evidenceRuns ? "evidence" : "intent";
  const stages = [
    { id: "intent", label: "Intent", count: state.directiveDrafts.length + routes.length + state.runs.length, note: "owner outcomes" },
    { id: "route", label: "Route", count: routes.length + state.runs.length, note: "bound plans" },
    { id: "approve", label: "Approve", count: pendingPlans + pendingRuns, note: "waiting now" },
    { id: "run", label: "Runtime", count: activeRuns, note: "active now" },
    { id: "evidence", label: "Evidence", count: evidenceRuns, note: "reviewable runs" },
    { id: "learn", label: "Learn", count: state.memories.length + learnedSkills, note: "durable items" },
  ];
  return stages.map((stage) => ({ ...stage, current: stage.id === current, populated: stage.count > 0 }));
}

function executionSpineSurface() {
  const stages = executionSpineStages();
  return `<section class="execution-spine-card">
    <header><div><span>Execution spine</span><h2>Every outcome leaves a trace.</h2></div><p>Live counts from intent, routing, owner approval, runtime, evidence, and retained knowledge.</p></header>
    <div id="execution-spine-chart" class="execution-spine-chart" aria-label="Live AGIOS execution stages"></div>
    <div class="execution-spine-fallback">${stages.map((stage) => `<div class="${stage.current ? "is-current" : ""}"><strong>${esc(stage.count)}</strong><span>${esc(stage.label)}</span><small>${esc(stage.note)}</small></div>`).join("")}</div>
  </section>`;
}

function renderExecutionSpine() {
  const host = document.querySelector("#execution-spine-chart");
  if (!host) return;
  state.executionSpineCleanup?.();
  const stages = executionSpineStages();
  const draw = () => {
    host.replaceChildren();
    const width = Math.max(700, host.clientWidth || 700);
    const height = 190;
    const pad = 54;
    const step = (width - pad * 2) / (stages.length - 1);
    const points = stages.map((stage, index) => ({ ...stage, x: pad + index * step, y: index % 2 ? 116 : 72 }));
    const svg = select(host).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img");
    const links = points.slice(0, -1).map((point, index) => ({ source: point, target: points[index + 1], on: point.populated && points[index + 1].populated }));
    svg.selectAll("path.spine-link").data(links).join("path")
      .attr("class", (link) => `spine-link${link.on ? " is-on" : ""}`)
      .attr("d", (link) => `M${link.source.x},${link.source.y} C${link.source.x + step * .48},${link.source.y} ${link.target.x - step * .48},${link.target.y} ${link.target.x},${link.target.y}`);
    const node = svg.selectAll("g.spine-node").data(points).join("g")
      .attr("class", (point) => `spine-node${point.current ? " is-current" : ""}${point.populated ? " is-populated" : ""}`)
      .attr("transform", (point) => `translate(${point.x},${point.y})`);
    node.append("circle").attr("r", (point) => point.current ? 14 : 10);
    node.append("text").attr("class", "spine-count").attr("text-anchor", "middle").attr("y", 4).text((point) => point.count);
    node.append("text").attr("class", "spine-label").attr("text-anchor", "middle").attr("y", (point) => point.y < 100 ? -28 : 35).text((point) => point.label);
    node.append("text").attr("class", "spine-note").attr("text-anchor", "middle").attr("y", (point) => point.y < 100 ? -14 : 50).text((point) => point.note);
  };
  draw();
  const observer = new ResizeObserver(draw);
  observer.observe(host);
  state.executionSpineCleanup = () => observer.disconnect();
}

function renderCommand() {
  const sources = state.liveWork?.sources || {};
  const agios = sources.agios || {};
  const hermes = sources.hermes || {};
  const codex = sources.codex || {};
  const opencode = sources.opencode || {};
  const plannedRoutes = state.orchestrationPlans.filter((plan) => plan.status === "planned");
  const pendingRuns = state.runs.filter((run) => run.status === "awaiting_approval");
  const activeRuns = state.runs.filter((run) => ["queued", "running"].includes(run.status));
  const pendingDecisions = plannedRoutes.length + pendingRuns.length;
  const nextAction = pendingDecisions
    ? { label: `Review ${pendingDecisions} decision${pendingDecisions === 1 ? "" : "s"}`, attr: `data-view-link="approvals"` }
    : activeRuns.length
      ? { label: `Watch ${activeRuns.length} active run${activeRuns.length === 1 ? "" : "s"}`, attr: `data-view-link="work"` }
      : { label: "Ask Ari for work", attr: "data-open-directive" };
  const opencodeCost = Number(opencode.cost || 0);
  const lastUpdated = state.liveWork?.generated_at ? new Date(state.liveWork.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "loading";
  const headline = pendingDecisions
    ? `${pendingDecisions} decision${pendingDecisions === 1 ? "" : "s"} need your judgment.`
    : activeRuns.length
      ? `${activeRuns.length} worker${activeRuns.length === 1 ? " is" : "s are"} moving.`
      : "The system is ready for your next move.";
  const heroDetail = pendingDecisions
    ? esc(plannedRoutes[0]?.objective || pendingRuns[0]?.objective || "Review the exact route before model work starts.")
    : activeRuns.length
      ? "Follow the live runtime state. Completion still requires evidence and review."
      : "Give Ari one outcome. AGIOS will route it, bind the context, and stop for your approval.";

  page.innerHTML = `
    <div class="signal-home">
    <section class="signal-hero">
      <div class="signal-hero-copy"><span class="signal-kicker">PRIVATE CONTROL PLANE / ${esc(lastUpdated)}</span><h1>${headline}</h1><p>${heroDetail}</p><div class="signal-hero-actions"><button class="primary-action" ${nextAction.attr}>${esc(nextAction.label)}</button><button class="quiet-action" data-view-link="guide">Open operator guide</button></div></div>
      <aside class="judgment-console" data-live-key="judgment">
        <header><span>Owner control</span>${status(pendingDecisions ? "awaiting_approval" : activeRuns.length ? "running" : "ready")}</header>
        <strong>${pendingDecisions || activeRuns.length || 0}</strong>
        <p>${pendingDecisions ? "bound decisions waiting" : activeRuns.length ? "workers active now" : "consequential actions waiting"}</p>
        <div><span><b>${liveCount(agios.memory_facts)}</b> memories</span><span><b>${liveCount(hermes.skills)}</b> skills</span><span><b>${liveCount(agios.artifacts)}</b> artifacts</span></div>
      </aside>
    </section>

    ${executionSpineSurface()}

    <div class="section-heading signal-section-heading"><div><p class="eyebrow">SOURCE MATRIX</p><h2>Four runtimes. One truthful view.</h2></div><span>Safe local metadata only</span></div>
    <section class="live-source-grid">
      ${liveSourceCard("agios", "AGIOS", liveCount(agios.runs), "runs & evidence", [["Active", liveCount(agios.active_runs)], ["Memory", liveCount(agios.memory_facts)], ["Artifacts", liveCount(agios.artifacts)], ["Training routes", liveCount(agios.training_examples)]], agios)}
      ${liveSourceCard("hermes", "Hermes", liveCount(hermes.sessions), "local sessions", [["Messages", liveCount(hermes.messages)], ["Skills", liveCount(hermes.skills)], ["Memory facts", liveCount(hermes.memory_facts)]], hermes)}
      ${liveSourceCard("codex", "Codex", liveCount(codex.sessions), "indexed sessions", [["Rollouts", liveCount(codex.rollout_files)], ["Source", "local metadata"], ["Transcript bodies", "not exposed"]], codex)}
      ${liveSourceCard("opencode", "OpenCode", liveCount(opencode.sessions), "local sessions", [["Messages", liveCount(opencode.messages)], ["Tokens", liveCount(opencode.tokens).toLocaleString()], ["Recorded cost", opencodeCost ? `$${opencodeCost.toFixed(4)}` : "$0.0000"]], opencode)}
    </section>

    <div class="home-two-column">
      <section class="plain-panel"><header><div><p class="eyebrow">RECENT ACTIVITY</p><h2>Hermes and Codex sessions</h2></div><button data-view-link="work">Open work →</button></header><div>${recentLocalWork(sources)}</div></section>
      <section class="plain-panel" data-live-key="improvements"><header><div><p class="eyebrow">REPOSITORY IMPROVEMENTS</p><h2>Verified code changes</h2></div><button data-view-link="skills">Skills →</button></header><div>${improvementRows(state.liveWork?.improvements || [])}</div></section>
    </div>

    <section class="plain-panel next-judgment"><header><div><p class="eyebrow">OWNER CONTROL</p><h2>${pendingDecisions ? `${pendingDecisions} decision${pendingDecisions === 1 ? "" : "s"} need you` : "No consequential action is waiting"}</h2><p>${pendingDecisions ? esc(plannedRoutes[0]?.objective || pendingRuns[0]?.objective) : "Agents may research, draft and verify locally. Sending, publishing, payments and production remain stopped."}</p></div><button ${pendingDecisions ? `data-view-link="approvals"` : "data-open-directive"}>${pendingDecisions ? "Review decisions" : "Start new work"} →</button></header></section>
    </div>
  `;
  window.requestAnimationFrame(renderExecutionSpine);
}

function renderGuide() {
  page.innerHTML = `${heading("How to use AGIOS", "One outcome in. Evidence out.", "Use this page as the operating manual. Advanced screens are optional; the five-step loop is enough for daily work.")}
    <section class="guide-steps">
      <article id="guide-ask"><b>1</b><div><p class="eyebrow">ASK</p><h2>Tell Ari the outcome</h2><p>Use plain language: what should be true when the work is done? Add the data class and project only when relevant. Do not choose agents or models unless you have a reason.</p><div class="guide-example"><strong>Example</strong><span>“Inspect the AGIOS dashboard tests and propose a simpler home page. Do not edit yet.”</span></div><button data-open-directive>Ask Ari →</button></div></article>
      <article><b>2</b><div><p class="eyebrow">APPROVE</p><h2>Read the route before it runs</h2><p>Check the exact objective, specialist, runtime, model, data class, workspace access, memories and skills. Approve only that bound route. If anything is wrong, cancel and ask again.</p><button data-view-link="approvals">Open approvals →</button></div></article>
      <article><b>3</b><div><p class="eyebrow">WATCH</p><h2>Follow the real status</h2><p><strong>Queued</strong> means accepted, <strong>running</strong> means the runtime is working, <strong>completed</strong> means a response exists, and <strong>failed</strong> includes a bounded reason. A completed answer is not proof by itself.</p><button data-view-link="work">Open work →</button></div></article>
      <article><b>4</b><div><p class="eyebrow">VERIFY</p><h2>Review evidence, not claims</h2><p>Check attached memories and skills, generated files, repository changes, tests, screenshots and reviewer findings. External delivery still requires your exact approval.</p><button data-view-link="artifacts">Open evidence →</button></div></article>
      <article><b>5</b><div><p class="eyebrow">LEARN</p><h2>Keep only durable knowledge</h2><p>Save decisions, constraints and facts that agents should reuse. Do not save passwords, temporary task progress or whole transcripts. Propose skill improvements only from completed-run evidence.</p><button data-view-link="memory">Open memory →</button></div></article>
    </section>
    <div class="guide-grid">
      <section class="plain-panel"><p class="eyebrow">WHICH RUNTIME?</p><h2>Let routing choose by default</h2><dl class="guide-definitions"><div><dt>Hermes</dt><dd>Main orchestration, research, memory, tools and private/local routes.</dd></div><div><dt>Codex</dt><dd>Difficult approved coding in a registered workspace with its sandbox.</dd></div><div><dt>OpenCode</dt><dd>Second workspace coding runtime; deny-by-default tools, no auto mode.</dd></div><div><dt>Local workers</dt><dd>Private extraction, coding and first drafts with no hosted fallback.</dd></div></dl></section>
      <section class="plain-panel"><p class="eyebrow">ALWAYS STOPS FOR YOU</p><h2>Consequential actions</h2><ul class="guide-boundaries"><li>Sending messages, bids, applications or forms</li><li>Publishing, production deployment or final delivery</li><li>Payments, subscriptions, pricing or contracts</li><li>Account changes, credentials or broader data access</li><li>Scope, deadline or legal commitments</li></ul></section>
      <section class="plain-panel"><p class="eyebrow">WHERE THINGS LIVE</p><h2>The six useful screens</h2><dl class="guide-definitions"><div><dt>Home</dt><dd>Live status and your next action.</dd></div><div><dt>Work</dt><dd>Requests, routes, status and responses.</dd></div><div><dt>Approvals</dt><dd>Exact decisions waiting for you.</dd></div><div><dt>Evidence</dt><dd>Artifacts and grounded run context.</dd></div><div><dt>Memory</dt><dd>Durable owner-controlled knowledge.</dd></div><div><dt>Apps & models</dt><dd>Connected runtimes and truthful blockers.</dd></div></dl></section>
    </div>`;
}

function renderPortfolio() {
  const cards = state.data.businesses.map((business, index) => `<article class="entity-card">
    <div class="entity-top"><span class="entity-index">B-${String(index + 1).padStart(2, "0")}</span>${status(business.status)}</div>
    <h2>${esc(business.name)}</h2><p>${esc(business.mission)}</p>
    <footer class="entity-footer"><span>${business.department_count} departments</span><span>Owner · ${esc(titleCase(business.owner_agent_id))}</span></footer>
  </article>`).join("");
  page.innerHTML = `${heading("Portfolio", "Every business, one operating system.", "Studios and ventures share governance, agents, knowledge and tools while keeping their missions and data boundaries clear.")}<div class="view-grid">${cards}</div>`;
}

function renderDepartments() {
  const rows = state.data.departments.map((department) => `<div class="data-row columns-departments">
    <div><strong>${esc(department.name)}</strong><p>${esc(department.id)}</p></div>
    <span>${esc(department.mission)}</span>
    <span>${department.ready_agents} / ${department.agent_count} ready</span>
    <span>${department.skill_bundles.map(titleCase).join(" · ")}</span>
  </div>`).join("");
  page.innerHTML = `${heading("Organization", "Departments that can assemble around any business.", "Research, building, design, growth and review are reusable operating capabilities—not isolated chat threads.")}
    <div class="data-panel"><div class="data-head columns-departments"><span>Department</span><span>Mission</span><span>Fleet</span><span>Skill bundles</span></div>${rows}</div>`;
}

function renderAgents() {
  const rows = state.data.agents.map((agent) => `<div class="data-row columns-agents clickable-row" data-agent="${esc(agent.id)}">
    <div><strong>${esc(agent.name || titleCase(agent.id))}</strong><p>${esc(agent.profession || titleCase(agent.role))} · ${esc(agent.seniority || "Specialist")}</p></div>
    <span>${status(agent.state)}</span>
    <span class="mono">${esc(agent.model || "Unavailable")}</span>
    <span>${agent.skill_count ?? "—"} skills</span>
    <span>${agent.gateway_running ? "Gateway online" : "Standing by"}</span>
  </div>`).join("");
  page.innerHTML = `${heading("Agent fleet", "Persistent workers, activated with purpose.", "An agent can be ready all day without using model tokens. AGIOS wakes the right worker for a due schedule, approved event or explicit assignment.")}
    <div class="state-callout"><span>◉</span><div><strong>Ready is not running</strong><p>Only the gateway remains available. Model work starts when AGIOS dispatches a governed job.</p></div></div>
    <div class="data-panel"><div class="data-head columns-agents"><span>Agent</span><span>State</span><span>Model route</span><span>Capability</span><span>Wake mode</span></div>${rows}</div>`;
}

const runErrorMessages = {
  adapter_unavailable: "This runtime has no executable AGIOS adapter.",
  authentication_failed: "The selected provider rejected its local credentials.",
  fallback_blocked: "AGIOS rejected an unapproved provider fallback. Authenticate the selected route or choose another model.",
  model_unavailable: "The selected model is not available from this provider.",
  provider_unavailable: "The selected provider route is not configured or reachable.",
  rate_limited: "The provider limit is currently exhausted. Retry later or choose another model.",
  runtime_unavailable: "The local runtime command could not be started.",
  sandbox_denied: "The runtime could not enter the approved workspace sandbox.",
  timeout: "The runtime exceeded the supervised execution time limit.",
  tool_approval_required: "The runtime requested authority that this run does not grant.",
  internal_error: "AGIOS stopped the run after an internal execution error.",
  runtime_failed: "The runtime exited without a usable response.",
};

function runError(run) {
  const code = run.error_code || "runtime_failed";
  return `<div class="run-error"><strong>${esc(titleCase(code))}</strong><span>${esc(runErrorMessages[code] || runErrorMessages.runtime_failed)}</span></div>`;
}

function evidenceChips(run) {
  const chips = [
    { label: "memory", count: (run.memory_ids || []).length, tone: "violet" },
    { label: "skills", count: (run.skill_ids || []).length, tone: "mint" },
    { label: "images", count: (run.vision_asset_ids || []).length, tone: "coral" },
  ];
  return `<div class="evidence-chips">${chips.map((chip) => `<span class="evidence-chip tone-${chip.tone}${chip.count ? "" : " is-empty"}" title="${chip.count ? `${chip.count} ${chip.label} attached to this run` : `No ${chip.label} attached`}"><i></i>${chip.label} ${chip.count}</span>`).join("")}</div>`;
}

function runCard(run, { transcript = false } = {}) {
  const active = ["queued", "running"].includes(run.status);
  const approval = run.status === "awaiting_approval" ? `<div class="approval-gate"><div><strong>Exact run approval required</strong><small>${esc(titleCase(run.data_class))} · ${esc(run.provider || "local runtime")} · ${esc(run.model || "profile model")}</small></div><div class="approval-actions"><button data-cancel-run="${esc(run.run_id)}">Cancel</button><button data-approve-run="${esc(run.run_id)}" data-approval-digest="${esc(run.approval_digest)}">Approve & run</button></div></div>` : "";
  const response = run.response ? `<div class="run-response"><div class="response-heading"><span>${esc(titleCase(run.agent_id))}</span><button type="button" data-speak-run="${esc(run.run_id)}" title="Speak this reply">Listen</button>${run.status === "completed" ? `<button type="button" class="gauntlet-launch" data-gauntlet-run="${esc(run.run_id)}" title="Independent critics: brief, system, craft">Run gauntlet review</button>` : ""}</div><pre>${esc(run.response)}</pre></div>` : run.status === "failed" ? runError(run) : active ? `<div class="run-progress"><i></i><span>${run.status === "queued" ? "Waiting for the supervised worker" : "The worker is thinking; this view refreshes automatically"}</span></div>` : "";
  return `<article class="run-card ${transcript ? "is-transcript" : ""}"><header><div><span>${esc(titleCase(run.mode))} · ${new Date(run.created_at).toLocaleString()}</span><strong>${esc(titleCase(run.agent_id))}</strong></div>${status(run.status)}</header><div class="run-request"><span>OWNER</span><p>${esc(run.objective)}</p></div>${approval}${response}<footer>${evidenceChips(run)}<span>${esc(titleCase(run.runtime_id || "hermes"))}${run.workspace_id ? ` · ${esc(titleCase(run.workspace_access))} workspace` : ""} · ${active ? "working" : esc(run.hermes_session_id || "audited locally")}</span></footer></article>`;
}

function skillPicker() {
  const items = state.data.shared_fabric.skills.items.slice(0, 18);
  return `<fieldset class="run-skill-picker"><legend>Shared skills · choose up to 3</legend>${items.map((skill) => `<label><input type="checkbox" name="skill" value="${esc(skill.id)}"/><span>${esc(titleCase(skill.name))}</span></label>`).join("")}</fieldset>`;
}

function modelsForAgent(agent) {
  const ids = new Set((agent.workloads || []).flatMap((workload) => state.data.routes?.[workload] || []));
  return state.data.models.filter((model) => ids.has(model.id));
}

function voiceControls() {
  const input = state.voice?.input;
  const browserReady = Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  const enabled = browserReady && input?.enabled;
  const detail = !browserReady ? "Browser microphone unavailable" : !state.voice ? "Checking Hermes voice" : enabled ? (input.local ? `Local transcription · ${input.provider}` : `Configured transcription · ${input.provider}`) : "Hermes transcription is not configured";
  return `<div class="voice-controls"><button type="button" data-voice-record ${enabled ? "" : "disabled"}><span>●</span> Push to talk</button><label class="vision-upload">◉ Add image<input type="file" data-vision-input accept="image/png,image/jpeg,image/webp"/></label><select name="visionRetention" title="Image retention"><option value="session">Delete after run</option><option value="24_hours">Keep 24 hours</option><option value="manual">Keep until removed</option></select><small data-vision-state>${esc(detail)} · voice and images never auto-send</small></div>`;
}

function runComposer(agent, mode) {
  const isGoal = mode === "goal";
  const isWorkspace = mode === "workspace";
  const isAriRouter = agent.id === "default" && mode === "chat";
  const preferredModel = state.modelPreferences[agent.id] || "";
  const preferredDataClass = state.dataClassPreferences[agent.id] || "internal";
  const preferredRuntime = state.runtimePreferences[agent.id] || "hermes";
  let models = modelsForAgent(agent);
  if (isWorkspace) models = models.filter((model) => ["openai-codex", "deepseek"].includes(model.provider));
  const runtimes = state.runtimeAdapters.filter((runtime) => ["hermes", "codex", "opencode"].includes(runtime.id) && runtime.execution_enabled && runtime.actions?.some((action) => action.startsWith("workspace")));
  const workspaceOptions = state.workspaces.map((workspace) => `<option value="${esc(workspace.workspace_id)}">${esc(workspace.label)} · ${esc(titleCase(workspace.data_class))}${workspace.write_allowed ? " · read/write" : " · read-only"}</option>`).join("");
  const description = isWorkspace ? "A supervised agent can inspect or change only an owner-registered Git workspace. Every run requires exact approval; external actions remain locked." : isGoal ? "Goals can research public information and maintain a plan after exact approval. Workspace tools remain available only in the dedicated Workspace lane." : isAriRouter ? "Ari is the front door, not a model-only chat box. Simple questions stay conversational; research, links, files, builds and multi-step requests become a visible supervised route." : "Chat is model-only: shared memory, selected skills, voice and image understanding are available, but no workspace tools can run.";
  const ariContract = isAriRouter ? `<div class="ari-route-contract"><span><b>QUESTION</b> Direct answer</span><i>or</i><span><b>WORK</b> Research / workspace plan</span><i>then</i><span><b>YOU</b> Review & approve</span></div>` : "";
  const ariPreference = isAriRouter ? `<label>How Ari decides<select name="ariIntent"><option value="auto">Automatic · recommended</option><option value="conversation">Direct answer only</option><option value="work">Always route work</option></select></label>` : "";
  return `<form class="operational-compose workspace-card ${isAriRouter ? "ari-front-door" : ""}" data-run-form ${isAriRouter ? "data-ari-router" : ""} data-agent-id="${esc(agent.id)}" data-run-mode="${mode}"><div class="compose-title"><div><p class="eyebrow">${isWorkspace ? "Supervised workspace" : isGoal ? "Supervised goal" : isAriRouter ? "Ari intent router" : "Live AGIOS chat"}</p><h3>${isWorkspace ? `Work with ${esc(agent.name || titleCase(agent.id))}` : isGoal ? `Give ${esc(agent.name || titleCase(agent.id))} an outcome` : isAriRouter ? "Ask Ari anything. Route work safely." : `Message ${esc(agent.name || titleCase(agent.id))}`}</h3></div>${status(state.data.operational?.status || "unavailable")}</div><p>${description}</p>${ariContract}<textarea name="objective" required maxlength="8000" placeholder="${isWorkspace ? "Describe the exact work, files in scope, acceptance criteria, and verification required." : isGoal ? "Describe the result, acceptance criteria, limits, and what evidence should be returned." : isAriRouter ? "Ask a question, paste a link, or describe the result you want. Ari will choose the correct lane." : "Ask a question or continue the work. Relevant authorized memory is retrieved automatically."}"></textarea>${voiceControls()}<div class="operational-options ${isWorkspace || isAriRouter ? "four" : "three"}"><label>Data class / Vault Mode<select name="dataClass"><option value="internal" ${preferredDataClass === "internal" ? "selected" : ""}>Internal</option><option value="public" ${preferredDataClass === "public" ? "selected" : ""}>Public</option><option value="private_business" ${preferredDataClass === "private_business" ? "selected" : ""}>Vault · Private business</option><option value="customer_restricted" ${preferredDataClass === "customer_restricted" ? "selected" : ""}>Vault · Customer restricted</option></select></label>${ariPreference}${isWorkspace ? `<label>Runtime<select name="runtimeId" required>${runtimes.map((runtime) => `<option value="${esc(runtime.id)}" ${preferredRuntime === runtime.id ? "selected" : ""}>${esc(runtime.name)} · ${esc(titleCase(runtime.status))}</option>`).join("")}</select></label><label>Registered workspace<select name="workspaceId" required><option value="">Choose workspace</option>${workspaceOptions}</select></label><label>Access<select name="workspaceAccess"><option value="read">Read only</option>${agent.capabilities.includes("write_workspace") ? `<option value="write">Read and write</option>` : ""}</select></label>` : `<label>${isAriRouter ? "Direct-answer model" : "Model Once · this run"}<select name="modelId"><option value="" ${preferredModel ? "" : "selected"}>Worker default · ${esc(agent.model || "runtime")}</option>${models.map((model) => `<option value="${esc(model.id)}" ${preferredModel === model.id ? "selected" : ""}>${esc(model.id)} · ${esc(model.location)}</option>`).join("")}</select></label><label>Project memory scope<input name="projectId" maxlength="128" placeholder="Optional project ID"/></label>`}</div>${isWorkspace ? `<label class="workspace-model">Model Once · this run<select name="modelId"><option value="" ${preferredModel ? "" : "selected"}>Best approved worker default</option>${models.map((model) => `<option value="${esc(model.id)}" ${preferredModel === model.id ? "selected" : ""}>${esc(model.id)} · ${esc(model.provider)}</option>`).join("")}</select></label>` : ""}${skillPicker()}<div class="compose-submit"><span>${isWorkspace || isGoal ? "Approval binds agent, objective, data class, memory, skills, model, runtime, images and workspace boundary." : isAriRouter ? "Automatic routing is local and deterministic. Work never falls back to powerless chat." : "Model Once changes only this run. AGIOS still checks the route against data and agent policy."}</span><button type="submit">${isWorkspace ? "Review workspace run" : isGoal ? "Review goal" : isAriRouter ? "Ask Ari" : "Send through AGIOS"} ↗</button></div></form>`;
}

function workspaceRegistryCard() {
  const entries = state.workspaces.map((workspace) => `<div class="workspace-registry-row"><div><strong>${esc(workspace.label)}</strong><small>${esc(titleCase(workspace.data_class))} · ${workspace.write_allowed ? "read/write approved" : "read-only"}</small></div>${status("registered")}</div>`).join("");
  return `<section class="workspace-card workspace-registry"><div class="compose-title"><div><p class="eyebrow">Private workspace registry</p><h3>Owner-approved Git boundaries</h3></div><span>${state.workspaces.length} registered</span></div><p>Paths stay on the private server and are never returned to this browser after registration.</p><form data-workspace-form><label>Label<input name="label" required maxlength="100" placeholder="Studio website"/></label><label>Local Git folder<input name="rootPath" required maxlength="1000" placeholder="C:\\Projects\\studio-site"/></label><div class="operational-options"><label>Data class<select name="dataClass"><option value="internal">Internal</option><option value="private_business">Private business</option><option value="customer_restricted">Customer restricted</option><option value="public">Public</option></select></label><label class="check-label"><input type="checkbox" name="writeAllowed"/> Allow exact-approved edits</label></div><button type="submit">Register workspace</button></form><div class="workspace-registry-list">${entries || `<div class="workspace-empty"><strong>No workspace registered yet</strong><span>Register a clean Git worktree before dispatching repo work.</span></div>`}</div></section>`;
}

function operationalWorkspace(agent, mode) {
  const runs = state.runs.filter((run) => run.agent_id === agent.id && (mode === "sessions" || run.mode === mode));
  if (mode === "sessions") return `<div class="runtime-session-list">${runs.length ? runs.map((run) => runCard(run)).join("") : `<div class="workspace-empty workspace-card large"><b>◷</b><strong>No AGIOS sessions yet</strong><span>Chats and approved goals will appear here with their real status and response.</span></div>`}</div>`;
  return `${mode === "workspace" ? workspaceRegistryCard() : ""}<div class="operational-grid">${runComposer(agent, mode)}<section class="run-feed"><div class="run-feed-heading"><div><p class="eyebrow">${mode === "goal" ? "Goal watch" : mode === "workspace" ? "Workspace watch" : "Conversation"}</p><h3>${runs.length} real ${runs.length === 1 ? "run" : "runs"}</h3></div><span>${runs.some((run) => ["queued", "running"].includes(run.status)) ? "LIVE" : "LOCAL"}</span></div>${runs.length ? runs.map((run) => runCard(run, { transcript: mode === "chat" })).join("") : `<div class="workspace-empty workspace-card"><b>${mode === "chat" ? "□" : mode === "workspace" ? "▱" : "◎"}</b><strong>${mode === "chat" ? "Start the first conversation" : mode === "workspace" ? "No workspace work dispatched" : "No goals have been dispatched"}</strong><span>Only verified runtime activity is displayed.</span></div>`}</section></div>`;
}

function roiBadge(proposal) {
  const roi = proposal.roi_estimate;
  if (!roi || roi.status === "needs-evidence") return `<span class="roi-badge is-estimate">ROI · needs evidence runs</span>`;
  return `<span class="roi-badge is-estimate" title="${esc(roi.basis)}">ROI est. ${roi.minutes_saved_per_future_run} min saved per future run · ${roi.evidence_runs} evidence run${roi.evidence_runs === 1 ? "" : "s"}</span>`;
}

function skillDraftCard(proposal) {
  if (!["draft_ready", "validated", "installed"].includes(proposal.status)) return `<div class="growth-proposal"><div><strong>${esc(proposal.skill_name)}</strong><small>${esc(titleCase(proposal.change_kind))} · ${esc(titleCase(proposal.status))}</small></div>${roiBadge(proposal)}${status(proposal.status)}</div>`;
  const validation = proposal.validation;
  const checks = validation ? `<div class="skill-validation ${validation.passed ? "is-valid" : "is-invalid"}"><strong>${validation.passed ? "Validation passed" : "Needs revision"}</strong>${(validation.errors || []).map((item) => `<small>${esc(item)}</small>`).join("")}</div>` : "";
  return `<article class="skill-draft"><header><div><strong>${esc(proposal.skill_name)}</strong><small>${esc(titleCase(proposal.change_kind))} · ${esc(titleCase(proposal.status))}</small></div>${status(proposal.status)}</header>${proposal.status === "installed" ? `<p>Installed in the live AGIOS shared skill registry. Authorized agents can now load it.</p>` : `<form data-skill-draft-form data-proposal-id="${esc(proposal.proposal_id)}"><textarea name="body" required maxlength="20000">${esc(proposal.draft_body || "")}</textarea><div class="skill-draft-actions"><button type="submit">Save draft</button><button type="button" data-validate-skill="${esc(proposal.proposal_id)}">Validate</button>${validation?.passed ? `<button type="button" data-install-skill="${esc(proposal.proposal_id)}" data-draft-digest="${esc(proposal.draft_digest)}">Install shared skill</button>` : ""}</div></form>${checks}`}</article>`;
}

function agentModeContent(agent) {
  if (["chat", "goal", "workspace", "sessions"].includes(state.agentMode)) return operationalWorkspace(agent, state.agentMode);
  const departments = state.data.departments.filter((department) => department.agent_ids.includes(agent.id));
  if (state.agentMode === "skills") {
    const bundles = [...new Set(departments.flatMap((department) => department.skill_bundles))];
    return `<div class="workspace-split"><section class="workspace-card skill-inventory"><p class="eyebrow">Hermes inventory</p><strong class="inventory-number">${agent.skill_count ?? "—"}</strong><h3>skills available to this profile</h3><p>Count comes from the live Hermes profile. Skill bodies and private configuration stay runtime-side.</p><div class="skill-cloud">${agent.capabilities.map((item) => `<span>${esc(titleCase(item))}</span>`).join("")}</div></section><section class="workspace-card"><p class="eyebrow">Department bundles</p><h3>Operational playbooks</h3>${bundles.map((bundle) => `<div class="assignment-row"><span>◇</span><div><strong>${esc(titleCase(bundle))}</strong><small>Available through assigned department policy</small></div></div>`).join("")}</section></div>`;
  }
  if (state.agentMode === "growth") {
    const completed = state.runs.filter((run) => run.agent_id === agent.id && run.status === "completed");
    const proposals = state.skillProposals.filter((item) => item.agent_id === agent.id);
    const specialties = (agent.specialties || []).map((item) => `<span>${esc(item)}</span>`).join("");
    return `<div class="growth-grid"><section class="workspace-card career-card"><p class="eyebrow">Professional development</p><h3>${esc(agent.profession || titleCase(agent.role))}</h3><p>${esc(agent.experience || "Experience brief not set")}. Growth is earned from reviewed work; AGIOS never invents a score.</p><div class="career-stats"><span><small>VERIFIED COMPLETIONS</small><strong>${completed.length}</strong></span><span><small>LEARNING MODE</small><strong>${esc(titleCase(agent.growth_policy?.mode || "evidence led"))}</strong></span><span><small>SKILL PROPOSALS</small><strong>${proposals.length}</strong></span></div><div class="specialty-cloud">${specialties}</div>${proposals.map(skillDraftCard).join("")}</section><form class="workspace-card skill-proposal" data-skill-proposal-form data-agent-id="${esc(agent.id)}"><p class="eyebrow">Governed skill evolution</p><h3>Propose a professional skill change</h3><p>The agent may identify a recurring gap and draft an improvement. It cannot install or overwrite a shared skill without owner review and independent validation.</p><label>Skill name<input name="skillName" required maxlength="100" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="source-quality-audit"/></label><label>Change<select name="changeKind"><option value="create">Create new skill</option><option value="update">Update existing skill</option></select></label><label>Evidence and reason<textarea name="rationale" required maxlength="1200" placeholder="What repeated evidence shows this skill is needed, and how will it be tested?"></textarea></label><div class="compose-submit"><span>${completed.length ? `${completed.length} completed runs will be attached as evidence.` : "Without completed work, the proposal remains in Needs Evidence."}</span><button type="submit">Submit for owner review</button></div></form></div>`;
  }
  if (state.agentMode === "control") {
    return `<div class="control-grid"><section class="workspace-card control-primary"><p class="eyebrow">Runtime control</p><h3>${esc(titleCase(agent.id))} is ${esc(agent.state)}</h3><div class="control-readout"><span><small>RUNTIME</small><strong>${esc(titleCase(agent.runtime))}</strong></span><span><small>PROVIDER</small><strong>${esc(agent.provider || "Unavailable")}</strong></span><span><small>MODEL</small><strong>${esc(agent.model || "Unavailable")}</strong></span><span><small>WAKE POLICY</small><strong>Event or schedule</strong></span></div></section><section class="workspace-card"><p class="eyebrow">Operational controls</p><h3>Supervised multi-runtime lane</h3><div class="policy-row"><span>Chat, voice and vision</span><em>Live</em></div><div class="policy-row"><span>Exact-approved research goals</span><em>Live</em></div><div class="policy-row"><span>Scoped shared memory and skills</span><em>Live</em></div><div class="policy-row"><span>Registered Git workspace work</span><em>Exact approval</em></div><div class="policy-row"><span>Publishing, messages, purchases and deployment</span><em>Locked</em></div><div class="boundary-note">Every run is authenticated and journaled. Hermes and Codex receive only the approved workspace, access level, images, memory, skills and model route.</div></section></div>`;
  }
  return `<div class="workspace-split"><section class="workspace-card profile-brief"><p class="eyebrow">Professional identity</p><h3>${esc(agent.profession || titleCase(agent.role))}</h3><p>${esc(agent.biography || agent.description || `A persistent ${titleCase(agent.role)} registered inside the Hermes runtime.`)}</p><div class="identity-line"><span>${esc(agent.seniority || "Specialist")}</span><span>${esc(agent.experience || "Experience brief pending")}</span></div><div class="specialty-cloud">${(agent.specialties || []).map((item) => `<span>${esc(item)}</span>`).join("")}</div><div class="control-readout"><span><small>STATE</small><strong>${esc(titleCase(agent.state))}</strong></span><span><small>SKILLS</small><strong>${agent.skill_count ?? "—"}</strong></span><span><small>WORKLOADS</small><strong>${agent.workloads.length}</strong></span><span><small>DEPARTMENTS</small><strong>${departments.length}</strong></span></div></section><section class="workspace-card"><p class="eyebrow">Operating role</p><h3>Assigned workloads</h3>${agent.workloads.map((workload) => `<div class="assignment-row"><span>↗</span><div><strong>${esc(titleCase(workload))}</strong><small>Routed through AGIOS model and data policy</small></div></div>`).join("")}<div class="boundary-note">Ready means available to wake—not continuously consuming tokens. Skill growth is evidence-led and owner governed.</div></section></div>`;
}

function renderAgent() {
  const agent = state.data.agents.find((item) => item.id === state.selectedAgent) || state.data.agents[0];
  state.selectedAgent = agent.id;
  const modes = [["overview", "Overview"], ["chat", agent.id === "default" ? "Ask Ari + Voice" : "Chat + Voice"], ["goal", "Goal Mode"], ["workspace", "Workspace"], ["skills", "Skills"], ["growth", "Growth"], ["sessions", "Sessions"], ["control", "Control Room"]];
  const modelChips = modelsForAgent(agent).map((model) => `<span class="model-chip ${model.id === agent.model ? "is-selected" : ""}" title="${esc(model.cost_note || "cost not reported")}"><i class="status-dot status-${model.location === "local" ? "ready" : "planned"}"></i>${esc(model.id)}</span>`).join("");
  page.innerHTML = `<div class="agent-hero"><div><p class="eyebrow">AGENT · ${esc(agent.runtime.toUpperCase())} · ${esc(agent.id)}</p><h1>${esc(agent.name || titleCase(agent.id))}</h1><p>${esc(agent.profession || titleCase(agent.role))} · ${esc(agent.seniority || "Specialist")} · ${esc(agent.provider || "Provider unavailable")}</p></div><div class="agent-hero-status">${status(agent.state)}<small>${agent.gateway_running ? "Gateway online" : "Registered · standing by"}</small></div></div>
    <div class="mode-strip">${modes.map(([id, label]) => `<button class="${state.agentMode === id ? "is-active" : ""}" data-agent-mode="${id}"><span>${id === "goal" ? "◎" : id === "control" ? ">_" : id === "workspace" ? "▱" : id === "sessions" ? "◷" : id === "skills" ? "◇" : id === "chat" ? "□" : "◉"}</span>${label}</button>`).join("")}</div>
    <div class="model-strip" aria-label="Governed model routes">${modelChips}</div>
    <div class="agent-mode-content">${agentModeContent(agent)}</div>`;
  renderAgentNavigation();
}

function scheduleTable() {
  return state.data.schedules.map((job) => `<div class="data-row columns-integrations">
    <div><strong>${esc(job.name)}</strong><p class="mono">${esc(job.id)}</p></div><span>${status(job.state)}</span><span>${esc(job.schedule || "—")}</span><span>${esc(relativeTime(job.next_run_at))}</span>
  </div>`).join("") || `<div class="decision-empty"><strong>No schedule metadata available</strong><p>Hermes may be offline or no automations are registered.</p></div>`;
}

function osReadinessSurface(compact = false) {
  const memoryCount = state.data.operational?.shared_memory?.fact_count ?? 0;
  const parts = [
    ["HOME", "Command center", "ready", `${state.data.summary.active_businesses} businesses visible`],
    ["BRAIN", "Model routes", state.data.models.length ? "ready" : "attention", `${state.data.models.length} governed routes`],
    ["MEMORY", "Shared fabric", state.data.operational?.status === "ready" ? "ready" : "attention", `${memoryCount} durable facts`],
    ["SKILLS", "Professional recipes", state.data.summary.shared_skills ? "ready" : "attention", `${state.data.summary.shared_skills} discoverable skills`],
    ["CLOCK", "Schedules and events", state.data.schedules.length ? "ready" : "attention", `${state.data.schedules.length} registered wakes`],
    ["TEAM", "Specialist workforce", state.data.summary.available_agents ? "ready" : "attention", `${state.data.summary.available_agents}/${state.data.summary.agents} ready`],
  ];
  return `<section class="os-readiness ${compact ? "is-compact" : ""}"><header><div><p class="eyebrow">COMPOUND OS</p><h2>Home. Brain. Memory. Skills. Clock. Team.</h2></div><span>LIVE READINESS</span></header><div>${parts.map(([label, name, readiness, note], index) => `<article class="readiness-${readiness}"><b>${index + 1}</b><div><small>${label}</small><strong>${name}</strong><span>${note}</span></div><em>${readiness === "ready" ? "Ready" : "Needs setup"}</em></article>`).join("")}</div><footer>Use the fewest capable workers for the job. Add a specialist only when a distinct recurring responsibility justifies one.</footer></section>`;
}

function renderPaperclip() {
  const liveRuns = state.runs.filter((run) => ["queued", "running", "awaiting_approval"].includes(run.status));
  const readyAgents = state.data.agents.filter((agent) => ["ready", "online"].includes(agent.state));
  const departmentRows = state.data.departments.map((department) => {
    const members = state.data.agents.filter((agent) => department.agent_ids.includes(agent.id));
    return `<button class="paperclip-team" data-view="departments">
      <span class="paperclip-team-mark">${esc(department.name.slice(0, 2).toUpperCase())}</span>
      <span><strong>${esc(department.name)}</strong><small>${members.length} worker${members.length === 1 ? "" : "s"} · ${esc(department.status || "registered")}</small></span>
      <em>Open →</em>
    </button>`;
  }).join("");
  const workerRows = readyAgents.slice(0, 5).map((agent) => `<button class="paperclip-worker" data-agent="${esc(agent.id)}">
    <span class="agent-avatar">${esc(initials(agent.name || agent.id))}</span>
    <span><strong>${esc(agent.name || titleCase(agent.id))}</strong><small>${esc(agent.profession || titleCase(agent.role))}</small></span>
    ${status(agent.state)}
  </button>`).join("");
  const activity = liveRuns.length
    ? liveRuns.slice(0, 5).map((run) => `<button class="paperclip-dispatch" data-agent="${esc(run.agent_id)}"><span>↗</span><div><strong>${esc(run.objective)}</strong><small>${esc(titleCase(run.agent_id))} · ${esc(titleCase(run.mode))}</small></div>${status(run.status)}</button>`).join("")
    : `<div class="paperclip-empty"><span>✓</span><div><strong>No workers are consuming tokens</strong><small>Registered agents remain ready until a ticket, schedule or event wakes them.</small></div></div>`;
  page.innerHTML = `${heading("Orchestration desk", "Build the team. Hand off the outcome.", "AGIOS turns a business outcome into a governed ticket, assigns the right professional workers and follows the handoff into the live board.", `<button class="launch-goal compact" data-open-directive>New ticket ＋</button>`)}
    <div class="boundary-note orchestration-boundary"><strong>Paperclip runs as a supervised loopback surface (127.0.0.1:3100).</strong><span>AGIOS remains the approval source of truth: Paperclip never receives AGIOS credentials, and every dispatch keeps ownership, approval gates and evidence in AGIOS.</span></div>
    <section class="paperclip-command">
      <div class="paperclip-pulse"><p class="eyebrow">ORCHESTRATION STATUS</p><h2>${liveRuns.length ? `${liveRuns.length} handoff${liveRuns.length === 1 ? "" : "s"} in motion` : "The studio is ready"}</h2><p>Every dispatch keeps the selected business, data class, model route, memory scope and approval boundary attached.</p><div class="paperclip-statline"><span><strong>${readyAgents.length}</strong> workers ready</span><span><strong>${state.data.departments.length}</strong> departments</span><span><strong>${state.data.schedules.length}</strong> scheduled wakes</span><span><strong>${state.directiveDrafts.length}</strong> local drafts</span></div></div>
      <div class="paperclip-route"><span>OUTCOME</span><i>→</i><span>TEAM</span><i>→</i><span>APPROVAL</span><i>→</i><span>DELIVERY</span></div>
    </section>
    <div class="paperclip-grid">
      <section class="workspace-card paperclip-section"><div class="paperclip-section-head"><div><p class="eyebrow">TEAMS</p><h3>Department routing</h3></div><button data-view="departments">Manage</button></div><div class="paperclip-team-list">${departmentRows || `<p class="kanban-empty">No departments registered.</p>`}</div></section>
      <section class="workspace-card paperclip-section"><div class="paperclip-section-head"><div><p class="eyebrow">WORKERS</p><h3>Available specialists</h3></div><button data-view="agents">All agents</button></div><div class="paperclip-worker-list">${workerRows || `<p class="kanban-empty">No workers ready.</p>`}</div></section>
      <section class="workspace-card paperclip-section paperclip-activity"><div class="paperclip-section-head"><div><p class="eyebrow">LIVE HANDOFFS</p><h3>Current orchestration</h3></div><button data-view="work">Open board</button></div><div>${activity}</div></section>
    </div>`;
}

function runDuration(run) {
  const start = new Date(run.started_at || run.created_at).valueOf();
  const end = run.completed_at ? new Date(run.completed_at).valueOf() : Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "Unavailable";
  const seconds = Math.round((end - start) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

function workRunInspector(run) {
  if (!run) return "";
  const workspace = state.workspaces.find((item) => item.workspace_id === run.workspace_id);
  const active = ["queued", "running"].includes(run.status);
  const progressOutput = String(run.progress_output || "").trim();
  const finalOutput = String(run.response || "").trim();
  const showRuntimeOutput = active || (progressOutput && progressOutput !== finalOutput);
  const runtimeOutput = showRuntimeOutput
    ? `<article class="work-message runtime-message" aria-live="polite"><header><span>Live runtime output</span><time>${run.progress_updated_at ? new Date(run.progress_updated_at).toLocaleString() : "Waiting"}</time></header>${progressOutput ? `<pre>${esc(progressOutput)}</pre>` : `<div class="work-run-waiting"><i></i><span>${run.status === "queued" ? "Waiting for the supervised worker" : "Runtime started · waiting for the first stdout line"}</span></div>`}</article>`
    : "";
  const trace = state.runTraces[run.run_id];
  const traceEvents = trace?.events || [];
  const traceMarkup = trace === undefined
    ? `<section class="work-run-trace"><div class="work-run-section-heading"><span>Verified activity</span><small>Loading safe Hermes events</small></div><p>Checking the runtime session for persisted tool and progress events.</p></section>`
    : !trace.available
      ? `<section class="work-run-trace"><div class="work-run-section-heading"><span>Verified activity</span><small>Not available</small></div><p>${esc(trace.reason || "This runtime did not expose a safe event trace.")}</p></section>`
      : `<section class="work-run-trace"><div class="work-run-section-heading"><span>Verified activity</span><small>${traceEvents.length} persisted event${traceEvents.length === 1 ? "" : "s"} · ${trace.binding === "run_source" ? "run-bound" : "legacy session-bound"}</small></div><ol>${traceEvents.map((event) => event.kind === "tool"
        ? `<li class="trace-tool"><header><strong>${esc(titleCase(event.tool || "tool"))}</strong><span>${esc(titleCase(event.effect || "recorded"))}</span></header>${event.input ? `<div><small>INPUT</small><pre>${esc(event.input)}</pre></div>` : ""}${event.output ? `<div><small>OUTPUT</small><pre>${esc(event.output)}</pre></div>` : ""}</li>`
        : `<li class="trace-commentary"><header><strong>Runtime update</strong></header><p>${esc(event.text || "")}</p></li>`).join("") || `<li class="trace-empty">No tool or commentary events were persisted for this session.</li>`}</ol></section>`;
  const result = run.response
    ? `<pre>${esc(run.response)}</pre>`
    : run.status === "failed"
      ? runError(run)
      : active
        ? `<div class="work-run-waiting"><i></i><span>${run.status === "queued" ? "Waiting for the supervised worker" : "Worker is running · this record refreshes automatically"}</span></div>`
        : `<p class="work-run-empty-result">No final response was produced for this run.</p>`;
  const steps = [
    ["Prepared", run.created_at, "Exact context recorded"],
    ["Worker started", run.started_at, run.started_at ? `${titleCase(run.runtime_id || "hermes")} accepted the run` : "Waiting for approval or dispatch"],
    [run.status === "completed" ? "Completed" : titleCase(run.status), run.completed_at, run.completed_at ? "Final state persisted" : "Not finished"],
  ];
  const timeline = steps.map(([label, time, note], index) => `<li class="${time ? "is-recorded" : "is-pending"}"><i>${index + 1}</i><div><strong>${esc(label)}</strong><span>${esc(note)}</span></div><time>${time ? new Date(time).toLocaleString() : "—"}</time></li>`).join("");
  const provenance = [
    ["Agent", titleCase(run.agent_id)],
    ["Runtime", titleCase(run.runtime_id || "hermes")],
    ["Provider", titleCase(run.provider || "profile route")],
    ["Model", run.model || "Profile default"],
    ["Workspace", run.workspace_id ? `${workspace?.label || "Registered workspace"} · ${titleCase(run.workspace_access)} access` : "No workspace access"],
    ["Data class", titleCase(run.data_class)],
    ["Duration", run.started_at ? runDuration(run) : "Not started"],
    ["Output capture", progressOutput ? "Bounded runtime stdout" : "Final result only"],
    ["Session", run.hermes_session_id || "No runtime session ID"],
  ].map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("");
  return `<section class="work-run-inspector" id="work-run-inspector" tabindex="-1" aria-label="Selected run details">
    <header><div><p class="eyebrow">RUN RECORD · ${esc(run.run_id.slice(0, 8))}</p><h2>${esc(run.objective)}</h2></div><div class="work-run-header-actions">${status(run.status)}<button type="button" data-work-run-close aria-label="Close run details">Close</button></div></header>
    <div class="work-run-layout">
      <div class="work-run-main">
        <section class="work-run-timeline"><div class="work-run-section-heading"><span>Run timeline</span><small>Persisted lifecycle</small></div><ol>${timeline}</ol></section>
        <section class="work-run-transcript" aria-label="Run conversation">
          <article class="work-message owner-message"><header><span>Owner request</span><time>${new Date(run.created_at).toLocaleString()}</time></header><p>${esc(run.objective)}</p></article>
          ${runtimeOutput}
          ${traceMarkup}
          <article class="work-message agent-message"><header><span>Final result · ${esc(titleCase(run.agent_id))}</span>${run.response ? `<button type="button" data-speak-run="${esc(run.run_id)}">Listen</button>` : ""}</header>${result}</article>
        </section>
      </div>
      <aside class="work-run-provenance"><div class="work-run-section-heading"><span>Execution provenance</span><small>Exact approved route</small></div>${provenance}${evidenceChips(run)}<p class="work-run-capture-note">${progressOutput ? "Runtime stdout was captured during execution, bounded locally, and stored separately from the final result. Stderr is never streamed." : "Detailed runtime stream was not captured for this run. This record shows the complete final output and the lifecycle AGIOS actually persisted—no invented steps."}</p></aside>
    </div>
  </section>`;
}

async function loadWorkRunTrace(runId) {
  if (!runId) return;
  try {
    const payload = await api(`/api/v1/hermes/runs/${encodeURIComponent(runId)}/events`);
    state.runTraces[runId] = payload.trace || { available: false, events: [], reason: "No safe runtime trace was returned." };
  } catch (error) {
    state.runTraces[runId] = { available: false, events: [], reason: error.message || "The safe runtime trace is unavailable." };
  }
  if (state.view === "work" && state.selectedWorkRunId === runId) renderWork();
}

function renderWork() {
  const boardDrafts = state.directiveDrafts;
  const approvalRuns = state.runs.filter((run) => run.status === "awaiting_approval");
  const activeRuns = state.runs.filter((run) => ["queued", "running"].includes(run.status));
  const reviewRuns = state.runs.filter((run) => ["completed", "failed", "interrupted", "canceled"].includes(run.status));
  if (!state.workRunAutoOpened && state.runs.length) {
    state.selectedWorkRunId = (activeRuns[0] || reviewRuns[0] || approvalRuns[0] || state.runs[0]).run_id;
    state.workRunAutoOpened = true;
  }
  const selectedRun = state.runs.find((run) => run.run_id === state.selectedWorkRunId) || null;
  const runTask = (run) => `<article class="kanban-task ${selectedRun?.run_id === run.run_id ? "is-selected" : ""}"><header><span>${esc(titleCase(run.mode))}</span>${status(run.status)}</header><h3>${esc(run.objective)}</h3><div class="kanban-task-meta"><span>${esc(titleCase(run.agent_id))}</span><time>${new Date(run.created_at).toLocaleString()}</time></div><button class="kanban-task-open" type="button" data-work-run="${esc(run.run_id)}">${run.response ? "Open result" : "Open run"} →</button></article>`;
  const draftTask = (draft) => `<article class="kanban-task is-draft"><header><span>LOCAL DRAFT</span>${status("planned")}</header><h3>${esc(draft.outcome)}</h3><footer><span>${esc(titleCase(draft.business))}</span><time>${new Date(draft.createdAt).toLocaleString()}</time></footer></article>`;
  const lane = (id, title, items, empty) => `<section class="kanban-lane lane-${id}"><header><div><span></span><h2>${esc(title)}</h2></div><strong>${items.length}</strong></header><div>${items.join("") || `<p class="kanban-empty">${esc(empty)}</p>`}</div></section>`;
  const summaryMarkup = `<div class="kanban-summary"><span><strong>${boardDrafts.length}</strong> inbox</span><span><strong>${approvalRuns.length}</strong> awaiting approval</span><span><strong>${activeRuns.length}</strong> active</span><span><strong>${reviewRuns.length}</strong> review & done</span></div>`;
  const boardMarkup = `<div class="agent-kanban">${lane("inbox", "Inbox", boardDrafts.map(draftTask), "Create a governed ticket.")}${lane("approval", "Approval", approvalRuns.map(runTask), "No decisions waiting.")}${lane("active", "Building", activeRuns.map(runTask), "No workers running.")}${lane("review", "Review & done", reviewRuns.map(runTask), "No completed work yet.")}</div>`;
  const introMarkup = heading("Agent Kanban", "File a ticket. Watch the workers move it forward.", "Every card is a real AGIOS draft or runtime session. Open a run to inspect its request, final output, approved route and persisted evidence.", `<button class="launch-goal compact" data-open-directive>New ticket ＋</button>`);
  page.innerHTML = selectedRun
    ? `${workRunInspector(selectedRun)}${summaryMarkup}${boardMarkup}`
    : `${introMarkup}${summaryMarkup}${boardMarkup}`;
  return;
  const drafts = state.directiveDrafts.map((draft) => `<article class="entity-card"><div class="entity-top"><span class="entity-index">LOCAL DRAFT</span>${status("planned")}</div><h2>${esc(draft.outcome)}</h2><p>${esc(titleCase(draft.business))} · ${esc(draft.dataClass)}</p><footer class="entity-footer"><span>Not dispatched</span><span>${new Date(draft.createdAt).toLocaleString()}</span></footer></article>`).join("");
  const runs = state.runs.filter((run) => run.mode === "goal");
  page.innerHTML = `${heading("Goals & work", "Direct outcomes, not disconnected prompts.", "Approved goals now run through Hermes for supervised research and planning. Every start, approval and result is journaled without storing raw customer content in the audit log.")}${runs.length ? `<div class="runtime-session-list">${runs.map((run) => runCard(run)).join("")}</div>` : `<div class="view-grid">${drafts || `<article class="entity-card"><div class="entity-top"><span class="entity-index">PHASE 2</span>${status("ready")}</div><h2>No operational goals yet</h2><p>Open an agent, choose Goal Mode, describe the exact outcome and approve the bound run.</p><footer class="entity-footer"><span>Supervised execution</span><span>Workspace and external actions locked</span></footer></article>`}</div>`}`;
}

function renderArtifacts() {
  const resultRuns = state.runs.filter((run) => run.response || ["completed", "failed", "interrupted"].includes(run.status));
  const completed = resultRuns.filter((run) => run.status === "completed");
  const evidenceCards = resultRuns.map((run) => `<article class="artifact-card"><header><span>${esc(titleCase(run.mode))} · ${esc(titleCase(run.agent_id))}</span>${status(run.status)}</header><h3>${esc(run.objective)}</h3>${run.response ? `<p>${esc(run.response.slice(0, 360))}${run.response.length > 360 ? "…" : ""}</p>` : `<p>No response artifact was produced. Open Sessions to inspect the verified stop reason.</p>`}<footer><span>${run.skill_ids.length} skills · ${run.memory_ids.length} memories</span><time>${new Date(run.created_at).toLocaleString()}</time></footer></article>`).join("");
  const imageCards = state.visionAssets.map((asset) => `<article class="artifact-card image-artifact"><header><span>PRIVATE IMAGE INPUT</span>${status(asset.status)}</header><h3>${esc(asset.label || "Image")}</h3><p>${esc(titleCase(asset.mime_type))} · ${Math.max(1, Math.round(Number(asset.byte_count || 0) / 1024))} KB · ${esc(titleCase(asset.data_class))}</p><footer><span>${esc(titleCase(asset.retention))} retention</span><time>${new Date(asset.created_at).toLocaleString()}</time></footer></article>`).join("");
  page.innerHTML = `${heading("Artifact Library", "Every result has a place, a source, and a status.", "Browse real AGIOS run outputs and private vision metadata without exposing workspace paths, credentials, or raw customer files.")}<div class="artifact-summary"><span><small>VERIFIED RESULTS</small><strong>${completed.length}</strong></span><span><small>REVIEWABLE RUNS</small><strong>${resultRuns.length}</strong></span><span><small>PRIVATE IMAGE INPUTS</small><strong>${state.visionAssets.length}</strong></span><span><small>ACTIVE WORK</small><strong>${state.runs.filter((run) => ["queued", "running"].includes(run.status)).length}</strong></span></div><section class="artifact-section"><header><div><p class="eyebrow">RUN OUTPUTS</p><h2>Evidence returned by the workforce</h2></div><button data-system="hermes">Open Hermes Sessions →</button></header><div class="artifact-grid">${evidenceCards || `<div class="workspace-empty workspace-card large"><b>▣</b><strong>No result artifacts yet</strong><span>Completed and stopped runs will appear here from the private AGIOS session store.</span></div>`}</div></section><section class="artifact-section"><header><div><p class="eyebrow">PRIVATE INPUTS</p><h2>Vision assets under retention policy</h2></div><span>METADATA ONLY</span></header><div class="artifact-grid">${imageCards || `<div class="workspace-empty workspace-card"><b>◉</b><strong>No retained image inputs</strong><span>Images are listed only when their real private metadata exists.</span></div>`}</div></section>`;
}

function routePlanCard(plan) {
  const department = state.data.departments.find((item) => item.id === plan.department_id);
  const lead = state.data.agents.find((item) => item.id === plan.lead_agent_id);
  const model = state.data.models.find((item) => item.id === plan.model_id);
  const workspaceRoute = plan.execution_mode === "workspace";
  const dataRanks = { public: 0, internal: 1, private_business: 2, customer_restricted: 3 };
  const eligibleWorkspaces = state.workspaces.filter((workspace) => {
    const classAllowed = (dataRanks[workspace.data_class] ?? 99) <= (dataRanks[plan.data_class] ?? -1);
    const accessAllowed = plan.workspace_access !== "write" || workspace.write_allowed;
    return classAllowed && accessAllowed;
  });
  const workspaceOptions = eligibleWorkspaces.map((workspace) => `<option value="${esc(workspace.workspace_id)}">${esc(workspace.label)} · ${esc(titleCase(workspace.data_class))}</option>`).join("");
  const capabilities = plan.required_capabilities || [];
  const runtimes = state.runtimeAdapters.filter((runtime) => {
    if (!["hermes", "codex", "opencode"].includes(runtime.id) || !runtime.execution_enabled) return false;
    if (!runtime.actions?.some((action) => action.startsWith("workspace"))) return false;
    if (capabilities.includes("research_web") && runtime.id !== "hermes") return false;
    if (capabilities.includes("vision") && runtime.id === "opencode") return false;
    return true;
  });
  const runtimeOptions = runtimes.map((runtime) => `<option value="${esc(runtime.id)}">${esc(runtime.name)} · ${esc(titleCase(runtime.status))}</option>`).join("");
  return `<article class="route-plan-card"><header><div><small>ARI ROUTE · ${esc(new Date(plan.created_at).toLocaleString())}</small><h3>${esc(plan.objective)}</h3></div>${status(plan.status)}</header>
    <div class="route-plan-path"><span><small>DEPARTMENT</small><strong>${esc(department?.name || titleCase(plan.department_id))}</strong></span><b>→</b><span><small>LEAD</small><strong>${esc(lead?.name || titleCase(plan.lead_agent_id))}</strong></span><b>→</b><span><small>MODEL</small><strong>${esc(plan.model_id)}</strong></span></div>
    <div class="route-plan-evidence"><span>${esc(titleCase(plan.data_class))} data</span><span>${esc(titleCase(plan.execution_mode))} lane</span><span>${esc(titleCase(plan.workspace_access))} workspace</span>${capabilities.map((item) => `<span>${esc(titleCase(item))}</span>`).join("")}</div>
    <p class="route-cost-note"><strong>Cost:</strong> ${esc(model?.cost_note || "vendor cost not reported")}</p>
    <form class="route-plan-action" data-dispatch-form data-plan-id="${esc(plan.plan_id)}" data-plan-digest="${esc(plan.plan_digest)}">
      ${workspaceRoute ? `<label>Workspace<select name="workspaceId" required><option value="">Choose registered workspace</option>${workspaceOptions}</select></label><label>Runtime<select name="runtimeId" required>${runtimeOptions}</select></label>` : ""}
      <button type="submit" ${workspaceRoute && (!eligibleWorkspaces.length || !runtimes.length) ? "disabled" : ""}>Prepare exact run approval →</button>
      ${workspaceRoute && !eligibleWorkspaces.length ? `<small>No compatible workspace is registered. <button class="route-plan-workspace-link" type="button" data-view-link="repositories">Manage workspaces →</button></small>` : ""}
    </form></article>`;
}

function renderApprovals() {
  const plans = state.orchestrationPlans.filter((plan) => plan.status === "planned");
  const pending = state.runs.filter((run) => run.status === "awaiting_approval");
  const proposals = state.skillProposals.filter((item) => item.status === "awaiting_owner_review");
  const proposalCards = proposals.map((item) => `<article class="skill-approval-card"><header><div><small>${esc(item.agent_id)} · ${esc(titleCase(item.change_kind))}</small><h3>${esc(item.skill_name)}</h3></div>${status(item.status)}</header><p>${esc(item.rationale)}</p><footer><span>${item.evidence_run_ids.length} verified run${item.evidence_run_ids.length === 1 ? "" : "s"}</span><button data-approve-skill="${esc(item.proposal_id)}">Approve authoring</button></footer></article>`).join("");
  page.innerHTML = `${heading("Approval center", "Your judgment is a system boundary.", "First review Ari's route. Preparing it creates a digest-bound runtime decision; only your second exact approval starts model work.")}${plans.length || pending.length || proposals.length ? `<div class="approval-sections">${plans.length ? `<section><p class="eyebrow">ROUTES TO REVIEW</p><div class="route-plan-list">${plans.map(routePlanCard).join("")}</div></section>` : ""}${pending.length ? `<section><p class="eyebrow">EXACT RUN APPROVALS</p><div class="runtime-session-list">${pending.map((run) => runCard(run)).join("")}</div></section>` : ""}${proposals.length ? `<section><p class="eyebrow">PROFESSIONAL GROWTH</p><div class="skill-approval-grid">${proposalCards}</div></section>` : ""}</div>` : `<div class="empty-state large"><b>✓</b><strong>Nothing needs approval</strong><span>Planned routes, consequential runs and shared skill changes stop here.</span></div>`}`;
}

function renderAutomations() {
  page.innerHTML = `${heading("Automations", "Work wakes when it is needed.", "Schedules and events activate specialized agents, collect evidence and return them to ready state. This is persistent operation without continuous token use.")}
    <section class="automation-contract"><article><small>NOTIFY</small><strong>Change only</strong><p>Prefer a meaningful delta over a repeated “nothing changed” message.</p></article><article><small>FAILURES</small><strong>Visible and reviewable</strong><p>Failed jobs belong in Sessions and Artifacts; they never count as completed work.</p></article><article><small>AUTHORITY</small><strong>Never inherited</strong><p>A schedule can wake a worker, but publishing, messaging, deployment, and spending stay approval-gated.</p></article></section>
    <div class="data-panel"><div class="data-head columns-integrations"><span>Automation</span><span>State</span><span>Cadence</span><span>Next wake</span></div>${scheduleTable()}</div>`;
}

function notebookLMBridge() {
  const connector = state.notebooklm;
  if (!connector) {
    return `<section class="notebooklm-bridge is-loading" id="notebooklm-bridge"><p class="eyebrow">PERSONAL NOTEBOOKLM</p><h2>Loading approved vault sources…</h2><p>No account token or note content is exposed to the browser while AGIOS reads the local catalog.</p></section>`;
  }
  const sources = connector.sources || [];
  const selectable = sources.filter((source) => !source.blocked);
  const sourceRows = sources.map((source) => `<label class="notebooklm-source ${source.blocked ? "is-blocked" : ""}"><input type="checkbox" name="sourcePath" value="${esc(source.path)}" ${source.blocked ? "disabled" : ""}/><span><strong>${esc(source.title)}</strong><small>${esc(source.path)} · ${Math.max(1, Math.round(source.bytes / 1024))} KB</small></span><em>${source.blocked ? "Blocked: credential-like content" : "Local Markdown"}</em></label>`).join("");
  const prepared = state.notebooklmPack
    ? `<div class="notebooklm-prepared"><small>LOCAL PACK READY · NOT UPLOADED</small><strong>${esc(state.notebooklmPack.title)}</strong><p>${state.notebooklmPack.sources.length} selected source${state.notebooklmPack.sources.length === 1 ? "" : "s"}; manifest and SHA-256 provenance included.</p><div><a class="primary-action" href="${esc(state.notebooklmPack.download_url)}" download>Download source pack</a><button type="button" data-notebooklm-open>Open NotebookLM →</button></div></div>`
    : `<div class="notebooklm-empty"><strong>No source pack prepared</strong><p>Preparing a pack is local. AGIOS never signs in to Google, reads browser cookies, or uploads automatically.</p></div>`;
  return `<section class="notebooklm-bridge" id="notebooklm-bridge"><header><div><p class="eyebrow">PERSONAL NOTEBOOKLM · OWNER-MEDIATED</p><h2>Turn approved Obsidian notes into a cited notebook source pack.</h2><p>The video’s useful pattern is the five-file context pack. AGIOS implements the real boundary: select local notes, inspect them, prepare a verifiable ZIP, then you decide what to upload.</p></div>${status("ready")}</header><div class="notebooklm-boundary"><span><small>ACCOUNT</small><strong>Owner browser only</strong></span><span><small>TRANSFER</small><strong>No automatic upload</strong></span><span><small>PROVENANCE</small><strong>Path + SHA-256 manifest</strong></span><span><small>AUTHORITY</small><strong>Owner uploads manually</strong></span></div><div class="notebooklm-grid"><form data-notebooklm-form><label>PACK TITLE<input name="title" required maxlength="160" value="AGIOS core context"/></label><fieldset><legend>APPROVED OBSIDIAN SOURCES · ${selectable.length} AVAILABLE</legend><div class="notebooklm-sources">${sourceRows || `<p>No Markdown notes were found in the approved vault.</p>`}</div></fieldset><label class="notebooklm-ack"><input type="checkbox" name="externalUploadAcknowledged" required/><span>I understand selected notes leave this PC only after I upload them to Google NotebookLM.</span></label><button class="primary-action" type="submit" ${selectable.length ? "" : "disabled"}>Prepare local source pack</button></form><aside><ol>${(connector.workflow || []).map((step) => `<li>${esc(step)}</li>`).join("")}</ol>${prepared}</aside></div></section>`;
}

function imageStudioSection() {
  const studio = state.imageStudio;
  if (!studio) {
    return `<section class="image-studio is-loading" id="image-studio"><p class="eyebrow">IMAGE STUDIO</p><h2>Loading generator status…</h2><p>Provider state is read locally; no key values are exposed.</p></section>`;
  }
  const keyConfigured = studio.key_state === "configured";
  const providerTrouble = studio.provider_last_status === "exhausted"
    ? `OpenRouter reports this key as <strong>credits exhausted (HTTP ${studio.provider_last_error_code ?? 402})</strong> — top up at openrouter.ai/settings/credits to generate.`
    : studio.provider_last_status && studio.provider_last_status !== "available"
      ? `OpenRouter reports this key as <strong>${esc(String(studio.provider_last_status))}</strong>.`
      : "";
  const aspectOptions = (studio.aspect_ratios || ["16:9"]).map((ratio) => `<option value="${esc(ratio)}">${esc(ratio)}</option>`).join("");
  const recent = studio.recent || [];
  const gallery = recent.length
    ? `<div class="image-studio-gallery">${recent.map((item) => `<figure><img src="${esc(item.image_url)}" alt="Generated ${esc(item.aspect_ratio || "")}" loading="lazy"/><figcaption><strong>${esc(item.aspect_ratio || "")}</strong><small>${esc(item.prompt || "")}</small><time>${item.created_at ? new Date(item.created_at * 1000).toLocaleString() : ""}</time></figcaption></figure>`).join("")}</div>`
    : `<div class="notebooklm-empty"><strong>No images generated yet</strong><p>Generated images stay on this machine with SHA-256 provenance.</p></div>`;
  return `<section class="image-studio" id="image-studio"><header><div><p class="eyebrow">IMAGE STUDIO · MICROSOFT MAI-IMAGE-2.5</p><h2>Generate governed design images through OpenRouter.</h2><p>You type the prompt, so every external call is your explicit action. Outputs are saved locally with provenance; costs are vendor-reported and never guessed.</p></div>${status(keyConfigured ? "ready" : "blocked")}</header>
    <div class="image-studio-boundary"><span><small>MODEL</small><strong>${esc(studio.model || "microsoft/mai-image-2.5")}</strong></span><span><small>ACCOUNT</small><strong>${keyConfigured ? "OpenRouter key loaded locally" : "Key not configured"}</strong></span><span><small>PRICING</small><strong>${esc(studio.vendor_listed_price || "$5.00/M image tokens listed")}</strong></span><span><small>PRIVACY</small><strong>Local artifacts only</strong></span></div>
    ${providerTrouble ? `<div class="boundary-note"><strong>Provider note.</strong><span>${providerTrouble}</span></div>` : ""}
    <form class="image-studio-form" data-image-studio-form>
      <label>Prompt<textarea name="prompt" maxlength="4000" required placeholder="Describe the image you want. This exact text is sent to OpenRouter when you click Generate."></textarea></label>
      <div class="image-studio-controls"><label>Aspect ratio<select name="aspectRatio">${aspectOptions}</select></label><div class="compose-submit"><span>${esc(studio.cost_note || "")}</span><button type="submit" ${keyConfigured ? "" : "disabled"}>Generate image</button></div></div>
      <p class="image-studio-error" data-image-studio-error hidden></p>
    </form>
    <div class="image-studio-recent"><p class="eyebrow">RECENT GENERATIONS</p>${gallery}</div>
  </section>`;
}

function renderIntegrations() {
  const rows = state.data.integrations.map((integration) => `<div class="data-row columns-integrations"><div><strong>${esc(integration.name)}</strong><p>${esc(integration.id)}</p></div><span>${esc(titleCase(integration.kind))}</span><span>${status(integration.status === "connected" ? "registered" : integration.status)}</span><span>${integration.status === "connected" ? "Cataloged · direct AGIOS action locked" : "Adapter required"}</span></div>`).join("");
  const seen = new Set();
  const routes = [...state.data.integrations, ...state.data.apps].filter((item) => {
    const key = String(item.id || item.name).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const routeCards = routes.map((route) => {
    const routeStatus = route.status || "planned";
    const runtime = runtimeForSystem(route.id);
    const executable = runtime.execution_enabled === true;
    return `<article class="route-card"><header><span>${esc(titleCase(route.kind || "tool"))}</span>${status(executable ? runtime.status : routeStatus === "connected" ? "registered" : routeStatus)}</header><h3>${esc(route.name)}</h3><div class="route-contract"><span><small>PREFERRED ROUTE</small><strong>${executable ? esc(titleCase(runtime.adapter)) : "Registry only"}</strong></span><span><small>FALLBACK</small><strong>No implicit downgrade</strong></span><span><small>PERMISSION</small><strong>${executable ? "Policy checked per request" : "Direct execution locked"}</strong></span><span><small>HEALTH</small><strong>${executable ? esc(titleCase(runtime.status)) : "Not runtime-verified"}</strong></span></div></article>`;
  }).join("");
  const retrieval = state.data.operational?.retrieval || {};
  const a2a = state.data.operational?.a2a || {};
  const opencodeRuntime = runtimeForSystem("opencode");
  const connectionDecisions = [
    ["OpenCode", opencodeRuntime.execution_enabled ? "ready" : "blocked", opencodeRuntime.execution_enabled ? "Executable + local auth state detected" : "Local auth state not detected", opencodeRuntime.execution_enabled ? "Supervised workspace adapter; deny-by-default tools, no auto mode." : "Install and authenticate the audited CLI."],
    ["Gemini / NotebookLM", state.notebooklm ? "ready" : "approval", state.notebooklm ? "Local source-pack bridge ready" : "Owner source approval required", state.notebooklm ? "AGIOS does not inspect account auth; local preparation only, with no cookies, unofficial API, or automatic Google upload." : "Load the approved vault catalog before preparing a source pack."],
    ["Cline", "ready", "Installed · supervised terminal surface", "Cline CLI opens in an AGIOS terminal tab. Runtime dispatch stays locked until a deny-by-default workspace adapter is added."],
    ["Pokee", "ready", "Key wired · pokee-isaac registered", "Verified with your live key: the pokee-isaac model answered a real request. Registered as a governed model route candidate; the cost panel verifies the key without figures."],
    ["Sakana AI", "hold", "Paid-only API · no free tier", "Fugu is pay-as-you-go ($5/M in · $30/M out) plus $20–$200 plans at console.sakana.ai. Connect it when you want to fund an account; AGIOS will not fake a free state."],
    ["DeepSeek Harness", "ready", "MIT free · developer preview v0.1.0-rc.6", "Everything-is-a-plugin harness: one command boots a local web UI on 127.0.0.1:3457. Configure its model inside the Harness itself; AGIOS supplies no credentials. Breaking changes expected in the preview."],
    ["OpenClaw", "ready", "Installed · gateway onboarding pending", "OpenClaw CLI is installed and callable from AGIOS; channel and gateway onboarding remain your step. Direct dispatch stays locked."],
    ["Antigravity", "ready", "CLI installed · agy 1.1.13", "The agy CLI is installed and launchable from AGIOS. The full Antigravity IDE is a separate Google installer at antigravity.google/download."],
    ["DeepSeek API", "ready", "Key wired · balance live in Cost & performance", "Verified with your platform.deepseek.com key; the vendor balance is shown in the cost panel and never stored or logged."],
    ["Gemini API", "ready", "Free-tier key wired", "Verified with your AI Studio key; Gemini 3.7 Flash free tier is registered as a governed model runtime candidate."],
    ["Paperclip", "ready", "Local loopback dashboard · 127.0.0.1:3100", "Installed with the official installer in private loopback mode. AGIOS attaches it as a supervised surface; approvals, task state and credentials stay in AGIOS."],
    ["Freebuff", "ready", "Web surface + CLI installed", "Opens freebuff.com/web in your browser and the freebuff CLI (0.0.149) in an AGIOS terminal. AGIOS sends nothing; free models and regional limits are Freebuff's."],
    ["Buzz", "hold", "Developer preview + broad local tooling", "Its repository-writing MCP and shell runner are not approved for this workstation or client data."],
  ];
  const decisionRows = connectionDecisions.map(([name, stateName, gate, reason]) => `<div class="connection-decision"><div><strong>${esc(name)}</strong><small>${esc(gate)}</small></div>${status(stateName)}<p>${esc(reason)}</p></div>`).join("");
  // Every runtime- or registry-derived value interpolated below is escaped before assignment.
  page.innerHTML = `${heading("Apps & models", "Callable means executable, auth state detected and bounded.", "AGIOS exposes only executable adapters with explicit policy boundaries. Registry entries remain visibly blocked until their role, local authentication state and least-privilege boundary are proven.")}
    <nav class="integrations-quick-nav" aria-label="Systems sections"><a href="#notebooklm-bridge">Personal NotebookLM</a><a href="#image-studio">Image Studio</a><a href="#connection-decisions">Connection decisions</a><a href="#tool-router">Capability router</a></nav>
    <div class="protocol-strip"><article><small>KNOWLEDGE</small><strong>${esc(retrieval.mode || "Unavailable")}</strong><span>Citation-ready scoped retrieval</span></article><article><small>AGENT INTEROP</small><strong>${esc(a2a.protocol || "A2A")} ${esc(a2a.protocol_version || "")}</strong><span>Authenticated local ${esc(a2a.binding || "gateway")}</span></article><article><small>OUTBOUND PEERS</small><strong>${esc(titleCase(a2a.outbound_peers || "locked"))}</strong><span>Explicit trust and credentials required</span></article></div>
    ${notebookLMBridge()}
    ${imageStudioSection()}
    <section class="connection-decisions" id="connection-decisions"><header><div><p class="eyebrow">CONNECTION DECISIONS</p><h2>One governed runtime; explicit integration gates.</h2></div><span>No decorative “connected” states</span></header>${decisionRows}</section>
    <section class="tool-router" id="tool-router"><header><div><p class="eyebrow">CAPABILITY ROUTER</p><h2>Preferred route, health, fallback, and permission.</h2></div><span>${routes.length} REGISTERED ROUTES</span></header><div class="route-card-grid">${routeCards}</div></section>
    <div class="data-panel"><div class="data-head columns-integrations"><span>Integration</span><span>Kind</span><span>Registry</span><span>Execution boundary</span></div>${rows}</div>`;
}

function a2aTaskCard(task) {
  const taskState = (task.status?.state || "TASK_STATE_UNKNOWN").replace("TASK_STATE_", "").toLowerCase().replaceAll("_", "-");
  const canCancel = task.status?.state === "TASK_STATE_AUTH_REQUIRED";
  return `<article class="a2a-task"><header><div><span>${esc(task.metadata?.skillId || "A2A task")}</span><strong>${esc(titleCase(task.metadata?.agentId || "default"))}</strong></div>${status(taskState)}</header><div class="a2a-task-body"><code>${esc(task.id)}</code><p>${task.metadata?.localRunId ? `Linked supervised run ${esc(task.metadata.localRunId)}` : "Local citation task completed without model execution."}</p></div><footer><span>${esc(titleCase(task.metadata?.dataClass || "internal"))}</span>${canCancel ? `<button data-a2a-cancel="${esc(task.id)}">Cancel before approval</button>` : `<time>${task.status?.timestamp ? new Date(task.status.timestamp).toLocaleString() : "Local"}</time>`}</footer></article>`;
}

function renderAgentNetwork() {
  const a2a = state.data.operational?.a2a || {};
  const agents = state.data.agents.map((agent) => `<option value="${esc(agent.id)}">${esc(titleCase(agent.id))} - ${esc(titleCase(agent.role))}</option>`).join("");
  page.innerHTML = `${heading("Agent network", "Agents can collaborate without sharing their internals.", "AGIOS exposes a local authenticated A2A 1.0 JSON-RPC gateway. Retrieval completes inside authorized memory scopes; research planning becomes an exact-approval goal.")}
    <div class="protocol-strip"><article><small>DISCOVERY</small><strong>Agent Card live</strong><span>/.well-known/agent-card.json</span></article><article><small>TRANSPORT</small><strong>${esc(titleCase(a2a.transport || "loopback authenticated"))}</strong><span>Session + CSRF protected</span></article><article><small>REMOTE DISPATCH</small><strong>Locked</strong><span>No peer receives data until explicitly trusted</span></article></div>
    <div class="network-grid"><form class="workspace-card a2a-compose" data-a2a-form><p class="eyebrow">Local A2A client</p><h3>Send a governed agent task</h3><p>Knowledge queries return citations. Planning tasks stop in Approvals before Hermes can run.</p><label>Task type<select name="skillId"><option value="scoped-knowledge-retrieval">Scoped knowledge retrieval</option><option value="supervised-research-planning">Supervised research planning</option></select></label><label>Agent<select name="agentId">${agents}</select></label><label>Request<textarea name="objective" required maxlength="8000" placeholder="Ask for evidence or describe a research outcome."></textarea></label><div class="operational-options"><label>Data class<select name="dataClass"><option value="internal">Internal</option><option value="public">Public</option><option value="private_business">Private business</option><option value="customer_restricted">Customer restricted</option></select></label><label>Project scope<input name="projectId" maxlength="128" placeholder="Optional project ID"/></label></div><div class="compose-submit"><span>A2A never grants authority. AGIOS policy and approvals still control execution.</span><button type="submit">Send local task</button></div></form><section class="a2a-feed"><div class="run-feed-heading"><div><p class="eyebrow">Inter-agent tasks</p><h3>${state.a2aTasks.length} local tasks</h3></div><span>A2A 1.0</span></div>${state.a2aTasks.length ? state.a2aTasks.map(a2aTaskCard).join("") : `<div class="workspace-empty workspace-card"><b>A2A</b><strong>No inter-agent tasks yet</strong><span>The gateway is ready; outbound peers remain locked.</span></div>`}</section></div>`;
}

function modelsForSystem(system) {
  const systemModelIds = {
    glm: ["glm-5.2"],
    kimi: ["kimi-k3"],
    mistral: ["mistral-large"],
    openrouter: ["glm-5.2", "kimi-k3", "mistral-large"],
    gemini: ["gemini-3.7-flash"],
    pokee: ["pokee-isaac"],
    sakana: [],
  };
  if (Object.hasOwn(systemModelIds, system.id)) {
    return state.data.models.filter((model) => systemModelIds[system.id].includes(model.id));
  }
  if (system.id === "hermes") {
    const routedModelIds = new Set(Object.values(state.data.routes || {}).flat());
    return state.data.models.filter((model) => routedModelIds.has(model.id));
  }
  if (system.id === "codex") return state.data.models.filter((model) => model.provider === "openai-codex");
  if (system.id === "deepseek") return state.data.models.filter((model) => model.provider === "deepseek");
  if (system.id === "ollama") return state.data.models.filter((model) => model.location === "local");
  if (system.id === "opencode") return state.data.models.filter((model) => ["gpt-5.6-luna", "gpt-5.6-sol", "gpt-5.6-terra", "deepseek-v4-flash", "deepseek-v4-pro"].includes(model.id));
  return state.data.models.filter((model) => model.provider === system.id);
}

function runtimeForSystem(systemId) {
  return state.runtimeAdapters.find((runtime) => runtime.id === systemId) || {
    id: systemId,
    status: "unavailable",
    adapter: "not-installed",
    execution_enabled: false,
    actions: [],
    approval: "not-executable",
    sandbox: "none",
  };
}

function routedModelForSystem(system) {
  const models = modelsForSystem(system).filter((model) => !model.id.includes("embedding"));
  if (system.id === "deepseek") return models.find((model) => model.provider === "deepseek") || null;
  if (system.id === "ollama") return models.find((model) => model.id === "qwen3.5-hermes") || models[0] || null;
  if (system.id === "opencode") return models.find((model) => model.id === "gpt-5.6-sol") || models[0] || null;
  if (system.id === "codex") return models.find((model) => model.id === "gpt-5.6-sol") || models[0] || null;
  return models[0] || null;
}

function systemRunMatches(run, system) {
  const modelIds = new Set(modelsForSystem(system).map((model) => model.id));
  if (system.id === "codex" && run.runtime_id === "codex") return true;
  if (system.id === "opencode" && run.runtime_id === "opencode") return true;
  if (system.id === "hermes" && run.runtime_id === "hermes") return true;
  return modelIds.has(run.model) || run.provider === system.id;
}

function routedSystemLauncher(system, action) {
  const runtime = runtimeForSystem(system.id);
  const model = routedModelForSystem(system);
  const routeableModel = model && !model.id.includes("embedding") && (model.allowed_data_classes || []).includes("internal");
  const nativeExecutable = runtime.execution_enabled && (runtime.actions || []).some((item) => action === "workspace" ? item.startsWith("workspace") : item === action || (action === "chat" && item === "local-inference"));
  const hermesRoute = action === "chat" && routeableModel;
  const executable = nativeExecutable || hermesRoute;
  const destination = action === "workspace" ? `the ${system.name} workspace lane` : action === "goal" ? "Hermes Goal Mode" : hermesRoute ? `Hermes Chat · ${model.id}` : "Hermes Chat";
  return `<section class="workspace-card routed-launcher"><p class="eyebrow">GOVERNED ROUTE</p><h2>${esc(system.name)} → ${destination}</h2><p>${executable ? `AGIOS will open the live supervised composer with ${model ? esc(model.id) : "the approved profile route"} selected. Memory, skills, data classification and approval policy remain attached.${hermesRoute ? " The request runs through Hermes as the supervised runtime for this governed model route." : ""}` : `${esc(system.name)} is visible in the registry, but no executable ${action} adapter is installed and authenticated on this machine.`}</p><div class="control-readout"><span><small>READINESS</small><strong>${hermesRoute ? "Routed via Hermes" : runtime.configured ? "Configured" : runtime.detected ? "Installed · auth unverified" : "Not found"}</strong></span><span><small>ADAPTER</small><strong>${esc(titleCase(hermesRoute ? "hermes" : runtime.adapter))}</strong></span><span><small>MODEL</small><strong>${esc(model?.id || "Unavailable")}</strong></span><span><small>AUTHORITY</small><strong>${esc(titleCase(hermesRoute ? "policy-checked" : runtime.approval))}</strong></span></div>${executable ? `<button class="primary-action routed-action" data-route-system-action="${esc(action)}" data-route-system-id="${esc(system.id)}">Open live ${esc(action)} →</button>` : `<div class="boundary-note">Install and authenticate an audited adapter before this action can appear. AGIOS blocks silent provider fallback.</div>`}</section>`;
}

function renderModelCards(models) {
  return models.length ? `<div class="model-card-grid">${models.map((model) => `<article class="model-card"><header><span>${esc(model.provider)}</span>${status(model.location === "local" ? "ready" : "routed")}</header><h3>${esc(model.id)}</h3><p>${esc(titleCase(model.trust))} trust · ${esc(titleCase(model.cost_status))}</p><div class="data-class-row">${model.allowed_data_classes.map((item) => `<span>${esc(titleCase(item))}</span>`).join("")}</div></article>`).join("")}</div>` : `<div class="workspace-empty workspace-card large"><b>◇</b><strong>No governed model routes connected</strong><span>The system exists in the AGIOS registry, but its model adapter is not installed.</span></div>`;
}

function memoryVaultSurface() {
  const memories = state.memories || [];
  const scopeKinds = ["portfolio", "business", "department", "project", "private"];
  const folders = [
    { id: "all", label: "All memories" },
    ...scopeKinds.map((kind) => ({ id: kind, label: titleCase(kind) })),
  ];
  const filtered = state.memoryFolder === "all"
    ? memories
    : memories.filter((memory) => memory.scope_kind === state.memoryFolder);
  const selected = filtered.find((memory) => memory.memory_id === state.memoryNote) || filtered[0] || null;
  const rows = filtered.map((memory) => `
    <button class="memory-vault-note${selected && selected.memory_id === memory.memory_id ? " is-active" : ""}" data-memory-note="${esc(memory.memory_id)}">
      <span class="memory-vault-note-title">${esc(memory.title)}</span>
      <span class="memory-vault-note-excerpt">${esc((memory.body || "").slice(0, 110))}</span>
      <span class="memory-vault-note-meta">${esc(titleCase(memory.scope_kind))} · ${esc(titleCase(memory.trust))} trust</span>
    </button>`).join("");
  const folderButtons = folders.map((folder) => {
    const count = folder.id === "all" ? memories.length : memories.filter((memory) => memory.scope_kind === folder.id).length;
    return `<button class="${state.memoryFolder === folder.id ? "is-active" : ""}" data-memory-folder="${esc(folder.id)}"><span>${folder.id === "all" ? "▤" : "▸"}</span>${esc(folder.label)}<em>${count}</em></button>`;
  }).join("");
  const reader = selected
    ? `<article class="memory-vault-reader"><small>${esc(titleCase(selected.scope_kind))} / ${esc(selected.scope_id)} · ${esc(titleCase(selected.trust))} trust · by ${esc(titleCase(selected.created_by))}</small><h3>${esc(selected.title)}</h3><p>${esc(selected.body)}</p></article>`
    : `<article class="memory-vault-reader is-empty"><h3>No note selected</h3><p>${memories.length ? "Choose a memory from the list to read it." : "The vault is empty. Save the first durable fact from the form below."}</p></article>`;
  return `<section class="memory-vault">
    <header><div><p class="eyebrow">MEMORY VAULT</p><h2>${memories.length} durable memor${memories.length === 1 ? "y" : "ies"}</h2><p>Folders are authorization scopes. Select a note to read it.</p></div><span>${state.data.agents.length} authorized agents</span></header>
    <div class="memory-vault-body">
      <aside class="memory-vault-tree">${folderButtons}</aside>
      <div class="memory-vault-list">${rows || `<div class="memory-vault-empty"><strong>Empty ${state.memoryFolder === "all" ? "vault" : esc(titleCase(state.memoryFolder))} folder</strong><span>Facts saved under this scope will appear here.</span></div>`}</div>
      ${reader}
    </div>
  </section>`;
}

function renderSystems() {
  const cards = state.data.systems.map((system, index) => {
    const runtime = runtimeForSystem(system.id);
    return `<button class="system-card" data-system="${esc(system.id)}"><div class="system-card-top"><span class="system-glyph system-${index % 6}">${initials(system.name)}</span>${status(runtime.status)}</div><h2>${esc(system.name)}</h2><p>${esc(system.description)}</p><div class="system-fabric"><span class="${system.shared_memory ? "is-on" : ""}">✦ Memory</span><span class="${system.shared_skills ? "is-on" : ""}">◇ Skills</span></div><footer><span>${runtime.actions?.length || 0} executable actions</span><span>${esc(titleCase(runtime.adapter))} ↗</span></footer></button>`;
  }).join("");
  page.innerHTML = `${heading("Unified runtime layer", "Every AI system, one AGIOS contract.", "Hermes, Codex, Gemini, Antigravity, DeepSeek, Ollama, OpenCode and future runtimes share skills, scoped memory, governance and business context without pretending planned adapters are connected.")}<div class="system-summary"><span><strong>${state.data.summary.systems}</strong> registered systems</span><span><strong>${state.data.summary.live_or_detected_systems}</strong> live, detected or routed</span><span><strong>${state.data.summary.shared_skills}</strong> shared skills</span><span><strong>${state.data.operational?.shared_memory?.fact_count ?? 0}</strong> AGIOS shared memories</span></div><div class="system-grid">${cards}</div>`;
}

const hermesModes = [
  ["chat", "Chat", "□"],
  ["apollo", "Apollo", "◖"],
  ["oracle", "Hermes Oracle", "◎"],
  ["astros", "Hermes Astros", "✦"],
  ["studio", "Studio", "✧"],
  ["sessions", "Sessions", "◷"],
  ["outreach", "Outreach", "✉"],
  ["mixture", "Mixture", "◈"],
  ["workspace", "Workspace", "▱"],
  ["mcps", "MCPs", "⌘"],
  ["manage", "Manage", "▦"],
  ["webui", "Web UI", "▣"],
  ["terminal", "Terminal", ">_"],
  ["control", "Control Room", ">_"],
  ["goal", "Goal Mode", "◎"],
];

const studioModules = [
  { id: "loops", name: "Loop Engineering", note: "Build repeatable, reviewable workflows", mode: "goal", status: "live" },
  { id: "music", name: "Music Studio", note: "Plan and route approved audio production", mode: "goal", status: "guided" },
  { id: "video", name: "Video Agent", note: "Coordinate scripts, scenes, assets and review", mode: "goal", status: "guided" },
  { id: "seo", name: "SEO Content System", note: "Research, briefs, content and independent review", mode: "astros", status: "live" },
  { id: "code", name: "JCode Workspace", note: "Open exact-approved repository work", mode: "workspace", status: "live" },
  { id: "research", name: "Competitor Oracle", note: "Scheduled evidence-backed competitor intelligence", mode: "oracle", status: "live" },
];

function hermesAgent(id, fallback = "default") {
  return state.data.agents.find((agent) => agent.id === id)
    || state.data.agents.find((agent) => agent.id === fallback)
    || state.data.agents[0];
}

function wakeWordPanel() {
  const supported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  return `<section class="wake-word-panel ${state.wakeArmed ? "is-armed" : ""}"><div class="wake-orb">${state.wakeArmed ? "◉" : "◌"}</div><div><small>VOICE INTERFACE</small><h3>“hey hermes”</h3><p>${supported ? "Arm once to bring the active Hermes composer into focus when the wake phrase is heard." : "Wake-word recognition is unavailable in this browser; push-to-talk remains available."}</p></div><button type="button" data-wake-toggle ${supported ? "" : "disabled"}>${state.wakeArmed ? "Listening" : "Arm voice"}</button></section>`;
}

function specialistIntro(name, subtitle, description, agent, metrics = []) {
  return `<section class="specialist-intro"><div class="specialist-orb">${initials(name)}</div><div><small>HERMES SPECIALIST · ${esc(agent.profession || titleCase(agent.role))}</small><h2>${esc(name)}</h2><p>${esc(description)}</p></div><div class="specialist-metrics">${metrics.map(([label, value]) => `<span><small>${esc(label)}</small><strong>${esc(value)}</strong></span>`).join("")}</div><div class="specialist-status">${status(agent.state)}<small>${esc(subtitle)}</small></div></section>`;
}

function oracleRadar() {
  const oracleSchedules = state.data.schedules.filter((job) => /oracle|competitor|trend|research|watch/i.test(`${job.name} ${job.id}`));
  const recentRuns = state.runs.filter((run) => run.agent_id === "researcher").slice(0, 6);
  const items = [
    ...oracleSchedules.map((job) => ({ kind: "SCHEDULED WATCH", title: job.name, note: `${job.schedule || "Registered cadence"} · ${relativeTime(job.next_run_at)}`, state: job.state })),
    ...recentRuns.map((run) => ({ kind: "EVIDENCE RUN", title: run.objective, note: `${titleCase(run.mode)} · ${new Date(run.created_at).toLocaleString()}`, state: run.status })),
  ];
  return `<section class="oracle-radar"><header><div><p class="eyebrow">INTELLIGENCE RADAR</p><h2>Rank signals. Preserve sources. Show the delta.</h2><p>Oracle scores permitted evidence by recency, relevance, authority, and change magnitude. Draft actions return for review; publishing and outreach remain locked.</p></div><span>${items.length} REAL WATCHES / RUNS</span></header><div class="radar-contract"><span>1 · COLLECT</span><i>→</i><span>2 · CITE</span><i>→</i><span>3 · RANK</span><i>→</i><span>4 · COMPARE</span><i>→</i><span>5 · PROPOSE</span></div><div class="radar-grid">${items.length ? items.map((item, index) => `<article><b>${String(index + 1).padStart(2, "0")}</b><div><small>${item.kind}</small><h3>${esc(item.title)}</h3><p>${esc(item.note)}</p></div>${status(item.state)}</article>`).join("") : `<div class="workspace-empty workspace-card"><b>◎</b><strong>No Oracle watch has produced evidence yet</strong><span>Create an exact-approved research goal or register a Hermes schedule; AGIOS will not invent trend signals.</span></div>`}</div></section>`;
}

function sessionArchive() {
  const query = state.sessionQuery.trim().toLowerCase();
  const runs = state.runs.filter((run) => !query || `${run.objective} ${run.response || ""} ${run.agent_id} ${run.mode} ${run.status}`.toLowerCase().includes(query));
  return `<section class="session-archive"><header><div><p class="eyebrow">Private local archive</p><h2>Every AGIOS session, searchable</h2><p>Transcripts stay in the private runtime store; the audit journal receives digests and status only.</p></div><label class="session-search">⌕<input id="session-search" aria-label="Search sessions" value="${esc(state.sessionQuery)}" placeholder="Search sessions, agents and results"/></label></header><div class="session-summary"><span><strong>${state.runs.length}</strong> saved</span><span><strong>${state.runs.filter((run) => run.status === "completed").length}</strong> completed</span><span><strong>${state.runs.filter((run) => ["queued", "running"].includes(run.status)).length}</strong> active</span></div><div class="runtime-session-list">${runs.length ? runs.map((run) => runCard(run, { transcript: true })).join("") : `<div class="workspace-empty workspace-card large"><b>◷</b><strong>No matching sessions</strong><span>Change the search or start a real Hermes run.</span></div>`}</div></section>`;
}

function studioDesk() {
  const modules = studioModules.filter((module) => !state.hiddenStudios[module.id]);
  return `<section class="studio-desk"><header><div><p class="eyebrow">Modular operating desk</p><h2>Keep the tools that move the business forward.</h2><p>Each visible module opens a real AGIOS workflow. Hide modules you do not need from Manage.</p></div><span>${modules.length} visible modules</span></header><div class="studio-module-grid">${modules.map((module, index) => `<article class="studio-module module-${index % 4}"><div class="studio-module-icon">${initials(module.name)}</div><small>${esc(titleCase(module.status))}</small><h3>${esc(module.name)}</h3><p>${esc(module.note)}</p><footer>${status(module.status === "live" ? "ready" : "planned")}<button data-studio-mode="${esc(module.mode)}" data-studio-name="${esc(module.name)}">Open workflow →</button></footer></article>`).join("") || `<div class="workspace-empty workspace-card large"><b>✧</b><strong>Every studio module is hidden</strong><span>Open Manage to restore the modules you need.</span></div>`}</div></section>`;
}

function modelManager() {
  const agentRows = state.data.agents.map((agent) => {
    const models = modelsForAgent(agent);
    const selected = state.modelPreferences[agent.id] || "";
    return `<form class="model-assignment" data-model-preference-form data-agent-id="${esc(agent.id)}"><div class="agent-orb">${initials(agent.name || agent.id)}</div><div><strong>${esc(agent.name || titleCase(agent.id))}</strong><small>${esc(agent.profession || titleCase(agent.role))}</small></div><label>Default model<select name="modelId"><option value="">Hermes profile default</option>${models.map((model) => `<option value="${esc(model.id)}" ${selected === model.id ? "selected" : ""} title="${esc(model.cost_note || "cost not reported")}">${esc(model.id)} · ${esc(model.provider)} · ${esc(model.cost_note || "cost not reported")}</option>`).join("")}</select></label><button type="submit">Save</button></form>`;
  }).join("");
  const moduleRows = studioModules.map((module) => `<button class="module-toggle ${state.hiddenStudios[module.id] ? "is-off" : ""}" data-toggle-studio="${esc(module.id)}"><span>${esc(module.name)}</span><em>${state.hiddenStudios[module.id] ? "Hidden" : "Visible"}</em></button>`).join("");
  return `${osReadinessSurface(true)}<div class="manage-grid"><section class="workspace-card model-manager"><p class="eyebrow">Two-click model manager</p><h2>Set each worker's normal brain.</h2><p>This is the persistent default. Use Model Once in Chat, Goal Mode, or Workspace when a single task needs a different approved model.</p><div class="model-assignment-list">${agentRows}</div></section><section class="workspace-card module-manager"><p class="eyebrow">Desk visibility</p><h2>Choose what appears in Studio.</h2><p>Hidden modules remain registered and can be restored at any time.</p><div>${moduleRows}</div></section><section class="workspace-card vault-guide"><p class="eyebrow">Vault Mode</p><h2>Private work is a route policy.</h2><p>Select Private business or Customer restricted in any composer. AGIOS will prefer an eligible local route and will never weaken the data class to reach a model.</p><div class="policy-row"><span>Local eligible model</span><em>Preferred</em></div><div class="policy-row"><span>Trusted external route</span><em>Exact approval</em></div><div class="policy-row"><span>Free or untrusted fallback</span><em>Blocked</em></div></section></div>`;
}

function hermesControlRoom(system) {
  const models = modelsForSystem(system);
  return `<div class="control-grid"><section class="workspace-card control-primary"><p class="eyebrow">Hermes control room</p><h3>One supervised runtime, many workers</h3><div class="control-readout"><span><small>GATEWAY</small><strong>${state.data.runtime.gateway_running ? "Online" : "Standing by"}</strong></span><span><small>MODELS</small><strong>${models.length}</strong></span><span><small>MEMORY</small><strong>Shared</strong></span><span><small>SESSIONS</small><strong>${state.runs.length}</strong></span></div></section><section class="workspace-card"><p class="eyebrow">Guardrails</p><h3>Hermes knows when to knock.</h3><div class="policy-row"><span>Chat, voice, vision and private sessions</span><em>Live</em></div><div class="policy-row"><span>Goals and workspace work</span><em>Exact approval</em></div><div class="policy-row"><span>Shared memory and skills</span><em>Scoped</em></div><div class="policy-row"><span>Messages, publishing, purchases and deployment</span><em>Locked</em></div></section></div>`;
}

function hermesModeContent(system) {
  const chief = hermesAgent("default");
  const researcher = hermesAgent("researcher");
  const manager = hermesAgent("manager");
  const builder = hermesAgent("builder");
  if (state.systemMode === "chat") return `${wakeWordPanel()}${operationalWorkspace(chief, "chat")}`;
  if (state.systemMode === "apollo") return `${specialistIntro("Hermes Apollo", "Voice operations", "Speak naturally, review the transcript, choose the model route and send through the same shared-memory contract.", chief, [["INPUT", state.voice?.input?.enabled ? "Ready" : "Unavailable"], ["OUTPUT", state.voice?.output?.enabled ? "Ready" : "Unavailable"]])}${wakeWordPanel()}${operationalWorkspace(chief, "chat")}`;
  if (state.systemMode === "oracle") return `${specialistIntro("Hermes Oracle", "Competitor intelligence", "Research competitors with citations, keep the evidence in shared memory and use Hermes schedules for recurring watches.", researcher, [["SCHEDULES", String(state.data.schedules.length)], ["MEMORY", String(state.data.operational?.shared_memory?.fact_count ?? 0)]])}${oracleRadar()}${operationalWorkspace(researcher, "goal")}`;
  if (state.systemMode === "astros") return `${specialistIntro("Hermes Astros", "SEO and content intelligence", "Track topics, keywords and content opportunities, then hand reviewed briefs to the Growth department.", researcher, [["SKILLS", String(researcher.skill_count ?? "—")], ["ROUTES", String(modelsForAgent(researcher).length)]])}${operationalWorkspace(researcher, "goal")}`;
  if (state.systemMode === "studio") return studioDesk();
  if (state.systemMode === "sessions") return sessionArchive();
  if (state.systemMode === "outreach") return `${specialistIntro("Outreach Desk", "Draft-only external work", "Research and prepare outreach while every final recipient, message and send action remains owner approved.", manager, [["APPROVALS", String(state.runs.filter((run) => run.status === "awaiting_approval").length)]])}${operationalWorkspace(manager, "goal")}`;
  if (state.systemMode === "mixture") return `<section class="mixture-desk"><header><p class="eyebrow">Multi-agent team</p><h2>Assemble the right workers around one outcome.</h2><p>Every professional identity shares AGIOS memory and skills inside its authorized scope.</p></header><div class="mixture-agent-grid">${state.data.agents.map((agent) => `<button data-agent="${esc(agent.id)}"><span class="agent-orb">${initials(agent.name || agent.id)}</span><strong>${esc(agent.name || titleCase(agent.id))}</strong><small>${esc(agent.profession || titleCase(agent.role))}</small>${status(agent.state)}</button>`).join("")}</div></section>`;
  if (state.systemMode === "workspace") return operationalWorkspace(builder, "workspace");
  if (state.systemMode === "mcps") return `<section class="tool-catalog">${state.data.apps.filter((app) => app.kind === "mcp").map((app) => `<article><header><span>⌘</span>${status(app.status === "connected" ? "registered" : app.status)}</header><h3>${esc(app.name)}</h3><p>Shared MCP · ${esc(titleCase(app.status === "connected" ? "registered" : app.status))}</p><small>${app.status === "connected" ? "Cataloged in Hermes; direct AGIOS execution remains locked until an audited action adapter is enabled" : "Configuration or adapter required"}</small></article>`).join("")}</section>`;
  if (state.systemMode === "manage") return modelManager();
  if (state.systemMode === "webui") return hermesWebSurface();
  if (state.systemMode === "terminal") {
    const surface = terminalSurfaceForSystem("hermes");
    return surface ? systemTerminalSurface(surface) : "";
  }
  if (state.systemMode === "control") return hermesControlRoom(system);
  if (state.systemMode === "goal") return `${specialistIntro("Goal Mode", "Set the target. Walk away.", "Hermes works in the background, preserves the real session and returns the result for review. Exact approval remains bound to the complete context.", chief, [["ACTIVE", String(state.runs.filter((run) => ["queued", "running"].includes(run.status)).length)], ["TOTAL", String(state.runs.filter((run) => run.mode === "goal").length)]])}${operationalWorkspace(chief, "goal")}`;
  return studioDesk();
}

function renderHermesSystem(system) {
  disposeSurfaceSession();
  const modelChips = modelsForSystem(system).map((model) => `<span class="model-chip"><i class="status-dot status-${model.location === "local" ? "ready" : "routed"}"></i>${esc(model.id)}</span>`).join("");
  page.innerHTML = `<div class="system-hero hermes-hero"><div class="system-identity"><p class="eyebrow">IV. — AGENT · HERMES</p><h1>Hermes</h1><p>Primary AGIOS worker. Chat, voice, research, goals, sessions, skills, workspaces and tools at one desk.</p><small>${new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Yerevan" }).format(new Date())} · LOCAL · STUDIO</small></div><div class="system-hero-status">${status(system.status)}<small>${state.data.runtime.gateway_running ? "Hermes online" : "Hermes standing by"}</small></div></div><div class="mode-strip system-modes hermes-modes">${hermesModes.map(([id, label, icon]) => `<button class="${state.systemMode === id ? "is-active" : ""}" data-system-mode="${id}"><span>${icon}</span>${label}</button>`).join("")}</div><div class="model-strip hermes-model-strip" aria-label="Hermes model routes">${modelChips}</div><div class="agent-mode-content hermes-mode-content">${hermesModeContent(system)}</div>`;
  if (state.systemMode === "terminal") {
    const surface = terminalSurfaceForSystem("hermes");
    const container = page.querySelector("[data-surface-terminal]");
    if (surface && container) {
      container.classList.add("is-live");
      window.setTimeout(() => connectSurfaceTerminal(container, surface.id), 0);
    }
  }
  renderSystemNavigation();
}

function systemOverview(system) {
  const models = modelsForSystem(system);
  const runtime = runtimeForSystem(system.id);
  const model = routedModelForSystem(system);
  const providerIdBySystem = { deepseek: "deepseek", gemini: "gemini", pokee: "pokee", openrouter: "openrouter", glm: "openrouter", kimi: "openrouter", mistral: "openrouter" };
  const provider = state.costs?.providers?.find((item) => item.id === providerIdBySystem[system.id]);
  const balanceHtml = !state.costs
    ? `<button class="primary-action" data-cost-load>Load live balance</button>`
    : provider && provider.status === "reported" && provider.balances?.length
      ? provider.balances.map((balance) => `<span><small>LIVE BALANCE</small><strong>${esc(String(balance.currency || "?"))} ${esc(String(balance.total_balance ?? "n/a"))}</strong><em>${provider.available ? "available" : "unavailable"}</em></span>`).join("")
      : provider && provider.status === "reported-empty"
        ? `<span><small>KEY CHECK</small><strong>${provider.tier === "free" ? "Free tier verified" : "Verified"}</strong><em>${esc((provider.models || []).join(", ") || "key ok")}</em></span>`
        : `<span><small>PROVIDER</small><strong>${esc(provider?.status || "not-configured")}</strong><em>${esc(provider?.reason || "No cost adapter for this system.")}</em></span>`;
  const modelChips = models.length
    ? models.map((item) => `<span class="model-chip"><i class="status-dot status-${item.location === "local" ? "ready" : "routed"}"></i>${esc(item.id)}</span>`).join("")
    : `<span class="model-chip"><i class="status-dot status-blocked"></i>no governed models registered</span>`;
  const chatAction = model && !model.id.includes("embedding") && (model.allowed_data_classes || []).includes("internal")
    ? `<button class="primary-action routed-action" data-route-system-action="chat" data-route-system-id="${esc(system.id)}">Open live chat · ${esc(model.id)} →</button>`
    : "";
  return `<div class="system-overview"><section class="workspace-card"><p class="eyebrow">WHAT THIS IS</p><h3>${esc(system.name)}</h3><p>${esc(system.description)}</p><div class="control-readout"><span><small>ADAPTER</small><strong>${esc(titleCase(runtime.adapter))}</strong></span><span><small>READINESS</small><strong>${runtime.execution_enabled ? "Executable" : "Governed route"}</strong></span><span><small>MODELS</small><strong>${models.length}</strong></span>${balanceHtml}</div></section><section class="workspace-card"><p class="eyebrow">MODELS YOU CAN USE</p><div class="model-chip-row">${modelChips}</div><p>Models are policy-approved routes: the data class you choose decides which model may receive the request. Open the Models tab for each model's exact trust and data-class contract.</p><div class="overview-actions">${chatAction}<button data-system-mode="models">Inspect model contracts →</button></div></section></div>`;
}

function systemModeContent(system) {
  const models = modelsForSystem(system);
  const runtime = runtimeForSystem(system.id);
  if (state.systemMode === "overview") return systemOverview(system);
  if (state.systemMode === "chat") return routedSystemLauncher(system, "chat");
  if (state.systemMode === "goals") return routedSystemLauncher(system, "goal");
  if (state.systemMode === "workspace") return routedSystemLauncher(system, "workspace");
  if (state.systemMode === "terminal") {
    const surface = terminalSurfaceForSystem(system.id);
    return surface ? systemTerminalSurface(surface) : "";
  }
  if (state.systemMode === "sessions") {
    const runs = state.runs.filter((run) => systemRunMatches(run, system));
    return `<section class="session-archive"><header><div><p class="eyebrow">REAL ROUTED ACTIVITY</p><h2>${esc(system.name)} sessions</h2><p>Only AGIOS runs that used this runtime or one of its governed model routes appear here.</p></div><span>${runs.length} verified records</span></header><div class="runtime-session-list">${runs.length ? runs.map((run) => runCard(run, { transcript: run.mode === "chat" })).join("") : `<div class="workspace-empty workspace-card large"><b>◷</b><strong>No ${esc(system.name)} runs yet</strong><span>Open an available action to create the first real session.</span></div>`}</div></section>`;
  }
  if (state.systemMode === "models") return renderModelCards(models);
  if (state.systemMode === "memory") return `<div class="fabric-banner memory-route"><span>✦</span><div><small>AGIOS MEMORY CONTRACT</small><h2>${esc(system.name)} is attached to the shared fabric</h2><p>Memory is managed once in Memory Studio, then retrieved here through the system's authorized scope. No duplicate provider galaxy or competing store is shown.</p></div><button data-view-link="memory">Open Memory Studio ↗</button></div>`;
  if (state.systemMode === "skills") {
    const skills = state.data.shared_fabric.skills.items.slice(0, 24);
    return `<div class="fabric-banner"><span>◇</span><div><small>GLOBAL SKILL REGISTRY</small><h2>${state.data.shared_fabric.skills.inventory} live skills available</h2><p>${esc(system.name)} uses the shared catalog through its AGIOS capability policy. Install once; eligible systems discover the update.</p></div><button data-view-link="skills">Open full registry ↗</button></div><div class="skill-preview-grid">${skills.map((skill) => `<article><span>${esc(skill.category)}</span><strong>${esc(titleCase(skill.name))}</strong><p>${esc(skill.description)}</p></article>`).join("")}</div>`;
  }
  if (state.systemMode === "agents") {
    return system.id === "hermes" ? `<div class="data-panel"><div class="data-head columns-agents"><span>Profile</span><span>State</span><span>Model</span><span>Skills</span><span>Wake</span></div>${state.data.agents.map((agent) => `<div class="data-row columns-agents clickable-row" data-agent="${esc(agent.id)}"><div><strong>${esc(agent.id)}</strong><p>${esc(titleCase(agent.role))}</p></div><span>${status(agent.state)}</span><span>${esc(agent.model || "Unavailable")}</span><span>${agent.skill_count ?? "—"}</span><span>Event or schedule</span></div>`).join("")}</div>` : `<div class="workspace-empty workspace-card large"><b>◉</b><strong>Agent adapter not connected</strong><span>${esc(system.name)} is registered, but AGIOS cannot yet inspect or dispatch its workers.</span></div>`;
  }
  if (state.systemMode === "repositories") return repositorySurface();
  if (state.systemMode === "control") {
    return `<div class="control-grid"><section class="workspace-card control-primary"><p class="eyebrow">Executable adapter status</p><h3>${esc(system.name)} · ${esc(titleCase(runtime.status))}</h3><div class="control-readout"><span><small>DETECTED</small><strong>${runtime.detected ? "Yes" : "No"}</strong></span><span><small>ADAPTER</small><strong>${esc(titleCase(runtime.adapter))}</strong></span><span><small>APPROVAL</small><strong>${esc(titleCase(runtime.approval))}</strong></span><span><small>SANDBOX</small><strong>${esc(titleCase(runtime.sandbox))}</strong></span></div></section><section class="workspace-card"><p class="eyebrow">Live action contract</p><h3>${runtime.actions?.length || 0} executable functions</h3>${runtime.actions?.length ? runtime.actions.map((action) => `<div class="policy-row"><span>${esc(titleCase(action))}</span><em>Executable</em></div>`).join("") : `<div class="boundary-note">No execution buttons are exposed because this adapter is absent or unaudited. AGIOS will not pretend that a registry entry is a working integration.</div>`}</section></div>`;
  }
  const boundary = runtime.execution_enabled
    ? "The displayed actions use shared AGIOS governance, memory and skill contracts."
    : runtime.detected
      ? "The software is installed, but authentication and an audited action adapter are not verified. No execution controls are exposed."
      : "This system is represented in AGIOS, but its executable adapter is not connected yet.";
  return `<div class="system-overview"><section class="workspace-card system-brief"><p class="eyebrow">${esc(titleCase(system.kind))}</p><h3>${esc(system.description)}</h3><div class="fabric-readout"><span><small>STATUS</small><strong>${esc(titleCase(runtime.status))}</strong></span><span><small>MODELS</small><strong>${models.length}</strong></span><span><small>MEMORY</small><strong>${system.shared_memory ? "Shared" : "No"}</strong></span><span><small>SKILLS</small><strong>${system.shared_skills ? state.data.summary.shared_skills : "No"}</strong></span></div></section><section class="workspace-card"><p class="eyebrow">Registered capabilities</p><h3>System capability catalog</h3><div class="skill-cloud">${system.capabilities.map((capability) => `<span>${esc(titleCase(capability))}</span>`).join("")}</div><div class="boundary-note">${esc(boundary)}</div></section></div>`;
}

function renderSystem() {
  const system = state.data.systems.find((item) => item.id === state.selectedSystem) || state.data.systems[0];
  state.selectedSystem = system.id;
  if (system.id === "hermes") {
    renderHermesSystem(system);
    return;
  }
  const runtime = runtimeForSystem(system.id);
  const actions = runtime.actions || [];
  const modes = [["overview", "Overview"]];
  if (actions.includes("chat") || actions.includes("local-inference")) modes.push(["chat", "Chat"]);
  if (actions.includes("goal")) modes.push(["goals", "Goals"]);
  if (actions.some((action) => action.startsWith("workspace"))) modes.push(["workspace", "Workspace"]);
  if (!modes.some(([id]) => id === "chat") && modelsForSystem(system).some((model) => !model.id.includes("embedding"))) {
    modes.push(["chat", "Chat"]);
  }
  if (runtime.execution_enabled) modes.push(["sessions", "Sessions"]);
  modes.push(["models", "Models"], ["skills", "Skills"], ["memory", "Memory"], ["control", "Control Room"]);
  if (terminalSurfaceForSystem(system.id)) modes.push(["terminal", "Terminal"]);
  if (!modes.some(([id]) => id === state.systemMode)) state.systemMode = "overview";
  disposeSurfaceSession();
  page.innerHTML = `<div class="system-hero"><div class="system-identity"><p class="eyebrow">AI SYSTEM · ${esc(titleCase(system.kind))}</p><h1>${esc(system.name)}</h1><p>${esc(system.description)}</p></div><div class="system-hero-status">${status(runtime.status)}<small>${esc(titleCase(runtime.adapter))}</small></div></div><div class="mode-strip system-modes">${modes.map(([id, label]) => `<button class="${state.systemMode === id ? "is-active" : ""}" data-system-mode="${id}"><span>${id === "memory" ? "✦" : id === "skills" ? "◇" : id === "models" ? "◌" : id === "terminal" ? ">_" : id === "control" ? ">_" : id === "workspace" ? "▱" : "□"}</span>${label}</button>`).join("")}</div><div class="agent-mode-content">${systemModeContent(system)}</div>`;
  if (state.systemMode === "terminal") {
    const surface = terminalSurfaceForSystem(system.id);
    const container = page.querySelector("[data-surface-terminal]");
    if (surface && container) {
      container.classList.add("is-live");
      window.setTimeout(() => connectSurfaceTerminal(container, surface.id), 0);
    }
  }
  renderSystemNavigation();
}

function skillHygieneSurface() {
  const pending = state.skillProposals.filter((item) => item.status !== "installed");
  const installed = state.skillProposals.filter((item) => item.status === "installed");
  return `<section class="skill-hygiene"><header><div><p class="eyebrow">SKILL LAB</p><h2>Learn, test, approve, then share.</h2></div><button data-view-link="agents">Open professional growth →</button></header><div><article><small>CANDIDATE INTAKE</small><strong>${pending.length}</strong><p>URLs, repeated corrections, and completed work enter as proposals—not trusted instructions.</p></article><article><small>VALIDATION</small><strong>Required</strong><p>Source, license, malicious content, alternatives, duplicates, and a test result are checked before install.</p></article><article><small>LIVE EVOLUTION</small><strong>${installed.length}</strong><p>Installed AGIOS-authored skills remain versioned, reviewable, and owner governed.</p></article><article><small>HYGIENE</small><strong>Ongoing</strong><p>Stale, unused, verbose, or superseded skills should be pruned instead of accumulating forever.</p></article></div></section>`;
}

function knowledgeIntakeSurface() {
  const summary = state.learned?.summary || { documents: 0, indexed_chunks: 0 };
  const docs = (state.learned?.documents || []).map((doc) => `<article class="learned-doc"><header><strong>${esc(doc.title)}</strong><em>${doc.chunk_count} chunks · ${(doc.glossary || []).length} terms</em></header><p>${esc(doc.cheat_sheet || "Deterministic index only — no model summary exists.")}</p><footer><span>${esc(doc.source_name)} · ${new Date(doc.created_at).toLocaleString()}</span><span class="learned-terms">${(doc.glossary || []).slice(0, 5).map((term) => `<i>${esc(term)}</i>`).join("")}</span></footer></article>`).join("");
  return `<section class="knowledge-intake"><header><div><p class="eyebrow">KNOWLEDGE INTAKE · /LEARN STYLE</p><h2>Give AGIOS a document once. It builds a brain file.</h2><p>One deterministic index per document: real chunks, a term glossary, and a cheat sheet of opening statements. No model-generated summary, so nothing can be hallucinated.</p></div><span>${summary.documents} learned · ${summary.indexed_chunks} indexed chunks</span></header><div class="learn-grid"><form class="workspace-card learn-form" data-learn-form><label>Title<input name="title" required maxlength="160" placeholder="Perfume import compliance guide"/></label><label>Source<input name="sourceName" maxlength="160" value="pasted" placeholder="book, PDF notes, article"/></label><label>Document text<textarea name="text" required maxlength="200000" placeholder="Paste the document text. AGIOS splits it into bounded chunks, extracts frequent terms, and keeps the index — never a rewrite."></textarea></label><button type="submit">Build brain file</button></form><div class="learned-list">${docs || `<div class="workspace-empty workspace-card"><b>▤</b><strong>No brain files yet</strong><span>Learned documents appear here with their real index, ready for retrieval.</span></div>`}</div></div></section>`;
}

function improvementRecommendationsSurface() {
  const digest = state.dreaming;
  if (!digest) return "";
  const recommendations = digest.recommendations || [];
  const evidenceDimensions = (digest.dimensions || []).filter((item) => item.status === "evidence").length;
  const cards = recommendations.map((item) => {
    const evidence = Object.entries(item.evidence || {}).map(([key, value]) => `<span><small>${esc(titleCase(key))}</small><strong>${esc(value)}</strong></span>`).join("");
    const target = item.action?.target || "skills";
    return `<article><header><span>${esc(titleCase(item.dimension))}</span>${status("evidence")}</header><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p><div class="improvement-evidence">${evidence}</div><footer><button data-dreaming-dismiss="${esc(item.id)}">Dismiss</button><button data-dreaming-accept="${esc(item.id)}" data-dreaming-target="${esc(target)}">Accept and open →</button></footer></article>`;
  }).join("");
  return `<section class="improvement-proposals"><header><div><p class="eyebrow">VERIFIED IMPROVEMENTS</p><h2>${recommendations.length} evidence-backed proposal${recommendations.length === 1 ? "" : "s"}</h2><p>Eight local dimensions are measured. A proposal appears only when a stored count or status supports it; nothing installs itself.</p></div><span>${evidenceDimensions}/8 dimensions have evidence</span></header><div>${cards || `<div class="simple-empty">No improvement proposal currently has enough evidence.</div>`}</div></section>`;
}

function renderSharedSkills() {
  const registry = state.data.shared_fabric.skills;
  const categories = Object.keys(registry.categories);
  const filtered = registry.items.filter((skill) => (state.skillCategory === "all" || skill.category === state.skillCategory) && (!state.skillQuery || `${skill.name} ${skill.description}`.toLowerCase().includes(state.skillQuery.toLowerCase())));
  page.innerHTML = `${heading("Shared capability fabric", "Install once. Use everywhere—with policy.", "Hermes, Codex, Gemini, Antigravity, DeepSeek and future workers discover skills through one live AGIOS registry. Skill bodies remain runtime-side.")}${improvementRecommendationsSurface()}${knowledgeIntakeSurface()}${skillHygieneSurface()}<div class="fabric-summary"><div><small>LIVE SKILLS</small><strong>${registry.inventory}</strong></div><div><small>CATEGORIES</small><strong>${categories.length}</strong></div><div><small>AGENTS ATTACHED</small><strong>${registry.attached_agents}</strong></div><div><small>ELIGIBLE SYSTEMS</small><strong>${registry.eligible_systems}</strong></div></div><div class="catalog-toolbar"><label>⌕<input id="skill-search" value="${esc(state.skillQuery)}" placeholder="Search skills and techniques" /></label><div class="category-strip"><button class="${state.skillCategory === "all" ? "is-active" : ""}" data-skill-category="all">All</button>${categories.slice(0, 8).map((category) => `<button class="${state.skillCategory === category ? "is-active" : ""}" data-skill-category="${esc(category)}">${esc(titleCase(category))} · ${registry.categories[category]}</button>`).join("")}</div></div><div class="skill-catalog">${filtered.slice(0, 60).map((skill) => `<article><header><span>${esc(skill.category)}</span><em>SHARED</em></header><h3>${esc(titleCase(skill.name))}</h3><p>${esc(skill.description || "No description provided")}</p><footer><span>All authorized agents</span><span>Available</span></footer></article>`).join("")}</div>${filtered.length > 60 ? `<p class="catalog-note">Showing 60 of ${filtered.length} matches. Refine the search to narrow the live registry.</p>` : ""}`;
}

function operationalMemorySurface(feedless = false) {
  const summary = state.data.operational?.shared_memory || { fact_count: 0, scopes: {} };
  const entries = state.memories.map((memory) => `<article class="shared-memory-card"><header><span>${esc(titleCase(memory.scope_kind))} · ${esc(memory.scope_id)}</span><em>${esc(titleCase(memory.trust))} trust</em></header><h3>${esc(memory.title)}</h3><p>${esc(memory.body)}</p><footer><span>${esc(titleCase(memory.created_by))}</span><time>${new Date(memory.updated_at).toLocaleString()}</time></footer></article>`).join("");
  return `<div class="operational-memory-grid"><form class="memory-compose workspace-card" data-memory-form><div class="compose-title"><div><p class="eyebrow">AGIOS shared store</p><h3>Add durable knowledge</h3></div>${status(state.data.operational?.status || "unavailable")}</div><p>This is the real cross-agent memory layer. Saved facts become retrievable by every agent authorized for the selected scope.</p><label>Title<input name="title" required maxlength="160" placeholder="A concise, stable fact"/></label><label>Memory<textarea name="body" required maxlength="4000" placeholder="Record the verified knowledge, decision, or operating preference. Never include credentials."></textarea></label><div class="operational-options"><label>Scope<select name="scopeKind"><option value="portfolio">Portfolio · all agents</option><option value="business">Business</option><option value="department">Department</option><option value="project">Project</option><option value="private">Private agent</option></select></label><label>Scope ID<input name="scopeId" required maxlength="128" value="portfolio"/></label></div><div class="compose-submit"><span>${summary.fact_count} shared memories currently stored</span><button type="submit">Save to shared memory</button></div></form>${feedless ? "" : `<section class="shared-memory-feed"><div class="run-feed-heading"><div><p class="eyebrow">Authorized view · Default agent</p><h3>${state.memories.length} readable memories</h3></div><span>LIVE</span></div>${entries || `<div class="workspace-empty workspace-card"><b>✦</b><strong>The shared store is ready</strong><span>Add the first portfolio memory to make it available to all seven agents.</span></div>`}</section>`}</div>`;
}

function retrievalWorkbench() {
  const mode = state.data.operational?.retrieval?.mode || "scoped-lexical-v1";
  const hits = state.retrievalHits.map((hit) => `<article class="evidence-card"><header><code>${esc(hit.citation_id)}</code><span>${Math.round(Number(hit.score || 0) * 100)}% match</span></header><h3>${esc(hit.title)}</h3><p>${esc(hit.body)}</p><footer><span>${esc(titleCase(hit.scope_kind))} / ${esc(hit.scope_id)}</span><span>${esc(titleCase(hit.trust))} trust</span></footer></article>`).join("");
  const agents = state.data.agents.map((agent) => `<option value="${esc(agent.id)}">${esc(titleCase(agent.id))}</option>`).join("");
  return `<section class="retrieval-workbench"><form class="workspace-card retrieval-compose" data-retrieval-form><div><p class="eyebrow">RAG evidence console</p><h3>Search what an agent is allowed to know</h3><p>Mode: ${esc(mode)}. Results include provenance and citation IDs; no-match queries return no evidence.</p></div><div class="retrieval-fields"><label>Agent<select name="agentId">${agents}</select></label><label>Project scope<input name="projectId" maxlength="128" placeholder="Optional project ID"/></label><label>Evidence query<input name="query" required maxlength="8000" placeholder="What verified knowledge do we have about..."/></label><button type="submit">Retrieve evidence</button></div></form><div class="evidence-feed">${hits || `<div class="workspace-empty workspace-card"><b>RAG</b><strong>Evidence appears here</strong><span>Searches are local and restricted to the selected agent's authorized scopes.</span></div>`}</div></section>`;
}


function brainIcon() {
  return `<svg class="memory-brain-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 4.5A3.2 3.2 0 0 0 5.2 6.4c-.3 2.2 1.1 3.4-.2 5.2-1.2 1.7-.2 3.9 1.9 4.3 1.9.4 3.3-1 5.1-1.2"/><path d="M14.5 4.5A3.2 3.2 0 0 1 18.8 6.4c.3 2.2-1.1 3.4.2 5.2 1.2 1.7.2 3.9-1.9 4.3-1.9.4-3.3-1-5.1-1.2"/><path d="M12 4v15.5"/><path d="M9 19.5c.8-.6 1.6-.6 2.4 0M12 19.5c.8-.6 1.6-.6 2.4 0"/></svg>`;
}

function memoryPageHero() {
  const count = state.memories.length;
  return `<div class="memory-page-hero"><div><span class="memory-page-mark">◆</span><div><small>SELF · MEMORY</small><h1>Memory</h1><p>Search ${count} shared memor${count === 1 ? "y" : "ies"} + your vault.</p></div></div><div class="memory-page-actions"><button type="button" data-focus-search title="Focus the search field">Ctrl K · Command palette</button><span>LOCAL · STUDIO</span></div></div>`;
}

function memoryPanelTabs() {
  const recentCount = Math.min(12, state.memories.length);
  const tabs = [
    ["graph", "◉ Memory map"],
    ["recent", `◷ Recent ${recentCount}`],
    ["notes", "▤ Notes"],
    ["omi", "✦ Omi"],
  ];
  return `<div class="memory-mode-tabs">${tabs.map(([id, label]) => `<button class="${state.memoryTab === id ? "is-active" : ""}" data-memory-tab="${id}">${label}</button>`).join("")}</div>`;
}

function memoryRecentSurface() {
  const recent = [...state.memories].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)).slice(0, 12);
  const rows = recent.map((memory) => `<button class="memory-recent-row" data-memory-note="${esc(memory.memory_id)}"><span class="memory-recent-title">${esc(memory.title)}</span><span class="memory-recent-meta">${esc(titleCase(memory.scope_kind))} · ${esc(titleCase(memory.trust))} trust</span><time>${relativeTime(memory.updated_at)}</time></button>`).join("");
  return `<div class="memory-recent-list">${rows || `<div class="memory-vault-empty"><strong>No memories yet</strong><span>Save the first durable fact and it appears here.</span></div>`}</div>`;
}

function memoryOmiSurface() {
  const rows = state.memories.map((memory) => `<article class="memory-omi-row"><header><span>${esc(titleCase(memory.scope_kind))} / ${esc(memory.scope_id)}</span><em>${esc(titleCase(memory.trust))} trust</em></header><h3>${esc(memory.title)}</h3><p>${esc(memory.body)}</p><footer><span>by ${esc(titleCase(memory.created_by))}</span><time>${relativeTime(memory.updated_at)}</time></footer></article>`).join("");
  return `<div class="memory-omi-list"><p class="memory-omi-note">Open memory items readable by every authorized agent. ${state.memories.length} stored.</p>${rows}</div>`;
}

function memoryGalaxySurface() {
  const all = state.memories || [];
  const filtered = state.memoryGalaxyFilter === "all" ? all : all.filter((memory) => memory.scope_kind === state.memoryGalaxyFilter);
  const linkCount = filtered.reduce((total, memory) => total + filtered.filter((other) => other.memory_id !== memory.memory_id && other.scope_kind === memory.scope_kind).length, 0) / 2;
  const weekAgo = Date.now() - 7 * 86400000;
  const activeCount = filtered.filter((memory) => new Date(memory.updated_at || 0).getTime() >= weekAgo).length;
  const scopeKinds = ["portfolio", "business", "department", "project", "private"];
  const presentKinds = new Set(all.map((memory) => memory.scope_kind));
  const missingKinds = scopeKinds.filter((kind) => !presentKinds.has(kind)).length;
  const trustCounts = filtered.reduce((counts, memory) => {
    counts[memory.trust] = (counts[memory.trust] || 0) + 1;
    return counts;
  }, {});
  const trustSplit = `${trustCounts.high || 0}·${trustCounts.medium || 0}·${trustCounts.low || 0}`;
  const filters = [["all", "All", all.length], ...scopeKinds.map((kind) => [kind, titleCase(kind), all.filter((memory) => memory.scope_kind === kind).length])];
  return `<div class="memory-galaxy" aria-label="Memory galaxy - real durable facts as stars">
    <div class="memory-galaxy-controls">
      <div class="memory-galaxy-stats">
        <span><small>ACTIVE</small><strong>${activeCount}</strong></span>
        <span><small>ACTIVATED</small><strong>${filtered.length}</strong></span>
        <span><small>DATA SOURCE</small><strong>${presentKinds.size}</strong></span>
        <span><small>TRUST H·M·L</small><strong>${trustSplit}</strong></span>
        <span class="${missingKinds ? "is-missing" : ""}"><small>MISSING</small><strong>${missingKinds}</strong></span>
      </div>
      <div class="memory-galaxy-filters">${filters.map(([id, label, count]) => `<button class="${state.memoryGalaxyFilter === id ? "is-active" : ""} scope-${id}" data-memory-galaxy-filter="${id}"><i></i>${esc(label)} · ${count}</button>`).join("")}</div>
      <div class="memory-galaxy-legend"><span><i class="portfolio"></i>Portfolio</span><span><i class="business"></i>Business</span><span><i class="department"></i>Department</span><span><i class="project"></i>Project</span><span><i class="private"></i>Private</span></div>
    </div>
    <div id="memory-galaxy-canvas" class="memory-galaxy-canvas" aria-label="3D galaxy of shared memories">
      <div class="memory-galaxy-overlay"><strong>MEMORY MAP · LIVE DATA</strong><span>${filtered.length} real notes · ${linkCount} real links</span><p>drag to orbit 360° · scroll to zoom · click a note to read it · hover a note to light its links</p><p class="memory-galaxy-hint">✦ every node is a saved memory · every link is a shared scope · brighter = recently touched · motion only follows your interaction</p></div>
    </div>
  </div>`;
}


function renderSharedMemory() {
  const count = state.memories.length;
  const compose = state.memoryComposeOpen ? operationalMemorySurface(true) : "";
  const search = state.memorySearchOpen ? retrievalWorkbench() : "";
  if (!count) {
    page.innerHTML = `${memoryPageHero()}<section class="memory-panel"><header class="memory-panel-header"><span class="memory-panel-mark"></span>${brainIcon()}<h2>Memory — Obsidian Vault</h2><span class="memory-omi-pill">${count + state.runs.length} OMI · ${count} NOTES</span></header>${memoryPanelTabs()}<div class="memory-vault is-empty"><div class="memory-vault-empty-state"><h3>No memories yet</h3><p>Save the first durable fact and every authorized agent can read it.</p><button data-memory-toggle="compose">＋ Save first memory</button></div></div></section>${compose}${search}`;
    return;
  }
  let body = "";
  if (state.memoryTab === "recent") body = memoryRecentSurface();
  else if (state.memoryTab === "omi") body = memoryOmiSurface();
  else if (state.memoryTab === "graph") body = memoryGalaxySurface();
  else body = `<div class="memory-toolbar"><button data-memory-toggle="compose">＋ New memory</button><button data-memory-toggle="search">⌕ Search</button></div>${memoryVaultSurface()}`;
  page.innerHTML = `${memoryPageHero()}<section class="memory-panel"><header class="memory-panel-header"><span class="memory-panel-mark"></span>${brainIcon()}<h2>Memory — Obsidian Vault</h2><span class="memory-omi-pill">${count + state.runs.length} OMI · ${count} NOTES</span></header>${memoryPanelTabs()}${body}</section>${compose}${search}`;
  if (state.memoryTab === "graph") window.requestAnimationFrame(renderMemoryGalaxy);
}


function disposeMemoryGalaxy() {
  if (!state.memoryGalaxy) return;
  const galaxy = state.memoryGalaxy;
  cancelAnimationFrame(galaxy.frame);
  if (galaxy.resize) window.removeEventListener("resize", galaxy.resize);
  galaxy.controls?.dispose();
  galaxy.renderer?.dispose();
  galaxy.renderer?.domElement?.remove();
  galaxy.stars?.geometry?.dispose?.();
  galaxy.links?.geometry?.dispose?.();
  galaxy.dust?.geometry?.dispose?.();
  galaxy.dust?.material?.dispose?.();
  const flow = galaxy.flow?.();
  if (flow) {
    flow.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });
  }
  galaxy.labels?.forEach((label) => { label.material.map?.dispose?.(); label.material.dispose?.(); });
  state.memoryGalaxy = null;
}

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.32)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function renderMemoryGalaxy() {
  const host = document.querySelector("#memory-galaxy-canvas");
  if (!host) return;
  disposeMemoryGalaxy();
  const all = state.memories || [];
  const memories = state.memoryGalaxyFilter === "all" ? all : all.filter((memory) => memory.scope_kind === state.memoryGalaxyFilter);
  if (!memories.length) return;
  const width = Math.max(480, host.clientWidth || 800);
  const height = Math.max(440, host.clientHeight || 560);
  const newest = memories.reduce((latest, memory) => Math.max(latest, new Date(memory.updated_at || 0).getTime()), 0);
  const oldest = memories.reduce((oldest, memory) => Math.min(oldest, new Date(memory.updated_at || Date.now()).getTime()), Infinity);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 400);
  camera.position.set(0, 13, 27);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 6;
  controls.maxDistance = 80;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.3;
  // Unrestricted 360° orbit: no polar or azimuth clamps are applied.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scopeHue = { portfolio: 0.48, business: 0.11, department: 0.75, project: 0.55, private: 0.93 };
  const scopeTint = { portfolio: 0x9ad9c2, business: 0xd7a55d, department: 0x8f7ad0, project: 0x73c6cf, private: 0xc97fa0 };
  const starGeometry = new THREE.SphereGeometry(0.11, 14, 14);
  const starGroup = new THREE.Group();
  const glowMaterial = new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
  const recencyOf = (memory) => {
    const span = newest - oldest;
    const position = newest - new Date(memory.updated_at || oldest).getTime();
    return span > 0 ? 1 - position / span : 1;
  };
  const starMeshes = [];
  const nodeColors = new Map();
  memories.forEach((memory, index) => {
    const arm = index % 4;
    const angle = (index / memories.length) * Math.PI * 4.4 + arm * (Math.PI / 2);
    const radius = 2.4 + Math.pow(index / memories.length, 0.72) * 14;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.sin(angle * 2.1) + Math.cos(index * 1.7)) * 1.35;
    const recency = recencyOf(memory);
    const hue = scopeHue[memory.scope_kind] ?? 0.6;
    const color = new THREE.Color().setHSL(hue, 0.5 + recency * 0.35, 0.48 + recency * 0.48);
    nodeColors.set(memory.memory_id, color.clone());
    const mesh = new THREE.Mesh(starGeometry, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 + recency * 0.4 }));
    const baseScale = 0.8 + recency * 2.4;
    mesh.scale.setScalar(baseScale);
    mesh.position.set(x, y, z);
    mesh.userData = { memory, baseOpacity: 0.6 + recency * 0.4, baseScale, targetScale: baseScale };
    starGroup.add(mesh);
    starMeshes.push(mesh);
    const glow = new THREE.Sprite(glowMaterial.clone());
    glow.material.color.set(color);
    glow.material.opacity = 0.16 + recency * 0.4;
    const glowScale = (1.6 + recency * 4.4) * (0.8 + recency * 2.4);
    glow.scale.set(glowScale, glowScale, 1);
    glow.position.copy(mesh.position);
    glow.userData = { memory, baseOpacity: glow.material.opacity };
    starGroup.add(glow);
  });
  const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(1.9, 22, 22), new THREE.MeshBasicMaterial({ color: 0xbca7ff, transparent: true, opacity: 0.34 }));
  starGroup.add(coreGlow);
  scene.add(starGroup);
  const dustCount = 340;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 9 + Math.pow(Math.random(), 0.6) * 26;
    dustPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    dustPositions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius;
    dustPositions[i * 3 + 2] = Math.cos(phi) * radius;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
    color: 0x8f86c9,
    size: 0.055,
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  scene.add(dust);
  const pairs = [];
  for (let i = 0; i < memories.length; i += 1) {
    for (let j = i + 1; j < memories.length; j += 1) {
      if (memories[i].scope_kind === memories[j].scope_kind) pairs.push([memories[i], memories[j]]);
    }
  }
  if (pairs.length) {
    const nodePositions = new Map();
    starMeshes.forEach((mesh) => nodePositions.set(mesh.userData.memory.memory_id, mesh.position.clone()));
    const segments = [];
    const segmentColors = [];
    pairs.forEach(([a, b]) => {
      const pa = nodePositions.get(a.memory_id);
      const pb = nodePositions.get(b.memory_id);
      if (!pa || !pb) return;
      const ca = nodeColors.get(a.memory_id) || new THREE.Color(0x8f86c9);
      const cb = nodeColors.get(b.memory_id) || new THREE.Color(0x8f86c9);
      const middle = pa.clone().add(pb).multiplyScalar(0.5);
      middle.y += pa.distanceTo(pb) * 0.22;
      const curve = new THREE.QuadraticBezierCurve3(pa, middle, pb);
      const samples = curve.getPoints(22);
      for (let k = 0; k < samples.length - 1; k += 1) {
        segments.push(samples[k].x, samples[k].y, samples[k].z, samples[k + 1].x, samples[k + 1].y, samples[k + 1].z);
        segmentColors.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
      }
    });
    if (segments.length) {
      const linkGeometry = new THREE.BufferGeometry();
      linkGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(segments), 3));
      linkGeometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(segmentColors), 3));
      const links = new THREE.LineSegments(linkGeometry, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5 }));
      scene.add(links);
    }
  }
  const labelObjects = [];
  starMeshes.forEach((mesh) => {
    const memory = mesh.userData.memory;
    const text = memory.title.length > 24 ? `${memory.title.slice(0, 23)}…` : memory.title;
    const canvas = document.createElement("canvas");
    const font = "11px sans-serif";
    const probe = canvas.getContext("2d");
    probe.font = font;
    const textWidth = Math.ceil(probe.measureText(text).width);
    canvas.width = textWidth + 22;
    canvas.height = 30;
    const context = canvas.getContext("2d");
    context.font = font;
    const radius = 9;
    const w = canvas.width;
    const h = canvas.height;
    context.fillStyle = "rgba(13,15,24,.88)";
    context.beginPath();
    context.moveTo(radius, 0);
    context.lineTo(w - radius, 0);
    context.quadraticCurveTo(w, 0, w, radius);
    context.lineTo(w, h - radius);
    context.quadraticCurveTo(w, h, w - radius, h);
    context.lineTo(radius, h);
    context.quadraticCurveTo(0, h, 0, h - radius);
    context.lineTo(0, radius);
    context.quadraticCurveTo(0, 0, radius, 0);
    context.closePath();
    context.fill();
    context.fillStyle = "#d8d3ea";
    context.fillText(text, 11, 20);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
    sprite.scale.set(w / 52, h / 52, 1);
    sprite.position.copy(mesh.position).add(new THREE.Vector3(0, 1.15, 0));
    sprite.userData = { memory };
    scene.add(sprite);
    labelObjects.push(sprite);
  });
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let flowLines = null;
  const setHover = (hoveredMemory) => {
    starMeshes.forEach((mesh) => {
      const memory = mesh.userData.memory;
      const connected = hoveredMemory && (memory.memory_id === hoveredMemory.memory_id || memory.scope_kind === hoveredMemory.scope_kind);
      mesh.material.opacity = hoveredMemory && !connected ? 0.14 : mesh.userData.baseOpacity;
      mesh.userData.targetScale = hoveredMemory && memory.memory_id === hoveredMemory.memory_id ? mesh.userData.baseScale * 1.9 : mesh.userData.baseScale;
    });
    starGroup.children.forEach((child) => {
      if (!(child instanceof THREE.Sprite) || !child.userData?.memory) return;
      const memory = child.userData.memory;
      const connected = hoveredMemory && (memory.memory_id === hoveredMemory.memory_id || memory.scope_kind === hoveredMemory.scope_kind);
      child.material.opacity = hoveredMemory && !connected ? 0.08 : child.userData.baseOpacity;
    });
    if (flowLines) {
      scene.remove(flowLines);
      flowLines.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
      flowLines = null;
    }
    if (hoveredMemory && !reducedMotion) {
      const flowSegments = [];
      const hoveredMesh = starMeshes.find((mesh) => mesh.userData.memory.memory_id === hoveredMemory.memory_id);
      if (hoveredMesh) {
        starMeshes.forEach((mesh) => {
          if (mesh === hoveredMesh || mesh.userData.memory.scope_kind !== hoveredMemory.scope_kind) return;
          const start = mesh.position.clone().add(hoveredMesh.position.clone().sub(mesh.position).normalize().multiplyScalar(mesh.userData.baseScale * 0.9));
          const end = hoveredMesh.position.clone();
          flowSegments.push(start.x, start.y, start.z, end.x, end.y, end.z);
        });
      }
      if (flowSegments.length) {
        const flowGeometry = new THREE.BufferGeometry();
        flowGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(flowSegments), 3));
        const flowMaterial = new THREE.LineDashedMaterial({
          color: nodeColors.get(hoveredMemory.memory_id) || new THREE.Color(0xffffff),
          dashSize: 0.35,
          gapSize: 0.28,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        flowLines = new THREE.LineSegments(flowGeometry, flowMaterial);
        flowLines.computeLineDistances();
        scene.add(flowLines);
      }
    }
  };
  const move = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(starMeshes, false);
    const hit = hits.find((item) => item.object.userData?.memory);
    setHover(hit ? hit.object.userData.memory : null);
    renderer.domElement.style.cursor = hit ? "pointer" : "";
  };
  const pick = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(starMeshes, false);
    const hit = hits.find((item) => item.object.userData?.memory);
    if (hit) {
      const memory = hit.object.userData.memory;
      state.memoryNote = memory.memory_id;
      state.memoryTab = "notes";
      renderSharedMemory();
      return true;
    }
    return false;
  };
  renderer.domElement.addEventListener("click", pick);
  renderer.domElement.addEventListener("pointermove", move);
  renderer.domElement.addEventListener("dblclick", () => {
    if (reducedMotion) return;
    controls.autoRotate = !controls.autoRotate;
  });
  let frame = 0;
  const animate = () => {
    frame = requestAnimationFrame(animate);
    controls.update();
    if (!reducedMotion) starGroup.rotation.y += controls.autoRotate ? 0.0028 : 0;
    starMeshes.forEach((mesh) => {
      const current = mesh.scale.x;
      const target = mesh.userData.targetScale ?? mesh.userData.baseScale;
      const next = reducedMotion ? target : current + (target - current) * 0.16;
      mesh.scale.setScalar(next);
    });
    if (flowLines && !reducedMotion) flowLines.material.dashOffset -= 0.012;
    labelObjects.forEach((sprite) => { sprite.material.rotation = 0; });
    renderer.render(scene, camera);
  };
  animate();
  state.memoryGalaxy = { frame, controls, renderer, stars: starGroup, links: scene, labels: labelObjects, hovered: null, dust, flow: () => flowLines };
  const resize = () => {
    const w = host.clientWidth || width;
    const h = host.clientHeight || height;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", resize);
  state.memoryGalaxy.resize = resize;
}

function repositorySurface() {
  return `<div class="repository-grid">${state.data.repositories.map((repo) => `<article><header><span>▱</span>${status(repo.status)}</header><h3>${esc(repo.name)}</h3><p>${esc(titleCase(repo.visibility))} · owner ${esc(titleCase(repo.owner_agent_id))}</p><div class="boundary-note">Repository paths and customer contents stay server-side. External actions require explicit approval.</div></article>`).join("")}</div>`;
}

function renderRepositories() {
  page.innerHTML = `${heading("Repository fabric", "Every workspace can be operated without losing its boundary.", "AGIOS registers repositories and project workspaces for agents and systems, while customer paths and contents remain hidden from the browser.")}<div class="system-summary"><span><strong>${state.data.summary.repositories}</strong> registered repositories</span><span><strong>${state.workspaces.length}</strong> approved workspaces</span><span><strong>${state.data.summary.shared_skills}</strong> reusable skills</span></div>${workspaceRegistryCard()}${repositorySurface()}`;
}

async function loadLiveWork({ render = false } = {}) {
  try {
    const snapshot = await api("/api/v1/live-work");
    const current = liveMetricSnapshot(snapshot);
    const previous = state.liveMetrics;
    state.liveWork = snapshot;
    state.liveMetrics = current;
    state.changedLiveMetrics = previous
      ? Object.keys(current).filter((key) => current[key] !== previous[key])
      : [];
    if (render && state.view === "command") {
      renderCommand();
      window.requestAnimationFrame(animateLiveMetricChanges);
    }
  } catch {
    state.changedLiveMetrics = [];
    if (!state.liveWork) state.liveWork = { schema_version: 1, synthetic: false, sources: {}, improvements: [] };
  }
}

async function loadCosts() {
  try {
    state.costs = await api("/api/v1/costs");
  } catch {
    state.costs = null;
  }
}

function costSurface() {
  const snapshot = state.costs;
  if (!snapshot) return `<section class="panel cost-panel"><header class="panel-header"><div><h2>Live provider costs</h2><p>Vendor-reported balances and usage, refreshed on request</p></div><span>Unavailable</span></header><div class="workspace-empty"><strong>Cost adapter offline</strong><span>The local costs endpoint did not respond. Restart AGIOS and retry.</span></div></section>`;
  const rows = snapshot.providers.map((provider) => {
    const badge = provider.status === "reported" ? status("reported") : provider.status === "reported-empty" ? `<span class="status-dot status-warning"></span>` : status(provider.status);
    const figures = provider.status === "reported" && provider.usage_30d !== undefined
      ? `<div class="cost-figures"><strong>$${Number(provider.usage_30d).toFixed(2)}</strong><span>usage 30d</span>${provider.remaining !== undefined && provider.remaining !== null ? `<strong>$${Number(provider.remaining).toFixed(2)}</strong><span>remaining</span>` : ""}</div>` : "";
    return `<article class="cost-row"><header><div><strong>${esc(provider.label)}</strong><small>${esc(provider.reason || provider.note || provider.detail || "")}</small></div>${badge}</header>${figures}${provider.balances && provider.balances.length ? `<div class="cost-balances">${provider.balances.map((balance) => `<span><b>${esc(String(balance.currency || "?"))}</b> ${esc(String(balance.total_balance ?? "n/a"))} total${balance.granted_balance !== undefined ? ` · ${esc(String(balance.granted_balance))} granted` : ""}</span>`).join("")}</div>` : ""}</article>`;
  }).join("");
  return `<section class="panel cost-panel"><header class="panel-header"><div><h2>Live provider costs</h2><p>Read once from each provider API and cached for 5 minutes. Keys stay in the environment and never leave the machine.</p></div><span>${snapshot.total.reported ? `$${snapshot.total.reported_usage_usd.toFixed(2)} reported` : "nothing reported yet"}</span></header><div class="cost-list">${rows}</div><footer class="cost-honesty">${esc(snapshot.total.note)} · Updated ${new Date(snapshot.generated_at).toLocaleTimeString()}</footer></section>`;
}

function renderPerformance() {
  const runs = runsForPeriod();
  const completed = runs.filter((run) => run.status === "completed");
  const failed = runs.filter((run) => ["failed", "interrupted"].includes(run.status));
  const active = runs.filter((run) => ["queued", "running"].includes(run.status));
  const decided = completed.length + failed.length;
  const successRate = decided ? Math.round(completed.length / decided * 100) : null;
  const durations = completed.map((run) => {
    const start = new Date(run.started_at || run.created_at).valueOf();
    const end = new Date(run.completed_at).valueOf();
    return Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, end - start) : null;
  }).filter((value) => value !== null);
  const averageSeconds = durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length / 1000) : null;
  const byRoute = new Map();
  for (const run of runs) {
    const route = run.model || run.provider || run.runtime_id || "profile default";
    const current = byRoute.get(route) || { total: 0, completed: 0, failed: 0 };
    current.total += 1;
    if (run.status === "completed") current.completed += 1;
    if (["failed", "interrupted"].includes(run.status)) current.failed += 1;
    byRoute.set(route, current);
  }
  const routeRows = [...byRoute.entries()].sort((a, b) => b[1].total - a[1].total).map(([route, counts]) => `<div class="data-row columns-integrations"><div><strong>${esc(route)}</strong><p>Observed AGIOS runs</p></div><span>${counts.total}</span><span>${counts.completed} completed</span><span>${counts.failed} failed</span></div>`).join("");
  const recent = runs.slice(0, 12).map((run) => `<div class="data-row columns-integrations"><div><strong>${esc(run.objective.slice(0, 72))}</strong><p>${new Date(run.created_at).toLocaleString()}</p></div><span>${esc(titleCase(run.agent_id))}</span><span>${status(run.status)}</span><span>${esc(run.model || run.provider || run.runtime_id)}</span></div>`).join("");
  page.innerHTML = `${heading("Performance", "Measured work, not agent theatre.", "Run metrics use real AGIOS records; provider costs below are vendor-reported and never guessed.", periodControl())}
    ${costSurface()}
    <section class="signal-grid" aria-label="Runtime performance signals">
      ${signalCard("Runs", runs.length, `${active.length} active · ${runs.filter((run) => run.status === "awaiting_approval").length} awaiting approval`, "coral", [20, 28, 35, 32, 46, 51, 48, 63, 68, 74, 82, 90])}
      ${signalCard("Verified completion", successRate === null ? "Unavailable" : `${successRate}%`, `${completed.length} completed · ${failed.length} failed`, "mint", [22, 29, 38, 45, 52, 58, 66, 70, 76, 81, 86, 92])}
      ${signalCard("Average completion", averageSeconds === null ? "Unavailable" : `${averageSeconds}s`, "completed AGIOS runtime sessions", "violet", [75, 70, 66, 61, 57, 51, 45, 39, 34, 28, 22, 18])}
    </section>
    <section class="panel"><header class="panel-header"><div><h2>Route evidence</h2><p>Real outcomes grouped by the selected model or runtime route</p></div><span>${byRoute.size} observed</span></header><div class="data-panel"><div class="data-head columns-integrations"><span>Route</span><span>Runs</span><span>Completed</span><span>Failed</span></div>${routeRows || `<div class="workspace-empty"><strong>No route evidence in this period</strong><span>Complete a chat or approved goal to establish the first measurement.</span></div>`}</div></section>
    <section class="panel"><header class="panel-header"><div><h2>Recent runtime evidence</h2><p>Requests, status and selected route from the private AGIOS session store</p></div><button data-view-link="artifacts">Open artifacts →</button></header><div class="data-panel"><div class="data-head columns-integrations"><span>Run</span><span>Agent</span><span>Status</span><span>Route</span></div>${recent || `<div class="workspace-empty"><strong>No runs in this period</strong></div>`}</div></section>`;
}

function renderSettings() {
  page.innerHTML = `${heading("System settings", "Policies before power.", "See whether the complete Agent OS foundation is present and which boundaries remain non-negotiable.")}${osReadinessSurface()}<div class="settings-grid"><section class="workspace-card"><p class="eyebrow">OPERATING PRINCIPLE</p><h2>One studio, not one unrestricted super-agent.</h2><p>AGIOS connects every approved model, CLI, MCP, application, repository, skill, memory, schedule, and artifact while retaining the authority boundary of each route.</p><div class="policy-row"><span>Agents improve from verified work</span><em>Proposal only</em></div><div class="policy-row"><span>New specialist roles</span><em>Distinct recurring job</em></div><div class="policy-row"><span>Unused workers</span><em>Ready, no token use</em></div></section><section class="workspace-card"><p class="eyebrow">NON-NEGOTIABLE</p><h2>Human judgment remains part of the OS.</h2><div class="policy-row"><span>Publishing, outreach, delivery, and deployment</span><em>Exact approval</em></div><div class="policy-row"><span>Purchases and financial actions</span><em>Transaction approval</em></div><div class="policy-row"><span>Skill or code self-modification</span><em>Review and validation</em></div><div class="policy-row"><span>Customer/private data fallback</span><em>No downgrade</em></div></section></div>`;
}

function renderMesh() {
  const nodes = (state.data.mesh || []);
  const agents = nodes.filter((node) => node.kind === "agent");
  const systems = nodes.filter((node) => node.kind === "system");
  const cards = nodes.map((node, index) => {
    const collaboration = node.collaboration || {};
    const badges = [
      collaboration.a2a ? "A2A" : null,
      collaboration.shared_memory ? "Memory" : null,
      collaboration.shared_skills ? "Skills" : null,
    ].filter(Boolean);
    const stateLabel = esc(String(node.state || "planned"));
    return `<article class="mesh-card mesh-${index % 6}"><header><span class="mesh-glyph">${esc(initials(node.name || node.id))}</span>${status(node.state)}</header><h3>${esc(node.name || titleCase(node.id))}</h3><small>${esc(node.kind)} · ${esc(node.id)}${node.provider ? ` · ${esc(node.provider)}` : ""}</small><p>${esc(node.description || node.biography || "")}</p><div class="mesh-capabilities">${(node.capabilities || []).slice(0, 5).map((cap) => `<span>${esc(cap)}</span>`).join("")}</div><footer><div class="mesh-badges">${badges.map((badge) => `<span class="is-on">${badge}</span>`).join("") || `<span>isolated</span>`}</div><em>${esc(stateLabel)}</em></footer></article>`;
  }).join("");
  page.innerHTML = `${heading("Agent Mesh", "Every AI in your operating system, one registry.", "Hermes specialists, Codex, OpenClaw, Gemini, Claude and future runtimes share one governance contract. Each node shows what it can do, what it shares, and whether it can collaborate through the local A2A gateway.")}<div class="mesh-summary"><span><strong>${agents.length}</strong> specialist agents</span><span><strong>${systems.length}</strong> AI systems</span><span><strong>${nodes.filter((node) => node.collaboration?.a2a).length}</strong> A2A-ready</span><span><strong>${nodes.filter((node) => node.collaboration?.shared_memory).length}</strong> shared memory</span></div><div class="mesh-grid">${cards}</div><section class="mesh-note"><p class="eyebrow">COLLABORATION CONTRACT</p><h3>Agents work together when needed — never silently.</h3><p>The local A2A gateway lets agents exchange governed tasks. Shared memory and skills are scoped by business and data class. No agent can wake another, spend tokens, or reach an external system without an exact owner-approved route.</p></section>`;
}

function renderFuture(view) {
  const copy = {
    knowledge: ["Knowledge fabric", "Evidence, memory and context—available where useful, contained where sensitive.", "AGIOS now provides live, business-scoped shared memory for authorized agents. Provenance, retention controls and richer retrieval remain planned without exposing raw private content to the browser."],
    performance: ["Performance", "Measure outcomes, cost and revenue—not agent theatre.", "The evidence layer will connect model spend, work completion, quality gates, pipeline and business results. Missing cost data will remain unavailable, never shown as zero."],
  }[view];
  page.innerHTML = `${heading(copy[0], copy[1], copy[2])}<div class="empty-stage"><div class="seal">◇</div><h2>Operational boundary established</h2><p>The supervised Hermes adapter and shared memory are live. This surface remains staged until its controls can preserve the same local authentication, exact approval and audit guarantees.</p><div class="foundation-roadmap"><span>Foundation</span><span>Memory & events</span><span>Business control</span><span>Bounded autonomy</span></div></div>`;
}

const surfaceSession = { surfaceId: null, term: null, fit: null, socket: null, resizeObserver: null };

function disposeSurfaceSession() {
  const session = surfaceSession;
  if (session.resizeObserver) {
    session.resizeObserver.disconnect();
    session.resizeObserver = null;
  }
  if (session.socket) {
    try {
      session.socket.close();
    } catch {
      /* already closed */
    }
    session.socket = null;
  }
  if (session.term) {
    try {
      session.term.dispose();
    } catch {
      /* terminal already disposed */
    }
    session.term = null;
    session.fit = null;
  }
  session.surfaceId = null;
}

function ensureSurfaceTerminal() {
  if (surfaceSession.term) return surfaceSession;
  const term = new Terminal({
    cursorBlink: true,
    convertEol: true,
    scrollback: 4000,
    fontFamily: '"Cascadia Mono", Consolas, monospace',
    fontSize: 13,
    theme: {
      background: "#0a0f0d",
      foreground: "#d8e8e1",
      cursor: "#65e1ad",
      selectionBackground: "rgba(101, 225, 173, 0.28)",
    },
  });
  const fit = new FitAddon();
  term.loadAddon(fit);
  term.loadAddon(new WebLinksAddon());
  surfaceSession.term = term;
  surfaceSession.fit = fit;
  return surfaceSession;
}

function connectSurfaceTerminal(container, surfaceId) {
  const session = ensureSurfaceTerminal();
  session.term.open(container);
  session.fit.fit();
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(`${protocol}//${location.host}/ws/shell/${encodeURIComponent(surfaceId)}`);
  session.socket = socket;
  session.surfaceId = surfaceId;
  const sendSize = () => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "resize", cols: session.term.cols, rows: session.term.rows }));
    }
  };
  session.term.onData((data) => {
    if (socket.readyState === WebSocket.OPEN) socket.send(data);
  });
  socket.onmessage = (event) => {
    if (typeof event.data === "string") {
      session.term.write(event.data);
    } else {
      session.term.write(new TextDecoder().decode(event.data));
    }
  };
  socket.onopen = sendSize;
  socket.onclose = () => {
    session.term.write("\r\n[session closed — reopen the tab to restart]\r\n");
  };
  const observer = new ResizeObserver(() => {
    try {
      session.fit.fit();
      sendSize();
    } catch {
      /* container detached */
    }
  });
  observer.observe(container);
  session.resizeObserver = observer;
  window.addEventListener("resize", sendSize);
  session._resizeHandler = sendSize;
  session.term.focus();
}

function surfaceStatusLabel(status) {
  return (
    {
      live: "Live",
      available: "Ready",
      unreachable: "Offline",
      missing: "Not installed",
      unknown: "Checking",
    }[status] || status
  );
}

async function refreshSurfaceProbes() {
  try {
    const payload = await api("/api/v1/surfaces");
    state.surfaceProbes = Object.fromEntries(
      (payload.items || []).map((item) => [item.id, item]),
    );
  } catch {
    state.surfaceProbes = {};
  }
}

async function launchSurface(surfaceId) {
  try {
    await api(`/api/v1/surfaces/${encodeURIComponent(surfaceId)}/launch`, { method: "POST" });
    showToast("Launch requested");
    await refreshSurfaceProbes();
  } catch (error) {
    showToast(`Launch failed: ${error.message}`);
  }
  renderSurfaces();
}

function renderSurfaceContent(surface) {
  const probe = state.surfaceProbes[surface.id] || {};
  const statusValue = probe.status || "unknown";
  if (surface.kind === "web") {
    return `<div class="surface-frame-wrap"><iframe class="surface-frame" title="${esc(surface.name)}" src="${esc(surface.url)}" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"></iframe></div>`;
  }
  if (surface.kind === "terminal") {
    return `<div class="surface-terminal" data-surface-terminal="${esc(surface.id)}"><div class="surface-terminal-note"><strong>${statusValue === "available" ? "Live terminal attached" : "Terminal binary not found"}</strong><span>This is the real ${esc(surface.name)} process through a local PTY — same shell, same session.</span></div></div>`;
  }
  return `<div class="surface-native-card"><span class="surface-native-glyph">▸</span><strong>${esc(surface.name)}</strong><p>Native application. AGIOS can launch it; its window opens outside the command center.</p><button class="surface-launch" data-surface-launch="${esc(surface.id)}">Launch ${esc(surface.name)}</button></div>`;
}

function renderSurfaces() {
  disposeSurfaceSession();
  const surfaces = state.surfaces;
  if (!surfaces.length) {
    page.innerHTML = `${heading("Live Apps", "Real applications, one window.", "Registered runtime surfaces appear here once the AGIOS registry declares them.")}<div class="empty-stage"><div class="seal">◇</div><h2>No surfaces registered</h2><p>Add web, terminal, or native surfaces to configs/agios.json and restart AGIOS.</p></div>`;
    return;
  }
  const active = state.activeSurface && surfaces.some((surface) => surface.id === state.activeSurface) ? state.activeSurface : surfaces[0].id;
  state.activeSurface = active;
  const activeSurface = surfaces.find((surface) => surface.id === active);
  const tabs = surfaces
    .map((surface) => {
      const probe = state.surfaceProbes[surface.id] || {};
      return `<button class="surface-tab ${surface.id === active ? "is-active" : ""}" data-surface-tab="${esc(surface.id)}"><span class="surface-tab-glyph">${surface.kind === "web" ? "▣" : surface.kind === "terminal" ? ">_" : "▸"}</span>${esc(surface.name)}<i class="surface-tab-status is-${esc(probe.status || "unknown")}"></i></button>`;
    })
    .join("");
  const probe = state.surfaceProbes[active] || {};
  const actions =
    activeSurface.kind === "terminal"
      ? `<button class="surface-launch compact" data-surface-restart="${esc(active)}">Reconnect</button>`
      : `<button class="surface-launch compact" data-surface-open="${esc(active)}">Open in browser ↗</button>${activeSurface.launch ? `<button class="surface-launch compact" data-surface-launch="${esc(active)}">Start ${esc(activeSurface.name)}</button>` : ""}`;
  page.innerHTML = `${heading("Live Apps", "The real application inside the OS.", "Web surfaces embed the actual local panel; terminal surfaces attach a live PTY to the real CLI — the same window, same session, same shell as the original tool.", actions)}<nav class="surface-tabs" aria-label="Runtime surfaces">${tabs}</nav><div class="surface-stage">${renderSurfaceContent(activeSurface)}</div><footer class="surface-footer"><span>${esc(surfaceStatusLabel(probe.status || "unknown"))}</span><span>Loopback only · registry-declared · never a sandbox imitation</span></footer>`;
  if (activeSurface.kind === "terminal") {
    const container = page.querySelector("[data-surface-terminal]");
    if (container) {
      container.classList.add("is-live");
      window.setTimeout(() => connectSurfaceTerminal(container, activeSurface.id), 0);
    }
  }
}

function hermesWebSurface() {
  return `<div class="surface-frame-wrap"><iframe class="surface-frame" title="Hermes" src="http://127.0.0.1:9119" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"></iframe></div><footer class="surface-footer"><span>Embedded in AGIOS</span><span>Hermes dashboard · loopback</span></footer>`;
}

function terminalSurfaceForSystem(systemId) {
  const map = { hermes: "hermes-cli", codex: "codex-cli", opencode: "opencode-cli" };
  const surfaceId = map[systemId];
  if (!surfaceId) return null;
  return state.surfaces.find((surface) => surface.id === surfaceId) || null;
}

function systemTerminalSurface(surface) {
  const probe = state.surfaceProbes[surface.id] || {};
  const statusValue = probe.status || "unknown";
  return `<section class="surface-stage system-terminal-stage">${renderSurfaceContent(surface)}</section><footer class="surface-footer"><span>${esc(surfaceStatusLabel(statusValue))}</span><span>Real ${esc(surface.name)} process · local PTY · loopback only</span></footer>`;
}

const renderers = { command: renderCommand, guide: renderGuide, portfolio: renderPortfolio, departments: renderDepartments, agents: renderAgents, agent: renderAgent, mesh: renderMesh, systems: renderSystems, system: renderSystem, memory: renderSharedMemory, skills: renderSharedSkills, repositories: renderRepositories, work: renderWork, artifacts: renderArtifacts, paperclip: renderPaperclip, approvals: renderApprovals, automations: renderAutomations, integrations: renderIntegrations, network: renderAgentNetwork, performance: renderPerformance, settings: renderSettings, surfaces: renderSurfaces };

function motionAllowed() {
  return typeof Element.prototype.animate === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animateViewEntry() {
  if (!motionAllowed() || !page.firstElementChild) return;
  page.firstElementChild.animate(
    [{ opacity: .72, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }],
    { duration: 120, easing: "cubic-bezier(.2,.8,.2,1)" },
  );
}

function animateLiveMetricChanges() {
  if (!motionAllowed()) return;
  for (const key of state.changedLiveMetrics) {
    const target = page.querySelector(`[data-live-key="${CSS.escape(key)}"]`);
    if (!target) continue;
    target.animate(
      [
        { opacity: .72, transform: "translateY(3px)", boxShadow: "0 0 0 1px rgba(224,162,83,.42)" },
        { opacity: 1, transform: "translateY(0)", boxShadow: "0 0 0 1px rgba(224,162,83,0)" },
      ],
      { duration: 160, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }
}

function setView(view) {
  if (!state.data || !viewLabels[view]) return;
  state.view = view;
  viewName.textContent = viewLabels[view];
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.view === view));
  if (view !== "surfaces" && view !== "system") disposeSurfaceSession();
  if (view !== "memory") disposeMemoryGalaxy();
  if (view !== "command") {
    state.executionSpineCleanup?.();
    state.executionSpineCleanup = null;
  }
  if (view === "performance" && !state.costs) void loadCosts().then(() => state.view === "performance" && renderPerformance());
  (renderers[view] || (() => renderFuture(view)))();
  const advanced = document.querySelector(".advanced-nav");
  if (advanced && ["portfolio", "departments", "agents", "skills", "repositories", "automations", "paperclip", "network", "performance", "settings"].includes(view)) advanced.open = true;
  renderAgentNavigation();
  renderSystemNavigation();
  history.replaceState(null, "", view === "command" ? "/" : `/${view}`);
  sidebar.classList.remove("is-open");
  window.scrollTo({ top: 0, behavior: "auto" });
  window.requestAnimationFrame(animateViewEntry);
  window.setTimeout(() => void loadOperationalSurface(), 0);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function openModal() {
  const businessSelect = document.querySelector("#directive-business");
  const agentSelect = document.querySelector("#directive-agent");
  businessSelect.innerHTML = state.data.businesses.map((item) => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("");
  agentSelect.innerHTML = state.data.agents.map((item) => `<option value="${esc(item.id)}">${esc(item.name || titleCase(item.id))} · ${esc(item.profession || titleCase(item.role))}</option>`).join("");
  agentSelect.innerHTML = `<option value="default">Ari Vale · Chief of Staff decides</option>`;
  modal.hidden = false;
  modal.querySelector("textarea").focus();
}

function closeModal() { modal.hidden = true; }

function routeSystemAction(button) {
  const system = state.data.systems.find((item) => item.id === button.dataset.routeSystemId);
  if (!system) return;
  const action = button.dataset.routeSystemAction;
  const model = routedModelForSystem(system);
  const preferredDataClass = model?.allowed_data_classes?.includes("internal") ? "internal" : "public";
  if (action === "workspace") {
    state.selectedAgent = "builder";
    state.agentMode = "workspace";
    state.runtimePreferences.builder = ["codex", "deepseek"].includes(system.id) ? "codex" : "hermes";
    if (model) state.modelPreferences.builder = model.id;
    state.dataClassPreferences.builder = preferredDataClass;
    setView("agent");
    return;
  }
  state.selectedSystem = "hermes";
  state.systemMode = action === "goal" ? "goal" : "chat";
  if (model) state.modelPreferences.default = model.id;
  state.dataClassPreferences.default = preferredDataClass;
  setView("system");
}

function paletteItems(query = "") {
  const views = Object.entries(viewLabels).map(([id, name]) => ({ id, name, type: "View" }));
  const businesses = (state.data?.businesses || []).map((item) => ({ id: "portfolio", name: item.name, type: "Business" }));
  return [...views, ...businesses].filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 9);
}

function renderPalette() {
  paletteResults.innerHTML = `<div class="palette-results">${paletteItems(paletteInput.value).map((item) => `<button class="palette-item" data-palette-view="${esc(item.id)}"><span>${esc(item.name)}</span><small>${item.type}</small></button>`).join("")}</div>`;
}

function openPalette() { palette.hidden = false; paletteInput.value = ""; renderPalette(); paletteInput.focus(); }
function closePalette() { palette.hidden = true; }

function operationalAgentId() {
  if (state.view === "agent") return state.selectedAgent;
  if (state.view === "system" && state.selectedSystem === "hermes") {
    if (["oracle", "astros"].includes(state.systemMode)) return "researcher";
    if (state.systemMode === "outreach") return "manager";
    if (state.systemMode === "workspace") return "builder";
    return "default";
  }
  return null;
}

function rerenderOperationalView() {
  document.querySelector("#approval-count").textContent = state.orchestrationPlans.filter((plan) => plan.status === "planned").length + state.runs.filter((run) => run.status === "awaiting_approval").length + state.skillProposals.filter((item) => item.status === "awaiting_owner_review").length;
  if (state.view === "agent") renderAgent();
  else if (state.view === "system") renderSystem();
  else if (state.view === "memory") renderSharedMemory();
  else if (state.view === "approvals") renderApprovals();
  else if (state.view === "work") renderWork();
  else if (state.view === "artifacts") renderArtifacts();
  else if (state.view === "skills") renderSharedSkills();
  else if (state.view === "repositories") renderRepositories();
  else if (state.view === "command") renderCommand();
  else if (state.view === "network") renderAgentNetwork();
  else if (state.view === "integrations") renderIntegrations();
}

async function loadOperationalSurface() {
  if (!state.data?.operational || state.operationalLoading) return;
  const needsRuns = ["command", "approvals", "work", "artifacts", "memory", "performance"].includes(state.view) || (state.view === "agent" && ["chat", "goal", "workspace", "growth", "sessions"].includes(state.agentMode)) || (state.view === "system" && (["sessions"].includes(state.systemMode) || (state.selectedSystem === "hermes" && ["chat", "apollo", "oracle", "astros", "outreach", "mixture", "workspace", "control", "goal"].includes(state.systemMode))));
  const needsMemory = state.view === "memory";
  const needsVision = ["artifacts", "memory"].includes(state.view);
  const needsA2A = state.view === "network";
  const needsGrowth = ["command", "approvals", "skills"].includes(state.view) || (state.view === "agent" && state.agentMode === "growth");
  const needsWorkspaces = ["command", "approvals", "work", "repositories"].includes(state.view) || (state.view === "agent" && state.agentMode === "workspace");
  const needsRuntimes = ["command", "approvals", "systems", "system"].includes(state.view) || (state.view === "agent" && state.agentMode === "workspace");
  const needsPlans = ["command", "approvals"].includes(state.view);
  const needsNotebookLM = state.view === "integrations";
  if (!needsRuns && !needsMemory && !needsVision && !needsA2A && !needsGrowth && !needsWorkspaces && !needsRuntimes && !needsPlans && !needsNotebookLM) return;
  state.operationalLoading = true;
  try {
    if (needsRuns) {
      const agentId = operationalAgentId();
      const payload = await api(`/api/v1/hermes/runs${agentId ? `?agent_id=${encodeURIComponent(agentId)}` : ""}`);
      state.runs = payload.items || [];
    }
    if (needsPlans) {
      const payload = await api("/api/v1/orchestrator/plans");
      state.orchestrationPlans = payload.items || [];
    }
    if (needsMemory) {
      const payload = await api("/api/v1/memory?agent_id=default");
      state.memories = payload.items || [];
      if (payload.summary && state.data.operational) state.data.operational.shared_memory = payload.summary;
    }
    if (needsVision) {
      const payload = await api("/api/v1/vision/assets");
      state.visionAssets = payload.items || [];
    }
    if (needsA2A) {
      const payload = await api("/api/v1/a2a/tasks");
      state.a2aTasks = payload.items || [];
      if (payload.summary && state.data.operational) state.data.operational.a2a = payload.summary;
    }
    if (needsGrowth) {
      const payload = await api("/api/v1/agents/growth/proposals");
      state.skillProposals = payload.items || [];
    }
    if (needsWorkspaces) {
      const payload = await api("/api/v1/workspaces");
      state.workspaces = payload.items || [];
    }
    if (needsRuntimes) {
      const payload = await api("/api/v1/runtimes");
      state.runtimeAdapters = payload.items || [];
    }
    if (needsNotebookLM) {
      state.notebooklm = await api("/api/v1/notebooklm/sources");
      state.imageStudio = await api("/api/v1/image-studio");
    }
    const bannerDetail = document.querySelector("#ops-banner-detail");
    if (bannerDetail) bannerDetail.textContent = `${state.data.summary.agents} workers · ${state.data.operational?.shared_memory?.fact_count ?? 0} shared memories · ${state.data.summary.systems} AI systems`;
    rerenderOperationalView();
    if (state.view === "work" && state.selectedWorkRunId) {
      const selected = state.runs.find((run) => run.run_id === state.selectedWorkRunId);
      if (selected && (["queued", "running"].includes(selected.status) || !Object.hasOwn(state.runTraces, selected.run_id))) void loadWorkRunTrace(selected.run_id);
    }
  } catch (error) {
    showToast(error.message);
  } finally {
    state.operationalLoading = false;
  }
}

async function approveRun(button) {
  button.disabled = true;
  try {
    await api(`/api/v1/hermes/runs/${encodeURIComponent(button.dataset.approveRun)}/approve`, {
      method: "POST",
      body: JSON.stringify({ approval_digest: button.dataset.approvalDigest }),
    });
    showToast("Exact goal approved · Hermes is starting");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}

async function cancelRun(button) {
  button.disabled = true;
  try {
    await api(`/api/v1/hermes/runs/${encodeURIComponent(button.dataset.cancelRun)}/cancel`, {
      method: "POST",
    });
    showToast("Prepared run canceled");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}

async function cancelA2ATask(button) {
  button.disabled = true;
  try {
    const payload = await api("/a2a/v1", {
      method: "POST",
      headers: { "A2A-Version": "1.0" },
      body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method: "CancelTask", params: { id: button.dataset.a2aCancel } }),
    });
    if (payload.error) throw new Error(payload.error.message || "A2A cancellation failed");
    showToast("A2A task canceled before approval");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}

async function approveSkillProposal(button) {
  button.disabled = true;
  try {
    await api(`/api/v1/agents/growth/proposals/${encodeURIComponent(button.dataset.approveSkill)}/approve`, { method: "POST", body: "{}" });
    showToast("Skill authoring approved · installation still requires validation");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}

async function validateSkillProposal(button) {
  button.disabled = true;
  try {
    const payload = await api(`/api/v1/agents/growth/proposals/${encodeURIComponent(button.dataset.validateSkill)}/validate`, { method: "POST", body: "{}" });
    showToast(payload.proposal.validation?.passed ? "Skill validation passed · owner may install" : "Skill needs revision before installation");
    await loadOperationalSurface();
  } catch (error) { showToast(error.message); button.disabled = false; }
}

async function installSkillProposal(button) {
  button.disabled = true;
  try {
    await api(`/api/v1/agents/growth/proposals/${encodeURIComponent(button.dataset.installSkill)}/install`, { method: "POST", body: JSON.stringify({ draft_digest: button.dataset.draftDigest }) });
    showToast("Shared skill installed · available to authorized agents");
    await loadOperationalSurface();
  } catch (error) { showToast(error.message); button.disabled = false; }
}

async function dispatchOrchestrationPlan(form) {
  const button = form.querySelector("button[type=submit]");
  const values = new FormData(form);
  if (button) button.disabled = true;
  try {
    const payload = await api(`/api/v1/orchestrator/plans/${encodeURIComponent(form.dataset.planId)}/dispatch`, {
      method: "POST",
      body: JSON.stringify({
        plan_digest: form.dataset.planDigest,
        workspace_id: values.get("workspaceId") || null,
        runtime_id: values.get("runtimeId") || "hermes",
      }),
    });
    state.orchestrationPlans = [payload.plan, ...state.orchestrationPlans.filter((item) => item.plan_id !== payload.plan.plan_id)];
    state.runs = [payload.run, ...state.runs.filter((item) => item.run_id !== payload.run.run_id)];
    renderCommand();
    showToast("Ari's route is bound · exact approval is waiting");
  } catch (error) {
    showToast(error.message);
    if (button) button.disabled = false;
  }
}

function blobDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function toggleVoiceCapture(button) {
  if (state.recorder?.state === "recording") {
    state.recorder.stop();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
    const mimeType = candidates.find((item) => MediaRecorder.isTypeSupported(item)) || "";
    const chunks = [];
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    state.recorder = recorder;
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      window.clearTimeout(state.voiceTimer);
      stream.getTracks().forEach((track) => track.stop());
      button.classList.remove("is-recording");
      button.innerHTML = "<span>●</span> Push to talk";
      try {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const payload = await api("/api/v1/voice/transcribe", { method: "POST", body: JSON.stringify({ data_url: await blobDataUrl(blob), mime_type: blob.type || "audio/webm" }) });
        const textarea = button.closest("form")?.querySelector("textarea[name=objective]");
        if (textarea && payload.transcript) textarea.value = [textarea.value.trim(), payload.transcript].filter(Boolean).join(" ");
        showToast(payload.transcript ? "Voice transcribed · review before sending" : "No speech detected");
      } catch (error) { showToast(error.message); }
      state.recorder = null;
    };
    recorder.start();
    button.classList.add("is-recording");
    button.innerHTML = "<span>■</span> Stop recording";
    state.voiceTimer = window.setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 60000);
  } catch (error) {
    showToast(error.name === "NotAllowedError" ? "Microphone permission was not granted" : "Microphone could not start");
  }
}

function toggleWakeWord() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) { showToast("Wake-word recognition is unavailable in this browser"); return; }
  if (state.wakeRecognition && state.wakeArmed) {
    state.wakeArmed = false;
    state.wakeRecognition.stop();
    state.wakeRecognition = null;
    renderSystem();
    showToast("Hey Hermes is off");
    return;
  }
  const recognition = new Recognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results).slice(event.resultIndex).map((result) => result[0]?.transcript || "").join(" ").trim();
    const match = transcript.match(/hey\s+hermes[,.]?\s*(.*)/i);
    if (!match) return;
    const textarea = document.querySelector("[data-chief-form] textarea[name=objective], [data-run-form] textarea[name=objective]");
    if (textarea) {
      textarea.focus();
      if (match[1]) textarea.value = [textarea.value.trim(), match[1]].filter(Boolean).join(" ");
    }
    showToast(match[1] ? "Hermes heard you · review before sending" : "Hermes is listening");
  };
  recognition.onerror = (event) => {
    if (event.error !== "no-speech") showToast(`Voice wake stopped · ${event.error}`);
  };
  recognition.onend = () => {
    if (!state.wakeArmed) return;
    state.wakeArmed = false;
    state.wakeRecognition = null;
    if (state.view === "system" && state.selectedSystem === "hermes") renderSystem();
  };
  try {
    state.wakeRecognition = recognition;
    state.wakeArmed = true;
    recognition.start();
    renderSystem();
    showToast("Hey Hermes is armed");
  } catch {
    state.wakeRecognition = null;
    state.wakeArmed = false;
    showToast("Wake-word microphone could not start");
  }
}

async function speakRun(button) {
  const run = state.runs.find((item) => item.run_id === button.dataset.speakRun);
  if (!run?.response) return;
  button.disabled = true;
  try {
    const payload = await api("/api/v1/voice/synthesize", { method: "POST", body: JSON.stringify({ text: run.response.slice(0, 4000) }) });
    await new Audio(payload.audio_data_url).play();
  } catch (error) { showToast(error.message); }
  finally { button.disabled = false; }
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-view]");
  const link = event.target.closest("[data-view-link]");
  const business = event.target.closest("[data-business]");
  const result = event.target.closest("[data-palette-view]");
  const agent = event.target.closest("[data-agent]");
  const agentMode = event.target.closest("[data-agent-mode]");
  const period = event.target.closest("[data-period]");
  const directive = event.target.closest("[data-open-directive]");
  const system = event.target.closest("[data-system]");
  const systemMode = event.target.closest("[data-system-mode]");
  const skillCategory = event.target.closest("[data-skill-category]");
  const runApproval = event.target.closest("[data-approve-run]");
  const runCancel = event.target.closest("[data-cancel-run]");
  const a2aCancel = event.target.closest("[data-a2a-cancel]");
  const skillApproval = event.target.closest("[data-approve-skill]");
  const skillValidation = event.target.closest("[data-validate-skill]");
  const skillInstall = event.target.closest("[data-install-skill]");
  const voiceRecord = event.target.closest("[data-voice-record]");
  const wakeToggle = event.target.closest("[data-wake-toggle]");
  const studioMode = event.target.closest("[data-studio-mode]");
  const studioToggle = event.target.closest("[data-toggle-studio]");
  const speak = event.target.closest("[data-speak-run]");
  const routedAction = event.target.closest("[data-route-system-action]");
  const osMapLayer = event.target.closest("[data-os-map-layer]");
  const surfaceTab = event.target.closest("[data-surface-tab]");
  const surfaceLaunch = event.target.closest("[data-surface-launch]");
  const surfaceRestart = event.target.closest("[data-surface-restart]");
  const surfaceOpen = event.target.closest("[data-surface-open]");
  const workRun = event.target.closest("[data-work-run]");
  const workRunClose = event.target.closest("[data-work-run-close]");
  const notebookOpen = event.target.closest("[data-notebooklm-open]");
  const costLoad = event.target.closest("[data-cost-load]");
  if (nav) setView(nav.dataset.view);
  if (link) setView(link.dataset.viewLink);
  if (business) setView("portfolio");
  if (result) { setView(result.dataset.paletteView); closePalette(); }
  if (agent) { state.selectedAgent = agent.dataset.agent; state.agentMode = "overview"; setView("agent"); }
  if (agentMode) { state.agentMode = agentMode.dataset.agentMode; renderAgent(); window.setTimeout(() => void loadOperationalSurface(), 0); }
  if (period) { state.period = period.dataset.period; state.view === "performance" ? renderPerformance() : renderCommand(); }
  if (workRun) {
    state.selectedWorkRunId = workRun.dataset.workRun;
    renderWork();
    void loadWorkRunTrace(state.selectedWorkRunId);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
  if (workRunClose) { state.selectedWorkRunId = null; renderWork(); }
  if (notebookOpen) window.open("https://notebooklm.google.com/", "_blank", "noopener");
  if (costLoad) {
    costLoad.disabled = true;
    costLoad.textContent = "Loading live balance…";
    void loadCosts().then(() => {
      if (state.view === "system") renderSystem();
      else if (state.view === "performance") renderPerformance();
    });
  }
  if (directive) openModal();
  if (system) { state.selectedSystem = system.dataset.system; const sid = system.dataset.system; state.systemMode = terminalSurfaceForSystem(sid) ? "terminal" : "overview"; setView("system"); }
  if (systemMode) { state.systemMode = systemMode.dataset.systemMode; renderSystem(); window.setTimeout(() => void loadOperationalSurface(), 0); }
  if (studioMode) { state.systemMode = studioMode.dataset.studioMode; renderSystem(); window.setTimeout(() => void loadOperationalSurface(), 0); }
  if (studioToggle) { const id = studioToggle.dataset.toggleStudio; state.hiddenStudios[id] = !state.hiddenStudios[id]; saveLocalObject("agios.hiddenStudios", state.hiddenStudios); renderSystem(); }
  if (skillCategory) { state.skillCategory = skillCategory.dataset.skillCategory; renderSharedSkills(); }
  if (runApproval) void approveRun(runApproval);
  if (runCancel) void cancelRun(runCancel);
  if (a2aCancel) void cancelA2ATask(a2aCancel);
  if (skillApproval) void approveSkillProposal(skillApproval);
  if (skillValidation) void validateSkillProposal(skillValidation);
  if (skillInstall) void installSkillProposal(skillInstall);
  if (voiceRecord) void toggleVoiceCapture(voiceRecord);
  if (wakeToggle) void toggleWakeWord();
  if (speak) void speakRun(speak);
  const gauntletLaunch = event.target.closest("[data-gauntlet-run]");
  if (gauntletLaunch) void launchGauntlet(gauntletLaunch);
  if (routedAction) routeSystemAction(routedAction);
  if (osMapLayer) { state.osMapLayer = osMapLayer.dataset.osMapLayer; renderCommand(); }
  if (surfaceTab) { state.activeSurface = surfaceTab.dataset.surfaceTab; renderSurfaces(); }
  if (surfaceLaunch) void launchSurface(surfaceLaunch.dataset.surfaceLaunch);
  if (surfaceRestart) renderSurfaces();
  if (surfaceOpen) {
    const openSurface = state.surfaces.find((surface) => surface.id === surfaceOpen.dataset.surfaceOpen);
    if (openSurface && openSurface.url) window.open(openSurface.url, "_blank", "noopener");
  }
  const dreamingAccept = event.target.closest("[data-dreaming-accept]");
  const dreamingDismiss = event.target.closest("[data-dreaming-dismiss]");
  if (dreamingAccept) void acceptDreaming(dreamingAccept);
  if (dreamingDismiss) void dismissDreaming(dreamingDismiss);
  const memoryFolder = event.target.closest("[data-memory-folder]");
  const memoryNote = event.target.closest("[data-memory-note]");
  if (memoryFolder) { state.memoryFolder = memoryFolder.dataset.memoryFolder; state.memoryNote = null; renderSharedMemory(); }
  if (memoryNote) { state.memoryNote = memoryNote.dataset.memoryNote; renderSharedMemory(); }
  const memoryToggle = event.target.closest("[data-memory-toggle]");
  if (memoryToggle) {
    if (memoryToggle.dataset.memoryToggle === "compose") state.memoryComposeOpen = !state.memoryComposeOpen;
    if (memoryToggle.dataset.memoryToggle === "search") state.memorySearchOpen = !state.memorySearchOpen;
    renderSharedMemory();
  }
  const memoryTab = event.target.closest("[data-memory-tab]");
  if (memoryTab) { state.memoryTab = memoryTab.dataset.memoryTab; renderSharedMemory(); }
  const galaxyFilter = event.target.closest("[data-memory-galaxy-filter]");
  if (galaxyFilter) { state.memoryGalaxyFilter = galaxyFilter.dataset.memoryGalaxyFilter; renderSharedMemory(); }
  const learnForm = event.target.closest("[data-learn-form]");
  if (learnForm) void submitLearnForm(learnForm);
  if (event.target.matches("[data-close-modal]") || event.target === modal) closeModal();
  if (event.target === palette) closePalette();
});

document.addEventListener("submit", async (event) => {
  const chiefForm = event.target.closest("[data-chief-form]");
  const runForm = event.target.closest("[data-run-form]");
  const dispatchForm = event.target.closest("[data-dispatch-form]");
  const memoryForm = event.target.closest("[data-memory-form]");
  const retrievalForm = event.target.closest("[data-retrieval-form]");
  const a2aForm = event.target.closest("[data-a2a-form]");
  const skillProposalForm = event.target.closest("[data-skill-proposal-form]");
  const workspaceForm = event.target.closest("[data-workspace-form]");
  const skillDraftForm = event.target.closest("[data-skill-draft-form]");
  const modelPreferenceForm = event.target.closest("[data-model-preference-form]");
  const notebookForm = event.target.closest("[data-notebooklm-form]");
  const imageStudioForm = event.target.closest("[data-image-studio-form]");
  if (!chiefForm && !runForm && !dispatchForm && !memoryForm && !retrievalForm && !a2aForm && !skillProposalForm && !workspaceForm && !skillDraftForm && !modelPreferenceForm && !notebookForm && !imageStudioForm) return;
  event.preventDefault();
  const submit = event.target.querySelector("button[type=submit]");
  if (submit) submit.disabled = true;
  try {
    const values = new FormData(event.target);
    if (dispatchForm) {
      await dispatchOrchestrationPlan(dispatchForm);
    } else if (notebookForm) {
      const selected = values.getAll("sourcePath");
      if (!selected.length) throw new Error("Choose at least one approved source note");
      const payload = await api("/api/v1/notebooklm/packs", {
        method: "POST",
        body: JSON.stringify({
          title: values.get("title"),
          source_paths: selected,
          external_upload_acknowledged: values.get("externalUploadAcknowledged") === "on",
        }),
      });
      state.notebooklmPack = payload.pack;
      renderIntegrations();
      showToast("Local NotebookLM source pack prepared · nothing uploaded");
    } else if (imageStudioForm) {
      const payload = await api("/api/v1/image-studio/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: values.get("prompt"),
          aspect_ratio: values.get("aspectRatio") || "16:9",
        }),
      });
      state.imageStudio = { ...(state.imageStudio || {}), recent: [payload.record, ...((state.imageStudio || {}).recent || [])].slice(0, 12) };
      event.target.reset();
      renderIntegrations();
      showToast("Image generated · saved locally with SHA-256 provenance");
    } else if (chiefForm) {
      const payload = await api("/api/v1/orchestrator/plans", {
        method: "POST",
        body: JSON.stringify({
          objective: values.get("objective"),
          data_class: values.get("dataClass") || "internal",
          business_id: values.get("businessId") || null,
        }),
      });
      state.orchestrationPlans = [payload.plan, ...state.orchestrationPlans.filter((item) => item.plan_id !== payload.plan.plan_id)];
      event.target.reset();
      setView("approvals");
      showToast("Ari mapped the route · review it before dispatch");
    } else if (runForm?.hasAttribute("data-ari-router")) {
      const objective = values.get("objective");
      const payload = await api("/api/v1/orchestrator/route", {
        method: "POST",
        body: JSON.stringify({
          objective,
          data_class: values.get("dataClass") || "internal",
          business_id: null,
          intent: values.get("ariIntent") || "auto",
        }),
      });
      if (payload.decision.kind === "work") {
        state.orchestrationPlans = [payload.plan, ...state.orchestrationPlans.filter((item) => item.plan_id !== payload.plan.plan_id)];
        event.target.reset();
        setView("approvals");
        showToast(`Ari routed this to ${titleCase(payload.decision.execution_mode)} · review the plan`);
      } else {
        const skills = values.getAll("skill");
        if (skills.length > 3) throw new Error("Choose no more than 3 shared skills");
        const chatPayload = await api("/api/v1/hermes/runs", {
          method: "POST",
          body: JSON.stringify({
            mode: "chat",
            agent_id: "default",
            objective,
            data_class: values.get("dataClass") || "internal",
            project_id: values.get("projectId") || null,
            skill_ids: skills,
            memory_ids: [],
            model_id: values.get("modelId") || state.modelPreferences.default || null,
            runtime_id: "hermes",
            workspace_id: null,
            workspace_access: "none",
            vision_asset_ids: runForm.dataset.visionAssetId ? [runForm.dataset.visionAssetId] : [],
          }),
        });
        event.target.reset();
        delete runForm.dataset.visionAssetId;
        showToast(chatPayload.run.status === "awaiting_approval" ? "Direct answer prepared · exact approval required" : "Ari is answering directly");
      }
    } else if (runForm) {
      const skills = values.getAll("skill");
      if (skills.length > 3) throw new Error("Choose no more than 3 shared skills");
      const payload = await api("/api/v1/hermes/runs", {
        method: "POST",
        body: JSON.stringify({
          mode: runForm.dataset.runMode,
          agent_id: runForm.dataset.agentId,
          objective: values.get("objective"),
          data_class: values.get("dataClass"),
          project_id: values.get("projectId") || null,
          skill_ids: skills,
          memory_ids: [],
          model_id: values.get("modelId") || state.modelPreferences[runForm.dataset.agentId] || null,
          runtime_id: values.get("runtimeId") || "hermes",
          workspace_id: values.get("workspaceId") || null,
          workspace_access: values.get("workspaceAccess") || "none",
          vision_asset_ids: runForm.dataset.visionAssetId ? [runForm.dataset.visionAssetId] : [],
        }),
      });
      event.target.reset();
      delete runForm.dataset.visionAssetId;
      showToast(payload.run.status === "awaiting_approval" ? "Run prepared · exact approval required" : "AGIOS session started");
    } else if (modelPreferenceForm) {
      const agentId = modelPreferenceForm.dataset.agentId;
      const modelId = String(values.get("modelId") || "");
      if (modelId) state.modelPreferences[agentId] = modelId;
      else delete state.modelPreferences[agentId];
      saveLocalObject("agios.modelPreferences", state.modelPreferences);
      showToast(modelId ? `${titleCase(agentId)} now defaults to ${modelId}` : `${titleCase(agentId)} uses the Hermes profile default`);
    } else if (workspaceForm) {
      const payload = await api("/api/v1/workspaces", { method: "POST", body: JSON.stringify({ label: values.get("label"), root_path: values.get("rootPath"), data_class: values.get("dataClass"), write_allowed: values.get("writeAllowed") === "on" }) });
      state.workspaces = [payload.workspace, ...state.workspaces.filter((item) => item.workspace_id !== payload.workspace.workspace_id)];
      event.target.reset();
      if (state.view === "repositories") renderRepositories();
      showToast("Workspace boundary registered · path remains private");
    } else if (skillDraftForm) {
      await api(`/api/v1/agents/growth/proposals/${encodeURIComponent(skillDraftForm.dataset.proposalId)}/draft`, { method: "POST", body: JSON.stringify({ body: values.get("body") }) });
      showToast("Skill draft saved · validation required");
    } else if (memoryForm) {
      await api("/api/v1/memory", {
        method: "POST",
        body: JSON.stringify({
          scope_kind: values.get("scopeKind"),
          scope_id: values.get("scopeId"),
          title: values.get("title"),
          body: values.get("body"),
          created_by: "owner",
          trust: "medium",
        }),
      });
      event.target.reset();
      showToast("Shared memory saved · authorized agents can retrieve it now");
    } else if (retrievalForm) {
      const payload = await api("/api/v1/retrieval/query", {
        method: "POST",
        body: JSON.stringify({ agent_id: values.get("agentId"), project_id: values.get("projectId") || null, query: values.get("query"), limit: 8 }),
      });
      state.retrievalHits = payload.items || [];
      showToast(`${state.retrievalHits.length} authorized evidence records found`);
    } else if (skillProposalForm) {
      const completed = state.runs.filter((run) => run.agent_id === skillProposalForm.dataset.agentId && run.status === "completed").slice(0, 12).map((run) => run.run_id);
      const payload = await api(`/api/v1/agents/${encodeURIComponent(skillProposalForm.dataset.agentId)}/skill-proposals`, {
        method: "POST",
        body: JSON.stringify({ skill_name: values.get("skillName"), change_kind: values.get("changeKind"), rationale: values.get("rationale"), evidence_run_ids: completed }),
      });
      event.target.reset();
      showToast(payload.proposal.status === "awaiting_owner_review" ? "Skill proposal sent to owner review" : "Skill proposal saved · completed evidence is required");
    } else if (a2aForm) {
      const payload = await api("/a2a/v1", {
        method: "POST",
        headers: { "A2A-Version": "1.0" },
        body: JSON.stringify({
          jsonrpc: "2.0", id: crypto.randomUUID(), method: "SendMessage",
          params: { message: {
            role: "ROLE_USER", messageId: crypto.randomUUID(), parts: [{ text: values.get("objective") }],
            metadata: { skillId: values.get("skillId"), agentId: values.get("agentId"), dataClass: values.get("dataClass"), projectId: values.get("projectId") || null },
          } },
        }),
      });
      if (payload.error) throw new Error(payload.error.message || "A2A task failed");
      event.target.reset();
      showToast(payload.result.task.status.state === "TASK_STATE_AUTH_REQUIRED" ? "A2A plan created - exact approval required" : "A2A evidence task completed");
    }
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
    const studioError = document.querySelector("[data-image-studio-error]");
    if (studioError) {
      studioError.hidden = false;
      studioError.textContent = error.message;
    }
  } finally {
    if (submit) submit.disabled = false;
  }
});

document.querySelector("#new-directive").addEventListener("click", openModal);
document.querySelector("#all-systems").addEventListener("click", () => setView("systems"));
document.querySelector("#search-trigger").addEventListener("click", openPalette);
document.querySelector("#menu-button").addEventListener("click", () => sidebar.classList.add("is-open"));
document.querySelector("#sidebar-close").addEventListener("click", () => sidebar.classList.remove("is-open"));
paletteInput.addEventListener("input", renderPalette);
document.addEventListener("change", async (event) => {
  if (!event.target.matches("[data-vision-input]")) return;
  const input = event.target;
  const file = input.files?.[0];
  const form = input.closest("[data-run-form]");
  const note = form?.querySelector("[data-vision-state]");
  if (!file || !form) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
    showToast("Choose a PNG, JPEG or WebP image under 8 MB");
    input.value = "";
    return;
  }
  input.disabled = true;
  if (note) note.textContent = "Securing image locally…";
  try {
    const payload = await api("/api/v1/vision/assets", { method: "POST", body: JSON.stringify({ data_url: await blobDataUrl(file), mime_type: file.type, data_class: new FormData(form).get("dataClass") || "internal", retention: new FormData(form).get("visionRetention") || "session" }) });
    form.dataset.visionAssetId = payload.asset.asset_id;
    if (note) note.textContent = `${file.name} attached · review before sending`;
    showToast("Image secured locally · exact approval will be required");
  } catch (error) { showToast(error.message); if (note) note.textContent = "Image was not attached"; }
  finally { input.disabled = false; }
});
document.addEventListener("input", (event) => {
  if (event.target.matches("#skill-search")) {
    state.skillQuery = event.target.value;
    renderSharedSkills();
    const search = document.querySelector("#skill-search");
    if (search) { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }
  } else if (event.target.matches("#session-search")) {
    state.sessionQuery = event.target.value;
    renderSystem();
    const search = document.querySelector("#session-search");
    if (search) { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }
  }
});
document.querySelector("#directive-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);
  const submit = form.querySelector("button[type=submit]");
  submit.disabled = true;
  try {
    const outcome = String(values.get("outcome") || "").trim();
    const objective = outcome;
    const payload = await api("/api/v1/orchestrator/plans", {
      method: "POST",
      body: JSON.stringify({
        objective,
        data_class: values.get("dataClass") || "internal",
        business_id: values.get("business") || null,
      }),
    });
    form.reset();
    closeModal();
    state.orchestrationPlans = [payload.plan, ...state.orchestrationPlans.filter((item) => item.plan_id !== payload.plan.plan_id)];
    setView("approvals");
    showToast("Ari mapped the route · review it before dispatch");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
  } finally {
    submit.disabled = false;
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); palette.hidden ? openPalette() : closePalette(); }
  if (event.key === "Escape") { closeModal(); closePalette(); }
  if (!event.ctrlKey && !event.metaKey && !event.altKey && /^[1-4]$/.test(event.key) && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) setView(["command", "portfolio", "departments", "agents"][Number(event.key) - 1]);
});

function tick() {
  document.querySelector("#clock-time").textContent = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Yerevan" }).format(new Date());
}
tick(); window.setInterval(tick, 30000);
window.setInterval(() => {
  if (!document.activeElement?.closest?.("[data-chief-form], [data-run-form], [data-workspace-form], [data-skill-draft-form], [data-memory-form], [data-retrieval-form], [data-a2a-form]") && state.runs.some((run) => ["queued", "running"].includes(run.status))) { void loadOperationalSurface(); void loadDreaming(); }
}, 1600);
window.setInterval(() => {
  if (!document.hidden) void loadLiveWork({ render: state.view === "command" });
}, 10000);

async function loadLearning() {
  try {
    state.learned = await api("/api/v1/learn");
  } catch {
    state.learned = { summary: { documents: 0, indexed_chunks: 0 }, documents: [] };
  }
}

async function submitLearnForm(form) {
  const values = new FormData(form);
  const payload = {
    title: values.get("title"),
    source_name: values.get("sourceName") || "pasted",
    text: values.get("text"),
  };
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const result = await api("/api/v1/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    showToast(`Brain file built · ${result.doc.index.chunk_count} chunks indexed`);
    await loadLearning();
    if (state.view === "skills") renderSharedSkills();
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
}

async function launchGauntlet(button) {
  const runId = button.dataset.gauntletRun;
  button.disabled = true;
  try {
    const result = await api(`/api/v1/gauntlet/${encodeURIComponent(runId)}`, { method: "POST" });
    showToast(`Gauntlet created · three critics (brief, system, craft) await your approval`);
    await loadOperationalSurface();
    button.disabled = false;
    void result;
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}

async function loadDreaming() {
  try {
    state.dreaming = await api("/api/v1/dreaming");
  } catch {
    state.dreaming = null;
  }
  if (state.view === "command") renderCommand();
  if (state.view === "skills") renderSharedSkills();
}

async function acceptDreaming(button) {
  const id = button.dataset.dreamingAccept;
  const target = button.dataset.dreamingTarget;
  button.disabled = true;
  try {
    await api(`/api/v1/dreaming/${encodeURIComponent(id)}/accept`, { method: "POST" });
    showToast(target ? `Accepted · opening ${viewLabels[target] || target}` : "Recommendation accepted");
    await loadDreaming();
    if (state.view === "command") renderCommand();
    if (state.view === "skills") renderSharedSkills();
    if (target && viewLabels[target]) setView(target);
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}

async function dismissDreaming(button) {
  const id = button.dataset.dreamingDismiss;
  button.disabled = true;
  try {
    await api(`/api/v1/dreaming/${encodeURIComponent(id)}/dismiss`, { method: "POST" });
    await loadDreaming();
    if (state.view === "command") renderCommand();
    if (state.view === "skills") renderSharedSkills();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}

async function boot() {
  try {
    const response = await fetch("/api/v1/command-center", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("unavailable");
    state.data = await response.json();
    state.runtimeAdapters = state.data.operational?.runtime_adapters || [];
    try {
      const surfacesPayload = await api("/api/v1/surfaces");
      state.surfaces = surfacesPayload.items || [];
    } catch {
      state.surfaces = [];
    }
    await refreshSurfaceProbes();
    try { state.voice = await api("/api/v1/voice/capabilities"); } catch { state.voice = { status: "unavailable", input: { enabled: false }, output: { enabled: false } }; }
    await loadLiveWork();
    await loadDreaming();
    await loadLearning();
    void loadCosts();
    document.querySelector("#approval-count").textContent = state.data.summary.pending_approvals;
    const runtime = state.data.runtime;
    document.querySelector("#runtime-caption").textContent = runtime.gateway_running ? `${state.data.summary.available_agents} agents registered · gateway online` : `${state.data.summary.available_agents} agents registered · gateway standing by`;
    document.querySelector("#runtime-meter").style.width = `${Math.max(12, state.data.summary.available_agents / state.data.summary.agents * 100)}%`;
    const bannerDetail = document.querySelector("#ops-banner-detail");
    if (bannerDetail) bannerDetail.textContent = `${state.data.summary.agents} workers · ${state.data.operational?.shared_memory?.fact_count ?? 0} shared memories · ${state.data.summary.systems} AI systems`;
    const route = location.pathname.slice(1);
    setView(viewLabels[route] ? route : "command");
  } catch {
    page.innerHTML = `<div class="error-state"><p class="eyebrow">Local control plane</p><h1>AGIOS could not connect</h1><p>The interface is intact, but the local command service is unavailable. Restart AGIOS and this screen will reconnect without exposing runtime details.</p></div>`;
    document.querySelector("#runtime-caption").textContent = "Control plane unavailable";
  }
}

boot();
