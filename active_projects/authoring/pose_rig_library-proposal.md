# Pose Rig Library Proposal
<!-- tags: status=proposal; topics=workflow,import-export,tooling,graph-ir -->

> **Related documents:** Plan (pending) · Reference (pending) · [Project summary](summary.md)

## Context & Problem Statement

Vizij authors can export full rig graphs alongside GLBs, but there is no dedicated workflow for packaging curated pose collections. Teams frequently build reusable “pose rigs” for stylised expressions, gestures, or animation snippets that should travel between projects without the rest of the asset payload. Today those poses live as ad-hoc JSON snapshots or in project-specific notebooks, making reuse and review difficult.

## Goals

1. **Pose Rig Grouping** – Allow authors to group individual poses into named pose rigs within Vizij Authoring.
2. **Graph Export Format** – Emit each pose rig as a self-contained graph describing input bindings and pose values, separate from the GLB.
3. **Import & Rebinding** – Import pose rig graphs into another project, automatically binding poses to matching standard inputs where possible.
4. **Conflict Handling** – Surface diagnostics when imported poses reference missing inputs and offer guidance for remapping.
5. **Tooling & Documentation** – Provide UI/CLI affordances and documentation for creating, exporting, importing, and validating pose rigs.

### Non-goals

- Replacing GLB export/import for full rig state (covered by the Import/Export Pipeline pillar).
- Building animation sequencing beyond pose snapshots.

## Architectural Design (Concept)

### Authoring Flow

1. **Pose Selection & Grouping** – Extend Vizij Authoring’s pose tooling to tag poses into one or more pose rigs (e.g., “Smile Set”, “Hand Gestures”).
2. **Pose Rig Graph Generation** – For each rig, create a lightweight graph that captures the relevant standard inputs and their pose values, possibly as a subgraph referencing shared nodes.
3. **Export Step** – Provide export actions that produce:
   - `pose-rigs/<rig-name>.json` (GraphSpec or IR representation of the pose rig).
   - Optional manifest summarising included poses, required inputs, and metadata (version, author, tags).

### Import Flow

1. Load pose rig graph into Vizij Authoring.
2. Map pose rig inputs to the current project’s standard inputs using canonical IDs. Highlight any unresolved mappings and allow manual fixes.
3. Inject imported poses into the local pose library, preserving grouping metadata.

### Integration Points

- Reuse the Graph IR/Import-Export infrastructure for serialising pose rigs.
- Leverage standard input ID normalisation to improve rebinding success.
- Consider optional CLI for headless conversion or batch operations.

## Risks & Trade-offs

- **Input Mismatch** – Imported rigs may reference inputs absent in the target project; requires intuitive conflict resolution.
- **Version Drift** – Pose rigs tied to evolving standard inputs could become stale; may need metadata (schema versions, required inputs).
- **Tooling Complexity** – Care must be taken to avoid overloading the existing pose UI.

## High-level Plan (Draft)

1. **Discovery & UX Design** – Define UI affordances for grouping poses and exporting rigs.
2. **IR Schema** – Specify pose rig graph format (likely a constrained GraphSpec or IR snapshot).
3. **Export Implementation** – Build pose rig export pipeline and file manifest.
4. **Import & Rebinding** – Implement import flow with diagnostics/remapping UI.
5. **Validation & Docs** – Add tests, CLI integrations, and contributor documentation.

## Approval & Next Steps

- Gather stakeholder input (production animation, tools, runtime) to validate scope.
- Once approved, spin up plan & tracking + reference documents following the project documentation guide.
