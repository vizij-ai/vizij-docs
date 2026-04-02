# Face Editing Workflow Proposal
<!-- tags: family=project; type=proposal; project_status=proposal; topics=authoring,workflow,face,blendshapes,rigging -->
> **Last updated:** 2026-03-31

> **Related documents:** Plan (not yet written) · Reference (not yet written) · [Authoring Summary](../summary.md)

## 1. Summary

This project focuses on creating a dedicated, optimized workflow for editing facial assets **within the same Rigging sidebar** used for character setup. It covers tools for managing blendshapes, parenting meshes, duplicating parts, and editing materials, specifically tailored for the "Face" use case which is central to Vizij, while remaining tightly connected to standard inputs and the Posing/Pose Rig workflows.

## 2. Problem Statement

Vizij is heavily used for facial animation, but the current tools treat a "Face" just like any other generic scene object. There are no specialized tools for managing the dozens (or hundreds) of blendshapes, organizing facial parts (eyes, teeth, tongue), or quickly iterating on material properties (skin, eye reflection). This makes setting up a new face asset tedious and makes it difficult to expose a clean, standard-input-based control set for the Posing and Pose Rig Library workflows.

## 3. Goals
*   **Blendshape Manager**: A dedicated UI for listing, testing, and grouping blendshapes, with clear links to which standard inputs they ultimately drive.
*   **Hierarchy Tools**: Specialized commands for "Parent to Head", "Mirror Eye", etc., to keep facial parts organized and easier to bind.
*   **Material Editor**: Quick access to common face material properties.
*   **Preview**: Tools for quickly testing the face with standard animations (blinking, talking).
*   **Standard Input Mapping Support**: Make it easier to define and review how the versioned standard input set maps onto the face’s local controls, so that generic pose rigs can be applied confidently.

## 4. Proposed Solution
1.  **Face Tab in Rigging Sidebar**: A dedicated tab within the Rigging sidebar focused on face setup, rather than a completely separate workspace.
2.  **Shape Inspector**: A filtered view of the Inspector that focuses solely on Morph Targets, with "Solo" and "Test" sliders.
3.  **Scene Operations**: Context menu actions for common hierarchy manipulations (Duplicate, Reparent).
4.  **Validation**: Automated checks for common face issues (e.g., missing "jawOpen" shape).

## 5. Risks & Unknowns
*   **Scope Creep**: "Face Editing" can easily turn into "General 3D Editing". We must stay focused on the *setup* and *configuration* of imported assets, not mesh modeling.

## 6. Success Metrics
*   **Setup Time**: Reduction in time from "Import GLB" to "Ready for Animation".
*   **Completeness**: Ability to fully configure a standard ARKit face without leaving the tool.
