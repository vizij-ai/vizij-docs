# Standard Inputs

<!-- tags: status=reference; topics=standards,inputs,rigging -->

## Purpose

Standard inputs are a portable control schema. They let different faces share
poses, drivers, and tools by agreeing on a stable set of control paths. A rig
“adheres” to the standard by wiring these paths into its graph.

## Path Shape

Standard inputs are expressed as typed paths under `/standard/...`. The common
shape is:

```
/standard/<namespace>/<channel>/<track>/<attribute>
```

Examples:

- `/standard/left_eye/pos/x`
- `/standard/right_eye/pos/y`
- `/standard/mouth/scale/x`

A namespace segment may be omitted in some tooling workflows; the important
property is that paths normalize to `/standard/...` and are consistent.

## Scope and Required Set

Vizij currently treats standard inputs as **conventions**, not a fixed,
validated schema. There is no single authoritative required list in these docs.
Instead:

- **Required set is project‑defined.** Teams decide which channels must exist
  for portability.
- **Portability increases with coverage.** The more standard inputs a rig
  exposes, the more reusable its poses and tooling become.

If you need a strict schema, define it as a project artifact and align authoring
and runtime validation against it.

## Governance and Extension

When adding new standard inputs:

1. **Define the path** under `/standard/...` and document its intent.
2. **Map it in the rig** so the path produces a predictable effect.
3. **Update pose libraries** or tools that assume a stable set of channels.
4. **Communicate changes** to downstream teams to avoid drift.

## Best Practices

- Prefer stable, semantic names (`left_eye`, `mouth`, `brow`) over asset‑specific
  identifiers.
- Keep attributes small and consistent (`pos/x`, `rot/z`, `scale/y`) so they are
  composable.
- Normalize paths early (authoring tools should output canonical `/standard/...`
  paths).

## Relationship to Rigs and Poses

- **Rigs** declare adherence by wiring standard inputs into their graphs.
- **Poses** target standard inputs to remain cross‑face portable.
- **Graphs** use standard inputs as upstream signals, then remap or blend into
  animatable outputs.
