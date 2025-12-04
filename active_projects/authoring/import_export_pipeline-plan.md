# Import/Export Pipeline – Plan & Tracking
<!-- tags: status=tracking; topics=import-export,persistence,automation-testing,workflow -->

> **Related documents:** [Proposal](import_export_pipeline-proposal.md) · [Reference](import_export_pipeline-reference.md) · [Project summary](summary.md)

## Objective & Scope

Reconstruct authoring state solely from GLB + rig graph files, removing dependence on summary artifacts. Content migrated from `archive/import_reconstruction.md`.

## Workstreams & Status

### 1. Identifier Normalisation

- ✅ Audit existing sanitisation pipeline to ensure IDs normalise at creation time. *(Handled by `vizij-web/apps/vizij-authoring/src/rig/legacyMigration.ts` + associated tests.)*
- 🚧 Legacy audit step now surfaces identifier mismatches via `useRigController` alerts (`hooks/useRigController.ts:3803-3943`), but the accept/decline workflow + persisted decisions are still missing.
- ☐ Update documentation to describe ID acceptance process.

### 2. Graph Parsing & Reconstruction

- ✅ Traversal recognises standard input declarations, remap nodes, and expressions via `vizij-web/apps/vizij-authoring/src/rig/importer.ts`.
- ⏳ Build expression reconstruction to canonical infix form with regenerated aliases (`s1`, `s2`, …).
- ⚠️ Ensure slot alias handling drops legacy concept of alias labels in favour of regenerated identifiers.

### 3. Store Hydration

- ✅ Parsed graph data now hydrates controller state (`rehydrateRigDataFromGraph` in `vizij-web/apps/vizij-authoring/src/rig/importer.ts`).
- ⏳ Re-run existing catalogue/auto-input builders to populate derived metadata post-hydration.

### 4. Validation Loop

- ✅ Diff tool (`vizij-web/apps/vizij-authoring/src/utils/graphDiff.ts`) compares rebuilt vs. imported GraphSpecs with ordering tolerance and limit guards.
- ✅ Validation now runs inside the import flow via the Discrepancy Wizard (`hooks/useRigController.ts:3520-3652` + `components/discrepancy/DiscrepancyWizard.tsx`).

### 5. Persistence Upgrades

- ✅ Exports embed Vizij metadata (labels, custom inputs, summaries) via `packages/@vizij/node-graph-authoring/src/graphBuilder.ts:1780-1820`, keeping imports lossless.
- ⏳ Track schema versioning for incremental enhancements.

### 6. Automation & Documentation

- ⚠️ Add regression tests covering round-trip scenarios (simple, derived inputs, complex expressions).
- ☐ Document import-only workflow, troubleshooting steps, and expected log messages.

### 7. Discrepancy Resolution Workflow

- ✅ Import-time wizard compares hydrated IR vs. loaded graph/GLB metadata (`components/discrepancy/DiscrepancyWizard.tsx`).
- ✅ Actionable discrepancy panels cover node/input mismatches, orphan expressions, and renamed IDs with inline remediation controls (same module + `useRigController` integration).
- ☐ Persist reviewer decisions (accept, remap, ignore) so exports capture the reconciled state without re-prompting.

### 8. Pose Rig Remapping Flow

- ✅ Pose rig manifest schema (required inputs, per-pose metadata) ships in `apps/vizij-authoring/src/poseRig/types.ts`.
- ✅ Remapping UI (PoseGraphRemapWizard + App wiring) suggests targets, allows overrides, and validates before finishing import (`components/poseRig/PoseGraphRemapWizard.tsx`, `App.tsx:856-945`).
- ✅ Remapping decisions feed back into the authoring store and export flow via `handlePoseGraphRemapApply` + `applyPoseGraphImport`.

## Timeline / Stages

1. **Stage 1 – ID Normalisation** *(Complete – sanitisation + import-time alerts ship; accept/decline UX now tracked under Stage 5/7.)*
2. **Stage 2 – Graph Parser & Expression Reconstruction** *(In progress – traversal/parsing landed; canonical expression regeneration still pending.)*
3. **Stage 3 – Store Hydration** *(In progress – controller hydration works, post-hydration auto-input rebuild queued.)*
4. **Stage 4 – Validation & Persistence Upgrades** *(In progress – diff wizard + Vizij metadata ship; schema-version plumbing still TODO.)*
5. **Stage 5 – Discrepancy & Remapping UX** *(In progress – wizards/remap flows live; reviewer decision persistence outstanding.)*
6. **Stage 6 – Automation & Documentation** *(Planned – regression harness + doc updates remain.)*

## Immediate Next Steps

1. 🚧 Implement the accept/decline workflow for identifier mismatches (persist reviewer choices and suppress repeat prompts).
2. ⏳ Build canonical expression reconstruction + slot alias cleanup for reconstructed graphs.
3. ⏳ Re-run catalogue/auto-input builders after hydration so derived metadata stays aligned without manual refreshes.
4. ⚠️ Split export artifacts (GraphSpec + IR + optional diagnostics) and add schema-version tracking to the metadata container.
5. 📝 Document the discrepancy wizard + pose remap workflows (README/AGENTS) and script a regression harness for round-trip tests.

## Risks & Mitigations

- **Expression Lossiness** – Accept canonical forms and document differences; supplement with validation warnings.
- **Diff Noise** – Use structure-aware diffing; ignore ordering when safe.
- **Legacy Data Volume** – Provide CLI to batch normalise assets.
- **User Intervention Debt** – Without guided workflows, authors are blocked by modal popups; mitigate by persisting remediation state and offering reversible batch actions.
- **Pose Rig Drift** – Imported rigs may reference deprecated inputs; require schema version tags and per-input mapping suggestions before completing import.

## Validation Checklist

- Automated round-trip tests (to be created).
- Manual QA: import legacy asset → review alerts → verify hydrated state matches expectations → export and diff.
