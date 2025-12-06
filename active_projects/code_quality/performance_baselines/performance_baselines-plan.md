# Performance Baselines – Plan & Tracking
<!-- tags: status=tracking; topics=performance,benchmarking,wasm,rust -->

> **Related:** Proposal (`performance_baselines-proposal.md`) · Code Quality Summary (`../summary.md`)

## Objective & Scope
Establish reliable, layered performance baselines for Vizij’s animation, node-graph, and orchestrator cores across native Rust, Node/WASM, and browser contexts. Deliver harnesses, fixtures, and initial metrics that the team can rerun locally and in CI (report-only) before any optimization work.

## Workstreams & Status
- ✅ **Fixtures & Scenarios** – Tiny smoke + kitchen generators, mixed animation fixtures, and orchestrator blend/merged presets shared across native + WASM harnesses.
- ✅ **Stage 1: Native Rust Benchmarks** – Criterion scaffolds for graph/animation/orchestrator with configurable kitchen sizes; baseline logging script emits µs with fixed formatting.
- ✅ **Stage 2: Node/WASM Harness** – `scripts/run_perf_baselines_wasm.mjs` mirrors Stage 1 scenarios (kitchen graphs, mixed animations, blend/merged orchestrator) and appends µs results to `perf_baselines.md`; dynamic imports fall back to local dist builds.
- 📝 **Stage 3: Browser Harness** – Perf page/toggle in a demo that runs scripted workloads, records update/frame timings via `performance.mark`/`console.time`, and can emit profiles with wasm name sections.
- 📝 **Baseline Publication** – Table comparing native vs Node/WASM vs browser timings for shared scenarios; attach representative flamegraphs/traces; stored under `vizij_docs/current_documentation` (exact path TBD).
- 📝 **CI (Report-Only)** – Nightly/PR opt-in jobs run the harnesses; log metrics, warn on >X% drift from baselines (no gating yet); document policy.

## Timeline / Stages (high-level)
1) Land Stage 1 (native) benchmarks + fixtures.
2) Add Stage 2 harness mirroring the same scenarios.
3) Add Stage 3 browser harness and scripted workloads.
4) Capture initial baselines + artefacts (flamegraphs/profiles).
5) Wire CI report-only jobs and drift warnings.

## Immediate Next Steps (pre-profiling kickoff)
1) Add browser harness (Stage 3): scripted page to run kitchen/mixed scenarios, record per-frame timings, and capture a profile with wasm name sections.
2) Consider pprof/tracing hooks in native benches once variance is characterized.
3) Keep `vizij_docs/current_documentation/perf_baselines.md` updated via native + wasm scripts; collect first browser numbers when harness lands.

## Risks & Mitigations
- Variance/noise in CI hardware → use medians, repetition, and warn-only thresholds.
- Fixture/API drift → document fixture owners and keep generators alongside core crates/apps.
- Instrumentation overhead → prefer whole-step timing and sampling; avoid per-node timers unless investigating a hotspot.

## Decision & Change Log
- 2025-12-05: Proposal approved to proceed with layered baselines (native → Node/WASM → browser).
- 2025-12-05: Added Stage 1 Criterion scaffolds (graph/animation/orchestrator) with generated fixtures (tiny/chain/tree/sparse-DAG, synthetic animation sets) and orchestrator presets (empty, light scalar, heavy blend, merged blend) plus baseline logging script.
- 2025-12-05: Landed Stage 2 Node/WASM harness (`scripts/run_perf_baselines_wasm.mjs`) and normalized Stage 1 logging to microseconds for cross-layer comparison.

## Validation / QA Checklist
- Criterion suites run via `cargo bench` for graph/animation/orchestrator.
- Node harness runs against packaged wasm and reports warmed-up timings.
- Browser harness records per-step/frame timing and can emit a profile with readable wasm symbols.
- Baseline table + artefacts checked into docs; CI jobs publish logs (warn-only drift).
