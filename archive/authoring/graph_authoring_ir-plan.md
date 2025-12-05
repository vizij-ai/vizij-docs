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
- ✅ Drift detection guard: pre-push now executes `pnpm --filter vizij-rs verify:registry` (see `vizij-rs/scripts/hook-tasks.sh:186-204`). 
- ✅ CI now regenerates + diffs the registry on every vizij-rs build via the `registry` job that runs `scripts/verify-node-registry.mjs` (`vizij-rs/.github/workflows/ci.yml:70-90`, `vizij-rs/scripts/verify-node-registry.mjs:11-87`).

### 2. IR Foundations & Compiler

- ✅ Workspace package `@vizij/node-graph-authoring` hosts builder/state/expression helpers that now emit IR nodes and compile to `GraphSpec` (`vizij-web/packages/@vizij/node-graph-authoring/src/graphBuilder.ts`).
- ✅ Authoring app consumes the shared package for graph builds and metadata-backed expression functions.
- ✅ Define IR node/graph/value/diagnostic types decoupled from `GraphSpec` and export them from the package.
- ✅ Binding evaluation now emits IR nodes/edges directly and only compiles to `GraphSpec` via the IR compiler (`vizij-web/packages/@vizij/node-graph-authoring/src/graphBuilder.ts:54-1258`), removing the legacy GraphSpec-first pipeline.
- ✅ IR→`GraphSpec` compiler converts IR payloads (including constants) without relying on `graph.legacy.spec`, with legacy fallbacks only when explicitly requested (`vizij-web/packages/@vizij/node-graph-authoring/src/ir/compiler.ts:18-174`).
- ✅ Maintain compatibility wrapper (`buildRigGraphSpec`) that compiles IR while downstream consumers migrate.
- ✅ Expose IR diagnostics via CLI tooling—`vizij-ir-report` (packages/@vizij/node-graph-authoring/src/cli/reportIr.ts`) loads binding JSON, rebuilds IR, and prints binding issues/operator metadata for developers even before the UI surfaces them.
- ✅ Add sample IR fixtures/snapshots that assert against the IR graph (`vizij-web/packages/@vizij/node-graph-authoring/src/__tests__/irSnapshots.test.ts`), in addition to the parity tests.
- ✅ Provide IR inspection tooling (dumpers/diffs) so vizij-web/vizij-rs developers can validate metadata-annotated IR graphs without round-tripping through GraphSpec exports. `vizij-ir-report` now emits normalized machine-readable reports enriched with registry metadata annotations plus a packaged diff helper, giving both workspaces a round-trip-free way to inspect and gate IR graphs.
- ✅ Extend `vizij-ir-report` with machine-readable dumps/diff mode so CI/devtools can compare IR graphs without manual inspection (`packages/@vizij/node-graph-authoring/src/cli/reportIr.ts`). The CLI now supports `--dump <path|->` for normalized JSON reports and `--diff <path|->` with optional `--diff-limit` to emit machine-readable difference payloads/exit codes for CI assertions.

### 3. Expression & Variable Model

- ✅ Parser handles scalar/logical operators and now resolves slot aliases plus shared reserved variables through the expression variable table.
- ✅ Scalar function registry pulls from metadata; vector/time families are mapped with vocabulary + UI hints (`packages/@vizij/node-graph-authoring/src/expressionFunctions.ts:150-273`).
- ✅ Model expressions/variables within the IR (reserved aliases, scoped variables, literal bindings) to avoid remap-centric slot defaults *(expression variable table now centralises slot/reserved resolution and diagnostics)*.
- ✅ Provide IR helpers that map expression functions to metadata-backed nodes (including variadic/vector/time signatures via metadata vocabulary).
- ✅ Surface parser/IR diagnostics for invalid arity, unknown identifiers, and unsupported operators with actionable messaging *(variable table + reserved vocabulary highlight actionable errors in builder/UI)*.
- ✅ Align with `PROPOSAL-remap-expression-pipeline.md` on reserved vocabulary (`self`, `time`, derived inputs) and document expectations for new bindings *(reserved vocabulary exported for tooling + builder registration updates)*.
- ✅ Introduce a shared expression variable table/API in `@vizij/node-graph-authoring` so UI bindings and IR builders resolve identifiers consistently *(builder + UI now share reserved vocab and diagnostics)*.
- ✅ Type enforcement now validates scalar/vector/time arguments using metadata-derived shapes, with actionable diagnostics when mismatches occur (`graphBuilder.ts:430-620`).
- ✅ Reserved variables `time`, `deltaTime`, and `frame` now resolve through a single canonical IR time source (see `packages/@vizij/node-graph-authoring/src/graphBuilder.ts:769-808` and `__tests__/graphBuilder.test.ts:1013-1037`).
- ⏳ Expression persistence will drop duplicated operator/spring/damp/slew/remap metadata so the parsed expression/AST is the only source of truth; regeneration happens in the compiler/inspector layers when diagnostics are requested.

#### Expression Migration Plan

1. **Parity phase (complete)** – Keep legacy bindings untouched while routing all evaluation through the IR layer. Expression parsing now leverages shared vocabulary + reserved-variable tables; diagnostics point back to bindings without breaking existing saves/imports.
2. **Expression-first enablement (complete)** – Vector-aware slot typing, auto-alias, reserved-variable chips, and case builders now land across `@vizij/node-graph-authoring` and the BindingEditor; flipping the defaults is now blocked only on rollout/docs (`vizij-web/packages/@vizij/node-graph-authoring/src/state.ts:492-618`, `vizij-web/apps/vizij-authoring/src/hooks/useRigController.ts:136-166`, `vizij-web/apps/vizij-authoring/src/components/animatable-panel/BindingEditor.tsx:820-1184`).
3. **Conditional & advanced nodes (pending)** – Introduce conditional/case helpers plus richer UI affordances behind feature flags, ensuring IR compilation remains the single source of truth. Backwards compatibility is preserved by keeping slot data until the migration flag is dropped.

## 4. Completed Highlights (Context)

- Scalar/vector/time node coverage, conditional CASE builders, and operator metadata all ship through `@vizij/node-graph-authoring`, with regression fixtures in `graphBuilder.test.ts` / `irRegression.test.ts`.
- vizij-authoring persists IR snapshots, exposes Drivers-panel diagnostics, and offers an IR inspector/diff drawer plus beta toggles for vector/conditional workflows.
- Binding persistence/import/export flows now carry slot `valueType`, CASE metadata, and operator stacks end-to-end, so round-trips keep IR context intact (pending removal of redundant operator serialization per the expression-only persistence plan).
- ⏳ Export payloads will be trimmed so GLB bundles carry only the GraphSpec plus the IR state required to restore authoring; diagnostics, snapshots, and machine reports move to optional sidecar artifacts.
- CI already enforces registry drift, IR compiler parity, and expression catalog coverage via the existing Vitest suites and `vizij-ir-report` CLI.

## 5. Remaining Work – Path to Full IR Adoption

The foundations (metadata, IR builder/compiler, expression model, and current UI hooks) are in place. The remaining work focuses on (a) guaranteeing parity, (b) switching the runtime/import/export surfaces to IR by default, (c) modernising the UI around IR concepts, and (d) documenting + rolling out the migration.

### 5.1 Parity & Confidence

- ✅ **Deterministic IR→GraphSpec tests** – Landed via `packages/@vizij/node-graph-authoring/src/__tests__/irParity.test.ts` + refreshed fixtures in `src/__tests__/__fixtures__/graphSpecParity.ts`; every fixture now rebuilds IR, compiles it, and diff-checks the GraphSpec. Remaining work: keep fixtures fresh whenever registry layouts change (documented in the README).
- ✅ **Expression coverage** – CASE metadata, vector slots, derived inputs, and stacked operators now have explicit parity cases (same suite/files as above), covering the constructs introduced in the expression-first flow. Remaining work: add future coverage only when new node families launch.
- ✅ **Authoring smoke check** – `apps/vizij-authoring/src/__tests__/graphAuthoringSmoke.test.ts` loads saved bindings, runs `buildRigGraphSpec`, and asserts the deterministic hash, giving UI parity with the package suite. Remaining work: wire the test into any future app-level CI target.
- ✅ **Telemetry hooks (retired)** – The dual-run logger collected its final sample window and has been removed; vizij-authoring now runs the compiled IR graph by default with no legacy dual-run path. Future regressions rely on parity fixtures + the IR inspector diff workflow.

### 5.2 Runtime, Export/Import & Toolchain

GraphSpec remains the runtime source of truth for the node graph; IR exists to reconstruct authoring state, drive diagnostics, and feed the compiler that produces the GraphSpec handed to render/runtime surfaces.

- ✅ **IR runtime default** – `apps/vizij-authoring/src/hooks/useRigController.ts` now compiles IR graphs for runtime loads, falling back to the legacy GraphSpec only if IR compilation fails; the dual-run feature flag and telemetry plumbing have been deleted.
- ⏳ **Export payload slimming** – Graph exporter / GLB embed flow in `apps/vizij-authoring/src/App.tsx` will emit the authoritative GraphSpec plus the IR required to restore authoring state, with diagnostics/machine reports generated only as optional sidecars. Remaining work: align downstream importers and update export UI copy.
- ✅ **IR-aware importer** – `apps/vizij-authoring/src/rig/importer.ts` accepts machine reports/IR dumps and compiles legacy GraphSpecs immediately so authoring state stays IR-backed. Remaining work: add validation messaging for corrupt/partial IR payloads.
- ✅ **vizij-ir-report enhancements** – `packages/@vizij/node-graph-authoring/src/cli/reportIr.ts` exposes `--dump`/`--diff` plus golden-regeneration helpers, covering parity verification from the CLI. Remaining work: optional convenience wrapper script if contributors request it.

### 5.3 UI & Workflow Modernization

- ✅ **Expression-first binding UI** – BindingEditor is now the sole editing surface for parent bindings: the legacy remap panel has been replaced with an expression summary, slot badges, and inline scalar/vector toggles (`StandardInputsSection.tsx`, `BindingEditor.tsx`), while SlotDiagnostics still surface upstream context without duplicate UI.
- ✅ **Drivers panel refresh** – Drivers now surface IR stats, inspector/download actions, and the new expression summary without the legacy self-remap chips, keeping the panel lightweight while still linking to the IR inspector drawer.
- ⏳ **In-app IR tooling** – The inspector drawer now copies machine reports, downloads IR JSON, copies a ready-to-run `vizij-ir-report --diff` command, and can generate a bug-report template populated with diff output. Follow-up: document the workflow in `vizij-ir-report` docs and thread the template into our issue/retro process.
- ✅ **Vector literal support** – The expression parser + IR builder now accept `vec(...)` and `[ ... ]` literals, so functions like `piecewise_remap` can be composed directly in expressions. UI work remains to expose the literal helpers prominently, but the backend pieces are in place.
- 📝 **Demo content** – README callouts cover the expression-first workflow + fixture-refresh steps; still need a lightweight demo script (video or walkthrough) and a beta doc for downstream teams before flipping the runtime flag.

### 5.4 Documentation, Release & Rollout

- ⏳ **Contributor guides** – Docs still describe mixed IR/legacy flows. Need to update `graph_authoring_ir-reference.md`, `apps/vizij-authoring/AGENTS.md`, and package READMEs with parity harness steps, fixture refresh workflow, and runtime flag instructions; README parity notes already landed but the broader guides lag behind.
- 📝 **Migration checklist** – Not yet written. Action: draft the step-by-step for teams migrating exports/imports to machine reports (tools to run, expected diffs, fallbacks).
- 📝 **Release notes & comms** – Migration bulletin + rollback guidance pending. Will pull content from the checklist + telemetry results once the runtime flag date is set.
- 📝 **Post-rollout retro** – To schedule only after IR default rollout; no prep beyond creating the placeholder agenda.

## Stages

1. **Stage 1 – Metadata Foundations** *(Complete — generator, helpers, drift script in place.)*
2. **Stage 2 – Package Integration** *(Complete — shared package adopted by the authoring app.)*
3. **Stage 3 – IR Design & Compiler** *(Complete — builder emits IR first, compiler derives GraphSpec, CLI tooling available.)*
4. **Stage 4 – Expression Migration** *(Complete — parser/variable table, vector & CASE tooling, IR inspector, and metadata wiring landed.)*
5. **Stage 5.1 – Parity & Confidence** *(Complete — parity harness + smoke tests gate every IR change.)*
6. **Stage 5.2 – Runtime/Export/Import Modernization** *(In progress — authoring/runtime default to IR, but export-artifact slimming and richer import validation UI are still pending.)*
7. **Stage 5.3 – UI & Workflow Modernization** *(In progress — remaining scope is polishing the in-app IR tooling surface and documenting the inspector workflow.)*
8. **Stage 5.4 – Documentation, Release & Rollout** *(In progress — contributor guides, migration checklist, release comms, and post-rollout retro prep are tracked but still outstanding.)*

## Immediate Next Steps

1. ✅ **Binding UI cleanup** – The legacy parent-remap panel has been replaced with the expression summary + slot badges and vector toggles in `StandardInputsSection.tsx`/`BindingEditor.tsx`, so the expression-first workflow is now the only path.
2. ✅ **Drivers panel refresh** – Drivers exposes IR stats, download/inspector actions, and the new binding summary without the legacy chips, keeping the refreshed layout lightweight.
3. ⏳ **Import validation messaging** – Add explicit error/warning states when embedded IR or machine reports are missing/corrupt during import (`apps/vizij-authoring/src/rig/importer.ts`), including guidance for fallback steps.
4. ✅ **Documentation refresh** – Update `graph_authoring_ir-reference.md`, `apps/vizij-authoring/AGENTS.md`, and the `@vizij/node-graph-authoring` README with the IR-first runtime/export/import workflow, parity harness checklist, and inspector-based debugging instructions. - *Moved to Website Project (Documentation Strategy).*
5. 📝 **Migration kit & comms** – Publish the migration checklist, release bulletin, and post-rollout retro template so downstream teams know how to adopt machine reports, verify outputs, and escalate regressions. - *Moved to Website Project (Documentation Strategy).*
6. ✅ **Canonical time node** – `time`/`deltaTime`/`frame` now collapse into a single IR node with shared diagnostics/tests (`graphBuilder.ts:769-808`, `__tests__/graphBuilder.test.ts:1013-1037`).
7. ⏳ **Expression persistence trim** – Remove serialized spring/damp/slew/remap operator stacks from binding storage; rely on the expression parser/AST when regenerating diagnostics and node graphs.
8. ⏳ **Export artifact split** – Ensure default exports package just GraphSpec + IR while the IR inspector/CLI handle optional diagnostics or snapshots as separate downloads.
9. ✅ **Transition operator params** – Expressions now accept literal arguments for `spring`/`damp`/`slew`, and the IR builder emits node params directly so editors expose stiffness/half-life/rate without custom stacks.
10. ✅ **Chain inspector parity** – Drivers share the same upstream/downstream chain visualiser and denser binding layout as Properties, with expression parsing deferred until blur to avoid mid-edit warnings.

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
- `pnpm --filter @vizij/node-graph-authoring test -- --runInBand` (IR parity + snapshot suite)
- `cargo run -p vizij-graph-registry-export -- --output /tmp/registry.json --pretty`
- Future: Metadata drift guard (`pnpm run verify-registry`) wired into CI + pre-push hooks.
- Future: Authoring smoke graph exercising scalar/vector/conditional/timeful nodes (`pnpm --filter vizij-authoring test -- --run vector-suite`).
