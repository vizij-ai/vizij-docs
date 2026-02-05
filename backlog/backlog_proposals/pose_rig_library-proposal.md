# Pose Rig Library Proposal
<!-- tags: status=proposal; topics=workflow,import-export,tooling,graph-ir,standard-inputs -->

> **Related documents:** Plan (pending) · Reference (pending) · [Authoring Summary](../backlog/active_projects/authoring/summary.md)

## Context & Problem Statement

Vizij authors can already create pose collections via the `PoseRigStore` and export full rig graphs alongside GLBs. In parallel, we intend to maintain a **community-defined, versioned schema of standard inputs** (e.g., facial expressions, phonemes, common rig controls). The rigging process for a face:

- Defines how face-specific inputs behave for that asset, and
- Maps those face-specific inputs to the current version of the **standard inputs** via bindings and expressions.

However, there is no dedicated workflow or format for packaging **standard-input-based pose rigs** that can travel cleanly between different faces and projects. Today:

- Poses are often tied to project-specific inputs instead of standard inputs.
- Teams maintain reusable expression/phoneme sets as ad-hoc JSON snapshots or external notes.
- There is no obvious way to share a "face expression set" or "gesture library" with another team without copying full bundles or rewriting poses.

This makes reuse, review, and community sharing of poses much harder than it needs to be.

## Goals

1. **Standard-Input Pose Rigs (Library Artifacts)** – Treat library pose rigs as collections of poses defined in terms of **standard input IDs** plus a referenced standard input schema version. These rigs are generic and intended to work across any face that implements the same standard input schema.
2. **Face-Specific Pose Support** – Preserve support for face-specific pose rigs within projects; ensure the authoring surfaces can import/export both generic (standard-input) and face-specific poses without forcing everything through the standard schema.
3. **Authoring Integration** – Extend the Rigging/Face Editing + Posing workflow so authors can group poses into named pose rigs (e.g., “Expressions”, “Phonemes”, “Gestures”) and see how they relate to both standard inputs and face-specific controls.
4. **Graph/IR Export Format** – Emit each pose rig as a self-contained graph or IR snapshot that describes the standard input bindings and pose values, separate from the GLB and scene graph, with explicit schema version metadata.
5. **Import & Rebinding** – Import pose rig graphs into another project, automatically binding poses to matching standard inputs where possible, with clear diagnostics and remapping tools when inputs differ, and a path for applying generic rigs onto faces with richer, face-specific control sets.
6. **Tooling & Documentation** – Provide UI/CLI affordances and documentation for creating, exporting, importing, and validating pose rigs, including guidance for how to design standard-input-compliant faces and how to combine generic library rigs with face-specific poses.

### Non-goals

- Replacing GLB export/import for full rig state (covered by the Import/Export pipeline and bundle tooling).
- Defining the entire "preset library" system for arbitrary assets; this project is focused specifically on **pose rigs** (generic and face-specific).
- Implementing animation sequencing or timelines (covered by the Animation Authoring proposal).

## Architectural Design (Concept)

### Authoring Flow

1. **Pose Selection & Grouping**
   - Extend Vizij Authoring’s pose tooling to:
     - Tag poses into one or more pose rigs (e.g., “Expressions”, “Phonemes”, “Hand Gestures”).
     - Indicate which **standard inputs** and which **face-specific inputs** each pose affects.
   - Use the shared Rigging + Face Editing sidebar to validate that:
     - Required standard inputs for a given library rig are present and mapped for the current face.
     - Face-specific controls used by local poses are clearly identified as such.
2. **Pose Rig Graph Generation**
   - For each rig, create a lightweight representation that captures:
     - For **generic rigs**: the **standard input IDs**, their values per pose, and the **standard input schema version**.
     - For **face-specific rigs**: local control IDs and their values per pose, keeping any linkage to standard inputs explicit but optional.
     - Optional metadata (pose labels, groups, tags, author, schema version, rig kind = generic/face-specific).
   - Represent pose rigs as:
     - A constrained GraphSpec (e.g., subgraph per pose rig), or
     - A dedicated "pose rig" IR that can be compiled into a graph when needed.
3. **Export Step**
   - Provide export actions that produce:
     - `pose-rigs/<rig-name>.json` – the pose rig spec/IR.
     - A manifest summarising included poses, required standard inputs (with schema version), and metadata (rig kind, author, topics).
   - Integrate with existing bundle export flows so pose rigs can be shipped alongside (but decoupled from) GLBs and rig graphs.

### Import Flow

1. Load a pose rig spec/IR into Vizij Authoring.
2. If the rig is **generic**:
   - Match pose rig standard inputs (and schema version) against the current project’s standard inputs.
   - Automatically bind when IDs and schema version are compatible.
   - Highlight unresolved mappings (missing, renamed, or changed semantics), and allow schema-aware remapping.
3. If the rig is **face-specific**:
   - Attempt best-effort mapping to local controls, but primarily treat it as a project-local asset.
4. Provide a remapping UI:
   - Let authors manually connect unmatched rig inputs to local standard inputs or face-specific controls.
   - Offer suggestions based on naming, categories, or prior mappings.
5. Inject imported poses into the local pose library:
   - Preserve grouping metadata (e.g., “Expressions”, “Phonemes”).
   - Respect local visibility and grouping decisions from the Rigging sidebar.

### Integration Points

- **Authoring**:
  - Builds on the `PoseRigStore`, `PoseConfigService`, and `PoseGraphService`.
  - Depends on the Rigging & Posing project to expose standard inputs and control groupings consistently.
- **Runtime & Bundles**:
  - Aligns with `VizijPoseRigConfig` in `@vizij/render` and related bundle types.
  - Can be mirrored into `vizij-rs` fixtures for automated tests and examples.
- **Tooling**:
  - Optional CLI or scripts to:
    - Validate pose rigs against a standard input schema.
    - Convert between pose rig formats (e.g., IR ↔ GraphSpec).

## Risks & Trade-offs

- **Input Mismatch** – Imported rigs may reference standard inputs that are missing or significantly different in the target project; requires intuitive conflict resolution and good error messages.
- **Schema Evolution** – Pose rigs tied to evolving standard input schemas could become stale; metadata (schema version, required inputs) must be included and validated, and we must support multiple versions in the library.
- **UI Complexity** – Adding rig selection and import/export controls to the existing pose UI must be done carefully to avoid overwhelming users.

## High-level Plan (Draft)

1. **Discovery & UX Design**
   - Map current pose authoring flows and identify how pose rigs fit into the Rigging/Face Editing + Posing surfaces.
   - Define UI affordances for grouping poses, selecting rigs, and exporting/importing them.
2. **IR/Schema Design**
   - Specify the pose rig representation:
     - Standard input schema references.
     - Pose definitions and metadata.
     - Manifest structure.
3. **Export Implementation**
   - Implement pose rig export in `vizij-authoring`, wiring into existing bundle export flows.
   - Add validations for missing or inconsistent standard inputs.
4. **Import & Rebinding**
   - Implement import flows with diagnostics and remapping UI.
   - Add runtime-side helpers for applying pose rigs to bundles.
5. **Validation & Documentation**
   - Add tests (unit + integration) around pose rig export/import.
   - Document best practices for authoring standard-input-compatible faces and pose rigs.

## Approval & Next Steps

- Gather stakeholder input (production animation, tools, runtime) to validate scope and confirm the standard input assumptions.
- Once approved, spin up plan & tracking + reference documents following the project documentation guide.
