# Graph Conventions (Rig + Pose)

<!-- tags: status=reference; topics=graphs,rigs,poses,conventions -->

## Purpose

Graphs are the base computation model. Rigs and poses are **conventions** on top
of that model. This document clarifies what is required vs optional for those
conventions.

## Rig Graph Conventions

**Required**
- Accept typed inputs (including standard inputs if portability is needed).
- Emit typed‑path outputs that eventually target animatables.
- Produce deterministic outputs for the same inputs/time.

**Optional / Project‑Defined**
- Layering conventions (one rig feeding another).
- Specific node types or remap strategies.
- Output naming schemes beyond typed‑path conventions.

## Pose Graph Conventions

**Required**
- Consume pose weights and neutral inputs.
- Output a consolidated set of inputs for the rig graph.
- Blend multiple poses deterministically.

**Optional / Project‑Defined**
- Non‑linear blending, priority logic, or pose gating.
- Multiple pose graphs (emotion vs viseme) combined upstream of the rig.

## Validation Guidance

Because these are conventions, validation typically happens in tooling or
pipeline tests rather than in the runtime engine itself. A rig or pose graph is
“conformant” if:

- It accepts the expected input set.
- It emits the expected output paths.
- It behaves deterministically under test inputs.

## Relationship to IR

Authoring IRs can encode metadata and issues, but they must compile into a
GraphSpec that follows the conventions above. The runtime only executes the
GraphSpec.
