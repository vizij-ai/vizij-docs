# Evaluation Framework for the Vizij Orchestrator PR Pair

These two PRs aim to deliver a deterministic orchestrator stack in Rust and a first-class consumer experience in the web workspace. Use the following rubric to evaluate whether the combined changes meet their goals, stay aligned with existing architecture, and are production-ready.

## 1. Architectural Alignment
- **Intent**: The orchestrator should compose existing animation and graph runtimes without duplicating business logic.
- **Checks**:
  - Rust controllers rely on shared crates (`vizij-animation-core`, `vizij-graph-core`, `vizij-api-core::json`) rather than reimplementing evaluation or serialization.
  - Web bindings (`@vizij/orchestrator-react`) surface orchestrator features while delegating value coercion to `@vizij/value-json`.
  - The wasm boundary mirrors the Rust API shape (schedules, controller configs, write batches) without divergent behaviour.
- **Signals of success**: Minimal bespoke parsing code, consistent TypedPath/Value handling, documentation that cross-links the stacks.

## 2. Determinism & Data Integrity
- **Intent**: Blackboard state, merged writes, and conflict logs must be predictable frame over frame.
- **Checks**:
  - Scheduler tests cover SinglePass and TwoPass ordering, ensuring last-writer-wins semantics and conflict capture.
  - Web demos surface the same merged write ordering as Rust tests (compare fixture-driven runs).
  - Value normalization stays stable (lowercase discriminants, shared fixtures) across Rust and TypeScript.
- **Signals of success**: Repeatable test results, consistent Value JSON across languages, documentation of merge rules.

## 3. Developer Ergonomics
- **Intent**: Engineers should be able to build, test, and debug orchestrations quickly.
- **Checks**:
  - Build scripts and CI pipelines rely on pnpm and the shared wasm loader; setup instructions are accurate.
  - React hooks expose clear lifecycle (`ready`, `createOrchestrator`, `step`, subscriptions) and recover gracefully from missing init/inputs.
  - Demo apps illustrate real-world flows (registering controllers, injecting inputs, visualising outputs) without manual scaffolding.
- **Signals of success**: Minimal steps to run demos, well-commented examples, tooling parity between repos.

## 4. Testing Depth
- **Intent**: Critical paths are regression-tested in both Rust and TypeScript layers.
- **Checks**:
  - Rust tests cover blackboard conflict logging, controller mapping, wasm ABI guards, and integration passes.
  - npm packages (`@vizij/orchestrator-wasm`, `@vizij/value-json`, `@vizij/test-fixtures`) ship tests that exercise serialization and runtime loops.
  - Web packages/demos include unit or integration tests (e.g., `OrchestratorProvider` store behaviour, orchestrator demo hooks).
- **Signals of success**: CI succeeds end-to-end, tests describe edge cases (invalid paths, empty subscriptions), fixtures reused across stacks.

## 5. Documentation & Onboarding
- **Intent**: Contributors must understand how to adopt the orchestrator from either repo.
- **Checks**:
  - README/NEXT_STEPS explain schedules, controller subscriptions, and fixtures.
  - Web docs (AGENTS, app READMEs) outline how to run demos and link back to Rust fixtures.
  - Comments or docstrings capture tricky conventions (e.g., `anim/player/<id>/cmd/<action>` paths).
- **Signals of success**: Clarity for new readers, alignment between documentation and actual APIs, TODOs capturing future work.

## 6. Release Readiness
- **Intent**: The combined work should be publishable without follow-up hotfixes.
- **Checks**:
  - Versioning and package metadata updated for new npm crates; `packageManager` fields aligned.
  - Scripts for building/linking orchestrator wasm align with CI workflows.
  - No lingering TODOs that block release (only aspirational next steps).
- **Signals of success**: Dry-run releases succeed, README instructions verified, no critical gaps flagged in REVIEW.md.

## Evaluation Process
1. **Review Rust stack** using sections 1–4 to confirm architecture, determinism, and tests. Skim docs to satisfy section 5.
2. **Review web stack** applying the same sections, with emphasis on React ergonomics and demo completeness.
3. **Cross-check integration** by running shared fixtures through both runtimes (where practical) and confirming Value JSON symmetry.
4. **Record findings** in REVIEW.md using this rubric: note strengths per section, then enumerate risks or follow-ups.
5. **Decide readiness**: If any section fails critical checks, document blockers; otherwise, recommend merge with optional enhancements.

Use this framework as a living checklist—future orchestrator iterations can extend it with performance metrics, UX research, or telemetry once the basics solidify.
