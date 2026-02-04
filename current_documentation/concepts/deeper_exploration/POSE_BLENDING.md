# Pose Blending

<!-- tags: status=reference; topics=poses,blending,math -->

## Purpose

Pose blending defines how multiple pose targets and neutral inputs combine into
final rig inputs.

## Conceptual Model

Each pose defines **target values** for a subset of inputs. A pose weight
controls how strongly the system moves toward those targets relative to neutral.

## Typical Formula (Conceptual)

For a single input channel `c`:

```
value(c) = neutral(c) + sum_i( weight_i * (pose_i(c) - neutral(c)) )
```

Where:

- `neutral(c)` is the baseline input value.
- `pose_i(c)` is the target value for pose `i` (if defined).
- `weight_i` is the pose weight (0..1 or beyond, depending on authoring).

## Overlapping Targets

When multiple poses affect the same channel, the weights determine the final
blend. This is a **linear blend** unless a pose graph applies additional
non‑linear logic (clamps, curves, or custom blend nodes).

## Priority Rules

Vizij does not impose a global priority order. Priority is expressed by:

- Pose weights
- Graph structure (e.g., overrides, clamps, or max/min logic)
- Orchestrator merge strategy if pose outputs collide downstream

## Practical Guidance

- Keep weights in a consistent range (e.g., 0..1) to make blending predictable.
- If you need hard priority (one pose overrides another), encode it in the pose
  graph explicitly rather than relying on implicit ordering.
