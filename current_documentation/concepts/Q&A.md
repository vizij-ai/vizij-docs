# Vizij Q&A

1. **In 3–5 sentences, what is Vizij and what problem does it solve?**
Vizij is an open source ecosystem for designing, animating, and deploying rendered robot faces, spanning authoring tools, runtime infrastructure, and shared assets. It connects creative intent to live, controllable runtime behavior using deterministic, contract‑driven data flow. Vizij solves the problem of rebuilding bespoke pipelines for each face by providing shared concepts like rigs, poses, graphs, standard inputs, and portable asset bundles. It enables teams to author once and deploy consistently across tools and runtimes, with predictable behavior and reusability.

2. **Explain the difference between a face, a rig, and an animatable.**
A face is the visual asset (usually a GLB) with hierarchy and a set of animatables that can be driven at runtime. A rig is the control system that maps inputs into outputs through a graph, ultimately writing to animatables. An animatable is a renderer‑level value (number, vector, color, transform, etc.) that represents a single controllable feature on the face.

3. **What is a pose, and how do pose weights work relative to neutral?**
A pose is a named collection of target input values that represent an ideal expression or configuration. Pose weights (typically 0..1) scale how much each pose contributes. Those weighted targets are blended relative to neutral inputs, which define the unposed baseline, so the final inputs are the neutral values plus weighted pose influence.

4. **What is a graph, and how does it differ from a rig graph?**
A graph is a deterministic dataflow program described by a GraphSpec (nodes, edges, parameters) that reads typed‑path inputs and emits typed‑path outputs. A rig graph is a specific convention built on that same graph model: it consumes rig inputs (standard inputs, pose weights, drivers) and produces outputs that ultimately write to animatables. So a rig graph is a specialized use of the general graph system.

5. **What does the orchestrator do, and why is a blackboard needed?**
The orchestrator coordinates runtime execution by staging inputs, scheduling graphs and animations, and merging their writes deterministically into a single frame of outputs. The blackboard is the shared state store of typed paths and values that all controllers read from and write to. It provides a single, coherent surface for coordination and conflict handling.

6. **Describe the runtime data flow in one paragraph.**
At runtime, inputs from UI or application drivers are staged onto the blackboard. The orchestrator schedules graph controllers and animation controllers, which read from and write to that shared state rather than talking to each other directly. Their writes are merged deterministically, then applied to the renderer, which updates animatables each frame. Namespaces isolate each face’s typed paths so multiple faces can share a single orchestrator without collisions.

7. **What are standard inputs and why are they important?**
Standard inputs are shared, portable control channels (for example `/standard/left_eye/pos/x`) used across rigs and poses. They make rigs reusable and allow tools, poses, and animations to target multiple faces consistently. Without standard inputs, portability and cross‑face reuse break down.

8. **How do animations target values in Vizij?**
Animations are composed of tracks, and each track targets a single typed path. Those targets can point directly to animatables or to graph inputs that shape final outputs. The animation engine emits per‑frame value changes on those typed paths, which the orchestrator merges with other controllers before the renderer applies them.

9. **If I have two faces running, what prevents their data from colliding?**
Namespaces isolate each face’s runtime state by prefixing typed paths on the blackboard. This keeps controllers for different faces from writing to the same paths, allowing a single orchestrator to coordinate multiple faces safely.

10. **List the main file formats and what each is for.**
- Face GLB (`.glb`) — visual asset with hierarchy and animatables; may include embedded Vizij bundle metadata.
- Rig graph (`rig.graph.json`) — graph spec that maps inputs to typed‑path outputs and ultimately animatables.
- Pose rig config (`pose-rig.config.json`) — neutral inputs plus named pose definitions and target values.
- Pose graph (`pose-rig.graph.json`) — graph that blends pose weights into rig inputs.
- Animation clip (`*.json` stored animation) — tracks, keyframes, and easing data for time‑based value changes.
- Orchestration descriptor (`*.json`) — wiring of graphs + animations into a runtime schedule (fixtures/tests).
- Graph spec (`*.graph.json`) — general graph definition used beyond rigs and poses.
