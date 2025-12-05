# Authoring Control Stack Proposal
<!-- tags: status=proposal; topics=architecture,ui-ux,workflow,persistence -->

> **Related documents:** [Plan](authoring_control_stack-plan.md) · [Reference](authoring_control_stack-reference.md) · [Project summary](summary.md)

## Context & Problem Statement

The authoring surface historically relied on manual standard-input bookkeeping, fragile feature trees, and ad-hoc persistence. Authors needed to add/delete inputs by hand, remember root group filters, and accept inconsistent naming between scene animatables and authoring controls. Renames or scene swaps routinely desynchronised bindings, and the UI surface lacked the density required for production rigs.

## Goals

1. **Auto-provision standard inputs** for every animatable feature/component so no manual add/delete flow is required.
2. **Maintain naming coherence** across renderables, animatables, bindings, and exports, even when authors rename shapes or reload scenes.
3. **Refresh the authoring UI** with a dense, hierarchical feature tree, inline metadata, and root-based filtering to keep complex rigs navigable.
4. **Stabilise persistence and migrations** so legacy saves import cleanly while the new auto-generation model persists lightweight descriptors.
5. **Document and support workflows** so contributors understand the control stack and can extend it safely.

### Non-goals

- Redesign the graph IR (covered separately).
- Replace runtime loader logic beyond what is necessary for persisted standard inputs.
- Build robot rig graphs (handled under the Robot Rig Mapping pillar).

## Architectural Design

### System Overview

```
Scene Animatables  ──▶ Feature Catalogue ──▶ Auto-Input Blueprints
        │                                   │
        │                                   ▼
        └── loadRigState / saveRigState ─▶ useRigController ──▶ Standard Inputs Panel
                                                        │
                                                        └── buildRigGraphSpec (exports)
```

- **Feature Catalogue**: enumerates renderables and their animatable components, providing metadata (IDs, labels, ranges) used to seed inputs.
- **Auto-Input Blueprints**: deterministic descriptors that translate catalogue entries into standard inputs (`/Shape/feature/property` paths), tracking generated vs. customised metadata.
- **Controller**: `useRigController` orchestrates auto/custom inputs, persisted overrides, input bindings, and migrations from legacy saves. It reconciles state whenever animatables change.
- **UI Layer**: The Standard Inputs panel consumes managed inputs, renders hierarchical metadata, and surfaces toggle/filter interactions in sync with controller state.
- **Persistence/Exports**: `saveRigState` serialises lightweight descriptors; `buildRigGraphSpec` embeds input metadata in exports so downstream tooling remains consistent.

### Integration Touchpoints

- `@vizij/render` remains the source of animatable components and neutral defaults.
- `@vizij/node-graph-authoring` consumes controller state to construct GraphSpecs.
- Import/export flows depend on the same ID normalisation pipeline to avoid drift.

## Risks & Trade-offs

- **State churn during scene reloads**: requires careful reconciliation to avoid UI flicker and binding loss. Mitigated by caching blueprint maps.
- **User overrides vs. generated defaults**: must track both to provide accurate diff/status indicators. Increases controller complexity.
- **Alert fatigue for migrations**: normalising legacy IDs produces warnings that need to be actionable yet unobtrusive.

## High-level Execution Plan

1. **Catalogue Enhancements** – extend feature catalogue to emit fully qualified entries with metadata required for auto input generation.
2. **Auto-Input Engine** – build blueprint generator, reconcile logic, and override tracking inside `useRigController`.
3. **UI Refresh** – implement hierarchical Standard Inputs panel, root filters, inline metadata, and toggle workflow.
4. **Persistence & Migration** – update `loadRigState`/`saveRigState`, embed metadata in exports, and surface migration alerts.
5. **Documentation & QA** – capture workflows, add unit tests (auto-input reconciliation, migrations), and plan UI automation.

## Approval & Decision Log

- *TBD:* Capture product/design approvals and engineering sign-off before moving to the plan & tracking document.
