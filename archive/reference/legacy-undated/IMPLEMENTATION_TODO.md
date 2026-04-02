# Implementation TODO — @vizij/node-graph-react

Purpose: Track and implement the guide-compliant refactor of @vizij/node-graph-react (breaking change). Follow the implementation_plan.md for details and tests. Work in ACT MODE, make edits one file at a time, and update progress here.

High-level goals

- Replace the legacy monolithic NodeGraphProvider/useNodeGraph API with a modular provider + hooks surface:
  - GraphProvider
  - useGraphRuntime
  - useGraphInstance
  - useGraphPlayback
  - useGraphInputs / useGraphInput
  - useGraphOutputs / useNodeOutput / useNodeOutputs
  - createGraphStore utility
  - normalization helpers
  - barrel index.ts re-exports for WASM types and helpers

Comprehensive checklist (implementation order)

- [ ] Step 0 — Confirm repository state & tests run locally
  - [ ] Run unit tests for current package to see baseline
  - [ ] Confirm build & types pass before making breaking changes

- [ ] Step 1 — Scaffolding
  - [ ] Add file: src/GraphContext.ts
  - [ ] Add file: src/utils/createGraphStore.ts
  - [ ] Add file: src/utils/normalizeSpec.ts
  - [ ] Add file: src/GraphProvider.tsx
  - [ ] Add file: src/useGraphRuntime.ts
  - [ ] Add file: src/useGraphInstance.ts
  - [ ] Add file: src/useGraphPlayback.ts
  - [ ] Add file: src/useGraphOutputs.ts
  - [ ] Add file: src/useGraphInput.ts
  - [ ] Add file: src/index.ts (barrel)
  - [ ] Replace src/index.tsx (legacy) with new modular surface (or remove legacy API)
  - [ ] Add types file(s) if necessary (src/types.ts) and re-export WASM types

- [ ] Step 2 — Implement GraphProvider core
  - [ ] init-once semantics for WASM runtime (defer to existing init helper)
  - [ ] Keep a single Graph ref from WASM per provider
  - [ ] loadGraph(normalizedSpec) with normalization helper
  - [ ] staged input persistence and replay before eval
  - [ ] setParam/setTime/step proxies
  - [ ] publish EvalResult snapshot to the internal store
  - [ ] updateHz / throttling support for interval playback
  - [ ] Safe teardown and Graph.free/cleanup

- [ ] Step 3 — Playback loop strategies
  - [ ] Implement "manual" mode (no auto loop)
  - [ ] Implement "raf" mode (requestAnimationFrame loop)
  - [ ] Implement "interval" mode (setInterval at configured hz)
  - [ ] Allow switching modes at runtime via runtime API
  - [ ] Provide useGraphPlayback hook to control/play/pause/seek

- [ ] Step 4 — createGraphStore + selectors
  - [ ] Implement lightweight store: subscribe, getSnapshot, getVersion
  - [ ] Ensure useSyncExternalStore-compatible API
  - [ ] Implement selector-based subscriptions for outputs
  - [ ] Implement useGraphOutputs(selector, equalityFn?) hook
  - [ ] Implement useNodeOutput(nodeId, key?) and useNodeOutputs(nodeId)

- [ ] Step 5 — useGraphInput hook
  - [ ] Implement staging of host inputs: path, value, optional shape
  - [ ] Persist staging and replay on Graph reloads
  - [ ] Provide immediateEval option to apply staged inputs then run eval immediately
  - [ ] Ensure unmount cleanup behavior for control hooks

- [ ] Step 6 — useGraphInstance hook
  - [ ] Provide local-instance management hook (create + dispose Graph locally)
  - [ ] Optional normalization of spec before creating instance
  - [ ] Provide the same runtime controls as provider runtime API (but scoped)

- [ ] Step 7 — Barrels & re-exports
  - [ ] Re-export WASM types, helpers, and value conversion helpers from index.ts
  - [ ] Export all hooks and provider

- [ ] Step 8 — Replace legacy API & remove old code
  - [ ] Replace src/index.tsx (legacy) with new barrel / remove legacy exports
  - [ ] Ensure package.json main/module/exports point at new barrel
  - [ ] Optionally set "sideEffects": false

- [ ] Step 9 — Tests
  - [ ] Update existing test(s) to the new API names and behavior:
    - Update src/**tests**/node-graph-provider.test.tsx to GraphProvider/useGraphRuntime/useGraphOutputs
    - Ensure mocks for @vizij/node-graph-wasm still work
  - [ ] Add tests for:
    - Playback loops (raf/interval/manual)
    - Staging inputs and immediateEval behavior
    - Selector subscriptions (useSyncExternalStore semantics)
    - Teardown and Graph cleanup
    - useGraphInstance separate instance behavior
  - [ ] Run test suite and iterate until green

- [ ] Step 10 — Build & type-check
  - [ ] Run npm run build for the package
  - [ ] Ensure .d.ts files are generated and exported types are correct
  - [ ] Fix any typing issues

- [ ] Step 11 — Polish & publishing readiness
  - [ ] Update package.json (sideEffects optional)
  - [ ] Update README / migration notes highlighting breaking changes
  - [ ] Bump package version with breaking-change semver
  - [ ] Final test/build run and commit

Notes & implementation details

- Use useSyncExternalStore-based subscriptions for all outputs to provide stable concurrent-safe subscriptions for React 18+.
- Staged inputs must be applied just before evaluation ticks; expose an API to force immediate eval when inputs are staged with immediateEval=true.
- Keep Graph lifetime management robust for SSR: guard requestAnimationFrame and window usage; provider should be safe to render in non-browser environments.
- Keep worker boundaries in mind: Graph may be proxied to worker later; design store & runtime API to support worker hooking.
- Tests should mock the WASM Graph interface (loadGraph, stageInput, evalAll, toValueJSON, setParam, step, setTime).

References

- vizij-web/packages/@vizij/node-graph-react/implementation_plan.md
- vizij-rs/npm/@vizij/node-graph-wasm/GUIDE1.MD
- vizij-rs/npm/@vizij/node-graph-wasm/GUIDE2.MD
