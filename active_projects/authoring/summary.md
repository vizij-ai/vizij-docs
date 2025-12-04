# Vizij Authoring Program Summary
<!-- tags: status=tracking; topics=architecture,workflow,graph-ir,ui-ux,robot-rig,documentation -->

## Document Families

| Pillar | Status | Proposal | Plan & Tracking | Reference |
| --- | --- | --- | --- | --- |
| **Authoring Control Stack** | ✅ Completed (follow-ups pending) | [`authoring_control_stack-proposal.md`](authoring_control_stack-proposal.md) | [`authoring_control_stack-plan.md`](authoring_control_stack-plan.md) | [`authoring_control_stack-reference.md`](authoring_control_stack-reference.md) |
| **Derived Input Hierarchy** | ✅ Completed (follow-ups pending) | [`derived_input_hierarchy-proposal.md`](derived_input_hierarchy-proposal.md) | [`derived_input_hierarchy-plan.md`](derived_input_hierarchy-plan.md) | [`derived_input_hierarchy-reference.md`](derived_input_hierarchy-reference.md) |
| **Graph Authoring IR** | 🚧 In progress (rollout + docs) | [`graph_authoring_ir-proposal.md`](graph_authoring_ir-proposal.md) | [`graph_authoring_ir-plan.md`](graph_authoring_ir-plan.md) | [`graph_authoring_ir-reference.md`](graph_authoring_ir-reference.md) |
| **Import/Export Pipeline** | 🚧 In progress | [`import_export_pipeline-proposal.md`](import_export_pipeline-proposal.md) | [`import_export_pipeline-plan.md`](import_export_pipeline-plan.md) | [`import_export_pipeline-reference.md`](import_export_pipeline-reference.md) |
| **Pose Rig Library** | 📝 Proposal | [`pose_rig_library-proposal.md`](pose_rig_library-proposal.md) | — | — |
| **Modular Pose Rig** | 📋 Planned | [`modular_pose_rig-proposal.md`](modular_pose_rig-proposal.md) | [`modular_pose_rig-plan.md`](modular_pose_rig-plan.md) | [`modular_pose_rig-reference.md`](modular_pose_rig-reference.md) |

> Refer to [`project_documenting_guide.md`](../../project_documenting_guide.md) for documentation standards and templates.

## Pillar Status Notes

- **Authoring Control Stack** – Verified implementation in `legacyMigration.test.ts` (normalization logic). UI components (`StandardInputsSection`) are integrated.
- **Derived Input Hierarchy** – Verified implementation in `graphBuilder.test.ts` (cycle detection, binding propagation).
- **Graph Authoring IR** – Verified `buildRigGraphSpec` in `graphBuilder.test.ts` handles complex expressions and node generation.
- **Import/Export Pipeline** – Verified `importer.ts` handles graph rehydration and metadata preservation.
- **Modular Pose Rig** – Plan exists to decouple pose rig state from React hooks into a standalone store/service layer.

## New Initiatives (User Feedback)

### UI Improvements
- **Function Editor**: Autocomplete (VSCode-like), dedicated remap setting.
- **Animator Feedback (Doug)**:
  - Undo/redo support.
  - Number controls: radians->degrees, slider in number, "return unselected" behavior.
  - Improve show/hide of controls.
  - Thicken highlights, dedicated remapping.
- **Scene Visual**: Handles for manipulation, bolder highlights.
- **Theme**: Update look/feel to Vizij branding.

### Key Extensions
- **Animation Authoring**: Dedicated tooling for creating/editing animations.
- **Rigging**: Tools for rigging further up the chain.
- **Behavior Tree**: Design and implementation of behavior tree authoring.

## Architecture Overview

- **Render & Control Integration**: `useRigController` bridges scene graphs from `@vizij/render` with authoring inputs.
- **Binding & Expression Layer**: `@vizij/node-graph-authoring` provides shared binding models.
- **Graph Compilation**: Outputs rely on `buildRigGraphSpec`.
- **Persistence & Import**: Rig state persists via local storage metadata and graph exports.

## Active Focus Areas

- **UI & UX Polish**: Implement Doug's feedback and Function Editor improvements.
- **Modular Pose Rig**: Execute the modularization plan.
- **Import/Export Pipeline**: Complete the round-trip reconstruction and diffing.
