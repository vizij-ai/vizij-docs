# Vizij Runtime Architecture (2025)

## Repositories & Ownership
- **`vizij-rs`** – Rust workspace that owns deterministic cores (`*-core`), optional Bevy adapters (`bevy_vizij_*`), wasm bridges (`*-wasm`), and supporting npm helpers (`@vizij/*`). It is the single source of truth for Value/Shape/TypedPath semantics and publishes wasm artefacts plus fixtures.
- **`vizij-web`** – pnpm monorepo that consumes the wasm artefacts through React providers (`@vizij/*-react`), renderer utilities, and demo/marketing apps. It never compiles Rust; all heavy lifting happens upstream.

## Data Flow
```
vizij-rs core crates ─┬─> wasm-bindgen bridges ──> npm/@vizij/*-wasm
                      └─> Bevy plugins          (native integrations)

npm/@vizij/*-wasm ──> vizij-web React providers ──> renderer / demos / tooling
```
- **Values & Shapes** are defined once in `vizij-api-core` and serialized through the shared `vizij_api_core::json` helpers.
- **WriteBatch** payloads carry typed paths and optional declared shapes from the core all the way to React consumers.
- **Fixtures** in `vizij-rs/fixtures/` are exported again through `@vizij/test-fixtures` so Rust and TypeScript tests exercise the same graphs/animations/orchestrations.

## Rust Workspace Highlights (`vizij-rs`)
- **Animation Stack**
  - `vizij-animation-core`: deterministic engine with track sampling, accumulation, and binding caches.
  - `vizij-animation-wasm`: wasm interface exposing init/load/step plus `updateValuesAndDerivatives`.
  - `@vizij/animation-wasm`: ESM loader (via `@vizij/wasm-loader`) and Value helpers (via `@vizij/value-json`).
  - `Engine::prebind_with_report` surfaces unresolved bindings; React adapters replay prebind whenever animations or instances reload so resolver tweaks take effect immediately.
- **Node Graph Stack**
  - `vizij-graph-core`: selector-aware evaluation, typed input staging, shape-enforced outputs, optional URDF features.
  - `vizij-graph-wasm`: normalization for GraphSpec + JSON bridging, returns WriteBatches with typed paths.
  - `vizij-graph-registry-export`: helper crate to export registry data.
  - `@vizij/node-graph-wasm`: ESM loader and helpers.
- **Orchestrator Stack**
  - `vizij-orchestrator-core`: Blackboard + deterministic schedulers (`SinglePass`, `TwoPass`), controllers for graphs/animations, conflict logging.
  - `vizij-orchestrator-wasm`: wasm API that mirrors controller registration and `step` semantics for TypeScript.
  - `@vizij/orchestrator-wasm`: ESM loader.
- **Shared Tooling**
  - `@vizij/wasm-loader` centralizes wasm module initialization (browser + Node) and ABI checks.
  - `@vizij/value-json` exports the canonical Value union, helpers (`toValueJSON`, `valueAs*`), and typings for downstream packages.
  - `scripts/dry-run-release.sh` builds every crate/package to validate releases prior to publish.

## Web Workspace Highlights (`vizij-web`)
- **React Providers & Runtime**
  - `@vizij/animation-react`: wraps the animation engine, manages RAF/interval loops, caches latest values/derivatives, exposes selector hooks (`useAnimTarget`, `useAnimDerivative`).
  - `@vizij/node-graph-react`: async graph runtime loader with `useGraphOutputs`, `useGraphInput`, spec normalization via wasm helper.
  - `@vizij/orchestrator-react`: orchestrator context that caches merged writes per TypedPath, exposes frame/body hooks, and surfaces conflicts/events.
  - `@vizij/runtime-react`: bridges renderer assets with orchestrator controllers, providing a unified runtime environment.
- **Authoring & Tooling**
  - `@vizij/node-graph-authoring`: utilities for building and inspecting node graphs at authoring time, including IR reporting.
  - `@vizij/minimal-demo-ui`: shared UI components for minimal demos.
- **Renderer & Rig**
  - `@vizij/render`: Three.js renderer, Vizij store, `setValue` API for direct animatable control.
  - `@vizij/utils`: shared math/value utilities, rig helpers, and common types.
- **Apps & Demos**
  - `vizij-authoring`: main authoring application for creating and editing Vizij assets.
  - `demo-animation-studio`: inspect/load stored animations, visualize outputs, exercise prebind tooling.
  - `demo-graph-studio`: schema-driven graph editor linked to wasm runtime.
  - `demo-vizij-player`: authoring surface for facial rigs and orchestrator-driven playback.
  - `vizij-showcase`: showcase application.
  - Minimal demos (`minimal-demo-*`): lightweight examples for specific stacks (animation, graph, orchestrator).

## Build & Release Flow
1. **Rust** – `cargo fmt`, `cargo clippy`, `cargo test`, optional wasm target builds (`cargo build --target wasm32-unknown-unknown`).
2. **WASM** – `pnpm run build:wasm:<stack>` in `vizij-rs` to produce `pkg/` artefacts, followed by `pnpm --filter @vizij/*-wasm build`.
3. **Publish** – `vizij-rs` publishes crates (core → wasm → bevy) and npm packages (`@vizij/value-json`, loader, wasm wrappers). `vizij-web` bumps React packages afterwards.
4. **Consumers** – `vizij-web` installs from npm, runs `pnpm run build`, `pnpm run typecheck`, `pnpm run lint/test`.

## Runtime Observability
- Orchestrator frames return merged writes, conflict logs, pass timings (currently based on `dt`, see Known Issues), and emitted events for diagnostics.
- Demo apps log history (animation studio) and surface orchestrator conflicts to accelerate debugging.

## Key Cross-Repo Contracts
- **ABI versioning** – each wasm crate exposes `abi_version()`; npm loaders reject mismatches with actionable rebuild instructions.
- **TypedPath conventions** – orchestrator/graphs use namespaces (`anim/player/<id>/…`) to keep controllers interoperable.
- **Spec normalization** – Graph specs, values, and stored animations should pass through shared normalizers before evaluation to avoid legacy shorthand drift.
