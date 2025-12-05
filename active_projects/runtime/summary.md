# Vizij Runtime Program Summary
<!-- tags: status=tracking; topics=runtime,rust,wasm,audio-video -->

## Document Families

| Pillar | Status | Proposal | Plan & Tracking | Reference |
| --- | --- | --- | --- | --- |
| **Audio & Video Processing** | 📝 Proposal | [`audio_video-proposal.md`](audio_video/audio_video-proposal.md) | — | — |
| **Namespacing & Multi-Face** | 📝 Proposal | [`namespacing-proposal.md`](namespacing/namespacing-proposal.md) | — | — |
| **Multi-Screen Support** | 📝 Proposal | [`multi_screen-proposal.md`](multi_screen/multi_screen-proposal.md) | — | — |
| **Behavior Tree** | 📝 Proposal | [`behavior_tree-proposal.md`](../../backlog_proposals/behavior_tree-proposal.md) | — | — |
## Active Projects

### Core Features
- **Namespacing**: Support multi-face/multi-actor control via robust namespacing.
- **Graph Nodes**: Implement **Expression Node** and **Compound Nodes** to simplify graph authoring.
- **Multi-Screen Puppeteering**: Enable multi-screen setups for puppeteering and complex displays.
- **Behavior Tree Proposal**: Draft the initial design for BT integration.

### Planned Initiatives (Medium-Term)
- **Audio & Video Processing**: Implement Rust-based processing hooks, audio worklets, and video threads.
- **Bevy Integration**: Implement native Bevy modules.
- **Worker-Based Orchestration**: Offload orchestrator to a Web Worker.

## Stack-Specific Roadmaps

### Animation Stack
- **Bevy Integration**: Ship example app demonstrating animation playback.

### Node Graph Stack
- **Expression Node**: Parser and evaluator for math expressions.
- **Compound Nodes**: High-level nodes for common workflows.

### Orchestrator Stack
- **Namespacing**: Finalize `TypedPath` design for multi-actor support.

## Upcoming Milestones
1. **Namespacing**: Finalize design and implementation.
2. **Expression Node**: Prototype and implementation.
3. **Behavior Tree**: Initial proposal draft.
