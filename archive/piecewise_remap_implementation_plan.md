# Implementation Plan: Piecewise Remap Node

## Goal
- ✅ **Status: Completed** Introduce a new node that performs n-segment piecewise linear remapping while keeping the existing `Remap` / `CenteredRemap` nodes backwards compatible. — 📝 Note: Implemented via the new `PiecewiseRemap` variant alongside legacy nodes.
- ✅ **Status: Completed** Allow creators to supply ordered input/output breakpoint arrays plus a `clamp` flag instead of the fixed 3-breakpoint layout. — 📝 Note: Graph specs now accept paired vectors and optional clamping.
- ✅ **Status: Completed** Mirror the new surface across native Rust, wasm bindings, and exported registry metadata without breaking current ABI consumers. — 📝 Note: Core, wasm, and schema exports were updated in lockstep.

## Current State Summary
- ℹ️ **Status: Verified** `CenteredRemap` expects six scalar inputs (`in_low`, `in_anchor`, `in_high`, `out_low`, `out_anchor`, `out_high`) plus `in`. — 📝 Note: Legacy behaviour remains untouched for backwards compatibility.
- ℹ️ **Status: Verified** Evaluation clamps to two spans around the anchor and applies vector-friendly numeric helpers. — 📝 Note: Serves as the comparison baseline for the new node.
- ⚠️ **Status: Addressed** No existing node accepts variable-length breakpoint data or exposes a clamp toggle. — 📝 Note: Gap resolved by introducing `PiecewiseRemap`.

## Proposed Node Surface
- ✅ **Status: Completed** **NodeType**: add `PiecewiseRemap` (`piecewise_remap` in JSON). — 📝 Note: Serialized tag verified through registry export.
- ✅ **Status: Completed** **Ports**: — 📝 Note: Schema describes the vector-based breakpoint inputs.
  - ✅ **Status: Completed** `in` (`Float`): value to remap; support scalar and vector inputs via existing numeric flattening helpers. — 📝 Note: Uses `flatten_numeric` for broadcasting support.
  - ✅ **Status: Completed** `input_breakpoints` (`Vector`): ordered numeric list describing the domain. — 📝 Note: Validation enforces monotonic, finite values.
  - ✅ **Status: Completed** `output_breakpoints` (`Vector`): ordered numeric list mapped 1:1 with the input list. — 📝 Note: Stored as vectors to align with wasm JSON expectations.
- ✅ **Status: Completed** **Params**: — 📝 Note: Clamp behaviour mapped to `NodeParams::clamp`.
  - ✅ **Status: Completed** `clamp: bool` (default `true`); stored on `NodeParams` as `Option<bool>` and surfaced in the schema. — 📝 Note: Defaults to the clamped legacy remap semantics.
- ✅ **Status: Completed** **Defaults**: Provide sensible `input_defaults` in the registry (e.g., `[0, 0.5, 1]` → `[0, 0.5, 1]`) so the node evaluates out of the box without wiring arrays from elsewhere. — 📝 Note: Ensures editor previews work immediately.
- ✅ **Status: Completed** **Compatibility**: Retain `CenteredRemap` for existing graphs; add migration guidance later if needed. — 📝 Note: No automatic spec migrations are triggered.

## Runtime Behaviour
- ✅ **Status: Completed** Fetch `input_breakpoints` / `output_breakpoints` via `flatten_numeric` and collect into plain `Vec<f32>`. — 📝 Note: Shared with vector handling utilities for consistency.
- ✅ **Status: Completed** Require matching lengths `>= 2`; error otherwise. — 📝 Note: Error messaging cites mismatched counts.
- ✅ **Status: Completed** Binary search the segment containing each scalar component of `in`. — 📝 Note: Implemented via linear scan suitable for small lists.
- ✅ **Status: Completed** For exact breakpoint hits, snap directly to the aligned output value. — 📝 Note: Avoids rounding drift at the knots.
- ✅ **Status: Completed** For interior segments: — 📝 Note: Interpolation honours duplicate handling rules.
  - ✅ **Status: Completed** Compute local `t = (value - in[i]) / (in[i+1] - in[i])` with divide-by-zero guards. — 📝 Note: Degenerate spans fall back to plateau behaviour.
  - ✅ **Status: Completed** Generate the interpolated output `out[i] + t * (out[i+1] - out[i])`. — 📝 Note: Supports descending output ramps.
- ✅ **Status: Completed** Values outside the domain: — 📝 Note: Branches cover forward/backward extrapolation.
  - ✅ **Status: Completed** If `clamp == true`, clamp to the first/last output value. — 📝 Note: Matches historical remap clamping.
  - ✅ **Status: Completed** If `clamp == false`, extrapolate using the slope of the first/last valid segment. — 📝 Note: Mirrors expected artistic controls.
- ✅ **Status: Completed** Support vector inputs by iterating component-wise through the flattened layout and reconstructing with the existing layout helper. — 📝 Note: Works for `Vec3`, transforms, and nested numeric structures.

## Validation Rules
- ✅ **Status: Completed** Both breakpoint arrays must be free of `NaN`/`Inf`; emit descriptive errors if encountered. — 📝 Note: Error messages report the offending index.
- ✅ **Status: Completed** Enforce monotonically non-decreasing `input_breakpoints`; report the first offending pair. — 📝 Note: Uses epsilon-aware comparison to tolerate float noise.
- ✅ **Status: Completed** Reject graphs where `output_breakpoints.len() != input_breakpoints.len()`. — 📝 Note: Prevents undefined interpolation states.

### Duplicate Input Handling
- ✅ **Status: Completed** Permit consecutive duplicates as long as the corresponding outputs are equal; this represents a pinned plateau at that breakpoint. — 📝 Note: Helps author flat regions without extra ranges.
- ✅ **Status: Completed** When duplicates appear with identical outputs: — 📝 Note: Implementation compacts duplicates during preparation.
  - ✅ **Status: Completed** Skip zero-length segments during interpolation. — 📝 Note: Prevents divide-by-zero.
  - ✅ **Status: Completed** If the evaluated value equals the duplicated breaker, return that shared output directly. — 📝 Note: Ensures continuity at plateaus.
- ⚠️ **Status: Guarded** If duplicates have differing outputs, emit a validation error explaining that infinite slope segments are unsupported and suggesting insertion of an intermediate breakpoint instead. — 📝 Note: Protects against unrealistic jumps with zero span.

### Degenerate Cases
- ✅ **Status: Completed** **All breakpoints identical** — 📝 Note: Configuration collapses to constant behaviour.
  - ✅ **Status: Completed** If all outputs also match, treat the node as a constant passthrough returning that value. — 📝 Note: `PiecewiseConfig::constant` caches the value.
  - ⚠️ **Status: Guarded** If outputs disagree, raise an error highlighting that no finite slope can be derived. — 📝 Note: Prevents undefined gradients.
- ✅ **Status: Completed** **Single effective segment (length 2)** — 📝 Note: Provides a drop-in replacement for the legacy remap.
  - ✅ **Status: Completed** Behaviour matches the current linear remap (with optional extrapolation when `clamp == false`). — 📝 Note: Tests ensure parity with centered remap ramp.
- ⚠️ **Status: Guarded** **Empty arrays or length 1** — 📝 Note: Rejected during validation to avoid runtime panics.
  - ✅ **Status: Completed** Reject with an error pointing to the minimum required count. — 📝 Note: Error string guides authors toward valid configs.
- ⚠️ **Status: Guarded** **Extremely small spans** — 📝 Note: Handles near-duplicate inputs gracefully.
  - ✅ **Status: Completed** When the denominator falls below `f32::EPSILON`, treat as zero-length and apply the duplicate logic instead of dividing. — 📝 Note: Stops runaway slopes caused by float fuzz.

## Data Model & Serialization Updates
- ✅ **Status: Completed** Extend `NodeType` enum with `PiecewiseRemap` and wire it into serde tags. — 📝 Note: Enables JSON authoring via `piecewise_remap`.
- ✅ **Status: Completed** Add `clamp: Option<bool>` to `NodeParams` plus serde defaults. — 📝 Note: Keeps configs lightweight when using the default clamp.
- ✅ **Status: Completed** Update `schema.rs` to describe the new node, ports, and parameters (including documentation strings). — 📝 Note: Downstream tooling sees documentation immediately.
- ✅ **Status: Completed** Ensure the registry exporter (`vizij-graph-registry-export`) and wasm schema exports automatically pick up the new signature. — 📝 Note: Registry JSON lists the node for UI palettes.
- ✅ **Status: Completed** Update JSON normalisation (if needed) to coerce arrays for the new ports and the optional bool parameter. — 📝 Note: Wasm bridge now understands bool and numeric array inputs.

## Runtime Integration Tasks
- ✅ **Status: Completed** Register the new evaluator in `eval_node.rs`, invoking helper logic shared with scalar/vector pathways. — 📝 Note: Dispatcher routes `PiecewiseRemap` to the new helper.
- ✅ **Status: Completed** Factor reusable helpers if needed (e.g., binary search + interpolation) while keeping existing remap implementations untouched. — 📝 Note: Introduced prep + scalar remap helpers.
- ✅ **Status: Completed** Update match arms and exhaustive switches wherever `NodeType` is used (native runtime, wasm bridge, registry export, etc.). — 📝 Note: Exhaustiveness checks pass across crates.
- 🟩 **Status: Monitoring** Bump wasm ABI or document compatibility if surface-level changes require it (expected to remain ABI-compatible if only adding a node). — 📝 Note: ABI unchanged (v2) but keep watch during downstream uptake.

## Testing Strategy
- ✅ **Status: Completed** Unit tests in `eval/tests.rs` covering: — 📝 Note: Added comprehensive suite for node behaviour.
  - ✅ **Status: Completed** Happy-path 2-point remap (clamped) matching the legacy behaviour. — 📝 Note: Confirms drop-in equivalence.
  - ✅ **Status: Completed** 3+ segments showing interior interpolation and extrapolation toggled by `clamp`. — 📝 Note: Verifies extrapolated outcomes.
  - ✅ **Status: Completed** Vector input remap (component-wise). — 📝 Note: Ensures numeric flattening works.
  - ✅ **Status: Completed** Duplicate plateau validation (equal outputs accepted, mismatched rejected). — 📝 Note: Checks plateau logic and error path.
  - ✅ **Status: Completed** Degenerate constant mapping and error cases (len < 2, unsorted, NaN). — 📝 Note: Covers guard rails.
- 🟡 **Status: Pending Review** Integration-style test ensuring the schema export includes the new node with correct metadata. — 📝 Note: Manual verification performed; consider automated snapshot later.
- 🟡 **Status: Pending Review** wasm smoke test invoking the node through JSON to ensure normalisation accepts array/bool inputs. — 📝 Note: Quick harness could be added to wasm tests when time permits.

## Tooling & Migration Notes
- 🟡 **Status: Recommended** Update fixtures or author new ones to showcase the piecewise behaviour (optional but recommended). — 📝 Note: Great candidate for future demo graphs.
- ✅ **Status: Completed** Document the node in the crate README and, if relevant, downstream packages (`@vizij/node-graph-wasm`). — 📝 Note: README now calls out multi-segment remaps.
- 🟠 **Status: Future Opportunity** Consider adding a follow-up migration guide to map existing centered remaps with three points into the new format if unification becomes desirable later. — 📝 Note: Could be bundled with future tooling updates.
