# Architectural Decisions & Trade-offs

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
