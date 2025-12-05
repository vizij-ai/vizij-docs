# Proposal: Multi-Screen Support
<!-- tags: status=draft; topics=runtime,puppeteering,display -->

> **Related documents:** Plan (pending) · Reference (pending) · [Runtime Summary](../summary.md)

## Context

Advanced puppeteering and installation use cases require displaying content across multiple screens (e.g., a control panel on one screen and the character on another, or a multi-monitor installation). Today, each Vizij runtime is typically associated with a single view, making it awkward to synchronize multiple canvases/windows that should share the same underlying orchestrator and animation state.

## Goals

- **Decoupled Rendering**: Allow the renderer to target multiple canvases/windows while sharing a single orchestrator/animation state.
- **Unified State**: Keep one authoritative runtime (orchestrator + graphs + animations) that drives all views.
- **Synchronization**: Ensure frame-perfect or near frame-perfect sync between displays, within practical constraints.
- **Integration with Namespacing**: Work cleanly with the Namespacing & Multi-Face project so multiple faces/actors can be addressed within the same multi-screen setup.

## Proposed Strategy

- **Shared/Worker Runtime Host**
  - Move the core runtime (Orchestrator/Animation/Graphs) into a Shared Worker or dedicated Web Worker.
  - Treat each view (canvas/window or control surface) as a client that connects to this worker-hosted runtime.
- **State Broadcasting**
  - Efficiently broadcast frame updates and relevant state snapshots to all connected renderer clients.
  - Allow clients to subscribe to subsets of data (e.g., specific actors or regions of the scene) to avoid unnecessary bandwidth.
- **Input Aggregation**
  - Collect inputs from control surfaces (e.g., UI panels, hotkeys, external devices) and route them to the central worker, where they are applied via the orchestrator.
  - Use namespaced paths to distinguish inputs for different actors or screens when necessary.

## Phased Approach

1. **Worker-Based Orchestrator (Single View)**
   - First, move the orchestrator/animation runtime into a Web Worker for a single view app.
   - Validate performance, error handling, and debugging workflows in this simpler case.
2. **Multi-Client Support**
   - Extend the worker host to support multiple view clients (e.g., multiple canvases in one window, or multiple windows).
   - Define a lightweight messaging protocol for:
     - Frame ticks / time updates.
     - Renderable state snapshots or incremental updates.
     - Input events routed back to the worker.
3. **Installation & Puppeteering Scenarios**
   - Add support for:
     - Dedicated control surfaces (e.g., a control UI on one device controlling a character on another).
     - Multi-display installations where different screens show different views of a shared scene.
   - Integrate Namespacing so actors can be selectively shown/controlled per screen.

## Risks & Unknowns

- **Complexity of Synchronization**: Achieving frame-perfect sync across multiple displays and devices can be challenging due to browser and hardware variability; we must define reasonable targets and fallback behavior.
- **Debugging & Tooling**: Worker-based architectures complicate debugging; we need good logging and inspection hooks.
- **API Surface**: The messaging/API surface between worker and views must be carefully designed to avoid becoming a long-term constraint.

## Success Metrics

- **Synchronization Quality**: Multi-screen demos show visually acceptable sync between views under typical conditions.
- **Developer Ergonomics**: It is straightforward for developers to attach additional views or control surfaces to an existing worker-hosted runtime.
- **Adoption in Demos**: Key puppeteering and installation demos migrate to the multi-screen architecture without major regressions.
