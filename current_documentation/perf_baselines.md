# Performance Baselines
<!-- tags: status=tracking; topics=performance,benchmarking -->

Run the Stage 1 native benches and append results here for quick comparison across revisions. The helper script below appends rows automatically; otherwise copy/paste the bench output into the table.

## How to run
```bash
# from repo root
bash vizij-rs/scripts/run_perf_baselines.sh
cd vizij-rs && node scripts/run_perf_baselines_wasm.mjs
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
| --- | --- | --- | --- | --- | --- |
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
