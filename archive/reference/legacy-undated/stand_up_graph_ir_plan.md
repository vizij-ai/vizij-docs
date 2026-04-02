# Stand Up Graph IR Infrastructure – Execution Plan
<!-- tags: status=tracking; topics=graph-ir,tooling,automation-testing,runtime,documentation -->

This plan expands on the “Stand Up Graph IR Infrastructure” milestone from `summary.md`, translating the intent of `graph_authoring_plan.md` and the expression authoring proposal into actionable tasks with live status notes.

## Objective
Deliver a resilient graph-authoring foundation where the Vizij authoring app builds bindings against a metadata-driven intermediate representation (IR) instead of bespoke GraphSpec wiring, unlocking richer nodes, expressions, and validation while keeping runtime outputs stable.

## Scope
- Generate and ship a canonical node registry (`registry.json`) from the Rust core, expose typed metadata helpers, and ensure downstream packages consume them.
- Stand up the `@vizij/node-graph-authoring` workspace package as the single entry point for binding state, IR builders, and GraphSpec compilation.
- Refactor authoring flows to materialise bindings through the IR, including expression/variable plumbing aligned with `PROPOSAL-remap-expression-pipeline.md`.
- Harden the stack with parity tests, metadata drift detection, and documentation so contributors can extend node coverage confidently.

### Out of Scope
- Full UI redesign for the expression editor (tracked separately in the proposal).
- Runtime loader/runtime graph execution changes beyond accepting the compiled GraphSpec.
- Robot rig graph migration (covered by the robot rig pipeline milestone).

## Assumptions & Dependencies
- Node registry generation relies on the Rust crate `vizij-graph-registry-export`; cargo tooling must be available in CI.
- `@vizij/node-graph-wasm` remains the source of truth for schema types and metadata helpers.
- Existing binding data structures (`AnimatableBinding`, remap defaults, operator metadata) remain valid inputs to the new IR until the expression pipeline replaces them.

## Workstreams & Tasks

### 1. Shared Node Metadata Pipeline
1. Automate registry export from Rust into JSON and a baked TS module. — *Status: ✅ Completed; the generator script exports and copies the registry during builds (`vizij-rs/scripts/generate-node-registry.mjs:1`).*
2. Expose typed metadata helpers (`getNodeRegistry`, `requireNodeSignature`, etc.) consumable from TypeScript. — *Status: ✅ Completed; helpers live under the new metadata entry point (`vizij-rs/npm/@vizij/node-graph-wasm/src/metadata/index.ts:1`).*
3. Ship metadata with the WASM package and run the generator as part of the build/test scripts. — *Status: ✅ Completed; `package.json` wires the generator into `pnpm run build` and exports the baked JSON (`vizij-rs/npm/@vizij/node-graph-wasm/package.json:30`).*
4. Guard against drift between Rust and baked metadata. — *Status: ⚠️ In progress; smoke tests load the registry and exercise helpers, but we still need a failing check if `registry.json` diverges from a fresh export (`vizij-rs/npm/@vizij/node-graph-wasm/tests/all.test.ts:488`).*

### 2. Workspace IR Package & App Integration
1. Extract binding helpers and graph builder into a reusable workspace package. — *Status: ✅ Completed; `@vizij/node-graph-authoring` exports the consolidated builder/state modules (`packages/@vizij/node-graph-authoring/src/index.ts:1`).*
2. Update the authoring app to consume the shared package. — *Status: ✅ Completed; the app now imports `buildRigGraphSpec` and related types from the workspace package (`apps/vizij-authoring/src/App.tsx:22`).*
3. Feed metadata-driven function definitions into expression parsing. — *Status: ✅ Completed; scalar function lookup is backed by the baked registry (`packages/@vizij/node-graph-authoring/src/expressionFunctions.ts:1`).*
4. Introduce first-class IR data structures (nodes, ports, graphs) decoupled from `GraphSpec`. — *Status: ☐ Not started; the current builder still creates GraphSpec nodes directly (`packages/@vizij/node-graph-authoring/src/graphBuilder.ts:1`).*
5. Implement an IR compiler that materialises GraphSpec from the IR and supports expression/variable authoring. — *Status: ☐ Not started; no IR compiler or translation layer exists yet (`packages/@vizij/node-graph-authoring/src/graphBuilder.ts:1`).*
6. Capture binding summaries and metadata parity during refactors. — *Status: ⚠️ In progress; summary exports exist but parity tests still assert against GraphSpec structures, not an intermediate layer (`packages/@vizij/node-graph-authoring/src/__tests__/graphBuilder.test.ts:1`).*

### 3. Expression-Driven Binding Authoring
1. Align the expression parser with the proposal (variables, reserved aliases, guardrails). — *Status: ⚠️ Partially complete; the parser handles scalar/logical operators but lacks variable management and UI prompts described in the proposal (`packages/@vizij/node-graph-authoring/src/expression.ts:1`).*
2. Model expressions/variables in the forthcoming IR so bindings no longer rely on slot remap defaults. — *Status: ☐ Not started; bindings still depend on remap-centric state structures (`packages/@vizij/node-graph-authoring/src/state.ts:1`).*
3. Provide helpers to translate expression functions into IR nodes with metadata validation. — *Status: ☐ Not started; expression evaluation still emits GraphSpec nodes inline (`packages/@vizij/node-graph-authoring/src/graphBuilder.ts:70`).*
4. Plan migration hooks so legacy bindings load unchanged while the expression editor adopts the new pipeline. — *Status: ☐ Not started; no migration scaffolding beyond existing GraphSpec builder is in place.*

### 4. Testing, Tooling & Documentation
1. Snapshot IR output (once implemented) and compare against legacy GraphSpec to prevent regressions. — *Status: ☐ Not started; existing tests only validate direct GraphSpec builds (`packages/@vizij/node-graph-authoring/src/__tests__/graphBuilder.test.ts:1`).*
2. Expand test coverage to vector, conditional, and stateful nodes using metadata enumerations. — *Status: ⚠️ In progress; math/logic coverage exists, but vector/stateful suites called out in the plan are still missing (`packages/@vizij/node-graph-authoring/src/__tests__/graphBuilder.test.ts:160`).*
3. Document metadata/IR usage patterns for contributors. — *Status: ☐ Not started; repo docs don’t yet explain the new metadata helpers or planned IR workflow.*
4. Wire CI to regenerate metadata and fail on drift once the diff check is ready. — *Status: ☐ Not started; CI currently relies on the build step’s regeneration but has no diff gate.*

## Stages & Sequencing
1. **Stage 1:** Finalise metadata pipeline (registry export, helpers, package wiring). — *Status: ✅ Completed; Workstream 1 tasks 1–3 are live.*
2. **Stage 2:** Establish the authoring package as the integration surface and validate existing flows on it. — *Status: ✅ Completed; the app builds against the workspace package and leverages metadata-backed functions.*
3. **Stage 3:** Design and implement the IR schema plus compiler, then migrate graph builder usage to the IR. — *Status: ☐ Not started; Workstream 2 tasks 4–5 and Workstream 3 tasks remain open.*
4. **Stage 4:** Layer on expression-driven authoring, parity safeguards, and contributor docs. — *Status: ☐ Not started; Workstreams 3–4 need implementation and QA.*

### Outstanding Backlog (execute in order)
1. ⚠️ Add an automated drift check that reruns the registry generator and fails when JSON changes without a commit (Workstream 1 task 4, Workstream 4 task 4).
2. ☐ Define the IR data model and compiler, then refactor `buildRigGraphSpec` to emit through it (Workstream 2 tasks 4–5).
3. ☐ Flesh out the expression pipeline (variable model, IR translation, migration scaffolding) in alignment with the proposal (Workstream 3 tasks 1–4).
4. ☐ Expand test suites to cover vector/stateful nodes and add IR vs. GraphSpec parity snapshots (Workstream 4 tasks 1–2).
5. ☐ Document contributor workflows for metadata regeneration and IR extensions (Workstream 4 task 3).

Dependencies between workstreams:
- Metadata generation (Workstream 1) must remain healthy before IR work consumes registry data. — *Status: ✅ Solid; helpers already power expression function lookup (`packages/@vizij/node-graph-authoring/src/expressionFunctions.ts:1`).*
- IR design (Workstream 2) underpins expression migration (Workstream 3); expression work cannot complete without the IR. — *Status: ⚠️ Pending; blocked until the IR is defined.*
- Testing/documentation (Workstream 4) depends on IR landing to snapshot new structures. — *Status: ☐ Pending implementation.*

## Approval Checklist
- Confirm IR schema boundaries and compatibility expectations with runtime owners. — *Status: ☐ Not started; no design review recorded.*
- Align on migration messaging for authors as expression-first workflows roll out. — *Status: ☐ Not started; proposal hasn’t been product-signed.*
- Verify CI resources can run the registry generator and IR parity tests. — *Status: ⚠️ Partially scoped; metadata build already shells out to cargo but CI load hasn’t been revalidated since adding the generator (`vizij-rs/scripts/generate-node-registry.mjs:18`).*
- Ensure documentation plan covers both workspace contributors and app authors. — *Status: ☐ Not started; docs pending Workstream 4.*
