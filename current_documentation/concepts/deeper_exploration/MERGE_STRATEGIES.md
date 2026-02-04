# Merge Strategies

<!-- tags: status=reference; topics=orchestrator,merge,conflicts -->

## Purpose

Merge strategies define what happens when multiple controllers write to the same
typed path in a single orchestrator step. The goal is deterministic, explainable
conflict resolution.

## Common Strategies (Conceptual)

The orchestrator can be configured to resolve collisions in different ways. The
exact configuration surface depends on the runtime harness, but the behaviors
are consistent:

- **Error / Reject**: Conflicting outputs are treated as invalid. The merge
  fails, and the conflict is surfaced to the host.
- **Namespace**: Conflicting outputs are preserved by rewriting paths to include
  a producer label, keeping both values available downstream.
- **Additive**: Conflicting numeric values are summed, producing a single merged
  result.
- **Blend (Equal Weights)**: Conflicting values are averaged (useful for smooth
  blending when sources are equivalent).
- **Blend (Weighted)**: Each producer is assigned a weight; the merge uses a
  weighted average.

## When to Use Which

- **Error** when collisions indicate a logic bug.
- **Namespace** when you want to preserve all contributors for later selection.
- **Additive** when sources are intended to accumulate (e.g., layered offsets).
- **Blend** when sources are intended to be mixed into a single motion.

## Operational Guidance

- Choose a default strategy at the orchestrator level.
- Override strategy per output path when you know a path is multi‑writer.
- Always monitor conflict logs; they indicate either intended layering or a
  design mistake.

## Practical Consequences

Merge strategy choice shapes runtime behavior. The same graph/animation stack
can feel stable or chaotic depending on whether overlaps are blended, added, or
rejected. Strategy is part of the rig design, not just a runtime setting.
