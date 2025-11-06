# Derived Input Hierarchy Proposal
<!-- tags: status=proposal; topics=graph-ir,ui-ux,workflow,persistence -->

> **Related documents:** [Plan](derived_input_hierarchy-plan.md) · [Reference](derived_input_hierarchy-reference.md) · [Project summary](summary.md)

## Context & Problem Statement

Standard inputs historically mapped one-to-one to animatable slots. Complex rigs needed parent/child aggregation, blending, and expression chains, but the tooling required manual graph edits or bespoke code. Authors lacked a consistent way to create derived controls, manage lineage, or persist parent bindings.

## Goals

1. **Enable derived standard inputs** that remap upstream controls using shared binding tooling.
2. **Provide a unified editing experience** so animatable bindings and derived inputs share the same UI affordances (expressions, remaps, operators).
3. **Capture graph lineage and prevent cycles** so exports/imports understand parent/child relationships.
4. **Persist parent bindings** alongside standard input descriptors with seamless migrations from legacy saves.
5. **Document workflows** for creating, editing, and troubleshooting derived hierarchies.

### Non-goals

- Overhauling the expression parser (handled under the Graph Authoring IR initiative).
- Authoring automation for robot rig graphs (covered by the Robot Rig Mapping pillar).

## Architectural Design

### Overview

```
Standard Inputs ──▶ Parent Binding Definitions ──▶ Input Aggregators ──▶ Animatable Bindings
          │                                        │
          │                                        └── Graph Exports (buildRigGraphSpec)
          └── Persistence (inputBindingDefinitions)
```

- **Parent Bindings**: Each standard input may reference a parent aggregator (`AnimatableBinding`-shaped data) blending upstream inputs plus the local slider (`self`).
- **Controller Integration**: `useRigController` manages parent bindings in `inputBindings`, ensures dependency graphs remain acyclic, and updates derived children caches.
- **UI**: Standard Inputs panel embeds `BindingEditor` for parent bindings, shows lineage chips, and allows quick creation of child inputs seeded from existing controls.
- **Graph Builder**: `buildRigGraphSpec` materialises derived aggregators before animatable bindings, recording full ancestry for downstream consumers.
- **Persistence**: `inputBindingDefinitions` store parent binding metadata; legacy `derivedStandardInputs` retained for back-compat and migrates to the new structure.

### Integration Points

- Reuses `AnimatableBinding` model from graph authoring to avoid duplication.
- Depends on autoinput stack for deterministic input IDs.
- Exports rely on cycle diagnostics to surface invalid hierarchies in the UI.

## Risks & Trade-offs

- **Cycle Prevention**: Authors can inadvertently create loops; requires detection and actionable UI messaging.
- **Persistence Size**: Parent bindings add metadata; must remain lightweight to avoid bloating local storage.
- **UI Complexity**: Inline editors could overwhelm the Standard Inputs panel; design must balance density with clarity.

## High-level Execution Plan

1. **Data Model Upgrade** – Extend `StandardRigInput` with parent binding metadata and derived child caches.
2. **Controller Enhancements** – CRUD helpers for parent bindings, dependency tracking, cycle detection, migration of legacy saves.
3. **Graph Builder Support** – Generate derived aggregators, expose lineage summaries, raise cycle issues.
4. **UI Integration** – Embed `BindingEditor`, lineage chips, child creation workflow, usage badges.
5. **Docs & QA** – Write derived control documentation, add unit tests for migration/cycle scenarios, plan UI automation.

## Approval & Decision Log

- *TBD:* Document stakeholder approvals and design reviews prior to execution.
