<!-- tags: family=workshop; type=handout; workshop_kind=reusable; workshop_status=ready; topics=workshop,workshops,vizij-afternoon-workshop,handouts,renderer-rigging-reference -->

# Handout: Renderer and Rigging Reference

Last updated: 2026-03-09

## What To Understand

Vizij’s authoring and runtime surfaces stay aligned when you can answer these questions:

1. What face or namespace is being controlled?
2. What path is the control writing to?
3. Is the path a standard input, a pose weight, an internal pose-control route, or another custom route?

## Standard Input Path Shape

```
/standard/{standard_namespace}/{channel}/{track}/{attribute}
```

Examples:

1. `/standard/vizij/left_eye/pos/x`
2. `/standard/vizij/right_eye/pos/y`

## Runtime Path Shape

```
rig/{face}/standard/{standard_namespace}/{channel}/{track}/{attribute}
```

Examples:

1. `rig/{face}/standard/vizij/left_eye/pos/x`
2. `rig/{face}/standard/vizij/right_eye/pos/y`

## Pose Path Shape

```
rig/{face}/poses/{pose_name}.weight
```

Examples:

1. `rig/{face}/poses/smile.weight`
2. `rig/{face}/poses/surprised.weight`

Speech-facing viseme and emotion behavior still writes these canonical pose-weight paths. Pose groups define blend behavior for subsets of poses; they do not change the path shape.

## Rigging Workflow

In `vizij-authoring`:

1. Load a sample GLB.
2. Inspect animatable features.
3. Group or organize pose controls.
4. Export a bundle or rig graph.
5. Reuse the exported bundle in a runtime app.

## Naming Guidance

Names used in hotkey- and path-driven flows are typically:

1. Lowercased
2. Sanitized to alphanumeric plus underscores
3. Trimmed to stable path-friendly ids

## Good Questions To Ask While Rigging

1. Which controls should be standard and reusable?
2. Which controls are face-specific or experimental?
3. Which poses belong under a simple `poses` path versus another grouping concept?
4. Which controls are important enough to surface in a participant workshop?
