# Authoring Control Stack Reference
<!-- tags: status=reference; topics=architecture,workflow,persistence,ui-ux -->

> **Related documents:** [Proposal](authoring_control_stack-proposal.md) · [Plan](authoring_control_stack-plan.md) · [Project summary](summary.md)

> Content adapted from `archive/authoring_control_arch.md`, with updates reflecting the stabilised auto-input workflow.

## Summary

The Authoring Control Stack keeps renderable shapes, animatable values, and standard inputs synchronised. Auto-generated inputs ensure every animatable property has a stable control path, while `useRigController` reconciles state, persists lightweight descriptors, and drives UI/graph exports.

## System Overview

### Core Entities

- **Renderable Objects** (`@vizij/render`): Scene graph nodes with mutable names/ids and feature slots (`translation`, `rotation`, `scale`, etc.). Exposed via `useVizijStore`.
- **Animatable Values** (`@vizij/utils`): Flattened into `AnimatableComponent`s by `extractAnimatableComponents`. Carry stable IDs (`renderableId:feature:component`), editable names, and public labels.
- **Standard Inputs** (`StandardRigInput`): Auto-generated from feature catalogue plus custom author additions. Store path, group, optional `sourceId`, overrides (label, range, default), optional parent binding, and child cache.

### Data Flow

1. **Feature Catalogue** builds a nested representation of shapes → features → components.
2. **Auto-Input Blueprints** convert catalogue entries into canonical `/Shape/feature/property` paths, capturing generated defaults vs. overrides.
3. **Controller (`useRigController`)** manages auto/custom inputs, input values, bindings, and migrations. It reconciles persisted state against current animatables, raises mismatch alerts, and exposes handlers for UI interactions.
4. **UI Components** (Standard Inputs panel, feature tree) read managed inputs, render hierarchical metadata, and toggle enable/disable state. Root filters and collapse state persist locally.
5. **Persistence / Export** via `saveRigState` and `buildRigGraphSpec` writes auto-input descriptors and lineage metadata so imports remain lossless.

## Key Decisions & Trade-offs

- **Deterministic Paths**: Input IDs derive from normalised paths to guarantee stability across exports; migrations alert when legacy IDs sanitise differently.
- **Auto vs. Custom Inputs**: Inputs track `source` to differentiate auto provisioned controls from user-authored ones, allowing overrides without losing generated defaults.
- **Toggle vs. Delete**: Disabled flag removed; authors either keep or delete inputs. Enable/disable toggles replace add/delete, simplifying state transitions.
- **Alert Strategy**: ID mismatch alerts consolidate per session to avoid notification fatigue while still highlighting migrated controls.

## Usage Guide

- **Enable/Disable Inputs**: Use the inline toggle. Disabling automatically clears bindings; re-enable to restore the control (overrides preserved).
- **Filter by Root**: Multi-select dropdown focuses the panel on relevant shape groups. Selection persists per face ID.
- **Rename Shapes/Features**: Renames propagate through auto inputs via blueprint reconciliation. Alerts appear if persisted IDs normalise differently.
- **Create Custom Inputs**: Invoke “Add Custom Input” (if exposed) to append user-defined descriptors; these persist verbatim.
- **Parent Bindings**: Managed separately under the Derived Input Hierarchy pillar but surface alongside standard inputs for lineage awareness.

## Maintenance & Extension

- **Adding Preset Inputs**: Update `STANDARD_RIG_INPUTS` and ensure catalogue emits matching entries; controller will adopt automatically.
- **Blueprint Changes**: Modify `autoInputs.ts` helper logic; update corresponding tests to cover new override rules.
- **Persisted Schema**: `PersistedAutoStandardInput` should only include lightweight descriptors (id, path, source, overrides). Avoid embedding full binding definitions.

## Testing & Validation

- Unit tests (`autoInputs.test.ts`, `legacyMigration.test.ts`) cover blueprint generation and persistence migrations.
- Future work: RTL smoke tests for toggles, filters, and tree interactions (tracked in the plan).

## Further Reading

- Proposal: `authoring_control_stack-proposal.md`
- Plan & Tracking: `authoring_control_stack-plan.md`
- Derived Control workflows: `derived_input_hierarchy-reference.md` (once published)
- Archived source material: `archive/stabilise_core_inputs_plan.md`, `archive/authoring_update.md`, `archive/authoring_control_arch.md`
