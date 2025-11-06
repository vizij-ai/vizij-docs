# Vizij Authoring Program Summary
<!-- tags: status=tracking; topics=architecture,workflow,graph-ir,ui-ux,robot-rig,documentation -->

## Folder Guide
| Document | Focus | Status |
| --- | --- | --- |
| [Authoring Control Architecture](authoring_control_arch.md) | How renderables, animatables, and controls stay in sync. | In production with minor polish follow-ups. |
| [Authoring Surface Update Plan](authoring_update.md) | Upcoming auto-input and UI refresh plan for the authoring surface. | Planning work in motion. |
| [Graph Authoring Extension Plan](graph_authoring_plan.md) | Phased roadmap for the IR layer and broad node coverage. | Metadata foundation shipped; IR and expression refactors pending. |
| [Stand Up Graph IR Execution Plan](stand_up_graph_ir_plan.md) | Detailed breakdown of the IR milestone, tasks, and current status. | New execution plan authored; IR implementation backlog queued. |
| [Expression-Driven Binding Proposal](PROPOSAL-remap-expression-pipeline.md) | Proposal for migrating bindings to an expression-first pipeline. | Proposal drafted; awaiting IR scaffolding and approval. |
| [Graph Control Extension – Status](graph_extension.md) | Snapshot of shipped graph control features and pending polish. | Core shipped; refinement tracked. |
| [Hierarchical Standard Input Remaps](hierarchical_graph.md) | Documentation of derived input workflow and controller wiring. | Feature live with UX follow-ups. |
| [Import Reconstruction](import_reconstruction.md) | Strategy and progress for restoring state from GLB + graph exports. | Implementation underway; testing/docs outstanding. |
| [Robot Rig Graph Generation Plan](robo_rig_gen_plan.md) | Concept for migrating robot rig mappings into dedicated graphs. | Concept stage; implementation not started. |

## Architecture
- **Authoring Control Stack** – Renderables live in `@vizij/render` and expose animatable features flattened by `extractAnimatableComponents`; `useRigController` reconciles preset, auto, and custom `StandardRigInput`s, keeps rename pipelines in sync, persists descriptors, and exports/imports graph metadata through `buildRigGraphSpec` and `rehydrateRigDataFromGraph`.
- **Derived Input Hierarchy** – A unified `AnimatableBinding` model drives both animatable slots and parent/child standard inputs; `BindingEditor` exposes shared remap/expression tooling, exports capture lineage, and controller helpers manage dependency pruning plus cycle diagnostics.
- **Graph Authoring IR** – Rust now exports the canonical node registry into `@vizij/node-graph-wasm`, and `@vizij/node-graph-authoring` consumes that metadata; the remaining work is to land the IR types/compilers outlined in `stand_up_graph_ir_plan.md` so bindings compile through the new layer before emitting runtime `GraphSpec`s.
- **Import/Export Pipeline** – Authoring state rehydrates from the GLB’s RobotData (including baked feature labels) plus embedded `vizij.inputs`/`vizij.bindings`; sanitised identifiers, signature verification, and metadata-driven reconstruction keep exports/imports lossless while migrating legacy saves.
- **Robot Rig Mapping** – The runtime package now consumes persisted `RobotRigGraph` assets via `RobotRigRunner`, and the dedicated authoring experience lives inside `vizij-authoring` (replacing the earlier `demo-render-no-rig` flow). Remaining work focuses on diagnostics and fallback rigging for newly discovered animatables.

## Goals
- Auto-provision standard rig inputs for every animatable property, eliminate manual add/delete flows, and present dense yet navigable feature trees with group-based filters.
- Maintain naming coherence across renderables, controls, and exports so renames cascade safely through bindings, persistence, and re-imported graphs.
- Expand graph authoring to cover nearly all `NodeType`s through metadata-driven IR builders, richer expression vocab, and vector/conditional/stateful node support.
- Deliver a robust import-only workflow that exactly reconstructs authoring sessions from GLB + graph pairs without relying on deprecated summary artifacts.
- Shift robot rig mappings from TypeScript heuristics into reusable graph assets that runtime loaders can consume directly.
- Strengthen documentation, examples, and automated validation so contributors can iterate safely across UI, graph, and runtime boundaries.

## Remaining Work
- **Harden the refreshed authoring interface.** Driver toggles, badges, and disabled state UX are live; remaining work centers on automated coverage, QA sign-off, and polish feedback from design.
- **Grow the graph IR beyond simple math.** Metadata plumbing is complete, but we still need the IR data model, compiler, and expanded node coverage listed in `stand_up_graph_ir_plan.md`, plus the expression-first workflow from `PROPOSAL-remap-expression-pipeline.md`.
- **Make the importer rock solid.** End-to-end regression tests, clearer error messaging, and smoother migration helpers are required so legacy exports without full metadata load safely.
- **Update guides and walkthroughs.** Parent binding docs, the import-only flow, and future robot rig authoring guides all need screenshots and contributor notes so teams can self-serve.
- **Automate broad regression coverage.** RTL smoke tests plus CI suites should exercise derived controls, the graph compiler, and the import/export round-trip to spot regressions early; metadata/unit tests have landed, but UI automation remains open.
- **Polish the robot rig graph pipeline.** Keep graphs current across robots, surface unmapped animatables with runtime/add-at-runtime rigging affordances, and round out contributor docs and automation.

## Implementation Plan
1. **Stabilise Core Inputs & UI**
   - Land auto-generated standard inputs with reconciled state/persistence, remove disabled flags, and wire enable/disable behaviour into bindings.
   - Ship the nested feature tree components, collapse-state reducer, path-normalised rename helpers, and root filter persistence.
   - Polish Standard Inputs UI (group badges, inline parent editors, slider previews) and document the new workflows.
2. **Stand Up Graph IR Infrastructure**
   - Generate static node metadata from Rust into `@vizij/node-graph-wasm`, expose lookup helpers, and add drift checks (generator live; drift check outstanding).
   - Create the `@vizij/node-graph-authoring` package (IR types, builder/compiler) and refactor the app’s `graphBuilder` to target the IR (package live; IR layer pending).
   - Port existing tests to the package and maintain parity snapshots during the transition (math/logic coverage in place; vector/stateful suites queued).
3. **Expand Node Coverage & Expression Support**
   - Map scalar operators/functions to metadata-backed factories, extend expression parsing, and add validation suites.
   - Implement IR helpers and UI/state updates for stateful/time nodes, vector slot management, and conditional/case logic, covering broadcasting and branch labelling.
   - Integrate new controls into `BindingEditor`, update summaries, and extend Vitest coverage plus integration stories.
4. **Complete Import Reconstruction**
   - Enforce sanitised IDs and remap defaults at export, embed complete metadata, and audit legacy data during load.
   - Rehydrate authoring state from metadata, run signature comparisons, and expose accept/cancel flows on mismatch.
   - Add regression tests, migration scripts, and documentation for the import-only workflow.
5. **Robot Rig Graph Pipeline**
   - Maintain the `RobotRigGraph` schema and authoring tooling now housed in `vizij-authoring`, keeping existing robot assets in sync and covering new ones.
   - Keep `RobotRigRunner` aligned with runtime needs, adding telemetry/diagnostics for surfaces that ingest graphs and highlighting unmapped animatables with lightweight default rigging options.
   - Finish migrating any residual heuristic TypeScript rigs, document contributor workflows, and track stretch goals such as graph tagging or live reload support.
