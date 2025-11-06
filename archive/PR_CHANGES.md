# Vizij Orchestrator Release: PR Change Narrative

## Why these PRs exist
Two coordinated pull requests land the first iteration of the **Vizij orchestrator** and wire it into both Rust and web tooling. The orchestrator connects animation engines and node graphs through a deterministic blackboard so complex rigs can be staged, simulated, and visualised without custom glue per project. The Rust PR introduces the orchestrator runtime, fixtures, and shared JSON utilities; the web PR layers on developer-facing demos and React bindings so front-end teams can drive the new runtime directly from TypeScript.

## vizij-rs (Rust workspace)
- **New orchestrator domain**: Added `vizij-orchestrator-core` with a blackboard, scheduler, graph/animation controllers, fixtures, and integration tests. The scheduler currently supports `SinglePass` and `TwoPass` runs and produces deterministic merged write batches plus conflict logs and timing diagnostics. A companion `vizij-orchestrator-wasm` crate exposes the runtime to JavaScript with helpers to register graphs/animations, set inputs, and step frames.
- **Shared API JSON layer**: `vizij-api-core` now exports a `json` module that normalizes shorthand Value/Shape payloads, GraphSpec blobs, and WriteBatches. The orchestrator, graph, and animation stacks all consume the same routines, avoiding copy/paste serializers and ensuring future Value variants propagate uniformly.
- **Value/TypedPath tightening**: Animation and graph crates were touched to rely on the shared JSON helpers, standardize lowercase Value discriminants, and surface conveniences (e.g., graph evaluation now respects controller subscriptions and preserves pre-populated writes). Stored animation loading gained fixtures and tests that line up with the new orchestrator demos.
- **npm workspace growth**: Added three npm packages—`@vizij/orchestrator-wasm`, `@vizij/value-json`, and `@vizij/wasm-loader`—plus a TypeScript `@vizij/test-fixtures` bundle. Build scripts moved from npm to pnpm, and CI flows were updated to build/test the orchestrator artifacts alongside animation and graph packages.
- **Documentation and fixtures**: README / NEXT_STEPS / AGENTS docs were refreshed for the orchestrator stack, new JSON fixtures cover graphs, animations, and orchestration manifests, and wasm tests assert ABI stability and JSON normalization.

## vizij-web (Web workspace)
- **React orchestrator bindings**: Introduced a new `@vizij/orchestrator-react` package that wraps the wasm runtime in a provider/context, caches merged writes per TypedPath, exposes subscription hooks (`useOrchFrame`, `useOrchTarget`, etc.), and shares Value helpers with other Vizij packages.
- **Developer demos**:
  - `apps/demo-orchestrator` showcases manual graph/animation registration, stepping, and inspection of merged writes/conflicts.
  - `apps/demo-render-no-rig` is a larger rig playground that lets artists author animation tracks, synthesize graph specs, and push them through the orchestrator in real time.
- **Value helper convergence**: Existing React packages (`@vizij/animation-react`, `@vizij/node-graph-react`) now depend on `@vizij/value-json` for consistent ser/de helpers. Utility code such as `animationValueToGraph.ts` switched to the shared helpers and the lowercase Value enums emitted by the Rust stack.
- **Workspace tooling**: The repo migrated to pnpm, added scripts for orchestrator demos/builds, removed the stale `package-lock.json`, and aligned CI to run the pnpm-based workflows. Render and animation UIs picked up small adjustments so they can render orchestrator-fed data.

## How the two PRs work together
1. **Shared Value semantics** — The Rust JSON module and the new `@vizij/value-json` package guarantee animation/graph/orchestrator data uses the same lowercase discriminants and coercion rules. The web repo consumes these helpers to avoid drift and to reinterpret merged writes coming from the orchestrator wasm bindings.
2. **Fixtures & tests** — Rust now publishes typed fixtures (animations, node graphs, orchestrations) and exports them via `@vizij/test-fixtures`. The web demos import the same fixtures when seeding the orchestrator, ensuring parity between Rust integration tests and browser tooling.
3. **Runtime bridge** — `vizij-orchestrator-wasm` exposes `register_graph`, `register_animation`, `set_input`, and `step`. `@vizij/orchestrator-react` wraps those APIs so React apps can hydrate controllers, subscribe to Blackboard paths, and render merged frame state. The new demos demonstrate end-to-end usage, while the Rust tests exercise the core logic.
4. **Process alignment** — Both repos now rely on pnpm-aware scripts and shared wasm loader utilities. CI and local dev instructions reference the same commands, lowering friction when iterating across repos.

## Expected impact
- Teams get a deterministic orchestrator runtime (Rust) plus an ergonomic React layer (web) for live previews and tooling.
- Animation, graph, and orchestrator stacks share one serialization story, reducing bug surface and simplifying documentation.
- The new demos and fixtures provide canonical examples of orchestrating multiple controllers, serving as a template for future integrations (e.g., production rigs, robotics demos, or host applications).
