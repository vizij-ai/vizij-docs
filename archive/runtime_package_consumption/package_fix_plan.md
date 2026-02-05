# Vizij Package Fix Plan (Next.js Compatibility & Runtime Stability)

This document captures the upstream work we need to land across the Vizij packages so that projects like `peerbots-controller-web` can consume the runtime without local shims or manual patches.

## 1. @vizij/wasm-loader
- Replace dynamic specifier strings (`import(/* @vite-ignore */ fsSpec)`) with static imports (`import("node:fs/promises")` etc.) so webpack/Next.js can statically analyse the bundle.
- Add lightweight diagnostics (e.g. warn if `loadBindings` returns without populating the cache) while keeping default logs silent in production builds.
- Publish as patch release; update dependants.

## 2. @vizij/orchestrator-wasm
- Ship an ESM entry that:
  - Imports `pkg/vizij_orchestrator_wasm.js` and `vizij_orchestrator_wasm_bg.wasm` statically.
  - Returns string URLs, not `URL` objects, from `defaultWasmUrl()` / loader paths.
  - Re-exports the current surface (`init`, `createOrchestrator`, `Orchestrator`, fixtures helpers, etc.).
- Document the bundler expectations (async wasm, `asset/resource`) and add a quick smoke test for Next.js in CI.
- Release new version; bump orchestrator-react/runtime-react deps.

## 3. @vizij/orchestrator-react
- Fix StrictMode mount tracking: ensure the effect sets `mountedRef.current = true` before registering cleanup so `setReady(true)` survives the double-invoke cycle.
- Add optional debug logging or an assertion when `setReady` is skipped, to catch regressions early.
- Release patch version aligned with updated orchestrator-wasm.

## 4. @vizij/runtime-react
- Update dependency ranges to pull the fixed orchestrator packages.
- Expand docs to clarify asset bundle requirements (GLB must embed Vizij bundle or provide rig/pose JSON explicitly).
- Add an integration example/test that boots the runtime in a Next.js app using the new packages.

## 5. Node Graph Packages

### @vizij/node-graph-wasm
- Mirror the orchestrator-wasm work:
  - Provide an ESM bundle that statically imports `pkg/node_graph_wasm.js` and the wasm binary so bundlers receive plain strings.
  - Ensure any helper that returns wasm URLs hands back strings (not `URL` objects).
  - Publish a patch and document bundler expectations (`asyncWebAssembly`, `asset/resource`).

### @vizij/node-graph-react
- Depend on the updated wasm package; drop any workarounds that expect `new URL()` behaviour.
- Audit `GraphProvider` for StrictMode sensitivity (e.g., the `mounted` flag pattern) and align with the orchestrator fix so `setReady(true)` survives double-invoke.
- Extend docs to mention the bundler requirements and provide a Next.js snippet.

### @vizij/node-graph-authoring
- Update its dependency on `@vizij/node-graph-wasm`.
- Confirm code generation utilities don’t assume the old `URL` object behaviour.
- Run authoring tests/examples in a Next.js context if applicable.

## 6. Animation Packages

### @vizij/animation-wasm (or equivalent wasm crate)
- Produce the same ESM-friendly output: static imports for the glue JS + wasm binary and string URLs for loaders.
- Release new version.

### @vizij/animation-react (or other animation runtime packages)
- Bump deps to the new wasm build.
- Check for StrictMode-sensitive patterns similar to the orchestrator provider; patch if necessary.
- Update docs/examples and verify integration in a Next.js sandbox.

## 7. Release & Communication Checklist
1. Implement code changes above; add regression tests where feasible.
2. Bump versions and publish to NPM (wasm-loader → orchestrator-wasm → orchestrator-react → runtime-react → node-graph/animation consumers).
3. Update changelog/README entries highlighting:
   - No more webpack warnings.
   - Works in Next.js (14+) without custom aliases.
   - Requirement for asset bundles with Vizij metadata.
4. Notify internal integrators and update the integration guide in `vizij-docs`.

Once those releases are live, downstream apps can drop the temporary aliases/logging and simply install the new package versions.
