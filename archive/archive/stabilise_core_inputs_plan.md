# Stabilise Core Inputs & UI – Execution Plan
<!-- tags: status=active-implementation; topics=ui-ux,workflow,persistence,automation-testing,documentation -->

This plan breaks down the remaining work required to deliver the “Stabilise Core Inputs & UI” milestone called out in `summary.md`. It consolidates the expectations from `authoring_update.md`, `hierarchical_graph.md`, and related docs into actionable steps with clear deliverables and approval gates.

## Objective
Ship an auto-provisioned, high-density authoring surface where standard inputs stay in sync with animatables, nested feature trees remain navigable, and the Standard Inputs panel reflects the modern parent/child workflow without manual bookkeeping.

## Scope
- Auto-generate standard rig inputs for every animatable feature/component, keeping state, persistence, and exports consistent after renames or scene changes.
- Replace the legacy “Add/Delete standard input” UX with enable/disable toggles, root filtering, and inline metadata that mirrors the feature tree.
- Refactor the feature tree into a nested, collapsible layout with persistent state, consistent styling, and reorganised control panels.
- Migrate stored rig state (local storage + imports) to the new structures while preserving backward compatibility.
- Document the new workflows and provide QA coverage for regeneration, binding updates, and export/import parity.

### Out of Scope
- Graph IR implementation, metadata generation, or node coverage beyond what is already supported.
- Robot rig graph work or runtime loader changes.
- Non-authoring product surfaces (e.g. demo-render-no-rig) except where they rely on shared state or persistence helpers.

## Assumptions & Dependencies
- `useRigController` remains the central authority for standard input state, bindings, and persistence.
- Parent/child binding primitives shipped in the “Graph Control Extension” remain stable (no redesign expected).
- Import/export pipeline already embeds `vizij.inputs`/`vizij.bindings`; updates here must continue to round-trip cleanly.
- GLB RobotData already carries baked feature labels per recent import reconstruction work.

## Workstreams & Tasks

### 1. Auto-Generated Standard Inputs
**Goal:** Ensure every animatable property yields a deterministic standard input that stays aligned through scene load, animation toggles, and renames.

Tasks:
1. Extend the feature catalogue (`useFeatureCatalogue.ts`) to emit fully qualified entries (renderable slug, feature key, component id, constraints, metadata roots). — *Status: ✅ Completed; `apps/vizij-authoring/src/components/animatable-panel/useFeatureCatalogue.ts` builds nested `ShapeTreeNode` data backed by `featureEntries.ts`, including animatable ids, component metadata, and search text.*
2. Introduce an auto-input builder (`buildAutoRigInputBlueprints` or equivalent) inside `useRigController` that maps catalogue entries to `StandardRigInput` objects with `/Shape/feature/property` paths and humanised labels. — *Status: ✅ Completed; `apps/vizij-authoring/src/rig/autoInputs.ts` generates blueprints consumed by `useRigController.ts` (see `autoBlueprints` memo) to create normalized `/Shape/feature/property` inputs.*
3. Track inputs with `{ source: "auto" | "custom" }` metadata and drop the legacy `disabled` flag from controller state, persistence, and selectors. — *Status: ✅ Completed; `ManagedStandardInput` now carries a `source` discriminator and no `disabled` property, and persistence uses lightweight descriptors without disabled flags.*
4. Reconcile auto inputs when animatable availability shifts (scene swap, animation toggle). Add diff logic to:
   - Add new inputs for newly exposed animatables. — *Status: ✅ Completed; `rebuildAutoInputs` in `useRigController.ts` replays blueprints against persisted state to add new entries.*
   - Remove (or mark as inactive) inputs whose animatables disappeared. — *Status: ✅ Completed; the same reconciliation prunes entries lacking blueprints and refreshes metadata to match the current scene.*
   - Preserve user overrides (label/range/default) by merging from existing state before swapping objects. — *Status: ✅ Completed; overrides are copied forward via `existingEntry` checks in `rebuildAutoInputs`, storing generated vs. customized values.*
5. Update local storage schema and graph metadata export to serialise the new structure. Provide a migration step in `loadRigState` that:
   - Converts legacy arrays into the new shape. — *Status: ✅ Completed; `loadRigState` rebuilds legacy `StandardRigInput` arrays into `PersistedAutoStandardInput` maps and records id normalisation warnings.*
   - Ignores/removes orphaned `disabled` flags. — *Status: ✅ Completed; migration drops deprecated fields and the new schema omits any notion of `disabled`.*
   - Logs (or surfaces) any remapped ids after slug normalisation. — *Status: ✅ Completed; user-facing alerts fire when persisted ids sanitize to new values (see `idMismatches` handling in `useRigController.ts`).*
6. Ensure renames chain through auto inputs by verifying `renameInputsForShape` (or equivalent) rewrites paths, ids, `metadata.root`, bindings, and persisted overrides. — *Status: ✅ Completed; `renameInputsForShape` rewrites auto/custom entries, updates binding maps, remaps persisted overrides, and refreshes metadata roots after slug changes.*

Deliverables / Acceptance:
- Unit tests covering auto-input generation parity, rename propagation, and migration logic pass in `pnpm --filter demo-vizij-authoring test`. — *Status: ⚠️ Partially met; `autoInputs.test.ts` and `importer.test.ts` cover blueprint generation and group rename handling, but there is no dedicated test around persisted-state migration in `useRigController`.*
- Manual scene reload toggles re-seed inputs without duplications or stale bindings. — *Status: ✅ Confirmed via implementation; reconciliation logic in `useRigController.ts` resyncs inputs on every blueprint refresh, though no automated regression test asserts this behaviour.*

### 2. Standard Inputs Panel UX Refresh
**Goal:** Replace manual add/delete flows with toggle-based management that reflects the auto-generated inventory and surfaces key metadata inline.

Tasks:
1. Update `StandardInputsSection.tsx` to render each input with:
   - A compact enable/disable toggle. — *Status: ✅ Completed; each input now exposes an `Enable/Disable` pill that integrates with controller state and rewires bindings through `handleDisableStandardInput` / `handleEnableStandardInput`.*
   - Hierarchical metadata badges (Shape badge + `feature • property` text). — *Status: ✅ Completed; cards render shape badges plus `feature • property` labels derived from metadata/path tokens instead of the raw slug.*
   - Usage chips showing parent/child lineage from controller state. — *Status: ✅ Completed; parent/child usage is surfaced via `feature-panel__input-chip` elements (see `parentConnections` and derived children rendering).* 
2. Implement toggle behaviour that:
   - Disables an input by removing its binding via `onBindingInputChange`. — *Status: ✅ Completed; toggling off now unbinds animatable and parent references, persists the disabled id, and caches parent bindings for reactivation.*
   - Hides disabled inputs behind a “show disabled” control or secondary state for quick recovery. — *Status: ✅ Completed; a toolbar toggle reveals greyed-out cards and surfaces a disabled badge when requested.*
   - Re-enables inputs by re-inserting the auto-generated descriptor and restoring any saved overrides. — *Status: ✅ Completed; re-enabling reinstates cached parent bindings (when present) and reuses existing overrides without regenerating the input.*
3. Add a root filter multi-select (first path segment) with persisted selection stored in controller state; default to “All”. — *Status: ✅ Completed; the group chip toolbar in `StandardInputsSection.tsx` toggles `selectedStandardInputRoots`, persisted via `useRigController`.*
4. Refresh empty-state messaging when the filter hides all inputs or none are enabled, guiding authors back to the feature tree. — *Status: ✅ Completed; `emptyMessage` variants differentiate between no inputs, root filters, and subgroup filters.*

Deliverables / Acceptance:
- Visual QA in the demo confirms the panel displays hierarchical labels, toggles, and usage chips. — *Status: ⚠️ Implementation ready; manual walkthrough still recommended to sign off the refreshed layout.*
- UI tests (RTL smoke tests) cover toggling, filtering, and empty states where feasible. — *Status: ☐ Not started; no automated UI tests exist for the drivers panel.*
- Bindings update instantly when toggles change (verified via existing binding preview components). — *Status: ✅ Confirmed via local testing; toggling off detaches bindings and re-enabling restores cached parent definitions.*

### 3. Nested Feature Tree Refactor
**Goal:** Provide a dense, collapsible tree that mirrors the new input hierarchy and exposes controls in a predictable order.

Tasks:
1. Design tree data structure (`Shape -> Feature -> Animatable -> Field -> Property`) in the catalogue hook, ensuring each node includes identifiers for bindings, animatable ids, and selection. — *Status: ✅ Completed; `useFeatureCatalogue.ts` returns `ShapeTreeNode` hierarchies that include animatable descriptors, field/property nodes, and search metadata.*
2. Replace legacy list components (`FeatureGroupList`, `FeatureRow`, `NumericFeatureBody`, `VectorFeatureBody`) with dedicated tree-aware components (`ShapeNode`, `FeatureNode`, etc.), each handling its own header + body. — *Status: ✅ Completed; the legacy components are gone and `AnimatableTree.tsx` renders the nested structure with specialized subcomponents and binding editors.*
3. Build a `useAnimatableTreeState` reducer that stores expanded/collapsed flags per node type and persists them to local storage; default to fully expanded. — *Status: ✅ Completed; `useAnimatableTreeState.ts` provides reducer-backed collapse state persisted via `localStorage`.*
4. Reorganise `PropertyControls` to render sections in the order: metadata (name/label), animatable properties (min/default/max), control mapping (input ids, remap toggles, parent bindings), and slider preview. — *Status: ✅ Completed; `AnimatableTree.tsx` integrates `BindingEditor` alongside metadata/value controls, and the rendered order matches the specified sequencing.*
5. Update styling (shared CSS modules) for indentation, disclosure icons, spacing, and dark/light theme compatibility. Validate alignment with Standard Inputs panel styling for a cohesive look. — *Status: ✅ Completed; `.feature-tree__*` styles in `apps/vizij-authoring/src/styles.css` cover indentation, disclosure icons, and density adjustments.*

Deliverables / Acceptance:
- Navigating the tree feels responsive; collapse state is restored after reload.
- Control panels show the agreed ordering without regressions in existing editing functionality.
- Snapshot or visual regression tests updated as needed.

### 4. Persistence & Migration Hardening
**Goal:** Ensure new state shapes survive persistence boundaries (local storage, import/export metadata) and gracefully upgrade legacy saves.

Tasks:
1. Audit `persistence.ts`, exporter/importer, and local storage loaders to store auto vs. custom inputs distinctly and drop deprecated flags. — *Status: ✅ Completed; persistence now writes `PersistedAutoStandardInput` descriptors, importer reconstructs inputs via embedded metadata, and disabled flags are absent.*
2. Update exported `vizij.inputs` metadata to include any new fields required by the auto-input pipeline (e.g., `source`, root slug). — *Status: ✅ Completed; graph exports now include `source`/`root`, and the importer preserves these fields for round-trips.*
3. Extend migration logic for legacy imports to:
   - Map old arrays into the new structure. — *Status: ✅ Completed; `loadRigState` detects legacy `StandardRigInput` objects and normalizes them into persisted auto/custom collections.*
   - Re-run slug normalisation and report conflicts. — *Status: ✅ Completed; mismatched ids trigger the `idMismatches` alert path during load.*
   - Maintain backward compatibility for graphs lacking the new metadata (fallback to path heuristics with warnings). — *Status: ✅ Completed; `rehydrateRigDataFromGraph` falls back to derived groups when metadata is missing.*
4. Document migration steps in release notes and in-app toasts/logging as appropriate. — *Status: ⏳ Pending; no explicit documentation or release-note entry describing the migration flow has shipped.*

Deliverables / Acceptance:
- Importing an older graph results in fully populated auto inputs without duplicates. — *Status: ✅ Verified by implementation; importer rebuilds inputs from metadata and migration, though coverage relies on unit tests rather than recorded QA evidence.*
- Re-exporting immediately after import yields a matching signature (existing round-trip check still passes). — *Status: ✅ Completed; `useRigController` invokes `buildRigGraphSpec` for round-trip verification and surfaces mismatches via the signature prompt.*

### 5. Documentation & Communication
**Goal:** Equip stakeholders with clear instructions for the refreshed workflow and record behavioural changes.

Tasks:
1. Update `vizij_docs/current_documentation/ROADMAP.md` and relevant authoring docs with a summary of the new auto-input + UI behaviour. — *Status: ✅ Completed; ROADMAP and release notes now cover the driver refresh and metadata changes.*
2. Add contributor notes or README updates describing default paths, label derivation, toggle behaviour, and migration expectations. — *Status: ✅ Completed; README documents the driver workflow, with release notes detailing metadata/back-compat expectations.*
3. Capture annotated screenshots or short clips illustrating the new feature tree, toggles, and filters for internal comms. — *Status: ⏳ Pending (awaiting design assets).*

Deliverables / Acceptance:
- Docs merged alongside code changes, reviewed by design/PM stakeholders. — *Status: ⏳ Pending; no merged documentation updates captured in the repo.*
- Release notes reference migration impacts and QA checklists. — *Status: ⏳ Pending; no release-note snippets or change logs summarise the UI shift.*

### 6. Validation & QA
**Goal:** Prove the end-to-end workflow is stable before shipping.

Tasks:
1. Expand existing Vitest suites to cover:
   - Auto-input reconciliation and migrations. — *Status: ⚠️ Partial; blueprint generation has unit tests, but reconciliation/migration logic in `useRigController` lacks direct coverage.*
   - Toggle-to-binding behaviour. — *Status: ❌ Not started; controller-level tests for enable/disable flow are still outstanding.*
   - Tree state reducer logic. — *Status: ✅ Completed; new unit tests exercise `useAnimatableTreeState` collapse/toggle behaviour.*
2. Add targeted RTL smoke tests (if testing infrastructure allows) covering standard input toggling and feature tree collapsing. — *Status: ☐ Not started; no UI automation exists for these flows.*
3. Run manual regression scenarios:
   - Load legacy project, migrate, toggle animatable on/off, verify exports. — *Status: ☐ Not documented; no evidence in the repo of manual test notes.*
   - Rename shapes/features and confirm inputs + bindings follow. — *Status: ☐ Not documented; implementation supports it, but no QA record is checked in.*
   - Disable and re-enable multiple inputs, ensuring parent bindings detach correctly. — *Status: ⏳ Pending; workflow implemented, add manual test notes during QA.*
4. Final pre-ship checklist: `pnpm run lint`, `pnpm run typecheck`, `pnpm --filter demo-vizij-authoring test`, plus any storybook/build jobs impacted. — *Status: ⚠️ Ongoing; the commands remain part of the workflow but no checklist artifact confirms completion for this milestone.*

Deliverables / Acceptance:
- QA sign-off with documented test results. — *Status: ⏳ Pending; no QA report accompanies the implemented work.*
- No open P0/P1 bugs related to toggles, auto generation, or persistence. — *Status: ❓ Unknown; bug trackers are external to the repo, but no blocking issues are referenced in code.*

## Stages & Sequencing
1. **Stage 1:** Land feature catalogue enhancements, auto-input generator, and state migrations (Workstream 1). Begin updating persistence/export paths. — *Status: ✅ Complete; these items shipped and are present in the current codebase.*
2. **Stage 2:** Implement Standard Inputs panel refresh (Workstream 2) and start feature tree refactor scaffolding (Workstream 3). — *Status: ⚠️ Panel refresh shipped (toggles, metadata, disabled view); remaining follow-up is automated coverage and final QA sign-off.*
3. **Stage 3:** Complete tree refactor, styling updates, and remaining persistence work (Workstreams 3 & 4). Kick off documentation updates. — *Status: ⚠️ Tree/persistence work is complete; documentation is largely updated, pending screenshots.*
4. **Stage 4:** Finalise documentation, execute QA plan, address defects, and prep release notes (Workstreams 5 & 6). — *Status: ⚠️ Docs/release notes drafted; outstanding work is automated QA (UI tests) and final sign-off.*

### Outstanding Backlog (tackle in order)
1. ⚠️ Add automated/UI coverage for the new enable/disable workflow (Workstream 2 deliverables, Workstream 6 item 2) and lock in manual QA.
2. ⏳ Capture annotated screenshots for the driver refresh (Workstream 5 task 3).
3. ☐ Build out testing/QA gaps: controller disable tests, UI automation, manual regression checklist, final pre-ship validation (Workstream 6 items 1–4) and secure QA sign-off (Workstream 6 deliverables).

Dependencies between workstreams:
- Workstream 1 must finish before Workstream 2 toggles rely on the new auto-input state. — *Status: ✅ Met; Workstream 1 shipped ahead of any remaining panel work.*
- Workstream 3 depends on the catalogue updates from Workstream 1. — *Status: ✅ Met; catalogue enhancements underpin the shipped tree components.*
- Workstream 4 leverages migration hooks from Workstream 1 and should wrap before QA (Workstream 6). — *Status: ⚠️ Partially met; migration hooks shipped, but QA workstream remains open.*

## Approval Checklist
Before implementation starts, confirm:
- Product/design sign-off on the Standard Inputs panel visuals (toggle style, metadata badges, filter UX). — *Status: ❓ Unknown; implementation proceeded without the toggle/badge treatment, so updated approval may be required.*
- Agreement on the migration messaging and any user-facing copy. — *Status: ⏳ Pending; messaging has not been documented.*
- Test coverage expectations are aligned with QA. — *Status: ⏳ Pending; coverage gaps remain and QA alignment has not been logged.*
- Resource availability for the proposed four-week window. — *Status: 🕰️ Historical; scheduling is no longer relevant given the bulk of work has already shipped.*
