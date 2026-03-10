# Vizij Architecture & Documentation Guide
<!-- tags: type=architecture; status=living; topics=architecture,repo-map,documentation -->

> **Status**: Living document
> **Audience**: Contributors who need the current cross-repo map
> **Last updated**: 2026-03-10

## 1. Purpose

This is the canonical internal map of Vizij's current repo boundaries, major runtime surfaces, and documentation authority model.

Read this document as the cross-repo summary, not the lowest-level implementation guide. When details matter, verify the current code surface from workspace manifests and repo-local README files, then follow the linked local docs.

## 2. Two Simultaneous Views

Vizij now needs to be documented through two views at once:

### A. Current public / golden-path view

This is the near-term outward-facing story for external builders:

`website -> Hello Face -> vizij-authoring -> demo-vizij-player -> tutorial-agent-face -> deployment`

This is the view that should dominate public guides, onboarding, and roadmap framing.

### B. Deeper platform view

This is the structural system view behind that path:

1. `vizij-rs` defines runtime semantics, wasm interfaces, and fixture contracts.
2. `vizij-web` composes those contracts into authoring, runtime, tutorial, showcase, and standalone surfaces.
3. `vizij-assets` carries the reusable binary meshes, rigs, and graph artifacts that make the public path demonstrable.

Internal docs must preserve both views. Public docs should lead with view A and reveal view B deliberately.

## 3. Documentation Authority by Surface

| Surface | Canonical for | Notes |
| --- | --- | --- |
| `vizij-docs` | Internal architecture, roadmap framing, lifecycle status, decisions, known issues, release-note policy | Summary-up layer for the whole platform |
| `vizij-rs` / `vizij-web` local docs | Implementation detail, package/app/crate workflows, detailed execution tracking | May be more detailed than `vizij-docs`, but should not override cross-repo strategy |
| `vizij-ai.github.io` | Curated public front door, core guides, showcase content, external narrative | Public-facing, audience-shaped output with link-outs to deeper reference docs |
| `vizij-assets` | Binary source of truth for sample meshes, rigs, and graph assets | Narrative and provenance should live in docs, not in the asset repo alone |
| top-level `/docs` and `vizij-afternoon-workshop` | Transitional or historical material | Extract durable content, then move these packs toward archive rather than treating them as co-equal doc homes |

## 4. Repo Map

| Repo / Surface | Current role | Best entry points |
| --- | --- | --- |
| `vizij-rs` | Engine-agnostic Rust runtime cores, wasm bindings, npm wrappers, fixtures | `vizij-rs/README.md`, `vizij-rs/Cargo.toml`, crate READMEs under `crates/**`, `npm/@vizij/*` |
| `vizij-web` | TypeScript/React packages, demos, authoring surfaces, tutorial apps, standalone app, and protocol-related packages | `vizij-web/README.md`, `vizij-web/package.json`, `vizij-web/pnpm-workspace.yaml`, package/app READMEs |
| `vizij-docs` | Canonical internal documentation and project/program layer | `current_documentation/*`, `active_projects/*/summary.md`, `backlog/*` |
| `vizij-ai.github.io` | Active Semio Community / Vizij public site built with Astro and React | `vizij-ai.github.io/README.md`, `src/pages`, `src/content`, `docs/` |
| `vizij-assets` | Shared sample/source assets used by demos and render/runtime flows | asset folders under `vizij-assets/*` |
| top-level `/docs` | Workspace-local reports, plans, and tutorial drafts | Transitional input into the canonical docs flow |
| `vizij-afternoon-workshop` | Historical or event-pack workshop materials | Transitional until unified into the maintained tutorial/workshop pipeline |

## 5. System Overview

Vizij is currently organized around three core technical layers and two documentation layers:

1. **Rust runtime layer (`vizij-rs`)** — canonical runtime semantics, wasm bindings, shared fixtures, and support packages.
2. **Web tooling and app layer (`vizij-web`)** — React/runtime packages, authoring app, tutorials, demos, showcase, and standalone application work.
3. **Assets layer (`vizij-assets`)** — binary meshes, rigs, and graph artifacts reused across demos and tutorials.
4. **Internal documentation layer (`vizij-docs`)** — cross-repo architecture, priorities, status, and operating rules.
5. **Curated public documentation layer (`vizij-ai.github.io`)** — outward-facing tutorials, docs, and examples.

The cross-repo contract still runs through Rust-defined runtime data structures and wasm packages. The web layer consumes those packages and adds authoring, rendering, standalone, and tutorial surfaces on top.

## 6. Current External Delivery Surfaces

The current public-facing delivery surfaces should be read in this order:

1. **`vizij-ai.github.io`** — public discovery, demos, project framing, and core guides.
2. **`tutorial-fullscreen-face`** — first practical runtime success path.
3. **`vizij-authoring`** — import, inspect, rig, and bundled export.
4. **`demo-vizij-player`** — animation, orchestrator blending, and runtime integration.
5. **`tutorial-agent-face`** — live conversation, gaze, and viseme-rich extension.
6. **deployment references** — browser runtime and `vizij-standalone`.

These are not equal-weight demos. Together they define the maintained outward-facing system for this phase.

`vizij-showcase` remains important as a shareable reference/demo surface, but not as the first onboarding step.

## 7. `vizij-rs` Current Architecture

### Runtime stacks

`vizij-rs` currently contains these primary workspace crates:

- **API stack**
  - `vizij-api-core`
  - `vizij-api-wasm`
  - `bevy_vizij_api`
- **Animation stack**
  - `vizij-animation-core`
  - `vizij-animation-wasm`
  - `bevy_vizij_animation`
- **Node graph stack**
  - `vizij-graph-core`
  - `vizij-graph-wasm`
  - `bevy_vizij_graph`
  - `vizij-graph-registry-export`
- **Orchestrator stack**
  - `vizij-orchestrator-core`
  - `vizij-orchestrator-wasm`
- **Shared fixtures**
  - `vizij-test-fixtures`

### Current architecture notes

- Rust remains the runtime source of truth for `Value`, `Shape`, `TypedPath`, graph evaluation, animation sampling, and orchestrator scheduling.
- Bevy adapters currently exist for API, animation, and node graph. There is **no** orchestrator Bevy crate in the current workspace.
- The npm wrappers under `vizij-rs/npm/@vizij/*` expose the wasm layer to the web stack.
- Shared helper packages such as `@vizij/value-json`, `@vizij/wasm-loader`, and `@vizij/test-fixtures` keep JSON/loader/fixture behavior consistent across repos.

## 8. `vizij-web` Current Architecture

`vizij-web` is broader than the older repo summary docs implied. The current workspace includes published libraries, local-only helper packages, demo infrastructure, tutorials, and standalone-related surfaces.

### Packages

| Package | Role |
| --- | --- |
| `@vizij/animation-react` | React bindings for animation wasm |
| `@vizij/node-graph-react` | React bindings for graph wasm |
| `@vizij/orchestrator-react` | React orchestration provider/hooks |
| `@vizij/render` | Three.js renderer and related controllers |
| `@vizij/runtime-react` | Higher-level runtime provider that wires renderer + orchestration |
| `@vizij/utils` | Shared utility layer |
| `@vizij/node-graph-authoring` | Authoring/compiler helpers and IR inspection CLI |
| `@vizij/minimal-demo-ui` | Shared UI/chrome for minimal demo apps |
| `@vizij/arora-types` | TypeScript protocol contract surface for standalone/control work |

### Local protocol / standalone crates inside `vizij-web/packages`

- `packages/arora-connection`
- `packages/arora-websocket`

These are real current implementation surfaces even though they are not TypeScript workspace packages.

### Apps

| App | Role |
| --- | --- |
| `vizij-authoring` | Runtime-truthful authoring surface for rigs, bindings, pose workflows, and export |
| `demo-vizij-player` | Authoring/runtime-facing demo for orchestrated playback |
| `demo-animation-studio` | Animation-focused playground |
| `demo-graph-studio` | Graph authoring/editor demo |
| `minimal-demo-animation` | Minimal animation smoke surface |
| `minimal-demo-animation-graph` | Combined animation + graph sample |
| `minimal-demo-graph` | Minimal graph surface |
| `minimal-demo-orchestrator` | Minimal orchestrator surface |
| `tutorial-fullscreen-face` | Runtime tutorial example |
| `tutorial-agent-face` | Tutorial/demo surface with agent interaction |
| `vizij-showcase` | Shareable fullscreen showcase with runtime and voice features |
| `vizij-standalone` | Tauri-based standalone application surface |

### Transitional runtime surface

An additional `apps/vizij-ws-app` directory exists in the repo, but it is not part of the primary current pnpm app map or root app command set. Treat it as a still-normalizing implementation surface tied to the standalone/protocol work rather than as a first-class current app entry point.

## 9. Deployment and Operator View

The near-term deployment story is intentionally broader than a single app:

- **browser/runtime deployments** and **`vizij-standalone`** are both first-class references
- **multi-screen and operator-control workflows** are core to the deployment story
- **Arora / standalone protocol work** is part of the deploy branch, not a separate product story
- **namespacing and shared multi-face runtimes** remain important, but they are later follow-on work rather than current deployment prerequisites

## 10. Authoring and Runtime Detail Ownership

- `vizij-docs` owns the cross-repo summary of authoring and runtime status.
- `vizij-web/apps/vizij-authoring/docs/*` owns detailed authoring execution state, backlog detail, stage tracking, and local contracts.
- `vizij-rs` README and crate docs own detailed runtime/package implementation notes.
- Runtime/standalone work is currently spread across the `vizij-docs` runtime plan, `vizij-web` manifests, and the `arora-*` protocol surfaces.

## 11. Assets, Website, and Transitional Content

### `vizij-assets`

`vizij-assets` is the binary source of truth for shareable sample meshes and rig/graph assets.

Current visible inventory includes raw and rigged assets such as Hugo, Quori, and Tiago. The near-term roadmap, however, treats **Quori / Hugo / Toasty** as the intended canonical sample set for the maintained creator path. That mismatch is real and should be resolved explicitly rather than hand-waved in docs.

### `vizij-ai.github.io`

`vizij-ai.github.io` is already an active public site, even though older internal docs sometimes described the website as a future state. In this phase, it should be treated as:

- the public front door
- the showcase surface
- the home for evergreen core guides
- the router into deeper reference docs that still live elsewhere

### Transitional content

Top-level `/docs` and `vizij-afternoon-workshop` still hold useful planning and workshop material, but they should now be treated as extract-and-archive sources rather than long-term maintained tutorial destinations.

## 12. Cross-Repo Contracts

The most important technical contracts still cross repo boundaries through:

- `Value`, `Shape`, `TypedPath`, and related JSON helpers
- wasm ABI/version alignment and loader behavior
- fixture manifests and shareable sample assets
- runtime bundle/export semantics used by authoring, tutorials, demos, and showcase surfaces

Docs should describe these contracts once at the internal architecture layer and then link to repo-local implementation detail or public-facing examples as needed.

## 13. Documentation Flow

The intended flow is:

1. verify current implementation from code and repo-local docs
2. summarize cross-repo truth in `vizij-docs`
3. curate stable public-facing guides into `vizij-ai.github.io`

That means public docs are shaped outputs, not automatic mirrors of internal engineering docs.

## 14. Where to Look Next

- `vizij-docs/current_documentation/ROADMAP.md`
- `vizij-docs/current_documentation/DECISIONS.md`
- `vizij-rs/README.md`
- `vizij-web/README.md`
- `vizij-web/apps/vizij-authoring/docs/README.md`
