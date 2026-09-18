# How Semio Studio consumes a Vizij face today, and which shapes a Bevy view can take there
<!-- tags: family=project; type=reference; project_status=proposal; topics=studio,vizij-app,tauri,bevy,wasm,scene,studio-arora,render -->
> **Last updated:** 2026-09-16
> **Related documents:** [Central plan](../bevy_everywhere-plan.md) · [Native app anatomy](native-app-anatomy.md) · [Standalone anatomy](standalone-anatomy.md) · [Web render anatomy](web-render-anatomy.md) · [Browser device anatomy](browser-device-anatomy.md)

Paths are repo-relative; `semio_studio` is the default repo, read on branch
`chore/vizij-app-update` at `1c002e17` (the content of PR
[#411](https://github.com/semio-ai/semio_studio/pull/411), merged to GitHub
`main` on 2026-09-14; the local `main`/`origin/main` refs of this checkout
predate that merge and still show the pre-port `vizij_controller.rs`). Registry
sources are quoted as `<crate>-<version>/path` (the `~/.cargo/registry` copy of
what each `Cargo.lock` resolves). The stand-alone test and raw outputs live under
`/private/tmp/claude-501/-Users-victor-paleologue-Code-Semio-semio-studio/3db729c2-88a1-4330-986e-37ae26376064/scratchpad/spikes/studio-consumers/`.

## Findings

1. **`apps/vizij-app` is an Arora device whose hardware is the webview and whose
   bridge is the Semio Studio connection.** `src-tauri/src/lib.rs:1-5,104-162`:
   `run_device` spawns an `arora-device` thread with its own tokio runtime
   (`lib.rs:81-98`), `serve` calls `arora::studio::connect()` (`:112`), reads the
   device info Studio holds (`bridge.get_device_info()`, `:119`), registers
   (`update_device_info`, `:132-135`), then runs
   `Arora::builder().with_hal(VizijHal).with_bridge(bridge)` at
   `DEFAULT_STEP_PERIOD` (`:147-154`; 10 ms, `arora-9.11.1/src/runtime.rs:52`).
   Dependencies are crates.io only: `arora 9.11` with `default-features = false,
   features = ["studio-bridge"]`, `arora-bridge 4`, `arora-hal 3`, `arora-types 2`
   (`src-tauri/Cargo.toml:22-25`); the lock resolves arora 9.11.1, arora-bridge
   4.1.0, arora-hal 3.0.0, arora-studio-bridge-client 6.1.0, tauri 2.11.5, tao
   0.35.3, wry 0.55.1.
2. **The HAL is a write-through mirror: every runtime write is held and emitted to
   the webview as a `device:values` event; nothing ever flows back as a reading.**
   `src-tauri/src/hal.rs:17` (`VALUES_EVENT`), `:45-55` (`apply_write` holds the
   `StateChange` and `app.emit`s it), `:76-83` (`write`/`try_send` both go
   through it), `:64-74` (`read`/`read_all` answer from the held state), `:22-25,
   85-89` (`updates()` hands out a stream that never yields). The runtime feeds
   the HAL its coalesced per-step outbound change minus sensor-applied keys
   (`arora-9.11.1/src/runtime.rs:517-536`); a Studio `BridgeOp::Update` is a
   store write (`runtime.rs:308`) and so reaches the webview one step later.
3. **The face's GLB is not served to Studio, by construction and by runtime.**
   `VizijHal` implements `Hal` only — no `HalAssets` (`grep HalAssets
   src-tauri/src/*.rs`: none). `arora-9.11.1/src`, `arora-bridge-4.1.0/src` and
   `arora-studio-bridge-client-6.1.0/src` contain no call to `model_glb` or use of
   `HalAssets`; the only `.describe()` calls in arora are on operator
   `AccessRequest`/summaries (`operator.rs:128,198,205,290`, `tui/mod.rs:156`),
   never on the HAL. `HalAssets::model_glb` is an optional extension trait
   (`arora-hal-3.0.0/src/lib.rs:119-122`) that only `FakeHal` implements.
4. **The webview loads the GLB itself and renders it with Studio's own three.js
   package `vizij`.** `src/content.tsx:164-172` (Tauri `open` dialog, gltf/glb),
   `:178-191` (`plugin-fs` `readFile` → `File`), `:98` (`readAsDataURL`), `:62-67`
   (`loadGLTF(dataUrl, ["default"], false, safeArea)`), `:69` (`addWorldElements`),
   `:215` (`<Vizij rootId>`); the file stem becomes the device `name` and
   `model_family` (`:79-84`). Layout (safe area) and background are local UI state
   (`:36-41, 277-335`). `src/App.tsx:8,18` creates the `vizij` store and provides
   `VizijContext`.
5. **Studio→face values are matched by animatable output name; the mapping of
   Studio's actual write keys is unverified.** `use-synced-data.ts:48-64` listens
   to `device:values`, looks each `set` key up in `nameToIdMap`, decodes the
   tagged `Value` (`:29-41`: numbers, bools, strings, 2/3-vectors) and writes
   `useValuesStore.updateValues` under `getLookup("default", id)`; `unset` is a
   TODO (`:60`). `nameToIdMap` is keyed by `animatable.pub.output` else
   `animatable.name` (`content.tsx:121-131`). Studio's device commander writes
   `${animatable.id}.studio_value`, `${animatable.id}.target_position`,
   `${animatable.id}.target_velocity`
   (`apps/studio/src/store/subscriptions/device-subscriptions.ts:431-449`) and
   `common.target_trajectory` (`:155-157`). No test exercises the pair; PR #411
   states the path was not run end to end.
6. **Device info is layered defaults → Studio-held → form, and the device restarts
   on every info change.** `src-tauri/src/device_info.rs:23-32` (defaults:
   "Vizij App", `model_family` "vizij", `hardware_version` "generic-screen"),
   `:35-56` (`merged_with`), `:60-90` (`registration()` requires `name`,
   `model_family`, non-blank `owners`); `src/device-info-context.tsx:75-88`
   (`invoke("update_device_info")` on each change, which stops the device —
   `lib.rs:43-51`) and `:91-105` (auto `invoke("run_device")` whenever not running
   and no fatal error; the initial fatal error "No Vizij model loaded" gates the
   first start on a loaded GLB). The identity file defaults to
   `<app_data_dir>/studio_refresh_token` (`lib.rs:199-208`) so this face is a
   device of its own next to arora's default `<app data>/refresh_token`
   (`arora-9.11.1/src/studio/mod.rs:24-25,202-206`).
7. **Nothing builds the app in CI and it has never been initialised for mobile.**
   `.github/workflows/*.yml` mention neither `vizij-app` nor `tauri` (grep: no
   hits); `package.json:29` only excludes it from `dev:storybook`. `src-tauri/gen`
   holds `schemas` only (no `gen/android`) although `lib.rs:180` carries
   `#[cfg_attr(mobile, tauri::mobile_entry_point)]`; `tauri.conf.json` bundles
   `"targets": "all"` for desktop.
8. **`packages/vizij` and `@vizij/render` were born the same day and have never
   been synced.** semio_studio `3e7846e1 2025-01-09 "added vizij package"`
   (`packages/vizij`) and vizij-web `606e641c 2025-01-09 "added vizij package"`
   (`packages/render`, an ancestor of vizij-web `main`), same author, different
   content (`git patch-id`: `0af8d514…` vs `08a1e8f9…`); vizij-web moved it to
   `packages/@vizij/render` in `136159e8 2025-10-23 "Reorganize vizij packages"`
   and squashed history at `b94d2bee 2025-12-05`. Studio's files trace further
   back through renames to the `viz-3d` package (`git log --follow
   packages/vizij/src/store.ts`: `e5ef7349 2024-06-22`, `64afa219 2024-07-01
   "Renamed viz-__ folders"`). Since then 79 commits on Studio's side, 31 under
   the vizij-web path. Trees today: 52 vs 54 files, 42 differ, 5 only in Studio,
   7 only in vizij-web, 5 identical.
9. **The divergence is structural, not cosmetic: Studio's package owns no runtime
   values and exposes a writer seam.** Studio: values live in `@semio/utils`
   `useValuesStore` (`packages/utils/src/values-store.ts:119`), `useFeatures`
   subscribes to it (`packages/vizij/src/hooks/use-features.ts:66`),
   `VizijValueWriterContext`/`useVizijValueWriter` mirror
   `SceneValueWriterContext` (`context.ts:18-30`, `hooks/use-vizij-value-writer.ts`,
   `packages/scene/src/context.ts:18-30`), plus `VizijCore` and optional-context
   helpers (`vizij.tsx`, `utils/context-providers.tsx`). vizij-web: `values` and
   `setValue`/`setValues`/`hoveredElement` live in the store
   (`store-types.ts` diff), `SelectionGlowEffect`, `vizij-bundle.ts`,
   `extract-animations.ts`, `exportable-bodies.ts`, `parseGlbJsonChunk`
   (`load-gltf.ts`); three/r3f/drei/zustand are peer dependencies
   (`package.json`) where Studio declares them as dependencies. Export lists:
   Studio `index.tsx` = vizij, store, store-types (types), types, context, four
   store hooks, the value-writer hook, load-gltf, load-gltf-blob; vizij-web adds
   `use-features`, `export`, `vizij-bundle`.
10. **Every Studio consumer of `vizij`, and what it takes** (`grep from "vizij"`):
    `apps/studio/src/providers/studio.tsx:5,68-84` — `VizijValueWriterContext`,
    `VizijValueWriter` (routes writes into the animation-aware `setValue`);
    `apps/studio/src/components/modals/upload-face-modal.tsx:5,27-29,50-52,65-72,239-244`
    — `VizijContext`, `Vizij`, `createVizijStore`, `useVizijStore`, `loadGLTF`,
    `Group`, then `@semio/scene`'s `exportGLTF` of the live three.js root (`:110`)
    is what gets saved as the asset; `packages/scene/src/types/world.ts:1,9-12` —
    `Ellipse`, `Group`, `Rectangle` in the scene `World` union;
    `packages/scene/src/functions/get-children-ids.ts:2,19-26` — `Group`;
    `packages/scene/src/renderables/screen.tsx:13,207-223` — `InnerVizij`,
    `VizijContext`, `VizijStore`; `packages/core/src/hooks/use-project-full-context.ts:5,481-484`
    — `loadGltfFromBlob` for `assetType === "face"`; `apps/docs/stories/{vizij,
    vizij-import,scene}.stories.tsx`, `prebuilt/quori.ts` — `Vizij`, `VizijContext`,
    `createVizijStore`, `useVizijStore`, `loadGLTF`, types; `apps/vizij-app`
    (Finding 4).
11. **The face on a screen inside the Studio scene is drawn in the scene's own
    WebGL context, into a render texture, from the scene store.**
    `packages/scene/src/renderables/screen.tsx:204-226`: a `Plane` whose
    `meshStandardMaterial.map` is a drei `RenderTexture` hosting `InnerVizij`,
    with the scene store cast as the vizij store (`:207`; structurally compatible —
    `packages/scene/src/store-types.ts:13-15`), sized by `width × height ×
    resolution` (`types/screen.ts:21-23`), selection-synced (`:197`), one r3f
    `Canvas` for the whole scene (`packages/scene/src/scene.tsx:222`). Its values
    come from `useValuesStore`, which Studio's player, derived tracks and device
    feedback all write (`device-subscriptions.ts:31,386`,
    `namespace-subscription.ts:89`).
12. **`crates/vizij` is a binary with no library and no wasm target today.**
    `vizij-rs/crates/vizij/Cargo.toml` has no `[lib]`; `src/main.rs` is the only
    entry; no `wasm32` cfg anywhere under `crates/vizij` (grep). "Consumed as a
    library" presupposes the `vizij-view` split (native-app-anatomy Finding 16).
13. **A native Bevy window cannot be opened from a Tauri app on macOS: both
    toolkits demand the process main thread and both block it.** tao panics off
    the main thread (`tao-0.35.3/src/platform_impl/macos/event_loop.rs:166-167`);
    Tauri's `Builder::any_thread` is `cfg(any(windows, target_os = "linux"))` and
    documents "on macOS the application must be executed on the main thread"
    (`tauri-2.11.5/src/app.rs:1630-1638`); `App::run` blocks (`:1366`),
    `run_return` blocks until exit (`:1405`), `run_iteration` is deprecated as a
    busy loop (`:1466-1471`). winit panics off the main thread on macOS
    (`winit-0.30.13/src/platform_impl/macos/event_loop.rs:220-221`; policy in
    `src/event_loop.rs:88-95`), `with_any_thread` exists for Windows/X11/Wayland
    only (`src/platform/{windows.rs:174,x11.rs:122,wayland.rs:61}`); bevy_winit
    builds the `EventLoop` inside `WinitPlugin::build` and its `run_on_any_thread`
    "Only works on Linux (X11/Wayland) and Windows"
    (`bevy_winit-0.19.1/src/lib.rs:73-128`); the runner calls
    `event_loop.run_app` and never yields (`src/state.rs:885-913`). Android
    doubles the conflict: Bevy needs `#[bevy_main]` → `android_main(AndroidApp)`
    (`bevy_derive-0.19.1/src/bevy_main.rs:18-21`, `bevy_winit lib.rs:118-124`)
    while Tauri's entry is `android_binding!` over wry + tao
    (`tauri-2.11.5/src/lib.rs:132-141`, `tauri-macros-2.6.3/src/mobile.rs:80`).
14. **Bevy 0.19 renders offscreen on a secondary thread on macOS when `WinitPlugin`
    is disabled** (stand-alone test, Evidence below): the snapshot/headless recipe
    (`ScheduleRunnerPlugin`, camera → `COPY_SRC` target image, `Readback`) run on a
    spawned thread initialises Metal (`Apple M1`), delivers a readback whose corner
    is the camera's red clear color and whose centre is the lit green cube, drops
    the `App` in 157 ms and exits the process cleanly
    (`scratchpad/spikes/studio-consumers/bevy-offthread/run2.log`). The main-thread
    rule in Finding 13 is winit's and tao's, not wgpu's or Bevy's schedule.
15. **`--studio` in the Bevy app is the same connection the Tauri app makes, minus
    the operator UI.** `vizij-rs/crates/vizij/src/device.rs:155-161` calls
    `arora::studio::connect()` (env-only registration —
    `arora-9.11.1/src/studio/mod.rs:168-182`) exactly as `lib.rs:112`; identity
    storage is arora's in both (`IDENTITY_FILE`). The Bevy app has no device-info
    UI, no native file dialog, no egui: `egui` appears in no `Cargo.toml` of
    vizij-rs (grep), while ros-viz-rs carries `bevy_egui = "0.39"` for its panel
    (`ros-viz-rs/Cargo.toml:13,87`) and ships dmg/deb/rpm/exe plus an Android
    `NativeActivity` build (`README.md:52-54`, `android/app/build.gradle:32-37`).
16. **`studio-arora` is not on `main`; it lives on draft PR #256 as a wasm
    `cdylib + rlib` that spawns many `FakeHal` devices over one shared store.**
    `git ls-tree main packages/studio-arora` is empty; the checkout holds only an
    untracked `packages/studio-arora/.turbo`. Branches: `feat/studio-arora`
    (2026-06-29), `feat/studio-arora-engine` (2026-07-06),
    `feat/studio-arora-combined` (`6de0a8ec` 2026-07-22, "migrate to arora 9.1") =
    [PR #256](https://github.com/semio-ai/semio_studio/pull/256) (open, draft).
    On that branch: `Cargo.toml` `[lib] crate-type = ["cdylib", "rlib"]`, arora
    crates by `git … branch = "main"`, `arora` `default-features = false` on
    wasm32 only; `package.json` builds with `wasm-pack --target web` into `pkg/`;
    `src/world.rs:31-45` (`World::spawn(id, HalDescription, model_glb)` →
    `FakeHal` + `DeviceStore` namespaced `<id>/…`), `src/device.rs:24-33`,
    `src/engine.rs:1-60` (wasm32-only real `arora::Arora` per device over a
    `NamespacedStore`, `FakeHal`, `FakeBridge`, stepped from JS at a fixed 16 ms).
    `README.md` states it is web-only Studio glue over arora's lower crates, not
    over `arora-web`.
17. **studio-arora and the browser Vizij device are two separate wasm modules that
    cannot share a store or a runtime as built.** `vizij-arora-web` is another
    `cdylib + rlib` composing `arora::Arora` over `BlackboardStore` + `RigHal` +
    `ProcessingGraph` with crates.io `arora 9` / `arora-web 6`
    (`vizij-rs/crates/interop/vizij-arora-web/Cargo.toml`, `src/lib.rs:1-15`).
    Two cdylibs are two linear memories; studio-arora's `World::spawn` takes a
    description and GLB bytes, not a HAL (Finding 16). Sharing would mean one
    cdylib linking studio-arora's rlib with `vizij-arora-{store,hal,behavior}`
    and one arora version line (git `main` vs crates.io `9`).

## Questions answered

**Q1 — what `apps/vizij-app` does.** Findings 1–7. The HAL is the webview
(Finding 2); the Studio bridge comes from arora's `studio-bridge` feature
(Finding 1); the device-info form and its layering and restart loop are Finding
6; GLB loading and rendering are Finding 4 (Tauri dialog + fs plugin → data URL →
`vizij`'s three-stdlib loader → r3f `Vizij`). Studio→face: every runtime write,
as `device:values` events at most once per 10 ms step, matched by output name
(Findings 2, 5); face→Studio: device-info registration and the HAL's held state
echoed as store state, no readings, no frames, no GLB (Findings 2, 3). Known
gaps: no `HalAssets`/`model_glb` and no caller for it (3); `unset` ignored and
the key mapping to Studio's `*.target_position` writes unverified (5); no CI, no
Android init (7).

**Q2 — `packages/vizij` versus `@vizij/render`.** Findings 8–10. Same-day
origin, separate ever since, structurally divergent on where values live and how
writes are intercepted; consumers are the Studio app's writer provider and
upload modal, the scene's types and screen renderable, core's face-asset loader,
the docs stories, and the Tauri app.

**Q3 — the three ways to "keep the branding, consume the Bevy view".**

| Way | Feasible | What it takes | What it costs |
|---|---|---|---|
| (a) wasm Bevy view in the Tauri webview | Yes once a wasm `vizij-view` exists (Finding 12; the browser sub-study owns that build). WebGL2 in the webview is proven by the current three.js face. | Device stays in Rust (`lib.rs:86-98`); the webview hands the GLB bytes it already reads (`content.tsx:178`) to the wasm view and forwards `device:values` payloads into it; the `pub.output`→uuid remap moves into Rust (`meta.rs` binding index). The React shell, settings tabs and Tauri plugins stay. | The pose still crosses Tauri IPC as JSON per step (as today); two runtimes in one process (tokio device thread + wasm Bevy in wry); wasm Bevy in WKWebView/WebView2/WebKitGTK is untested here; moving the device into the wasm is blocked by `studio-bridge = ["native", …]` (`arora-sdk/crates/arora/Cargo.toml:46-52`). |
| (b) native Bevy window from Tauri's Rust side | **No on macOS and Android** (Finding 13); Linux/Windows only via `run_on_any_thread`, which is a per-OS fork. | — | — |
| (b′) Bevy offscreen on a worker thread, frames shown by the webview | **Yes on macOS** (Finding 14: rendering off the main thread works once winit is out). | `ScheduleRunnerPlugin` + render-target image + readback (the snapshot/headless recipe, `crates/vizij/src/{snapshot.rs:38-83, main.rs:283-343}`), frames pushed to the webview as an image stream. | A video-like stream over IPC: raw RGBA 763×486 ≈ 1.5 MB/frame; PNG ≈ 300 KB/frame (`frames.rs:15-16`) at 15 Hz ≈ 4.5 MB/s; one frame of latency plus encode/decode; no picking. The ROS4HRI headless route already does this to a topic. |
| (c) drop Tauri: the `vizij` crate with `--studio` and Studio branding | Yes for the core today (Finding 15). | A `studio` build of the same binary (feature already named `studio`, `crates/vizij/Cargo.toml`) plus: a `bevy_egui` panel for device info (name, model family, owners; layered with `get_device_info()` as `lib.rs:118-124` does), a native file dialog (`rfd` or the panel), background/fit controls (flags exist: `--background`, `--fit`, `--zoom`), an `Operator` impl so `connect_with_operator` prompts in the panel instead of the TUI (`arora-9.11.1/src/studio/mod.rs:113-145`), branding (title, icons, font), and packaging from the ros-viz-rs recipes (dmg/deb/rpm/exe, Android NativeActivity). | `apps/vizij-app`'s React UI, Tauri plugins and its `vizij` dependency disappear; the "app" becomes branding assets plus a feature or a thin bin crate; per-OS installers are a separate track (the plan's unconfirmed assumption). |

**Q4 — the face on a screen inside Studio's three.js scene if the face renderer
were Bevy.** Finding 11 is the baseline: same WebGL context, no copy, exact 3D
placement, picking and selection. Options, not decided:

| Option | Mechanism | Pros | Cons |
|---|---|---|---|
| (i) frame stream as texture | The Bevy view publishes `sensor_msgs/CompressedImage` (PNG) or `Image` (raw) under `display/face[/compressed]` (`frames.rs:1-19,36-47`, 15 Hz default `:35`); Studio decodes into a `THREE.Texture` per frame. For a virtual face this means a wasm Bevy canvas read back, encoded, decoded and re-uploaded in the same page; for a remote device the frames ride the Studio bridge as a `Value` (`Structure`/`ArrayU8` exist in the client's `ValueType`, `studio_bridge_studio_client.d.ts:268-291`). | One face contract, works for remote devices, already implemented on the Bevy side. | ≈ 4.5 MB/s per face at 15 Hz PNG; capture + encode + transport + decode latency; a texture has no elements (no picking/selection on the face); WebGL2 `Screenshot` readback on wasm is an open question (native-app-anatomy); bridge tolerance for image-sized values unverified. |
| (ii) canvas overlay / canvas texture | A Bevy wasm canvas per screen, either DOM-overlaid at the projected quad or copied each frame with `THREE.CanvasTexture` (`texImage2D` from the Bevy canvas). | No encode, no bridge, same page. | Overlay ignores depth, occlusion and the screen's rotation features (`types/screen.ts:14-16`); canvas-texture needs the source canvas to keep its frame until the copy (`preserveDrawingBuffer` or same-task ordering — unverified with wgpu's WebGL2/WebGPU surface); one extra GPU context per screen; still no picking. |
| (iii) keep three.js for this one surface | The scene keeps `packages/vizij`'s renderables (or moves to `@vizij/render`, whose per-axis/compound feature model differs — web-render-anatomy Finding 9). | Zero runtime cost, keeps selection, no new plumbing. | Two renderers of the face contract to keep in parity, which is what the goal retires; the Studio-exported RobotData incompatibility persists. |

**Q5 — studio-arora.** Findings 16–17. It hosts virtual devices in one wasm
module: one `SimpleDataStore`, `<id>/`-namespaced `FakeHal` devices, and (wasm
only) a real `arora::Arora` per device stepped from JS; its bridge is faked
in-process (the loopback bridge is designed, not built). It does not overlap in
code with hosting the Vizij device in the browser (`vizij-arora-web` is a
separate cdylib on a different arora line), and as built the two cannot share a
store. They overlap in concept — "an arora device running in the page, driven
by Studio" — so if studio-arora lands, the browser Vizij device is naturally one
of its spawned devices (a `RigHal` device in the same World, one cdylib), and the
Bevy wasm view would read that device's `RigHal` pose in-memory.

## Evidence

### vizij-app data flow

| Direction | Carrier | Where |
|---|---|---|
| Studio → device | Zenoh via `arora-studio-bridge-client` behind `arora::studio::connect()`; `BridgeOp::Update` → store write | `lib.rs:112`; `arora-9.11.1/src/runtime.rs:308` |
| device → webview | `device:values` Tauri event, serialized `StateChange` (`set` tagged values, `unset` paths), one per `try_send` | `hal.rs:17,45-55`; `runtime.rs:517-536` |
| webview → values | `nameToIdMap[pub.output ?? name]` → `useValuesStore.updateValues(getLookup("default", id))` | `content.tsx:121-131`; `use-synced-data.ts:48-64` |
| values → pixels | `useFeatures` subscriptions on `useValuesStore` inside `vizij`'s r3f renderables | `packages/vizij/src/hooks/use-features.ts:66` |
| device → Studio | registration (`update_device_info`), store state fan-out (`write_bridges`) | `lib.rs:132-135`; `runtime.rs:539-545` |
| webview → device | `update_device_info` (stops the device), `run_device`, `stop_device` commands | `lib.rs:43-102,211-215` |
| Studio writes (for reference) | `${id}.studio_value`, `${id}.target_position`, `${id}.target_velocity`, `common.target_trajectory` | `device-subscriptions.ts:155-157,431-449` |

### Studio's Tauri app versus the Bevy app's `--studio`

| Concern | `apps/vizij-app` | `crates/vizij --studio` |
|---|---|---|
| Studio connection | `arora::studio::connect()` on a device thread (`lib.rs:112`) | same call inside the device supervisor (`device.rs:155-161`) |
| Device info | defaults ⊕ Studio-held ⊕ form; restart on change (`lib.rs:116-137`, `device-info-context.tsx:75-105`) | env only (`DEVICE_OWNERS`, `DEVICE_NAME`, …); no prompt because the local bridge is injected (standalone-anatomy Finding 8) |
| Identity | `<app_data_dir>/studio_refresh_token` (`lib.rs:199-208`) | arora default `<app data>/refresh_token` (`studio/mod.rs:24-25`) |
| GLB | native dialog + fs plugin (`content.tsx:164-191`) | `--glb` path; TUI `g` to swap |
| Renderer | `vizij` (three.js) in wry | Bevy window / headless |
| Layout | safe-area + background tab (`content.tsx:277-335`) | `--fit`, `--zoom`, `--background`, TUI `b` |
| Packaging | Tauri bundle `targets: all` (`tauri.conf.json`), never run in CI | none in vizij-rs; ros-viz-rs recipes |
| Android | not initialised (`gen/schemas` only) | not built (native-app-anatomy) |

### `packages/vizij` versus `@vizij/render`

| Aspect | Studio `packages/vizij` | vizij-web `@vizij/render` |
|---|---|---|
| Origin | `3e7846e1` 2025-01-09 (files back to `viz-3d`, 2024-06) | `606e641c` 2025-01-09 at `packages/render`; moved 2025-10-23; squashed 2025-12-05 |
| Runtime values | `@semio/utils` `useValuesStore` (global) | in the vizij store (`values`, `setValue`, `setValues`) |
| Write seam | `VizijValueWriterContext` (Studio overrides) | direct store writes |
| Extras | `VizijCore`, optional-context helpers, `types/element.ts` | selection glow, hover, `vizij-bundle`, animation clips, `exportable-bodies`, `parseGlbJsonChunk` |
| Peer vs deps | three/r3f/drei/zustand as dependencies | as peer dependencies |
| Utils | `@semio/utils` | `@vizij/utils` |
| Files | 52 | 54 (42 differ, 5 identical, 5/7 one-sided) |

### Stand-alone test: Bevy rendering off the main thread (macOS)

`scratchpad/spikes/studio-consumers/bevy-offthread/` — `bevy = "0.19.1"`, the
snapshot recipe (`DefaultPlugins` minus `WinitPlugin` and `LogPlugin`,
`primary_window: None`, `ScheduleRunnerPlugin`, a camera with a red clear color
rendering a lit cube into a `COPY_SRC` target image, `Readback::texture`), run
entirely on a spawned thread whose id is asserted different from the main
thread's. The first readback arrives at the second `App::update`; the reported
frame is the 30th readback so the scene is certainly drawn. Debug build, Bevy
0.19.1 default features, macOS 25.6, Apple M1 (`run.log`, `run2.log`):

```
OK: thread=Some("bevy-offthread") update=31 readbacks=30 elapsed=24.33s
    adapter=Apple M1 / Metal frame=64x64 bytes=16384
    corner(RGBA)=[255, 0, 0, 255] center(RGBA)=[76, 200, 60, 255]
    app_drop=157ms joined_after=30.96s
real 40.27  exit=0
```

Cold build 25 min (4.4 GB target); incremental rebuild 27 s. The per-update cost
(~0.8 s) is the debug build with synchronous pipeline compilation, not the
thread placement. Not tested: the same on Android (a `NativeActivity` process
has no such secondary-thread question — Bevy owns the activity), and a Bevy
render loop sharing a process with a live wry webview (GPU contention, memory).

## Implications for the target picture

- **`apps/vizij-app` has two Bevy-compatible shapes, not three.** (a) keeps the
  Tauri shell and swaps the face for the wasm view; (c) drops the shell for the
  Bevy binary. (b) is closed on macOS and Android by the main-thread rule of both
  toolkits; (b′) is a frame stream, acceptable only where a frame stream is the
  product (the ROS4HRI route), not for the primary face.
- **(a) makes the Tauri app depend on the browser deliverable** (the wasm
  `vizij-view`), so it cannot land before the browser milestone; (c) depends only
  on the desktop deliverable plus an egui panel and packaging, and removes the
  last Studio consumer of `packages/vizij` outside the Studio web app.
- **Face→Studio feedback is empty in every shape today**: the HAL never reports,
  the GLB is never served, and arora never asks for it. Whatever the plan wants
  Studio to see of a device face (its model, its frames) is new arora/bridge
  surface, not a Bevy-side change.
- **The Studio scene's on-screen face is the one surface where "Bevy everywhere"
  costs more than it returns**: a face drawn as a texture loses picking and adds
  a GPU round trip or a 4.5 MB/s stream, while keeping three.js there keeps the
  renderer duplication the goal retires. This is the section-3 open question the
  plan already flags, and it now has its trade-off table.
- **studio-arora is the natural host for a Vizij device in the Studio web app**,
  but only if it lands and takes `RigHal` devices; otherwise the browser Vizij
  device stays the standalone `vizij-arora-web` module and Studio drives it
  through JS store writes, as it drives `useValuesStore` today.

## Implications for the plan

- Order: `vizij-view` split → desktop `vizij --studio` with the egui panel
  (c) → decide (a) versus (c) for `apps/vizij-app` once the wasm view exists.
  (c) can be delivered and demonstrated to Studio before any wasm work.
- Before either, fix or verify Finding 5 (the `*.target_position` ↔
  `pub.output` mapping) with a bridge E2E: the Studio-branded app must be shown
  to move under Studio, which no test does today.
- Add `HalAssets` to the plan only with an arora-side reader: without a caller
  (Finding 3) implementing `model_glb` on the Bevy view's HAL changes nothing.
- The plan's section 3 should pick (i)/(ii)/(iii) for the Studio scene screen
  explicitly, or scope the Studio scene out of "everywhere".
- If (c) is chosen, retire `apps/vizij-app`'s React shell and `packages/vizij`'s
  Tauri consumer together; if (a), budget the wasm-in-webview validation on
  WKWebView, WebView2 and WebKitGTK.
- studio-arora (PR #256) needs a decision — land, rebase to crates.io arora, or
  close — before the browser Vizij device's host is fixed.

## Open questions

- Do Studio's device writes (`${id}.target_position` etc.) reach the face's
  animatables through `nameToIdMap`, or does the port need a suffix/uuid remap?
  Unverified: no E2E exists.
- Does a wasm Bevy view initialise wgpu (WebGL2 or WebGPU) inside wry's
  WKWebView on macOS, WebView2 on Windows and WebKitGTK on Linux? Not tested.
- Does the Studio bridge carry image-sized `Structure`/`ArrayU8` values at 15 Hz
  without throttling (option (i) for remote faces)? Not tested.
- Does `THREE.CanvasTexture` from a wgpu-driven canvas deliver the current frame
  without `preserveDrawingBuffer` (option (ii))? Not tested.
- Will studio-arora land, and would its `World::spawn` accept a `RigHal`?
