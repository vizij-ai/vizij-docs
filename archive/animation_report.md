# Vizij Animation Stack Follow-up

## Scope
This report traces the animation stack end-to-end:

- Core crates inside `vizij-rs/crates/animation` (`vizij-animation-core`, `vizij-animation-wasm`, `bevy_vizij_animation`).
- npm distribution `@vizij/animation-wasm` and the React wrapper `@vizij/animation-react` under `vizij-web`.
- The demo animation studio application (`vizij-web/apps/demo-animation-studio`).

## Current architecture snapshot

### Core engine (`vizij-animation-core`)
- `Engine` owns animation data, players, instances, binding tables, scratch buffers, and per-tick outputs (`vizij-rs/crates/animation/vizij-animation-core/src/engine.rs`).
- `NodeParams` equivalent uses `vizij_api_core::Value` everywhere, enabling deterministic blending across scalars, vectors, quats, and transforms (`vizij-rs/crates/animation/vizij-animation-core/src/accumulate.rs`).
- StoredAnimation JSON is parsed into canonical tracks with per-keypoint cubic-bezier transitions, then sampled through `sample_track` (`vizij-rs/crates/animation/vizij-animation-core/src/stored_animation.rs`, `vizij-rs/crates/animation/vizij-animation-core/src/sampling.rs`).
- `Engine::update` aggregates instance contributions, resolves binding handles, normalises quaternions, and emits both the per-player `Outputs` and an optional `WriteBatch` for typed-path sinks (`vizij-rs/crates/animation/vizij-animation-core/src/engine.rs:542`, `vizij-rs/crates/animation/vizij-animation-core/src/engine.rs:598`).
- Tests cover ID allocation, sampling (linear/step/bezier), quaternion normalisation, binding serialisation, StoredAnimation parsing, parity write-batch serialisation, and multi-player scenarios (`vizij-rs/crates/animation/vizij-animation-core/tests`).

### Engine adapters
- **WASM**: Wraps the engine, exposes `load_animation`, `load_stored_animation`, `prebind`, `update`, `update_nodes_writes`, and admin getters. JSON normalisation is confined here, and `update_nodes_writes` returns typed path + value pairs (`vizij-rs/crates/animation/vizij-animation-wasm/src/lib.rs`).
- **Bevy**: The plugin binds ECS entities to canonical handles, rebinds after hierarchy changes, and applies batched outputs via `bevy_vizij_api::WriterRegistry`. Non-typed writes fall back to direct `Transform` mutations (`vizij-rs/crates/animation/bevy_vizij_animation/src/systems.rs`).

### npm packages
- `@vizij/animation-wasm` handles browser/Node initialisation (URL vs filesystem loading), enforces ABI compatibility, and wraps the wasm class with an ergonomic `Engine` facade (`vizij-rs/npm/@vizij/animation-wasm/src/index.ts`).
- Top-level README documents install/build steps, API, inputs/outputs schema, and StoredAnimation expectations (`vizij-rs/npm/@vizij/animation-wasm/README.md`).

### React provider (`@vizij/animation-react`)
- Provider initialises the wasm engine, prebinds once, loads animations/instances, exposes context APIs (step, reload, player/instance management), and drives an optional RAF loop (`vizij-web/packages/@vizij/animation-react/src/index.tsx`).
- State stores latest values per key and per player, notifies subscribers, and forwards raw outputs through `onOutputs` for tooling.
- README highlights installation, usage, hooks (`useAnimation`, `useAnimTarget`), and describes value helpers—although only `valueAsNumber` is currently exported (`vizij-web/packages/@vizij/animation-react/README.md`).

### Demo studio (`vizij-web/apps/demo-animation-studio`)
- Bootstraps provider with presets and instance configs, collects event/values history, renders inspector widgets (charts, latest-values cards), and includes UI for prebind rule editing (currently disabled at provider level) (`vizij-web/apps/demo-animation-studio/src/App.tsx`, `vizij-web/apps/demo-animation-studio/src/components`).
- The `LatestValues` panel still logs every change to the console, producing noise during playback (`vizij-web/apps/demo-animation-studio/src/components/OutputsView/LatestValues.tsx`).

## Gaps & risks

### Core
1. **Vector accumulation** – `Value::Vector`, `Value::List`, and `Value::Array` fall into the `Step` bucket; they are never interpolated, so multi-sample blends produce last-writer wins (`vizij-rs/crates/animation/vizij-animation-core/src/accumulate.rs`).
2. **Binding lifecycle** – `Engine::prebind` must be called manually after loading new animations or changing resolver rules. The API does not surface whether prebinding covered all channels, nor does it auto-run when animations are added via the wasm/JS layer.
3. **Roadmap debt** – README still lists outstanding tasks (transition simplification, quaternion validation, TRS tests, zero-allocation assertions) with no tracking in code or CI.

### `@vizij/animation-wasm`
4. **Restarted init** – `init()` caches the wasm module but throws on ABI mismatch only after load. Consumers have no helper to guard before bundling (e.g., to check ABI in CI).
5. **StoredAnimation validation** – The wrapper relies on core parsing errors; it cannot report missing tracks or empty arrays with actionable messages before invoking Rust.

### React provider
6. **Prebind reuse** – The provider calls `prebind` only during the first load; reloading animations or adding new clips does not refresh bindings, so late-added animatable IDs remain unresolved (`vizij-web/packages/@vizij/animation-react/src/index.tsx:390`).
7. **Normalization drift** – Animations fed into the provider are assumed to be canonical; there is no optional hook to run them through the same StoredAnimation normaliser used by Rust (e.g., for shorthand values).
8. **Helper mismatch** – README advertises `valueAsVec3` and `valueAsBool`, but the package exports only `valueAsNumber`, leading to runtime `undefined` lookups (`vizij-web/packages/@vizij/animation-react/README.md:158`, `vizij-web/packages/@vizij/animation-react/src/index.tsx:921`).

### Demo studio
9. **Prebind editor wiring** – The `PrebindPanel` UI edits rule sets, yet the provider call is commented out, so the preview never takes effect (`vizij-web/apps/demo-animation-studio/src/App.tsx:525`).
10. **Console noise** – `LatestValues` logs every update, swamping developer tools and harming performance (`vizij-web/apps/demo-animation-studio/src/components/OutputsView/LatestValues.tsx:6`).
11. **Testing surface** – No automated tests cover the studio flows (prebind rules, transport commands, history window), leaving regressions undetected.

## Recommendations

1. **Add weighted interpolation for homogenous `Value::Vector`/`Value::List`/`Value::Array` channels** with graceful fallback when element counts differ. Update accumulator logic and add regression tests.
2. **Expose a binding audit** – return success metadata from `prebind` (e.g., list of unresolved channels) and have higher-level adapters surface warnings.
3. **Codify roadmap items** – port the README TODOs into tracked issues/tests: add explicit quaternion shortest-arc tests, TRS blending assertions, and zero-allocation guards in hot paths.
4. **Guard wasm ABI earlier** – export a lightweight `getExpectedAbi()` constant or preflight helper from `@vizij/animation-wasm` so build tooling can fail fast before instantiating the module.
5. **StoredAnimation linting** – add a JS-side validator (re-exporting the Rust parser is fine) that callers can run prior to upload, returning structured errors rather than raw parse strings.
6. **Re-run prebind after animation mutations** – make `AnimationProvider` invoke `prebind` whenever animations are (re)loaded or added, and consider exposing a manual `refreshBindings()` helper.
7. **Optional normalisation hook** – allow the provider (and demo) to run StoredAnimations through the wasm normaliser to catch stale shorthand data before queuing them.
8. **Align helper exports** – implement and export the documented helpers (`valueAsVec3`, `valueAsBool`, etc.) with unit tests, or trim the README to match reality.
9. **Wire the prebind panel** – feed `makeResolver(rules)` into the provider, detect collisions, and surface rule state in the UI so users can actually remap keys.
10. **Remove debug logging** – delete the console calls in `LatestValues` and the history collector; replace with optional dev toggles if needed.
11. **Add demo regression tests** – cover prebind rule application, transport commands (play/pause/loop), and history window trimming via Vitest/React Testing Library.

The implementation plan for these items will follow after the node graph actions are complete.

## Implementation plan

The following sequence attacks the recommendations in dependency order while balancing risk:

1. **Core interpolation & validation**
   - Extend `AccumEntry` to treat `Vector`/`List`/`Array` as numeric collections (per-item accumulation or averaged scalar) and add focussed tests in `accumulate.rs`.
   - Add targeted tests for quaternion shortest-arc normalisation and TRS blending accuracy; wire zero-allocation assertions into a benchmark-style test harness.

2. **Binding lifecycle improvements**
   - Update `BindingTable::upsert`/`prebind` to return a summary of unresolved channels; surface this through `vizij-animation-wasm` and log warnings in Bevy/React adapters.
   - Teach `Engine::add_instance`/`load_animation` to mark the binding cache dirty so adapters can automatically refresh via a new `refreshBindings()` helper.

3. **WASM + npm hardening**
   - Export `getExpectedAbi()` (static) and a thin `validateAbi()` helper from `@vizij/animation-wasm`; adopt it inside the React provider and demo before calling `init()`.
   - Re-export a JS-facing StoredAnimation validator that wraps the Rust parser, returning structured errors for UI consumption.

4. **React provider resilience**
   - Re-run `prebind` whenever animations are added/reloaded in `AnimationProvider`; expose an explicit `refreshBindings()` method for manual use.
   - Offer an optional `normalize` flag (default true) that routes animations through the wasm normaliser prior to engine load; document the behaviour.
   - Implement the documented helper exports (`valueAsVec3`, `valueAsBool`, etc.) with unit tests.

5. **Demo studio UX & tests**
   - Wire the `PrebindPanel` output into the provider, surface collision warnings, and add UI state reflecting active rules.
   - Strip debug logging from value cards and history collectors, replacing with an opt-in dev flag if desired.
   - Add Vitest-based coverage for prebind rule application, transport commands, and history window trimming.

Each milestone can merge independently; delivering them in order ensures downstream layers benefit from the improved core guarantees.
