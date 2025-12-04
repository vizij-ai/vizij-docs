# Proposal: Multi-Screen Support
<!-- tags: status=draft; topics=runtime,puppeteering,display -->

## Context
Advanced puppeteering and installation use cases require displaying content across multiple screens (e.g., a control panel on one screen and the character on another, or a multi-monitor installation).

## Goals
- **Decoupled Rendering**: Allow the renderer to target multiple canvases/windows.
- **Unified State**: Share a single orchestrator/animation state across all views.
- **Synchronization**: Ensure frame-perfect sync between displays.

## Proposed Strategy
- **Shared Worker**: Move the core runtime (Orchestrator/Animation) into a Shared Worker or dedicated Web Worker.
- **State Broadcasting**: Efficiently broadcast frame updates to all connected renderer clients.
- **Input Aggregation**: Collect inputs from control surfaces and route them to the central worker.
