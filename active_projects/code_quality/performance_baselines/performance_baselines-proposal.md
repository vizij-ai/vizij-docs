# Performance Baselines Proposal
<!-- tags: status=proposal; topics=performance,benchmarking,wasm,rust,web -->

> **Related:** Plan & Tracking (`performance_baselines-plan.md`) · Code Quality Summary (`../summary.md`) · Vizij-RS Roadmap (performance baselines item)

## Context & Problem Statement
- Vizij’s Rust cores (animation, node graph, orchestrator) now run natively and via WASM in the browser, but we lack consistent, repeatable baselines across these layers.
- Without staged benchmarks, we cannot tell if Rust changes, wasm-bindgen glue, or JS integration introduce regressions; profiling is ad-hoc and not comparable across environments.
- Roadmap calls out “establish performance baselines” before deeper optimization; we need a structured proposal to align scope, tooling, and deliverables.

## Goals
- **Layered baselines:** Capture comparable timings for the same workloads in native Rust, Node/WASM, and browser contexts.
- **Representative workloads:** Use generated fixtures for graphs/animations and orchestrator ticks to measure scaling (small → large).
- **Actionable outputs:** Produce flamegraphs/traces for hotspots and publish baseline tables the team can rerun before/after changes.
- **Integration-ready:** Design harnesses so CI can run them in report-only mode initially, with clear thresholds we can later gate on.

## Non-Goals
- Shipping hard CI gates or perf dashboards in this phase (warn-only is fine).
- Optimizing specific hotspots; the focus is measurement and comparability.
- Broad UI/React/render profiling beyond the Vizij core + WASM boundary costs.

## Architectural Design (Layered Profiling)
### Stage 1 — Native Rust
- Criterion micro/macro benchmarks for “step” operations: graph evaluation, animation tick, orchestrator tick.
- `tracing` spans around major steps; optional `pprof`/flamegraphs via Criterion profilers.
- Synthetic + realistic fixtures to study scaling; measure whole-step latency first, drill into nodes only if hotspots emerge.

### Stage 2 — WASM in Node
- Load built wasm packages (or raw `.wasm`) in Node; time tight loops with `perf_hooks.performance`.
- Capture JS↔WASM call overhead and JIT warm-up; optional Node CPU profiles to see glue vs. wasm time.

### Stage 3 — In-Browser
- Perf harness page (or existing demo toggle) that runs scripted workloads and records frame/update timings with `performance.mark`/`console.time`.
- Use browser devtools profiles with wasm name sections for readable Rust symbols; check integration overhead (data marshaling, callback churn).

### Fixtures & Scenarios
- Parametric generators for graphs (chain/tree/random DAG) and animations (tracks/keyframes count) to observe scaling.
- “Empty orchestrator” vs “loaded orchestrator” cases to isolate coordination overhead.
- Baseline table compares native vs Node/WASM vs browser for the same scenarios.

## Risks & Trade-offs
- **Variance/noise:** CI hardware may be noisy; mitigated by repetitions, medians, and warning-only thresholds.
- **Maintenance:** Fixtures and harnesses must track API changes; document ownership in plan.
- **Measurement overhead:** Excessive instrumentation can skew results—prefer sampling/whole-step timing first.

## Approval & Decision Log
- Key decisions to log as we proceed: chosen fixtures, threshold policy, CI scope (no ownership/dates tracked here).

## High-level Execution Plan (seed for tracking doc)
1) Land native Rust benchmarks + tracing hooks for the three cores.
2) Add Node/WASM harness covering equivalent scenarios and capture JS↔WASM overhead.
3) Add browser harness toggle/page and record frame/update timings for scripted workloads.
4) Publish initial baseline table + flamegraphs/traces; store alongside docs.
5) Wire report-only runs in CI; define soft thresholds and rerun after major changes.
