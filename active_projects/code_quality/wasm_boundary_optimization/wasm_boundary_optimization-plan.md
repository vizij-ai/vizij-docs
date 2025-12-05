# WASM Boundary Optimization – Plan & Tracking
<!-- tags: status=planning; topics=wasm,performance,rust,optimization -->

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
- [ ] For each hotspot identified in step 1–2, propose a small change, such as:
    - Replacing multiple property-level calls with a single batched call.
    - Moving simple logic from JS into Rust so fewer calls are needed.
- [ ] Implement one change at a time in:
    - Rust crates (e.g., adding a new batched API in `vizij-graph-wasm`).
    - JS/TS wrappers (e.g., `@vizij/node-graph-wasm`).

3.2 Reduce serialization overhead:
- [ ] Where possible, adjust APIs to:
    - Accept flat arrays or simple JSON structures instead of deeply nested objects.
    - Avoid repeated JSON parsing/stringifying when an in-memory representation can be reused.

Acceptance criteria:
- For at least one identified hotspot, the number of JS→WASM calls per frame is measurably reduced (e.g., by inspecting logging or profiling).
- The changes are covered by existing tests or small new tests where necessary, ensuring no behavior regressions.

### 4. Re-run profiles and compare results

4.1 Capture new performance profiles:
- [ ] Repeat the profiling scenario from step 1 using the optimized build.
- [ ] Compare:
    - Total frame time.
    - Time spent in WASM shims/serialization.
    - Number of calls at the previously identified hotspots.

Acceptance criteria:
- At least one hotspot shows a measurable improvement (lower time spent or fewer calls).
- No new unexpected hotspots have been introduced in obvious places.

### 5. Document optimization patterns and guardrails

5.1 Capture guidelines:
- [ ] Add a brief section to `vizij_docs` (or update an existing doc) summarizing:
    - Recommended patterns for JS/WASM interactions (e.g., favor batches, avoid chatter).
    - Examples of newly optimized APIs and how to use them.

5.2 Ensure future changes follow patterns:
- [ ] Where appropriate, add comments or small utility functions that make the preferred patterns easy to follow (e.g., helper to batch writes).

Acceptance criteria:
- New contributors can quickly understand the preferred way to interact with WASM APIs by reading the documentation.

## Acceptance Criteria (Overall)

- Hot JS/WASM call sites have been identified and documented.
- At least one meaningful optimization has been implemented and validated via profiling.
- The optimization has not introduced regressions (existing tests pass).
- There is documentation guiding future JS/WASM APIs and usage towards lower-overhead patterns.

