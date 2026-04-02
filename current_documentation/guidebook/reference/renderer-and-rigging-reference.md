<!-- tags: family=guidebook; type=reference; editorial_status=completed; publication_status=planned; topics=guidebook,renderer,rigging,paths -->

> **Last updated:** 2026-03-31
> **Purpose:** provide the compact reference bridge between rig structure, path families, and the naming rules that keep authored and runtime surfaces aligned

# Renderer and Rigging Reference

## Guidebook Context

1. **Bucket:** [Guidebook Reference](README.md)
2. **Depth role:** cross-cutting reusable reference layer
3. **Module type:** reference bridge
4. **Bucket overview:** [Guidebook Reference](README.md)
5. **Useful previous module:** [Runtime Quickstart](runtime-quickstart-reference.md)
6. **Useful next module:** [Animation, Integration, and Deployment Reference](animation-integration-and-deployment-reference.md)

## Reader Outcome

After this page, you should be able to recall the main runtime path families, the basic rigging workflow boundary, and the naming rules that keep authored structure readable at runtime.

## Use This Reference When

Open this page when you already know you are reasoning about rigging or control vocabulary and need a compact reminder of:

1. standard versus pose-path structure,
2. how authoring flow turns into runtime-addressable controls,
3. the naming rules that keep those controls stable enough to reuse.

## What To Understand

Vizij’s authoring and runtime surfaces stay aligned when you can answer these questions:

1. What face or namespace is being controlled?
2. What path is the control writing to?
3. Is the path a standard input, a pose weight, an internal pose-control route, or another custom route?

## Standard Input Path Shape

The authoring and operator-slot form for a standard control is:

```text
/standard/{standard_namespace}/{channel}/{track}/{attribute}
```

Examples:

1. `/standard/vizij/left_eye/pos/x`
2. `/standard/vizij/right_eye/pos/y`

## Runtime Path Shape

```text
rig/{face}/standard/{standard_namespace}/{channel}/{track}/{attribute}
```

Examples:

1. `rig/{face}/standard/vizij/left_eye/pos/x`
2. `rig/{face}/standard/vizij/right_eye/pos/y`

## Pose Path Shape

```text
rig/{face}/poses/{pose_name}.weight
```

Examples:

1. `rig/{face}/poses/smile.weight`
2. `rig/{face}/poses/surprised.weight`

## Control Family Reminder

| Family | Canonical shape | Best use |
| --- | --- | --- |
| standard input path | `/standard/{standard_namespace}/...` in authoring and operator-slot teaching, `rig/{face}/standard/{standard_namespace}/...` at runtime | reusable rig-facing channels such as gaze or jaw |
| pose weight | `rig/{face}/poses/{pose}.weight` | named authored facial states |
| internal pose-control route | `rig/{face}/pose/control/{inputId}` | compiled pose-graph output before runtime-react bridges it onto the actual rig input |

Speech-facing viseme and emotion behavior still resolves onto the same canonical pose-weight paths. Pose groups exist to define how subsets of poses blend. They do not add extra path segments.

## Rigging Workflow

In `vizij-authoring`:

1. load a sample GLB
2. inspect animatable features
3. group or organize pose controls
4. export a bundle or rig graph
5. reuse the exported bundle in a runtime app

## Naming Guidance

Names used in hotkey- and path-driven flows are typically:

1. lowercased
2. sanitized to alphanumeric plus underscores
3. trimmed to stable path-friendly ids

## Good Questions To Ask While Rigging

1. Which controls should be standard and reusable?
2. Which controls are face-specific or experimental?
3. Which poses belong under the shared `poses` path, and which blend groups should organize them without changing that path?
4. Which controls are important enough to surface in a participant workshop?

## Best Next Pages

1. If you need the authoring route behind these structures, continue to [Rigging](../customize/rigging.md).
2. If you need the runtime vocabulary around these structures, continue to [Paths and Standard Controls](../control/paths-and-standard-controls.md).
3. If you need deployment-slot writing rather than runtime-path structure, continue to [Animation, Integration, and Deployment Reference](animation-integration-and-deployment-reference.md).
