# Vizij Reference Guide

<!-- tags: status=reference; topics=reference,rigs,poses,graphs,animation -->

## 1. Rigs

**Definition**  
A rig is the control system that maps inputs into outputs through a graph. It
is typically represented as a rig graph that consumes typed paths and produces
typed-path writes, with the final layer writing to animatables. Rigs can be
layered, meaning one rig’s outputs can feed another rig’s inputs before values
reach the renderer.

**Why It Exists**  
Rigs translate abstract control signals into concrete facial motion. They let
authors define how a face should respond to standard inputs, pose weights, or
live drivers without hard‑coding behavior into the renderer.

**Key Properties**  
- **Inputs**: the typed paths a rig reads (standard inputs, pose weights, etc.).  
- **Graph logic**: remaps, blends, and expressions that transform inputs.  
- **Outputs**: typed‑path writes, with the final layer targeting animatables.  
- **Layering**: rigs can stack, feeding downstream rigs before final output.  
- **Portability**: rigs declare adherence to standard inputs by wiring those
  paths explicitly, enabling reuse across faces.

**Where It Lives**  
- In rig graphs (JSON specs) embedded in assets or supplied at runtime.  
- In authoring tools as bindings and driver definitions that compile into rigs.

**How It Interacts**  
- Standard inputs and pose weights flow into the rig.  
- The rig graph computes outputs and writes them to typed paths.  
- Downstream rigs (if any) refine those values before they hit animatables.  
- The orchestrator merges rig outputs with animations and other controllers.

**Common Pitfalls**  
- Treating a rig as a direct animatable mapping and ignoring intermediate
  layers or stacked rigs.  
- Wiring inputs directly to animatables without using standard inputs, which
  reduces portability.  

**Quick Example**  
Layer 1: A rig maps `/standard/left_eye/pos/x` and `/standard/left_eye/pos/y`
into typed‑path outputs that drive eye translation (gaze position).  
Layer 2: A second rig blends those eye translations with pose‑driven eyelid
offsets, then writes the final combined values to the eye animatables.

## 2. Poses

**Definition**  
A pose is a named collection of **target values** that represent an idealized
expression or configuration of a face. Each pose has a **weight** (typically
0..1) that controls how much that pose contributes, and a **value map** that
describes the specific inputs the pose wants to drive toward.

**Why It Exists**  
Poses make expressive control simple. Instead of wiring dozens of inputs every
time you want a “Smile” or “Blink,” you author the target values once and blend
toward them live with weights.

**Key Properties**  
- **Pose definition**: an ID, optional name, and a map of input values.  
- **Weight**: a runtime value that scales the pose’s contribution.  
- **Neutral inputs**: a baseline set of values that define the unposed state.  
- **Pose rig/config** (context): the collection of poses plus their neutral
  inputs.  
- **Pose graph** (context): the graph that blends pose weights into concrete
  rig inputs.

**Where It Lives**  
- In pose rig configs as named pose definitions and neutral inputs.  
- In pose graphs as weighted inputs and blend logic.  
- At runtime as pose weights staged on typed paths.

**How It Interacts**  
- A pose does not directly touch animatables; it targets **inputs** that the
  rig graph will later map into animatables. These inputs represent the pose’s
  target state (e.g., lip curl, eyelid positions).  
- The pose graph combines neutral values with weighted pose targets, producing
  a single set of inputs for the rig. Those outputs become rig inputs at
  runtime.  
- Multiple poses can be blended at once; their weights control the final
  mixture.

**Common Pitfalls**  
- Treating poses as absolute overrides and forgetting the neutral baseline.  
- Mixing poses that edit the same inputs without understanding how weights
  combine.  
- Authoring poses that target inputs not present in the current rig.

**Quick Example**  
A pose called `happy` might define target values for inputs such as
`mouth/pos/y` (lip curl) and `eye_lid/pos/y`. At runtime, `happy.weight = 0.6`
blends 60% of those targets on top of neutral, while other poses can contribute
in parallel.

## 3. Faces

**Definition**  
A face is the visual asset: a GLB (or equivalent) with a structured hierarchy
and a set of animatables that can be driven at runtime. Conceptually, the face
is the renderable “body” that all control logic ultimately affects.

**Why It Exists**  
Faces are the primary product surface in Vizij. They provide the geometry,
materials, and structure that animatables target, and they anchor all higher‑
level behavior to something visible.

**Key Properties**  
- **Hierarchy**: a structured scene graph defining the face’s parts.  
- **Animatables**: the controllable features exposed by the asset.  
- **Visual metadata**: bounds, materials, and other renderer‑level data.  
- **Embedded bundle data** (optional): rig, pose, or animation metadata carried
  alongside the asset.

**Where It Lives**  
- As a GLB file in assets or bundles.  
- In the renderer as a loaded scene with animatables.  
- In authoring tools as a source of features to bind and rig.

**How It Interacts**  
- Rig graphs and animations ultimately write values that affect the face’s
  animatables.  
- Authoring tools inspect the face hierarchy to provide the surface where
  humans build standard inputs and bindings.  
- Runtime loaders can extract embedded control metadata from the face to
  auto‑register rig and pose definitions.

**Common Pitfalls**  
- Treating the face hierarchy as cosmetic; it changes how transformations
  propagate, so the same animatable can look very different depending on its
  parent structure. If you don’t understand the hierarchy, an animation can
  behave in unexpected ways.  
- Re‑exporting a face from external tools and unintentionally changing
  animatable IDs, which breaks rig bindings.  

**Quick Example**  
A face GLB exposes animatables for nearly every visual aspect of the face (eyes,
mouth, brows, materials, transforms). The rig is what narrows that full set down
to the controls you actually want to drive, mapping chosen inputs into a
manageable subset of animatables.

## 4. Animatables

**Definition**  
An animatable is a renderer-level value that can be driven at runtime. It
represents a single controllable feature on a face (or scene), described by
metadata in authoring tools and realized as a concrete value in the renderer.
Animatables may also exist as static values when you choose not to animate or
control them.

**Why It Exists**  
Animatables are the bridge between abstract control logic and visible behavior.
They give rigs, graphs, and animations a stable target that ultimately maps to
mesh transforms, materials, blendshapes, or other renderable properties.

**Key Properties**  
- **ID**: a stable feature identifier (not a rig path) that tools use to target
  the animatable.  
- **Type**: can be numeric or structured (number, vector2, vector3, euler,
  color, boolean, string).  
- **Default value**: the baseline value when nothing is driving it.
- **Constraints**: optional min/max/velocity bounds for authoring and tooling.
- **Components**: vector/euler/color animatables decompose into component
  channels (e.g., `x`, `y`, `z`, or `r`, `g`, `b`) which can be addressed and
  driven individually, but are ultimately written to the renderer as a complete
  grouped value.

**Where It Lives**  
- In face assets (GLB metadata) as part of the renderable feature set.  
- In authoring tools as a descriptor used for binding, mapping, and UI.  
- In the renderer as a live value that is updated each frame.

**How It Interacts**  
- Rig graphs map inputs to animatable IDs (or their components), then assemble
  full values before writing to the renderer.
- Animations can target animatables directly or via graph inputs.
- Standard inputs often feed graphs that ultimately drive animatables.
- Runtime merges all writes and applies them to animatables in the renderer.

**Common Pitfalls**  
- Treating animatable IDs as rig paths; they are distinct and must be mapped.
- Ignoring component channels on vector or color animatables, leading to
  partial updates.
- Re-exporting a face from external tools and unintentionally regenerating
  animatable IDs, which makes the asset behave like a different model even if
  it looks identical.
- Using inconsistent IDs across assets, which breaks portability.

**Quick Example**  
An animatable might be `left_eye_rotation` (type `euler`) with component channels
`x`, `y`, `z`. A rig graph can drive `left_eye_rotation:y` from a standard input
like `/standard/left_eye/pos/y`, combine that with the other components, and
write the full `euler` value to the renderer each frame.

## 5. Graphs

**Definition**  
A graph is a deterministic dataflow program. It is described by a **GraphSpec**
(nodes, edges, parameters) and can optionally be represented in a higher‑level
authoring **IR** that compiles down to a GraphSpec for execution.

Rigs and poses are conventions on top of this same graph system. The required
convention is that they read inputs and emit typed‑path outputs in a predictable
shape (rig outputs ultimately target animatables; pose graphs output rig inputs).

**Why It Exists**  
Graphs are the general computation surface in Vizij. They let you express
control logic, remaps, blends, and reusable transforms in a deterministic,
inspectable form. Rig and pose graphs are conventions built on top of the same
core graph model.

**Key Properties**  
- **Nodes + edges**: the structural building blocks of the graph.  
- **Parameters**: fixed values that configure node behavior.  
- **Inputs/outputs**: typed paths that connect the graph to the rest of the
  runtime.  
- **IR (optional)**: a higher‑level authoring representation with metadata,
  issues, and bindings that compiles to GraphSpec.

**Where It Lives**  
- As JSON graph specs in assets or bundles.  
- In authoring tools as editable IR graphs.  
- In the runtime as compiled graph controllers.

**How It Interacts**  
- Rigs and poses are implemented as graphs with standardized conventions.  
- Graphs read inputs (standard inputs, pose weights, driver values) and emit
  outputs that the orchestrator applies to the blackboard or renderer.  
- IR tooling provides inspection, validation, and metadata without changing the
  runtime execution model.
  See the Architecture Primer’s graph runtime section for how GraphSpec executes.

**Common Pitfalls**  
- Treating rig and pose graphs as special runtimes; they are conventions over
  the same graph system.  
- Assuming graphs are like distributed ROS nodes; in Vizij a graph is a single
  deterministic program executed by the graph runtime/orchestrator.

**Quick Example**  
A rig graph might take `/standard/left_eye/pos/x` as an input, remap it, blend it
with a pose weight, and output a value that drives the eye’s animatable.

## 6. Animations

**Definition**  
An animation is a time‑based description of how values change. It is composed of
tracks, each track targets a typed path, and each track contains keyframes with
interpolation rules that describe how values evolve over time.

**Why It Exists**  
Animations make motion reproducible and editable. They let authors encode
expressions, gestures, or behaviors as data that can be replayed, layered, and
scheduled without re‑authoring live control logic.

**Key Properties**  
- **Tracks**: per‑target timelines (one target per track).  
- **Keyframes**: time‑stamped values on each track.  
- **Transitions**: easing/interpolation between keyframes (e.g., cubic‑bezier).  
- **Duration**: total time span of the animation.  
- **Targets**: typed paths (usually animatables or graph inputs).  

**Where It Lives**  
- In exported assets or bundles as stored animation data.  
- In the animation runtime as loaded clips and instances.  
- In tools as editable timelines and curve data.

**How It Interacts**  
- Animation targets are typed paths; they may point directly to animatables or
  to graph inputs that later shape the final outputs. In general, target graph
  inputs when you want graph logic to mediate or blend the motion, and target
  animatables when you need direct control.  
- The animation engine manages playback time and emits value changes each
  frame.  
- Those changes are merged with other runtime signals (inputs, graphs,
  orchestrator writes) before reaching the renderer.

**Common Pitfalls**  
- Confusing an animation clip with a runtime instance (a clip is data; an
  instance is a playback of that data).  
- Targeting paths that are not actually present in the current rig graph.  
- Assuming easing is implicit; transitions must be authored or they default to
  cubic interpolation.

**Quick Example**  
A “Smile” animation might target `rig/face/poses/smile.weight` with a track that
ramps from `0 → 1` over 0.4s, holds, then returns to `0` over 0.3s. The same
approach can target an animatable like `mouth_rotation` or a graph input that
blends multiple mouth controls.

## 7. Orchestrator

**Definition**  
The orchestrator is the execution coordinator for Vizij runtime control. It
schedules graphs and animations, maintains a shared blackboard of typed paths,
and merges their writes into a coherent frame before values reach the renderer.

**Why It Exists**  
Without coordination, multiple controllers would fight over the same targets.
The orchestrator provides deterministic ordering, conflict handling, and a
single place to reason about runtime state.

**Key Properties**  
- **Blackboard**: the shared state store of TypedPath → Value (+ shape/provenance).  
- **Controllers**: registered graphs and animations.  
- **Scheduling**: pass order (e.g., SinglePass or TwoPass).  
- **Merge strategies**: how conflicts are resolved when outputs collide.  
- **Frame output**: merged writes, conflicts, and timing metadata.

**Where It Lives**  
- In the runtime layer, coordinating all face controllers.

**How It Interacts**  
- Inputs are staged onto the blackboard before each step.  
- Graphs and animations read from and write to the blackboard.  
- Namespacing isolates multiple faces by prefixing their typed paths, so they
  can share a single orchestrator without collisions.  
- The orchestrator applies merged outputs to the renderer and exposes a frame
  for inspection or debugging. Merge strategy choice determines the concrete
  outcome when multiple controllers write the same path.

**Common Pitfalls**  
- Forgetting to namespace multi‑face setups, causing collisions in typed paths.  
- Assuming controller order is implicit; if feedback loops exist, the schedule
  must be configured deliberately.  
- Overlooking merge conflicts in complex rigs (the orchestrator will log them,
  but you still need to resolve them by design).

**Quick Example**  
A TwoPass schedule might let a graph compute animation weights in pass one, run
the animation controller in pass two, then re‑evaluate a graph using the updated
values. The orchestrator ensures each pass is deterministic and conflict‑aware.

## 8. Authoring Surface

**Definition**  
The authoring surface is where faces, animatables, rigs, and poses are created
or edited. It exposes inspection tools, binding workflows, and export pipelines.

**Why It Exists**  
Authoring separates creative intent from runtime execution. It lets teams shape
assets and control logic without needing a live runtime loop.

**Key Properties**  
- Asset inspection and hierarchy visualization.  
- Binding workflows that map inputs to animatables.  
- Pose creation and editing.  
- Export pipelines that package assets and control definitions.

**Where It Lives**  
- In tooling environments used by artists and technical authors.

**How It Interacts**  
- Produces assets and control definitions that are later consumed by the runtime
  harness.

**Common Pitfalls**  
- Treating authoring exports as runtime state (they are source data, not live
  controllers).  
- Exporting without validating bindings, leading to missing targets at runtime.

**Quick Example**  
An authoring workflow exports a face with a rig and pose set, ready for runtime
registration.

## 9. Runtime Harness

**Definition**  
The runtime harness is the environment that loads assets, registers
controllers, coordinates the orchestrator, and bridges outputs into the
renderer.

**Why It Exists**  
It provides a stable execution envelope so applications can drive faces without
re-implementing orchestration logic.

**Key Properties**  
- Asset loading and bundle extraction.  
- Controller registration (rig graphs, pose graphs, animations).  
- Orchestrator stepping and scheduling.  
- Namespacing for multi-face isolation.

**Where It Lives**  
- In the application/runtime layer that hosts the face experience.

**How It Interacts**  
- Consumes authoring exports, runs the orchestrator, and streams merged outputs
  to the renderer.

**Common Pitfalls**  
- Bypassing the harness and writing directly to renderer values, which breaks
  determinism and coordination.  
- Forgetting to namespace multi-face setups.

**Quick Example**  
The runtime harness loads a face bundle, registers controllers, steps the
orchestrator, and forwards merged writes each frame.

## 10. Renderer Surface

**Definition**  
The renderer surface owns the scene graph and animatables. It is the final
actuation layer where values become visible motion.

**Why It Exists**  
Rendering must remain focused on visual output, not control logic. Keeping this
surface dedicated to application of values keeps the pipeline predictable.

**Key Properties**  
- Scene graph and hierarchy.  
- Animatable value store.  
- Rendering of transforms, materials, and visuals.

**Where It Lives**  
- In the rendering layer of the runtime.

**How It Interacts**  
- Receives merged outputs from the orchestrator via the runtime harness and
  applies them to animatables each frame.

**Common Pitfalls**  
- Treating renderer values as authoritative state instead of a projection of
  the runtime blackboard.  
- Applying ad-hoc mutations that bypass orchestration.

**Quick Example**  
The renderer applies an updated eye translation and eyelid scale on each frame,
producing the visible expression.

## 11. File Formats Quick Reference

- Face GLB (`.glb`) — visual asset with hierarchy and animatables; may include
  embedded Vizij bundle metadata.
- Rig graph (`rig.graph.json`) — graph spec that maps inputs to typed‑path
  outputs and ultimately animatables.
- Pose rig config (`pose-rig.config.json`) — neutral inputs plus named pose
  definitions and target values.
- Pose graph (`pose-rig.graph.json`) — graph that blends pose weights into rig
  inputs.
- Animation clip (`*.json` stored animation) — tracks, keyframes, and easing
  data for time‑based value changes.
- Orchestration descriptor (`*.json`) — wiring of graphs + animations into a
  runtime schedule (used for fixtures and tests).
- Graph spec (`*.graph.json`) — general graph definition (nodes, edges, params)
  used beyond rigs and poses.
