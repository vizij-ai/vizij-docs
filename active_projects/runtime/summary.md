# Vizij Runtime Program Summary
<!-- tags: status=tracking; topics=runtime,rust,wasm,audio-video -->

## Document Families

| Pillar | Status | Proposal | Plan & Tracking | Reference |
| --- | --- | --- | --- | --- |
| **Audio & Video Processing** | 📝 Proposal | [`audio_video-proposal.md`](audio_video/audio_video-proposal.md) | — | — |
| **Multi-Screen Support** | 📝 Proposal | [`multi_screen-proposal.md`](multi_screen/multi_screen-proposal.md) | [`multi_screen-plan.md`](multi_screen/multi_screen-plan.md) | — |

## Active Projects

### Core Features
- **Multi-Screen Puppeteering**: Enable multi-screen setups for puppeteering and complex displays.
- **Audio Processing (Visemes)**: Add Rust-based audio processing hooks for viseme extraction, exposed through WASM.

## Planned Initiatives (Medium-Term)
- **Bevy Integration**: Implement native Bevy modules.
- **Worker-Based Orchestration**: Offload orchestrator to a Web Worker.

## Stack-Specific Roadmaps

### Orchestrator Stack
- **Multi-Screen Support**: Worker-hosted orchestration and multi-view messaging.

### Audio/Video Stack
- **Audio Processing**: Viseme extraction pipeline and bindings.

## Upcoming Milestones
1. **Multi-Screen**: Prototype worker-hosted orchestration and multi-view messaging.
2. **Audio Processing**: Draft plan for viseme extraction and integrate into runtime.

## Archived Projects
- Moved to `backlog/active_projects/runtime/` as of 2026-02-04 (priorities shifted to HRI March work).
