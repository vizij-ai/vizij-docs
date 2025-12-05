# Visual Handles Proposal
<!-- tags: status=proposal; topics=authoring,ui,ux,3d,manipulators -->

> **Related documents:** Plan (pending) · Reference (pending) · [Authoring Summary](../active_projects/authoring/summary.md)

## 1. Summary

This project aims to implement on-screen 3D manipulators (gizmos/handles) for the Vizij Authoring tool. These handles will allow users to interact directly with the 3D scene to translate, rotate, and scale objects or bones, rather than relying solely on numerical inputs. Visual Handles should integrate with the existing rigging and posing flows, driving **standard inputs** and rig-specific channels in a way that is compatible with Pose Rigs and Animation Authoring.

## 2. Problem Statement

Currently, manipulating objects in the 3D scene requires using the Inspector panel to type in numbers or drag sliders. This is unintuitive and slow for spatial tasks like posing a character or laying out a scene. Users expect standard "Transform Gizmos" (arrows for translation, rings for rotation) found in tools like Blender, Unity, or Maya. Without these, it is difficult to:

- Quickly pose characters in the dedicated Posing and Animation Authoring flows.
- Author expressive poses for Pose Rigs.
- Record natural motion into animations.

## 3. Goals

*   **Direct Manipulation**: Enable users to click and drag in the 3D viewport to change values on rigs and scene objects.
*   **Standard Gizmos**: Implement Translation, Rotation, and Scale gizmos with familiar interaction patterns.
*   **Binding**: Ensure these gizmos correctly drive the underlying `TypedPath` values in the runtime, including standard inputs used by pose rigs and animations.
*   **Mode Integration**: Make Visual Handles usable in the Posing and Animation Authoring modes without duplicating logic, while keeping the Rigging/Face Editing experience focused on setup and configuration tooling.

## 4. Proposed Solution

1.  **Library Integration**
    - Evaluate and integrate a React/Three.js gizmo library (e.g., `drei/TransformControls` or similar) or build a custom lightweight solution that matches Vizij’s rendering stack.
2.  **Selection Sync**
    - Ensure the gizmo attaches to the currently selected object/bone/feature as surfaced by the Posing or Animation Authoring context.
    - Keep selection consistent across the scene graph, inspector, and handles.
3.  **Two-Way Binding**
    - **Read**: Gizmo initializes position/orientation/scale from the current runtime value (driven by standard inputs or rig-specific channels).
    - **Write**: Gizmo interaction sends `WriteBatch` updates to the runtime and/or updates standard input values, respecting any constraints derived from input metadata.
4.  **Coordinate Spaces**
    - Support Local and World space manipulation, with consistent behavior when parent transforms are involved.
    - Ensure transformations map correctly between Three.js coordinates and the Rust runtime’s representation.
5.  **Integration with Poses & Animations**
    - Allow Visual Handles to be used as the primary interaction mechanism when:
      - Capturing poses in the Posing flow.
      - Recording puppeteered motion into animation tracks in Animation Authoring.
    - Make the connection between handle-driven changes and standard inputs explicit, so pose rigs and animations remain compatible with the standard-input schema.

## 5. Risks & Unknowns

*   **Performance**: Gizmos must not degrade the render loop performance; careful use of Three.js layers and event handling is required.
*   **Coordinate Systems**: Correctly handling parent transforms and coordinate space conversions (Rust vs Three.js) can be tricky and must be thoroughly tested.
*   **Interaction Complexity**: Overloading handles with too many modes or constraints could make them harder to use; we need clear interaction patterns and defaults.

## 6. Success Metrics

*   **Usability**: Users can pose a character arm or adjust facial controls using only the viewport, without relying on numeric inputs.
*   **Authoring Speed**: Reduced time to set up and refine poses compared to slider-only workflows.
*   **Parity**: Reasonable feature parity with standard 3D DCC transform tools, within the scope of Vizij’s authoring goals.
