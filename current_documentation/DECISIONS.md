# Architectural Decisions & Trade-offs
<!-- tags: family=reference; type=decisions; topics=decisions,architecture,roadmap -->
> **Last updated:** 2026-10-23

## Core-Centric Runtime (vs ECS-first)
- **Decision**: Keep all deterministic logic inside engine-agnostic Rust crates (`vizij-*-core`) with thin Bevy and wasm adapters, instead of building directly on Bevy ECS.
- **Rationale**: Maintains a single portable runtime usable by web (wasm) and native hosts; keeps wasm bundles small and easier for front-end teams.
- **Trade-offs**: Bevy users lose some automatic ECS modularity and parallelism unless we add a richer plugin later; adapters must map ECS state into core APIs manually.

## Split Repositories & Release Responsibilities
- **Decision**: `vizij-rs` publishes Rust crates + wasm npm packages; `vizij-web` consumes them and ships React/render tooling.
- **Rationale**: Keeps CI/toolchains isolated (Rust vs Node), speeds up web builds, and enforces ABI compatibility through published artefacts.
- **Trade-offs**: Coordinated releases require multi-repo bumps; developers must link packages locally when iterating across stacks.

## Shared Value/Shape Contract
- **Decision**: Centralize Value/Shape/TypedPath JSON handling in `vizij_api_core::json` and `@vizij/value-json`, consuming the same helpers in all wasm/React packages.
- **Rationale**: Eliminates drift between animation, graph, and orchestrator stacks; TypeScript receives accurate unions with lowercase discriminants.
- **Trade-offs**: Any schema change requires synchronized updates to shared helpers and re-publication of all dependent packages.

## Deterministic Orchestrator Scheduling
- **Decision**: Orchestrator coordinates controllers via explicit passes (`SinglePass`, `TwoPass`) and last-writer-wins merge rules on a shared blackboard.
- **Rationale**: Predictable behaviour across runtimes, clear diagnostics (conflict logs, merged writes), and tight integration with typed WriteBatches.
- **Trade-offs**: Users needing asynchronous/rate-decoupled behaviour must wait for future schedule modes; deterministic passes demand careful tuning of cycle order.

## Wasm Distribution Strategy
- **Decision**: Publish wasm artefacts as scoped npm packages using a shared loader (`@vizij/wasm-loader`) with ABI guards rather than embedding wasm blobs in React packages.
- **Rationale**: Keeps wasm updates independent of React releases, supports both Node and browser consumers, and standardises initialization.
- **Trade-offs**: Developers must rebuild/link local wasm packages during cross-repo work; bundlers must honour wasm loader constraints (`preserveSymlinks`, COOP/COEP when needed).

## CI/CD: Shell Scripts vs. TypeScript CLI
- **Decision**: Stick with lightweight shell scripts (`scripts/*.sh`) for automation and commit hooks; cancel the proposed `@vizij/dev-tools` TypeScript CLI.
- **Rationale**: Simplicity, zero build overhead, and effective use of existing `pnpm` tooling. Windows support is not a current priority.
- **Trade-offs**: Less robust error handling, harder to unit test, and requires WSL for Windows contributors.

## 2026-02-04: Historical HRI March Focus and Roadmap Re-prioritization
- **Decision**: Shift the then-current near-term focus to HRI March deliverables: authoring tooling, multi-screen puppeteering, and audio processing for visemes.
- **Rationale**: At that time, concentrating effort on conference-driven outcomes and demos reduced context switching.
- **Trade-offs**: Short-term delays for testing/perf automation and website work; backlog items required later reactivation and re-scoping.
- **Status note**: This is historical context, not the current active roadmap. The March 30, 2026 roadmap rewrite supersedes it as the primary phase framing.

## 2026-03-10: Documentation Authority Model
- **Decision**: Treat `vizij-docs` as the canonical internal cross-repo documentation layer for architecture, roadmap framing, lifecycle status, decisions, known issues, and release-note policy.
- **Rationale**: The platform now spans multiple repos, local execution trackers, public-site content, assets, and transitional workspace docs. One internal governance layer is required so contributors can tell what is current and what is merely local detail.
- **Trade-offs**: `vizij-docs` must stay concise and linked rather than duplicating every local tracker; repo-local docs still need maintenance because they remain authoritative for implementation details.

## 2026-03-10: Summary Up, Detail Local
- **Decision**: Keep detailed implementation tracking in the repo that owns the feature, while `vizij-docs` summarizes verified current state and links to the local source.
- **Rationale**: Some local docs, especially `vizij-web/apps/vizij-authoring/docs`, are richer and more operational than a cross-repo summary should be. Preserving that detail locally avoids flattening useful implementation context.
- **Trade-offs**: Readers must follow links for full execution detail; summaries need clear authority notes so the split is obvious.

## 2026-03-10: Two-Axis Project Documentation System
- **Decision**: Standardize project docs on two axes: document family (`proposal`, `plan`, `reference`, `summary`) and lifecycle status (`proposed`, `planned`, `in_progress`, `blocked`, `done`, `archived`).
- **Rationale**: The older mix of `tracking`, `draft`, `planning`, and `backlog` made project state hard to interpret consistently across pillars.
- **Trade-offs**: Existing older docs may still use legacy tags until they are touched; full normalization is a follow-up maintenance task.

## 2026-03-10: Curated Public Docs Pipeline
- **Decision**: Keep public-facing docs curated in `vizij-ai.github.io` rather than mirroring internal docs verbatim.
- **Rationale**: Internal docs optimize for engineering truth and decision history, while public docs need audience-specific structure, narrative, examples, and polish.
- **Trade-offs**: Public content requires explicit curation and maintenance, and some internal material will stay internal-only even when related public guides exist.

## 2026-03-10: Transitional Surface Classification
- **Decision**: Treat top-level `/docs` and `vizij-afternoon-workshop` as transitional or historical surfaces unless later reactivated with clear ownership.
- **Rationale**: They currently overlap with `vizij-docs`, repo-local tutorials, and the public site, which creates ambiguity about what is current.
- **Trade-offs**: Some useful material remains outside the canonical flow for now; later consolidation work must decide what is promoted, archived, or redirected.

## 2026-03-30: One Maintained Public Learning System
- **Decision**: Organize the active roadmap around one maintained public learning system with the website as the landing layer and the guidebook bucket chain `Introduction -> Experience -> Control -> Customize -> Integrate -> Deploy` as the core outward-facing route. Treat app names such as `Hello Face`, `vizij-authoring`, `demo-vizij-player`, and `vizij-standalone` as anchors inside that route rather than as route stages.
- **Rationale**: The older mix of public site work, workshop material, repo-local examples, and internal docs made it too easy for contributors to treat every surface as equally primary. The roadmap now needs a clear center of gravity.
- **Trade-offs**: Supporting programs, later-horizon runtime work, and broad hardening efforts remain important, but they are intentionally subordinated to the current onboarding / creator / deployment phase.

## 2026-03-30: Public Taxonomy and Hardening Role
- **Decision**: Treat `vizij-web` apps as implementation `tools` and `examples`, while the website and projected guidebook own the public `demos` / `tutorials` / `docs` taxonomy. Treat hardening as a cross-cutting trust lane rather than a competing product pillar.
- **Rationale**: This separation keeps the public learning system legible and prevents internal app naming or generic cleanup work from dictating the roadmap.
- **Trade-offs**: Some existing app names and backlog docs now read awkwardly against the new model and must be interpreted or rewritten with explicit authority notes.

## 2026-07-10: One Runtime Value Type Across Vizij and Arora
- **Decision**: `vizij_api_core::Value` is `arora_types::value::Value` — one runtime value type shared by the Vizij kernels, the Arora runtime, and the store, with `@vizij/value-json` as its single JSON vocabulary on the web side.
- **Rationale**: Vizij runs on Arora rather than reimplementing it, and a shared value type lets graph outputs, animation samples, and store entries cross every boundary (Rust↔Rust, Rust↔wasm↔JS) without translation layers or drift between two value vocabularies.
- **Trade-offs**: Vizij's value evolution is coupled to `arora-types` releases, breaking value changes ripple through both ecosystems in lockstep, and composite Vizij values ride through Arora as structured values whose type identities live in Vizij-namespaced UUIDs.

## 2026-07-10: The Web Runtime Is an Arora Device
- **Decision**: In the browser, a Vizij runtime is an Arora device: `@vizij/runtime-react` boots one device per provider from `@vizij/runtime` (an Arora runtime compiled to WebAssembly), with the composed rig/pose/program graph as the device's behavior. The former orchestrator decomposes into existing primitives — routing is store-path identity, scheduling is the Arora step loop, controller merge is graph composition (last-writer-wins today; an explicit combiner node when a real bundle collides), and animation clips play through the runtime's clip pipeline as ordinary input writes.
- **Rationale**: The device that runs in a robot and the runtime that runs in a browser tab are the same engine, so behaviors, values, and tooling transfer between them; the orchestrator duplicated scheduling and state that Arora already owns.
- **Trade-offs**: Cross-graph feedback through the store carries one tick of latency; behavior replacement loads the composed graph in place ([VIZ-57](https://linear.app/semio-ai/issue/VIZ-57)), though changing the device's module set still restarts it (carrying the store across minus the `arora/*` built-in keys); engine-side animation waits on the browser runtime accepting wasm modules.
- **Status note**: Each face's animations play in its device through Arora's animation module (`@arora/animation`, from `arora-animation-module`), linked as a host module in the browser as natively ([vizij-rs#260](https://github.com/vizij-ai/vizij-rs/pull/260)). The browser device is the `vizij` crate's `web` module, which also holds the face's view (next decision).

## 2026-10-23: The Bevy View Is the One Renderer of Vizij Faces in the Browser
- **Decision**: Every Vizij face in a browser is drawn by the Bevy view of the vizij-rs `vizij` crate, which `@vizij/runtime` ships in one wasm module with each face's Arora device. A page mounts one canvas (`<VizijCanvas>`), and each face draws over its slot (`<Vizij>`, or `VizijRuntimeFace` bound to a provider), a `<div>` with no canvas of its own. three.js draws no face: `three` remains only in `@vizij/render`'s GLB loader and headless exporter. `@vizij/render` 2.0.0 and `@vizij/runtime-react` 1.0.0 implement it ([vizij-web#206](https://github.com/vizij-ai/vizij-web/pull/206), released by [vizij-web#207](https://github.com/vizij-ai/vizij-web/pull/207)); a face speaks through its device's `say` and plays its animations through Arora's animation module, so `@vizij/speech-react` and `@vizij/animation-react` are deleted.
- **Rationale**: A face looks and behaves the same wherever it is shown only if one renderer draws it. The view is the crate the native `vizij` binary is built from, and it draws the pose the face's own device holds, so a page shows what a deployment shows; a second renderer would have to match every material, morph, framing and tone-mapping rule of the first. One canvas per page draws any number of faces for the cost of one Bevy App.
- **Trade-offs**: A page fetches the whole wasm module, view included (24.3 MB, 6.9 MB gzip), before its first face draws. The browser build is WebGL2 only. A structural edit in the authoring app reloads the face from its exported GLB bytes, which costs a Bevy load per edit. The authoring app keeps its world model in JavaScript, so `@vizij/render` carries `three` to load and export GLB. Desktop runs the same view natively; Android and Semio Studio are open lines of the [Bevy plan](../active_projects/runtime/bevy_everywhere/bevy_everywhere-plan.md).

## 2026-10-27: Vizij's Node Graphs Run on Arora's Behavior Tree
- **Decision**: A Vizij node graph runs on `arora-behavior-tree`. `vizij-graph-core` imports a graph's JSON as a behavior tree whose nodes are detached calls of functions from arora-sdk's `arora-dataflow-nodes` (`@arora/dataflow`, `@arora/geometry`, `@arora/kinematics`), and `TreeRuntime` runs it; `vizij-graph-core`'s own evaluator is removed. Vizij keeps its graph format, its editor registry, the importer and `@vizij/graph`'s input, output and declared-shape check; the node vocabulary, the geometry types (`arora-geometry`) and the colour (`arora-graphics-types`) are arora-sdk's. No graph, face or fixture JSON changed ([vizij-rs#259](https://github.com/vizij-ai/vizij-rs/pull/259), [arora-sdk#419](https://github.com/semio-ai/arora-sdk/pull/419), [arora-sdk#420](https://github.com/semio-ai/arora-sdk/pull/420), [arora-sdk#426](https://github.com/semio-ai/arora-sdk/pull/426)). `@vizij/node-graph` 0.13 and `@vizij/runtime` 9.2 ship it, and vizij-web runs on them ([vizij-web#224](https://github.com/vizij-ai/vizij-web/pull/224)).
- **Rationale**: Arora devices already run behavior trees, so a face's graphs are one more tree on the engine that runs a robot's behaviors rather than a second evaluator beside it. A node computes again only when its inputs, its parameters or the clock it reads changed, which makes a face whose inputs hold cheap; and the node functions are callable by any Arora loader, not only Vizij's.
- **Trade-offs**: Loading or editing a graph costs 2 to 3 times what it did (9.7 ms against 3.5 ms at 950 nodes), and every load, edit and run graft reloads the whole graph. A frame where every input moves costs up to 1.6 times more on graphs of about a thousand nodes, while a 19,000-node graph costs less either way. `ProcessingGraph` is neither `Send` nor `Sync`, since a behavior tree holds its nodes in `Rc`s; the desktop and browser devices tick on one thread, so neither is affected.
