<!-- tags: family=reference; type=architecture; topics=architecture,repo-map,contracts,deployment -->
> **Audience:** Contributors who need the current cross-repo technical map
> **Last updated:** 2026-04-02

# Vizij Cross-Repo Technical Architecture

This document is the maintained cross-repo technical architecture reference for Vizij.

Use it for:

- cross-repo system layers
- repo roles in the platform
- deployment and runtime architecture
- major contracts that cross repo boundaries

For source-of-truth boundaries, placement rules, and metadata conventions, use [REPO_GOVERNANCE.md](REPO_GOVERNANCE.md). For the human contributor entry point, use [README.md](../README.md).

## 1. Platform Layers

Vizij currently spans five interacting layers:

1. **Rust runtime layer (`vizij-rs`)** - runtime semantics, wasm bindings, fixtures, and registry export tooling.
2. **Web packages and apps layer (`vizij-web`)** - React/runtime packages, authoring surfaces, demos, standalone shell, and operator-control protocol surfaces.
3. **Assets layer (`vizij-assets`)** - binary meshes, rigs, and graph artifacts reused across demos, render flows, and public examples.
4. **Internal documentation layer (`vizij-docs`)** - maintained cross-repo technical references, program summaries, decisions, and operational policy.
5. **Public site layer (`vizij-ai.github.io`)** - Astro-based public docs, showcase, and routed public examples.

The platform contract still centers on Rust-defined runtime data and wasm packages. The web layer consumes those packages, the asset layer supplies reusable content, and the docs/site layers shape how the system is documented and delivered.

## 2. Repo Architecture Map

| Repo or surface | Architectural role | Key contracts or outputs |
| --- | --- | --- |
| `vizij-rs` | Engine-agnostic runtime core | `Value`, `Shape`, `TypedPath`, graph evaluation, animation sampling, orchestrator scheduling, wasm wrappers, fixtures |
| `vizij-web` | Application and integration layer | React runtime bindings, authoring flows, demos, standalone deployment shell, protocol integration surfaces |
| `vizij-docs` | Cross-repo reference and coordination layer | maintained architecture summaries, roadmap/program framing, decisions, known issues, release-note policy |
| `vizij-ai.github.io` | Public delivery layer | curated docs, guides, showcase content, public routing into examples |
| `vizij-assets` | Shared binary asset layer | meshes, rigs, graph artifacts, and sample assets consumed by demos and render/runtime flows |


## 3. `vizij-rs` Runtime Architecture

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
- Bevy adapters currently exist for API, animation, and node graph. There is no orchestrator Bevy crate in the current workspace.
- The npm wrappers under `vizij-rs/npm/@vizij/*` expose the wasm layer to the web stack.
- Shared helper packages such as `@vizij/value-json`, `@vizij/wasm-loader`, and `@vizij/test-fixtures` keep JSON, loader, and fixture behavior aligned across repos.

## 4. `vizij-web` Application Architecture

`vizij-web` contains published libraries, local support crates, creator/operator tooling, example apps, and standalone deployment surfaces.

### Packages

| Package | Role |
| --- | --- |
| `@vizij/animation-react` | React bindings for animation wasm |
| `@vizij/node-graph-react` | React bindings for graph wasm |
| `@vizij/orchestrator-react` | React orchestration provider and hooks |
| `@vizij/render` | Three.js renderer and related controllers |
| `@vizij/runtime-react` | Higher-level runtime provider that wires renderer and orchestration |
| `@vizij/utils` | Shared utility layer |
| `@vizij/node-graph-authoring` | Authoring and compiler helpers plus IR inspection tooling |
| `@vizij/minimal-demo-ui` | Shared UI and chrome for minimal demo apps |
| `@vizij/arora-types` | TypeScript protocol contract surface for standalone and control work |

### Local protocol crates inside `vizij-web/packages`

- `packages/arora-connection`
- `packages/arora-websocket`

These are current implementation surfaces even though they are not TypeScript workspace packages.

### Apps

| App | Role |
| --- | --- |
| `vizij-authoring` | Runtime-truthful authoring surface for rigs, bindings, pose workflows, and export |
| `demo-vizij-player` | Runtime-facing demo for orchestrated playback |
| `demo-animation-studio` | Animation-focused playground |
| `demo-graph-studio` | Graph authoring and editor demo |
| `minimal-demo-animation` | Minimal animation smoke surface |
| `minimal-demo-animation-graph` | Combined animation and graph sample |
| `minimal-demo-graph` | Minimal graph surface |
| `minimal-demo-orchestrator` | Minimal orchestrator surface |
| `tutorial-fullscreen-face` | Runtime tutorial example |
| `tutorial-agent-face` | Tutorial and demo surface with agent interaction |
| `vizij-showcase` | Shareable fullscreen showcase with runtime and voice features |
| `vizij-standalone` | Tauri-based standalone application surface |

## 5. Deployment Architecture

The current deployment architecture is intentionally broader than a single app shell.

- **Browser deployments** use the Rust wasm packages, npm wrappers, React runtime bindings, and renderer stack inside `vizij-web`.
- **`vizij-standalone`** packages the same runtime and operator-control architecture inside a Tauri shell for desktop-oriented deployment.
- **Operator/control architecture** currently spans `@vizij/arora-types` and the protocol-related crates under `vizij-web/packages/arora-*`.
- **Authoring-to-runtime export flows** connect `vizij-authoring` outputs to runtime/player/deployment surfaces rather than stopping at an isolated editor boundary.
- **Shared namespaces and multi-face runtime patterns** remain relevant architectural extension points for larger deployments, even though they are not required in every current surface.

## 6. Assets And Site Layers

### `vizij-assets`

`vizij-assets` is the shared binary asset layer for sample meshes, rigs, and graph artifacts reused across render, demo, tutorial, and showcase flows.

Architecturally, it matters because the public and internal runtime surfaces depend on reusable assets that are not defined in code alone.

### `vizij-ai.github.io`

`vizij-ai.github.io` is the active public site layer for Vizij.

Architecturally, it sits downstream of the internal reference layer and the demo/example surfaces:

- it curates public docs and showcase content,
- it routes readers into examples and deeper references,
- it is a delivery surface for the platform, not a substitute for runtime or authoring implementation docs.

## 7. Cross-Repo Contracts

The most important contracts that currently cross repo boundaries are:

- `Value`, `Shape`, `TypedPath`, and related JSON helpers
- wasm ABI and loader behavior
- fixture manifests and shared sample assets
- runtime bundle and export semantics used by authoring, demos, tutorials, showcase, and deployment surfaces
- protocol types and runtime path conventions used by standalone and operator-control surfaces

These contracts should be described once at the architecture layer and then linked to lower-level repo-local implementation detail as needed.

## 8. Where To Look Next

- `vizij-docs/current_documentation/ROADMAP.md`
- `vizij-docs/current_documentation/DECISIONS.md`
- `vizij-rs/README.md`
- `vizij-web/README.md`
- `vizij-web/apps/vizij-authoring/docs/README.md`
