# Multi-Screen Operator Control Plan
<!-- tags: type=plan; status=planned; topics=runtime,puppeteering,display -->

> **Related documents:** [Proposal](multi_screen-proposal.md) · [Runtime Summary](../summary.md)

## Objective & Scope

Deliver a production-ready split-screen puppeteering workflow where the avatar renderer and operator dashboard can run on different screens or devices, and controls are discovered from runtime metadata instead of hardcoded namespaces.

This phase does not include namespaced multi-face routing or deeper shared-runtime actor orchestration. Those remain later runtime-expressiveness follow-on work.

## Plan

The steps below can be executed in order and reviewed independently.

### 1. Define control-surface control model

1.1 Capture source of truth for control widgets
- [ ] Confirm each control widget is derived from the available slot list and its constraints (`min`, `max`, `defaultValue`).
- [ ] Define path parsing rules for:
  - top-level namespace/topic extraction,
  - nested group labels,
  - stable control keys for UI state.

1.2 Confirm protocol expectations
- [ ] Document the control session expectation for remote devices (single active renderer + one or more control clients).
- [ ] Add operational notes for reconnects and stale slot state.

Acceptance criteria:
- One-page note describing:
  - how controls are discovered,
  - how keys/labels are derived,
  - what happens when constraints are missing.

### 2. Build dynamic control dashboard (standalone runtime app)

2.1 Add discover/displays layer
- [ ] In `apps/vizij-standalone`, render all available constraints from `useWebSocketSync().inputConstraints`.
- [ ] Group controls by namespace/topic and show a clear section layout.

2.2 Add filter mechanics
- [ ] Add namespace/topic quick filters (e.g., `standard`, `debug`, others).
- [ ] Add free-text search over label and full path.

2.3 Add widget set
- [ ] Add numeric control widgets for input slots using constraints:
  - range slider,
  - numeric input fallback.
- [ ] Provide reset actions (all controls + per-control if feasible).

Acceptance criteria:
- A loaded model shows at least one usable control.
- Filtering reduces visible controls without affecting runtime updates.

### 3. Improve model reload behavior in UI

3.1 Handle input model changes safely
- [ ] Verify the dashboard updates immediately when constraints are replaced.
- [ ] Preserve control component state only when the same slot key remains valid; otherwise reset to new defaults.

Acceptance criteria:
- Re-loading an avatar with a different rig updates the discovered controls and current values cleanly.

### 4. Validate distributed deployments

4.1 Device separation smoke checks
- [ ] Test control and face app running on separate browsers/devices against one runtime session.
- [ ] Confirm controls send updates reliably and that failures produce actionable logs.

4.2 Update docs and operator workflow
- [ ] Update `vizij-web/apps/vizij-standalone/README.md` and related docs to describe:
  - how to filter controls,
  - how to run a separate control screen.

Acceptance criteria:
- Clear deployment/runbook that a teammate can execute without code reads.

## Acceptance Criteria (Overall)

- The control dashboard is automatically generated from constraints and is namespace-agnostic.
- Operators can filter by namespace/topic and search without restart.
- A split-screen or remote-control setup is documented and validated on local LAN.
