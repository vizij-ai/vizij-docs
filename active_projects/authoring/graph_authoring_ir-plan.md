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
- 🚧 Drift detection guard: pre-push now executes `pnpm --filter vizij-rs verify:registry` (see `vizij-rs/scripts/hook-tasks.sh:186-204`), but GitHub Actions and vizij-web workflows still skip the check—add CI jobs that regenerate + diff the registry before marking complete (`stand_up_graph_ir_plan.md §1.4`).
- ☐ Provide developer workflow notes for re-running the generator and handling Cargo/toolchain failures.
- 🚧 Workspace script (`pnpm --filter vizij-rs verify:registry`) exists, yet `.github/workflows/ci.yml` never calls it—add a dedicated job and mirror the guard inside vizij-web’s pipeline so drift cannot merge unnoticed.

### 2. IR Foundations & Compiler

- ✅ Workspace package `@vizij/node-graph-authoring` hosts builder/state/expression helpers (currently emitting `GraphSpec` directly).
- ✅ Authoring app consumes the shared package for graph builds and metadata-backed expression functions.
- ✅ Define IR node/graph/value/diagnostic types decoupled from `GraphSpec` and export them from the package.
- ✅ Binding evaluation now emits IR nodes/edges directly and only compiles to `GraphSpec` via the IR compiler (`vizij-web/packages/@vizij/node-graph-authoring/src/graphBuilder.ts:54-1258`), removing the legacy GraphSpec-first pipeline.
- ✅ IR→`GraphSpec` compiler converts IR payloads (including constants) without relying on `graph.legacy.spec`, with legacy fallbacks only when explicitly requested (`vizij-web/packages/@vizij/node-graph-authoring/src/ir/compiler.ts:18-174`).
- ✅ Maintain compatibility wrapper (`buildRigGraphSpec`) that compiles IR while downstream consumers migrate.
- ✅ Expose IR diagnostics via CLI tooling—`vizij-ir-report` (packages/@vizij/node-graph-authoring/src/cli/reportIr.ts`) loads binding JSON, rebuilds IR, and prints binding issues/operator metadata for developers even before the UI surfaces them.
- ✅ Add sample IR fixtures/snapshots that assert against the IR graph (`vizij-web/packages/@vizij/node-graph-authoring/src/__tests__/irSnapshots.test.ts`), in addition to the parity tests.
- ☐ Provide IR inspection tooling (dumpers/diffs) so vizij-web/vizij-rs developers can validate metadata-annotated IR graphs without round-tripping through GraphSpec exports.

### 3. Expression & Variable Model

- ✅ Parser handles scalar/logical operators and now resolves slot aliases plus shared reserved variables through the expression variable table.
- ✅ Scalar function registry pulls from metadata; vector/time families are mapped with vocabulary + UI hints (`packages/@vizij/node-graph-authoring/src/expressionFunctions.ts:150-273`).
- ✅ Model expressions/variables within the IR (reserved aliases, scoped variables, literal bindings) to avoid remap-centric slot defaults *(expression variable table now centralises slot/reserved resolution and diagnostics)*.
- ✅ Provide IR helpers that map expression functions to metadata-backed nodes (including variadic/vector/time signatures via metadata vocabulary).
- 🚧 Design migration plan that keeps legacy bindings functional while enabling expression-first authoring—the plan exists, but UI flows remain slot-first and vector/time validation is not enforced yet *(see “Expression Migration Plan” below for phased rollout)*.
- ✅ Surface parser/IR diagnostics for invalid arity, unknown identifiers, and unsupported operators with actionable messaging *(variable table + reserved vocabulary highlight actionable errors in builder/UI)*.
- ✅ Align with `PROPOSAL-remap-expression-pipeline.md` on reserved vocabulary (`self`, `time`, derived inputs) and document expectations for new bindings *(reserved vocabulary exported for tooling + builder registration updates)*.
- ✅ Introduce a shared expression variable table/API in `@vizij/node-graph-authoring` so UI bindings and IR builders resolve identifiers consistently *(builder + UI now share reserved vocab and diagnostics)*.
- ✅ Type enforcement now validates scalar/vector/time arguments using metadata-derived shapes, with actionable diagnostics when mismatches occur (`graphBuilder.ts:430-620`).
- ✅ Reserved variables `deltaTime` and `frame` are materialised as IR nodes (metadata-tagged time sources) and exposed to expressions, unblocking authoring use ahead of runtime wiring (`graphBuilder.ts:592-620`, `expressionVocabulary.ts:24-49`).

#### Expression Migration Plan

1. **Parity phase (complete)** – Keep legacy bindings untouched while routing all evaluation through the IR layer. Expression parsing now leverages shared vocabulary + reserved-variable tables; diagnostics point back to bindings without breaking existing saves/imports.
2. **Expression-first enablement (in progress)** – Helper catalog + UI hints landed, but vector-aware slot typing, auto-aliasing, and reserved variable completion still need to ship before authors can disable manual slot wiring.
3. **Conditional & advanced nodes (pending)** – Introduce conditional/case helpers plus richer UI affordances behind feature flags, ensuring IR compilation remains the single source of truth. Backwards compatibility is preserved by keeping slot data until the migration flag is dropped.

### 4. Node Coverage & Authoring Features

- 🚧 Scalar arithmetic/logic nodes now include trig/power/comparison coverage plus the blend helpers mapped in `expressionFunctions.ts`, but runtime support for the remaining scalar nodes (abs/min/max/mod/round) is still pending upstream—track once the registry exports those signatures.
- ☐ Complete scalar catalog using registry signatures (abs, min/max variants, modulo, rounding, clamp variants) and verify expression mappings with parity fixtures.
- 🚧 Stateful/time operators exist as binding operators + expression functions, yet oscillator/damp/slew/time graphs lack dedicated tests and persistence of operator params.
- 🚧 Vector slot typing is stored on bindings/imports (`graphBuilder.ts`, `rig/importer.ts`), and vector functions exist in `expressionFunctions.ts`, but there is no UI exposure, metadata summaries, or regression coverage for vector nodes/broadcast rules.
- ✅ Case node builders now exist via the `case()` expression hook, deriving labels from slot aliases and emitting `case_labels` metadata in IR/GraphSpec (`graphBuilder.ts:554-776`, `graphBuilder.test.ts:512-617`); UI tooling still needs to surface branch configuration.
- ☐ Extend summaries/import/export metadata so operator toggles, branch labels, and vector constraints round-trip (today `GraphBindingSummary` only records slots/remaps/expressions).
- ✅ Capture regression fixtures for complex graphs (vector blends, conditional gating, time-driven oscillators) to reuse across tests and documentation (`irRegression.test.ts` + expanded `graphBuilder.test.ts` cases).

### 5. App Integration & UI

- 🚧 Authoring app consumes the shared package but still manipulates GraphSpec-level builder outputs; `buildRigGraphSpec` already returns an IR envelope + compiler (`graphBuilder.ts:1247-1258`), yet `vizij-authoring` ignores it. Wire IR summaries/issues into the UI + debug tooling ahead of the IR-first flip.
- 🚧 Binding state now persists slot `valueType` and operator settings (`packages/@vizij/node-graph-authoring/src/state.ts`, `apps/vizij-authoring/src/rig/importer.ts`), but there is no schema for upcoming conditional metadata or vector configuration—add migrations/back-compat before exposing those features.
- 🚧 Enhance `BindingEditor.tsx` for operator toggles, vector slot editors, conditional configuration, and expression hints—function/reserved hints + operator panels exist (`BindingEditor.tsx:260-330`, `739-779`), but vector-aware UI, branch forms, and expression-first affordances remain to be built.
- ☐ Adjust persistence/import/export flows so IR diagnostics, operator parameters, and new metadata survive round-trips (including derived inputs and summaries). `GraphBindingSummary` currently drops operator info and the UI never surfaces `result.ir.issues`.
- ☐ Provide feature-flag/beta path for rolling out vector + conditional authoring before general release.
- ☐ Refresh demos/docs to showcase IR-backed authoring scenarios and highlight new capabilities.

### 6. Testing, Tooling & Documentation

- ✅ Added initial IR compiler regression coverage (legacy envelope + `buildRigGraphSpec` integration).
- ✅ Added IR vs GraphSpec parity fixtures, but they still construct GraphSpec first (`irParity.test.ts`); add direct IR snapshots/diffs so regression tests stop depending on the legacy pipeline.
- ✅ GraphSpec-level unit tests now cover vector/conditional/time/stateful scenarios (`graphBuilder.test.ts`, `irRegression.test.ts`) alongside the earlier IR snapshots.
- ✅ Expanded automated coverage to vector, conditional, oscillator/time, and stateful nodes using metadata enumerations via the new regression suite (executed in CI with `pnpm --filter @vizij/node-graph-authoring test`).
- ✅ Build IR vs GraphSpec parity snapshots for representative rigs (authoring tests + wasm fixtures) and run them inside CI (`irParity.test.ts`, `irRegression.test.ts`).
- ☐ Add metadata regeneration guard (CI + pnpm script) and include smoke graphs exercising all node families.
- ☐ Document metadata generation, IR workflows, troubleshooting steps, and expression vocabulary for contributors (update `graph_authoring_ir-reference.md`, onboarding docs, and repo READMEs that still describe the pre-IR flow).
- ☐ Publish release/runbook updates covering package changes, migration notes, and QA checklist ahead of rollout.

## Stages

1. **Stage 1 – Metadata Foundations** *(Complete — generator + helpers + drift script)*
2. **Stage 2 – Package Integration** *(Complete — shared package + app adoption)*
3. **Stage 3 – IR Design & Compiler** *(In progress — IR types exist, but builder/CLI still emit GraphSpec first and the compiler largely mirrors legacy specs; flip to IR-first + finish the compiler work.)*
4. **Stage 4 – Expression Migration** *(In progress — shared vocabulary + hints landed, yet expression-first workflows, vector/time validation, and advanced nodes remain outstanding.)*
5. **Stage 5 – Testing & Docs** *(In progress — parity fixtures landed; IR snapshots, vector/time coverage, CI wiring, and doc refreshes still open.)*

## Immediate Next Steps

1. ✅ Flip the builder/CLI to produce IR first (metadata-driven node/edge/constant helpers) and keep GraphSpec as a compiler output with standalone IR fixtures.
2. 🚧 Wire GitHub CI (and vizij-web scripts) to run `pnpm --filter vizij-rs verify:registry`, document the regeneration workflow, and fail builds on drift.
3. 🚧 Expand the expression/node catalog—scalar/vector metadata enforcement plus reserved variables + base case builder are in place; remaining work covers additional node mappings (abs/min/max/mod/round) and UI exposure of the new helpers.
4. 🚧 Surface IR diagnostics/operator metadata in the authoring app: persist them in summaries/import/export, expose them in the UI, and add vector/conditional editing affordances.
5. ✅ Build regression coverage for vector/time/conditional/stateful graphs (IR snapshots + parity tests) and run them in CI (`graphBuilder.test.ts`, `irSnapshots.test.ts`, `irRegression.test.ts` now part of the default test suite).
6. ☐ Refresh documentation/reference + release notes once IR-first compilation, metadata guard, and node coverage milestones are in place.

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
