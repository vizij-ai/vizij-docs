# Performance Baselines – Bench Fixture Reference
<!-- tags: status=tracking; topics=performance,benchmarking,fixtures -->

## Graph eval (`graph_eval` bench)
- `eval/tiny-smoke-8` – generated 8-node add chain; minimal smoke to sanity check harness.
- `cold|amortized_per_step/kitchen-*-blocks` – generated “kitchen-sink” chains (~25 nodes/block) covering arithmetic, vector ops, logic/compare, time/oscillator, transitions (spring/damp/slew), range (clamp/remap), join, and outputs. Block counts: 1 (~25 nodes), 20 (~500), 200 (~5k), 2000 (~50k). The 2000-block case is opt-in via `GRAPH_HEAVY=1` and uses reduced samples (cold/amortized_per_step sample_size ≈10; amortized steps reduced to 10).
- `eval/fixture/simple-gain-offset` – existing JSON fixture (`fixtures/node_graphs/simple-gain-offset.json`); small real-world graph.

## Animation step (`animation_step` bench)
- `cold|amortized_per_step/fixture/pose-quat-transform` – fixture animation from manifest; mixed pose/quaternion tracks.
- `cold|amortized_per_step/mixed-16x32` – synthetic mixed-value (Float/Vec3/Quat) 16 tracks × 32 keyframes with varied bezier transitions.
- `cold|amortized_per_step/mixed-64x16` – synthetic mixed-value 64 tracks × 16 keyframes with varied transitions.
- `cold|amortized_per_step/mixed-256x8` – synthetic mixed-value 256 tracks × 8 keyframes with varied transitions.

## Orchestrator tick (`orchestrator_tick` bench)
- `cold|amortized_per_step/tick/empty` – orchestrator with no registered graphs/animations; isolates scheduling overhead.
- `cold|amortized_per_step/tick/light-scalar-ramp` – `demo_single_pass` pipeline; simple scalar ramp graph + animation setup.
- `cold|amortized_per_step/tick/heavy-blend` – generated kitchen graph (20 blocks) + synthetic animation (64×16).
- `cold|amortized_per_step/tick/heavy-merged` – generated kitchen graph (50 blocks) + synthetic animation (128×24).
- `cold|amortized_per_step/tick/generated-kitchen` – generated kitchen graph (20 blocks) plus synthetic animation (64 tracks × 16 keys) aligned with graph/animation benches.

### Cold vs amortized
- `cold/*`: constructs runtime/controllers and runs a single step (includes setup). Sample size ≈ 50 (≈10 for the heaviest 2000-block kitchen graph).
- `amortized_per_step/*`: constructs once per iteration, runs 100 steps/ticks, divides by 100 so the reported estimate is per step/tick. Sample size ≈ 10 (≈2 for the heaviest 2000-block kitchen graph).

### Notes
- All generated graphs live inside the bench harness (not in fixtures) to keep them deterministic and fast to tweak.
- Fixture-based cases pull from `vizij-rs/fixtures/manifest.json` via `vizij-test-fixtures`.
- Timings in `perf_baselines.md` are medians; compare like-for-like scenarios across runs.
