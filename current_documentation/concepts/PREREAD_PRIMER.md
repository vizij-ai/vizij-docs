# Vizij Pre‑Read Primer

<!-- tags: status=reference; topics=primer,basics -->

This primer covers the baseline concepts assumed by the Vizij docs. It is not a
Vizij‑specific tutorial; it is a quick orientation to the underlying ideas.
If any of these terms feel unfamiliar, look them up before reading the deeper docs.

## 1. 3D Asset Basics

- **GLB**: A binary glTF file containing meshes, materials, textures, and a
  scene hierarchy.
- **Scene Graph / Hierarchy**: A tree of objects where parent transforms affect
  children. This matters because moving or rotating a parent changes how its
  children behave visually.
- **Transforms**: Position, rotation, and scale values applied to objects. They
  are often represented as vectors and quaternions.
- **Blendshapes / Morph Targets**: Predefined mesh deformations that can be
  weighted to change facial expression.

## 2. Dataflow Graphs

- **Node**: A unit of computation that consumes inputs and produces outputs.
- **Edge**: A connection carrying values from one node to another.
- **Deterministic Evaluation**: Given the same inputs and time, a graph produces
  the same outputs every run.
- **Topological Order**: The graph is evaluated in an order that respects data
  dependencies.

## 3. Animation Vocabulary

- **Clip**: A stored animation with tracks and keyframes.
- **Track**: A timeline for one target value.
- **Keyframe**: A time‑stamped value on a track.
- **Easing / Interpolation**: The curve used to move between keyframes (often
  cubic).
- **Blending**: Combining multiple animations or values into a single output.

## 4. Runtime Control Stacks

- **Controller**: A component that produces values (e.g., a graph or animation
  runtime).
- **Scheduling**: The order in which controllers run each frame.
- **Blackboard / Shared State**: A single map of values that multiple
  controllers read from and write to.
- **Namespacing**: Prefixing paths to isolate multiple entities in the same
  runtime.

## 5. Typed Data Contracts

- **Value**: A typed payload (number, vector, color, transform, text, etc.).
- **Typed Path**: A stable identifier that says where a value belongs.
- **Shape / Schema**: The expected structure or type of a value.

## 6. Why This Matters for Vizij

Vizij builds on these ideas to create a deterministic, portable pipeline for
+face control.
