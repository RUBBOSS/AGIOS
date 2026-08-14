# AGIOS Signal Room Design System

## Product idea

AGIOS is a supervised operating system for one owner, not a generic analytics dashboard. The visual system should make the owner's next judgment obvious while keeping the underlying runtime, evidence, memory, and safety boundaries inspectable.

## Signature element

The **Execution Spine** connects six persisted stages:

1. Intent
2. Route
3. Approve
4. Runtime
5. Evidence
6. Learn

Counts come from real AGIOS state. A stage may highlight only when its corresponding state is current. The visualization must never invent activity or loop while idle.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Void | `#07080B` | Main canvas |
| Carbon | `#0E1116` | Primary surfaces |
| Carbon Raised | `#141820` | Controls and nested surfaces |
| Frost | `#F4F6F1` | Primary text |
| Frost Soft | `#C5CBC3` | Supporting text |
| Muted | `#7F8983` | Metadata |
| Signal | `#D7FF5B` | Owner action and current state |
| Ember | `#FF7356` | Destructive or critical state |
| Cyan | `#65D8FF` | Active runtime state |
| Success | `#8BE8A2` | Verified completion |
| Warning | `#FFBE5C` | Approval or attention |

Signal is the primary product accent. Semantic status colors may appear only when they communicate actual state.

## Typography

- Display: `Segoe UI Variable Display`
- Interface: `Segoe UI Variable Text`
- Metadata: `Cascadia Code`
- Display headings use tight tracking and high contrast.
- Operational metadata stays small but never becomes the primary explanation.
- Long objectives are clamped in overview cards and remain fully available in their detail surface.

## Geometry

- Sidebar: 232 px desktop; drawer below 900 px.
- Top bar: 78 px.
- Primary cards: 18 px radius.
- Hero: 28 px radius.
- Controls: 10 px radius.
- Borders, not shadows, separate most surfaces.
- One page may contain one dominant hero; supporting cards must not compete with it.

## Motion

Motion is state feedback, not decoration.

- Navigation entry: 120 ms opacity/translation.
- Persisted metric change: 160-180 ms highlight.
- Hover lift: at most 2 px.
- No ambient particles, pulses, drifting canvases, rotating graphs, or idle loops.
- Active runtime motion is allowed only while a real run is queued or running.
- `prefers-reduced-motion` disables all nonessential transitions.

## Core surfaces

### Home

Owner judgment first, Execution Spine second, live source matrix third. Every number must trace to AGIOS, Hermes, Codex, or OpenCode metadata. Missing sources are shown as unavailable, never synthesized.

### Work

A real four-lane board: inbox, approval, building, review/done. Cards show bounded objectives and status without exposing private paths.

### Approvals

Decision dossiers show objective, department, lead, model, data class, capabilities, cost note, workspace, and runtime before any action. Blocked actions must look blocked.

### Evidence

Run outputs and private input metadata are separated. A completed response is reviewable evidence, not automatic proof of correctness.

### Memory

A plain owner-controlled vault: folder scopes, note list, and readable note pane. No decorative graph is part of the normal Memory workflow.

### Systems

Readiness is factual: installed, authenticated, bounded, blocked, held, or planned. Registry presence never implies connectivity.

## Accessibility

- Focus rings use the Signal token with a 3 px offset.
- Interactive targets are at least 38 px tall, normally 42-48 px.
- Text and status never rely on color alone.
- The shell has a skip link and a mobile navigation drawer.
- At 430 px the document must have no horizontal overflow.
