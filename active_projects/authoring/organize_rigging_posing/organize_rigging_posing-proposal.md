# Organize Rigging & Posing Proposal
<!-- tags: status=proposal; topics=authoring,workflow,rigging,posing,face -->

> **Related documents:** Plan (pending) · Reference (pending) · [Authoring Summary](../summary.md)

## 1. Summary

This project focuses on streamlining and organizing the workflows for **Rigging** (binding meshes to skeletons/controls and configuring facial assets) and **Posing** (creating reusable pose assets that drive standard inputs). The goal is to make these distinct but tightly linked tasks intuitive and efficient within the Vizij Authoring app, with Rigging + Face Editing sharing a single sidebar and Posing reusing the curated controls defined there.

## 2. Context & Problem Statement

Vizij is heavily used for facial animation and character control. Today:

- The distinction between "setting up a character" (rigging and face editing) and "using that character" (posing) is blurred in the UI.
- The existing face/feature selection and show/hide controls live in a single surface that mixes setup and usage concerns.
- Poses are often tied to ad-hoc inputs rather than **standard inputs**, which makes reuse across faces difficult.

This leads to confusion and inefficiency, especially for users trying to perform standard tasks like:

- "Bind this mesh to this bone and mark the important controls."
- "Save this current configuration as a pose that will work across multiple faces."

## 3. Goals & Non‑Goals

### Goals

- **Shared Rigging + Face Editing Surface**: Combine rigging and face editing into a single sidebar with dedicated tabs (e.g., "Rigging", "Face") so authors can:
  - Bind meshes and components to **standard inputs** and face-specific inputs.
  - Organize and filter facial parts (eyes, teeth, tongue, accessories).
  - Configure which controls are visible/hidden and how they are grouped.
- **Posing as Standard-Input Control**: Ensure the Posing workflow operates on **standard inputs**, not asset-specific IDs, so poses can transfer between faces.
- **Control Reuse Between Modes**: Make the curated feature/driver selection and show/hide states defined in Rigging available in Posing, so authors are not re-discovering controls in each mode.
- **Clear Mode Boundaries**:
  - Rigging/Face Editing = define and wire up controls.
  - Posing = capture, edit, and preview poses driven by those controls.
- **Future Alignment with Pose Rig Library**: Align the Posing surface with the Pose Rig Library so the same **standard-input-based** poses can be exported/imported across projects, while still supporting face-specific poses within a project.

### Non‑Goals

- Replacing the dedicated **Face Editing** feature set (blendshape manager, material editing) – this project integrates it into the rigging sidebar rather than redefining its tools.
- Designing the complete **Pose Rig Library** import/export UX – that work lives in the Pose Rig Library project and builds on this foundational workflow.
- Implementing animation timelines or keyframe editing (covered by the Animation Authoring proposal).

## 4. Workflow & UX Design (Strawman)

### Pre-work decisions (resolved)

- **Pose rig kind flag**: Add `rigKind: "generic" | "face-specific"` to authoring state and `PoseRigConfigFile`.  
  - *generic*: standard-input-only; paths omit face-id (`rig/poses/...`), intended for cross-face reuse/library export.  
  - *face-specific*: current behavior; paths are face-scoped (`rig/<faceId>/...`), keeps local controls.
- **Standard-input schema/version**: Store `standardInputSchema` (e.g., `{ id: "vizij-standard-face", version: "v1" }`) alongside binding metadata and `PoseRigConfigFile`. Coverage/warnings must reference this version; legacy bundles default to the current inferred schema until resaved.
- **Rigging visibility/grouping persistence**: Persist `hiddenDriverIds`, feature groups, and label overrides in the binding authoring persistence payload **and in saved files**; expose them through `PoseRigProvider` so posing reuses the same curated control set after reload.
- **Visibility behavior**: Rigging shows hidden groups/inputs greyed with a closed-eye icon (can be unhidden). Posing omits hidden groups/inputs entirely unless they are unhidden in Rigging.

### 4.1 Rigging & Face Editing Sidebar

- **Location**: A persistent sidebar in `vizij-authoring` with tabs such as:
  - **Rigging** – bindings, drivers, standard inputs, graph diagnostics.
  - **Face** – face-specific tools (blendshape manager, facial hierarchy, materials).
- **Feature/Control Selector**:
  - Retain and refine the existing face element selection and show/hide patterns.
  - Allow authors to mark certain inputs as "primary controls" (e.g., key facial expressions, important body controls).
  - Persist show/hide and grouping metadata so it can be reused by the Posing mode.
- **Standard Input Mapping**:
  - Make it explicit which **standard inputs** (for a given standard-input schema version) each face or rig supports.
  - Provide summaries and warnings when expected standard inputs are missing or unmapped.
  - Surface how standard inputs map to face-specific controls via bindings/expressions, so authors can debug and refine those relationships.

### 4.2 Posing Surface

- **Pose Library Panel**:
  - List poses grouped by collection (e.g., "Neutral", "Expressions", "Phonemes").
  - Integrate with the existing `PoseRigStore` (pose definitions, neutral inputs, pose graph summary).
- **Capture & Preview**:
  - "Capture Pose" button snapshots the current standard input values into a pose tied to **standard input IDs**, not raw scene paths.
  - "Preview Pose" applies pose values via the runtime (using the same underlying controls surfaced in the Rigging sidebar).
- **Generic vs Face-Specific Poses**:
  - Allow authors to flag poses/rigs as **generic** (standard-input-only, suitable for library export) or **face-specific** (includes local controls that may not exist on other faces).
  - Ensure both kinds can be imported/exported, with generic rigs flowing into the Pose Rig Library and face-specific rigs remaining project-local.
- **Shared Controls**:
  - Reuse the curated controls and visibility decisions from Rigging:
    - The same feature/driver grouping appears in Posing.
    - Authors can quickly toggle relevant controls while previewing or refining a pose.

### 4.3 Data Flow & Integration

- Rigging/Face Editing:
  - Produces binding configuration, standard input definitions (with schema version), and metadata (visibility, grouping).
  - Defines how standard inputs map to face-specific controls via bindings/expressions.
- Posing:
  - Consumes standard input definitions and authoring metadata.
  - Writes `PoseRigConfigFile` + pose graph spec using the existing pose rig services, with the ability to represent both generic (standard-input-based) and face-specific rigs.
- Downstream:
  - Pose Rig Library and runtime bundles (`VizijPoseRigConfig`) use the same standard-input-based representation for cross-face reuse.

## 5. Architectural Considerations

- **Reuse Existing Services**: Build on `PoseRigStore`, `PoseConfigService`, and `PoseGraphService` rather than creating new pose formats.
- **Standard Input Schema**: Treat the standard input set as the contract between Rigging, Posing, and Pose Rig Library; pose definitions should reference these IDs exclusively.
  - Recognize that the schema is community-defined and versioned; both rigging tools and pose rigs must record which version they target.
- **Authoring Metadata**: Persist show/hide and grouping metadata alongside standard inputs so it can be consumed both in Rigging and Posing.
- **Interplay with Visual Handles**: Ensure the planned Visual Handles work in both Rigging and Posing modes, driving the same standard inputs.

## 6. Risks & Unknowns

- **UI Complexity**: Combining Rigging and Face Editing into a single sidebar with multiple tabs risks overwhelming new users.
- **State Synchronization**: Keeping rigging metadata, standard inputs, and pose definitions in sync requires careful store design and migrations.
- **Cross-Face Assumptions**: Relying on standard inputs for pose reuse assumes a stable schema; evolution of that schema must be versioned and documented.
  - Need clear guidance on how to handle faces that implement only a subset of the standard inputs or add richer, face-specific controls.

## 7. Success Metrics

- **Time to First Pose**: Reduction in time required to rig a face and capture a reusable pose from a fresh import.
- **Reuse Across Faces**: Ability to apply a "pose set" designed on one standard-input-compliant face to another with minimal manual adjustment.
- **User Clarity**: Positive feedback on the separation between Rigging/Face Editing and Posing, with reduced confusion about where to perform each task.
