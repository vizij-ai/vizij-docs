# Animation Targeting

<!-- tags: status=reference; topics=animation,targeting,typed-paths -->

## Purpose

Animations target typed paths. Choosing the right target layer determines how
motion blends with other controllers.

## Target Layers

- **Animatable targets**: Write directly to renderer‑level values. This gives
  immediate visual control but bypasses rig logic.
- **Graph input targets**: Write into graph inputs so rig logic can remap,
  clamp, or blend before values reach animatables.

## Best Practices

- Target **graph inputs** when you want a rig to mediate or combine motion.
- Target **animatables** when you need direct control and no additional logic.
- Avoid mixing both for the same feature unless you have an explicit merge
  strategy; otherwise conflicts become unpredictable.

## Conflict Avoidance

- Use consistent naming for animation targets across assets.
- Prefer standardized paths for reusable animation libraries.
- If multiple animations target the same path, ensure the orchestrator merge
  strategy is intentional (blend or additive).

## Practical Example

A blink animation could target `rig/face/poses/blink.weight` if it should blend
with pose logic. If it targets `eye_lid/pos/y` directly, it will override rig
logic unless merged explicitly.
