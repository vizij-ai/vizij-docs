# Standard Inputs

<!-- tags: family=reference; type=reference; topics=standards,inputs,rigging -->
> **Last updated:** 2026-03-31

## Purpose

Standard inputs are a portable control schema. They let different faces share
poses, drivers, and tools by agreeing on a stable set of control paths. A rig
“adheres” to the standard by wiring these paths into its graph.

## Path Shape

The canonical standard input path is the authoring/operator slot form:

```
/standard/{standard_namespace}/{channel}/{track}/{attribute}
```

Examples:

- `/standard/vizij/left_eye/pos/x`
- `/standard/vizij/right_eye/pos/y`
- `/standard/vizij/mouth/scale/x`

Use `standard namespace` for the inner namespace segment. In maintained Vizij
examples, the canonical standard namespace is `vizij`.

Legacy unnamespaced `/standard/...` examples may still appear in older material
or compatibility notes, but they are no longer the canonical teaching form.

## Related Surfaces

The same control can appear in multiple surfaces:

| Surface | Canonical shape | Example | Use it for |
| --- | --- | --- | --- |
| standard input path | `/standard/{standard_namespace}/{channel}/{track}/{attribute}` | `/standard/vizij/left_eye/pos/x` | authoring/operator slot form |
| runtime path | `rig/{face}/standard/{standard_namespace}/{channel}/{track}/{attribute}` | `rig/{face}/standard/vizij/left_eye/pos/x` | runtime writes and diagnostics |
| deployment slot | `standard/{standard_namespace}/{channel}/{track}/{attribute}` | `standard/vizij/left_eye/pos/x` | external client writes at deployment boundaries |
| observer key | `{runtime_namespace}/rig/{face}/standard/{standard_namespace}/{channel}/{track}/{attribute}` | `vizij-standalone/rig/{face}/standard/vizij/left_eye/pos/x` | advanced shared-runtime inspection |

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

1. **Define the path** under `/standard/{standard_namespace}/...` and document its intent.
2. **Map it in the rig** so the path produces a predictable effect.
3. **Update pose libraries** or tools that assume a stable set of channels.
4. **Communicate changes** to downstream teams to avoid drift.

## Best Practices

- Prefer stable, semantic names (`left_eye`, `mouth`, `brow`) over asset‑specific
  identifiers.
- Keep attributes small and consistent (`pos/x`, `rot/z`, `scale/y`) so they are
  composable.
- Normalize paths early (authoring tools should output canonical
  `/standard/{standard_namespace}/...` paths).

## Relationship to Rigs and Poses

- **Rigs** declare adherence by wiring standard inputs into their graphs.
- **Poses** target standard inputs to remain cross‑face portable.
- **Graphs** use standard inputs as upstream signals, then remap or blend into
  animatable outputs.
