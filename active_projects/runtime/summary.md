# Vizij Runtime Program Summary
<!-- tags: status=tracking; topics=runtime,rust,wasm,audio-video -->

## Document Families

| Pillar | Status | Proposal | Plan & Tracking | Reference |
| --- | --- | --- | --- | --- |
| **Audio & Video Processing** | 📝 Proposal | [`audio_video-proposal.md`](audio_video-proposal.md) | — | — |
| **Namespacing & Multi-Face** | 📝 Proposal | [`namespacing-proposal.md`](namespacing-proposal.md) | — | — |
| **Multi-Screen Support** | 📝 Proposal | [`multi_screen-proposal.md`](multi_screen-proposal.md) | — | — |

## Active Projects

### Core Features
- **Audio & Video Processing**: Implement Rust-based processing for interaction and improved lip sync.
- **Namespacing**: Support multi-face/multi-actor control via robust namespacing.
- **Multi-Screen Support**: Enable multi-screen setups for puppeteering and complex displays.

## Stack-Specific Roadmaps

### Animation Stack
- **Bevy Integration**: Ship example app demonstrating animation playback.

### Node Graph Stack
- **Diagnostics**: Add tracing/diagnostic events for Bevy consumers.
- **Streaming**: Prototype incremental/streaming evaluation APIs.

### Orchestrator Stack
- **Observability**: Add tracing/metrics hooks around passes.
- **Configurability**: Explore configurable animation path parsing.

## Upcoming Milestones
1. **Audio/Video**: Prototype basic audio processing hook in Rust.
2. **Namespacing**: Finalize `TypedPath` design for multi-actor support.
3. **Bevy Example**: Release minimal Bevy animation example.
