# Organize Rigging & Posing – Plan & Tracking
<!-- tags: status=planning; topics=authoring,workflow,rigging,posing,face -->

> **Related documents:** [Proposal](organize_rigging_posing-proposal.md) · [Authoring Summary](../summary.md)

## Objective & Scope

Clarify and separate the Rigging/Face Editing (setup) and Posing (usage) workflows in `vizij-authoring`, while keeping them tightly linked via shared controls, standard inputs, and pose rigs. This plan focuses on UI structure, state flow, and data contracts, not on Visual Handles or Pose Rig Library export/import (handled by their respective projects).

## Plan

The steps below are designed to be executed by a junior developer, with concrete tasks and acceptance criteria.

### 1. Map current rigging and posing surfaces in `vizij-authoring`

1.1 Identify existing panels and workflows:
- [ ] Review `vizij-web/apps/vizij-authoring/docs/ui-component-inventory.md` to locate:
    - Panels used for rigging and binding (e.g., Standard Inputs, Drivers).
    - Pose Rig authoring surfaces (Pose list, Pose editor).

1.2 Inspect corresponding components:
- [ ] Open the components referenced in the inventory (e.g., under `src/components/app`, `src/components/inspector`, `src/poseRig`).
- [ ] Note:
    - Where rigging-related state is defined (bindings, standard inputs).
    - Where pose-related state is defined (PoseRig store, pose editor).

Acceptance criteria:
- A short note (or comments in this plan) listing:
  - The main rigging/face editing panels/components.
  - The main posing panels/components.

### 2. Introduce a clear Rigging/Face Editing tab in the sidebar

2.1 Define sidebar structure:
- [ ] Identify the component responsible for the main sidebar layout (e.g., a root panel component in `src/components/app`).
- [ ] Add a tabbed UI structure that separates:
    - **Rigging** tab – for bindings, standard inputs, and diagnostics.
    - **Face** tab – for face-specific editing tools (blendshape manager, hierarchy, materials).

2.2 Wire existing components into tabs:
- [ ] Move or wrap existing rigging-related panels into the **Rigging** tab.
- [ ] Move or wrap face-specific panels (when implemented) into the **Face** tab.

Acceptance criteria:
- When running `vizij-authoring`, the sidebar shows distinct Rigging and Face tabs.
- Switching tabs shows the expected panels without breaking existing functionality.

### 3. Make standard input mapping explicit in Rigging/Face Editing

3.1 Surface standard input coverage:
- [ ] In the Rigging tab:
    - Add a summary panel that:
        - Lists all standard inputs for the current face (based on bundle metadata).
        - Indicates which inputs are mapped (bound) and which are missing.
- [ ] Use existing hooks (e.g., `useRigController`, `useBundleSynchronizer`) for data.

3.2 Show mapping to face-specific controls:
- [ ] For each standard input, show:
    - Any associated bindings/expressions that connect it to face-specific controls.
    - Warnings when mappings are missing or incomplete.

Acceptance criteria:
- A user can see, at a glance, which standard inputs are implemented for the current face and how they map to local controls.

### 4. Align the Posing surface with standard inputs and generic vs face-specific rigs

4.1 Update Pose Rig UI to distinguish rig types:
- [ ] In Pose Rig components (under `src/poseRig/components`), add:
    - A label or icon indicating whether a pose rig is **generic** (standard-input-only) or **face-specific**.
    - A simple way to toggle or set this classification when creating/editing a rig.

4.2 Ensure pose capture uses standard inputs:
- [ ] Confirm that when capturing a pose:
    - Values are recorded against **standard input IDs** for the generic case.
    - Any face-specific fields are clearly separated for the face-specific case.

Acceptance criteria:
- Poses and pose rigs in the UI clearly indicate whether they are generic or face-specific.
- Captured poses for generic rigs are expressed purely in terms of standard inputs.

### 5. Reuse rigging controls in the Posing surface

5.1 Share feature/driver grouping:
- [ ] Ensure that the grouping and visibility decisions used in rigging (e.g., in `DriverPanel`, feature grouping logic) are exposed to the pose rig UI.
- [ ] Reuse any shared selectors or grouping functions so that:
    - The same control groups appear in both Rigging and Posing contexts.

5.2 Provide quick toggles in Posing:
- [ ] In the Posing surface:
    - Use the shared groupings to show controls relevant for pose editing.
    - Allow quick show/hide or filtering of these controls while previewing poses.

Acceptance criteria:
- When a user configures groups/visibility in Rigging, the same structure is visible in Posing without duplicating configuration.

### 6. Add basic navigation and state wiring between workflows

6.1 Provide navigation affordances:
- [ ] Add simple UI affordances (e.g., buttons/links) to:
    - Jump from a Rigging context (e.g., a standard input summary) directly into the relevant Posing view.
    - Return from Posing to Rigging when adjustments to mappings are needed.

6.2 Ensure state coherence:
- [ ] Verify that:
    - Changing mappings in Rigging updates what Posing sees.
    - Capturing/applying poses in Posing does not corrupt Rigging state.

Acceptance criteria:
- Users can move between Rigging/Face Editing and Posing without losing context, and changes in one place are reflected in the other as expected.

## Acceptance Criteria (Overall)

- The `vizij-authoring` sidebar has a clear Rigging/Face separation with appropriate panels under each.
- Standard input coverage and mappings to face-specific controls are visible and understandable in the Rigging tab.
- The Posing surface distinguishes between generic (standard-input-based) and face-specific pose rigs and captures poses accordingly.
- The same curated controls/visibility used for rigging are reused in posing, minimizing duplicated configuration.

