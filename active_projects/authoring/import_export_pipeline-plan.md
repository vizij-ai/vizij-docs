# Import/Export Pipeline – Plan & Tracking
<!-- tags: status=tracking; topics=import-export,persistence,automation-testing,workflow -->

> **Related documents:** [Proposal](import_export_pipeline-proposal.md) · [Reference](import_export_pipeline-reference.md) · [Project summary](summary.md)

## Objective & Scope

Reconstruct authoring state solely from GLB + rig graph files, removing dependence on summary artifacts. Content migrated from `archive/import_reconstruction.md`.

## Workstreams & Status

### 1. Identifier Normalisation

- 🚧 Audit existing sanitisation pipeline to ensure IDs normalise at creation time.
- ⏳ Implement legacy audit step surfacing mismatches with accept/decline workflow.
- ☐ Update documentation to describe ID acceptance process.

### 2. Graph Parsing & Reconstruction

- 📝 Design traversal that recognises standard input declarations, remap nodes, and expressions.
- ⏳ Build expression reconstruction to canonical infix form with regenerated aliases (`s1`, `s2`, …).
- ⚠️ Ensure slot alias handling drops legacy concept of alias labels in favour of regenerated identifiers.

### 3. Store Hydration

- 📝 Map parsed data into controller state (`bindings`, `inputBindings`, `standardInputs`, `inputValues`, selections).
- ⏳ Re-run existing catalogue/auto-input builders to populate derived metadata post-hydration.

### 4. Validation Loop

- ☐ Implement diff tool comparing rebuilt GraphSpec to imported graph (allowing for ordering tolerance).
- ⏳ Integrate validation into import flow with actionable messaging.

### 5. Persistence Upgrades

- ☐ Ensure exports embed new metadata (labels, custom inputs) so subsequent imports remain lossless.
- ⏳ Track schema versioning for incremental enhancements.

### 6. Automation & Documentation

- ⚠️ Add regression tests covering round-trip scenarios (simple, derived inputs, complex expressions).
- ☐ Document import-only workflow, troubleshooting steps, and expected log messages.

## Timeline / Stages

1. **Stage 1 – ID Normalisation** *(In progress)*
2. **Stage 2 – Graph Parser & Expression Reconstruction** *(Planned)*
3. **Stage 3 – Store Hydration** *(Planned)*
4. **Stage 4 – Validation & Persistence Upgrades** *(Planned)*
5. **Stage 5 – Automation & Documentation** *(Planned)*

## Immediate Next Steps

1. 📝 Finalise design for graph traversal and expression reconstruction.
2. 🚧 Implement ID audit + alert flow for legacy imports.
3. ⚠️ Prototype round-trip diff with tolerant comparison (ordering, numeric tolerance).

## Risks & Mitigations

- **Expression Lossiness** – Accept canonical forms and document differences; supplement with validation warnings.
- **Diff Noise** – Use structure-aware diffing; ignore ordering when safe.
- **Legacy Data Volume** – Provide CLI to batch normalise assets.

## Validation Checklist

- Automated round-trip tests (to be created).
- Manual QA: import legacy asset → review alerts → verify hydrated state matches expectations → export and diff.
