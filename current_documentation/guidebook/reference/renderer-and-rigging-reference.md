<!-- tags: type=reference; status=written; topics=guidebook,renderer,rigging,paths -->

> **Last updated:** 2026-03-11
> **Guidebook note:** promoted from the workshop handout so this version can become the reusable canonical source

# Renderer and Rigging Reference

## What To Understand

Vizij’s authoring and runtime surfaces stay aligned when you can answer these questions:

1. What face or namespace is being controlled?
2. What path is the control writing to?
3. Is the path a standard input, a pose weight, a viseme, or another custom route?

## Standard Path Shape

```text
rig/{face}/standard/{channel}/{track}/{attribute}
```

Examples:

1. `rig/{face}/standard/left_eye/pos/x`
2. `rig/{face}/standard/right_eye/pos/y`

## Pose Path Shape

```text
rig/{face}/poses/{pose_name}.weight
```

Examples:

1. `rig/{face}/poses/smile.weight`
2. `rig/{face}/poses/surprised.weight`

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
3. Which poses belong under a simple `poses` path versus another grouping concept?
4. Which controls are important enough to surface in a participant workshop?

## Downstream Use

This reference should feed:

1. renderer-data-model and rigging/control concept pages
2. authoring and rigging workflows
3. workshop exercises and handouts
