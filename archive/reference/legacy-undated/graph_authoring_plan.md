# Graph Authoring Extension Plan
<!-- tags: status=plan; topics=graph-ir,architecture,tooling,automation-testing -->

## 1. Plain Language Overview
We want the authoring tool in `vizij-web` to build node graphs that match almost every `NodeType` defined in `vizij-rs`, excluding the IO, Robotics, and Blend helper categories. To do that without creating fragile code, we will introduce a simple internal description of the graph that we can reason about before we output the final `GraphSpec`. This internal description is called an **Intermediate Representation (IR)**. In this plan, “IR” means a clean data model that sits between the user interface and the final WASM graph specification.

> **2024 update:** The binding editor is moving to an expression-driven workflow (see `PROPOSAL-remap-expression-pipeline.md`). The IR must therefore accept bindings described as expressions (`y = …`) with variables (including the reserved `self` alias, auto-generated remap defaults, and time-based helpers) and compile those into graph nodes.

### What is the IR?
* The IR is a structured description of the graph that we control in TypeScript.
* Each IR node knows its `NodeType`, its inputs, its outputs, and the parameters it requires.
* Builder code adds IR nodes based on user bindings or editor features.
* A compiler step converts the IR into the `GraphSpec` format that the runtime already expects.

The IR lets us test graph construction rules in one place, catch mistakes early, and rely on shared metadata so new nodes are easy to add.

```
[Authoring UI] → [Binding state] → [Graph IR] → [GraphSpec for runtime]
```

## 2. Current Architecture
### 2.1 Data sources
* Node types live in `vizij-rs/crates/node-graph/vizij-graph-core/src/types.rs` and the node registry is in `…/schema.rs`.
* The authoring app (`vizij-web/apps/vizij-authoring`) has React editors such as `BindingEditor.tsx` and `PoseRigWorkbench.tsx`.
* Graph building happens in `apps/vizij-authoring/src/rig/graphBuilder.ts`.
* Math expressions are parsed by `apps/vizij-authoring/src/rig/expression.ts`.
* Binding state helpers are in `apps/vizij-authoring/src/rig/state.ts`.

### 2.2 How graphs are built today
1. The UI collects binding slots, expressions, and remap settings.
2. `graphBuilder.ts` walks through components and inputs, creates constant nodes, remap nodes, and math nodes on the fly, and emits a `GraphSpec`.
3. The builder has hand-written knowledge of only a small math subset (add, subtract, trig, clamp, power, etc.).
4. Vector nodes, logic nodes, and time-dependent nodes are not handled.
5. Metadata such as default parameter ranges lives in TypeScript code or is duplicated.
6. Tests in `graphBuilder.test.ts` cover only the supported math slice.

### 2.3 Pain points
* Adding a new node requires editing multiple sections in `graphBuilder.ts`.
* There is no shared reference to the Rust registry; keeping defaults in sync is manual.
* Complex graphs (vector nodes, conditional nodes) would need more hand-written branches.
* Expression parsing is the only way to inject logic, so supporting richer nodes becomes awkward.

## 3. Target Architecture
The proposed shape adds two core ideas: (1) shared metadata generated from Rust, and (2) an IR layer that owns node assembly. The UI changes remain incremental.

### 3.1 Shared node metadata
* Extend `@vizij/node-graph-wasm` so that its build process emits a baked `registry.json` generated directly from `schema::registry()` as part of the package publish step (for example through a small Rust helper inside `vizij-rs` that runs during `pnpm run build`).
* Add a TypeScript entry point (`metadata/index.ts`) inside `@vizij/node-graph-wasm` that loads the baked JSON and exposes structured helpers (e.g. `getNodeRegistrySync()`, `listNodeTypes()`, `lookupNode(typeId)`), alongside the existing async `getNodeSchemas()` for runtime access.
* Update package exports so downstream consumers can choose between the static JSON helpers and the dynamic WASM call without needing to duplicate registry logic.
* Add regression tests in the wasm package that fail if `registry.json` is stale compared to the Rust source, ensuring the baked metadata stays accurate.

### 3.2 Graph IR layer
* Create `packages/@vizij/node-graph-authoring/` (new workspace package) with a framework-agnostic IR implementation:
  * `irTypes.ts`: definitions for `IrNode`, `IrPort`, `IrGraph`, etc.
  * `irBuilder.ts`: utilities to create nodes, connect edges, and request constants/remap blocks.
  * `irCompiler.ts`: converts `IrGraph` to `GraphSpec`, including the existing optimisations (fold single-use constants into defaults).
* Refactor `apps/vizij-authoring/src/rig/graphBuilder.ts` so it depends on the new authoring package’s API instead of manipulating `GraphSpec` directly.
* All node creation (constants, remaps, math, logic, vector, stateful nodes) goes through the IR builder API, which internally relies on the `@vizij/node-graph-wasm` metadata helpers for validation.

### 3.3 Expression support
* Keep `expression.ts` for scalar formulas and extend it to ingest the new binding expressions generated by the expression-first editor.
* Map parsed functions/operators to IR node templates fetched from metadata, covering remap/remap removal, math ops, logic, time functions (`damp`, `slew`, `oscillator`, `time`), and vector constructors.
* Extend the expression vocab to cover scalar nodes such as `abs`, `min`, `max`, logical comparisons, time functions, and reserved aliases (notably `self`).
* Allow expressions to reference derived results from special nodes when safe (for example: oscillators cannot be embedded directly in a scalar expression but can be chained after the expression through the IR).
* Provide helper utilities for the UI to query parameter defaults, including the auto-generated remap ranges and the “remove remap → adjust defaults” flow.

### 3.4 Stateful nodes and operators
* Add an “operator” concept in bindings so a user can attach a smoothing or oscillator step after an expression (whether authored explicitly or via helper functions).
* Operator configuration lives alongside the binding, and the IR builder inserts the proper node (`Spring`, `Damp`, `Slew`, `Time`, `Oscillator`) with metadata-driven defaults.
* UI changes appear in `BindingEditor.tsx` and related files to expose checkboxes or dropdowns for these options.

### 3.5 Vector authoring
* Treat vector animatables by composing scalar sources. The IR builder will insert `Join` nodes and, when the user has vector inputs, vector math nodes (`VectorAdd`, `VectorScale`, etc.).
* Extend the binding state (`state.ts`) so slots can declare whether they output scalar or vector values. Default remains scalar to avoid breaking existing bindings.
* Update UI components to reflect the slot type and allow selecting vector inputs where relevant.

### 3.6 Conditionals and logic
* Use metadata to expose comparison nodes (`GreaterThan`, `LessThan`, etc.) and conditional nodes (`If`, `Case`).
* For expressions, allow tokens such as `if(is_smile, A, B)` that compile to the right node.
* For richer nodes like `Case`, provide UI affordances to manage labels and routes.

### 3.7 Diagram
```
                           ┌─────────────────────┐
                           │ Rust node registry  │
                           │ (schema.rs)         │
                           └─────────┬───────────┘
                                     │ export JSON
                               ┌─────▼─────┐
                               │ Metadata  │
                               │ package   │
                               └─────┬─────┘
                                     │
┌──────────────────────┐      ┌──────▼──────┐      ┌───────────────────────┐
│ Binding UI + state   │─────▶│ Graph IR    │─────▶│ GraphSpec compiler    │
│ (React + state.ts)   │      │ builder     │      │ (to WASM format)      │
└──────────────────────┘      └──────┬──────┘      └──────────┬────────────┘
                                     │ transports configs      │ emits spec
                                     ▼                        ▼
                              Tests + validation       Runtime consumption
```

## 4. Implementation Roadmap
### Phase 0 — Documentation and alignment
* Create this document (`graph_authoring_plan.md`) to guide the work.
* Review `schema.rs` and `types.rs` to identify all target `NodeType` values.
* Agree on the metadata package location and format.

### Phase 1 — Metadata extraction (built into wasm package)
* **Rust (`vizij-rs`)**
  * Add a small binary (e.g. `crates/node-graph/emit-registry`) or direct build script invoked from the existing `@vizij/node-graph-wasm` build flow that dumps `schema::registry()` to JSON.
  * Wire the npm package’s build step (`pnpm run build`) to execute the generator before bundling, depositing `registry.json` under `npm/@vizij/node-graph-wasm/dist/metadata/`.
  * Add a test in `vizij-rs` (or `node-graph-wasm` tests) that compares a freshly generated registry to the committed JSON to catch drift.
* **JavaScript/TypeScript (`vizij-rs/npm/@vizij/node-graph-wasm`)**
  * Add `src/metadata/index.ts` that loads `registry.json`, provides typed helper functions, and re-exports the `Registry`/`NodeSignature` types.
  * Update `package.json` exports map so `@vizij/node-graph-wasm/metadata` (or similar) resolves to the helper module; continue to expose `getNodeSchemas()` for runtime fetching.
  * Include ESM/CJS-compatible loading paths; document how to import the metadata without triggering WASM initialisation.
  * Add unit tests verifying helper functions (e.g. `lookupNode`) behave as expected.
* **Downstream updates**
  * Audit packages that re-export from `@vizij/node-graph-wasm` (for example `@vizij/node-graph-react`) and forward the new helpers where useful.
  * Update docs (npm README) explaining static vs. runtime registry access.

### Phase 2 — Introduce the authoring IR package
* Scaffold `packages/@vizij/node-graph-authoring` with TypeScript config, build setup, and Vitest suite.
* Move IR-related types/builders/compilers into the package, ensuring it depends on:
  * `@vizij/node-graph-wasm` (for metadata helpers and GraphSpec types).
  * `@vizij/utils` (for value helpers/remap defaults) as needed.
* Port constant/remap/expression logic from `graphBuilder.ts` into the package and expose a stable API (e.g. `buildRigGraphSpec()` that accepts binding state).
* Add snapshot tests inside the new package for the existing math functionality.

### Phase 3 — Adopt the authoring package in the app
* Replace direct `graphBuilder.ts` implementations with calls into `@vizij/node-graph-authoring`.
* Keep thin adapters in the app layer to bridge to UI state (e.g. binding maps, pose rig components).
* Update existing tests in `apps/vizij-authoring` to use the package API; retain parity tests confirming outputs match the pre-package behaviour.
* Begin surfacing the expression-first binding UI, backed by the new package (auto-generated `y = remap(v1, …)`, removable remap, variable bindings).

### Phase 4 — Scalar node coverage
* Use the metadata helpers from `@vizij/node-graph-wasm` to wire scalar nodes for arithmetic, comparisons, logic, and core math functions (abs, min, max, etc.).
* Extend `expression.ts` so functions map to metadata-driven node factories instead of hand-written cases.
* Add tests in the authoring package that cover each new node type, ensuring the IR builder validates inputs and parameters.
* Ensure reserved aliases (e.g. `self`) and auto-generated variable defaults round-trip through the parser and IR without extra wiring.

### Phase 5 — Stateful and time-based nodes
* Add operator options into binding state (`state.ts`) and the UI (`BindingEditor.tsx`, `PoseRigWorkbench.tsx` if needed).
* Implement IR helpers for `Time`, `Oscillator`, `Spring`, `Damp`, and `Slew`.
* Build tests that check parameter defaults, input/output correctness, and that disabling an operator removes the corresponding node.

### Phase 6 — Vector nodes
* **State & metadata** — extend `packages/@vizij/node-graph-authoring/src/state.ts` so every slot carries an explicit `valueType` (`"scalar"` or `"vector"`), track component-safe ids, and ensure `ensureBindingStructure`, `createDefaultBinding`, and summary generation keep the extra fields in sync.
  * Promote existing helpers (clone, normalize, alias rewrites) to preserve `valueType` and default the first slot to match the component type (`scalar` for numeric components, `vector` for multi-axis animatables).
  * Update binding import/export helpers in `vizij-web/apps/vizij-authoring/src/rig` so saved projects round-trip the new metadata without losing compatibility with previously stored bindings.
* **IR authoring** — add vector node factories in `packages/@vizij/node-graph-authoring/src/graphBuilder.ts`, leaning on metadata lookups to configure `vectoradd`, `vectorsubtract`, `vectormultiply`, `vectorscale`, `vectornormalize`, `vectordot`, `vectorlength`, `join`, `split`, `vectormin`, and `vectormax`.
  * Allow scalar inputs to broadcast into vector operands when signatures permit it, and ensure missing components fall back to the animatable defaults before join/pack stages.
  * Capture vector-aware summaries so validation errors identify the component (`x`, `y`, `z`, `r`, `g`, `b`) that failed.
* **UI integration** — surface vector slot configuration inside `BindingEditor.tsx` and related panel components: render component grids, allow per-component slot assignment, and show clear labels when mixing scalar and vector inputs.
  * Add lightweight affordances (badges/tooltips) so authors understand when a vector binding falls back to defaults or is partially wired.
* **Testing** — extend the Vitest suite in `packages/@vizij/node-graph-authoring/src/__tests__/graphBuilder.test.ts` and the mirroring app tests to cover vector arithmetic, scalar-to-vector broadcasting, join/split defaults, and regression cases sourced from fixture metadata.
  * Add snapshot fixtures for multi-component animatables to ensure join ordering and default filling stay stable across refactors.

### Phase 7 — Conditional and case handling
* **IR factories** — introduce metadata-backed builders for `greaterthan`, `lessthan`, `equal`, `notequal`, `if`, and `case` nodes, ensuring argument validation is driven by signature min/max counts and that fall-through/default branches always resolve.
  * Extend the expression parser mappings so infix comparisons (`>`, `<`, `==`, `!=`) and logical combinators (`and`, `or`, `not`, `xor`) compile to the new nodes while preserving existing math precedence.
* **Authoring UI** — enhance `BindingEditor.tsx` (and any supporting modals) so authors can define comparison thresholds, configure per-branch outputs, and assign case labels/default routes. Ensure the UI surfaces validation feedback when labels are missing or duplicated.
  * Update state helpers to persist conditional metadata alongside slots, including friendly names for each branch so summaries and CSV exports remain readable.
* **Verification** — add unit tests that exercise each conditional node through the IR layer, plus integration tests that build representative graphs (e.g. blendshape gating, multi-case routing) and assert both `GraphSpec` output and UI summaries.
  * Include negative tests that assert metadata-driven validation rejects malformed bindings (missing branch, mismatched counts, unsupported operators).

### Phase 8 — Polish and rollout
* **Documentation** — refresh `vizij-web/apps/vizij-authoring/README.md` and package-level READMEs to walk through the metadata + IR architecture, documenting how to add new scalar, vector, and conditional nodes.
  * Add a contributor cookbook covering slot typing, operator toggles, and expression vocabulary so future additions stay consistent.
* **Quality gates** — wire the new vector/conditional suites into CI (lint, `pnpm test`, `pnpm typecheck`) and ensure regeneration checks for `registry.json` still report drift.
  * Introduce a smoke test or story that builds a sample graph exercising every supported node type; run it in CI to guard against metadata drift or breaking schema changes.
* **Release checklist** — update change logs across affected packages, verify workspace dependency bumps, and prepare a rollout guide describing migration steps for existing projects (including how legacy bindings are upgraded on load).
  * Plan a beta cut inside `vizij-web/scripts/release-tag.sh` so stakeholders can validate vector and conditional authoring before promoting to stable.

## 5. File and Package Impact Summary
* `vizij-rs`
  * Additional helper/binary for registry export invoked during npm package build.
  * Tests ensuring baked metadata matches runtime registry.
* `vizij-rs/npm/@vizij/node-graph-wasm`
  * New build step generating `dist/metadata/registry.json`.
  * Added `src/metadata/index.ts` (and possibly type declarations) exporting structured helpers.
  * README updates describing metadata usage.
  * Adjusted package exports and tests around metadata helpers.
* `vizij-web/packages/@vizij/node-graph-authoring` (new)
  * Houses IR logic, expression mapping, and graph compilation helpers.
  * Provides reusable APIs leveraged by the authoring application (and other projects if desired).
* `vizij-web/apps/vizij-authoring/src/rig`
  * `graphBuilder.ts`: slim wrapper delegating to the new package.
  * `graphBuilder.test.ts`: now validating results via the package; may import shared fixtures.
  * `expression.ts`: updated to use metadata-driven function mapping.
  * `state.ts`: extended to track slot types and operator settings (still living in the app until we decide to relocate).
* `vizij-web/apps/vizij-authoring/src/components`
  * `BindingEditor.tsx` and related components gain controls for operators, vector slots, and conditional labels.
  * Styling tweaks in `styles.css` as needed to accommodate new UI elements.
* `vizij-web/package.json` and root scripts
  * Ensure local development instructions include rebuilding `@vizij/node-graph-wasm` to refresh metadata.
  * Add workspace references to the new authoring package.

## 6. Testing and Validation
* Extend the existing Vitest suite with:
  * IR snapshot tests for the currrent math functionality to ensure parity during refactoring.
  * New suites for scalar logic, stateful nodes, vector operations, and conditionals. Each suite should cover both IR structure and final `GraphSpec`.
  * A regression test that loads the metadata JSON and verifies that every node (minus excluded categories) has at least one authoring test.
* Add integration tests that simulate building an authoring graph from user bindings and assert the generated `GraphSpec` matches expected metadata.
* Consider a pre-commit or CI check that regenerates metadata and fails if the working copy changes, keeping Rust and TypeScript in sync.

## 7. Risks and Mitigations
* **Metadata drift** — Mitigated by auto-generating `registry.json` during the wasm package build and adding CI checks that regenerate and diff the output.
* **Build complexity for `@vizij/node-graph-wasm`** — Provide clear scripts (`pnpm run build` already performs generation) and document requirements; add unit tests so failures point directly to metadata generation issues.
* **Refactor regressions** — Keep parity tests comparing old and new outputs until the IR port is complete; snapshot the IR output in the authoring package.
* **Cross-package coordination** — Follow workspace versioning best practices, update changelogs, and ensure `vizij-web` references the new authoring package before releasing.
* **Complex UI changes** — Introduce new controls gradually (operators first, then vector toggles) and behind feature flags if needed.
* **Performance** — The IR adds a small layer, but the data volume is modest; static metadata avoids repeated wasm calls during authoring initialisation.

## 8. Conclusion
By introducing a shared metadata package and an intermediate graph representation, we can extend the authoring tool to cover nearly every `NodeType` that matters. The plan above keeps changes organised, reduces brittleness, and gives us a clear checklist of files to touch and tests to write. Once in place, adding new nodes becomes a data change rather than a risky refactor.
