# File Format Schemas (Minimum Fields)

<!-- tags: status=reference; topics=formats,schemas,assets -->

This appendix lists the minimum fields required for common Vizij file formats.
It is intentionally lightweight and focuses on structural requirements, not
full schemas.

## Face GLB

Minimum expectations:
- Contains a scene hierarchy.
- Exposes animatable metadata for controllable features.
- May embed a Vizij bundle with rig/pose/animation metadata.

## Rig Graph (`rig.graph.json`)

Minimum fields:
- `nodes`: list of nodes with `id` and `type`.
- `edges`: list of connections (optional if no wiring).
- Output nodes must include a `path` in their params.

## Pose Rig Config (`pose-rig.config.json`)

Minimum fields:
- `version`
- `neutralInputs` map
- `poses` array, each with `id` and `values`

## Pose Graph (`pose-rig.graph.json`)

Minimum fields:
- `nodes`
- `edges`
- Input nodes for pose weights
- Output nodes that emit rig‑input paths

## Animation Clip (Stored Animation JSON)

Minimum fields:
- `id` or `name`
- `duration`
- `tracks` with `animatableId` or target path
- Each track has keyframes with `stamp` and `value`

## Orchestration Descriptor

Minimum fields:
- `schedule`
- `graphs` list
- `animations` list (optional if graph‑only)
- Optional `initial_inputs` and `steps` for tests

## General Graph Spec (`*.graph.json`)

Minimum fields:
- `nodes` with `id` and `type`
- Optional `edges`
- Node params where required by node type

If you need strict validation, define a project‑specific schema and enforce it
in CI or authoring tooling.
