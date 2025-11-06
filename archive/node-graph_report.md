# Vizij Node Graph Evaluation (vizij-rs)

## High-level architecture
- `vizij_api_core` defines `Shape`, `ShapeId`, `Value`, `TypedPath`, and `Write*` helpers used across modules.
- `vizij_graph_core` implements the runtime: `GraphSpec` (`types.rs`), topology evaluation (`topo.rs`), and per-node execution (`eval.rs`). Ports emit `PortValue { value, shape }`, where the shape is inferred at runtime via `vizij_api_core`.
- `vizij_graph_wasm` wraps the core for browsers. It normalizes graph JSON, evaluates graphs into a fresh `GraphRuntime`, and returns serialized outputs plus write operations.
- The npm package `@vizij/node-graph-wasm` re-exports the wasm bindings with a TypeScript surface describing graph specs, values, shapes, and schema introspection.

## Shape / value / typed path flow
1. **Shapes**: `NodeSpec.output_shapes` accepts `Shape` objects, but evaluation ignores it. `PortValue::new` (eval.rs) reconstructs a `Shape` by inferring from the produced `Value`; this inference downgrades vectors to `ShapeId::List(Scalar)` and recomputes record/enum layouts every frame. No compatibility checks exist between declared `output_shapes` and actual values.
2. **Values**: Execution uses `vizij_api_core::Value`, flattening arithmetic via helper structs. Numeric coercion is duplicated between `eval.rs` (`as_float`, `flatten_numeric`) and `vizij_api_core::coercion`, which risks divergence. Composite operations (records, arrays, tuples) are supported only insofar as arithmetic flattens them; ports still return the full `Value`.
3. **Typed paths**: `NodeParams.path` stores an optional string path (`types.rs`), but the core never parses or validates it against `TypedPath`. The wasm layer simply echoes the string when generating write operations; no `WriteBatch`/`WriteOp` objects are created in Rust.
4. **Graph-level writes**: `eval_node` for `Output` just forwards the `in` value. Downstream code must scan nodes for `params.path` (wasm) to decide what to publish. There is no centralized accumulation of writes inside `GraphRuntime` yet.

## Wasm bindings and npm exposure
- `vizij_graph_wasm::load_graph` normalizes `params.value` by accepting either adjacently tagged `{ type, data }` JSON or legacy shorthand (`{ float: 1 }`, numeric literals, arrays). Only `params.value` is normalized; other numeric params (`min`, `max`, etc.) rely on serde defaults.
- `eval_all` materializes an empty `GraphRuntime`, runs `evaluate_all`, and then serializes outputs. Returned JSON includes both the legacy Value shape and the inferred Shape for each port, and a `writes` array for nodes with `params.path` (still unvalidated strings). The doc comment still claims the old `{ path, value }` structure.
- `set_param` handles most numeric parameters but does not support updating `params.path`, so the typed path for `Output` nodes cannot be changed from JS.
- The README for `npm/@vizij/node-graph-wasm` mirrors the outdated doc comment and omits the `shape` payload present in runtime responses.
- TypeScript types expose `ShapeJSON` as the serde form of `Shape`. The union lacks a `Vector` variant, so vector shapes appear as `List(Scalar)` once inferred; consumers cannot distinguish between true lists and numeric vectors without additional metadata.

## Current documentation accuracy
- `vizij_graph_wasm/src/lib.rs` doc comment for `eval_all` is stale—the runtime now returns structs with `value` and `shape` per port and write. The README in `npm/@vizij/node-graph-wasm` repeats this omission.
- `vizij_graph_core/README.md` still lists TODOs predating the shape/value unification and lacks guidance on typed paths or shape inference.

## Identified risks and gaps
1. **Shape fidelity & validation**: Because declared `output_shapes` are ignored and actual shapes are inferred, mismatches slip through silently. This undermines future clustering/reuse goals and WASM/Bevy parity.
2. **Typed path handling**: Paths are plain strings in `NodeParams`, bypassing the strongly typed `TypedPath` API and never validated. Hosts have to trust user input, which is risky when graphs will write into shared blackboards.
3. **Vector semantics**: `Value::Vector` is serialized as `{ vector: [...] }`, but shape inference downgrades it to `List(Scalar)`. Tooling cannot distinguish between semantic vectors, lists, or bag-of-scalars.
4. **Write integration**: The wasm layer synthesizes write batches after evaluation rather than the core emitting `WriteOp`s. There is no clear contract for real-time systems (Bevy, WASM) to receive writes uniformly.
5. **Duplication**: Coercion helpers in `vizij_graph_core::eval` mirror `vizij_api_core::coercion`. Divergent updates could introduce evaluation inconsistencies across modules.
6. **Testing & coverage**: Only topology tests exist (`topo.rs`). There are no unit tests for shape inference, typed paths, or wasm JSON normalization, making regressions likely when extending the type system.

## Recommendations
1. **Honor declared shapes**: Treat `NodeSpec.output_shapes` as authoritative: validate outputs against declared shapes at runtime and surface diagnostic errors. Allow nodes to omit shapes and fall back to inference when appropriate, but warn once per node on mismatch.
2. **Adopt `TypedPath` in specs**: Change `NodeParams.path` to `Option<TypedPath>` (with serde string form) and validate during `load_graph`. Emit real `WriteOp`s from `evaluate_all` so both wasm and Bevy integrations can consume the same `WriteBatch`.
3. **Clarify vector shape**: Add a `ShapeId::Vector` (or metadata flag) to distinguish flat numeric vectors from generic lists. Update `Value` serialization and TypeScript bindings accordingly.
4. **Normalize JSON once**: Push `normalize_value_json` into `vizij_api_core` or reuse serde helpers so wasm/node/react layers share the same normalization logic. Extend normalization to other parameters (e.g., `sizes`, `path`).
5. **Testing**: Add snapshot tests for `evaluate_all` covering scalar, vector, transform, record, and enum nodes; add wasm tests for JSON round-trips and for write generation when `path` is invalid.
6. **Documentation refresh**: Update `vizij_graph_core/README.md` to describe the unified shape/value system, typed paths, and intended write API. Fix wasm README/doc comments to describe actual JSON payloads and mention `shape` objects. Provide a short example of defining a node with `path`.
7. **Future extensibility**: Before implementing node clustering, factor graph spec parsing into a builder that can validate ports, shapes, and params using the schema registry (`schema.rs`). This will keep the core DRY and ease reuse across WASM and Bevy hosts.

