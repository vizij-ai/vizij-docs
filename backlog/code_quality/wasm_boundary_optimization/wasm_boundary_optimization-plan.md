# WASM Boundary Optimization – Plan & Tracking
<!-- tags: family=project; type=plan; project_status=planning; topics=wasm,performance,rust,optimization -->
> **Last updated:** 2026-03-31

> **Related documents:** [Proposal](wasm_boundary_optimization-proposal.md) · [Project summary](../summary.md)

## Objective & Scope

Identify and optimize the most expensive JavaScript/WASM boundary crossings in Vizij, focusing on serialization overhead and call frequency. The aim is to reduce frame time spent in the "WASM bridge" without sacrificing correctness or debuggability.

## Plan

The steps below are intended as a linear sequence that a junior developer can follow, with explicit acceptance criteria.

### 1. Profile existing JS/WASM interactions to find hot paths

1.1 Set up a profiling scenario in `vizij-web`:
- [ ] Run `pnpm --filter demo-vizij-player dev` (or another representative app) to exercise real graph and animation workloads.
- [ ] Use Chrome DevTools or Firefox Performance tools to record performance profiles during typical usage (e.g., playing an animation, interacting with controls).

1.2 Identify boundary hotspots:
- [ ] In the performance profile, look for:
    - Functions close to the WASM boundary (e.g., `wasm-bindgen` shims, calls into `@vizij/*-wasm`).
    - High call counts or heavy time spent in serialization logic.
- [ ] Note down:
    - Which `@vizij/*-wasm` packages are involved.
    - Which calls are most frequent or most expensive.

Acceptance criteria:
- A short note (e.g., in this plan or a local `README`) listing the top 2–3 JS/WASM call sites that consume the most time per frame.

### 2. Audit write and update patterns (use of `WriteBatch` and similar)

2.1 Review `vizij-rs` API crates:
- [ ] Inspect `vizij-rs/crates/api/vizij-api-wasm` and related crates to understand how writes and updates are exposed to JS (e.g., `WriteBatch`).

2.2 Review `@vizij/*-wasm` wrappers:
- [ ] Look at `vizij-rs/npm/@vizij/*-wasm` and `vizij-web/packages/@vizij/*-react` to see how the WASM APIs are actually used on the JS side.
- [ ] Identify places where:
    - Multiple small calls could be batched.
    - Data is being serialized/deserialized multiple times for the same logical operation.

Acceptance criteria:
- A list of specific code locations (files + function names) where:
  - `WriteBatch` or similar batching could be applied more effectively.
  - Serialization can be reduced by reusing data or adjusting APIs.

### 3. Design and implement small, targeted optimizations

3.1 Reduce call frequency:
- ✅ Graph: one-call slots+delta path (`eval_all_slots_delta`) in wasm; wrapper auto-uses it.
- ✅ Orchestrator: delta step (`step_delta`) added; JS wrapper exposes `stepDelta` with version token.
- [ ] Consider single-call orchestrator variant that inlines staging+step+delta if profiling shows benefit.
- 🔍 **React consumption optimizations (planned):**
  - Node graph React: register hot paths on load, batch host inputs via `setHotPaths` + `stageInputs`/`stageInputsBySlotDiff` instead of per-path `stageInput`; skip `evalAll` on frames with no staged changes or time advance.
  - Orchestrator React: batch staged inputs via `setHotInputs` + `setInputsSmart`; use `stepDelta` when “changed writes only” is acceptable, otherwise keep `step` but still batch inputs.
  - Runtime React: reuse orchestrator batching in `flushStagedInputs`; prefer `stepDelta` for rigs/face loops that only need changed writes.

3.2 Reduce serialization overhead:
- ✅ Graph: slots+delta path skips full JSON snapshots; wrapper still reconstructs full view for callers.
- ✅ Orchestrator: delta returns writes/conflicts/timings with version token; unchanged writes elided.
- [ ] Document guidance for consumers: use `stepDelta` when you only need changed writes; keep `step` for full per-frame logs.

Acceptance criteria:
- ✅ At least one hotspot’s boundary traffic reduced (graph eval path).
- 📝 Orchestrator delta path documented and adopted by consumers that can tolerate “changed writes only.”
- ⚪ Add/adjust tests to cover delta semantics and baseline reset guidance.

### 4. Re-run profiles and compare results

4.1 Capture new performance profiles:
- [ ] Repeat profiling with graph slots+delta + orchestrator `stepDelta` paths enabled.
- [ ] Compare:
    - Total frame time.
    - Time spent in WASM shims/serialization.
    - Number/size of boundary payloads for graph and orchestrator.
    - Impact of React-layer batching (before/after adopting hot-path staging and `stepDelta`).

Acceptance criteria:
- [ ] At least one hotspot shows a measurable improvement (lower time or fewer bytes).
- [ ] No regressions in consumers that rely on full-frame writes (confirm they stay on `step`).

### 5. Document optimization patterns and guardrails

5.1 Capture guidelines:
- [ ] Add a brief section to `vizij-docs` (or update an existing doc) summarizing:
    - Recommended patterns for JS/WASM interactions (e.g., favor batches, avoid chatter).
    - Examples of newly optimized APIs and how to use them.

5.2 Ensure future changes follow patterns:
- [ ] Where appropriate, add comments or small utility functions that make the preferred patterns easy to follow (e.g., helper to batch writes).

Acceptance criteria:
- New contributors can quickly understand the preferred way to interact with WASM APIs by reading the documentation.

## Acceptance Criteria (Overall)

- Hot JS/WASM call sites have been identified and documented.
- Graph boundary path reduced to single-call slots+delta without breaking callers’ API expectations.
- Orchestrator delta path available; documented semantics (“writes are omitted when unchanged; use `step` if you need every frame”).
- Profiling shows improvement on at least one real workload (pending re-run).
- The optimization has not introduced regressions (existing tests pass or updated).
- Documentation guides future JS/WASM usage toward low-overhead patterns.
