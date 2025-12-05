# Proposal: Rust Audio & Video Processing
<!-- tags: status=draft; topics=runtime,rust,audio,video -->

> **Related documents:** Plan (pending) · Reference (pending) · [Runtime Summary](../summary.md)

## Context

To enable rich interactive experiences and improved lip sync, we need to move audio and video processing into the Rust core. Currently, these are handled (if at all) in the web layer or via external tools, which limits performance and integration with the animation engine. We want to treat audio/video as first-class signals in the Vizij runtime, feeding into standard inputs (e.g., phoneme strengths, gaze targets) and orchestrated behaviors.

## Goals

- **Lip Sync**: Real-time audio analysis for high-quality lip sync that can drive standard inputs and facial pose rigs.
- **Interaction**: Video processing for gaze tracking and facial expression mirroring, exposed to the orchestrator and graph systems.
- **Performance**: Leverage Rust's performance for low-latency processing, with clear WASM boundaries and predictable resource usage.

## Proposed Architecture

- **`vizij-av-core`**: A new crate for audio/video processing logic (analysis, feature extraction, basic filters).
- **WASM Bridge**: Expose processing capabilities to the web runtime via dedicated WASM bindings, aligned with WASM Hardening practices.
- **Integration**:
  - Feed processed audio/video features directly into `vizij-animation-core` or `vizij-orchestrator-core` as values that can be mapped onto standard inputs (e.g., mouth openness, eye direction).
  - Provide configuration options for how AV-derived features map into the standard-input schema for a given face or rig.

## Phased Approach (Concept)

1. **Audio-Only Lip Sync (Phase 1)**
   - Implement basic audio analysis (e.g., volume, energy bands, phoneme estimation) in `vizij-av-core`.
   - Expose results as numeric streams that can be consumed by graphs or directly mapped to standard inputs (e.g., `mouthOpen`, `jawOpen`).
2. **Video-Based Features (Phase 2)**
   - Add video processing hooks (e.g., face tracking, gaze estimation) with a focus on feature extraction rather than full image processing.
   - Expose outputs as values suitable for standard inputs (e.g., gaze direction) or BT conditions.
3. **Configuration & Mapping**
   - Provide configuration options (in JSON or bundle metadata) that define how AV features map to a given face's standard inputs and/or face-specific controls.
   - Integrate these mappings into the Rigging/Face Editing workflow so authors can adjust and validate them.
4. **Performance & Resource Control**
   - Allow hosts to configure sampling rates, processing windows, and feature sets to balance quality and performance.
   - Provide clear defaults and guidance for common use cases (e.g., streaming lip sync vs. occasional gaze updates).

## Risks & Unknowns

- **Complexity**: Audio and video processing can quickly become complex; we must scope this work to feature extraction and integration, not full DCC-grade processing.
- **Performance & Latency**: Real-time processing has strict latency requirements; careful tuning and profiling on target platforms is required.
- **Quality & Robustness**: AV feature extraction quality will vary with input conditions; we need to document assumptions and limitations clearly.

## Success Metrics

- **Lip Sync Quality**: Ability to drive convincing lip sync for standard faces using live or recorded audio.
- **Integration**: Clean integration with standard inputs and Pose Rig/Behavior Tree workflows.
- **Performance**: Measured latency and CPU usage stay within acceptable bounds for typical use cases.
