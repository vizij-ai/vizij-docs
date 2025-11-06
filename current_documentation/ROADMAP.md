# Vizij Roadmap (Active Items)

## Near-Term (next release cycle)
- **Animation Stack**
  - Optionally normalize stored animations through the wasm helper before loading to flag stale shorthands.
  - Add zero-allocation assertions/bench harnesses in hot paths to catch regressions early.
- **Authoring Drivers**
  - Auto-generated standard inputs now ship with enable/disable toggles, hierarchical labels, and metadata-backed exports; expand automated coverage (unit + UI) for the new workflow and wire it into the pre-ship QA checklist.
- **Node Graph**
  - Pre-compute handles for variadic outputs (e.g., `split`) using registry metadata so UI wiring works before first evaluation.
  - Add compile-time selector validation/preparation to fail fast and generate projection metadata.
  - Document/automate graph spec migrations for existing users (export helper + CLI or script guidance).
- **Orchestrator**
  - Expose rate-decoupled scheduling options once timing semantics are documented.
- **Web Workspace**
  - Create smoke tests around orchestrator React hooks to guard Value/Shape regressions.

## Medium-Term
- **Website Node-Graph Migration**
  - Integrate `@vizij/node-graph-react` into the marketing site, load expression/viseme specs from `apps/website/src/nodegraphs/`, and feed outputs into `VizijLowRig`.
  - Share pose/rig config modules between website and vizij-site, removing duplicated scalar blending logic.
  - Encode viseme overlay and spring filtering stages inside the graph to eliminate React-only smoothing.
- **Animation Enhancements**
  - Provide JS-facing stored animation validator (wrapping Rust parser) for upload tooling.
- **Graph Runtime**
  - Introduce graph-level migration helpers (CLI or wasm helper) to retrofit selectors/typed paths into older specs.
  - Improve error messaging when staged inputs are missing but declared shapes expect data (link to docs/best practices).
- **Authoring Drivers**
  - Extend end-to-end documentation (README, release notes) covering driver toggles, metadata export, and import behaviour; add curated screen captures once QA sign-off lands.
- **Orchestrator**
  - Expand schedule options (RateDecoupled) with per-controller tick rates and associated integration tests.
  - Capture telemetry hooks or instrumentation for downstream analytic use.

## Longer-Term
- **Rig/Renderer**
  - Package no-rig face inspector as distributable tooling to help third parties introspect animatables.
  - Explore worker/off-main-thread orchestration once performance budgets demand it (depends on rate-decoupled scheduler support).
- **Tooling & Release**
  - Automate release notes via Changesets or similar for npm packages to improve traceability.
  - Evaluate shared CI workflows (reusable GitHub actions) to keep Rust/web pipelines aligned.
- **Ecosystem**
  - Investigate Bevy-native orchestrator integration once typed path/write batch APIs stabilise across crates.
  - Define telemetry/metrics story (frame timings, conflict counts) for production deployments.
