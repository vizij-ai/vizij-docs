# Vizij Architecture Primer

<!-- tags: status=reference; topics=architecture,rigging,graphs,animation,orchestrator -->

## 1. System Map

Vizij’s runtime architecture is a small set of coordinated services that
deliver deterministic control over a rendered face. At the top level there are
three active layers: **renderer**, **orchestrator**, and **controllers**
(graphs + animations). Each layer is explicit so you can reason about data flow
the same way you would in a robotics pipeline.

The **renderer** owns the visual scene and applies values to animatables. It is
the “actuation” surface: everything upstream ultimately feeds it. Above that,
the **orchestrator** acts as the execution coordinator. It stages inputs,
schedules graphs and animations, merges their writes deterministically, and
produces a frame of outputs. Graphs and animations are the **controllers**
themselves: graphs compute values from inputs, and animations generate
time-based values. Neither controller talks directly to the renderer; both write
to the orchestrator’s shared blackboard.

At runtime, a face is loaded as a GLB plus Vizij metadata. The runtime extracts
the rig graph, optional pose graph/config, and any embedded animations, then
registers them with the orchestrator. A single orchestrator can coordinate
multiple faces by namespacing their paths, which is similar to running multiple
robots with independent state in a shared process.

So the system map is intentionally small:

1. **Renderer** applies values to animatables.
2. **Orchestrator** coordinates execution and merges writes.
3. **Graph controllers** compute values from inputs.
4. **Animation controllers** produce time-based values.
5. **Blackboard** stores the shared typed-path state the controllers read/write.

Everything else in the runtime exists to feed, coordinate, or observe those
pieces.

## 2. Core Contracts (Value, Shape, TypedPath)

Vizij’s runtime is deterministic because every subsystem speaks the same data
language. Three contracts form the backbone: **Value**, **Shape**, and
**TypedPath**. If you understand these, you can reason about any data exchange
between graphs, animations, and the renderer.

**Value** is a tagged, typed payload. It carries the actual numeric or structured
data (scalars, vectors, quaternions, colors, transforms, booleans, text, records
and arrays). In JSON, values are wrapped as an explicit envelope:

```json
{ "type": "float", "data": 0.5 }
```

This explicit envelope prevents ambiguity when values cross system boundaries
(WASM, JSON, file formats). It also makes debugging simple: every value has a
type attached to it.

**Shape** describes the structural expectation of a Value. Shapes are used to
validate, coerce, or reject incoming data and to create deterministic “null”
values when inputs are missing. For example, a graph may declare that an input
expects a `vec3` shape so that a scalar cannot silently leak into a vector
computation. Shapes are the “geometry” of data; values are the “measurements.”

**TypedPath** is the address of a value. It is a stable string path that
identifies what a value means, not just where it lives. Typed paths are used for
graph inputs, graph outputs, animation targets, and renderer animatables. Paths
can be namespaced, hierarchical, and human-readable. Examples:

```
rig/tiago/standard/left_eye/pos/x
rig/tiago/poses/smile.weight
anim/player/0/instance/0/weight
```

Taken together:

1. **TypedPath** says *where* a value belongs.
2. **Value** says *what* the value is.
3. **Shape** says *what kind* of value is valid there.

This contract is what lets a robotics‑style control system remain stable across
authoring tools, runtime controllers, and the renderer.

## 3. Graph Runtime (GraphSpec + GraphRuntime)

Vizij graphs are deterministic dataflow programs. A **GraphSpec** is the
declarative description: nodes, edges, ports, and parameters. A **GraphRuntime**
is the execution instance that evaluates that spec every frame.

The evaluation model is simple and repeatable:

1. **Stage inputs.** The runtime accepts inputs keyed by TypedPath. Each frame
   advances an epoch; any input not refreshed in the current epoch is dropped.
   This prevents stale values from leaking across frames.
2. **Plan execution.** The graph is walked in topological order. The runtime
   maintains a structural cache so it doesn’t recompute the execution plan
   unless the graph changes shape.
3. **Evaluate nodes.** Each node consumes its inputs, applies selectors,
   validates shapes, and produces outputs. Errors are explicit and deterministic.
4. **Collect writes.** Output nodes emit a WriteBatch of typed writes that can
   be applied to the blackboard or forwarded to the renderer.

Because graph evaluation is deterministic, you can treat it as a control law:
given the same inputs and time, it will produce the same outputs. This is
important for robotics‑style reasoning, simulation, and replay.

## 4. Animation Runtime (Engine, Players, Instances)

Vizij animations are time‑based value generators. The **Engine** stores
animation data (tracks, keyframes, easing), advances time, and produces a list
of changes each frame.

Animations are organized around **players** and **instances**:

- A **player** holds playback state (time, speed, loop mode).
- An **instance** binds a specific animation to a player with a weight, time
  scale, and start offset.

This makes blending explicit. Multiple instances can target the same player,
and their values are blended in a deterministic order. The result is a set of
typed changes keyed by TypedPath that can be applied to the blackboard or
directly to animatables.

The key architectural point is that animations do not “own” the rig. They emit
value changes that can be merged with graphs or other animations, which allows
you to layer authored motion with live control.

## 5. Orchestrator (Blackboard, Scheduling, Merge Strategies)

The **orchestrator** coordinates graphs and animations against a shared
**blackboard**. The blackboard is a map of TypedPath → Value (+ optional Shape
and provenance). Every controller reads from it and writes back to it.

The orchestrator’s job is to schedule controllers, apply their writes
deterministically, and emit a consistent frame. It supports multiple schedules:

- **SinglePass**: animations → graphs
- **TwoPass**: graphs → animations → graphs (supports feedback loops)

This scheduling makes the orchestrator act like a coordinator in a control
stack: it sequences components that must run in order, then merges their outputs
into a single state update. Write conflicts are logged so you can diagnose
competing controllers or unintended feedback loops.

Merge strategies matter when multiple graphs target the same outputs. Vizij
supports configurable conflict handling (error, namespacing, additive, or blend
strategies), keeping the system deterministic even in complex rigs.

In practice, the orchestrator is the runtime “traffic controller.” It ensures
that graphs, animations, and inputs converge on a single, stable blackboard
state each frame before values are applied to the renderer.

## 6. Asset Bundling (VIZIJ_bundle in GLB)

Vizij treats a face as more than geometry. At export time, the face can carry a
bundle of rig, pose, and animation metadata alongside the GLB. This lets a
single asset file contain both the visual mesh and the behavioral definitions
needed at runtime.

Conceptually, bundling serves two purposes:

1. **Portability** – A face can be moved between tools or teams without losing
   its control system.
2. **Consistency** – The same rig/pose/animation definitions travel with the
   asset, reducing mismatches between authoring and runtime.

Because the bundle is embedded, runtimes can load a face and discover its rig
graphs and pose data automatically. The runtime harness extracts the bundle,
registers controllers, and then steps the orchestrator; this is the link between
bundling and runtime execution. When you need to override or extend a face, the
bundle can be layered with external graphs or updated data, but the default
experience is self‑contained.

## 7. Runtime React Stack (Render + Orchestrator + Runtime Provider)

The runtime stack is designed to make face control accessible at application
level without leaking low‑level concerns. Conceptually it does three things:

1. **Loads assets** and extracts face metadata.
2. **Installs controllers** (rig graphs, pose graphs, animations) into the
   orchestrator.
3. **Bridges outputs** into the renderer so animatables update every frame.

This stack is also responsible for namespacing, so multiple faces can share a
single orchestrator while remaining isolated. In practice, it behaves like a
high‑level runtime harness: you supply an asset bundle, and the runtime handles
initialization, registration, and update loops.

## 8. Constraints and Known Edges

Vizij’s architecture is deliberate, but a few constraints shape how you work:

- **Standard input coverage matters.** If key rig controls are not mapped to
  standard inputs, it becomes harder to reuse poses or tools across faces.
- **Face identity must stay consistent.** Rig graphs, pose configs, and bundles
  often carry a face identifier; mismatches between a loaded face and its graph
  definitions will surface as missing outputs or silent no‑ops.
- **Namespacing is essential for multi‑face runtimes.** Without a namespace
  boundary, typed paths collide and controllers overwrite each other.
- **Graph structure changes are significant.** When the topology of a graph
  changes, cached execution plans and compiled forms must be refreshed; treating
  structure as immutable within a runtime loop avoids stale behavior.
- **Conflicts are visible but real.** If multiple controllers write the same
  path, Vizij will log conflicts, but you still need to decide which source
  “wins” through merge strategy or graph design.

These are not blockers, but they are the edges where teams should align on
conventions early.
