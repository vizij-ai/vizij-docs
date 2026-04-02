# Performance Baselines Proposal
<!-- tags: family=project; type=proposal; project_status=proposal; topics=performance,benchmarking,testing,ci -->
> **Last updated:** 2026-03-31

> **Related documents:** Plan (not yet written) · Reference (not yet written) · [Code Quality Summary](../summary.md)

## 1. Summary

This project aims to establish a robust set of automated performance benchmarks for the Vizij runtime and web stack. These baselines will allow us to track performance over time, inform optimization work (e.g., WASM boundary changes), and prevent regressions from shipping unnoticed.

## 2. Problem Statement

Currently, we lack a standardized way to measure the performance of the runtime and related tooling. Optimization efforts are often ad-hoc or based on manual observation. Without automated benchmarks tied to realistic scenarios, it is difficult to know if a change has improved or degraded performance, or to catch slow regressions before they reach production.

## 3. Goals

*   **Establish Metrics**: Define the key performance indicators (KPIs) for Vizij (e.g., Graph Eval Time, Render Loop Time, Orchestrator Tick Time, Memory Usage, JS/WASM boundary overhead).
*   **Automated Benchmarks**: Create a suite of benchmarks that run automatically (e.g., via `criterion` in Rust or Vitest bench in JS) against representative fixtures.
*   **Reporting**: Generate reports that visualize performance trends over time and highlight regressions.
*   **Integration with Code Quality Program**: Provide clear signals that can be consumed by the WASM Hardening and refactoring efforts.

## 4. Proposed Solution

1.  **Rust Benchmarks**
    - Use `criterion` (or similar) to benchmark core Rust functions:
      - Animation sampling in `vizij-animation-core`.
      - Graph evaluation in `vizij-graph-core` (including IK where relevant).
      - Orchestrator passes in `vizij-orchestrator-core`.
2.  **Web Benchmarks**
    - Use browser-based benchmarking tools (e.g., Vitest benchmark, or custom puppeteer scripts) to measure end-to-end frame times in representative apps (e.g., `demo-vizij-player`, `vizij-authoring`).
    - Include benchmarks that exercise JS/WASM boundary crossings, especially for hot paths (e.g., input staging, graph evaluation, writes).
3.  **Standard Scenarios**
    - Create a set of "standard scenes" and fixtures, such as:
      - "1000 nodes" graph.
      - "Complex Character Rig" with multiple animation layers.
      - Multi-face setups once namespacing is available.
    - Store these fixtures in `vizij-rs` and mirror them into `@vizij/test-fixtures`.
4.  **CI Integration**
    - Integrate these benchmarks into the CI pipeline (initially as non-blocking reporting jobs).
    - Provide thresholds and dashboards; over time, allow certain metrics to be treated as gates for releases once stable.

## 5. Risks & Unknowns

*   **Noise**: Automated benchmarks in CI environments can be noisy and inconsistent; care is needed in interpreting results and setting thresholds.
*   **Maintenance**: Benchmarks need to be maintained as the API and fixtures evolve; stale benchmarks can be misleading.
*   **Scope Creep**: Without clear priorities, the benchmark suite could grow faster than we can maintain; we need to focus on the most critical scenarios first.

## 6. Success Metrics

*   **Coverage**: Percentage of critical runtime and web paths covered by benchmarks, especially those called out in WASM boundary optimization work.
*   **Stability**: Low variance in benchmark results on the same hardware for the same revision.
*   **Actionability**: Evidence that performance regressions are detected and addressed before release (e.g., regressions found in CI rather than in production demos).
