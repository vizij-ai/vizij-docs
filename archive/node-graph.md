# Vizij Node Graph End-to-End Guide

_Last updated: 2024-03-17 21:55 UTC_

This document captures the complete flow of Vizij graph data from the Rust core
through the WebAssembly bindings, React provider, and the demo editor. Use it as
an onboarding reference and as a checklist when extending the system.

## 1. Core (vizij-graph-core)

### Shapes & Values
- Ports emit `vizij_api_core::Value` paired with `Shape` metadata.
- Node authors may declare output shapes via `NodeSpec::output_shapes`;
  evaluation enforces these declarations and errors on mismatches. Undeclared
  ports continue to rely on inference.
- Vectors use `ShapeId::Vector { len: Option<usize> }`, giving downstream tools
  an optional width hint without constraining runtime list operations.

### Typed Paths & Writes
- `NodeParams::path` stores a `TypedPath`. The evaluator builds a `WriteBatch`
  containing `WriteOp` entries for each `Output` node with a path.
- Host integrations (Bevy, wasm) consume `GraphRuntime::writes` directly instead
  of parsing JSON paths themselves.

### Testing
- Unit tests in `eval.rs` cover shape validation, vector hints, missing outputs,
  and typed-path serialization. Each test name follows the "it should ..."
  convention to document intent.

## 2. Wasm Layer (vizij-graph-wasm)

### Normalization
- `normalize_graph_spec_json` mirrors the Rust-side normalization pipeline.
  Shorthand param values (`1`, `true`, arrays) become tagged ValueJSON objects,
  path parameters are coerced into strings, and numeric lists (`sizes`) are
  sanitized.

### Evaluation Contract
- `eval_all` returns `{ nodes, writes }` where:
  - `nodes[nodeId][portId] = { value: ValueJSON, shape: ShapeJSON }`
  - `writes` mirrors `WriteOp` and includes the inferred `ShapeJSON` for each
    emitted write.
- TypeScript definitions include the `Vector` shape variant and exported helper
  `normalizeGraphSpec` for consumers that need deterministic serialization.

### Testing
- Wasm crate unit tests exercise JSON normalization (value coercion, path
  stringification, numeric array parsing).
- Additional coverage now asserts that the schema registry exported through
  `get_node_schemas_json` includes the URDF IK/FK node types whenever the
  `urdf_ik` feature is enabled in the wasm build.

## 3. React Provider (@vizij/node-graph-react)

### Runtime
- Delegates initialization, graph loading, and spec normalization to the wasm
  module; no bespoke JSON munging remains in the provider.
- Selector hooks (`useNodeOutput`, `useNodeOutputs`) deliver cached snapshots
  with shapes intact.
- Helper functions (`valueAsNumber`, `valueAsVector`, etc.) understand the full
  ValueJSON surface, including transforms, quaternions, enums, and composites.

### Testing
- Vitest suite mocks the wasm bindings to verify provider behaviour:
  - `it should expose evaluated outputs once initialization completes`
  - `it should forward path updates through setParam`

## 4. Demo Applications

### Animation Graph Demo (apps/demo-animation-graph)
- Includes an interactive `UrdfIkPanel` that uploads URDF XML, edits solver
  parameters (root/tip links, max iterations, tolerances, weights), and pushes
  updates via the React runtime `setParam` API.
- Uses a new `useSyncedSeries` helper to sample slewing/damping outputs on the
  same graph evaluation ticks so plotted traces remain aligned.
- Ships a lightweight `vizij_three_link` URDF fixture under
  `src/data/urdf-samples/keep-small-urdfs/` for quick experimentation.

### Node Graph Editor (apps/demo-node-graph)

### Palette & Inspector
- Node palette categories are derived from the wasm schema registry; on failure
  it falls back to a sensible default catalogue.
- Inspector exposes typed path editing for output nodes with inline validation
  feedback and persists edits into the React Flow node state.

### Serialization
- `nodesToSpec` preserves typed paths, output shapes, and vector metadata when
  exporting graphs to the wasm runtime.

### Testing
- Vitest integration tests ensure:
  - `nodesToSpec` carries paths through to the spec
  - Node palette renders registry-driven categories
  - Display helpers format composite values (e.g., transforms)

## 5. Release Checklist

1. `cargo test -p vizij-graph-core`
2. `cargo test -p vizij-graph-wasm`
3. `npm run build --workspace @vizij/node-graph-wasm`
4. `npm run test --workspace @vizij/node-graph-react`
5. `npm run test --workspace demo-node-graph`
6. Update changelogs / docs as needed.

## References
- `vizij-rs/crates/node-graph/vizij-graph-core/README.md` — runtime API details
- `vizij-web/packages/@vizij/node-graph-react/README.md` — React integration
- `vizij-web/apps/demo-node-graph/README.md` — demo usage and testing commands
