<!-- tags: family=reference; type=architecture; topics=architecture,repo-map,contracts,deployment -->
> **Audience:** Contributors who need the current cross-repo technical map
> **Last updated:** 2026-10-29

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

1. **Rust runtime layer (`vizij-rs`)** - runtime semantics, the Bevy view that draws every face, the native `vizij` app, wasm bindings, fixtures, and registry export tooling.
2. **Web packages and apps layer (`vizij-web`)** - the React packages over the runtime, the authoring app, the face apps and demos, and the standalone shell.
3. **Assets layer (`vizij-assets`)** - binary meshes, rigs, and graph artifacts reused across demos, render flows, and public examples.
4. **Internal documentation layer (`vizij-docs`)** - maintained cross-repo technical references, program summaries, decisions, and operational policy.
5. **Public site layer (`vizij-ai.github.io`)** - Astro-based public docs, showcase, and routed public examples.

The platform contract still centers on Rust-defined runtime data and wasm packages. The web layer consumes those packages, the asset layer supplies reusable content, and the docs/site layers shape how the system is documented and delivered.

## 2. Repo Architecture Map

| Repo or surface | Architectural role | Key contracts or outputs |
| --- | --- | --- |
| `vizij-rs` | Runtime core and the face's view | `Value`, `Shape`, `TypedPath`, the node-graph format and its loading onto Arora's behavior tree, the Arora device interop, the Bevy view, the `vizij` binary, wasm wrappers, fixtures |
| `vizij-web` | Application and integration layer | React runtime bindings, authoring flows, demos, standalone deployment shell |
| `vizij-docs` | Cross-repo reference and coordination layer | maintained architecture summaries, roadmap/program framing, decisions, known issues, release-note policy |
| `vizij-ai.github.io` | Public delivery layer | curated docs, guides, showcase content, public routing into examples |
| `vizij-assets` | Shared binary asset layer | meshes, rigs, graph artifacts, and sample assets consumed by demos and render/runtime flows |


## 3. `vizij-rs` Runtime Architecture

### Runtime stacks

`vizij-rs` contains these workspace crates:

- **The `vizij` crate**: a library plus the desktop binary ([README](https://github.com/vizij-ai/vizij-rs/blob/main/crates/vizij/README.md))
  - `view` — the Bevy renderer of a face from its GLB bytes, drawing the pose its device's rig HAL holds each frame
  - `face` — a GLB's bindings and bundle composed into one graph, folded with the rig HAL and the store into an Arora builder
  - `modules` — the host modules any device loads: Arora's animation module (`@arora/animation`, from `arora-animation-module`), the rest module (`reset`, `reset_keys`), the local Piper voice (feature)
  - `native` — the stand-alone device on a worker thread, with the bridges a build adds
  - `web` — the browser module behind `@vizij/runtime`, linked as a cdylib of its own by `vizij-wasm`
- **`vizij-wasm`**: the `vizij` crate's `web` module as a wasm-bindgen cdylib of its own, so the release profile's fat LTO applies to it; `@vizij/runtime` ships its build
- **API stack**
  - `vizij-api-core` — shapes, typed paths, records and enumerations, coercion, write batches and the graph-spec JSON forms; it re-exports the geometry types of arora-sdk's `arora-geometry` and the colour of `arora-graphics-types`
  - `vizij-api-wasm`
- **Node graph stack**
  - `vizij-graph-core` — the graph format (`GraphSpec`), the editor registry, the importer from a graph onto an Arora behavior tree, and `TreeRuntime`, which runs it; each node is a call of a function of arora-sdk's `arora-dataflow-nodes`
  - `vizij-graph-wasm` — `WasmGraph`, the editor's graph runtime behind `@vizij/node-graph`
  - `vizij-graph-registry-export`
- **Arora interop stack** (`crates/interop/`)
  - `vizij-arora` — Vizij↔Arora value identity (`vizij_api_core::Value` **is** `arora_types::value::Value`)
  - `vizij-arora-store` — a Vizij `Blackboard` as an Arora `DataStore`
  - `vizij-arora-hal` — a Vizij rig as an Arora HAL
  - `vizij-arora-behavior` — `ProcessingGraph`: a Vizij node graph as an Arora `BehaviorInterpreter`, run on `arora-behavior-tree`
  - `vizij-arora-host` — the composition shared by the native app and the browser module: the device behavior from a bundle's graphs, the program to autoplay, the neutral pose, the face standard and its profiles
  - `vizij-arora-tts` — the `say` module over the Vizij TTS provider, natively and in the browser
  - `vizij-piper` — the local Piper voice
  - `vizij-animation-artifact` — writes `arora-animation-module`'s module directory, the guest `@vizij/runtime`'s tests load
- **Tools**
  - `vizij-bundle` — inspect, unpack, pack and validate a face GLB's `VIZIJ_bundle`
  - `vizij-glb-migrate`
- **Shared fixtures**
  - `vizij-test-fixtures`

### Current architecture notes

- Rust remains the runtime source of truth for `Value`, `Shape` and `TypedPath`; a face's animations play in its device through Arora's animation module.
- **A node graph runs on Arora's behavior tree** (`arora-behavior-tree`). `vizij-graph-core` imports a graph's JSON as a tree whose nodes are calls of the functions of arora-sdk's `arora-dataflow-nodes` (the modules `@arora/dataflow`, `@arora/geometry` and `@arora/kinematics`). A device's graphs run the nodes its outputs read whose inputs, parameters or clock changed; the editor's `@vizij/node-graph` evaluates every node so it can report every port. The graph JSON format stays Vizij's.
- **Each Vizij face is an Arora device** whose behavior is its composed graphs (rig, pose driver, poses, standard adaptation) on a key/value store, with programs and skills running beside them as runs of its interpreter. Scheduling is the Arora step loop; cross-graph data flows through store paths. A face's keys live under its rig prefix, `rig/<faceId>/`.
- **The Bevy view draws every Vizij face.** In the browser, `@vizij/runtime` is one wasm module holding the view and, per face, the face's device: a page mounts one canvas and places each face in a rectangle of it. The desktop `vizij` binary runs the same composition natively, in a window. three.js draws no face; it remains only in `@vizij/render`'s GLB loader and exporter (section 4).
- Vizij and Arora share one runtime value type, so values cross the store boundary without translation; JS sees them as `ValueJSON`.
- The npm wrappers under `vizij-rs/npm/@vizij/*` expose the wasm layer to the web stack: `@vizij/runtime`, `@vizij/node-graph`, and the shared helpers `@vizij/value-json`, `@vizij/wasm-loader`, and `@vizij/test-fixtures`, which keep JSON, loader, and fixture behavior aligned across repos.

## 4. `vizij-web` Application Architecture

`vizij-web` contains published libraries, creator/operator tooling, example apps, and a standalone deployment surface. Its own [`ARCHITECTURE.md`](https://github.com/vizij-ai/vizij-web/blob/main/ARCHITECTURE.md) owns the detail.

### Packages

| Package | Role |
| --- | --- |
| `@vizij/render` | The page's canvas (`<VizijCanvas>`) and the face slot (`<Vizij>`, a `<div>` the canvas draws a face over) over `@vizij/runtime`'s Bevy view; the GLB loader, the headless exporter, and the world model the authoring app edits. `three` is used only by the loader and the exporter |
| `@vizij/runtime-react` | One face's lifecycle in React (`VizijRuntimeProvider`, the `VizijRuntimeFace` slot), the fan-out of its store changes, value hooks, and `useAnimateValue`; it hands out `@vizij/runtime`'s `Runtime` |
| `@vizij/utils` | Shared value types and rig helpers |
| `@vizij/node-graph-authoring` | Authoring and compiler helpers plus IR inspection tooling |
| `@vizij/node-graph-react` | React bindings for `@vizij/node-graph` |
| `@vizij/minimal-demo-ui` | Shared UI and chrome for the minimal graph demo |

`@vizij/runtime` is a peer dependency of `@vizij/render` and `@vizij/runtime-react`, so a page resolves one copy of it and therefore one wasm module.

### Protocol and bridge surfaces

A face the native `vizij` binary shows reaches clients outside it through the Arora bridges composed into that device: the published arora-sdk crates (`arora-bridge-ws`, `arora-bridge-ros2`) and the Semio Studio bridge client (`arora-studio-bridge-client`, from semio-ai/studio-bridge, through arora's `studio-bridge` feature). A bridge carries a device's keys as they are, and a client writes only the keys the device lists as writable. A face in a browser page has no bridge: the page drives it through `@vizij/runtime`. The Tauri shell of `vizij-standalone` composes the same kinds of bridge into a device of its own, which no face shows. Value serde crosses JS boundaries through `@vizij/value-json`.

### Apps

| App | Role |
| --- | --- |
| `vizij-authoring` | Runtime-truthful authoring surface for rigs, bindings, pose workflows, and export; its viewport draws on the Bevy view |
| `demo-vizij-player` | One face export, its rig, poses, animations and programs driven from panels |
| `demo-graph-studio` | Graph authoring and editor demo, with no face |
| `minimal-demo-graph` | Minimal graph surface, with no face |
| `tutorial-fullscreen-face` | The smallest React app driving a face |
| `tutorial-agent-face` | A face wired to a live agent |
| `vizij-showcase` | Five sections, a face each, on one canvas |
| `vizij-standalone` | The face page with a voice agent on `@vizij/runtime`, in a Tauri shell that runs a device of its own beside it |

## 5. Deployment Architecture

The current deployment architecture is intentionally broader than a single app shell.

- **Browser deployments** run the face apps on `@vizij/runtime`: one canvas per page, each face a device of its own drawn over its slot.
- **The `vizij` desktop binary** shows one face in a window, with the local WebSocket bridge and its control panel, `--ros2`, and `--studio`. vizij-rs releases it as `vizij-v<version>`, with a binary and an installer per desktop OS.
- **`vizij-standalone`** wraps the face page in a Tauri shell, beside a device of its own that the page does not render, and is the current Android build. Deleting it waits on the `vizij` Android app; the [Bevy plan](../active_projects/runtime/bevy_everywhere/bevy_everywhere-plan.md) tracks both.
- **Operator/control architecture** spans the `vizij` binary's bridges above and `@vizij/value-json` for value serde.
- **Authoring-to-runtime export flows** connect `vizij-authoring` outputs to runtime/player/deployment surfaces rather than stopping at an isolated editor boundary.
- **Many faces per page** is the default: each face is a device of its own with its keys under its rig prefix, and the page's one canvas draws them all (`vizij-showcase` shows five).

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
- a face's key conventions — its rig prefix and the Vizij face standard's keys — used by apps, bridges, and operator surfaces

These contracts should be described once at the architecture layer and then linked to lower-level repo-local implementation detail as needed.

## 8. Where To Look Next

- `vizij-docs/current_documentation/ROADMAP.md`
- `vizij-docs/current_documentation/DECISIONS.md`
- `vizij-rs/README.md`
- `vizij-rs/crates/vizij/README.md`
- `vizij-web/ARCHITECTURE.md`
- `vizij-web/apps/vizij-authoring/docs/README.md`
