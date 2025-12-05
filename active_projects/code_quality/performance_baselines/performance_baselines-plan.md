# Performance Baselines – Plan & Tracking
<!-- tags: status=planning; topics=performance,benchmarking,testing,ci -->

> **Related documents:** [Proposal](../../../backlog_proposals/performance_baselines-proposal.md) · [Project summary](../summary.md)

## Objective & Scope

Establish a small but robust set of automated performance benchmarks for Vizij’s Rust cores and web stack, focused on graph evaluation, orchestrator ticks, and render loops. These benchmarks should be easy to run locally and in CI, and should provide clear signals when performance regresses.

## Plan

The following steps are intended to be executed in order by a junior developer, with explicit acceptance criteria for each step.

### 1. Inventory critical performance scenarios and existing fixtures

1.1 Identify core runtime scenarios:
- [ ] From `vizij-rs`:
    - Graph evaluation in `vizij-graph-core`.
    - Animation sampling in `vizij-animation-core`.
    - Orchestrator ticks in `vizij-orchestrator-core`.
- [ ] From `vizij-web`:
    - A minimal graph demo app (e.g., `minimal-demo-graph` or `minimal-demo-animation-graph`).
    - A representative authoring or playback app (e.g., `demo-vizij-player`).

1.2 Enumerate existing fixtures:
- [ ] Inspect `vizij-rs/fixtures/manifest.json` and any existing benchmark-like tests to see what graphs/rigs already exist for testing.

Acceptance criteria:
- A short Markdown note or code comment (e.g., in this plan or in a `README` under `vizij-rs/fixtures/`) listing:
  - The chosen Rust scenarios and fixture names.
  - The chosen web apps to target for end-to-end benchmarks.

### 2. Add Rust micro-benchmarks using `criterion`

2.1 Add `criterion` dev-dependency to relevant crates:
- [ ] In `vizij-rs/crates/node-graph/vizij-graph-core/Cargo.toml`, add `criterion` under `[dev-dependencies]`.
- [ ] Do the same for `vizij-animation-core` and `vizij-orchestrator-core` if we plan to benchmark them.

2.2 Implement basic benchmarks:
- [ ] Under `vizij-rs/crates/node-graph/vizij-graph-core/benches/`, create `graph_eval_bench.rs` that:
    - Loads at least one representative `GraphSpec` from the existing fixtures.
    - Constructs a `GraphRuntime`.
    - Uses `criterion::bench_function` (or a similar API) to measure calls to `evaluate_all`.
- [ ] Repeat similar benchmark setups for:
    - Animation sampling in `vizij-animation-core` (e.g., sampling a clip).
    - Orchestrator ticking in `vizij-orchestrator-core` (e.g., processing a fixed fixture).

Acceptance criteria:
- Running `cargo bench -p vizij-graph-core` completes successfully and reports benchmark results.
- Benchmarks are stable enough that repeated runs produce similar numbers on the same machine.

### 3. Add web-level benchmarks for frame and graph performance

3.1 Investigate existing test harnesses:
- [ ] Check `vizij-web` apps (e.g., `apps/minimal-demo-animation-graph`, `apps/minimal-demo-graph`) for existing performance testing patterns or scripts.

3.2 Implement a simple frame-time benchmark:
- [ ] Create a Vitest benchmark or scripted test (e.g., `framePerf.test.ts`) in an appropriate app or shared test folder that:
    - Mounts a small demo scene (graph + animation).
    - Advances time or steps frames in a loop.
    - Measures how long it takes to perform a fixed number of frames (e.g., 120 frames).
- [ ] Use `performance.now()` or Node’s high-resolution timers to record time elapsed.

Acceptance criteria:
- Running the new benchmark test (e.g., via `pnpm --filter minimal-demo-animation-graph test`) prints timing information and passes consistently.

### 4. Define baseline metrics and capture initial results

4.1 Choose baseline metrics:
- [ ] Decide on at least three key metrics to track, such as:
    - `graph_eval_ms` for a standard graph.
    - `orchestrator_tick_ms` for a standard orchestrator scenario.
    - `frame_loop_ms` for a standard web demo.

4.2 Record baseline values:
- [ ] Run the Rust benchmarks and web benchmarks on a representative development machine.
- [ ] Capture average and variance (e.g., median, percentiles) for each metric.
- [ ] Store these baseline numbers in a small Markdown or JSON file under `vizij_docs` or `vizij-rs` (e.g., `vizij_docs/current_documentation/perf_baselines.md`).

Acceptance criteria:
- Baseline metrics are documented and can be referred to by future work (e.g., WASM boundary optimization).

### 5. Integrate benchmarks into CI (report-only)

5.1 Add Rust bench step to CI:
- [ ] Update the `vizij-rs` GitHub Actions workflow to:
    - Run `cargo bench -p vizij-graph-core` (and others if not too slow) on a suitable schedule (e.g., nightly) or as a separate non-blocking job.

5.2 Add web bench step to CI:
- [ ] Update the `vizij-web` CI workflow to:
    - Run the frame-time benchmark test suite (or a subset) and log metrics.

5.3 Confirm CI behavior:
- [ ] Ensure that failures (e.g., benchmark crashes) are reported clearly, but performance regressions do not yet fail builds automatically.

Acceptance criteria:
- CI runs the benchmarks at least on main or via a scheduled job.
- Benchmark output is visible in CI logs and can be consulted when investigating performance issues.

### 6. (Optional) Add simple regression checks

6.1 Implement soft thresholds:
- [ ] Add simple logic in benchmark tests (or a wrapper script) to compare current results against stored baselines and log warnings if a metric regresses beyond a chosen percentage (e.g., 10–20%).

6.2 Document policy:
- [ ] Document in `vizij_docs` that these checks are currently informative and not strict gates.

Acceptance criteria:
- When a metric regresses significantly in local runs or CI, a warning is printed that points to the relevant baseline.

## Acceptance Criteria (Overall)

- Rust micro-benchmarks for graph evaluation (and optionally animation/orchestrator) exist and run via `cargo bench`.
- At least one web-level performance benchmark exists and runs via a `pnpm` command in `vizij-web`.
- Baseline metrics are documented and accessible to the team.
- CI runs the benchmarks in a report-only fashion, providing visibility into performance trends without blocking normal development.

