# Implementation Plan

[Overview]
Define a schema-first, selector-aware, typed node graph with staged typed inputs and shape-propagating outputs, ensuring deterministic structure, ergonomic data slicing, and numeric-friendly null-on-failure behavior.

This plan upgrades vizij-graph-core to carry explicit shapes through evaluation, introduces edge-level selectors for indexing into structured outputs, and adds first-class typed input staging so hosts can push data each tick via TypedPath. The evaluation enforces declared shapes where provided and compiles selector projections so downstream nodes receive the exact primitive or sub-structure they expect without boilerplate splitter nodes.

We preserve flexibility by supporting numeric coercions and broadcasting where reasonable. When shapes are under-specified or coercions fail, numeric-like shapes will return null-of-shape values (filled with NaNs) while non-numeric mismatches become deterministic errors. Outputs can optionally propagate shapes into WriteOp so subscribers deserialize confidently and preallocate buffers.

[Types]
Introduce selector and staging types and extend connection metadata while aligning port shapes with vizij-api-core.

- Add Selector types in vizij-graph-core:
  - File: vizij-rs/crates/node-graph/vizij-graph-core/src/types.rs
    - enum SelectorSeg { Field(String), Index(usize) }
    - type Selector = Vec<SelectorSeg>
- Extend InputConnection with an optional selector:
  - struct InputConnection { node_id: NodeId, output_key: String, selector: Option<Selector> }
- Add Input node to NodeType:
  - enum NodeType { ..., Input, Output }
- Null-on-failure semantics (Choice B confirmed):
  - Numeric-like shapes (Scalar, Vec2, Vec3, Vec4, Quat, ColorRgba, Transform, Vector, and composites whose leaves are numeric) return a null-of-shape with f32::NAN in numeric leaf positions on coercion/projection failure or missing staged input.
  - Non-numeric shapes (Text, Enums with non-numeric payloads, composite shapes with non-numeric leaves) produce hard errors at compile/evaluation time when mismatched.
- PortValue already includes inferred Shape; declared output shapes (NodeSpec.output_shapes) remain the authoritative contract when present.
- Shape-aware selector projection:
  - Project by ShapeId and selector path: Field(name) for Record/Transform fields, Index(i) for arrays/tuples/vectors/lists, with validation against declared or inferred shape.

[Files]
Modify graph core, evaluation, and API serialization to support selectors, typed inputs, and shape propagation.

- New/updated files:
  - vizij-rs/crates/node-graph/vizij-graph-core/src/types.rs
    - Add SelectorSeg/Selector
    - Extend InputConnection with selector: Option<Selector>
    - Add NodeType::Input
  - vizij-rs/crates/node-graph/vizij-graph-core/src/schema.rs
    - Add NodeSignature for Input node:
      - Inputs: none
      - Params: path (TypedPath), optional default value (Value)
      - Outputs: PortType::Any (or Vector placeholder); encourage specifying NodeSpec.output_shapes for concrete contracts
    - Update Output node to use PortType::Vector or PortType::Any to avoid legacy float restriction
  - vizij-rs/crates/node-graph/vizij-graph-core/src/eval/graph_runtime.rs
    - Add staged_inputs: HashMap<TypedPath, (Value, Option<Shape>)>
    - Add methods:
      - fn set_input(&mut self, path: TypedPath, value: Value, declared: Option<Shape>)
      - fn get_input(&self, path: &TypedPath) -> Option<&(Value, Option<Shape>)>
  - vizij-rs/crates/node-graph/vizij-graph-core/src/eval/shape_helpers.rs
    - Add:
      - fn project_by_selector(value: &Value, shape: Option<&ShapeId>, sel: &Selector) -> Result<Value, String>
      - fn null_of_shape_numeric(shape: &ShapeId) -> Value
      - fn is_numeric_like(shape: &ShapeId) -> bool
  - vizij-rs/crates/node-graph/vizij-graph-core/src/eval/eval_node.rs
    - Update read_inputs(...) to apply selector projections using upstream port PortValue.shape.id where available, or infer if absent.
    - Add NodeType::Input branch in evaluate_kind:
      - Resolve spec.params.path; fetch staged input from GraphRuntime
      - If NodeSpec.output_shapes["out"] exists → validate/coerce:
        - If projection/coercion succeeds → output value with declared shape
        - If it fails and declared shape numeric-like → output null_of_shape_numeric
        - If non-numeric → return Err with clear message
      - If no declared shape:
        - Output staged value as-is; PortValue infers shape
    - Update Output node write to attach shape metadata via WriteOp (see below)
  - vizij-rs/crates/api/vizij-api-core/src/write_ops.rs
    - Extend WriteOp with optional shape: Option<Shape>, and serialize as { path, value, shape? }
    - Add WriteOp::new_with_shape(path, value, shape: Option<Shape>)
    - Update tests to roundtrip shape when present
- Optional (future-proofing, can land later):
  - vizij-rs/crates/node-graph/vizij-graph-core/src/compile.rs
    - Build a CompiledGraph that resolves selectors to projection closures and carries declared shapes, reducing runtime overhead and erroring early on invalid selectors.

[Functions]
Introduce typed input staging, selector projection, and shape-carrying writes.

- New functions:
  - GraphRuntime::set_input(path: TypedPath, value: Value, declared: Option<Shape>)
  - GraphRuntime::get_input(path: &TypedPath) -> Option<&(Value, Option<Shape>)>
  - shape_helpers::project_by_selector(value: &Value, shape: Option<&ShapeId>, sel: &Selector) -> Result<Value, String>
    - Record/Transform: Field("pos") | Field("rot") | Field("scale") supported; Transform is record-like
    - Vector/List: Index(i) → element or Float for scalar leaf
    - Array/Tuple: Index(i) → element; validate bounds
    - Nested selectors recurse; validate against ShapeId when provided, otherwise best-effort on Value structure
  - shape_helpers::null_of_shape_numeric(shape: &ShapeId) -> Value
  - shape_helpers::is_numeric_like(shape: &ShapeId) -> bool
  - write_ops::WriteOp::new_with_shape(path: TypedPath, value: Value, shape: Option<Shape>) -> WriteOp
- Modified functions:
  - eval::read_inputs(rt, inputs):
    - For each input, fetch upstream PortValue, then:
      - If conn.selector is Some(sel): projected = project_by_selector(upstream.value, Some(&upstream.shape.id), sel)
      - If projection fails:
        - If downstream declared shape exists and is numeric-like → use null_of_shape_numeric(declared.id)
        - Else → Err
      - Wrap projected into PortValue::new(projected)
  - eval::evaluate_kind match arm:
    - NodeType::Input → logic described above
    - NodeType::Output:
      - Existing pending_write uses PortValue from "out"
      - Change to attach shape if available: WriteOp::new_with_shape(path.clone(), pv.value.clone(), Some(pv.shape.clone()))
  - eval::enforce_output_shapes(spec, outputs) remains as the shape contract gate

[Classes]
Extend struct/enums to carry selectors and shape metadata while adding Input node.

- New/modified Rust types:
  - types.rs:
    - enum SelectorSeg { Field(String), Index(usize) }
    - type Selector = Vec<SelectorSeg>
    - struct InputConnection { node_id: NodeId, output_key: String, selector: Option<Selector> }
    - enum NodeType { ..., Input, Output }
  - graph_runtime.rs:
    - struct GraphRuntime { ..., staged_inputs: HashMap<TypedPath, (Value, Option<Shape>)> }
  - write_ops.rs:
    - struct WriteOp { path: TypedPath, value: Value, shape: Option<Shape> }
- No class inheritance changes (Rust); we add enums/struct fields and helper methods.

[Dependencies]
No new external crates; reuse vizij-api-core types (Shape, ShapeId, TypedPath, Value). Serialization remains via serde.

- Ensure write_ops.rs updated to serialize Optional<Shape>
- No feature flags added beyond existing urdf_ik

[Testing]
Add focused unit tests for selectors, staging, and shape propagation.

- vizij-graph-core:
  - tests.rs: selector projection
    - Record/Transform field selection (pos/rot/scale)
    - Nested projection ["pos", 1] yields Float for y component
    - Array/List/Tuple indexing and bounds errors
    - Vector indexing
  - tests.rs: Input node staging
    - Missing staged value + declared numeric shape → null-of-shape NaN fill
    - Mismatched non-numeric declared shape → Err
    - Matching shape → pass-through
  - eval pipeline
    - End-to-end: sensor → selector → Output writes typed shape
- vizij-api-core:
  - write_ops.rs tests:
    - Roundtrip with shape omitted
    - Roundtrip with shape present: equality holds
- Coercion edge cases
  - Broadcasting scalar to vector via arithmetic nodes still works (existing tests)
  - Projection failure handling conforms to Choice B semantics

[Files]
Add/modify the following paths with specific changes:
- New files to be created (with full paths and purpose)
  - (Optional future) vizij-rs/crates/node-graph/vizij-graph-core/src/compile.rs — Pre-validate and resolve selectors to closures (can be deferred).
- Existing files to be modified (with specific changes)
  - vizij-rs/crates/node-graph/vizij-graph-core/src/types.rs
    - Add SelectorSeg/Selector
    - Extend InputConnection with selector: Option<Selector>
    - Add NodeType::Input
  - vizij-rs/crates/node-graph/vizij-graph-core/src/schema.rs
    - Add Input node signature
    - Relax Output node port to Any or Vector
  - vizij-rs/crates/node-graph/vizij-graph-core/src/eval/graph_runtime.rs
    - Add staged_inputs and set_input/get_input
  - vizij-rs/crates/node-graph/vizij-graph-core/src/eval/shape_helpers.rs
    - Add project_by_selector, null_of_shape_numeric, is_numeric_like
  - vizij-rs/crates/node-graph/vizij-graph-core/src/eval/eval_node.rs
    - Apply selectors in read_inputs
    - Add NodeType::Input evaluation
    - Attach shape in WriteOp for Output node
  - vizij-rs/crates/api/vizij-api-core/src/write_ops.rs
    - Add optional shape field with serde support and constructor
    - Update unit tests
- Files to be deleted or moved
  - None
- Configuration file updates
  - None

[Functions]
Define new and modified functions with signatures and intent:
- New
  - GraphRuntime::set_input(path: TypedPath, value: Value, declared: Option<Shape>)
  - GraphRuntime::get_input(&self, path: &TypedPath) -> Option<&(Value, Option<Shape>)>
  - shape_helpers::project_by_selector(value: &Value, shape: Option<&ShapeId>, sel: &Selector) -> Result<Value, String>
  - shape_helpers::null_of_shape_numeric(shape: &ShapeId) -> Value
  - shape_helpers::is_numeric_like(shape: &ShapeId) -> bool
  - WriteOp::new_with_shape(path: TypedPath, value: Value, shape: Option<Shape>) -> WriteOp
- Modified
  - read_inputs(...) — apply selector; null-on-failure per Choice B
  - evaluate_kind(...) — add NodeType::Input; Output attaches shape
  - enforce_output_shapes(...) — unchanged, but relied upon earlier in Input node to validate staged values when declared shapes exist

[Classes]
Node and runtime structures updated to support selectors and input staging:
- NodeType gains Input
- InputConnection adds selector
- GraphRuntime tracks staged_inputs
- WriteOp optionally carries Shape

[Dependencies]
No new crates; leverage existing vizij-api-core. Ensure cross-crate reexports remain stable.

[Testing]
Unit and integration coverage for:
- Selector projection correctness and error paths
- Input node staging and shape validation
- Output shape propagation through WriteOp JSON
- End-to-end pipeline: host set_input → Input → compute → Output write with shape

[Implementation Order]
Go through all steps in order before seeking user feedback. 

1. API change: write_ops.rs — add optional shape and tests; update any callsites to use new_with_shape
2. Core types: types.rs — add Selector types, extend InputConnection, add NodeType::Input
3. Schema: schema.rs — add Input node; relax Output node port type (Any/Vector)
4. Runtime staging: graph_runtime.rs — add staged_inputs + set_input/get_input
5. Shape helpers: shape_helpers.rs — add project_by_selector, null_of_shape_numeric, is_numeric_like
6. Evaluation changes: eval_node.rs — apply selectors in read_inputs; implement NodeType::Input; attach shape in Output writes
7. Tests: add unit tests in graph core and API; validate behavior and selector coverage
8. (Optional) Compile-time optimization: compile.rs to pre-resolve selectors and fail early
9. Documentation: update README in vizij-graph-core and API to document Input/Output semantics and selector grammar
