# Vizij Conceptual Overview

<!-- tags: family=reference; type=concept; topics=concepts,rigging,graphs,poses,animation -->

## 1. What Vizij Is

Vizij is an open source ecosystem for designing, animating, and deploying
rendered robot faces. It is built around a simple idea: faces and characters are
the primary product surface, and they deserve a coherent pipeline that connects
creative intent to live, controllable runtime behavior. Vizij’s scope spans
authoring tools, runtime infrastructure, and shared assets so teams can move
from concept to deployment without rebuilding the stack for each new face.

At the platform level, Vizij is not only a renderer or an animation engine. It
is a full lifecycle system: designers define faces, rigs, and poses; animators
shape motion and expression; developers wire those assets into real-time
experiences; and operators deploy faces that respond to live inputs. The system
is intentionally deterministic and contract-driven so that work created in one
environment (authoring, testing, deployment) behaves the same in another.

Vizij bridges artists and engineers by using shared data contracts and common
terminology. Real-time control is a first-class goal: inputs, graphs, and
animations can be driven live, blended together, and routed into the renderer
without brittle one-off glue. Standard inputs make rigs and poses portable, so
faces can share behaviors even when their underlying meshes differ.

Finally, Vizij is built for interoperability and community adoption. Assets are
packaged as GLB files with embedded Vizij metadata, so they remain compatible
with standard tools while retaining richer runtime context. The ecosystem is
designed to be shareable: teams can exchange faces, rigs, and pose libraries,
and evolve them over time without losing a consistent, end-to-end pipeline.

## 2. The Big Pieces

Vizij is built from a small set of conceptual building blocks that appear
everywhere in the system. Thinking in terms of these pieces makes the rest of
the architecture easier to follow.

**Face** is the rendered character asset (usually a GLB) plus Vizij metadata
embedded alongside it. A face exposes **animatables**: the individual values
that can be driven at runtime (numbers, vectors, colors, transforms, booleans,
and so on). Animatables are the atomic “things you can move.”

A **rig** is the control system that maps inputs to animatables. In Vizij, the
rig is typically represented as a **rig graph**: a node graph that consumes
inputs, applies remaps, blends, or expressions, and writes outputs that affect
animatables. Rigs become portable when they expose **standard inputs**—shared,
predictable control paths like `/standard/vizij/left_eye/pos/x` that let tools and
animations target multiple faces consistently.

**Poses** are named collections of input values (often stored as weights over a
set of inputs). A **pose rig** packages neutral input values plus a library of
pose definitions, while a **pose graph** blends pose weights into the concrete
rig inputs that actually drive the face. This makes it easy to author “Happy,”
“Blink,” or “Surprised” once and then mix them live.

**Animations** are time-based changes targeting typed paths. Those targets can
be direct animatables or graph inputs, which means animations can either drive
final values or feed into a graph that blends or reshapes them. More generally,
**graphs** are reusable dataflow programs used for rigs, pose processing, and
other control logic.

At runtime, everything is coordinated by the **orchestrator**. It stages
**inputs** (live signals from UI or application drivers), steps graphs and
animations, and writes **outputs** that ultimately land on animatables. The
orchestrator keeps a shared **blackboard**: a state store of typed paths and
values that all controllers read from and write to deterministically.

## 3. The Data Flow (Inputs → Graphs/Animations → Orchestrator → Renderer)

Vizij’s runtime behaves like a coordinated loop rather than a simple pipeline.
Think of the **orchestrator** as the shepherd that guides data from inputs,
through graphs and animations, into the renderer. It schedules when each system
runs, advances time, and merges their writes deterministically so the face
always lands in a coherent state.

The **blackboard** is the shared ground all of that data walks on: a store of
typed paths and values representing the current state of the face. Inputs from
UI or application drivers are staged onto the blackboard each frame. Graphs and
animations don’t talk to each other directly; they read from and write to this
common surface, and the orchestrator decides the order of operations.

**Namespaces** are the boundaries that keep the ground organized. Each face
lives within its own namespace, which effectively prefixes blackboard paths.
That lets multiple faces run side by side without collisions, while still
allowing shared tools or drivers to target common standard inputs across
different namespaces.

In short: inputs are staged onto the blackboard, the orchestrator shepherds
graphs and animations over that shared surface, and the merged outputs flow into
the renderer. This loop repeats every frame, keeping authored behavior and live
control in sync.

## 4. Authoring-to-Deployment Lifecycle

At a high level, Vizij follows a predictable lifecycle from authoring to
runtime. You start by defining a **face model** and organizing it hierarchically
so the structure reflects the parts of the face you want to control. From that
model you identify **animatables**—the values that can move or change at
runtime.

Next comes **rigging**. You design the controls and drivers that map inputs to
animatables, turning raw values into meaningful face behavior. As part of this
stage, you map the most important controls into **standard inputs** so the rig
remains portable across different faces and tools.

Then you define **poses**—named collections of values or weights that represent
expressions like “Happy” or “Blink.” The rig and pose definitions are bundled
together into a graph package that represents how the face should respond at
runtime.

Finally, that bundle is deployed into a runtime. Live inputs drive the graph,
poses blend together, and the face responds in real time. You can iterate at any
point in the loop, but the lifecycle remains consistent: model → rig → standard
inputs → poses → bundled graphs → runtime control.

## 5. Hello Face (Conceptual Walkthrough)

1. Start with a face model (GLB) and a clear hierarchy of parts.
2. Identify animatables (the controllable values exposed by the model).
3. Create a rig that maps inputs to those animatables.
4. (Optional) Map key controls to standard inputs for portability.
5. (Optional) Define a few poses (e.g., Neutral, Blink, Smile) as named value sets.
6. (Optional) Compile poses into a pose graph that blends pose weights.
7. Bundle rig + pose graphs into a deployable package.
8. Load the bundle into a runtime and register it.
9. Drive the face with live inputs (UI, drivers) and iterate.

## 6. Glossary

See `vizij-docs/current_documentation/concepts/GLOSSARY.md`.
