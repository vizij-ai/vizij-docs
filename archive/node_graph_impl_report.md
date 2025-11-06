# Node Graph Plan vs. Implementation Report

Purpose
This report compares the agreed implementation plan for a schema-first, selector-aware, typed node graph against the current code, explains how the graph executes now, identifies gaps, and describes why each gap matters. It is written to be understandable by readers not deep in the code while remaining precise for those who are.

Executive summary
- What’s done:
  - Selector-aware edges with shape-tracking projection.
  - First-class typed inputs with host staging and an Input node.
  - Output writes that include shape metadata so subscribers deserialize confidently.
  - Declared shape enforcement and “null-of-shape” fallback for numeric-like declared shapes on Inputs (Choice B).
- Key gaps:
  - Input nodes currently emit external writes due to unconditional write scheduling; writes should be restricted to Output nodes.
  - Selector failures on edges always error; plan allowed null-of-shape fallbacks when possible.
  - Epoch management is host-driven (evaluate_all doesn’t advance epochs); acceptable with docs, but surprising if not understood.
  - No compile-time validation/plan that pre-resolves selectors; all validation happens at runtime.
  - Missing graph-level tests; only WriteOp shape roundtrips are tested.
  - Migration helpers and tooling (WASM/Bevy/editor affordances) not included in the code changes shown.
- Why it matters:
  - Unintended writes can cause incorrect external state.
  - All-or-nothing selector errors raise fragility and reduce resiliency promised by plan.
  - Epoch confusion can lead to “missing inputs” bugs.
  - Lack of tests increases regression risk; lack of compile-time checks delays failures to runtime.

What the plan intended (short)
- Schema-first ports: Each output can optionally declare a Shape to make structure predictable at the boundary.
- Typed inputs: Host publishes values per TypedPath each tick; an Input node consumes these with declared shape validation and numeric-friendly null fallback.
- Selector-aware connections: Edges can target sub-fields or indices based on upstream shapes, to avoid splitter boilerplate.
- WriteOps with shapes: Output nodes emit external writes including the upstream value and a Shape so downstream consumers can safely deserialize.
- Choice B semantics: On coercion/projection failure, return null-of-shape (NaN-filled) for numeric-like shapes; non-numeric mismatches error.

What is implemented now

1) Selector-aware edges with shapes
- Where:
  - types.rs: SelectorSegment { Field(String), Index(usize) }; InputConnection gains selector: Option<Selector>.
  - eval/read_inputs: For each incoming edge, apply project_by_selector(value, Some(upstream.shape.id), selector).
  - shape_helpers.rs: Project across Record, Transform (pos/rot/scale with aliases), Enum variant payload, Vector/VecN/List/Array/Tuple. Updates shape id after projection.
- Behavior:
  - If projection succeeds: downstream sees the projected Value and a matching ShapeId.
  - If projection fails: evaluation returns an error (no fallback).
- Why it matters:
  - This avoids splitter boilerplate, preserves structural correctness, and keeps downstream ports receiving the intended primitive or sub-structure.
  - Current “error-on-failure” behavior favors safety; a later null fallback on edges could boost resilience once target contracts are known.

2) First-class typed inputs (staging + Input node)
- Where:
  - eval/graph_runtime.rs:
    - staged_inputs: HashMap<TypedPath, StagedInput { value, declared: Option<Shape>, epoch }>.
    - set_input(path, value, declared): stage for the next epoch.
    - get_input(path)/take_input(path): visible only in the current epoch.
    - advance_epoch(): increment epoch and drop stale staged values.
  - eval/eval_node.rs: NodeType::Input evaluation in eval_input_node.
  - schema.rs: Input node defined with params path (TypedPath string) and value (default), outputs Any.
- Behavior (Input node):
  - If NodeSpec.output_shapes has “out”, enforce declared shape:
    - If staged present and matches → pass-through.
    - If numeric-like declared shape and staged mismatched but coercible → coerce.
    - If numeric-like declared shape and missing/failed → return null-of-shape (NaNs).
    - If non-numeric declared shape and mismatched → error.
  - If no declared shape: pass staged/default through (apply staged.declared shape if provided).
- Why it matters:
  - Host → graph boundary becomes structured and predictable.
  - Numeric-friendly null behavior reduces brittle failures for animation/sensor data.

3) Output writes with shape
- Where:
  - api/vizij-api-core/write_ops.rs: WriteOp { path, value, shape: Option<Shape> } with serde roundtrips; WriteBatch array wrapper updated.
  - eval/eval_node.rs: When enqueuing external writes, add Some(port.shape.clone()).
- Behavior:
  - Subscribers can deserialize confidently and preallocate buffers based on the Shape.
- Why it matters:
  - Stronger contracts to outside systems (e.g., robot controllers, UIs). This enables better UI affordances and buffer planning.

4) Declared shape enforcement and null-of-shape fallback (Choice B)
- Where:
  - eval/shape_helpers.rs:
    - value_matches_shape: checks Value conforms to ShapeId.
    - is_numeric_like and null_of_shape_numeric: identify and generate NaN-filled structures (including nested composites).
    - coerce_numeric_to_shape: reconstruct numeric values into declared structure when possible.
  - eval/eval_node.rs:
    - enforce_output_shapes(spec, outputs) ensures declared outputs match and pins the output shape.
    - Input node uses Choice B logic per above.
- Why it matters:
  - Structural mismatches become deterministic. Numeric data gets resilient fallbacks; non-numeric mismatches fail loudly.

How the graph evaluates now (step-by-step)
- Host tick setup (expected usage):
  - Host calls rt.advance_epoch() to open the window for new staged values.
  - Host calls rt.set_input(path, value, declared_shape?) for inputs it wants the graph to consume this frame.
- Engine evaluation:
  - evaluate_all(rt, graph_spec)
    - Clears rt.outputs, resets rt.writes, retains node runtime state for nodes still present.
    - Computes a topological order of nodes and evaluates each:
      1) read_inputs: For each input edge, read upstream PortValue; apply selector projection if any; error on failure.
      2) evaluate_kind: Dispatches to node-specific logic.
         - Input: read staged input by TypedPath; validate/coerce per declared shape; null-of-shape for numeric-like failure/missing; error for non-numeric mismatches.
         - Other stateless and stateful nodes behave as before.
      3) enforce_output_shapes: If node declares output_shapes, require match and set PortValue.shape to declared.
      4) WriteOp enqueue: If node’s params.path is Some, enqueue WriteOp with value and shape (currently for all nodes; see gap below).
      5) Cache outputs in rt.outputs by node id.
- After evaluation:
  - rt.writes contains all writes for the tick; each includes value and optional shape.

Gaps vs. plan and why they matter

1) Input nodes also emit WriteOps
- Evidence:
  - eval/eval_node.rs enqueues a WriteOp whenever spec.params.path is Some, before checking node type.
  - Input nodes have a path param in schema.rs, so they will also write.
- Why it matters:
  - Input nodes are meant to be sources, not sinks. Emitting writes from them duplicates/misroutes data and can create subtle feedback loops or unintended external side effects.
- Recommendation:
  - Restrict write scheduling to NodeType::Output only (or move write logic into eval_output). This change localizes external writes to explicit sink nodes.

2) Edge selector errors don’t fall back to null-of-shape
- Evidence:
  - read_inputs returns Err on project_by_selector failure.
- Why it matters:
  - The plan described resilient “attempt to coerce; else null-of-shape” behavior. Current behavior is stricter and can break entire graphs if a selector becomes temporarily invalid (e.g., sensor stream shape drift).
  - However, inputs currently don’t carry declared input-port shapes, so the graph doesn’t know the target shape to build a null-of-shape replacement.
- Recommendation:
  - Short term: Keep errors (clear diagnostics).
  - Medium term: Add compile-time planning to know expected input shapes or per-port contracts. When known and numeric-like, fall back to null-of-shape on projection failure instead of immediate error.

3) Epoch management is host-driven only
- Evidence:
  - evaluate_all doesn’t call advance_epoch; Input node only sees staged inputs tagged with the current epoch. set_input stages for next epoch.
- Why it matters:
  - Without docs, hosts may call set_input expecting immediate visibility; the value won’t be consumed until the next epoch is advanced, leading to “missing input” confusion.
- Recommendation:
  - Option A: Document the correct order (advance_epoch → set_input → evaluate_all).
  - Option B: Call advance_epoch inside evaluate_all; then hosts call set_input just before the next evaluate_all call.

4) No compile-time selector validation/plan (optional in plan)
- Evidence:
  - No compile.rs present; all validation happens at runtime.
- Why it matters:
  - Invalid selectors fail late at runtime; pre-validation would catch miswirings earlier and could enable null-of-shape fallback since the target contracts would be known.
- Recommendation:
  - Add an optional compile step that resolves and validates selectors against declared/upstream shapes and fails early with actionable errors. This can carry projection metadata into runtime for efficiency.

5) Missing graph-level tests
- Evidence:
  - Only WriteOp (with shape) tests were added.
- Why it matters:
  - Without tests, regressions are likely and refactors are unsafe. Given the structural changes (selectors, staging, null semantics), tests are essential.
- Recommendation:
  - Add tests for:
    - Selector projection success/fail (Record/Transform, nested indices, bounds).
    - Input node with declared numeric-like shape: staged matches, coercible, missing → null-of-shape, non-numeric mismatch → error.
    - Output WriteOp carries shape and JSON roundtrip.
    - End-to-end: Input → selector to scalar → math → Output write with scalar Shape.

6) Migration/helpers/tooling not shown
- Why it matters:
  - Plan mentioned migration from legacy splitter patterns (e.g., auto-infer selectors) and exposing selector pickers in UI. Missing these does not block runtime but slows adoption and increases authoring friction.
- Recommendation:
  - Track as separate follow-ups for editor tooling and migration utilities.

Prioritized recommendations

1) Fix unintended writes from Input nodes
- Scope: small, high impact.
- Change: In eval_node, only push WriteOp for NodeType::Output. Alternatively, move write logic into eval_output.

2) Clarify epoch usage, or automate epoch advance
- Document exact host call order or call advance_epoch at start of evaluate_all.

3) Add graph-level tests
- Unit tests for selector projection, input staging + Choice B semantics, and Output WriteOps with shapes.
- Integration test demonstrating shape-aware UI/consumer contract.

4) Optional compile-time selector validation
- Pre-resolve selectors, validate against shapes, and prepare projection metadata. Enables future null-of-shape fallback on edges when target input contracts are known.

5) Plan follow-on items
- Migration helpers for splitter patterns (auto-selectors).
- Tooling updates (WASM bindings, Bevy plugin, editors) to surface typed input/output and selector pickers.

Appendix: Relevant code locations

- Selector types and connections:
  - vizij-rs/crates/node-graph/vizij-graph-core/src/types.rs
    - enum SelectorSegment { Field(String), Index(usize) }
    - struct InputConnection { node_id, output_key, selector: Option<Selector> }
- Selector projection and shape utilities:
  - vizij-rs/crates/node-graph/vizij-graph-core/src/eval/shape_helpers.rs
    - project_by_selector, is_numeric_like, null_of_shape_numeric, coerce_numeric_to_shape, value_matches_shape
- Input node and write scheduling:
  - vizij-rs/crates/node-graph/vizij-graph-core/src/eval/eval_node.rs
    - eval_input_node; write scheduling occurs in eval_node (currently unconditional on params.path)
- Runtime staging:
  - vizij-rs/crates/node-graph/vizij-graph-core/src/eval/graph_runtime.rs
    - staged_inputs, set_input, get_input, take_input, advance_epoch
- Output writes with shape:
  - vizij-rs/crates/api/vizij-api-core/src/write_ops.rs
    - WriteOp { path, value, shape: Option<Shape> }, new_with_shape; write_batch serde wrapper updated
- Schema registry updates:
  - vizij-rs/crates/node-graph/vizij-graph-core/src/schema.rs
    - Input node and Output node defined under category IO (Any ports)
- PortValue shape control:
  - vizij-rs/crates/node-graph/vizij-graph-core/src/eval/value_layout.rs
    - PortValue::with_shape, PortValue::set_shape

Closing note
The current codebase delivers the core value of the plan: structured data flow with selectors, robust typed inputs, and shape-carrying outputs. Addressing the few critical gaps—especially restricting external writes to Output nodes and clarifying epoch semantics—will stabilize behavior and make the graph safer and easier to integrate. Tests and optional compile-time validation will further harden the system and improve developer experience.
