# Vizij Architecture Decision Report — Animation Player (Core vs Bevy/ECS)

> **Objective.** This report independently evaluates the architectural options for Vizij’s animation player in light of our goals and constraints. It compares a **core‑centric** (engine‑agnostic) design with a **Bevy/ECS‑first** design and recommends a path forward with concrete guardrails.

---

## 1) Design Goals for Vizij

### Product and platform

Vizij must deliver a web‑first experience while remaining friendly to native deployments. On the web, the animation player should ship as a lightweight WebAssembly (WASM) module that can be imported easily into React applications and embedded in straightforward demos and the public website. For native use, Vizij should integrate cleanly with Bevy so that desktop tools, editor‑like experiences, and robotics applications can adopt the same logic with minimal friction.

### Architecture

The architecture should emphasize modularity. Each controller—such as the animation player and node graph today and the blackboard, behavior tree, and image processing nodes in the future—should be able to operate independently but also compose with the others. The system should expose small, durable boundaries at both the WASM and Bevy edges so that internal implementation details can evolve without forcing downstream changes. Extensibility should be routine: adding features like new blend modes, constraints, or drivers should not require editing monolithic functions. The logic should be testable in isolation and should step deterministically when the caller provides `dt`.

### Performance and user experience

Performance targets include low or zero per‑frame allocations, cache‑friendly storage layouts, and one‑time binding of targets so the hot loop uses direct handles rather than strings. The system should scale predictably as the number of controller instances grows and should enable parallelism where it is measurably beneficial. The WASM footprint should remain small to preserve fast downloads and host‑friendliness.

### Developer experience and operations

Developers should have clear loops for working on the system: implement and test Rust code in `vizij‑rs`, build WASM artifacts, wrap them in npm packages, and exercise them in React demos. The Bevy plugin should build independently for native scenarios. Versioning should follow semantic versioning, and the WASM boundary should expose an `abi_version()` check so wrappers can verify compatibility. Crate publishing order must be respected.

---

## 2) Architectures Under Consideration

### A) Core‑centric (engine‑agnostic) with adapters (recommended baseline)

In the core‑centric approach, all domain logic lives in `vizij‑animation‑core`, which has no direct dependency on Bevy or JavaScript. Thin adapters provide integration surfaces: a Bevy plugin (`bevy_vizij_animation`) wraps the core for native applications, and a WASM crate (`vizij‑animation‑wasm`) exposes a minimal FFI that is surfaced to the web through a small npm package and an optional React wrapper. The public contracts are deliberately small and stable: serde‑encoded configurations, an `update(dt, inputs) -> outputs` stepping function, and narrowly scoped setters and helpers.

### B) Bevy/ECS‑first

In the Bevy/ECS‑first approach, timelines, instances, and bindings are represented as ECS components, and the pipeline—binding, advancing, accumulating, and blending/applying—emerges from Bevy systems scheduled across frames. This design is highly modular within Bevy, naturally parallel, and interoperable with other Bevy systems. However, it becomes heavier when moved to the web, because shipping Bevy into the browser increases WASM size and complicates hosting, and the mental model is more demanding for web developers.

### C) Hybrid “two faces”

The hybrid option keeps the core‑centric design as the default and also provides an ECS‑native implementation as a separate crate for editor‑style and native workflows. Both variants share the same core data structures and algorithms. We would adopt the ECS‑native variant only if native users require ECS ergonomics or profiling demonstrates a clear advantage from ECS scheduling.

---

## 3) Evaluation Criteria and Findings

### 3.1 Modularity and extensibility

A core‑centric design achieves modularity through a small public API, composable configurations, and controllers that can be developed and shipped independently. New features primarily land in the core while adapters remain thin and stable, which preserves cross‑engine reuse. A Bevy/ECS‑first design achieves excellent modularity inside Bevy, where new features can be assembled as new components and systems without altering existing ones. Outside Bevy—particularly on the web—this benefit diminishes unless Bevy is shipped alongside the module.

**Conclusion:** Because Vizij must serve both web and native environments, a core‑centric approach yields portable modularity that travels across environments, whereas an ECS‑first approach provides engine‑local modularity that shines within Bevy but does not transfer as easily elsewhere.

### 3.2 Performance and scalability

Both approaches can implement one‑time binding so the hot loop deals only with direct handles. The core can adopt structure‑of‑arrays or batched layouts and avoid per‑frame allocations, which are performance techniques orthogonal to Bevy. ECS provides cache‑friendly iteration patterns but introduces engine overhead, and bringing ECS into the browser increases binary size and startup time. The core can parallelize native work with rayon or task pools when data independence is known, while a single‑threaded core is typically sufficient on the web. ECS scheduling may win in very large native simulations, but that advantage should be proven with profiles. Core‑only WASM remains significantly smaller and faster to load than an ECS‑embedded WASM build.

**Conclusion:** For web‑first delivery, the size and latency advantages of a core‑only WASM module are decisive. For very large native scenes, ECS scheduling may outperform a single threaded loop, but that gain must be established empirically.

### 3.3 Testability and determinism

The core‑centric approach makes it straightforward to write deterministic unit tests, golden tests for sampling and blending, and fuzz tests for edge cases. The ECS‑first approach enables strong integration tests that validate system ordering and world state, but unit tests become more diffuse because logic is spread across multiple systems.

**Conclusion:** A core‑centric approach simplifies correctness work, while Bevy adds valuable integration coverage where needed.

### 3.4 Developer experience and complexity

For web developers, the core‑centric approach offers a simple mental model: initialize the module, call `update`, and consume outputs. The Bevy path remains optional. The ECS‑first approach is ideal for teams already fluent in Bevy but presents a higher barrier for web developers and expands the documentation surface area.

**Conclusion:** Because Vizij serves a mixed audience that includes web developers, the default experience should remain simple and portable.

### 3.5 Interoperability and future controllers

In the core‑centric approach, future controllers—such as the node graph, blackboard, behavior tree, and image node—naturally follow the same pattern: a `*-core` crate, an optional `bevy_vizij_*` adapter, a `*-wasm` FFI crate, and small web wrappers. Interoperability occurs through well‑defined input and output channels rather than engine‑specific types. In the ECS‑first approach, interoperability inside Bevy is excellent, but cross‑platform composition requires additional adapters and increases complexity for the web.

**Conclusion:** A core‑centric approach provides a consistent story across controllers and platforms, while an ECS‑first approach ties interoperability to Bevy.

---

## 4) Recommendation

Vizij should adopt a **core‑centric baseline** with **thin Bevy and WASM adapters**. This approach satisfies the web‑first requirement, preserves portability and reuse, and concentrates new features in the core while keeping adapters stable. High performance is achieved by implementing one‑time binding, adopting cache‑friendly layouts, and eliminating per‑frame allocations inside the core. Native parallelism can be added when profiling demonstrates a clear win. An ECS‑native variant should remain an optional path for editor‑style or very large native scenarios where its strengths are demonstrable.

---

## 5) Concrete Guardrails and Design Rules

1. **Public contracts** should remain small and stable. The WASM FFI should expose `new(config)`, `update(dt, inputs) -> outputs`, setters for parameters, and an `abi_version()` function for compatibility checks. The Bevy adapter should provide a `Vizij*Plugin` that owns a core engine via a resource or component and that is placed explicitly in the schedule, typically in `FixedUpdate` for determinism.
2. **Binding** should occur once. All string targets should be pre‑bound to handles or offsets and cached so that the hot loop uses only indices or offsets.
3. **Data layout** should favor contiguous storage. The core should prefer structure‑of‑arrays layouts where appropriate, reuse scratch buffers, and avoid per‑frame allocations.
4. **Parallelism** should be driven by evidence. Native builds can use rayon or task pools when profiling shows a benefit. Web builds should remain single‑threaded unless the application explicitly enables COOP/COEP and opts into threaded WASM.
5. **Feature flags** should be organized by layer. Engine‑agnostic features such as `serde`, `simd`, and `rayon` belong in the core, while Bevy‑specific flags belong in the adapter crates. The core should never depend on Bevy.
6. **Testing** should cover both unit and integration concerns. The core should include unit tests, fuzz tests, and golden tests for sampling and blending, while the Bevy adapter should include integration tests that verify system ordering and the effects on world state.
7. **Size budgets** should be explicit and enforced. The baseline animation WASM module should remain within an agreed budget (for example, approximately 300–600 KB gzip). When a build exceeds the budget, dependencies and symbol bloat should be investigated and reduced.
8. **Backward compatibility** should be managed deliberately. Any breaking change to the FFI should bump `abi_version()`, and the wrappers should assert the version at initialization to fail fast when mismatched.

---

## 6) Migration Plan

In the short term, Vizij should continue with the current core‑centric WASM flow as implemented in the minimal scaffold and should maintain `bevy_vizij_animation` as a thin adapter. In the next phase, the core should gain one‑time target pre‑binding and internal blending and accumulation phases that mirror ECS pipelines without taking a dependency on ECS. In the longer term, if native editor scenarios justify the investment, Vizij can introduce an ECS‑native crate that sources the same core data and algorithms, while documenting its limits and the circumstances under which it should be chosen.

---

## 7) Risks and Mitigations

There is a risk that under‑leveraging native parallelism could cap performance on very large scenes. This should be addressed by profiling, by adding rayon‑based parallel traversal where it measurably helps, and by offering an ECS‑native variant as an opt‑in when profiles justify it. There is also a risk of adapter divergence leading to duplicate maintenance. This can be mitigated by keeping adapters thin, driving behavior from the core, and sharing tests and fixtures across layers. Finally, there is a risk that the FFI boundary could grow and bloat WASM. This should be controlled by setting guardrails on the public API size, shifting complexity back into the core, and exposing typed arrays only when they are required.

---

## 8) Modularity and Extensibility Deep Dive

Engine‑local modularity, which is characteristic of an ECS‑first design, composes features from Bevy primitives such as components, systems, schedules, and events. This form of modularity is excellent inside Bevy. Portable modularity, which is characteristic of a core‑centric design, composes features from engine‑agnostic types and a small API, so the same logic runs in both web and native environments with thin adapters. Vizij needs both forms, but the web‑first requirement makes portable modularity the default.

### Unifying around Bevy ECS: how it can help

Unifying on Bevy ECS can make subsystems such as the behavior tree, node graph, animation player, physics simulator, and blackboard speak the same vocabulary: components, resources, events, and schedules. This shared fabric improves discoverability, debuggability, and the ability to swap implementations by toggling plugins. The Bevy scheduler also offers parallelism across independent systems, which can be valuable in large native scenes.

### Where ECS unification can hurt

Requiring ECS everywhere can harm the web experience by inflating the WASM bundle and introducing hosting constraints. It can also create lock‑in at the edges if subsystems only speak ECS types, which multiplies the number of adapters required for non‑Bevy runtimes. Finally, heavy reliance on implicit events and component conventions can hide coupling that is hard to reason about.

### Mitigations that preserve portability

Vizij can preserve portability by defining engine‑agnostic protocols at the boundaries—serde configurations, input and output structures, and a small set of protocol events—and by implementing ECS adapters on top of those protocols. A schema‑first approach keeps JSON or CBOR schemas as the source of truth and generates both Rust and TypeScript types. Capability traits in the core allow features to be enabled without depending on engine‑specific hooks.

---

## 9) Cross‑Subsystem Interoperability in Vizij

The purpose of cross‑subsystem interoperability in Vizij is to allow the behavior tree (BT), node graph (NG), animation player (AP), physics simulator (PHYS), and the blackboard (BB) to collaborate without creating tight coupling. Interoperability should be driven by clearly documented contracts, deterministic phase ordering, and a minimal set of shared concepts that can be mapped both to Bevy’s ECS and to the browser runtime.

### 9.1 Interop goals and invariants

Interoperability must satisfy four invariants. First, each subsystem should remain independently testable, so that changes to one do not require end‑to‑end tests to verify basic correctness. Second, the system must maintain deterministic behavior under a fixed time step, which is essential for reproducing issues and for robotics control loops. Third, shared data must be observable so that diagnostics, tracing, and profiling can correlate cause and effect across phases. Fourth, interoperability must be portable: the same contracts should work in Bevy and in a JavaScript orchestrator with only thin adapters at the edges.

### 9.2 Data contracts and schemas

We should define engine‑agnostic data contracts for configurations, inputs, outputs, and events. Each contract should be versioned and represented by both Rust types (via `serde`) and TypeScript types (via code generation). For example, inputs to the animation player may include curves, scalar parameters, and triggers, while outputs may include pose deltas, control signals, and status reports. The blackboard should expose typed keys and value kinds (for example, boolean, number, vector, and string) with a stable path convention such as `sensors.touch.cheek_left` or `emotion.arousal`.

```rust
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ApInputs { pub params: HashMap<String, f32>, pub triggers: Vec<String> }
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ApOutputs { pub pose_delta: Vec<f32>, pub status: String }

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ProtocolEvent {
    Sensor { name: String, value: serde_json::Value },
    ControllerCommand { name: String, payload: serde_json::Value },
    BlackboardSet { path: String, value: serde_json::Value },
}
```

The same contracts should be emitted as TypeScript interfaces so that web applications can reason about the same structures in a type‑safe manner.

### 9.3 Phase ordering and timing

Interoperability is easiest to reason about when the system follows an explicit phase order. In native builds, a `FixedUpdate` schedule can run five phases in the following order: Sense (PHYS and sensors write observations), Decide (BT consumes observations and emits actions), Compute (NG transforms actions into controller inputs), Act (AP advances simulation and emits outputs), and Apply (scene updates and any blackboard writes for downstream consumers). The ordering should be enforced with Bevy’s system sets and `after/before` relationships.

In the browser, a JavaScript orchestrator should implement the same phases at a fixed tick, using an accumulator to convert variable frame time into one or more fixed updates. This approach produces deterministic results and avoids drift.

```ts
accumulator += frameDt;
while (accumulator >= tick) {
  sense(bb);
  const actions = bt.step(bb, tick);
  const inputs  = ng.step(actions, bb, tick);
  const outputs = ap.update(tick, inputs);
  apply(outputs, bb);
  accumulator -= tick;
}
```

### 9.4 Ownership, lifetimes, and conflict resolution

The blackboard should provide well‑defined ownership and lifetime rules. Producers should write only the keys they own, and consumers should treat the blackboard as a snapshot rather than as mutable shared state. When multiple writers target the same key, the system should document a default policy such as last‑writer‑wins, and it should support explicit transactions when consistency across multiple keys is required. In Bevy, the blackboard can be modeled as a resource with interior mutability and a small API that records timestamps and sources for each update. In the browser, the blackboard can be a plain object guarded by a lightweight transaction helper so that updates can be applied atomically.

### 9.5 Error handling and degradation

Interoperability should also address failure modes. When a subsystem fails to produce data (for example, an external API times out or a sensor disconnects), the system should degrade gracefully by using cached values or by falling back to safe defaults. Errors should be tagged with correlation identifiers so that telemetry can trace their impact through subsequent phases. Critical failures should trip watchdogs that halt unsafe motion on robots or that pause animation in the browser until the system recovers.

### 9.6 Observability, diagnostics, and tests

A minimal set of metrics should be produced per phase: execution time, allocation counts, and message sizes. Event logs should annotate the source subsystem and the phase. Contract tests should validate that each subsystem accepts and produces the documented structures, while integration tests should check the end‑to‑end order of effects. Regression tests should run the same scenario in both native and web orchestrators to ensure that the contracts remain portable.

### 9.7 Worked example

Consider a greeting interaction. The physics simulator or a vision subsystem detects a person and writes `sensors.vision.face=true` to the blackboard. The behavior tree sees the new key and emits a `ControllerCommand` to start a smile clip with a short blend‑in. The node graph converts that command into parameter curves for lip corners and eyelids. The animation player advances by a fixed tick and outputs pose deltas. The system then applies those deltas to transforms and writes a `status="smiling"` key to the blackboard. The same scenario runs identically in Bevy and in the browser, because the contracts, phase order, and timing are the same.

---

## 10) Developer Extensions and External APIs

Developers should be able to extend Vizij without modifying core logic, and they should be able to integrate external services without compromising determinism, performance, or security. This section explains where extensions plug in, how they advertise and consume capabilities, and how to incorporate services such as cloud viseme generators, speech recognizers, or robot middleware.

### 10.1 Extension points inside Bevy

Within Bevy, extensions are most naturally packaged as plugins that declare the systems they add and the data they read and write. A constraint or mixer can be introduced by adding systems to the appropriate phase and by documenting the events and components it consumes and produces. For example, a face‑constraint plugin might read `Blackboard` values such as `emotion.arousal` and apply offsets to transforms after the animation step. Each plugin should be explicit about the schedule and ordering it requires so that its behavior is predictable when other plugins are enabled.

Extensions should also expose inspector hooks by deriving reflection traits or by registering custom inspector UI. This approach allows developers to tune parameters live in editor‑style tools without altering code. When extensions produce diagnostic information, they should publish it through Bevy’s diagnostics resources so that it appears consistently across the application.

### 10.2 Extension points in the core and in WASM

At the core layer, extensions should implement capability traits that the engine exposes. For instance, a `Sampler` trait might take a time and a parameter set and return a value, while a `Constraint` trait might accept a pose and return an adjusted pose. The core can maintain a registry so that new implementations can be selected by configuration rather than by changing code paths. The WASM binding should not attempt to surface every internal operation. Instead, it should keep a small interface, expose coarse‑grained operations such as `update`, and allow configuration to select specific behaviors. This choice keeps the public surface stable and the WASM bundle small.

In web applications, extensions often take the form of thin wrappers around the WASM modules. A React provider can establish a timing loop, manage a blackboard, and fan out events to multiple controllers. When heavy work or I/O is involved, a Web Worker can host that logic so the main thread remains responsive. The worker can send structured messages to the main thread, which are then translated into blackboard writes or controller inputs.

### 10.3 Integrating external APIs and middleware

External services should be treated as asynchronous producers or consumers at the boundaries of the system. On the web, the integration should run in a worker, and it should implement rate limiting, retries with jitter, and a circuit‑breaker pattern so that failures do not block the animation tick. Results should be timestamped and written to the blackboard or converted into controller inputs. In native applications, asynchronous tasks can handle calls to middleware such as ROS2 or gRPC services. Communication with the animation player should happen through bounded channels to maintain backpressure and to protect the control loop.

Security and privacy must be considered from the start. Secrets should be obtained from environment variables, system keychains, or secret managers. Logs should avoid leaking personally identifiable information or secrets, and telemetry should be aggregated in a way that supports performance tuning without exposing sensitive content. Where extensions are untrusted or experimental, they should be sandboxed in a separate process or in WASM to limit the blast radius of failures.

### 10.4 Versioning, discovery, and packaging

Extensions should declare their compatible protocol and schema versions so that hosts can validate compatibility before enabling them. They should also advertise the events and blackboard keys they consume and produce, which allows tooling to visualize dependencies and detect conflicts. Packaging should follow the repository conventions already established: core extensions live as crates with clear feature flags, Bevy extensions are distributed as plugins, and web extensions are published as npm packages that wrap the WASM modules. Contributor templates and checklists should make it easy to add a new extension with tests, documentation, and performance budgets.

### 10.5 Worked examples

A new constraint can be implemented by introducing a `Constraint` trait implementation in the core and by adding configuration that selects it for certain joints. The Bevy adapter can optionally expose an inspector panel to tune its parameters. For an external API example, a web worker can call a cloud service that returns phoneme timings; the worker converts those timings into parameter curves and writes them to the blackboard as inputs for the animation player. In a robotics setting, a ROS2 node can subscribe to sensor topics, publish blackboard updates, and subscribe to controller outputs that command actuators. In each case the integration preserves determinism by respecting the fixed‑step schedule and avoids blocking the main update loop.

---

## 11) Full Application Integration Scenarios

### Web application (browser)

A typical browser stack consists of a React application using `@vizij/*‑react` packages on top of WASM cores, with an optional Web Worker for heavier compute. To maintain performance, the WASM bundle should remain small, calls should be batched where possible, and typed arrays should be used only when warranted. Unless threading is explicitly required, the application should avoid COOP/COEP headers. Developer experience benefits from hot‑module reloading for UI changes, automatic WASM rebuilds when Rust changes, and service‑worker caching for production.

### Robot (native)

A native robotics stack typically uses a Bevy application that loads `bevy_vizij_*` plugins, with an optional ROS2 bridge. Controllers should run in `FixedUpdate` to maintain a control‑loop cadence, high‑priority systems should be scheduled carefully, and watchdogs should detect overruns. Sensors publish observations to the blackboard, the behavior tree decides on actions, the node graph computes inputs, and the animation player applies results to actuators. A renderer is optional, and headless operation is common. Reliability requires bounded queues, frame‑time and missed‑tick metrics, and backpressure.

### Docker sandbox (headless)

For headless scenarios and continuous integration, a command‑line tool or headless Bevy build can run scripted scenarios and record traces and metrics. Typical uses include regression testing, performance baselines, offline tuning, and dataset generation. Containers should set CPU and memory limits, use deterministic seeds for repeatability, and upload artifacts such as profiles and traces for inspection.

### Decision matrix (summary)

For web user experiences, a core‑centric WASM module with React wrappers is the default. For native and editor scenarios, Bevy plugins showcase the strengths of ECS. For mixed fleets that target both environments, the core remains the single source of truth, and Bevy adapters are added where they provide concrete benefits.

---

## 12) Final Call

Vizij should choose the core‑centric baseline. This approach best serves the web‑first requirement, preserves portability and a clean developer experience, and still enables high performance through data‑oriented design inside the core. An ECS‑native option should remain available for native and editor scenarios where its strengths make a measurable difference, but it should be adopted as a profile‑driven optimization rather than as the default.

---

## Footnotes

**Engine‑local modularity** refers to modularity that is achieved inside a specific engine or runtime, such as Bevy/ECS, by composing features from that engine’s primitives—components, systems, schedules, events, assets, and inspectors. The pieces integrate beautifully as long as the code runs inside that engine. Outside the engine, for example in a small WASM module for a React app, those primitives do not exist, so the modularity does not carry over unless adapters are written or functionality is re‑implemented.

By contrast, **portable modularity** emerges from engine‑agnostic libraries that define clear data types such as `Config`, `Inputs`, and `Outputs` and expose a small API with functions like `new`, `update`, and narrowly scoped setters. In this model, the Bevy integration remains a thin plugin and the web integration is a thin WASM FFI and wrapper. The same core runs natively and in the browser, and the adapters are small and replaceable. Inside Bevy, you do not automatically gain ECS granularity for every tiny step unless you build a more ECS‑native adapter, which you can add later if profiling shows it is warranted.

For the animation player, an ECS‑native design would define components such as `AnimationTrack`, `Binding`, and `Mixer` and systems such as `advance_tracks`, `accumulate_bindings`, and `apply_mixes`. This approach is highly composable and easy to inspect inside Bevy and benefits from scheduler‑provided parallelism. To use it on the web, however, you would either need to ship Bevy in WASM, which is large, or write a non‑ECS implementation. In the portable approach, `vizij‑animation‑core` exposes `update(dt, inputs) -> outputs`. The Bevy plugin holds a core instance and maps ECS world state to core inputs and outputs. The web uses the same core through `vizij‑animation‑wasm` and `@vizij/animation‑react`. In this way you retain a single core “brain” and two small “bodies” (the adapters), so the modularity applies across environments.

Engine‑local modularity is a good fit for editor‑style native tools where live inspection, Bevy assets, and ECS parallelism matter greatly, and for very large native scenes where ECS scheduling measurably outperforms a single core loop. Portable modularity is a good fit for web‑first delivery with small WASM size and for scenarios where you want the same controller logic across native and web without rewriting.
