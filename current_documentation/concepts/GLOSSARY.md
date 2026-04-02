# Vizij Glossary

<!-- tags: family=reference; type=glossary; topics=glossary,concepts -->
> **Last updated:** 2026-03-31

## A–F

**Animatable**: A renderer‑level value that can be driven at runtime. It
represents a single controllable feature (number, vector, color, boolean,
string, transform) and is ultimately written to the renderer as a complete
value, even if components are driven individually in a rig.

**Animation**: A time‑based description of value changes. It is composed of
tracks, keyframes, and transitions that define how targets evolve over time.

**Animation Clip**: The stored data for an animation (tracks + keyframes). A
clip is data; playback happens when it is instantiated and scheduled.

**Animation Track**: A timeline targeting a single typed path, containing
keyframes and interpolation rules for that target.

**Authoring Surface**: The tooling environment where faces, animatables, rigs,
and poses are created or edited.

**Blackboard**: The shared state store of typed paths and values that graphs and
animations read from and write to under the orchestrator’s coordination.

**Bundle**: An asset‑carried package of rig, pose, and animation metadata
embedded alongside a face so runtimes can auto‑register controllers.

**Controller**: A runtime unit that produces writes (e.g., a graph controller or
animation controller) coordinated by the orchestrator.

**Dataflow Graph**: A deterministic program defined by nodes and edges that
computes outputs from inputs; the core abstraction behind rigs and poses.

**Face**: The visual asset (GLB) with hierarchy and animatables; the primary
rendered entity in Vizij.

**Graph Runtime**: The execution instance that evaluates a GraphSpec each frame,
staging inputs and producing deterministic outputs.

**GraphSpec**: The declarative graph definition (nodes, edges, parameters) used
by the graph runtime.

## G–L

**IR (Graph IR)**: A higher‑level authoring representation of a graph that
includes metadata and issues, then compiles down to a GraphSpec for execution.
See [IR_GRAPH.md](IR_GRAPH.md) for canonical schema and compilation notes.

**Input**: A live value staged into the blackboard or graph runtime, typically
from UI or application drivers.

**Binding Expression**: A small expression language used in authoring to combine
binding slots (standard inputs, self, etc.) into a final driven value. It is
parsed/validated in tooling and compiled into graph logic. See
[BINDING_EXPRESSIONS.md](BINDING_EXPRESSIONS.md).

**Keyframe**: A time‑stamped value on an animation track.

**Layered Rig**: A rig that consumes outputs from another rig, allowing multiple
graph layers before final animatable writes.

**Namespace**: A path prefix that isolates one face’s runtime state from
another, enabling multiple faces to share a single orchestrator safely.

## M–R

**Neutral Inputs**: The baseline values that define the unposed state for a
pose rig; pose weights blend relative to this neutral.

**Orchestrator**: The execution coordinator that schedules graphs and
animations, merges their writes, and produces deterministic frame outputs.

**Output**: A typed‑path write produced by a graph or animation, applied to the
blackboard and renderer.

**Pose**: A named set of target values that represent an ideal expression; pose
weights blend toward these targets at runtime.

**Pose Graph**: The graph that blends pose weights and neutral values into
concrete rig inputs.

**Pose Graph Creation**: The authoring workflow and tooling that turns pose
definitions and neutral inputs into a runnable pose graph (GraphSpec),
including validation, remapping, and export/import. See
[POSE_GRAPH_CREATION.md](POSE_GRAPH_CREATION.md).

**Pose Rig**: The collection of pose definitions plus neutral inputs and
metadata.

**Rig**: The control system that maps inputs to outputs through a graph,
ultimately writing to animatables.

**Rig Graph**: The graph implementation of a rig; consumes inputs and emits
typed‑path outputs.

**Runtime Harness**: The environment that loads assets, registers controllers,
steps the orchestrator, and bridges outputs to the renderer.

## S–Z

**Standard Inputs**: Shared, portable control channels (e.g.,
`/standard/vizij/left_eye/pos/x`) that make rigs and poses reusable across faces.

**Track**: An animation timeline targeting a single typed path.

**Typed Path**: A stable identifier for values in Vizij (graph inputs, outputs,
animation targets, and animatables).

**Value**: The typed payload carried through Vizij runtime (float, vector, quat,
color, transform, record, etc.).
