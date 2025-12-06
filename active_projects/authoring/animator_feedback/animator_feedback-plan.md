# Animator Feedback Implementation Plan
<!-- tags: status=tracking; topics=authoring,ux,workflow -->

> **Related documents:** [Proposal](animator_feedback-proposal.md) · [Reference](animator_feedback-reference.md) · [Pillar summary](../summary.md)

## Objective

Address specific feedback from the animator to improve the efficiency and usability of the authoring tools. Key areas include undo/redo support, enhanced number controls, and visual improvements in the `vizij-authoring` app.

## Plan

The steps below can be followed in order by a junior developer, with concrete tasks and acceptance criteria.

### 1. Add undo/redo support to PoseRig workflows

1.1 Investigate store architecture:
- [ ] Read `vizij-web/apps/vizij-authoring/src/poseRig/store.tsx` and `state/PoseRigProvider.tsx` to understand how `PoseRigStore` is created and consumed.
- [ ] Confirm that `PoseRigStore` is currently a custom store (not using Zustand) and identify which fields should participate in undo/redo (e.g., `poses`, `neutralInputs`, `rigName`).

1.2 Research undo/redo libraries and choose an approach:
- [ ] Investigate existing options such as:
    - `zundo` (temporal middleware for Zustand-like stores).
    - Zustand’s own middleware patterns, if applicable.
- [ ] Evaluate how easily each option could be integrated with the current `PoseRigStore` shape (or whether a light reshaping of the store would be needed).
- [ ] Decide on a library-based approach (prefer using a library like `zundo` or Zustand rather than a fully custom history), and document the decision and rationale in a comment at the top of `store.tsx`.

1.3 Implement history tracking using the chosen approach:
- [ ] Integrate the selected library (e.g., `zundo`) or pattern with `PoseRigStore` so that:
    - Snapshots of relevant state fields (`poses`, `neutralInputs`, `rigName`, and related metadata) are recorded when changes are committed (e.g., when a pose is captured or edited).
    - `undo` and `redo` functions are available to step through history.
- [ ] Expose history actions through the store interface (e.g., `undo()`, `redo()`, `clearHistory()`).

1.4 Add UI bindings for undo/redo:
- [ ] In the main app shell or Pose Rig workbench component:
    - Add keyboard shortcuts (e.g., `Ctrl+Z` / `Cmd+Z` for undo, `Shift+Ctrl+Z` / `Shift+Cmd+Z` for redo).
    - Add buttons or menu items for undo/redo in the Pose Rig toolbar.

Acceptance criteria:
- A user can:
  - Make several pose-related changes (e.g., create/rename/capture poses).
  - Use undo/redo to step backward and forward through those changes.
- Existing Pose Rig tests still pass, and new tests cover basic history behavior.

### 2. Improve number controls (scrubbing and units)

2.1 Identify existing numeric input components:
- [ ] Inspect `vizij-web/apps/vizij-authoring/src/components/ui/RowSlider.tsx` and related components in `src/components/ui`.
- [ ] Determine where numeric inputs are used for rigging/posing controls (e.g., inspector panels, pose editors).

2.2 Design a scrubbable number input:
- [ ] Create a new component (e.g., `ScrubbableNumberInput.tsx`) under `src/components/ui` that:
    - Accepts props such as `value`, `onChange`, `min`, `max`, `step`, `displayUnit`.
    - Supports click-and-drag horizontal scrubbing on the label or a dedicated handle.
    - Supports keyboard input and an "escape to revert" behavior.

2.3 Implement radians/degrees display:
- [ ] Ensure the new component:
    - Always stores values in radians internally.
    - Displays degrees when `displayUnit="degrees"` is passed by converting between radians and degrees on input/output.

2.4 Integrate into key panels:
- [ ] Replace existing numeric inputs in key panels (e.g., driver controls, pose editors) with `ScrubbableNumberInput` where appropriate.

Acceptance criteria:
- Users can adjust numeric values via:
  - Direct typing.
  - Scrubbing horizontally.
- When `displayUnit="degrees"` is used, the UI shows degrees but the underlying data remains in radians.

### 3. Polish show/hide behavior and UI affordances

3.1 Review `CollapsibleGroup` usage:
- [ ] Inspect `vizij-web/apps/vizij-authoring/src/components/ui/CollapsibleGroup.tsx` and its usage in panels.
- [ ] Identify where state persistence is desired (e.g., remembering collapsed/expanded state between sessions or when switching selections).

3.2 Implement state persistence:
- [ ] Add optional persistence logic to `CollapsibleGroup`:
    - For example, using `localStorage` or a central state store keyed by panel/section ID.
- [ ] Wire key panels to use a persistent key for their collapsible sections.

3.3 Add "Expand All"/"Collapse All":
- [ ] For complex panels with many collapsible sections (e.g., driver or binding panels), add:
    - "Expand All" and "Collapse All" buttons.
    - Implement these by calling imperative methods or dispatching state updates on all sections.

3.4 Visual tweaks:
- [ ] Thicken selection highlights in the scene visual (see `src/components/scene-composer` for current selection rendering).
- [ ] Add a more obvious "Remap" UI affordance for bindings (e.g., a dedicated button or icon next to expressions) to make binding editing more discoverable.

Acceptance criteria:
- Collapsible sections remember their state across minor navigation changes (as appropriate).
- Users can expand/collapse all relevant sections with a single click.
- Selection highlights and remap controls are visibly improved and easier to understand.

## Acceptance Criteria (Overall)

- Pose Rig workflows support basic undo/redo for key operations without regressions.
- Numeric controls support scrubbing and optional degree display, improving usability.
- Show/hide and collapsible UI elements behave consistently and provide a smoother experience.
