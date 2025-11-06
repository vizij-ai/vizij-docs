# Graph Authoring IR – Plan & Tracking
<!-- tags: status=tracking; topics=graph-ir,tooling,automation-testing,runtime,documentation -->

> **Related documents:** [Proposal](graph_authoring_ir-proposal.md) · [Reference](graph_authoring_ir-reference.md) · [Project summary](summary.md)

## Objective & Scope

Execute the “Stand Up Graph IR Infrastructure” milestones: metadata pipeline, IR package, expression integration, and supporting automation. Content drawn from `archive/stand_up_graph_ir_plan.md`.

## Workstreams & Status

### 1. Shared Node Metadata Pipeline

- ✅ Rust-driven generator exports `registry.json` and baked module via `vizij-rs/scripts/generate-node-registry.mjs`.
- ✅ `@vizij/node-graph-wasm` publishes metadata helpers (`getNodeRegistry`, `requireNodeSignature`, `listNodeTypeIds`) plus `nodeRegistryVersion` for runtime validation.
- ✅ Package build/test scripts regenerate metadata before publishing and copy JSON artifacts to `dist/`.
- ☐ Drift detection: add CI/pre-push step to regenerate registry and fail on diff (`stand_up_graph_ir_plan.md §1.4`).
- ☐ Provide developer workflow notes for re-running the generator and handling Cargo/toolchain failures.

### 2. IR Foundations & Compiler

- ✅ Workspace package `@vizij/node-graph-authoring` hosts builder/state/expression helpers (currently emitting `GraphSpec` directly).
- ✅ Authoring app consumes the shared package for graph builds and metadata-backed expression functions.
- ✅ Define IR node/graph/value/diagnostic types decoupled from `GraphSpec` and export them from the package.
- ☐ Layer binding evaluation so it produces IR graphs (nodes, edges, constants, summaries, metadata tags) before compilation.
- 🚧 Implement IR→`GraphSpec` compiler that preserves remap defaults, vizij metadata headers, and constant de-duplication *(legacy-spec fallback scaffolded; full compiler pending)*.
- ✅ Maintain compatibility wrapper (`buildRigGraphSpec`) that compiles IR while downstream consumers migrate.
- 🚧 Expose IR diagnostics (binding summaries, metadata parity reports) for authoring tools, CLI scripts, and tests *(current build emits IR issues and summary envelope)*.
- 🚧 Add sample IR fixtures that downstream packages (apps, wasm tests) can reuse for parity checks *(initial Vitest coverage landed)*.

### 3. Expression & Variable Model

- 🚧 Parser handles scalar/logical operators but only resolves slot aliases—no shared variable or reserved-alias model from the proposal.
- 🚧 Scalar function registry pulls from metadata; vector/time/conditional categories still need enumeration and authoring hints.
- ☐ Model expressions/variables within the IR (reserved aliases, scoped variables, literal bindings) to avoid remap-centric slot defaults.
- ☐ Provide IR helpers that map expression functions to metadata-backed nodes (including variadic and vector signatures).
- ☐ Design migration plan that keeps legacy bindings functional (import/export, persistence) while enabling expression-first authoring in the UI.
- ☐ Surface parser/IR diagnostics for invalid arity, unknown identifiers, and unsupported operators with actionable messaging.
- ☐ Align with `PROPOSAL-remap-expression-pipeline.md` on reserved vocabulary (`self`, `time`, derived inputs) and document expectations for new bindings.

### 4. Node Coverage & Authoring Features

- 🚧 Scalar arithmetic/logic nodes partially supported via metadata-backed functions; coverage limited to existing math subset.
- ☐ Complete scalar catalog using registry signatures (abs, min/max variants, modulo, rounding) and verify expression mappings.
- ☐ Implement stateful/time operators (oscillator, spring, damp, slew, time) with binding-operator toggles and metadata defaults.
- ☐ Introduce vector slot typing, vector node factories (add/subtract/multiply/scale/normalize/dot/length/join/split/min/max), and scalar-to-vector broadcasting rules.
- ☐ Add conditional/case node builders with branch metadata, default handling, and validation surfaced through the IR.
- ☐ Capture regression fixtures for complex graphs (vector blends, conditional gating, time-driven oscillators) to reuse across tests and documentation.

### 5. App Integration & UI

- 🚧 Authoring app consumes the shared package but still manipulates GraphSpec-level builder outputs.
- ☐ Update binding state to persist slot `valueType`, operator settings, and conditional metadata without breaking existing saves.
- ☐ Enhance `BindingEditor.tsx` (and related surfaces) for operator toggles, vector slot editors, conditional configuration, and expression hints.
- ☐ Adjust persistence/import/export flows so IR diagnostics and new metadata survive round-trips (including derived inputs and summaries).
- ☐ Provide feature-flag/beta path for rolling out vector + conditional authoring before general release.
- ☐ Refresh demos/docs to showcase IR-backed authoring scenarios and highlight new capabilities.

### 6. Testing, Tooling & Documentation

- ✅ Added initial IR compiler regression coverage (legacy envelope + `buildRigGraphSpec` integration).
- 🚧 GraphSpec-level unit tests cover arithmetic/logic expressions but no IR snapshots yet—add IR builders and parity harness once types exist.
- ⚠️ Expand automated coverage to vector, conditional, oscillator/time, and stateful nodes using metadata enumerations (current tests only exercise scalar cases).
- ☐ Build IR vs GraphSpec parity snapshots for representative rigs (authoring tests + wasm fixtures).
- ☐ Add metadata regeneration guard (CI + pnpm script) and include smoke graphs exercising all node families.
- ☐ Document metadata generation, IR workflows, troubleshooting steps, and expression vocabulary for contributors (update reference + onboarding docs).
- ☐ Publish release/runbook updates covering package changes, migration notes, and QA checklist ahead of rollout.

## Stages

1. **Stage 1 – Metadata Foundations** *(Complete)*
2. **Stage 2 – Package Integration** *(Complete for metadata-backed builder; IR abstraction still pending Stage 3)*
3. **Stage 3 – IR Design & Compiler** *(Not started — requires new types + compiler)*
4. **Stage 4 – Expression Migration** *(Not started — blocked on IR variable model)*
5. **Stage 5 – Testing & Docs** *(In progress at GraphSpec level; IR parity & docs outstanding)*

## Immediate Next Steps

1. ✅ Draft and review IR domain model (nodes, ports, metadata, diagnostics) for `@vizij/node-graph-authoring`.
2. 🚧 Implement initial IR→`GraphSpec` compiler with parity tests against current `buildRigGraphSpec` *(legacy fallback in place; needs true IR emitters + parity fixtures)*.
3. ☐ Wire CI/local automation to regenerate `registry.json` and fail on drift.
4. ⚠️ Schedule expression/variable model design review to align UI expectations with the new IR and document reserved vocabulary.
5. ☐ Map out node coverage milestones (scalar completion, stateful/time, vector, conditional) with fixtures and testing strategy.
6. ☐ Outline documentation and release updates (reference, contributor guide, migration notes) covering metadata workflow and IR adoption steps.

## Risks & Mitigations

- **Scope Creep** – Expression overhaul could balloon; mitigate with phased rollout (IR first, expression features incremental).
- **Build Tooling Fragility** – Cargo generator failures must surface clearly; add workflow docs and CI alerts to unblock contributors.
- **Parity Regressions** – Without IR snapshots, migration may change outputs silently; enforce parity harness before switching app to IR.
- **Coverage Gaps** – Lack of vector/time node tests risks regressions; expand metadata-driven test matrices alongside IR work.
- **Release Coordination** – Binding schema and package changes require careful communication; plan beta rollouts and migration guides.

## Decision Log

- Metadata generation approach ratified (Rust export + baked module).
- Expression proposal alignment pending (to be logged after review).

## Validation Checklist

- `pnpm --filter @vizij/node-graph-wasm build`
- `pnpm --filter @vizij/node-graph-wasm test`
- `pnpm --filter @vizij/node-graph-authoring test`
- `cargo run -p vizij-graph-registry-export -- --output /tmp/registry.json --pretty`
- Future: IR snapshot/parity test suite (`pnpm --filter @vizij/node-graph-authoring test -- --runInBand` with IR fixtures)
- Future: Metadata drift guard (`pnpm run verify-registry`) wired into CI + pre-push hooks.
- Future: Authoring smoke graph exercising scalar/vector/conditional/timeful nodes (`pnpm --filter vizij-authoring test -- --run vector-suite`).
