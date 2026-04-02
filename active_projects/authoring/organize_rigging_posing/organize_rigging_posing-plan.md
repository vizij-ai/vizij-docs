# Organize Rigging & Posing – Plan & Tracking
<!-- tags: family=project; type=plan; project_status=tracking; topics=authoring,workflow,rigging,posing,face -->
> **Last updated:** 2026-03-31

> **Related documents:** [Proposal](organize_rigging_posing-proposal.md) · [Authoring Summary](../summary.md)

## Objective & Scope

Clarify and separate the Rigging/Face Editing (setup) and Posing (usage) workflows in `vizij-authoring`, while keeping them tightly linked via shared controls, standard inputs, and pose rigs. This plan focuses on UI structure, state flow, and data contracts, not on Visual Handles or Pose Rig Library export/import (handled by their respective projects).

## Plan

The steps below are designed to be executed by a junior developer, with concrete tasks and acceptance criteria.

**Status (2025-12-06)**  
- Rigging sidebar now has Rigging/Face tabs plus a Standard Input Coverage panel; coverage shows schema/version, mapped/unmapped/disabled/hidden counts, and top missing inputs (vizij-web `e8a130d`).  
- Pose rigs carry `rigKind` (`generic` | `face-specific`), standard input schema metadata, and inherit hidden driver/grouping state from Rigging; hidden inputs are omitted in Posing by default (vizij-web `e8a130d`).  
- Node/WASM perf harness landed alongside native benches (vizij-rs `24b3c59`, `4be2198`); performance work is tracked separately in the Code Quality pillar.

**Pre-work / clarifications (add to proposal + plan before coding)**
- [x] Decide and document: pose rig kind flag (`generic` vs `face-specific`) and how it affects paths/exports; default legacy configs to `face-specific`.
- [x] Record and carry a standard-input schema/version alongside binding/pose data; coverage UI should reference this version.
- [x] Specify where rigging visibility/grouping metadata is persisted (extend binding store persistence **and write it into saved files**) and how posing consumes it after reload.

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
- [x] Identify the component responsible for the main sidebar layout (`App.tsx` + `components/app/workbenchConfig.ts`).
- [x] Add a tabbed UI structure in the right sidebar that separates:
    - **Rigging** tab – bindings, standard inputs, diagnostics.
    - **Face** tab – face-specific editing tools (blendshape manager, hierarchy, materials).
  Update shells/styles (`components/ui/Panel.tsx`, `styles.css`) as needed to keep layout consistent.

2.2 Wire existing components into tabs:
- [x] Move or wrap existing rigging-related panels into the **Rigging** tab.
- [ ] Move or wrap face-specific panels (when implemented) into the **Face** tab.

Acceptance criteria:
- When running `vizij-authoring`, the sidebar shows distinct Rigging and Face tabs.
- Switching tabs shows the expected panels without breaking existing functionality.

### 3. Make standard input mapping explicit in Rigging/Face Editing

3.1 Surface standard input coverage:
- [x] In the Rigging tab:
    - Add a summary panel that:
        - Lists all standard inputs for the current face (by schema/version).
        - Indicates mapped vs unmapped vs disabled inputs.
        - Shows parent/child binding status and hidden driver flags.
- [x] Use existing hooks (e.g., `useRigController`, `useBundleSynchronizer`) for data.

3.2 Show mapping to face-specific controls:
- [x] For each standard input, show:
    - Any associated bindings/expressions that connect it to face-specific controls.
    - Warnings when mappings are missing or incomplete.

Acceptance criteria:
- A user can see, at a glance, which standard inputs are implemented for the current face and how they map to local controls.

### 4. Align the Posing surface with standard inputs and generic vs face-specific rigs

4.1 Update Pose Rig UI to distinguish rig types:
- [x] In Pose Rig components (under `src/poseRig/components`), add:
    - A label or icon indicating whether a pose rig is **generic** (standard-input-only) or **face-specific**.
    - A toggle/selector to set this classification when creating/editing a rig.
  Persist this flag in `PoseRigStore` and `PoseRigConfigFile`; update import/export to preserve it.

4.2 Ensure pose capture uses standard inputs:
- [x] Confirm that when capturing a pose:
    - Values are recorded against **standard input IDs** for the generic case.
    - Any face-specific fields are clearly separated for the face-specific case.

Acceptance criteria:
- Poses and pose rigs in the UI clearly indicate whether they are generic or face-specific.
- Captured poses for generic rigs are expressed purely in terms of standard inputs.

### 5. Reuse rigging controls in the Posing surface

5.1 Share feature/driver grouping:
- [x] Pass rigging metadata (hidden driver IDs, feature groups, label overrides) from `bindingAuthoring` into `PoseRigProvider` **and persist it to disk so reloads keep the same visibility**.
- [x] Reuse shared grouping/visibility selectors so that:
    - The same control groups appear in both Rigging and Posing contexts by default.
    - **Rigging UI:** hidden groups/inputs remain visible but greyed/with closed-eye icon; users can unhide them.  
    - **Posing UI:** hidden groups/inputs are fully omitted unless explicitly unhidden in Rigging.

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
    - Preserve selection/state rather than rebuilding stores on navigation.

6.2 Ensure state coherence:
- [ ] Verify that:
    - Changing mappings in Rigging updates what Posing sees.
    - Capturing/applying poses in Posing does not corrupt Rigging state.

### 7. Testing & tech-debt guardrails
- [ ] Add unit coverage for the standard-input coverage panel and pose rig kind flag (import/export round-trip).
- [ ] Note deferred TD: `PoseGraphService.generateSummary` throws, blend mode is hard-coded, graph rebuilds inside `setState`; either address upfront or mark as out-of-scope with follow-up tasks.

Acceptance criteria:
- Users can move between Rigging/Face Editing and Posing without losing context, and changes in one place are reflected in the other as expected.

## Acceptance Criteria (Overall)

- The `vizij-authoring` sidebar has a clear Rigging/Face separation with appropriate panels under each.
- Standard input coverage and mappings to face-specific controls are visible and understandable in the Rigging tab.
- The Posing surface distinguishes between generic (standard-input-based) and face-specific pose rigs and captures poses accordingly.
- The same curated controls/visibility used for rigging are reused in posing, minimizing duplicated configuration.
