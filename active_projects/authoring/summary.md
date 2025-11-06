# Vizij Authoring Program Summary
<!-- tags: status=tracking; topics=architecture,workflow,graph-ir,ui-ux,robot-rig,documentation -->

## Document Families

| Pillar | Status | Proposal | Plan & Tracking | Reference |
| --- | --- | --- | --- | --- |
| **Authoring Control Stack** | ✅ Completed (follow-ups pending) | [`authoring_control_stack-proposal.md`](authoring_control_stack-proposal.md) | [`authoring_control_stack-plan.md`](authoring_control_stack-plan.md) | [`authoring_control_stack-reference.md`](authoring_control_stack-reference.md) |
| **Derived Input Hierarchy** | ✅ Completed (follow-ups pending) | [`derived_input_hierarchy-proposal.md`](derived_input_hierarchy-proposal.md) | [`derived_input_hierarchy-plan.md`](derived_input_hierarchy-plan.md) | [`derived_input_hierarchy-reference.md`](derived_input_hierarchy-reference.md) |
| **Graph Authoring IR** | 🚧 In progress | [`graph_authoring_ir-proposal.md`](graph_authoring_ir-proposal.md) | [`graph_authoring_ir-plan.md`](graph_authoring_ir-plan.md) | [`graph_authoring_ir-reference.md`](graph_authoring_ir-reference.md) |
| **Import/Export Pipeline** | 🚧 In progress | [`import_export_pipeline-proposal.md`](import_export_pipeline-proposal.md) | [`import_export_pipeline-plan.md`](import_export_pipeline-plan.md) | [`import_export_pipeline-reference.md`](import_export_pipeline-reference.md) |
| **Pose Rig Library** | 📝 Proposal | [`pose_rig_library-proposal.md`](pose_rig_library-proposal.md) | — | — |

> Refer to [`project_documenting_guide.md`](../../project_documenting_guide.md) for documentation standards and templates.

## Pillar Status Notes

- **Authoring Control Stack** – Auto-generated standard inputs and reconciled controller state keep renderables, animatables, and controls aligned. Primary milestone is complete; follow-ups include documentation polish and UI automation.
- **Derived Input Hierarchy** – Parent/child bindings share the `AnimatableBinding` model, with inline editors, cycle detection, and graph exports capturing lineage. Remaining work is focused on enablement material and smoke tests.
- **Graph Authoring IR** – Metadata pipeline is operational; work in progress covers IR schema, compiler implementation, and expression-first tooling.
- **Import/Export Pipeline** – Reconstruction initiative is underway to hydrate authoring state from GLB + rig graph, including identifier normalisation, graph parsing, and validation tooling.
- **Pose Rig Library** – New proposal to package curated pose sets as reusable graph assets for cross-project import; awaiting detailed plan and implementation.

## Architecture Overview

- **Render & Control Integration**: `useRigController` bridges scene graphs from `@vizij/render` with authoring inputs, maintaining canonical IDs and persistence.
- **Binding & Expression Layer**: `@vizij/node-graph-authoring` provides shared binding models, expression parsing, and graph builders used across pillars.
- **Graph Compilation**: Outputs rely on `buildRigGraphSpec` generated from IR-backed utilities (maturing) to produce runtime-ready GraphSpecs.
- **Persistence & Import**: Rig state persists via local storage metadata and graph exports; Import/Export pipeline targets GLB + graph reconstruction, while the Pose Rig Library will add reusable pose graph bundles.

## Programme Goals

- Deliver dense, maintainable authoring surfaces (auto inputs, derived controls, robust persistence).
- Expand graph authoring coverage using metadata-driven IR and expression-first workflows.
- Achieve lossless import/export without legacy summary artifacts.
- Strengthen automation, documentation, and contributor onboarding materials.

## Active Focus Areas

- **Authoring Control Stack**: Close out follow-up items (RTL smoke tests, UX copy validation, refreshed screenshots).
- **Derived Input Hierarchy**: Publish workflow documentation, add parent-binding automation coverage, and align terminology with the control stack reference.
- **Graph Authoring IR**: Finalise IR schema/design review, implement compiler + parity tests, and introduce metadata drift checks in CI.
- **Import/Export Pipeline**: Implement identifier audit, build graph traversal/expression reconstruction, prototype round-trip diffing, and document the import-only workflow.

## Upcoming Milestones

1. **Control Stack follow-ups** – Deliver RTL smoke tests and updated contributor docs (Q4).
2. **Derived Input enablement** – Publish workflow guide and automation coverage (Q4).
3. **Graph IR schema review** – Complete IR design review and begin compiler implementation (Q4).
4. **Import/Export prototype** – Demonstrate round-trip reconstruction for a representative asset (Q1).

## Archive Notes

Superseded documents remain accessible under the `archive/` directory for historical context. Each legacy file in the root now points to its replacement family.
