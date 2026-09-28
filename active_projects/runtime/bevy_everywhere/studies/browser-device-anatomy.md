# The browser device is one wasm Arora runtime behind a JS store surface, mirrored into three.js by React
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,wasm,browser,arora-web,runtime-react,animation-module -->
> **Last updated:** 2026-09-28
> **Related documents:** [Central plan](../bevy_everywhere-plan.md)

## Findings

1. The browser device is `vizij-rs/crates/interop/vizij-arora-web`, a `wasm32`-only cdylib that composes `arora::Arora` (crates.io 9.11.1, `default-features = false`) over `BlackboardStore` + `RigHal` + a `ProcessingGraph` behavior and wraps it in `arora_web::AroraWeb` (6.1.0). No bridge is attached: the builder has `with_hal`, `with_data_store`, `with_behavior_interpreter`, `with_module` and nothing else (`crates/interop/vizij-arora-web/src/lib.rs:108-117`; versions `vizij-rs/Cargo.lock`).
2. The wasm exports are one class, `VizijArora` — `start`, `step`, `run`, `behaviorError`, `behaviorErrorChanged`, `call`, `loadGraph`, `applyGraphEdits`, `setValue`, `writeValues`, `readValues`, `snapshot`, `drainChanges` (`lib.rs:93-301`) — plus seven module-level registry functions: `mappings`, `mapping`, `profiles`, `profile`, `skills`, `skillSource`, `composeFace` (`lib.rs:380-529`). `stop()` and the wasm-side `running` getter that arora-web 6.1.0 added are **not** forwarded (`arora-sdk/crates/arora-web/CHANGELOG.md` 6.1.0; no `stop` in `lib.rs`), so a device handed to `run()` cannot be reclaimed from JS.
3. `@vizij/runtime` (2.4.0, `vizij-rs/npm/@vizij/runtime/src/index.ts`) is a thin typed wrapper: `init`, `startRuntime(graph?, input?, modules?)`, `class Runtime` with the same thirteen methods plus a JS-side `running` flag and `dispose`, and the seven registry functions with `standardProfiles`/`standardProfile` as deprecated aliases (`index.ts:258-552`). `loadGraph`/`applyGraphEdits` take a zero-dt step themselves when the runtime is not self-paced (`index.ts:349-351`, `366-368`). The wasm is built by `wasm-pack --target web` into `npm/@vizij/runtime/pkg` (`vizij-rs/scripts/build-arora-web-wasm.mjs:8`).
4. Two loop models exist and both run on the calling (main) thread: `run(periodMs)` hands the device to `Arora::run` under `wasm_bindgen_futures::future_to_promise`, pacing on `gloo_timers` sleeps (`arora-sdk/crates/arora/src/runtime.rs:644-660`), default 10 ms (`runtime.rs:52`); or the embedder calls `step(dtMs)` from `requestAnimationFrame`. Under `run()`, `step()` throws (`arora-web/src/lib.rs:245-247`). No consumer hosts the device in a Web Worker (no `new Worker` in `vizij-web/packages/@vizij/runtime-react` or `apps/*/src`).
5. ARORA-68 ("Make Arora::run portable to wasm32") is **Done** (Linear, completed 2026-07-20, PR semio-ai/arora-sdk#163). In code: `Arora::run` carries no target cfg (`runtime.rs:80`), the clock is `web_time::Instant` (`runtime.rs:27`), tokio's executor features are native-only by target cfg and the wasm metronome is `gloo-timers` (`arora/Cargo.toml:105-110`); arora-web 6.0.0 exposes `run` and 6.1.0 adds `stop`/`running`/`behaviorError` (its CHANGELOG). The "Web Worker" half of the ticket's title is an embedder choice nobody has exercised.
6. `@vizij/runtime-react` (`VizijRuntimeProvider.tsx`, 3,778 lines) uses `run()` at 1000/60 ms when `driveRuntime` is true (`src/engine/aroraEngine.ts:55`, `VizijRuntimeProvider.tsx:2209-2211`) and steps manually otherwise (`:2098-2100`). Its own JS loop — rAF when "active", `setInterval` at 30 fps visible-idle / 1 fps hidden-idle (`:3590-3652`) — only pumps: tweens, staged-input flush, `drainChanges`, listeners (`:3563-3588`).
7. Graph composition is JavaScript, not the wasm's `composeFace`: `composeGraphSpecs` unions rig, pose-driver, playing programs and the animations source, prefixing node ids `${sourceId}::` and leaving paths shared (`src/utils/composeGraph.ts:74-104`); every `params.path` is additionally prefixed `${namespace}/` (`VizijRuntimeProvider.tsx:376-420`). Recomposition diffs the two specs and patches the running graph with `applyGraphEdits`, falling back to `loadGraph` (`src/engine/graphSpecDiff.ts`, `aroraEngine.ts:231-242`). `composeFace` has no caller in runtime-react; its only consumers are the authoring e2e (`apps/vizij-authoring/e2e/profile-edition.workflow.pw.ts:5`) and the Node test.
8. Bundle extraction and neutral staging are JavaScript too: `loadGLTFWithBundle` from `@vizij/render` reads `VIZIJ_bundle` (`packages/@vizij/render/src/functions/load-gltf.ts:291,311`, `vizij-bundle.ts:5`); `mergeAssetBundle` picks the `rig`, `pose-driver`/`pose`, `motiongraph` entries and the glTF animation clips (`VizijRuntimeProvider.tsx:1020-1148`, `452-473`, `878-906`); `stagePoseNeutral` writes `pose.config.neutralInputs` through the rig input map (`:2741-2772`). The wasm-side equivalents exist unused in the browser: `Bundle::from_gltf_json`, `Bundle::compose`, `Bundle::neutral_stage_writes` (`crates/interop/vizij-arora-host/src/lib.rs:86,245,285`).
9. The value mirror is `drainChanges` → `applyEngineChangesRef` → `@vizij/render` store `setValues` → three.js: it drops `null` and `arora/*` built-ins, keeps only tracked output paths, converts with `valueJSONToRaw`, applies `transformOutputWrite`, and re-stages `rig/<face>/pose/control/<id>` outputs as inputs (`VizijRuntimeProvider.tsx:2645-2739`; `aroraEngine.ts:41-45`; `packages/@vizij/render/src/store.ts:181-198`). `VizijRuntimeFace` is `@vizij/render`'s `Vizij` canvas bound to the provider's `rootId`/`namespace` (`src/VizijRuntimeFace.tsx`; `render/src/vizij.tsx:47`).
10. Input constraints come from the rig spec's `metadata.vizij.inputs` and `rig.inputMetadata` (`VizijRuntimeProvider.tsx:243-296`); `resolveFaceControls` maps them to gaze/blink controls by known path families (`src/utils/faceControls.ts:195-482`).
11. The animation module runs as a **separate wasm guest**, not linked into the device: `@vizij/animation-module` ships `artifact/vizij_animation_module.wasm` (a `wasm32-wasip1` build, 284,842 bytes) with its header inlined; the browser entry fetches the bytes (`npm/@vizij/animation-module/src/browser.ts:12-19`), runtime-react passes `{headerJson, wasmBytes}` as `modules` to `startRuntime` (`VizijRuntimeProvider.tsx:1904-1933`, `aroraEngine.ts:172`), `VizijArora::start` loads it with `builder.with_module` (`lib.rs:112-114`), and arora's `BrowserExecutor` instantiates it through the browser's `WebAssembly` API with WASI stubs (`arora-sdk/crates/arora-engine/src/executor/browser/mod.rs:1-12`). The module set is fixed at build, so a changed set rebuilds the device (`aroraEngine.ts:14-19,187-207`). The native `vizij` app instead links it as a host module (`crates/vizij/Cargo.toml:71-74`).
12. Clip transport is `device.call` against that module — `load_animation`/`create_player`/`add_instance`/`play`/`pause`/`stop`/`seek`/`set_speed`/`set_loop`/`set_weight` (`src/engine/animationModuleHost.ts`, `src/engine/animationModule.ts:316-441`); the composed "animations" source steps it off `arora/dt` and applies `[TrackOutput]` with a path-less `output` node, and `player_states` feedback lands at `vizij/animations/players` (`animationModule.ts:460-520`). Programs are graph sources added/removed by `playProgram`/`stopProgram` (`VizijRuntimeProvider.tsx:3327-3451`). `animateValue` tweens stay in JS (`:2879-2961`).
13. `vizij-arora-web` on current `main` compiles for `wasm32-unknown-unknown` (`cargo check`, 2 m 44 s cold). The wasm graph it proves: arora 9.11.1, arora-web 6.1.0, arora-engine, arora-behavior, arora-behavior-tree(+types), arora-bridge 4.1.0, arora-hal 3.0.0, arora-simple-data-store 2.0.0, arora-buffers, arora-types, tokio (`sync` only), gloo-timers, web-time, and the vizij interop crates. The crates that are **not** on wasm are the bridges: `arora-bridge-ws` (tokio net + tungstenite), `arora-bridge-ros2`, and `arora-studio-bridge-client` (firestore/gcloud/reqwest/zenoh; `studio-bridge/device-client/Cargo.toml` has no wasm target section — only the Studio-side `studio-client` and `msgs` do).
14. Therefore the JS surface is the browser device's only bridge, and today it reaches Studio only through a **native second process**: the standalone mirrors the webview device's store into a native `SimpleDataStore` (`publish_values` every 50 ms; `apps/vizij-standalone/src/hooks/useWebSocketSync.ts:345-425`) that feeds a second, native `arora` run carrying the WS/ROS 2 bridges, the gaze and TTS host modules and the skills interpreter (`src-tauri/src/lib.rs:631-700`), while the Studio bridge runs on its own thread (`src-tauri/src/host.rs:1-10`); writes come back as the `update-values` event (`useWebSocketSync.ts:246-300`). Semio Studio's `apps/vizij-app` does not use the browser device at all: a native `arora` 9.11 with the `studio-bridge` feature drives a `VizijHal` that emits `device:values` to the three.js webview (`semio_studio/apps/vizij-app/src-tauri/src/lib.rs:1-5`, `hal.rs:14-17`, `src/use-synced-data.ts:44-70`; no `@vizij/runtime*` import).
15. The published `pkg/` in the working tree (2026-07-31) is older than the source (2026-09-09): the Node tests `smoke`, `apply-graph-edits`, `animation-module`, `compose-face` pass against it, while `registries` fails because the built JS still exports `standardProfile(s)` and not `mapping(s)`/`profile(s)` (logs in the spike folder).
16. The browser device carries no TTS: `vizij-arora-tts` needs `reqwest` + `rodio` + tokio `rt-multi-thread` (`crates/interop/vizij-arora-tts/Cargo.toml`) and is only attached in the native `vizij` app and in the standalone's native run. `tutorial-agent-face` therefore speaks through its own JS (`@google/genai`) and only writes `/speech/*` inputs to the device (`apps/tutorial-agent-face/src/utils/speechRuntime.ts`).

## Questions answered

**Q1 — JS API, wasm exports, loop model, ARORA-68.** Findings 1–5. Wasm: 13 `VizijArora` methods + 7 registry functions; JS: `init`, `startRuntime`, `Runtime` (13 methods + `running` + `dispose`), the 7 registry functions, deprecated aliases, `toValueJSON` re-export. Loop: self-paced `run()` (10 ms default, JS timer metronome, main thread, irreversible from JS) or `step(dt)` from rAF. ARORA-68 is Done; `run()` is portable; no Worker host exists.

**Q2 — runtime-react around the device.** Findings 6–12. Bundle extraction, composition, namespacing, neutral staging, the mirror and the controls are all JavaScript on top of the store surface; the wasm's `composeFace`/`Bundle` are unused by it. The animation module is a separate `wasm32-wasip1` guest fetched by JS and registered at `startRuntime`, executed by arora's browser executor inside the device; transport is `device.call`.

**Q3 — React API surface and consumers.** See the tables in Evidence. Seven apps/packages import `@vizij/runtime-react`; `useRigInput`, `useVizijOutputs` and `resolveRuntimeUpdatePlan` have no consumer outside the package; `useOptionalVizijRuntime` has one.

**Q4 — wasm32 compile status and bridges.** Finding 13–14. `arora` (no default features), `arora-web`, the engine's browser executor, HAL/store/behavior/bridge *traits* and the vizij interop crates compile; no `Bridge` implementation does. The JS surface is the bridge; Studio is reached only via a native host process holding `arora-studio-bridge-client`.

**Q5 — one wasm module (device + view).** See "Implications for the target picture".

## Evidence

### The JS surface (`npm/@vizij/runtime/src/index.ts` → `crates/interop/vizij-arora-web/src/lib.rs`)

| JS (`Runtime` / module) | wasm export | lib.rs | Notes |
|---|---|---|---|
| `init(input?)` | wasm-bindgen `default()` | — | memoized; static import of `pkg/vizij_arora_web.js`, URL fallback (`index.ts:195-220`) |
| `startRuntime(graph?, input?, modules?)` | `VizijArora.start(graph_json?, modules?)` | 93–125 | builds the device; `modules` = `{headerJson, wasmBytes}[]` |
| `step(dtMs)` | `step(dt_ms)` | 131 | throws under `run()` |
| `run(periodMs?)` | `run(period_ms?)` → Promise | 142 | resolves never, rejects on runtime failure |
| `running` (JS flag) | *(wasm getter not forwarded)* | — | `index.ts:302` |
| `behaviorError`, `behaviorErrorChanged()` | same | 151, 161 | arora 9.1 standing error |
| `call(call)` | `call(call_json)` | 176 | module id inferred from loaded headers (`:179-187`); lands at next step |
| `loadGraph(spec)` | `loadGraph` | 200 | engine LOAD via `LocalCaller` (VIZ-57) |
| `applyGraphEdits(diff)` | `applyGraphEdits` | 220 | engine EDIT (VIZ-79) |
| `setValue`, `writeValues` | same | 268, 277 | vizij shorthand normalized to arora `Value` serde (`:355-373`) |
| `readValues`, `snapshot`, `drainChanges` | same | 285, 291, 299 | sibling store handle + subscription; first drain = whole state |
| `dispose()` | `free()` | — | |
| `mappings()`, `mapping(id, rigPrefix)` | same | 381, 393 | `vizij_arora_host::mappings` |
| `profiles()`, `profile(id, rigPrefix)` | same | 409, 424 | `vizij_arora_host::profile` |
| `skills()`, `skillSource(id)` | same | 439, 452 | `vizij_arora_host::skills` |
| `composeFace(gltf, options?)` | same | 481 | `Bundle::compose` with ROS4HRI default on, animations off |
| — | `stop()`, `running` | arora-web 6.1.0 only | not exposed by vizij-arora-web |

### The React surface (`packages/@vizij/runtime-react/src/index.ts`, `types.ts`) and its consumers

Provider props (`types.ts:364-386`): `assetBundle`, `namespace`, `faceId`, `updateTier`, `autoCreate`, `autostart`, `driveRuntime`, `mergeStrategy`, `onRegisterControllers`, `onStatusChange`, `transformOutputWrite`.

Context value (`types.ts:297-362`): status (`loading`, `ready`, `error`, `errors`, `namespace`, `faceId`, `rootId`, `outputPaths`, `stepHz`, `controllers`), `assetBundle`, `setInput`, `getValueSnapshot`, `getStoreSnapshot`, `subscribeToStoreChanges`, `subscribeToStep`, `setGraphBundle`, `setValue` (renderer store), `stagePoseNeutral`, `animateValue`, `cancelAnimation`, `registerInputDriver`, `playAnimation`, `pauseAnimation`, `seekAnimation`, `setAnimationLoop`, `getAnimationState`, `stopAnimation`, `playProgram`, `pauseProgram`, `stopProgram`, `getProgramState`, `setAnimationActive`, `isAnimationActive`, `step`, `inputConstraints`.

| Export | Consumers (vizij-web) |
|---|---|
| `VizijRuntimeProvider` | demo-vizij-player `App.tsx`; tutorial-agent-face `FaceApp.tsx`; tutorial-fullscreen-face `FaceApp.tsx`; vizij-authoring `Viewer.tsx:685` (`autostart`, `transformOutputWrite`), `ReferenceFaceRuntime.tsx:303` (`autostart`, `driveRuntime`), `emptyStateDemo/EmptyStateDemo.tsx`; vizij-showcase `ShowcaseRuntime.tsx`; vizij-standalone `App.tsx:273` (`autostart`, `driveRuntime`) |
| `VizijRuntimeFace` | player `App.tsx`; agent-face and fullscreen `FaceApp.tsx`; authoring `RuntimeFaceFrame.tsx:69`, `Viewer.tsx:738`; showcase `RuntimeFaceFrame.tsx`; standalone `App.tsx` |
| `useVizijRuntime` | ~45 files across the six apps; heaviest: authoring `Viewer.tsx` (8 call sites), motiongraph hooks (`setGraphBundle`, `playProgram`, `stopProgram`, `subscribeToStep` + `getValueSnapshot`), standalone `useWebSocketSync.ts` (`getStoreSnapshot`, `subscribeToStoreChanges`, `setInput`, `inputConstraints`) |
| `useOptionalVizijRuntime` | authoring `hooks/useAnimationTransport.ts` only |
| `useRigInput`, `useVizijOutputs`, `resolveRuntimeUpdatePlan` | none outside the package |
| `resolveFaceControls`, `mapNormalizedControlValue`, `mapUnitControlValue` | player `FaceControlsPanel`; agent-face `useAgentFaceTools`, `useIdleGazeBehavior`, `useMouseGaze`; fullscreen `useMouseGaze`; authoring `useDemoIdleGaze`, `useDemoMouseGaze`; showcase `useIdleGazeBehavior`, `useMouseGaze` |
| `buildRigInputPath` | authoring (11 files), agent-face (`useSpeechGraphTopics`, `speechRuntime`), standalone `useSpeechController`, `packages/@vizij/node-graph-authoring`, `packages/@vizij/speech-react` |
| `resolvePoseMembership` | authoring `poseRig/*` (6 files), `SpeechPanel`, `useSpeechPlayback`; standalone `useSpeechController`; speech-react |
| `buildPoseWeightPathMap`, `getPoseSemanticKey`, `resolvePoseSemantics`, `filterPosesBySemanticKind`, `buildSemanticPoseWeightPathMap`, `*_POSE_KEYS` | player `PosePanel`; agent-face/fullscreen/showcase `usePoseHotkeys`, `useVisemeMouth`, `VoicePanel`, `EmotionButtons`, `PoseButtonPanel`; authoring `DemoEmotionRow`, `poseRig/*` |

Direct `@vizij/runtime` consumers: authoring `hooks/useSkills.ts` (`skills`, `skillSource`), `hooks/useStandardProfiles.ts` (`standardProfile(s)`), `e2e/profile-edition.workflow.pw.ts` (`composeFace`, `startRuntime`); standalone `components/EndpointsPanel.tsx` (`skills`).

### What compiles for wasm32 (spike: `cargo check -p vizij-arora-web --target wasm32-unknown-unknown`)

| Crate (version) | wasm32 | Why |
|---|---|---|
| arora 9.11.1, `default-features = false` | yes | browser executor by target cfg (`arora/src/lib.rs:620-626`); tokio `sync` only; gloo-timers metronome |
| arora-web 6.1.0 | yes | wasm32-only crate; tokio `sync` only (`arora-web/Cargo.toml:29`) |
| arora-engine (no default features), arora-buffers, arora-types, arora-behavior, arora-behavior-tree, arora-hal 3, arora-bridge 4.1 (traits), arora-simple-data-store 2 | yes | in the checked graph |
| vizij-arora-{store,hal,behavior,host}, vizij-graph-core, vizij-api-core | yes | in the checked graph |
| arora-bridge-ws | no | tokio `net`/`rt-multi-thread`, tokio-tungstenite (`Cargo.toml:18-19`) |
| arora-bridge-ros2 | no | DDS/Zenoh |
| arora-studio-bridge-client (`studio-bridge/device-client`) | no | firestore, gcloud-sdk, reqwest; no wasm cfg |
| vizij-arora-tts, vizij-piper | no | reqwest + rodio + tokio rt-multi-thread |
| vizij-animation-module | as a `wasm32-wasip1` guest | loaded through the engine, not linked |

The raw outputs of the `cargo check` and the Node tests are not kept; the command above and the Node tests named in finding 15 reproduce them.

### How a value travels today (browser)

`setInput` (React) → `stagedInputsRef` → pump `flushStagedInputs` → `device.setValue` (sibling store handle) → next `step`: HAL readings, bridge events (none), behavior tick (the composed graph, `ExternalFunction` nodes calling the animation guest) → store flush → `RigHal::write` (no-op sink) → pump `drainChanges` → tracked-output filter → `valueJSONToRaw` → `transformOutputWrite` → `@vizij/render` `setValues` → three.js. The device never pushes; every consumer polls the drain at the pump cadence.

## Implications for the target picture

If the device and the Bevy view become one wasm module (a cdylib exporting today's runtime API plus `mount(canvas)`):

- **Preserved verbatim.** Everything in the JS-surface table: `init`/`startRuntime`, the thirteen `Runtime` methods, `dispose`, and the seven registry functions. None of them touches a renderer; they are functions of `arora`, `arora-web::store_json` and `vizij-arora-host`, which all already compile for wasm32 (finding 13). Add `stop()` and forward the wasm `running` getter while at it (finding 2).
- **What runtime-react no longer needs to do.** The mirror (`applyEngineChangesRef`, tracked-output sets, `valueJSONToRaw`, `transformOutputWrite`, the pose-control re-staging), the `@vizij/render` store and `VizijRuntimeFace`, the GLB load through three.js (`loadGLTFWithBundle`), and the JS composition/namespacing/diff can all go, because the view reads the same store the device writes. What still has to exist *somewhere* is: bundle metadata for the UI (programs, clips, pose config, input constraints) — `composeFace`/`Bundle` already provide the graphs, so this is a `describe(gltf)` export away; the `ExternalFunction` animation source and clip transport — unchanged if the module stays a guest, or absorbed if it is linked as a host module as the native app does (`crates/vizij/Cargo.toml:71-74`), which also removes the "module set fixed at build" rebuild (finding 11).
- **Namespacing is a browser-only convention.** runtime-react prefixes every store path with `${namespace}/` (`VizijRuntimeProvider.tsx:376-420`); the native app and `composeFace` do not. One module serving native and browser must drop the prefix or the view will not find its keys — a compatibility break for every consumer that builds paths with `namespace/…` (standalone `useWebSocketSync.ts:145-146`).
- **Loop ownership changes.** With Bevy in the same module, the view's frame loop (winit on rAF) and the device's `run()` metronome (setTimeout) would coexist on one main thread; stepping the device from the view's frame schedule (today's `step(dt)` mode) is the simpler contract, and it keeps the suspension re-baseline that `run()` loses (`aroraEngine.ts:147-152`).
- **Minimal JS contract per consumer, grounded in what they call today:**
  - *(a) Authoring app* (`Viewer.tsx`, `ReferenceFaceRuntime.tsx`, motiongraph hooks, `useSkills`, `useStandardProfiles`): `startRuntime`/`loadGraph`/`applyGraphEdits` (for `setGraphBundle` recompositions), `setValue`/`writeValues` (sliders, `InputValueBridge`), `readValues`/`snapshot` + a per-step notification (`MotionGraphValueSampler` samples after each step), `call` (clip transport), the registries, `composeFace`, `behaviorError`, `mount`/`unmount`. Its `transformOutputWrite` output-lock (`runtimeOutputLocks.ts`) intercepts renderer writes; with the view reading the store directly, locks must become store-side (an override input, or a device-side mask) — open question.
  - *(b) Player-type demos* (`demo-vizij-player`, `tutorial-fullscreen-face`, `vizij-showcase`): `startRuntime` (over `composeFace`), `setValue` (gaze, hotkeys, sliders from `resolveFaceControls` + `inputConstraints`), `call` (animation and program transport), `readValues` (`vizij/animations/players` for `getAnimationState`), a bundle summary (`describe`), `mount`.
  - *(c) Agent demo* (`tutorial-agent-face` today; the standalone folder's future): `setValue` for `/speech/*` topics and gaze, JS-side tweens over `setValue` (or a device-side tween), `call` for programs and for the `say` skill — which requires a TTS provider inside the browser device that does not exist today (finding 16): the cloud provider's `reqwest`/`rodio` would need a `fetch`/Web Audio backend, or `say` is served by the agent side and only visemes are written.

## Implications for the plan

- A "browser device" work item starts from a compiling base: the whole device graph is already on wasm32, and the JS surface needs no redesign. The plan can budget the browser step as *adding* the view to `vizij-arora-web` (or `vizij` to wasm) rather than porting the device.
- Retire `@vizij/render`'s role in runtime-react only after a `describe`-style export replaces `mergeAssetBundle`'s metadata (programs, clips, poses, input constraints); the six apps read `assetBundle.*` in ~30 places.
- Decide the namespace convention before touching consumers: the standalone's native mirror, the authoring app and speech-react all build `namespace/rig/<faceId>/…` paths.
- The standalone's second native device disappears with the Bevy app: its WS/ROS 2/Studio bridges, gaze and TTS host modules and skills interpreter (`src-tauri/src/lib.rs:631-700`) are exactly what the native `vizij` app already composes. The agent demo then needs a browser-side way to reach a bridge, or none (an in-page agent talks to the device through the JS surface directly).
- Semio Studio's `apps/vizij-app` never consumed the browser device; consuming the Bevy view as a library there is a fresh integration (native `arora` + `studio-bridge` already there), not a migration.
- Refresh `npm/@vizij/runtime/pkg` (or CI-build it) before relying on the Node tests as a gate; the checked-in build lags the source by six weeks.

## Open questions

- Should the device's `stop()` (arora-web 6.1.0) be forwarded so a self-paced browser device can be reclaimed, or does the one-module design step the device from the view's frame loop and drop `run()` in the browser?
- Where do output locks live once the view reads the store directly (authoring `transformOutputWrite`)?
- Can a `say` provider run in the browser device (a `fetch`-backed cloud provider with Web Audio playback), or does the agent demo keep speech agent-side and write visemes only?
- Does the one-module design load the animation module as a host module (as native does) or keep the wasip1 guest fetched by JS? The former removes a 285 kB fetch and the device-rebuild path; the latter keeps one artifact for every Arora runtime.
- Is the `namespace/` path prefix retired, or does the Bevy view learn to read namespaced keys for multi-face pages (showcase mounts several providers)?
