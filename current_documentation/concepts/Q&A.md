<!-- tags: family=reference; type=faq; topics=documentation,concepts,q-a -->
> **Last updated:** 2026-04-02

# Vizij Q&A

1. **In 3–5 sentences, what is Vizij and what problem does it solve?**
Vizij is an open source ecosystem for designing, animating, and deploying rendered robot faces, spanning authoring tools, runtime infrastructure, and shared assets. It connects creative intent to live, controllable runtime behavior using deterministic, contract‑driven data flow. Vizij solves the problem of rebuilding bespoke pipelines for each face by providing shared concepts like rigs, poses, graphs, standard inputs, and portable asset bundles. It enables teams to author once and deploy consistently across tools and runtimes, with predictable behavior and reusability.

2. **Explain the difference between a face, a rig, and an animatable.**
A face is the visual asset (usually a GLB) with hierarchy and a set of animatables that can be driven at runtime. A rig is the control system that maps inputs into outputs through a graph, ultimately writing to animatables. An animatable is a renderer‑level value (number, vector, color, transform, etc.) that represents a single controllable feature on the face.

3. **What is a pose, and how do pose weights work relative to neutral?**
A pose is a named collection of target input values that represent an ideal expression or configuration. Pose weights (typically 0..1) scale how much each pose contributes. Those weighted targets are blended relative to neutral inputs, which define the unposed baseline, so the final inputs are the neutral values plus weighted pose influence.

4. **What is a graph, and how does it differ from a rig graph?**
A graph is a deterministic dataflow program described by a GraphSpec (nodes, edges, parameters) that reads typed‑path inputs and emits typed‑path outputs. A rig graph is a specific convention built on that same graph model: it consumes rig inputs (standard inputs, pose weights, drivers) and produces outputs that ultimately write to animatables. So a rig graph is a specialized use of the general graph system.

5. **What coordinates runtime execution, and why is a blackboard needed?**
The runtime is an Arora device whose behavior is the composed graph (rig, pose, and playing programs united into one). The Arora step loop schedules execution: each tick, graph inputs read from the store, the graph evaluates, and outputs write back. The blackboard is that store — the shared state of typed paths and values every producer and consumer goes through. It provides a single, coherent surface for coordination.

6. **Describe the runtime data flow in one paragraph.**
At runtime, inputs from UI or application drivers are written onto the device's store. Each tick, the composed graph reads its input paths from that shared state, evaluates, and writes its outputs back; sub-graphs communicate through store paths rather than talking to each other directly. Animation clip playback writes inputs the same way. After each tick the runtime pulls the changed values and applies them to the renderer, which updates animatables each frame. Namespaces isolate each face's typed paths; each face runs on its own device.

7. **What are standard inputs and why are they important?**
Standard inputs are shared, portable control channels (for example `/standard/vizij/left_eye/pos/x`) used across rigs and poses. They make rigs reusable and allow tools, poses, and animations to target multiple faces consistently. Without standard inputs, portability and cross‑face reuse break down.

8. **How do animations target values in Vizij?**
Animations are composed of tracks, and each track targets a single typed path. Those targets can point directly to animatables or to graph inputs that shape final outputs. Clip playback emits per‑frame value changes on those typed paths — written into the device's store like any other input — and the graph and renderer consume them from there.

9. **If I have two faces running, what prevents their data from colliding?**
Each face runs on its own Arora device with its own store, and namespaces prefix each face's typed paths, so nothing shares a write surface in the first place.

10. **List the main file formats and what each is for.**
See [REFERENCE_GUIDE.md](REFERENCE_GUIDE.md#11-file-formats-quick-reference) for the canonical maintained file-format list and the short purpose note for each core Vizij artifact.
