<!-- tags: family=reference; type=reference; topics=performance,benchmarking,baselines -->

# Performance Baselines

> **Last updated:** 2026-03-31
> **Purpose:** summarize the current published Vizij baseline snapshot and point to process and archived evidence

This is the maintained current baseline summary.

It is not the append-only evidence log. Raw benchmark history now lives in [archived baseline history](../../archive/code_quality/legacy-undated/performance_baselines/perf_baseline_history.md).

Use this page for:

1. the current published snapshot,
2. known coverage gaps,
3. the link to the rerun/process guidance.

Use [Performance Baseline Process](perf_baseline_process.md) for scenario definitions, rerun commands, and publication rules.

## Current Published Status

- Native Rust and Node/WASM baseline coverage exists for graph, animation, and orchestrator scenarios.
- The current published snapshot is still derived from the December 2025 baseline campaign recorded in the archived history.
- Browser baseline coverage is not yet part of the maintained published set.
- CI drift reporting remains future work rather than a current maintained enforcement surface.

## Current Snapshot

Representative published medians from the archived history that show the current order of magnitude across the maintained scenarios:

| Layer | Scenario | Native example median | Node/WASM example median | Notes |
| --- | --- | --- | --- | --- |
| Graph eval | `amortized_per_step/kitchen-50-blocks` | `2,166.500 µs` | `1,980,919.464 µs` | shared heavy graph comparison |
| Graph eval | `amortized_per_step/kitchen-500-blocks` | `79,467.000 µs` | `33,238,058.188 µs` | large stress case |
| Animation step | `amortized_per_step/mixed-64x16` | `25.129 µs` | `14,327.431 µs` | representative mixed-track case |
| Animation step | `amortized_per_step/mixed-256x8` | `112.200 µs` | `48,925.742 µs` | wider track set |
| Orchestrator tick | `amortized_per_step/20bx64tx16k-blend` | `284.330 µs` | `143,711.493 µs` | blend-heavy orchestrator path |
| Orchestrator tick | `amortized_per_step/merged-2x20b-2x64tx16k` | `630.140 µs` | `348,420.811 µs` | merged heavy orchestrator path |

## Interpretation

- The current baseline set is good enough for coarse trend comparison across native and Node/WASM.
- The published numbers still show a very large gap between native and Node/WASM on the heavier graph and orchestrator paths.
- Staging-path microbenches exist in the archived history, but they should be read as boundary diagnostics rather than the canonical top-level baseline summary.
- Because the browser harness is still missing from the maintained set, the current surface should be treated as partial rather than fully cross-surface complete.

## Current Gaps

The maintained summary still lacks:

1. browser-published baseline rows,
2. a refreshed post-December-2025 baseline campaign,
3. CI report-only drift publication,
4. a clearly owned refresh cadence.

## Source Surfaces

Use these together:

1. [Performance Baseline Process](perf_baseline_process.md)
2. [Archived baseline history](../../archive/code_quality/legacy-undated/performance_baselines/perf_baseline_history.md)
3. [Archived plan and tracking](../../archive/code_quality/legacy-undated/performance_baselines/performance_baselines-plan.md)
