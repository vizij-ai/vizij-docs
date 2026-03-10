# Proposal: Distributed Face + Control Screen Control
<!-- tags: type=proposal; status=planned; topics=runtime,puppeteering,display -->

> **Related documents:** [Plan](multi_screen-plan.md) · [Runtime Summary](../summary.md)

## Context

Many deployments now separate rendering and control across screens or devices. A common setup is one machine showing the avatar and another machine, tablet, or phone running a control UI that talks to it over the same WebSocket endpoint.

This proposal is focused on making that workflow a first-class path: control UI should be driven by the runtime's available slots, not by assumptions baked into a hardcoded path strategy.

Near-term acceptance is intentionally limited to the operator-control branch. Namespacing and deeper shared-runtime multi-face routing remain follow-on runtime-expressiveness work.

## Goals

- **Distributed Control Surface**: Make it straightforward to run the avatar view and the control UI on different screens/devices.
- **Dynamic Discovery**: Discover controls from the active model's slots and constraints, then render the UI automatically.
- **Namespace-Agnostic Control**: Avoid hardcoding `standard/*`; let operators filter and target any available control namespace/topic.
- **Puppeteer UX**: Provide an organized, filterable dashboard with clear widgets for numeric control values.

## Proposed Strategy

- **Single Runtime Source of Truth**
  - Keep the avatar/runtime host as authoritative for slot state.
  - Control clients apply updates through the existing slot control protocol.
- **Slot-Driven UI Generation**
  - Read available inputs from runtime metadata and build grouped UI controls dynamically.
  - Group and filter by path-derived namespaces/topics, then render sliders and numeric inputs consistently.
- **Separation of Concerns**
  - Treat rendering (face screen) and operator experience (control screen) as distinct roles using the same backend protocol.

## Phased Approach

1. **Discoverable Control Surface Baseline**
   - Define rules for path parsing and grouping that work for arbitrary slot prefixes (including but not only `standard`).
   - Confirm control widgets can be rendered from slot metadata alone.

2. **Filterable Dashboard**
   - Add namespace/topic filters and search.
   - Allow operators to limit the interface to relevant controls (for example, a dedicated `standard` filter).

3. **Deployment and Reliability**
   - Validate remote-control usage on multiple devices with the same endpoint.
   - Define connection/availability expectations for long-running sessions.

4. **Later Follow-On**
   - Revisit namespaced multi-face control and deeper shared-runtime routing after the current deployment/operator branch is stable.

## Risks & Unknowns

- **Session Semantics Across Devices**: There may be multiple clients and/or transient network interruptions; we should define clear behavior for stale controls and reconnect.
- **Operator UX Scaling**: Large slot sets need good grouping/filter defaults so the control surface stays usable.
- **Security and Access Scope**: A LAN-visible control endpoint should be protected when moved beyond trusted local networks.

## Success Metrics

- **Discovery Coverage**: New rigs and controls become available in the dashboard with no hardcoded path exceptions.
- **Usability**: Operators can quickly narrow large control sets to what they need.
- **Deployment Confidence**: Face and control screens can be deployed separately with predictable behavior.
