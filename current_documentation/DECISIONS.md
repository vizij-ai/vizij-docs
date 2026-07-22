# Architectural Decisions & Trade-offs
<!-- tags: family=reference; type=decisions; topics=decisions,architecture,roadmap -->
> **Last updated:** 2026-03-31

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
- **Trade-offs**: Cross-graph feedback through the store carries one tick of latency; behavior replacement currently restarts the device (an in-place behavior load is the planned replacement); engine-side animation waits on the browser runtime accepting wasm modules; the orchestrator crates remain in `vizij-rs` only until their last consumer (the authoring motiongraph tooling) migrates.
