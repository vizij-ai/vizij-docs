# Performance Baselines
<!-- tags: family=reference; type=reference; topics=performance,benchmarking -->

> **Archive note:** this file is the raw historical benchmark log and append-only evidence set that previously lived under `current_documentation/performance_tracking/`.
> **Live current docs:** [Performance Baselines](../../../current_documentation/performance_tracking/perf_baselines.md) · [Performance Baseline Process](../../../current_documentation/performance_tracking/perf_baseline_process.md)

The Node/WASM table is appended at the end of this file (stage 2 harness). Legacy native rows remain below for historical reference.

## Legacy (native + historical rows)
Run the Stage 1 native benches and append results here for quick comparison across revisions. The helper script below appends rows automatically; otherwise copy/paste the bench output into the table.

## How to run
```bash
# from repo root
bash scripts/run_perf_baselines.sh && pnpm run build:wasm && node scripts/run_perf_baselines_wasm.mjs

```

## How to read the table
- `bench`: Criterion bench target.
- `scenario`: trailing segments of the bench path (e.g., `cold/…`, `amortized_per_step/…`).
- `est`: Criterion **median** estimate (more robust to outliers than mean). For `amortized_per_step`, the number is already normalized per step (we run 100 steps and divide by 100 inside the bench; 10 steps for the opt-in 2000-block case).
- Units come from Criterion output (ns/µs/ms). Microseconds appear as `µs`.
- Sampling: cold benches use sample_size ≈ 50 (≈10 for the opt-in 2000-block graph); amortized_per_step uses sample_size ≈ 10 (≈10 for the opt-in 2000-block graph) to keep large graphs manageable.

## Scenario glossary (current)
- **Graph eval** (`graph_eval`):
  - `eval/tiny-smoke-8`: generated 8-node add chain (smoke).
  - `cold|amortized_per_step/kitchen-*-blocks`: generated kitchen-sink chains (≈25 nodes/block) hitting arithmetic, vector, logic, time/transition, range ops. Sizes: 1 (~25 nodes), 20 (~500), 200 (~5k); 2000 (~50k) is opt-in via `GRAPH_HEAVY=1` (reduced samples, amortized steps=10).
  - `eval/fixture/simple-gain-offset`: existing fixture from `fixtures/node_graphs/simple-gain-offset.json`.
  - `eval/chain-32`: generated add chain of length 32.
  - `eval/tree-128`: generated balanced add tree with 128 leaves.
  - `eval/dag-256`: generated sparse DAG with 256 add nodes.
- **Animation step** (`animation_step`):
  - `cold|amortized_per_step/fixture/pose-quat-transform`: fixture animation from manifest.
  - `cold|amortized_per_step/mixed-16x32`: synthetic mixed-value tracks (Float/Vec3/Quat), 16 tracks × 32 keyframes.
  - `cold|amortized_per_step/mixed-64x16`: synthetic mixed-value tracks, 64 tracks × 16 keys.
  - `cold|amortized_per_step/mixed-256x8`: synthetic mixed-value tracks, 256 tracks × 8 keys.
- **Orchestrator tick** (`orchestrator_tick`):
  - `cold|amortized_per_step/tick/empty`: no graphs/animations registered.
  - `cold|amortized_per_step/tick/light-scalar-ramp`: demo_single_pass pipeline.
  - `cold|amortized_per_step/tick/heavy-blend`: generated kitchen graph (20 blocks) + synthetic animation (64×16).
  - `cold|amortized_per_step/tick/heavy-merged`: generated kitchen graph (50 blocks) + synthetic animation (128×24).
  - `cold|amortized_per_step/tick/generated-kitchen`: generated kitchen graph (20 blocks) + synthetic animation (64×16).

## Results (append-only)
| date | crate | bench | scenario | est | unit |
| --- | --- | --- | --- | --- | --- |
| Original run rust | --- | --- | --- | --- | --- |
| 2025-12-05 20:03:58 | vizij-graph-core | graph_eval | cold/tiny-smoke-8 | 26.331 | µs |
| 2025-12-05 20:03:58 | vizij-graph-core | graph_eval | amortized_per_step/tiny-smoke-8 | 28.115 | µs |
| 2025-12-05 20:03:58 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 8.112 | µs |
| 2025-12-05 20:03:58 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 8.424 | µs |
| 2025-12-05 20:03:58 | vizij-graph-core | graph_eval | cold/kitchen-1-blocks | 88.368 | µs |
| 2025-12-05 20:03:58 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-1-blocks | 87.458 | µs |
| 2025-12-05 20:03:58 | vizij-graph-core | graph_eval | cold/kitchen-50-blocks | 9,749.500 | µs |
| 2025-12-05 20:03:58 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-50-blocks | 10,194.000 | µs |
| 2025-12-05 20:03:58 | vizij-graph-core | graph_eval | cold/kitchen-500-blocks | 656,170.000 | µs |
| 2025-12-05 20:03:58 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-500-blocks | 731,650.000 | µs |
| 2025-12-05 20:05:16 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 2.200 | µs |
| 2025-12-05 20:05:16 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 1.539 | µs |
| 2025-12-05 20:05:16 | vizij-animation-core | animation_step | cold/mixed-16x32 | 49.279 | µs |
| 2025-12-05 20:05:16 | vizij-animation-core | animation_step | amortized_per_step/mixed-16x32 | 9.363 | µs |
| 2025-12-05 20:05:16 | vizij-animation-core | animation_step | cold/mixed-64x16 | 135.880 | µs |
| 2025-12-05 20:05:16 | vizij-animation-core | animation_step | amortized_per_step/mixed-64x16 | 29.604 | µs |
| 2025-12-05 20:05:16 | vizij-animation-core | animation_step | cold/mixed-256x8 | 322.710 | µs |
| 2025-12-05 20:05:16 | vizij-animation-core | animation_step | amortized_per_step/mixed-256x8 | 130.420 | µs |
| 2025-12-05 20:06:41 | vizij-orchestrator-core | orchestrator_tick | cold/empty | 0.172 | µs |
| 2025-12-05 20:06:41 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/empty | 0.140 | µs |
| 2025-12-05 20:06:41 | vizij-orchestrator-core | orchestrator_tick | cold/light-scalar-ramp | 56.753 | µs |
| 2025-12-05 20:06:41 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/light-scalar-ramp | 16.424 | µs |
| 2025-12-05 20:06:41 | vizij-orchestrator-core | orchestrator_tick | cold/20bx64tx16k-blend | 5,234.200 | µs |
| 2025-12-05 20:06:41 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 594.310 | µs |
| 2025-12-05 20:06:41 | vizij-orchestrator-core | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 11,022.000 | µs |
| 2025-12-05 20:06:41 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 1,381.600 | µs |
| original run wasm | --- | --- | --- | --- | --- |
| 2025-12-06 04:50:06.358 | vizij-graph-core-wasm | graph_eval | cold/simple-gain-offset | 256.636 | µs |
| 2025-12-06 04:50:06.358 | vizij-graph-core-wasm | graph_eval | amortized_per_step/simple-gain-offset | 8,958.503 | µs |
| 2025-12-06 04:50:06.358 | vizij-graph-core-wasm | graph_eval | cold/kitchen-1-blocks | 852.072 | µs |
| 2025-12-06 04:50:06.358 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-1-blocks | 250,994.848 | µs |
| 2025-12-06 04:50:06.358 | vizij-graph-core-wasm | graph_eval | cold/kitchen-50-blocks | 53,632.098 | µs |
| 2025-12-06 04:50:06.358 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-50-blocks | 3,985,716.748 | µs |
| 2025-12-06 04:50:06.358 | vizij-graph-core-wasm | graph_eval | cold/kitchen-500-blocks | 2,301,707.943 | µs |
| 2025-12-06 04:50:06.358 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-blocks | 215,113,062.242 | µs |
| 2025-12-06 04:50:06.358 | vizij-animation-core-wasm | animation_step | cold/mixed-16x32 | 4,556.901 | µs |
| 2025-12-06 04:50:06.358 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-16x32 | 7,509.545 | µs |
| 2025-12-06 04:50:06.358 | vizij-animation-core-wasm | animation_step | cold/mixed-64x16 | 5,173.392 | µs |
| 2025-12-06 04:50:06.358 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-64x16 | 19,846.413 | µs |
| 2025-12-06 04:50:06.358 | vizij-animation-core-wasm | animation_step | cold/mixed-256x8 | 10,108.515 | µs |
| 2025-12-06 04:50:06.358 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-256x8 | 67,800.774 | µs |
| 2025-12-06 04:50:06.358 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/20bx64tx16k-blend | 43,914.675 | µs |
| 2025-12-06 04:50:06.358 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 517,861.108 | µs |
| 2025-12-06 04:50:06.358 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 92,615.722 | µs |
| 2025-12-06 04:50:06.358 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 1,830,192.149 | µs |
| --- | --- | --- | --- | --- | --- |
| First improvements | --- | --- | --- | --- | --- |
| 2025-12-06 00:39:17 | vizij-graph-core | graph_eval | cold/tiny-smoke-8 | 25.552 | µs |
| 2025-12-06 00:39:17 | vizij-graph-core | graph_eval | amortized_per_step/tiny-smoke-8 | 12.730 | µs |
| 2025-12-06 00:39:17 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 10.832 | µs |
| 2025-12-06 00:39:17 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 3.386 | µs |
| 2025-12-06 00:39:17 | vizij-graph-core | graph_eval | cold/kitchen-1-blocks | 83.745 | µs |
| 2025-12-06 00:39:17 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-1-blocks | 22.264 | µs |
| 2025-12-06 00:39:17 | vizij-graph-core | graph_eval | cold/kitchen-50-blocks | 4,002.200 | µs |
| 2025-12-06 00:39:17 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-50-blocks | 1,745.500 | µs |
| 2025-12-06 00:39:17 | vizij-graph-core | graph_eval | cold/kitchen-500-blocks | 61,034.000 | µs |
| 2025-12-06 00:39:17 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-500-blocks | 63,900.000 | µs |
| 2025-12-06 00:40:50 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 1.853 | µs |
| 2025-12-06 00:40:50 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 1.209 | µs |
| 2025-12-06 00:40:50 | vizij-animation-core | animation_step | cold/mixed-16x32 | 39.984 | µs |
| 2025-12-06 00:40:50 | vizij-animation-core | animation_step | amortized_per_step/mixed-16x32 | 7.588 | µs |
| 2025-12-06 00:40:50 | vizij-animation-core | animation_step | cold/mixed-64x16 | 101.260 | µs |
| 2025-12-06 00:40:50 | vizij-animation-core | animation_step | amortized_per_step/mixed-64x16 | 23.634 | µs |
| 2025-12-06 00:40:50 | vizij-animation-core | animation_step | cold/mixed-256x8 | 266.620 | µs |
| 2025-12-06 00:40:50 | vizij-animation-core | animation_step | amortized_per_step/mixed-256x8 | 118.130 | µs |
| 2025-12-06 00:42:37 | vizij-orchestrator-core | orchestrator_tick | cold/empty | 0.143 | µs |
| 2025-12-06 00:42:37 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/empty | 0.121 | µs |
| 2025-12-06 00:42:37 | vizij-orchestrator-core | orchestrator_tick | cold/light-scalar-ramp | 50.648 | µs |
| 2025-12-06 00:42:37 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/light-scalar-ramp | 8.627 | µs |
| 2025-12-06 00:42:37 | vizij-orchestrator-core | orchestrator_tick | cold/20bx64tx16k-blend | 4,352.400 | µs |
| 2025-12-06 00:42:37 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 276.880 | µs |
| 2025-12-06 00:42:37 | vizij-orchestrator-core | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 9,159.100 | µs |
| 2025-12-06 00:42:37 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 638.490 | µs |
| --- | --- | --- | --- | --- | --- |
| 2025-12-06 09:12:12.050 | vizij-graph-core-wasm | graph_eval | cold/simple-gain-offset | 215.234 | µs |
| 2025-12-06 09:12:12.050 | vizij-graph-core-wasm | graph_eval | amortized_per_step/simple-gain-offset | 7,890.878 | µs |
| 2025-12-06 09:12:12.050 | vizij-graph-core-wasm | graph_eval | cold/kitchen-1-blocks | 854.381 | µs |
| 2025-12-06 09:12:12.050 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-1-blocks | 205,684.095 | µs |
| 2025-12-06 09:12:12.050 | vizij-graph-core-wasm | graph_eval | cold/kitchen-50-blocks | 41,747.106 | µs |
| 2025-12-06 09:12:12.050 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-50-blocks | 3,341,467.275 | µs |
| 2025-12-06 09:12:12.050 | vizij-graph-core-wasm | graph_eval | cold/kitchen-500-blocks | 1,888,865.497 | µs |
| 2025-12-06 09:12:12.050 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-blocks | 168,245,415.332 | µs |
| 2025-12-06 09:12:12.050 | vizij-animation-core-wasm | animation_step | cold/mixed-16x32 | 2,423.542 | µs |
| 2025-12-06 09:12:12.050 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-16x32 | 5,419.799 | µs |
| 2025-12-06 09:12:12.050 | vizij-animation-core-wasm | animation_step | cold/mixed-64x16 | 4,276.631 | µs |
| 2025-12-06 09:12:12.050 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-64x16 | 15,069.934 | µs |
| 2025-12-06 09:12:12.050 | vizij-animation-core-wasm | animation_step | cold/mixed-256x8 | 8,564.481 | µs |
| 2025-12-06 09:12:12.050 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-256x8 | 52,075.479 | µs |
| 2025-12-06 09:12:12.050 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/20bx64tx16k-blend | 34,983.741 | µs |
| 2025-12-06 09:12:12.050 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 429,855.591 | µs |
| 2025-12-06 09:12:12.050 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 77,382.397 | µs |
| 2025-12-06 09:12:12.050 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 1,432,224.011 | µs |
| --- | --- | --- | --- | --- | --- |
| Second improvements | --- | --- | --- | --- | --- |
| 2025-12-06 08:41:03 | vizij-graph-core | graph_eval | cold/tiny-smoke-8 | 29.051 | µs |
| 2025-12-06 08:41:03 | vizij-graph-core | graph_eval | amortized_per_step/tiny-smoke-8 | 9.110 | µs |
| 2025-12-06 08:41:03 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 8.628 | µs |
| 2025-12-06 08:41:03 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 3.942 | µs |
| 2025-12-06 08:41:03 | vizij-graph-core | graph_eval | cold/kitchen-1-blocks | 93.023 | µs |
| 2025-12-06 08:41:03 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-1-blocks | 26.109 | µs |
| 2025-12-06 08:41:03 | vizij-graph-core | graph_eval | cold/kitchen-50-blocks | 4,679.100 | µs |
| 2025-12-06 08:41:03 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-50-blocks | 2,128.200 | µs |
| 2025-12-06 08:41:03 | vizij-graph-core | graph_eval | cold/kitchen-500-blocks | 67,699.000 | µs |
| 2025-12-06 08:41:03 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-500-blocks | 73,327.000 | µs |
| 2025-12-06 08:42:18 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 1.957 | µs |
| 2025-12-06 08:42:18 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 1.217 | µs |
| 2025-12-06 08:42:18 | vizij-animation-core | animation_step | cold/mixed-16x32 | 37.204 | µs |
| 2025-12-06 08:42:18 | vizij-animation-core | animation_step | amortized_per_step/mixed-16x32 | 6.929 | µs |
| 2025-12-06 08:42:18 | vizij-animation-core | animation_step | cold/mixed-64x16 | 89.823 | µs |
| 2025-12-06 08:42:18 | vizij-animation-core | animation_step | amortized_per_step/mixed-64x16 | 22.567 | µs |
| 2025-12-06 08:42:18 | vizij-animation-core | animation_step | cold/mixed-256x8 | 278.770 | µs |
| 2025-12-06 08:42:18 | vizij-animation-core | animation_step | amortized_per_step/mixed-256x8 | 112.160 | µs |
| 2025-12-06 08:44:07 | vizij-orchestrator-core | orchestrator_tick | cold/empty | 0.142 | µs |
| 2025-12-06 08:44:07 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/empty | 0.117 | µs |
| 2025-12-06 08:44:07 | vizij-orchestrator-core | orchestrator_tick | cold/light-scalar-ramp | 47.235 | µs |
| 2025-12-06 08:44:07 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/light-scalar-ramp | 7.505 | µs |
| 2025-12-06 08:44:07 | vizij-orchestrator-core | orchestrator_tick | cold/20bx64tx16k-blend | 4,322.100 | µs |
| 2025-12-06 08:44:07 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 292.110 | µs |
| 2025-12-06 08:44:07 | vizij-orchestrator-core | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 8,737.800 | µs |
| 2025-12-06 08:44:07 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 675.360 | µs |
| --- | --- | --- | --- | --- | --- |
| 2025-12-06 16:50:25.980 | vizij-graph-core-wasm | graph_eval | cold/simple-gain-offset | 224.482 | µs |
| 2025-12-06 16:50:25.980 | vizij-graph-core-wasm | graph_eval | amortized_per_step/simple-gain-offset | 6,465.395 | µs |
| 2025-12-06 16:50:25.980 | vizij-graph-core-wasm | graph_eval | cold/kitchen-1-blocks | 1,160.609 | µs |
| 2025-12-06 16:50:25.980 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-1-blocks | 165,443.570 | µs |
| 2025-12-06 16:50:25.980 | vizij-graph-core-wasm | graph_eval | cold/kitchen-50-blocks | 31,579.565 | µs |
| 2025-12-06 16:50:25.980 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-50-blocks | 1,721,790.336 | µs |
| 2025-12-06 16:50:25.980 | vizij-graph-core-wasm | graph_eval | cold/kitchen-500-blocks | 701,752.907 | µs |
| 2025-12-06 16:50:25.980 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-blocks | 33,121,738.548 | µs |
| 2025-12-06 16:50:25.980 | vizij-animation-core-wasm | animation_step | cold/mixed-16x32 | 2,304.889 | µs |
| 2025-12-06 16:50:25.980 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-16x32 | 5,043.604 | µs |
| 2025-12-06 16:50:25.980 | vizij-animation-core-wasm | animation_step | cold/mixed-64x16 | 4,014.298 | µs |
| 2025-12-06 16:50:25.980 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-64x16 | 14,351.702 | µs |
| 2025-12-06 16:50:25.980 | vizij-animation-core-wasm | animation_step | cold/mixed-256x8 | 8,081.930 | µs |
| 2025-12-06 16:50:25.980 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-256x8 | 49,151.733 | µs |
| 2025-12-06 16:50:25.980 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/20bx64tx16k-blend | 33,996.538 | µs |
| 2025-12-06 16:50:25.980 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 402,469.482 | µs |
| 2025-12-06 16:50:25.980 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 72,416.372 | µs |
| 2025-12-06 16:50:25.980 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 1,383,639.212 | µs |

## Notes on recent improvements
- **Graph runtime (native + WASM):** Added a plan cache and per-node indexed output storage, eliminating per-tick node-id lookups and string searches. This drove the large drop between the initial WASM baselines (e.g., kitchen-500 amortized 168M µs) and the mid runs (~33M µs).
- **WASM boundary:** Introduced JSON-free staging for numeric inputs (`stage_input_f32`) and batch staging APIs to reduce JS↔WASM calls. In the staging stress test (kitchen-500 with 1000 inputs/step), batching cut only ~2–3% off because per-path work still dominates; indexed staging is being added to remove per-path parsing in WASM.
- **Output batching:** Added `get_outputs_batch` to read many outputs in one call, so staging microbenches now include outbound marshalling cost when comparing JSON vs batch paths.
- The main benchmarks (graph/orchestrator) do not stage host inputs; they mainly reflect evaluator/runtime efficiency. Staging microbenches are used to isolate host boundary/marshalling overhead.

| date | crate | bench | scenario | est | unit |
| --- | --- | --- | --- | --- | --- |
| staging batch testing | --- | --- | --- | --- | --- |
| 2025-12-06 23:02:13.749 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 18,033,835.008 | µs |
| 2025-12-06 23:02:13.749 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32 | 18,078,721.437 | µs |
| 2025-12-06 23:24:39.294 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 18,170,360.846 | µs |
| 2025-12-06 23:24:39.294 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 17,722,995.062 | µs |
| 2025-12-06 23:42:30.048 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 18,908,773.216 | µs |
| 2025-12-06 23:42:30.048 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 18,872,934.846 | µs |
| 2025-12-07 00:45:31.903 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 18,213,897.437 | µs |
| 2025-12-07 00:54:47.668 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 19,085,425.203 | µs |
| 2025-12-07 00:54:47.668 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 18,992,888.959 | µs |
| 2025-12-07 02:08:06.661 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 18,741,485.968 | µs |
| 2025-12-07 02:08:06.661 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 18,774,095.783 | µs |
| 2025-12-07 03:24:34.005 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 18,027,186.905 | µs |
| 2025-12-07 03:24:34.005 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 18,316,399.243 | µs |
| 2025-12-07 04:50:28.680 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 17,905,428.138 | µs |
| 2025-12-07 04:50:28.680 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 17,172,669.356 | µs |
| --- | --- | --- | --- | --- | --- |
| --- | --- | --- | --- | --- | --- |
| 2025-12-06 20:57:27 | vizij-graph-core | graph_eval | cold/tiny-smoke-8 | 67.929 | µs |
| 2025-12-06 20:57:27 | vizij-graph-core | graph_eval | amortized_per_step/tiny-smoke-8 | 9.501 | µs |
| 2025-12-06 20:57:27 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 34.285 | µs |
| 2025-12-06 20:57:27 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 3.697 | µs |
| 2025-12-06 20:57:27 | vizij-graph-core | graph_eval | cold/kitchen-1-blocks | 163.260 | µs |
| 2025-12-06 20:57:27 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-1-blocks | 26.210 | µs |
| 2025-12-06 20:57:27 | vizij-graph-core | graph_eval | cold/kitchen-50-blocks | 6,806.000 | µs |
| 2025-12-06 20:57:27 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-50-blocks | 2,166.500 | µs |
| 2025-12-06 20:57:27 | vizij-graph-core | graph_eval | cold/kitchen-500-blocks | 109,660.000 | µs |
| 2025-12-06 20:57:27 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-500-blocks | 79,467.000 | µs |
| 2025-12-06 20:59:12 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 2.059 | µs |
| 2025-12-06 20:59:12 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 1.229 | µs |
| 2025-12-06 20:59:12 | vizij-animation-core | animation_step | cold/mixed-16x32 | 39.894 | µs |
| 2025-12-06 20:59:12 | vizij-animation-core | animation_step | amortized_per_step/mixed-16x32 | 7.418 | µs |
| 2025-12-06 20:59:12 | vizij-animation-core | animation_step | cold/mixed-64x16 | 103.490 | µs |
| 2025-12-06 20:59:12 | vizij-animation-core | animation_step | amortized_per_step/mixed-64x16 | 25.129 | µs |
| 2025-12-06 20:59:12 | vizij-animation-core | animation_step | cold/mixed-256x8 | 287.920 | µs |
| 2025-12-06 20:59:12 | vizij-animation-core | animation_step | amortized_per_step/mixed-256x8 | 112.200 | µs |
| 2025-12-06 21:01:03 | vizij-orchestrator-core | orchestrator_tick | cold/empty | 0.149 | µs |
| 2025-12-06 21:01:03 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/empty | 0.116 | µs |
| 2025-12-06 21:01:03 | vizij-orchestrator-core | orchestrator_tick | cold/light-scalar-ramp | 83.511 | µs |
| 2025-12-06 21:01:03 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/light-scalar-ramp | 8.320 | µs |
| 2025-12-06 21:01:03 | vizij-orchestrator-core | orchestrator_tick | cold/20bx64tx16k-blend | 4,636.400 | µs |
| 2025-12-06 21:01:03 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 284.330 | µs |
| 2025-12-06 21:01:03 | vizij-orchestrator-core | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 8,593.500 | µs |
| 2025-12-06 21:01:03 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 630.140 | µs |
| --- | --- | --- | --- | --- | --- |
| 2025-12-07 05:13:48.807 | vizij-graph-core-wasm | graph_eval | cold/simple-gain-offset | 276.482 | µs |
| 2025-12-07 05:13:48.807 | vizij-graph-core-wasm | graph_eval | amortized_per_step/simple-gain-offset | 6,607.397 | µs |
| 2025-12-07 05:13:48.807 | vizij-graph-core-wasm | graph_eval | cold/kitchen-1-blocks | 885.314 | µs |
| 2025-12-07 05:13:48.807 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-1-blocks | 171,909.489 | µs |
| 2025-12-07 05:13:48.807 | vizij-graph-core-wasm | graph_eval | cold/kitchen-50-blocks | 39,829.270 | µs |
| 2025-12-07 05:13:48.807 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-50-blocks | 1,980,919.464 | µs |
| 2025-12-07 05:13:48.807 | vizij-graph-core-wasm | graph_eval | cold/kitchen-500-blocks | 859,553.673 | µs |
| 2025-12-07 05:13:48.807 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-blocks | 33,238,058.188 | µs |
| 2025-12-07 05:13:48.807 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 16,452,891.112 | µs |
| 2025-12-07 05:13:48.807 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 17,565,181.021 | µs |
| 2025-12-07 05:13:48.807 | vizij-animation-core-wasm | animation_step | cold/mixed-16x32 | 2,342.492 | µs |
| 2025-12-07 05:13:48.807 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-16x32 | 5,196.728 | µs |
| 2025-12-07 05:13:48.807 | vizij-animation-core-wasm | animation_step | cold/mixed-64x16 | 4,105.412 | µs |
| 2025-12-07 05:13:48.807 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-64x16 | 14,327.431 | µs |
| 2025-12-07 05:13:48.807 | vizij-animation-core-wasm | animation_step | cold/mixed-256x8 | 8,123.309 | µs |
| 2025-12-07 05:13:48.807 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-256x8 | 48,925.742 | µs |
| 2025-12-07 05:13:48.807 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/20bx64tx16k-blend | 35,059.788 | µs |
| 2025-12-07 05:13:48.807 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 143,711.493 | µs |
| 2025-12-07 05:13:48.807 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 69,949.277 | µs |
| 2025-12-07 05:13:48.807 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 348,420.811 | µs |
| --- | --- | --- | --- | --- | --- |
| Recalculating amortization | --- | --- | --- | --- | --- |
| 2025-12-06 22:09:16 | vizij-graph-core | graph_eval | cold/tiny-smoke-8 | 70.692 | µs |
| 2025-12-06 22:09:16 | vizij-graph-core | graph_eval | amortized_per_step/tiny-smoke-8 | 8.686 | µs |
| 2025-12-06 22:09:16 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 32.664 | µs |
| 2025-12-06 22:09:16 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 3.626 | µs |
| 2025-12-06 22:09:16 | vizij-graph-core | graph_eval | cold/kitchen-1-blocks | 165.910 | µs |
| 2025-12-06 22:09:16 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-1-blocks | 24.224 | µs |
| 2025-12-06 22:09:16 | vizij-graph-core | graph_eval | cold/kitchen-50-blocks | 6,542.300 | µs |
| 2025-12-06 22:09:16 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-50-blocks | 1,998.600 | µs |
| 2025-12-06 22:09:16 | vizij-graph-core | graph_eval | cold/kitchen-500-blocks | 100,230.000 | µs |
| 2025-12-06 22:09:16 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-500-blocks | 74,373.000 | µs |
| 2025-12-06 22:10:32 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 1.839 | µs |
| 2025-12-06 22:10:32 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 1.245 | µs |
| 2025-12-06 22:10:32 | vizij-animation-core | animation_step | cold/mixed-16x32 | 39.747 | µs |
| 2025-12-06 22:10:32 | vizij-animation-core | animation_step | amortized_per_step/mixed-16x32 | 7.745 | µs |
| 2025-12-06 22:10:32 | vizij-animation-core | animation_step | cold/mixed-64x16 | 107.850 | µs |
| 2025-12-06 22:10:32 | vizij-animation-core | animation_step | amortized_per_step/mixed-64x16 | 23.076 | µs |
| 2025-12-06 22:10:32 | vizij-animation-core | animation_step | cold/mixed-256x8 | 277.050 | µs |
| 2025-12-06 22:10:32 | vizij-animation-core | animation_step | amortized_per_step/mixed-256x8 | 117.190 | µs |
| 2025-12-06 22:12:26 | vizij-orchestrator-core | orchestrator_tick | cold/empty | 0.147 | µs |
| 2025-12-06 22:12:26 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/empty | 0.112 | µs |
| 2025-12-06 22:12:26 | vizij-orchestrator-core | orchestrator_tick | cold/light-scalar-ramp | 94.520 | µs |
| 2025-12-06 22:12:26 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/light-scalar-ramp | 8.176 | µs |
| 2025-12-06 22:12:26 | vizij-orchestrator-core | orchestrator_tick | cold/20bx64tx16k-blend | 4,251.800 | µs |
| 2025-12-06 22:12:26 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 282.730 | µs |
| 2025-12-06 22:12:26 | vizij-orchestrator-core | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 9,286.300 | µs |
| 2025-12-06 22:12:26 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 653.570 | µs |
| 2025-12-07 06:22:31.562 | vizij-graph-core-wasm | graph_eval | cold/simple-gain-offset | 313.275 | µs |
| 2025-12-07 06:22:31.562 | vizij-graph-core-wasm | graph_eval | amortized_per_step/simple-gain-offset | 80.066 | µs |
| 2025-12-07 06:22:31.562 | vizij-graph-core-wasm | graph_eval | cold/kitchen-1-blocks | 991.240 | µs |
| 2025-12-07 06:22:31.562 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-1-blocks | 399.873 | µs |
| 2025-12-07 06:22:31.562 | vizij-graph-core-wasm | graph_eval | cold/kitchen-50-blocks | 40,164.547 | µs |
| 2025-12-07 06:22:31.562 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-50-blocks | 20,434.982 | µs |
| 2025-12-07 06:22:31.562 | vizij-graph-core-wasm | graph_eval | cold/kitchen-500-blocks | 880,537.854 | µs |
| 2025-12-07 06:22:31.562 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-blocks | 340,024.072 | µs |
| 2025-12-07 06:22:31.562 | vizij-animation-core-wasm | animation_step | cold/mixed-16x32 | 2,384.699 | µs |
| 2025-12-07 06:22:31.562 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-16x32 | 36.525 | µs |
| 2025-12-07 06:22:31.562 | vizij-animation-core-wasm | animation_step | cold/mixed-64x16 | 4,196.320 | µs |
| 2025-12-07 06:22:31.562 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-64x16 | 125.948 | µs |
| 2025-12-07 06:22:31.562 | vizij-animation-core-wasm | animation_step | cold/mixed-256x8 | 8,315.973 | µs |
| 2025-12-07 06:22:31.562 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-256x8 | 492.802 | µs |
| 2025-12-07 06:22:31.562 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/20bx64tx16k-blend | 35,458.546 | µs |
| 2025-12-07 06:22:31.562 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 1,150.382 | µs |
| 2025-12-07 06:22:31.562 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 71,722.155 | µs |
| 2025-12-07 06:22:31.562 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 2,763.471 | µs |
| 2025-12-07 06:22:31.562 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 334,385.041 | µs |
| 2025-12-07 06:22:31.562 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 16,552,318.720 | µs |
| 2025-12-07 06:33:42.108 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 355,195.049 | µs |
| 2025-12-07 06:33:42.108 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 331,793.389 | µs |
| 2025-12-07 08:08:44.847 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 362,050.599 | µs |
| 2025-12-07 08:08:44.847 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 359,824.778 | µs |
| 2025-12-07 22:38:39.481 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 370,129.135 | µs |
| 2025-12-07 22:38:39.481 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 367,250.155 | µs |
| 2025-12-07 22:55:40.514 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 357,337.539 | µs |
| 2025-12-07 22:55:40.514 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 359,426.599 | µs |
| --- | --- | --- | --- | --- | --- |
| --- | --- | --- | --- | --- | --- |
| 2025-12-07 17:30:27 | vizij-graph-core | graph_eval | cold/tiny-smoke-8 | 68.158 | µs |
| 2025-12-07 17:30:27 | vizij-graph-core | graph_eval | amortized_per_step/tiny-smoke-8 | 8.826 | µs |
| 2025-12-07 17:30:27 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 30.843 | µs |
| 2025-12-07 17:30:27 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 3.362 | µs |
| 2025-12-07 17:30:27 | vizij-graph-core | graph_eval | cold/kitchen-1-blocks | 160.330 | µs |
| 2025-12-07 17:30:27 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-1-blocks | 24.541 | µs |
| 2025-12-07 17:30:27 | vizij-graph-core | graph_eval | cold/kitchen-50-blocks | 6,622.700 | µs |
| 2025-12-07 17:30:27 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-50-blocks | 1,859.100 | µs |
| 2025-12-07 17:30:27 | vizij-graph-core | graph_eval | cold/kitchen-500-blocks | 100,700.000 | µs |
| 2025-12-07 17:30:27 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-500-blocks | 80,728.000 | µs |
| 2025-12-07 17:31:43 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 2.095 | µs |
| 2025-12-07 17:31:43 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 1.278 | µs |
| 2025-12-07 17:31:43 | vizij-animation-core | animation_step | cold/mixed-16x32 | 43.182 | µs |
| 2025-12-07 17:31:43 | vizij-animation-core | animation_step | amortized_per_step/mixed-16x32 | 7.706 | µs |
| 2025-12-07 17:31:43 | vizij-animation-core | animation_step | cold/mixed-64x16 | 100.740 | µs |
| 2025-12-07 17:31:43 | vizij-animation-core | animation_step | amortized_per_step/mixed-64x16 | 25.742 | µs |
| 2025-12-07 17:31:43 | vizij-animation-core | animation_step | cold/mixed-256x8 | 292.670 | µs |
| 2025-12-07 17:31:43 | vizij-animation-core | animation_step | amortized_per_step/mixed-256x8 | 121.340 | µs |
| 2025-12-07 17:33:33 | vizij-orchestrator-core | orchestrator_tick | cold/empty | 0.146 | µs |
| 2025-12-07 17:33:33 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/empty | 0.118 | µs |
| 2025-12-07 17:33:33 | vizij-orchestrator-core | orchestrator_tick | cold/light-scalar-ramp | 84.436 | µs |
| 2025-12-07 17:33:33 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/light-scalar-ramp | 8.241 | µs |
| 2025-12-07 17:33:33 | vizij-orchestrator-core | orchestrator_tick | cold/20bx64tx16k-blend | 4,565.800 | µs |
| 2025-12-07 17:33:33 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 294.360 | µs |
| 2025-12-07 17:33:33 | vizij-orchestrator-core | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 8,984.700 | µs |
| 2025-12-07 17:33:33 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 627.150 | µs |
| 2025-12-08 01:52:44.686 | vizij-graph-core-wasm | graph_eval | cold/simple-gain-offset | 304.310 | µs |
| 2025-12-08 01:52:44.686 | vizij-graph-core-wasm | graph_eval | amortized_per_step/simple-gain-offset | 78.049 | µs |
| 2025-12-08 01:52:44.686 | vizij-graph-core-wasm | graph_eval | cold/kitchen-1-blocks | 1,373.345 | µs |
| 2025-12-08 01:52:44.686 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-1-blocks | 392.287 | µs |
| 2025-12-08 01:52:44.686 | vizij-graph-core-wasm | graph_eval | cold/kitchen-50-blocks | 40,129.691 | µs |
| 2025-12-08 01:52:44.686 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-50-blocks | 21,625.601 | µs |
| 2025-12-08 01:52:44.686 | vizij-graph-core-wasm | graph_eval | cold/kitchen-500-blocks | 778,692.622 | µs |
| 2025-12-08 01:52:44.686 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-blocks | 321,059.719 | µs |
| 2025-12-08 01:52:44.686 | vizij-animation-core-wasm | animation_step | cold/mixed-16x32 | 2,352.662 | µs |
| 2025-12-08 01:52:44.686 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-16x32 | 31.672 | µs |
| 2025-12-08 01:52:44.686 | vizij-animation-core-wasm | animation_step | cold/mixed-64x16 | 4,186.459 | µs |
| 2025-12-08 01:52:44.686 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-64x16 | 107.593 | µs |
| 2025-12-08 01:52:44.686 | vizij-animation-core-wasm | animation_step | cold/mixed-256x8 | 8,264.473 | µs |
| 2025-12-08 01:52:44.686 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-256x8 | 422.188 | µs |
| 2025-12-08 01:52:44.686 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/20bx64tx16k-blend | 35,318.503 | µs |
| 2025-12-08 01:52:44.686 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 1,124.034 | µs |
| 2025-12-08 01:52:44.686 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 71,214.825 | µs |
| 2025-12-08 01:52:44.686 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 2,716.993 | µs |
| 2025-12-08 01:52:44.686 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 338,923.384 | µs |
| 2025-12-08 01:52:44.686 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 334,175.501 | µs |
| 2025-12-08 02:03:05.799 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 368,577.065 | µs |
| 2025-12-08 02:03:05.799 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 372,151.842 | µs |
| 2025-12-07 20:06:57 | vizij-graph-core | graph_eval | cold/tiny-smoke-8 | 72.560 | µs |
| 2025-12-07 20:06:57 | vizij-graph-core | graph_eval | amortized_per_step/tiny-smoke-8 | 10.141 | µs |
| 2025-12-07 20:06:57 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 37.974 | µs |
| 2025-12-07 20:06:57 | vizij-graph-core | graph_eval | fixture/simple-gain-offset | 4.008 | µs |
| 2025-12-07 20:06:57 | vizij-graph-core | graph_eval | cold/kitchen-1-blocks | 193.010 | µs |
| 2025-12-07 20:06:57 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-1-blocks | 28.596 | µs |
| 2025-12-07 20:06:57 | vizij-graph-core | graph_eval | cold/kitchen-50-blocks | 7,185.900 | µs |
| 2025-12-07 20:06:57 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-50-blocks | 2,122.400 | µs |
| 2025-12-07 20:06:57 | vizij-graph-core | graph_eval | cold/kitchen-500-blocks | 99,042.000 | µs |
| 2025-12-07 20:06:57 | vizij-graph-core | graph_eval | amortized_per_step/kitchen-500-blocks | 69,891.000 | µs |
| 2025-12-07 20:08:37 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 1.861 | µs |
| 2025-12-07 20:08:37 | vizij-animation-core | animation_step | fixture/pose-quat-transform | 1.331 | µs |
| 2025-12-07 20:08:37 | vizij-animation-core | animation_step | cold/mixed-16x32 | 38.824 | µs |
| 2025-12-07 20:08:37 | vizij-animation-core | animation_step | amortized_per_step/mixed-16x32 | 7.525 | µs |
| 2025-12-07 20:08:37 | vizij-animation-core | animation_step | cold/mixed-64x16 | 93.418 | µs |
| 2025-12-07 20:08:37 | vizij-animation-core | animation_step | amortized_per_step/mixed-64x16 | 25.381 | µs |
| 2025-12-07 20:08:37 | vizij-animation-core | animation_step | cold/mixed-256x8 | 271.270 | µs |
| 2025-12-07 20:08:37 | vizij-animation-core | animation_step | amortized_per_step/mixed-256x8 | 119.870 | µs |
| 2025-12-07 20:10:29 | vizij-orchestrator-core | orchestrator_tick | cold/empty | 0.147 | µs |
| 2025-12-07 20:10:29 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/empty | 0.120 | µs |
| 2025-12-07 20:10:29 | vizij-orchestrator-core | orchestrator_tick | cold/light-scalar-ramp | 86.064 | µs |
| 2025-12-07 20:10:29 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/light-scalar-ramp | 8.047 | µs |
| 2025-12-07 20:10:29 | vizij-orchestrator-core | orchestrator_tick | cold/20bx64tx16k-blend | 4,513.200 | µs |
| 2025-12-07 20:10:29 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 268.600 | µs |
| 2025-12-07 20:10:29 | vizij-orchestrator-core | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 9,484.900 | µs |
| 2025-12-07 20:10:29 | vizij-orchestrator-core | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 649.380 | µs |
| 2025-12-08 04:27:30.358 | vizij-graph-core-wasm | graph_eval | cold/simple-gain-offset | 305.397 | µs |
| 2025-12-08 04:27:30.358 | vizij-graph-core-wasm | graph_eval | amortized_per_step/simple-gain-offset | 78.748 | µs |
| 2025-12-08 04:27:30.358 | vizij-graph-core-wasm | graph_eval | cold/kitchen-1-blocks | 633.418 | µs |
| 2025-12-08 04:27:30.358 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-1-blocks | 391.696 | µs |
| 2025-12-08 04:27:30.358 | vizij-graph-core-wasm | graph_eval | cold/kitchen-50-blocks | 21,074.944 | µs |
| 2025-12-08 04:27:30.358 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-50-blocks | 19,771.306 | µs |
| 2025-12-08 04:27:30.358 | vizij-graph-core-wasm | graph_eval | cold/kitchen-500-blocks | 373,162.130 | µs |
| 2025-12-08 04:27:30.358 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-blocks | 317,727.739 | µs |
| 2025-12-08 04:27:30.358 | vizij-animation-core-wasm | animation_step | cold/mixed-16x32 | 2,386.160 | µs |
| 2025-12-08 04:27:30.358 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-16x32 | 32.564 | µs |
| 2025-12-08 04:27:30.358 | vizij-animation-core-wasm | animation_step | cold/mixed-64x16 | 3,988.700 | µs |
| 2025-12-08 04:27:30.358 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-64x16 | 111.034 | µs |
| 2025-12-08 04:27:30.358 | vizij-animation-core-wasm | animation_step | cold/mixed-256x8 | 7,920.286 | µs |
| 2025-12-08 04:27:30.358 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-256x8 | 441.066 | µs |
| 2025-12-08 04:27:30.358 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/20bx64tx16k-blend | 35,905.564 | µs |
| 2025-12-08 04:27:30.358 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 1,098.155 | µs |
| 2025-12-08 04:27:30.358 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 69,349.401 | µs |
| 2025-12-08 04:27:30.358 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 2,625.066 | µs |
| 2025-12-08 04:27:30.358 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 312,930.371 | µs |
| 2025-12-08 04:27:30.358 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 311,563.916 | µs |
| 2025-12-08 04:39:07.352 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 331,231.849 | µs |
| 2025-12-08 04:39:07.352 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 333,910.426 | µs |
| 2025-12-08 04:57:29.153 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 331,310.236 | µs |
| 2025-12-08 04:57:29.153 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 342,491.508 | µs |
| --- | --- | --- | --- | --- | --- |
| Bench Update Current | --- | --- | --- | --- | --- |
| 2025-12-08 07:02:24.936 | vizij-graph-core-wasm | graph_eval | cold/simple-gain-offset | 308.928 | µs |
| 2025-12-08 07:02:24.936 | vizij-graph-core-wasm | graph_eval | amortized_per_step/simple-gain-offset | 32.475 | µs |
| 2025-12-08 07:02:24.936 | vizij-graph-core-wasm | graph_eval | cold/kitchen-1-blocks | 1,053.660 | µs |
| 2025-12-08 07:02:24.936 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-1-blocks | 168.906 | µs |
| 2025-12-08 07:02:24.936 | vizij-graph-core-wasm | graph_eval | cold/kitchen-50-blocks | 40,832.050 | µs |
| 2025-12-08 07:02:24.936 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-50-blocks | 8,388.507 | µs |
| 2025-12-08 07:02:24.936 | vizij-graph-core-wasm | graph_eval | cold/kitchen-500-blocks | 889,591.284 | µs |
| 2025-12-08 07:02:24.936 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-blocks | 196,815.516 | µs |
| 2025-12-08 07:02:24.936 | vizij-animation-core-wasm | animation_step | cold/mixed-16x32 | 2,300.960 | µs |
| 2025-12-08 07:02:24.936 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-16x32 | 30.895 | µs |
| 2025-12-08 07:02:24.936 | vizij-animation-core-wasm | animation_step | cold/mixed-64x16 | 4,010.892 | µs |
| 2025-12-08 07:02:24.936 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-64x16 | 104.601 | µs |
| 2025-12-08 07:02:24.936 | vizij-animation-core-wasm | animation_step | cold/mixed-256x8 | 7,911.971 | µs |
| 2025-12-08 07:02:24.936 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-256x8 | 415.376 | µs |
| 2025-12-08 07:02:24.936 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/20bx64tx16k-blend | 37,827.522 | µs |
| 2025-12-08 07:02:24.936 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 1,085.235 | µs |
| 2025-12-08 07:02:24.936 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 67,975.226 | µs |
| 2025-12-08 07:02:24.936 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 2,642.242 | µs |
| 2025-12-08 07:02:24.936 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-json | 191,215.993 | µs |
| 2025-12-08 07:02:24.936 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-f32-batch | 187,902.526 | µs |
| --- | --- | --- | --- | --- | --- |
| Bench Update Smart API | --- | --- | --- | --- | --- |
| 2025-12-08 20:12:25.272 | vizij-graph-core-wasm | graph_eval | cold/simple-gain-offset | 321.252 | µs |
| 2025-12-08 20:12:25.272 | vizij-graph-core-wasm | graph_eval | amortized_per_step/simple-gain-offset | 33.647 | µs |
| 2025-12-08 20:12:25.272 | vizij-graph-core-wasm | graph_eval | cold/kitchen-1-blocks | 1,126.951 | µs |
| 2025-12-08 20:12:25.272 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-1-blocks | 187.261 | µs |
| 2025-12-08 20:12:25.272 | vizij-graph-core-wasm | graph_eval | cold/kitchen-50-blocks | 42,559.377 | µs |
| 2025-12-08 20:12:25.272 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-50-blocks | 8,594.818 | µs |
| 2025-12-08 20:12:25.272 | vizij-graph-core-wasm | graph_eval | cold/kitchen-500-blocks | 910,320.073 | µs |
| 2025-12-08 20:12:25.272 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-blocks | 197,645.318 | µs |
| 2025-12-08 20:12:25.272 | vizij-animation-core-wasm | animation_step | cold/mixed-16x32 | 2,366.140 | µs |
| 2025-12-08 20:12:25.272 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-16x32 | 31.449 | µs |
| 2025-12-08 20:12:25.272 | vizij-animation-core-wasm | animation_step | cold/mixed-64x16 | 4,102.538 | µs |
| 2025-12-08 20:12:25.272 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-64x16 | 107.982 | µs |
| 2025-12-08 20:12:25.272 | vizij-animation-core-wasm | animation_step | cold/mixed-256x8 | 8,101.688 | µs |
| 2025-12-08 20:12:25.272 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-256x8 | 418.467 | µs |
| 2025-12-08 20:12:25.272 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/20bx64tx16k-blend | 34,757.162 | µs |
| 2025-12-08 20:12:25.272 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 1,127.526 | µs |
| 2025-12-08 20:12:25.272 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 70,171.507 | µs |
| 2025-12-08 20:12:25.272 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 2,712.925 | µs |
| 2025-12-08 20:12:25.272 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-smart | 195,689.086 | µs |
| Bench Update Smart API prt2 | --- | --- | --- | --- | --- |
| 2025-12-08 20:31:35.584 | vizij-graph-core-wasm | graph_eval | cold/simple-gain-offset | 408.558 | µs |
| 2025-12-08 20:31:35.584 | vizij-graph-core-wasm | graph_eval | amortized_per_step/simple-gain-offset | 42.178 | µs |
| 2025-12-08 20:31:35.584 | vizij-graph-core-wasm | graph_eval | cold/kitchen-1-blocks | 1,089.621 | µs |
| 2025-12-08 20:31:35.584 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-1-blocks | 187.120 | µs |
| 2025-12-08 20:31:35.584 | vizij-graph-core-wasm | graph_eval | cold/kitchen-50-blocks | 45,636.272 | µs |
| 2025-12-08 20:31:35.584 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-50-blocks | 8,800.755 | µs |
| 2025-12-08 20:31:35.584 | vizij-graph-core-wasm | graph_eval | cold/kitchen-500-blocks | 939,522.004 | µs |
| 2025-12-08 20:31:35.584 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-blocks | 198,889.970 | µs |
| 2025-12-08 20:31:35.584 | vizij-animation-core-wasm | animation_step | cold/mixed-16x32 | 2,461.540 | µs |
| 2025-12-08 20:31:35.584 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-16x32 | 31.339 | µs |
| 2025-12-08 20:31:35.584 | vizij-animation-core-wasm | animation_step | cold/mixed-64x16 | 4,142.267 | µs |
| 2025-12-08 20:31:35.584 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-64x16 | 106.177 | µs |
| 2025-12-08 20:31:35.584 | vizij-animation-core-wasm | animation_step | cold/mixed-256x8 | 8,253.856 | µs |
| 2025-12-08 20:31:35.584 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-256x8 | 419.491 | µs |
| 2025-12-08 20:31:35.584 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/20bx64tx16k-blend | 36,675.590 | µs |
| 2025-12-08 20:31:35.584 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 1,137.715 | µs |
| 2025-12-08 20:31:35.584 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 72,588.782 | µs |
| 2025-12-08 20:31:35.584 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 2,763.161 | µs |
| 2025-12-08 20:31:35.584 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-smart | 195,877.172 | µs |
| Bench Update Smart API prt3 | --- | --- | --- | --- | --- |
| 2025-12-08 21:03:33.172 | vizij-graph-core-wasm | graph_eval | cold/simple-gain-offset | 355.522 | µs |
| 2025-12-08 21:03:33.172 | vizij-graph-core-wasm | graph_eval | amortized_per_step/simple-gain-offset | 41.932 | µs |
| 2025-12-08 21:03:33.172 | vizij-graph-core-wasm | graph_eval | cold/kitchen-1-blocks | 1,050.960 | µs |
| 2025-12-08 21:03:33.172 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-1-blocks | 183.007 | µs |
| 2025-12-08 21:03:33.172 | vizij-graph-core-wasm | graph_eval | cold/kitchen-50-blocks | 45,354.528 | µs |
| 2025-12-08 21:03:33.172 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-50-blocks | 9,409.728 | µs |
| 2025-12-08 21:03:33.172 | vizij-graph-core-wasm | graph_eval | cold/kitchen-500-blocks | 967,164.659 | µs |
| 2025-12-08 21:03:33.172 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-blocks | 213,298.709 | µs |
| 2025-12-08 21:03:33.172 | vizij-animation-core-wasm | animation_step | cold/mixed-16x32 | 2,649.760 | µs |
| 2025-12-08 21:03:33.172 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-16x32 | 36.524 | µs |
| 2025-12-08 21:03:33.172 | vizij-animation-core-wasm | animation_step | cold/mixed-64x16 | 4,756.287 | µs |
| 2025-12-08 21:03:33.172 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-64x16 | 120.414 | µs |
| 2025-12-08 21:03:33.172 | vizij-animation-core-wasm | animation_step | cold/mixed-256x8 | 9,345.771 | µs |
| 2025-12-08 21:03:33.172 | vizij-animation-core-wasm | animation_step | amortized_per_step/mixed-256x8 | 482.216 | µs |
| 2025-12-08 21:03:33.172 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/20bx64tx16k-blend | 39,207.601 | µs |
| 2025-12-08 21:03:33.172 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/20bx64tx16k-blend | 1,304.800 | µs |
| 2025-12-08 21:03:33.172 | vizij-orchestrator-core-wasm | orchestrator_tick | cold/merged-2x20b-2x64tx16k | 81,355.287 | µs |
| 2025-12-08 21:03:33.172 | vizij-orchestrator-core-wasm | orchestrator_tick | amortized_per_step/merged-2x20b-2x64tx16k | 3,070.483 | µs |
| 2025-12-08 21:03:33.172 | vizij-graph-core-wasm | graph_eval | amortized_per_step/kitchen-500-staged-smart | 227,016.809 | µs |

## Node/WASM (stage 2 harness)
Use the canonical perf scenarios (hashed under `vizij-rs/fixtures/perf_scenarios`) to keep measurements reproducible and deterministic.

- Build wasm wrappers: `pnpm run build:wasm`
- Run full harness (appends below): `pnpm run perf:wasm`
- Verify-only (no append): `pnpm run perf:wasm:verify`
- CI smoke uses: `SMOKE=1 VERIFY_ONLY=1 pnpm run perf:smoke`
- Update goldens intentionally: `UPDATE_GOLDEN=1 pnpm run perf:wasm`

Columns: date, env (node-wasm), commit, wasm ABI (graph/anim/orch), build type, bench, scenario id, samples, warmup_ticks (untimed warm steps), steps, dt, median_us (steady-state per step), signature (sha prefix), delta_vs_golden, note.

| date | env | commit | wasm_abi | build | bench | scenario | samples | warmup_ticks | steps | dt | median_us | signature | delta_vs_golden | note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2025-12-09 02:08:44.494 | node-wasm | unknown | g2-a2-o2 | release | graph_eval | graph-smoke | 15 | 5 | 120 | 0.0166667 | 103.393 | 5f1f016cd1b0 | 3.9% |  |
| 2025-12-09 02:08:44.494 | node-wasm | unknown | g2-a2-o2 | release | graph_eval | graph-defaults-only | 10 | 5 | 60 | 0.0166667 | 46.415 | 2f7c70a6ce07 | 3.1% |  |
| 2025-12-09 02:08:44.494 | node-wasm | unknown | g2-a2-o2 | release | graph_eval | graph-kitchen-025 | 12 | 10 | 120 | 0.0166667 | 11363.253 | 082b16e88068 | 2.9% |  |
| 2025-12-09 02:08:44.494 | node-wasm | unknown | g2-a2-o2 | release | graph_eval | graph-kitchen-500 | 3 | 10 | 30 | 0.0166667 | 386344.606 | 101b56db7333 | -2.2% |  |
| 2025-12-09 02:08:44.494 | node-wasm | unknown | g2-a2-o2 | release | animation_step | animation-mixed-small | 12 | 2 | 120 | 0.0166667 | 39.110 | 8a80ad7bc5ac | 1.6% |  |
| 2025-12-09 02:08:44.494 | node-wasm | unknown | g2-a2-o2 | release | animation_step | animation-mixed-medium | 10 | 2 | 120 | 0.0166667 | 149.299 | 2a54fe9753b9 | 7.9% |  |
| 2025-12-09 02:08:44.494 | node-wasm | unknown | g2-a2-o2 | release | orchestrator_tick | orchestrator-merged-blend | 8 | 5 | 60 | 0.0166667 | 6975.669 | 6daa93919471 | -7.6% |  |
| 2025-12-09 23:24:31.741 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-smoke | 15 | 5 | 120 | 0.0166667 | 94.286 | 5f1f016cd1b0 | 0.0% |  |
| 2025-12-09 23:24:31.741 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-defaults-only | 10 | 5 | 60 | 0.0166667 | 41.313 | 2f7c70a6ce07 | 0.0% |  |
| 2025-12-09 23:24:31.741 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-kitchen-025 | 12 | 10 | 120 | 0.0166667 | 9471.173 | 082b16e88068 | 0.0% |  |
| 2025-12-09 23:24:31.741 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-kitchen-500 | 3 | 10 | 30 | 0.0166667 | 342332.788 | 101b56db7333 | 0.0% |  |
| 2025-12-09 23:24:31.741 | node-wasm | cdb63e4 | g2-a2-o2 | release | animation_step | animation-mixed-small | 12 | 2 | 120 | 0.0166667 | 36.217 | 8a80ad7bc5ac | 0.0% |  |
| 2025-12-09 23:24:31.741 | node-wasm | cdb63e4 | g2-a2-o2 | release | animation_step | animation-mixed-medium | 10 | 2 | 120 | 0.0166667 | 125.558 | 2a54fe9753b9 | 0.0% |  |
| 2025-12-09 23:24:31.741 | node-wasm | cdb63e4 | g2-a2-o2 | release | orchestrator_tick | orchestrator-merged-blend | 8 | 5 | 60 | 0.0166667 | 9682.536 | 4358fc446d0b | 0.0% |  |
| 2025-12-09 23:28:14.944 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-smoke | 15 | 5 | 120 | 0.0166667 | 94.687 | 5f1f016cd1b0 | 0.0% |  |
| 2025-12-09 23:28:14.944 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-defaults-only | 10 | 5 | 60 | 0.0166667 | 38.943 | 2f7c70a6ce07 | 0.0% |  |
| 2025-12-09 23:28:14.944 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-kitchen-025 | 12 | 10 | 120 | 0.0166667 | 9053.852 | 082b16e88068 | 0.0% |  |
| 2025-12-09 23:28:14.944 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-kitchen-500 | 3 | 10 | 30 | 0.0166667 | 333976.195 | 101b56db7333 | 0.0% |  |
| 2025-12-09 23:28:14.944 | node-wasm | cdb63e4 | g2-a2-o2 | release | animation_step | animation-mixed-small | 12 | 2 | 120 | 0.0166667 | 36.101 | 8a80ad7bc5ac | 0.0% |  |
| 2025-12-09 23:28:14.944 | node-wasm | cdb63e4 | g2-a2-o2 | release | animation_step | animation-mixed-medium | 10 | 2 | 120 | 0.0166667 | 124.376 | 2a54fe9753b9 | 0.0% |  |
| 2025-12-09 23:28:14.944 | node-wasm | cdb63e4 | g2-a2-o2 | release | orchestrator_tick | orchestrator-merged-blend | 8 | 5 | 60 | 0.0166667 | 9389.031 | 4358fc446d0b | 0.0% |  |
| 2025-12-09 23:31:18.109 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-smoke | 15 | 5 | 120 | 0.0166667 | 83.771 | 5f1f016cd1b0 | -11.5% |  |
| 2025-12-09 23:31:18.109 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-defaults-only | 10 | 5 | 60 | 0.0166667 | 37.328 | 2f7c70a6ce07 | -4.1% |  |
| 2025-12-09 23:31:18.109 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-kitchen-025 | 12 | 10 | 120 | 0.0166667 | 9342.653 | 082b16e88068 | 3.2% |  |
| 2025-12-09 23:31:18.109 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-kitchen-500 | 3 | 10 | 30 | 0.0166667 | 347400.205 | 101b56db7333 | 4.0% |  |
| 2025-12-09 23:31:18.109 | node-wasm | cdb63e4 | g2-a2-o2 | release | animation_step | animation-mixed-small | 12 | 2 | 120 | 0.0166667 | 41.292 | 8a80ad7bc5ac | 14.4% |  |
| 2025-12-09 23:31:18.109 | node-wasm | cdb63e4 | g2-a2-o2 | release | animation_step | animation-mixed-medium | 10 | 2 | 120 | 0.0166667 | 132.982 | 2a54fe9753b9 | 6.9% |  |
| 2025-12-09 23:31:18.109 | node-wasm | cdb63e4 | g2-a2-o2 | release | orchestrator_tick | orchestrator-merged-blend | 8 | 5 | 60 | 0.0166667 | 12277.803 | 4358fc446d0b | 30.8% |  |
| 2025-12-10 00:07:56.639 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-smoke | 15 | 5 | 120 | 0.0166667 | 92.010 | 5f1f016cd1b0 | -2.8% |  |
| 2025-12-10 00:07:56.639 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-defaults-only | 10 | 5 | 60 | 0.0166667 | 38.986 | 2f7c70a6ce07 | 0.1% |  |
| 2025-12-10 00:07:56.639 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-kitchen-025 | 12 | 10 | 120 | 0.0166667 | 8636.362 | 082b16e88068 | -4.6% |  |
| 2025-12-10 00:07:56.639 | node-wasm | cdb63e4 | g2-a2-o2 | release | graph_eval | graph-kitchen-500 | 3 | 10 | 30 | 0.0166667 | 337245.889 | 101b56db7333 | 1.0% |  |
| 2025-12-10 00:07:56.639 | node-wasm | cdb63e4 | g2-a2-o2 | release | animation_step | animation-mixed-small | 12 | 2 | 120 | 0.0166667 | 33.154 | 8a80ad7bc5ac | -8.2% |  |
| 2025-12-10 00:07:56.639 | node-wasm | cdb63e4 | g2-a2-o2 | release | animation_step | animation-mixed-medium | 10 | 2 | 120 | 0.0166667 | 115.977 | 2a54fe9753b9 | -6.8% |  |
| 2025-12-10 00:07:56.639 | node-wasm | cdb63e4 | g2-a2-o2 | release | orchestrator_tick | orchestrator-merged-blend | 8 | 5 | 60 | 0.0166667 | 9366.038 | 4358fc446d0b | -0.2% |  |
| 2025-12-10 01:57:18.101 | node-wasm | fb64a05 | g2-a2-o2 | release | graph_eval | graph-smoke | 15 | 5 | 120 | 0.0166667 | 109.729 | 5f1f016cd1b0 | 15.9% |  |
| 2025-12-10 01:57:18.101 | node-wasm | fb64a05 | g2-a2-o2 | release | graph_eval | graph-defaults-only | 10 | 5 | 60 | 0.0166667 | 45.278 | 2f7c70a6ce07 | 16.3% |  |
| 2025-12-10 01:57:18.101 | node-wasm | fb64a05 | g2-a2-o2 | release | graph_eval | graph-kitchen-025 | 12 | 10 | 120 | 0.0166667 | 12321.160 | 082b16e88068 | 36.1% | > 0.35 var |
| 2025-12-10 01:57:18.101 | node-wasm | fb64a05 | g2-a2-o2 | release | graph_eval | graph-kitchen-500 | 3 | 10 | 30 | 0.0166667 | 424304.996 | 101b56db7333 | 27.0% |  |
| 2025-12-10 01:57:18.101 | node-wasm | fb64a05 | g2-a2-o2 | release | animation_step | animation-mixed-small | 12 | 2 | 120 | 0.0166667 | 36.220 | 8a80ad7bc5ac | 0.3% |  |
| 2025-12-10 01:57:18.101 | node-wasm | fb64a05 | g2-a2-o2 | release | animation_step | animation-mixed-medium | 10 | 2 | 120 | 0.0166667 | 128.662 | 2a54fe9753b9 | 3.4% |  |
| 2025-12-10 01:57:18.101 | node-wasm | fb64a05 | g2-a2-o2 | release | orchestrator_tick | orchestrator-merged-blend | 8 | 5 | 60 | 0.0166667 | 12786.588 | 4358fc446d0b | 36.2% | > 0.35 var |
