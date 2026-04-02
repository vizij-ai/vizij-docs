# Vizij Node Graph Follow-up (vizij-rs & vizij-web)

## vizij-rs / node graph crates

### What changed since the initial report
- `NodeParams::path` became a first-class `TypedPath`, and invalid strings are rejected during deserialisation (`vizij-rs/crates/node-graph/vizij-graph-core/src/types.rs`).
- Declared `output_shapes` are enforced at evaluation time; mismatches now abort the tick with actionable errors (`vizij-rs/crates/node-graph/vizij-graph-core/src/eval.rs`).
- The runtime records a per-node `WriteBatch` so every host (Bevy, WASM) consumes the same typed path payload (`vizij-rs/crates/node-graph/vizij-graph-core/src/eval.rs`).
- WASM bindings normalise legacy JSON shorthands (values, paths, split sizes), expose the typed writes, and the npm README documents the `{ value, shape }` structure returned by `eval_all` (`vizij-rs/crates/node-graph/vizij-graph-wasm/src/lib.rs`, `vizij-rs/npm/@vizij/node-graph-wasm/README.md`).
- Regression tests now cover shape enforcement, typed path parsing, and write emission (`vizij-rs/crates/node-graph/vizij-graph-core/src/eval.rs` tests).

### Residual gaps or risks
- The published TypeScript declarations under `@vizij/node-graph-wasm` omit the new `params.path`, so TypeScript callers do not see the typed-path capability despite it working at runtime.
- JSON normalisation still lives solely inside the WASM crate; React/Node layers are not reusing it directly, so any future extension must be duplicated manually.

### Follow-on recommendations
1. **Expose `params.path` in the TypeScript surface of `@vizij/node-graph-wasm`** so host applications can set typed paths without casting to `any`.
2. **Reuse the WASM normalisation helper (`normalizeGraphSpec`) inside the React provider** before loading specs, ensuring the UI honours the exact same coercion rules as the runtime.

## vizij-web / node-graph packages & demo

### What changed since the initial report
- The React provider is backed entirely by `@vizij/node-graph-wasm`, with RAF throttling and selector hooks isolating per-node updates (`vizij-web/packages/@vizij/node-graph-react/src/index.tsx`).
- The demo inspector lets users edit typed paths, and the integration test suite confirms those paths round-trip into graph specs (`vizij-web/apps/demo-node-graph/src/components/InspectorPanel.tsx`, `vizij-web/apps/demo-node-graph/src/__tests__/graph.integration.test.tsx`).
- Schema metadata (node catalogue, port labels) comes from the WASM registry at runtime, aligning the UI with the Rust registry (`vizij-web/apps/demo-node-graph/src/state/RegistryContext.tsx`).
- Helper utilities render complex values (transforms, enums) in the inspector, and the README documents the provider’s current API (`vizij-web/packages/@vizij/node-graph-react/src/index.tsx`, `vizij-web/packages/@vizij/node-graph-react/README.md`).

### Residual gaps or risks
- Host applications still need to keep their own normalisation code (e.g. `nodesToSpec`); without a shared helper they can drift from the Rust rules.
- TypeScript projects linked against the WASM package do not see typed path support in `NodeParams`, so editor completions nudge developers away from the canonical API.

### Follow-on recommendations
1. **Surface `params.path` in the npm type declarations** (same as recommendation #1 above) to keep TypeScript consumers honest.
2. **Normalise specs through the WASM helper inside `NodeGraphProvider` (both on initial load and reload)** so every graph entering the runtime is canonicalised identically to Rust, eliminating skew between UI and core.
