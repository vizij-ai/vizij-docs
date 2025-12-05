# Animation Authoring Proposal
<!-- tags: status=proposal; topics=authoring,animation,timeline,curves -->

> **Related documents:** Plan (pending) · Reference (pending) · [Authoring Summary](../active_projects/authoring/summary.md)

## 1. Summary

This project aims to build a robust suite of tools for creating and editing animations directly within Vizij. It includes a timeline interface, curve editor, and import/export capabilities that sit on top of Vizij’s runtime and rigging stack. Animation Authoring should make it easy to author clips that target both **standard inputs** (for reusable motion) and face/rig-specific channels, while playing nicely with Pose Rigs and the existing playback engine.

## 2. Problem Statement

Currently, Vizij is primarily a *playback* engine for animations created elsewhere (e.g., Blender). While we can play clips, we have limited ability to edit them or create new ones from scratch. This forces a "round-trip" workflow (Edit in Blender → Export → Import to Vizij) that is slow and breaks creative flow. There is also no first-class way to:

- Record puppeteering sessions into reusable animations.
- Edit curves for standard-input-driven motion directly in the authoring environment.
- Maintain a clean separation between reusable animations (standard-input-based) and project/rig-specific motion.

## 3. Goals

*   **Timeline**: A standard track-based timeline for sequencing clips and keyframes over time.
*   **Curve Editor**: A graph view for fine-tuning interpolation curves (tangents, easing, handles).
*   **Recording**: Ability to record real-time manipulation (puppeteering) into animation tracks that target standard inputs and/or rig-specific channels.
*   **I/O**: Import/Export of standard formats (GLTF animations, Vizij JSON), preserving mappings to standard inputs where possible.
*   **Integration with Rigs & Poses**: Make it easy to apply animations on top of pose rigs and standard input mappings defined during rigging.

## 4. Proposed Solution

1.  **Timeline Component**
    - Build a high-performance React timeline component (virtualized for long clips and many tracks).
    - Support basic editing operations: move/scale clips, trim, duplicate.
2.  **Keyframe Model & Editor Format**
    - Define a mutable **editor format** for animation data that can be:
      - Converted to/from Vizij’s runtime animation representation.
      - Stored in bundle metadata or sidecar JSON.
    - Implement keyframe editing (add/delete/move) and curve parameters (easing, tangents).
3.  **Curve UI**
    - Implement a Bezier curve editor using SVG or Canvas.
    - Allow per-track curve editing with zoom/pan and snapping.
4.  **Recording & Transport Controls**
    - Enhance existing playback controls with:
      - "Record" to capture puppeteering input into tracks (e.g., standard inputs driven via Visual Handles or sliders).
      - Loop regions, scrubbing, and basic playback speed controls.
    - Ensure recordings respect the standard input mapping defined in the rigging flow.
5.  **Standard Input & Rig Integration**
    - Allow tracks to target:
      - Standard inputs (for reusable animations).
      - Rig/face-specific channels (for local motion).
    - Expose clear metadata so consumers know whether a track is generic (standard-input-based) or rig-specific.
6.  **Import/Export**
    - Implement import from GLTF and Vizij JSON animation formats into the editor format.
    - Provide export back to:
      - Vizij bundle-compatible animation structures.
      - Optional GLTF animation clips when needed.

## 5. Risks & Unknowns

*   **Performance**: Rendering a complex timeline with thousands of keyframes in React can be slow; virtualization and careful rendering are required.
*   **Data Model**: The runtime's animation format is optimized for playback (sampling), not editing. A robust editor format and conversion layer are needed, with attention to precision and compatibility.
*   **Complexity of Integration**: Aligning animation authoring with pose rigs, standard inputs, and rig-specific channels introduces complexity in UI and data flow.

## 6. Success Metrics

*   **Creation**: Ability to create a simple "Wave" animation from scratch in the tool targeting standard inputs on a face.
*   **Refinement**: Ability to smooth out a jittery recorded motion using the curve editor and re-export it without artifacts.
*   **Reuse**: Ability to apply an animation authored on one standard-input-compliant face to another with minimal adjustments.
