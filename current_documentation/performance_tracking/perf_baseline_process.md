<!-- tags: family=reference; type=reference; topics=performance,benchmarking,fixtures,process -->

# Performance Baseline Process

> **Last updated:** 2026-03-31
> **Purpose:** define how maintained Vizij performance baselines are rerun, interpreted, and published

This document defines the maintained process for Vizij performance baselines.

Use it for:

1. rerun commands,
2. scenario definitions,
3. publication rules,
4. guidance on what belongs in the live summary versus the archived raw history.

Do not use this file as the raw evidence log. The append-only run history now lives in [archived baseline history](../../archive/code_quality/legacy-undated/performance_baselines/perf_baseline_history.md).

## Live Surface Split

The maintained performance tracking surface is split into two current documents:

1. [Performance Baselines](perf_baselines.md)
   - current published snapshot and high-level status
2. `Performance Baseline Process`
   - rerun procedure, scenario catalog, and publication policy

Historical benchmark rows, append-only run logs, and exploratory evidence belong in the archive:

1. [Archived baseline history](../../archive/code_quality/legacy-undated/performance_baselines/perf_baseline_history.md)
2. [Archived plan and tracking](../../archive/code_quality/legacy-undated/performance_baselines/performance_baselines-plan.md)

## Publication Policy

Use these rules when updating the maintained surface:

1. update [Performance Baselines](perf_baselines.md) only when a reviewed rerun changes the current published snapshot or the interpretation of that snapshot,
2. append raw benchmark rows and exploratory run evidence to the archived history instead of expanding the current summary,
3. keep browser, Node/WASM, and native results clearly separated so readers can compare like with like,
4. record missing coverage explicitly in the live summary rather than implying that an absent baseline is current,
5. move active optimization planning back into the owning project/program docs when the work becomes active again.

## Rerun Commands

Current baseline reruns still use the same harness family:

```bash
# from vizij-rs repo root
bash scripts/run_perf_baselines.sh
pnpm run build:wasm
node scripts/run_perf_baselines_wasm.mjs
```

If a browser harness is added or revived later, document its command sequence here before treating those numbers as part of the maintained baseline.

## Reading Conventions

Use these conventions when comparing results:

1. `est` means the published median estimate,
2. `cold/*` includes setup and first-step work,
3. `amortized_per_step/*` reports normalized per-step cost after repeated stepping,
4. compare only matching scenarios across native, Node/WASM, and future browser runs,
5. treat staging microbenches as boundary diagnostics, not as replacements for end-to-end graph or orchestrator baselines.

## Scenario Catalog

### Graph eval (`graph_eval`)

- `eval/tiny-smoke-8` – generated 8-node add chain; minimal smoke to sanity check the harness
- `cold|amortized_per_step/kitchen-*-blocks` – generated kitchen-sink chains covering arithmetic, vector ops, logic/compare, time/oscillator, transitions, range operations, joins, and outputs
- `eval/fixture/simple-gain-offset` – existing fixture from `fixtures/node_graphs/simple-gain-offset.json`

### Animation step (`animation_step`)

- `cold|amortized_per_step/fixture/pose-quat-transform` – fixture animation from the manifest
- `cold|amortized_per_step/mixed-16x32` – synthetic mixed-value tracks, 16 tracks × 32 keyframes
- `cold|amortized_per_step/mixed-64x16` – synthetic mixed-value tracks, 64 tracks × 16 keyframes
- `cold|amortized_per_step/mixed-256x8` – synthetic mixed-value tracks, 256 tracks × 8 keyframes

### Orchestrator tick (`orchestrator_tick`)

- `cold|amortized_per_step/tick/empty` – orchestrator with no registered graphs or animations
- `cold|amortized_per_step/tick/light-scalar-ramp` – simple `demo_single_pass` pipeline
- `cold|amortized_per_step/tick/heavy-blend` – generated kitchen graph plus synthetic animation
- `cold|amortized_per_step/tick/heavy-merged` – larger generated kitchen graph plus synthetic animation
- `cold|amortized_per_step/tick/generated-kitchen` – generated kitchen graph aligned with the other shared scenarios

## Fixture and Coverage Notes

- Generated graphs stay in the bench harness so they remain deterministic and easy to tune.
- Fixture-based cases pull through `vizij-test-fixtures`.
- The 2000-block kitchen case remains opt-in and should not be treated as the default publication floor.
- Browser-parity coverage is still incomplete. Keep that gap explicit in the live summary until a maintained browser harness exists again.

## When Work Stops Being Reference-Only

This folder is for stabilized reference and process guidance.

If performance work becomes active again, move planning and execution tracking into the owning project surface:

1. backlog or active-project docs for planned optimization work,
2. code-quality summary for cross-repo prioritization,
3. release notes or known issues when performance shifts affect public trust or operator expectations.
