# Graph Authoring IR Proposal
<!-- tags: status=proposal; topics=graph-ir,architecture,tooling,runtime -->

> **Related documents:** [Plan](graph_authoring_ir-plan.md) · [Reference](graph_authoring_ir-reference.md) · [Project summary](summary.md)

## Context & Problem Statement

The authoring app currently assembles `GraphSpec` JSON directly from binding state. Adding new node types requires manual branching, duplicated metadata, and fragile expression parsing. Metadata lives in Rust, but the authoring layer relies on TypeScript copies, leading to drift. Advanced nodes (vector, conditional, stateful, time) and the expression-driven authoring flow described in `PROPOSAL-remap-expression-pipeline.md` cannot land safely without a shared intermediate representation (IR) and metadata pipeline. The IR is a *helper* abstraction: it exists so authoring code can reason about expressions and metadata, then compile the result into the runtime’s canonical `GraphSpec`.

## Current State

- **Data sources:** Node type definitions live in `vizij-rs` (graph core and schema), while `vizij-web` hosts React editors, binding state helpers, and the imperative graph builder.
- **Graph construction:** `apps/vizij-authoring/src/rig/graphBuilder.ts` walks component bindings and emits `GraphSpec` nodes/edges inline. It knows about a narrow math subset and manually encodes defaults, remaps, and metadata.
- **Expression parsing:** Expressions resolve slot aliases only; there is no concept of shared variables, reserved aliases beyond `self`, or metadata-driven function mapping.
- **Testing:** Vitest suites cover limited scalar math parity. Vector, conditional, stateful, and time-driven nodes lack coverage. There is no IR snapshotting to guard regressions.
- **Pain points:** Adding nodes touches multiple files; metadata drifts from the Rust registry; expression capabilities are limited; derived input graphs and summaries duplicate logic.

## Goals

1. **Introduce a metadata-driven IR** that represents node graphs before emitting `GraphSpec`.
2. **Consume Rust-generated node registry** (e.g., `registry.json`) to avoid duplication and drift.
3. **Support expression-driven bindings** (variables, reserved aliases, auto-remap defaults) as the front-end for authoring.
4. **Expand node coverage** beyond simple math to include logic, vector, conditional, stateful, and time nodes.
5. **Provide comprehensive testing & tooling** for the IR builder/compiler path so we can deterministically prove IR → GraphSpec parity before flipping the authoring workflows.

### Non-goals

- Rewriting runtime execution; focus is on author-time tooling.
- Building UI redesign for expression editor (tracked separately).
- Managing robot rig graphs (handled by Robot Rig Mapping pillar).

## Architectural Design

### High-level Flow

```
[Authoring UI] ──▶ [Binding State] ──▶ Graph IR Builder ──▶ IR Graph
                                                       │
                                                       ├─▶ Parity Tests (IR → GraphSpec)
                                                       └─▶ GraphSpec Compiler ──▶ Runtime Exports
```

- **Metadata Source:** `vizij-rs` exports the authoritative node registry via a cargo helper that writes `registry.json` and a baked TypeScript module during `@vizij/node-graph-wasm` builds.
- **Authoring IR Package:** `@vizij/node-graph-authoring` owns IR types (`IrGraph`, `IrNode`, ports, constants), builder utilities, expression function definitions sourced from metadata, and the IR→`GraphSpec` compiler.
- **Expression Layer:** Authoring UI produces expressions/variables that map to metadata-backed node factories, handling alias resolution (`self`, slots, reserved variables), variadic signatures, and scalar/vector coercion.
- **Validation:** Tests snapshot IR output, compare compiled `GraphSpec` against expectations, and detect metadata drift or signature changes automatically.

### Shared Node Metadata

- Generate `registry.json` from `schema::registry()` inside `vizij-rs` and ship it in `@vizij/node-graph-wasm/dist`.
- Expose helpers (`getNodeRegistry`, `requireNodeSignature`, `listNodeTypeIds`, `nodeRegistryVersion`) for both runtime consumers and the IR layer.
- Add build/CI hooks that regenerate metadata and fail on drift, ensuring the TypeScript view of node definitions always matches Rust.
- Document developer workflows for rebuilding metadata and troubleshooting cargo failures.

### Authoring IR Layer

- Define clear IR domain types for nodes, ports, constants, remaps, summaries, and diagnostics.
- Provide builder helpers that assemble IR nodes using metadata signatures (auto-wiring required inputs, defaults, and parameter ranges) and track issues for UI surfacing.
- Compile IR graphs to `GraphSpec`, preserving Vizij metadata headers, remap defaults, constant reuse, and runtime expectations. The runtime continues to consume only the compiled `GraphSpec`.
- Maintain a compatibility wrapper (`buildRigGraphSpec`) so existing app code can migrate gradually.
- Ship deterministic parity tests: every representative binding scenario builds IR, compiles it, and compares the resulting GraphSpec to the expected JSON generated by the legacy codepath. These tests are the mechanism we use to “prove IR is correct” before we flip the authoring workflow.

### Expression-Driven Workflow & Coverage

- Expand the expression parser to support metadata-driven functions, logical operators, comparisons, and reserved aliases.
- Introduce shared variable modeling within the IR so expressions can reference slots, derived inputs, and time/state helpers without fragile remap hacks.
- Cover scalar, vector, conditional, stateful, and time-based node families by delegating to metadata signatures (including variadic and category-specific inputs).
- Surface vector-aware semantics (component-safe IDs, broadcasting, join/split helpers) and conditional/case branch metadata to the UI and summary exports.

### UI & Data Integration

- Update binding state and editors to carry slot `valueType`, operator toggles, branch labels, and variable metadata while remaining backward-compatible with saved projects.
- Ensure derived inputs, persistence, and import/export pipelines leverage the IR-produced summaries and metadata parity checks.
- Keep runtime packages unchanged: they continue to load compiled `GraphSpec` while benefiting from richer metadata provenance.

## Implementation Strategy

Implementation follows the staged rollout captured in the tracking plan. The key milestones are:

1. **Shared metadata foundation** – Generate/ship `registry.json`, expose helper APIs, add drift detection tests.
2. **Authoring IR package** – Scaffold `@vizij/node-graph-authoring`, port existing builder logic, and establish deterministic IR→GraphSpec parity tests for the math nodes we already support.
3. **App adoption** – Swap the authoring app to consume the shared package (via `buildRigGraphSpec`) while keeping thin adapters and dual-running the legacy GraphSpec output for telemetry.
4. **Node coverage expansion** – Wire scalar, vector, conditional, stateful, and time nodes through metadata-backed factories and parser mappings, extending the parity tests as each family lands.
5. **Expression-first tooling** – Deliver vector-aware slot typing, CASE metadata, operator stacks, and UI affordances that leverage the IR metadata.
6. **Runtime/export/import flip** – Once parity tests pass, update the authoring runtime/export/import surfaces to compile IR and treat GraphSpec as the derived artifact, keeping IR snapshots for inspection/debugging.
7. **Documentation & rollout** – Refresh references, contributor guides, and release notes; retire the dual-run telemetry once IR is the default path.

Each phase includes paired documentation and testing deliverables to maintain parity and developer clarity.

## Testing & Validation

- Deterministic parity tests: for each representative binding graph, build IR, compile it, and compare against the expected GraphSpec (the runtime’s source of truth). These run in `@vizij/node-graph-authoring` and are sufficient to prove the IR path is correct.
- Feature-focused unit tests covering vector ops, CASE expressions, operator stacks, stateful/time nodes, etc., all executed through the IR builder.
- Lightweight authoring smoke tests that load saved binding maps and assert the compiled GraphSpec hash matches the expected output, ensuring the UI pipeline matches the package tests.
- Metadata drift guard that regenerates `registry.json` (local script + CI) and fails on diff.

## Risks & Trade-offs

- **Complexity:** The IR adds an abstraction layer; mitigated by clear package boundaries, compatibility wrappers, and phased rollout.
- **Metadata generation reliability:** Build pipeline depends on Rust. Provide documented workflows, CI hooks, and explicit failure messaging to unblock contributors quickly.
- **Expression compatibility:** Migrating existing bindings to the new expression/variable model requires fallback paths and careful persistence upgrades.
- **Coverage gaps:** Without vector/time/conditional tests, regressions could slip through. Addressed by metadata-driven test matrices and smoke graphs exercising each node family.
- **Cross-package coordination:** Introducing a new package affects workspace builds and releases; changelog and versioning discipline is required.

## Impact on Codebase

- `vizij-rs`: new registry export tooling, tests ensuring baked metadata matches runtime schema.
- `@vizij/node-graph-wasm`: metadata generation scripts, new `metadata` entry points, documentation updates, and drift checks.
- `@vizij/node-graph-authoring`: new package housing IR types, builders, compiler, expression helpers, and shared tests.
- `vizij-web` authoring app: adapters to the IR package, enhanced binding state, UI updates for operators/vector/conditional flows, and revised persistence/import/export helpers.
- Workspace tooling and docs: updated scripts, contributor guides, and release processes reflecting the metadata + IR workflow.

## Approval & Decision Log

- Metadata generation strategy approved (Rust-driven) — *TBD date.*
- Expression-first pipeline alignment pending product review.
