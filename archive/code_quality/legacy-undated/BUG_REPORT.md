# Vizij Bug Report

## [Resolved] Issue 1: GraphController never advances graph time
- **Status:** Fixed – Graph runtime `t`/`dt` now update before each evaluation (`vizij-rs/crates/orchestrator/vizij-orchestrator-core/src/controllers/graph.rs`).
- **Location:** `vizij-rs/crates/orchestrator/vizij-orchestrator-core/src/controllers/graph.rs:70`
- **Impact:** `Time`, `Oscillator`, `Spring`, `Damp`, `Slew`, and any node that depends on `GraphRuntime.t`/`GraphRuntime.dt` observe `dt = 0` every frame, so graph evaluations freeze or immediately snap to targets. Orchestrator consumers cannot get time-varying outputs even when stepping the system with a non-zero `dt`.
- **Trigger:** `GraphController::evaluate` ignores the `_dt` argument and never updates `self.rt.t` or `self.rt.dt` before calling `evaluate_all`.
- **Reproduction steps:**
  1. Register a graph containing a `Time` node (or `Oscillator`) with the orchestrator.
  2. Call `VizijOrchestrator::step(0.016)` repeatedly.
  3. Observe that the node output remains constant (`Time` stays at `0`, `Oscillator` never oscillates).
- **Recommendation:** Before staging inputs, set `self.rt.dt = dt` (clamped to non-negative/finite) and increment `self.rt.t` by that delta so the runtime sees advancing time.

## [Resolved] Issue 2: GraphProvider permanently skips reload after a failed load
- **Status:** Fixed – failed load attempts now clear `lastSpecHashRef`, successful loads record the hash (`vizij-web/packages/@vizij/node-graph-react/src/GraphProvider.tsx`).
- **Location:** `vizij-web/packages/@vizij/node-graph-react/src/GraphProvider.tsx:638`
- **Impact:** When `loadGraph` (or normalization/seeding) throws, `lastSpecHashRef` is still updated. Subsequent renders with the same `spec` hash bail out early (`"spec unchanged — skip reload"`), so the provider never retries. A transient failure bricks the graph until the component is remounted or the caller mutates the spec identity.
- **Reproduction steps:**
  1. Mount `GraphProvider` with a spec and arrange for `normalizeSpec` (or `loadGraph`) to throw once (e.g., by mocking the WASM loader to reject).
  2. After the rejection, render with the original spec again.
  3. Note that the effect short-circuits at the hash check and the graph is never reloaded—even though the runtime is now healthy.
- **Recommendation:** Only record `lastSpecHashRef.current` after a successful load, or reset it inside the `catch` path so future attempts with the same spec retrigger the load.

## [Resolved] Issue 3: setInput does not update subscribers in OrchestratorProvider
- **Status:** Fixed – after setting the wasm blackboard, the provider updates its cache and notifies listeners (`vizij-web/packages/@vizij/orchestrator-react/src/OrchestratorProvider.tsx`).
- **Location:** `vizij-web/packages/@vizij/orchestrator-react/src/OrchestratorProvider.tsx:211`
- **Impact:** `useOrchTarget` (and other cache-based consumers) rely on `pathCacheRef` and `subscribeToPath`. `setInput` forwards the value to the wasm orchestrator but never updates this cache or notifies listeners, so UI hooks never see host-provided values until a later orchestrator frame writes the same path—which may never happen.
- **Reproduction steps:**
  1. Render `OrchestratorProvider` and a component that calls `useOrchTarget("demo/input/value")`.
  2. Invoke `ctx.setInput("demo/input/value", { float: 2 })`.
  3. The hook continues to return `undefined` until another frame writes that path.
- **Recommendation:** After calling `instance.setInput`, cache the value (`pathCacheRef.current.set(path, value)`) and fan out notifications to subscribers so React consumers observe the update immediately.

## [Resolved] Issue 4: useGraphInput cleanup stages `undefined` into the wasm runtime
- **Status:** Fixed – staging a value of `undefined` now removes the entry instead of emitting an invalid payload (`vizij-web/packages/@vizij/node-graph-react/src/GraphProvider.tsx`).
- **Location:** `vizij-web/packages/@vizij/node-graph-react/src/useGraphInput.ts:38`
- **Impact:** The cleanup calls `runtime.stageInput(path, undefined, undefined)`. The provider stores that entry and later calls the wasm `stage_input` with an `undefined` payload. wasm-bindgen expects a string, so the next evaluation throws a TypeError and halts graph updates. Components using `useGraphInput` tear down will crash subsequent eval cycles.
- **Reproduction steps:**
  1. Mount a component that uses `useGraphInput("demo/path", { float: 1 })`.
  2. Unmount it (navigate away).
  3. The next provider `evalAll()` logs `TypeError: parameter 1 is not of type 'string'` from the wasm layer and the staged input never clears.
- **Recommendation:** On cleanup, remove the staged entry instead of staging `undefined` (e.g., `runtime.clearStagedInputs` or a dedicated `unstageInput` helper) so wasm never receives an invalid payload.

## [Resolved] Issue 5: useGraphInstance never obtains a working wasm API and passes unresolved Promises as specs
- **Status:** Fixed – the hook now ensures the wasm module is initialised, awaits normalization, and uses the exposed Graph factories (`vizij-web/packages/@vizij/node-graph-react/src/useGraphInstance.ts`).
- **Location:** `vizij-web/packages/@vizij/node-graph-react/src/useGraphInstance.ts:43-123`
- **Impact:** `wasmInit()` returns `Promise<void>`, but the hook stores its (undefined) result in `wasmRef.current`. Subsequently `loadGraph` sees `wasmRef.current === undefined`, reports "WASM runtime not available", and aborts. Even if that were fixed, `normalizeSpec` is async: the code assigns the unresolved Promise to `normalized` and forwards it to the Graph constructor/loaders, so the wasm layer receives `{}` instead of the intended spec. As a result, `useGraphInstance` callers cannot actually load graphs.
- **Reproduction steps:**
  1. Call `const instance = useGraphInstance(spec)` inside a component.
  2. Observe the console error "WASM runtime not available" and see that `loadGraph` rejects.
  3. Patch the hook to keep running and note that the graph JSON stringifies to `{}` because `normalizeSpec(spec)` was never awaited.
- **Recommendation:** Hold a reference to the module namespace (e.g., `import * as wasm`) instead of storing the `init()` result, ensure `await init()` before accessing constructors, and `await normalizeSpec(graphSpec)` before passing it to the wasm APIs.

## [Resolved] Issue 6: useModelLoader / useRiggedModelLoader skip `isLoading` in dependencies and rerun concurrently
- **Status:** Fixed – both callbacks now depend on `isLoading`, preventing stale closures from spawning duplicate loads (`vizij-web/packages/@vizij/rig/src/useModelLoader.ts`).
- **Location:** `vizij-web/packages/@vizij/rig/src/useModelLoader.ts:48` and `:160`
- **Impact:** Both `loadVizij` callbacks read `isLoading`, but it is omitted from their dependency arrays. After the first load sets `isLoading` to `true`, the memoized callback still closes over the initial `false`, so subsequent triggers start another load while the first is still in flight. That re-enters expensive GLTF parsing, can double-apply world elements, and conflicts with the `loadedModelsRef` bookkeeping.
- **Reproduction steps:**
  1. Render a component that calls `useModelLoader` and change props rapidly (e.g., swap `bounds` or `initialValues`).
  2. See multiple overlapping `loadGLTF` calls in the console despite `isLoading` toggling to true.
  3. Inspect React DevTools: `isLoading` state is true, yet `loadVizij` still executes because the closure captured the stale value.
- **Recommendation:** Include `isLoading` (and `isLoaded` where used) in the hook dependencies or derive the guard from refs so the closure sees updated state before launching another load.
