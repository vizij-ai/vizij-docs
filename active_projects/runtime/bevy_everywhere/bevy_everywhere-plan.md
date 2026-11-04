# One Bevy view for every Vizij face: retiring vizij-standalone
<!-- tags: family=project; type=plan; project_status=tracking; topics=runtime,standalone,bevy,wasm,android,authoring -->
> **Last updated:** 2026-11-04

> **Related documents:** [Reading guide (sixteen slides)](bevy_everywhere-deck.md) · [Tickets](bevy_everywhere-tickets.md) · [Runtime Summary](../summary.md) · [Native app proposal (vizij-rs)](https://github.com/vizij-ai/vizij-rs/blob/main/docs/proposal-vizij-native-app.md) · Sub-studies in [`studies/`](studies/)

**Status (2026-11-04, read from vizij-rs, vizij-web and semio_studio `main`):
every Vizij face in the browser draws on the Bevy view, three.js draws no
face, the desktop line is delivered, and the Android app is on main and
smoke-tested on the emulator; the tablet gate, the retirement of
`apps/vizij-app` and the deletion of the Tauri standalone are open.** The
Linear issues named here carry the tickets' own state, which this block does
not restate.

- Delivered:
  - the `vizij` crate as a library plus the desktop binary, faces as entities
    of their own, several in one App, the browser module, and `say` in the browser (P1, P3,
    P3b: [vizij-rs#126](https://github.com/vizij-ai/vizij-rs/pull/126),
    [vizij-rs#127](https://github.com/vizij-ai/vizij-rs/pull/127),
    [vizij-rs#128](https://github.com/vizij-ai/vizij-rs/pull/128),
    [vizij-rs#129](https://github.com/vizij-ai/vizij-rs/pull/129));
  - every Vizij face in vizij-web drawn on the Bevy view: `@vizij/render`
    2.0.0 and `@vizij/runtime-react` 1.0.0, every face app and the authoring
    app on `@vizij/runtime` 8, three.js drawing no face,
    `@vizij/speech-react`, `@vizij/animation-react` and the animation demos
    deleted, on the capabilities P4a added to `@vizij/runtime` (P4b:
    [vizij-web#206](https://github.com/vizij-ai/vizij-web/pull/206), released
    by [vizij-web#207](https://github.com/vizij-ai/vizij-web/pull/207));
  - a face's animations played through Arora's animation module
    (`@arora/animation`), with Vizij's own animation engine removed
    ([vizij-rs#260](https://github.com/vizij-ai/vizij-rs/pull/260),
    [vizij-rs#261](https://github.com/vizij-ai/vizij-rs/pull/261));
  - the desktop binary's local bridge, Studio registration, file opening and
    window flags, and its release per desktop OS (P5:
    [VIZ-151](https://linear.app/semio-ai/issue/VIZ-151) in
    [vizij-rs#130](https://github.com/vizij-ai/vizij-rs/pull/130),
    [VIZ-152](https://linear.app/semio-ai/issue/VIZ-152) in
    [vizij-rs#146](https://github.com/vizij-ai/vizij-rs/pull/146), released
    as [`vizij-v0.2.0`](https://github.com/vizij-ai/vizij-rs/releases/tag/vizij-v0.2.0)).
    The in-window egui operator panel P5 names is the settings pane
    ([vizij-rs#279](https://github.com/vizij-ai/vizij-rs/pull/279));
  - the web renderer retired (P8b): `three` out of the authoring app
    ([vizij-web#208](https://github.com/vizij-ai/vizij-web/pull/208)), left only in `@vizij/render`'s GLB loader and
    exporter, and the docs re-pointed
    ([vizij-docs#23](https://github.com/vizij-ai/vizij-docs/pull/23));
  - the Android app (P6): the APK with `studio` and the cloud TTS, built per
    ABI and smoke-tested in CI on the x86_64 API 35 emulator with
    `-gpu lavapipe` ([vizij-rs#276](https://github.com/vizij-ai/vizij-rs/pull/276)), the Kotlin activity with the
    picker, VIEW intents, immersive mode and device-loss recovery
    ([vizij-rs#277](https://github.com/vizij-ai/vizij-rs/pull/277)), speech ([vizij-rs#278](https://github.com/vizij-ai/vizij-rs/pull/278)), and enrollment
    from the settings pane ([vizij-rs#286](https://github.com/vizij-ai/vizij-rs/pull/286));
  - the agent demo in the standalone's folder (P4c:
    [vizij-web#128](https://github.com/vizij-ai/vizij-web/pull/128), [vizij-web#211](https://github.com/vizij-ai/vizij-web/pull/211));
  - the device serving Studio's keys ([vizij-rs#173](https://github.com/vizij-ai/vizij-rs/pull/173)) and the face
    image on Studio's scene screen, published at the rate a client writes to
    `display/face/frame_rate` ([vizij-rs#291](https://github.com/vizij-ai/vizij-rs/pull/291) and semio_studio's
    `face-screen-frames`).
- Open:
  - Android (P6): release signing and the tablet gate
    (`android/scripts/device-gate.sh`), neither on main; CI's APK is a debug
    build. [VIZ-154](https://linear.app/semio-ai/issue/VIZ-154);
  - Semio Studio (P7): the bridge E2E of
    [VIZ-155](https://linear.app/semio-ai/issue/VIZ-155), then
    [STUDIO-263](https://linear.app/semio-ai/issue/STUDIO-263):
    `apps/vizij-app` is still on semio_studio's main;
  - deleting the Tauri standalone and rewriting the `deploy/*` guidebook pages
    (P8a): [VIZ-156](https://linear.app/semio-ai/issue/VIZ-156);
    `apps/vizij-standalone/src-tauri` is still on vizij-web's main.

Section 2 is the state the plan starts from, at the revisions its studies read.
Each claim in it is backed by a sub-study in `studies/`, each of which opens
with its findings; section 2 is their synthesis and cites the study (`S:slug`,
finding number). Sections 3 to 6 are the target picture and the plan as they
survived a challenge: each load-bearing claim attacked through two or three
lenses (feasibility, cost, consumer impact), verification spikes, and three
judges' scores, recorded in [`studies/challenge-verdicts.md`](studies/challenge-verdicts.md).
Each study records the commands and results of its stand-alone tests, which
are not kept, and names where its result lives on main.

| Study | Subject |
| --- | --- |
| [`standalone-anatomy`](studies/standalone-anatomy.md) | the Tauri standalone: host, webview, Android, parity with the Bevy app |
| [`native-app-anatomy`](studies/native-app-anatomy.md) | `crates/vizij`: modules, dependencies, render contract, tests |
| [`web-render-anatomy`](studies/web-render-anatomy.md) | `@vizij/render` and Studio's `packages/vizij` |
| [`browser-device-anatomy`](studies/browser-device-anatomy.md) | `vizij-arora-web`, `@vizij/runtime`, `@vizij/runtime-react` |
| [`authoring-viewport`](studies/authoring-viewport.md) | how the editor touches the rendered face |
| [`demos-inventory`](studies/demos-inventory.md) | every app, e2e suite and public page that shows a face |
| [`speech-and-agent`](studies/speech-and-agent.md) | speech in the standalone, on the device, and in the agent tutorial |
| [`studio-consumers`](studies/studio-consumers.md) | Semio Studio's `apps/vizij-app`, `packages/vizij`, scene screens, studio-arora |
| [`arora-wasm-constraints`](studies/arora-wasm-constraints.md) | what of the device composition runs on wasm32 (compile spike) |
| [`bevy-wasm-spike`](studies/bevy-wasm-spike.md) | Bevy 0.19 face in a browser canvas: build, size, multi-instance (build spike) |
| [`bevy-android-spike`](studies/bevy-android-spike.md) | Bevy 0.19 APK on this Mac's emulator; what `vizij` needs on Android (build spike) |
| [`packaging-and-ci`](studies/packaging-and-ci.md) | ros-viz-rs recipes, vizij-rs and vizij-web CI, publishing |
| [`challenge-ws-bridge-and-operator`](studies/challenge-ws-bridge-and-operator.md) | the local WS bridge and the Studio registration, built in-app and verified over the wire |
| [`challenge-headless-export`](studies/challenge-headless-export.md) | GLB export from the JS world model without a renderer (verified on three faces) |
| [`challenge-tts-wasm`](studies/challenge-tts-wasm.md) | a wasm32 branch of the TTS provider under one skeleton; the fragments and the wasm `say` tested natively and in headless Chrome |
| [`challenge-wasm-one-module`](studies/challenge-wasm-one-module.md) | device + view in one wasm module: JS-paced device, two faces on one canvas, 25 load/unload cycles, bytes loading, picking, App restart (build spike) |
| [`challenge-android-render`](studies/challenge-android-render.md) | Bevy 0.19 on the API 32/34/35 emulator images under Vulkan and GLES, host GPU, lavapipe and SwiftShader (build spike) |
| [`challenge-verdicts`](studies/challenge-verdicts.md) | the refutation verdicts and judge scores behind sections 3 to 6 |

## 1. Goal

**The Bevy view in `crates/vizij` (vizij-rs) becomes the one renderer of Vizij
faces, everywhere, and `vizij-standalone` is retired.**

Agreed scope (Victor, 2026-09-16):

- **Everywhere includes the browser.** The Bevy view is also built for
  `wasm32` and replaces `@vizij/render` (three.js) in every browser surface,
  including the authoring app's face viewport. The intermediary web packages are
  translated or retired accordingly.
- **The face app hosts no conversation.** Speech-to-text and language models are
  an external agent that drives the face through a bridge, or, in the browser,
  through the device's JS surface. The device keeps the `say` skill and the
  viseme players.
- **Operator UI stays minimal.** Desktop: command-line flags, the HTTP control
  panel of `arora-bridge-ws`, and a native open-file dialog. Android: a file
  picker plus the endpoints and Studio-owner prompt, since there is no command
  line.
- **The standalone's folder becomes the "agent + Vizij" demo**: one browser page
  where the agent runs in JavaScript and the face is the wasm Bevy view, both on
  the arora device running in the page.
- **Android is a retirement gate.** The standalone is deleted only once the Bevy
  app installs on an Android tablet, opens a GLB, and reaches Semio Studio.
- **Semio Studio's `apps/vizij-app` stays a Studio-branded app** whose face is
  the Bevy view consumed as a library.
- **Home of this document**: vizij-docs, this folder.

Two gates, not one: Android gates the deletion of the standalone's Tauri shell
and native run; the browser port gates the rewrite of its folder into the demo
(section 4, P8a and P8b).

### 1.1 The face is a component of a device, not the device

In arora's vocabulary a **device** is an Arora instance around its hardware:
one blackboard, one behavior, a HAL, bridges — the unit that registers with
Semio Studio and is driven from there (arora-sdk `docs/architecture.md`, "an
Arora instance — one device"). The `vizij` binary spawns one: the face is the
whole of its hardware, so there the word is right, and `vizij --studio`
registers a device.

As a **library**, Vizij is a set of components an Arora device composes, none
of which is a device:

- the **view** — the Bevy renderer of a face, reading a `RigHal`'s pose;
- the **face** — a GLB's bindings and bundle composed into a behavior graph,
  and the `RigHal` it drives;
- the **modules** — animation, gaze, viseme players, speech: host modules any
  Arora loads, tied to no hardware.

This cuts both ways. A robot that already is a device (arms, wheels, a base)
takes a face as **one more piece of hardware**: the face's `RigHal` beside the
robot's HAL, the face modules beside the robot's, one Studio registration —
not a second device on the network. And a face that started alone grows into a
robot by adding a HAL and modules to the same Arora: Vizij is an entry point to
robotics because it runs Arora, not a product beside it.

Consequences carried through this plan:

- **Naming.** "Device" is used where an Arora instance stands alone — the
  binary, Studio registration, a page-hosted face runtime — and never for a
  component. The crate's modules are `view`, `face`, `modules` and `native`
  (section 3.1); the JavaScript surface hands out a `Runtime`, not a `Device`.
- **Composability.** A host building its own device must reach the pieces —
  the composed graph, the `RigHal`, each module's `host_module()` — and fold
  them into its own `AroraBuilder`; `start()` is one convenience over them,
  not the only door (section 3.1).
- **Several HALs in one device.** arora's builder takes one `Hal` and a
  vector of bridges. A hybrid device needs the runtime to hold several HALs —
  each owning the keys it describes, writes fanned out by key, update streams
  merged — the way it already holds several bridges. That is an arora-sdk
  change this plan asks for earlier than a face-only device needs it (P0.5,
  risk 12), so that "add a face to a robot" is a builder line, not a fork.
- **Studio.** A face reaches Studio as a device (stand-alone) or as part of
  one; either way the scene shows it from the device's state, as the image the
  view produces (section 3.7).

Decided on 2026-09-18 (the eleven decisions of the first review; each is
applied in the section it names):

- Android rendering is tried on newer emulator images before any tablet
  (P0, Gate 0).
- The view is `crates/vizij`'s own renderer, repurposed as a library that
  `@vizij/render` serves in the browser; STUDIO-256's `vizij-render` spike is
  not adopted and does not gate this work; its scene may consume the
  repurposed crate later (3.1).
- `apps/vizij-app` dissolves: a stand-alone `vizij --studio` instance is what
  Studio connects to, the way it connected to that app (3.7).
- The Studio scene's face-on-a-screen keeps three.js as its surface; the face
  on it is a texture the Arora-side view produces, so Studio hosts no second
  face renderer (3.7).
- vizij-showcase is ported on the shared canvas (3.8).
- One agent demo, a text agent (3.4).
- The exporter writes the authored defaults (3.3).
- `@vizij/render` is kept and reworked over the Bevy view; the authoring app
  keeps using it with minimal changes; Studio adopts it (3.3, 3.7).
- `studio-arora` is out of scope; its fate is a Studio decision (3.7).
- The face standard gains a conversation-state tier and an expression producer
  (3.4).
- Desktop installers gate the retirement of the standalone (3.9, P5, P8a).

Decided on 2026-09-21 (Victor): the face is a component of a device, not the
device (1.1); the naming and the several-HALs requirement follow from it.

Decided on 2026-10-02 (Victor):

- Every dependency is complete before a consumer moves. No app stays on, or
  is pinned to, the `runtime-react` 0.4 line, and no gap is left for an app
  to work around (P4a before P4b).
- The `vizij-face` profile grows with what faces do: blink, the apps'
  emotions, the conversation state. A ROS4HRI mapping is a bonus where one
  exists, never a condition (P4a).
- `tutorial-agent-face` stays, because vizij.ai's public tutorials are built
  on it. It is ported on `runtime-react` 1.0 with its guidebook pages, and its
  public routes keep working (3.8, P4b).
- The web consumers land together. The apps link the packages through
  `workspace:*`, so the packages and every app go into one integration
  branch, one pull request each, and the branch reaches `main` once all are
  green (P4b).
- The authoring app migrates in the same move, once the authoring work in
  flight (vizij-web #133 and its siblings) has landed (P4b).

## 2. Current state

### 2.1 Three face runtimes, two renderers, one contract

Three compositions run a Vizij face today, all over the same interop seams
(`vizij-arora-store`, `vizij-arora-hal`, `vizij-arora-behavior`,
`vizij-arora-host`) and the same GLB contract (`RobotData` per node,
`VIZIJ_bundle` on a node):

| Runtime | Device | Renderer | Bridges |
| --- | --- | --- | --- |
| Native app `crates/vizij` | native `arora` on a worker thread, host modules (animation, gaze, viseme, TTS), skills fragments | Bevy (`view.rs`) | local WS, `--ros2`, `--studio`, all inside the run |
| Browser device `vizij-arora-web` + `@vizij/runtime-react` | `arora` (no default features) in wasm, stepped from JS | three.js via `@vizij/render` | none: the JS surface is the bridge |
| `vizij-standalone` (Tauri) | **two** devices: the browser device in the webview (canonical store) and a second native `arora` over a `SimpleDataStore`, stitched by IPC | three.js in the webview | WS + optional ROS 2 in the native run; Studio on its own thread |

Sources: S:standalone-anatomy 1, 6; S:native-app-anatomy 1–3; S:browser-device-anatomy 1, 13.

### 2.2 The standalone: what it has, and what the Bevy app lacks

- The webview→native mirror is change-driven and coalesced at 50 ms (not the
  10 Hz poll its README describes); it is one-way, so native writes reach the
  face only through the `update-values` event (S:standalone-anatomy 2).
- Nine WS "methods" (`reset`, `speak`, `interrupt`, `mute_microphone`,
  `get_mic_muted`, `transport/*`) are app methods that emit Tauri events; they
  are not device methods. `arora-bridge-ws` hands the run only `Update`/`Get`
  and answers `invoke` from its own registry, so a described device method
  (`look_at`, `say`) is never reached over WS in any app; only the ROS 2 bridge
  binds them as actions (S:standalone-anatomy 3; S:challenge-ws-bridge-and-operator 2).
- The standalone's WS server binds loopback like everyone else's; the README's
  "control from another machine or a phone" is wrong (S:standalone-anatomy 5).
- Its Studio bridge runs outside the run: Studio can read and write keys but
  cannot call methods. It duplicates arora's encrypted refresh-token storage
  under Tauri's app-data dir, persists owners in `studio_owners.json`, and
  regenerates the device name `vizij-<random>` every launch (S:standalone-anatomy 6–7).
- Android: a GLB enters by VIEW intent (copied to `filesDir/opened_model.glb`
  by a Kotlin `MainActivity`), by the SAF picker, or from a saved copy; the only
  permission is `INTERNET`; minSdk 24. The Android build is
  `--no-default-features --features studio-bridge` and links zenoh, rustls
  (ring **and** aws-lc), firestore, gcloud-sdk, reqwest, tokio, wry: 775 crates,
  no wasmtime (S:standalone-anatomy 9–10). That APK has been built and
  launched in CI; it has not been run against Studio on a device.
- The native `say` module is registered but lip-less: the interpreter carries
  only the `look_at` fragment, and the standalone's lock pins `vizij-arora-tts`
  1.0.0 while main is 2.0.0 (S:standalone-anatomy 16; S:speech-and-agent 12, 24).
- **Parity gaps in the Bevy app** (S:standalone-anatomy 4, 8, 17): arora's
  auto-attached local bridge has an empty registry, rejects every
  `write_values`, has no `reset`, and does **not** serve the HTTP control panel
  (`serve_control_panel: false` in `ServerConfig::default()`); everything
  needed to fix that is public in `arora-bridge-ws` and needs no arora change
  (S:challenge-ws-bridge-and-operator 1). `--studio` registers nothing unless
  `DEVICE_OWNERS`/`DEVICE_NAME` are set, and arora's operator prompt only runs
  when no bridge is injected, which the app always does; there is no file
  dialog, no URL loading, and none of the standalone's window-placement flags
  (`--fullscreen`, `--display`, `--width/--height`, `--no-decorations`,
  `--always-on-top`, `list-displays`), no remembered last model; `--glb` is
  required and the TUI's `g` prompt is the only way to swap a face.
- Only `@vizij/speech-react` and `@tauri-apps/*` exist for the standalone
  alone; everything else it imports is shared. `packages/@vizij/arora-types/`
  and `apps/vizij-ws-app/` are untracked leftovers. No CI besides the
  on-demand `android.yml` exercises it (S:standalone-anatomy 12–13).

### 2.3 The Bevy app: `crates/vizij`

- A binary-only crate, 12 modules, 4,808 lines. The view half (`view.rs`,
  `meta.rs`, `snapshot.rs`, `frames.rs`: 1,482 lines) depends on Bevy, the
  interop crates, `image`, `serde_json`, `anyhow`, `log` and nothing
  host-bound; the device half (`device.rs` and friends) holds `arora`, tokio,
  the TUI, threads and the bridges. Four types cross the seam: `Face`,
  `DeviceRes { rig: RigHal }`, `DeviceEvents`, `FrameConfig`
  (S:native-app-anatomy 1–2, 16).
- The `Arora` is `!Send` and is built on a std thread stepped every 10 ms; the
  view polls `RigHal::pose()` every frame (a whole-state clone under a mutex;
  the delta stream `pose_updates()` is unused) and drains `DeviceEvent`s
  (S:native-app-anatomy 3–4; S:arora-wasm-constraints 12).
- Frames and snapshots are Bevy-side captures pushed as `sensor_msgs` values
  through `RigHal::push_reading`; `--headless` is the offscreen target under
  `app.run()` (S:native-app-anatomy 5).
- Render contract implemented: orthographic fit (contain/cover/stretch, zoom),
  no tonemapping, **unlit** double-sided materials with the ambient factor baked
  in, translation/rotation(ZYX)/scale, linear color, opacity→alpha, morph
  weights by target name. Not implemented: ellipse/rectangle primitives and
  strokes, vec2 translation and scalar rotation, PBR extras, safe-area outline,
  selection glow, hover/click picking, `aggressiveImport`; the RobotData `id`
  is not read (S:native-app-anatomy 6–7; S:web-render-anatomy 5). Under the
  unlit path, Blender exports that carry their colour in `emissiveFactor` over
  a black base colour with metallic 1 (`Quori_Latest_Blender_Export.glb`, the
  "Blender Export" preset of the authoring app) render black
  (S:challenge-verdicts C4).
- Dependencies: `arora` with default features pulls wasmtime, cranelift,
  ratatui, crossterm, `arora-bridge-ws`, env_logger, clap on every target,
  although nothing in the app loads a wasm guest (every module is a host
  module); `rodio` is a direct dependency used only under `tts-piper`; Bevy's
  default `audio` feature pulls a second rodio/cpal the app never uses
  (S:native-app-anatomy 8–10). arora's `studio-bridge` feature implies
  `native`, so every Studio-capable build carries wasmtime until arora splits
  the two (the ARORA-79 shape).
- Tests: 33 unit tests run without GPU or display and none constructs a Bevy
  `App`; `snapshot_regression` compares the app to **its own** committed
  goldens (32×32 mean difference under 10/255) on lavapipe in CI; the
  web-parity collages (0.50 % / 0.66 %) were captured once with an uncommitted
  headed Playwright spec and are a record, not a test; `tests/ros4hri` is a
  manual Docker harness (S:native-app-anatomy 11–14; S:packaging-and-ci 8).
- `RobotData` parsing exists once in Rust, inside the app (`meta.rs`);
  `vizij-arora-host` parses only `VIZIJ_bundle`; `vizij-bundle` reads
  RobotData names for `inspect` and owns a separate GLB container split
  (S:native-app-anatomy 15).

### 2.4 The browser device and `@vizij/runtime-react`

- `vizij-arora-web` composes `arora` (no default features) over
  `BlackboardStore` + `RigHal` + `ProcessingGraph`, wrapped by `AroraWeb`,
  whose device slot is private; no bridge, no host module, optional wasm guest
  modules. The JS class exposes thirteen methods (`start`, `step`, `run`,
  `call`, `loadGraph`, `applyGraphEdits`, `setValue`, `writeValues`,
  `readValues`, `snapshot`, `drainChanges`, `behaviorError`,
  `behaviorErrorChanged`) and seven registry functions (`profiles`,
  `mappings`, `skills`, `composeFace`, …). arora-web 6.1.0's `stop()`/`running`
  are not forwarded, so a self-paced device cannot be reclaimed from JS
  (S:browser-device-anatomy 1–3).
- The npm wrapper is a module-level singleton (`init()` memoized, one glue
  import, one binding cache); N devices are N `start()` calls inside that one
  module. Five Node tests drive the device with `step`/`run` and no canvas
  (S:challenge-verdicts C1, C2).
- Both loop models run on the page's main thread: `run()` paces on
  `gloo-timers` and keeps stepping in a hidden tab (ARORA-68 is Done), `step(dt)`
  from `requestAnimationFrame`. No consumer hosts the device in a Web Worker
  (S:browser-device-anatomy 4–5; S:arora-wasm-constraints 4–5).
- `@vizij/runtime-react` (3,778 lines) composes graphs in JavaScript (not
  `composeFace`), prefixes every store path with `${namespace}/`, extracts the
  bundle through `@vizij/render`'s three.js loader, stages the neutral pose in
  JS, and mirrors device outputs into `@vizij/render`'s store
  (`drainChanges` → `setValues` → per-feature subscriptions → three.js).
  `VizijRuntimeFace` is `@vizij/render`'s `Vizij` canvas bound to the
  provider (S:browser-device-anatomy 6–10).
- The animation module runs as a **separate wasm guest** (a `wasm32-wasip1`
  artifact fetched by JS, 285 kB) executed by arora's browser executor; the
  native app links the same crate as a host module. Its engine is a
  `lazy_static` global (one per process or wasm instance, not per device), and
  its generated guest glue is gated on `target_arch = "wasm32"`, which is also
  true of the browser target (S:browser-device-anatomy 11–12;
  S:arora-wasm-constraints 9; S:challenge-verdicts C1).
- The whole browser device graph already compiles for wasm32; what does not
  are the bridges: `arora-bridge-ws`, `arora-bridge-ros2`,
  `arora-studio-bridge-client` (S:browser-device-anatomy 13;
  S:arora-wasm-constraints 1, 6, 13).
- The checked-in `npm/@vizij/runtime/pkg` lags the source by six weeks, and
  the package ships its wasm twice (`pkg/` and `dist/pkg/`)
  (S:browser-device-anatomy 15; S:packaging-and-ci 12).

### 2.5 `@vizij/render`: 30 % drawing, 70 % world model, loader and exporter

- 6,045 lines: rendering 1,884; scene store and world types 962; GLB import
  1,972; bundle types 362; export 462; editing actions 343
  (S:web-render-anatomy 1).
- Ellipse and rectangle geometry is generated by the renderer (drei
  `Circle`/`Plane`, fat-line strokes), never read from a GLB; **no shipped face
  GLB contains one**: 17 vizij-web fixtures and Studio's six site faces carry
  `shape` and `group` only; the authoring app has no creation path for either
  (S:web-render-anatomy 3–4; S:challenge-verdicts C4).
- Every browser app draws through one component, `VizijRuntimeFace` (7 mount
  sites); the authoring app imports 22 symbols in 49 files, almost all for the
  store, world/bundle types and GLB I/O (S:web-render-anatomy 7;
  S:demos-inventory 2, 5).
- **Export from the world model without a renderer works**: a ~120-line
  scene-graph builder over the world and animatables, fed through the
  unmodified `applyDefaultsToRobotData` and `exportScene`, reproduces
  `Quori_Current_Extended`, `Hugo_Current_Extended` and `Toasty_Current` with
  zero RobotData, bundle and material differences and a zero-diff reload;
  `GLTFExporter` touches the DOM only for textures, which no face has; the
  `aggressiveImport` path also runs headlessly. The one semantic difference: a
  headless export writes the authored defaults into node TRS and morph weights,
  whereas today's export snapshots the runtime pose from mounted objects
  (three of five shipped "Current" faces carry a runtime pose in the file)
  (S:challenge-headless-export 1–3).
- Resource lifetime: loaders are never disposed; world swaps do not dispose
  geometry; canvas cleanup is react-three-fiber's; the authoring e2e carries a
  memory-checkpoint workflow that mounts and unmounts faces 25 times
  (`preset-churn`, `reference-face-churn`, 1 MB growth threshold)
  (S:web-render-anatomy 13–14; S:challenge-verdicts C2).
- Several faces per page is a shipped pattern: authoring mounts a main and a
  reference runtime (two devices, two stores, two canvases) and swaps the main
  face for an empty-state demo face; the showcase mounts five canvases under six
  providers (S:web-render-anatomy 15; S:demos-inventory 6).

### 2.6 The authoring editor's viewport contract

- This section and its study describe **vizij-web's** authoring app over
  `@vizij/render` and `@vizij/runtime-react`. Semio Studio's `packages/vizij`
  is a divergent origin of the same renderer with its own contexts (a
  per-namespace `VizijContext` over the scene store, S:studio-consumers 10–11)
  and is covered in 2.9, not here. Within vizij-web, the findings separate the
  **rendering** side (the drawn copy, picking, selection, camera fit) from the
  **device** side (graph registration, staged inputs, programs), which reaches
  the face through the runtime and is untouched by the viewport swap.
- The viewport is `VizijRuntimeFace`; nothing in the app uses `@vizij/render`'s
  `Vizij` directly. The app-level render store is the world model at edit time;
  each runtime provider owns a second store that is re-seeded from it, and the
  canvas draws only the second (S:authoring-viewport 1–3).
- **Structural world edits reach the running face by full reload** (the provider
  keys reloads on `JSON.stringify(world)`, which includes mounted three.js
  refs); animatable descriptor edits re-register the rig graph; input values go
  through `setInput`; static-feature scrubbing is a world change today
  (S:authoring-viewport 4, 15; S:challenge-verdicts C3).
- Picking is r3f pointer events on shape meshes landing in the runtime store's
  `elementSelection`; the app consumes only `elementSelection[0]`; hover is
  tracked and never used; the selection glow is an edges-geometry effect over
  the unmorphed geometry, toggled from the View menu. There are no gizmos, no
  camera controls, no screenshots, no background setting, no visibility
  feature; the safe-area overlay is always off (S:authoring-viewport 5–8).
- Output locks (`transformOutputWrite`) filter **rig output writes** between the
  device and the drawn face, per animatable and per component, merging locked
  components from the held value; an input override cannot reproduce them,
  because the graph recomputes the output from its other inputs every step
  (S:challenge-verdicts C3).
- Import is three.js all the way (GLTFLoader + `traverseThree` over RobotData;
  `aggressiveImport` synthesizes RobotData from a plain GLB). Export walks
  mounted three.js objects today (S:authoring-viewport 11–13; superseded by
  the headless path in 2.5).
- No test touches canvas pixels or picking; e2e specs assert DOM test ids,
  unit tests mock the render and runtime packages entirely
  (S:authoring-viewport 14).

### 2.7 Apps and public surfaces

| App (vizij-web) | Face? | Packages | Speech | CI / e2e | Public docs |
| --- | --- | --- | --- | --- | --- |
| vizij-authoring | yes ×2 (+ empty-state demo) | render, runtime-react, runtime, node-graph* | Polly copy (SpeechPanel, DemoVoicePanel) | build, authoring-smoke, heavy journeys | guidebook, manifest |
| vizij-standalone | yes | render (type), runtime-react, speech-react, tauri | full pipeline | build (vite only), android.yml (dispatch) | guidebook (19 pages), manifest |
| demo-vizij-player | yes | runtime-react | none | build, e2e load-sample | not projected |
| tutorial-fullscreen-face | yes | runtime-react | none | build | guidebook, manifest |
| tutorial-agent-face | yes | runtime-react, @google/genai | Gemini Live (audio), local aligner | build | guidebook, manifest |
| vizij-showcase | yes ×5 | render, runtime-react | Polly copy (VoicePanel) | build | not projected |
| demo-graph-studio, minimal-demo-graph | no | node-graph packages only | none | build, e2e smoke | — |
| demo-animation-studio, minimal-demo-animation, minimal-demo-animation-graph | no | animation packages only; deleted with Vizij's animation engine ([vizij-web#206](https://github.com/vizij-ai/vizij-web/pull/206)) | none | — | — |
| vizij-ws-app | residue (one tracked `.gitignore`) | — | — | — | — |

The public website is a generated projection of the guidebook (15 pages) and
is not checked out locally; the guidebook names `vizij-standalone` on 19 pages
(53 hits in four `deploy/*` pages) and `runtime-react` on 26, and never names
three.js or WebGL. `packages/@vizij/node-graph-authoring` also builds
`namespace/…` paths (S:demos-inventory 1–13; S:challenge-verdicts C1).

### 2.8 Speech

- `@vizij/speech-react` (Deepgram STT over a browser WebSocket, OpenAI chat from
  the page, Polly through the Vizij cloud function played by an `<audio>`
  element whose `currentTime` is the viseme clock) has exactly one consumer,
  the standalone; the authoring app and the showcase carry diverged private
  copies. The web lipsync writes pose weights `rig/<faceId>/poses/<id>.weight`
  in a Polly-code vocabulary, not the face standard's 15 shapes; speaking,
  user-speaking, thinking and the emotion group are bundle-specific inputs
  outside the standard (S:speech-and-agent 1–10).
- The native device registers the whole speech surface: `say(text, voice) →
  Status` as a poll-on-tick host function streaming the viseme through an
  out-parameter, the `say`/`play_viseme` fragments feeding the standard
  lipsync driver (`standard/vizij/viseme/<shape>`, 30 ms crossfade), the gaze
  skill. One provider per build: cloud (reqwest + rodio + tokio multi-thread,
  playhead sampled from a wall clock rather than `Sink::get_pos()`) or Piper.
  Runs are keyed by `hash(text, voice)` because the module ABI carries no run
  id, and a halt reaches the provider only as the absence of further polls
  (S:speech-and-agent 13–17; S:challenge-tts-wasm 7–8).
- **The provider's wasm32 branch is a verified split**, tested natively and in headless Chrome (S:challenge-tts-wasm 9–10): `reqwest` with
  `json` compiles for wasm32 as declared (its fetch backend); only the producer
  (tokio runtime, rodio loop, `Instant`) is native-bound; on wasm the producer
  is `spawn_local` plus a page-supplied `play(bytes, marks)` returning a
  `playhead()`; the run map must live in the module closure (a `js_sys::Function`
  is `!Send`); the `AudioContext` unlock is the page's, at the click that also
  requests the microphone (S:challenge-tts-wasm 1–6).
- **Lips need a standard viseme adaptation the shipped faces lack**: the only
  GLB carrying `standard/vizij/viseme` is the untracked `Quori_Latest_ROS.glb`;
  the four tracked faces (authoring's three, the showcase's `Quori_Speaks`)
  have none, and the authoring app has no adaptation feature; the JS lipsync
  works on them because it maps Polly codes to each face's own pose ids
  (S:challenge-verdicts C5).
- The browser device registers no host module and no fragment; it only exposes
  the fragments as JSON. The ROS4HRI profile already reaches the browser
  through `composeFace` (S:speech-and-agent 19; S:challenge-verdicts C5).
- `tutorial-agent-face` is already the "agent in JS drives the in-page face"
  shape: Gemini Live returns **audio**, lips come from a local phoneme aligner,
  tools `set_gaze`/`express_emotion` write standard eye controls and emotion
  poses (S:speech-and-agent 21).

### 2.9 Semio Studio

- `apps/vizij-app` (branch `chore/vizij-app-update`) is a native `arora`
  (`studio-bridge`) whose HAL is a write-through mirror to the webview
  (`device:values` events; nothing flows back); the webview loads and renders
  the GLB with Studio's own `packages/vizij`; the GLB is never served to Studio
  (`RigHal` implements `HalAssets`; arora has no caller for it); nothing builds
  the app in CI (S:studio-consumers 1–7; S:challenge-verdicts C6).
- Studio animates a face it renders itself today: its player, derived tracks
  and device feedback write the values store its `packages/vizij` draws from
  (S:studio-consumers 11). **Over the bridge, Studio's writes do not reach a
  device's face**, in the Tauri app either: Studio writes `<id>.target_position` / `.target_velocity` /
  `.studio_value` and reads `<id>.position`, where `<id>` is the RobotData UUID
  for scalars and `<uuid>.<axis>` for vectors, eulers and colours (split on
  load); the Bevy view indexes bare UUIDs and the Studio client passes keys
  verbatim (S:challenge-verdicts C6).
- `packages/vizij` is the **origin** of `@vizij/render`, not a fork: same day
  of birth, never synced, 42 of 52 files differ; Studio's world model is
  per-axis (`translation.x`, `rotation.r`), so a Studio-exported face is
  unreadable by vizij-web's loader and unmapped by Bevy. STUDIO-239 plans to
  retire `packages/vizij` for `@vizij/render`'s renderer, which section 3.3
  deletes (S:web-render-anatomy 8–12; S:studio-consumers 8–10).
- The Studio scene draws a face on a 3D screen through a drei `RenderTexture`
  in the scene's own WebGL context; the upload-face modal previews and exports
  from mounted three.js refs; `packages/core` and the Storybook stories are
  further consumers (S:studio-consumers 10–11).
- **A native Bevy window cannot be opened from a Tauri app on macOS or
  Android**: tao and winit both demand and block the main thread; on Android
  the entry points conflict. Offscreen Bevy on a secondary thread works
  (S:studio-consumers 13–14).
- `studio-arora` (draft PR #256) is a separate wasm module spawning `FakeHal`
  devices; it cannot share a store with the browser Vizij device as built
  (S:studio-consumers 16–17).
- A Rust rendering spike exists in flight: Linear project "Rust Rendering
  for Vizij and the Studio Scene" (STUDIO-256 In Progress, VIZ-130, VIZ-131),
  with `vizij-render` and `scene` crates on `feat/vizij-render-core`, a
  vizij-rs branch that exists only on Andy's machine (unpushed as of
  2026-09-15; absent from every local checkout and from `origin`). Its
  ticket reports render-to-texture at 1.05 ms per face on a screen and
  concludes that per-face state must be components, not startup resources,
  for one App to host several faces (S:challenge-verdicts C3, C10).

### 2.10 Portability, verified by builds

**Bevy on wasm32** (S:bevy-wasm-spike; S:challenge-verdicts C2):

- A 190-line Bevy 0.19.1 crate mirroring `view.rs` renders the Quori GLB with
  animating morph targets in a page canvas over WebGL2, with the feature set
  `default_app, 3d_bevy_render, scene, std, bevy_winit, multi_threaded, webgl2`
  (1–2). That list has no Linux window backend (winit refuses to compile
  without `x11`/`wayland`) and no picking; both are per-target additions.
- Cost: 27.5 CPU-minutes cold; 42.3 MB after wasm-bindgen, 26.0 MB / 7.6 MB
  gzipped after native `wasm-opt -Os --strip-debug`; fat LTO buys 7 % for a
  9-minute link; incremental rebuilds take 14 s; the `wasm-bindgen` CLI must
  match the locked crate version exactly (3–4).
- A running face pins about 90 MB of wasm linear memory per module instance
  (92 MB Quori, 85 MB Toasty, 5.3 MB after `init()` alone), for the page's
  lifetime: the glue caches its instance at module scope and an ES module
  record is never released.
- Headless Chromium composites the WebGL2 canvas with no flags (5).
- Two `App::run()`s in one module cannot coexist while the first loop lives;
  after `AppExit` a second `mount` in the same instance succeeds (winit clears
  its flag when the spawned loop finishes); two **instances of the same
  module** (distinct import URLs) also run two faces; one App with one
  transparent full-page canvas and one viewport camera per DOM rect works once
  the global `ClearColor` is `NONE` (6–8; S:challenge-wasm-one-module 5).
- The four interop crates check clean for wasm32; `crates/vizij` stops at
  arora's `native` feature and then at tokio `rt-multi-thread`/`net`,
  crossterm, rand/getrandom; the app's own sources are host-bound in seven
  places, none in `view.rs` (9–11).
- Loading a GLB from a `Uint8Array` through `MemoryAssetReader`/`Dir` with
  `AssetMetaCheck::Never` renders with zero `.meta` requests
  (S:challenge-wasm-one-module 3).

**Device + view in one module** (S:challenge-wasm-one-module): the arora
device composed as `vizij-arora-web` does and the Bevy view build into one
cdylib (28.0 MB / 8.2 MB gzipped after wasm-opt, 7.6 % above the view-only
spike); the JS-owned device stepped from `requestAnimationFrame` and the view
reading `RigHal::pose()` per frame never contend, and a step's writes are
drawn one frame later (Bevy's rAF callback runs before the page's); Quori and
Toasty render in their own viewports on one canvas once each face's scene and
camera carry a distinct `RenderLayers` (all faces sit at the world origin);
25 `unloadFace`/`loadFace` cycles leave linear memory flat at 195.9 MB with
both faces resident (137.6 MB with Quori alone) and the WebGL context intact;
mesh picking under WebGL2 on SwiftShader reports the glTF node name and
RobotData id per click, casting against base vertices (a click on Quori's
thin mouth resolves to the face behind it); face-ready on SwiftShader is 2 s
for Quori and 16 s for Toasty, dominated by Bevy's glTF load; `bevy_picking`
+ `mesh_picking` add 1.6 MB and recompile twelve Bevy crates (1–5).

**arora on wasm32** (S:arora-wasm-constraints): `arora` with no default
features compiles; `Arora::step(dt)` is documented for an embedder clock;
`vizij-arora-host`'s `publish-frames` compiles; the animation host-module
registration is target-independent; `vizij-graph-core` does not build without
its default `urdf_ik` feature; `device.rs` assumes a worker thread in six
places, none in the composition (`builder_for` is pure); the device-side
Studio client is native-only by declaration (1–3, 7–9, 11, 13–14).

**Bevy on Android** (S:bevy-android-spike; S:challenge-verdicts C7):

- The ros-viz-rs recipe is `cargo-ndk` + a four-file Gradle project with no
  Java/Kotlin (`NativeActivity`, `android.app.lib_name`) (1).
- Bevy 0.19 selects **no** Android activity backend by default; with
  `bevy/android-native-activity` the whole `vizij` crate type-checks for
  `aarch64-linux-android` with 0 errors, `studio` included; the cmake
  requirement (aws-lc-sys) comes from the cloud TTS provider's reqwest (2–4).
  A check is not a link: oboe's `c++_static`, aws-lc's assembly and wasmtime's
  signal handling are unverified at link and at run time.
- A minimal APK builds and installs (56 MB under the workspace profile when AGP
  strips it); Bevy's `audio` feature raises the API floor to 26; without it
  minSdk 24 holds (5–7).
- **The face draws and animates under Vulkan on the API 34 and 35 arm64
  images** with the host GPU (MoltenVK through gfxstream) and with `-gpu
  lavapipe` on API 35, from the APK's assets, release-profile Rust code;
  emulator frame rates are 3.3 and 1.8 frames per second and bound nothing on
  hardware (S:challenge-android-render 1–2). Nothing draws under SwiftShader
  (wgpu-hal turns its 1 s acquire timeout into a device loss, wgpu issue 9029,
  open through 30.0.1), under any GLES build (a GLSL ES image-qualifier
  compile error on GLES 3.1, `SURFACE_VIEW_FORMATS` refused on GLES 3.0), or
  on the API 32 image (its Vulkan advertises 1.3 without `maintenance4`, so
  wgpu reads a zero buffer limit; that image is retired). `dumpsys gfxinfo`
  counts HWUI frames only and reads 0 even when the face draws; screenshots
  are the evidence. The recommended CI shape (x86_64 API 35 `google_apis`
  under KVM with `-gpu lavapipe`) was not run here; the lavapipe result is
  from the arm64 image on an M1 host (S:challenge-android-render 1, 3–4).
- No file picker exists for a Bevy app on Android (`rfd` has no backend); the
  SAF route needs one Kotlin `Activity` subclass; `bevy_egui` 0.42 is the line
  for Bevy 0.19 (0.39 pins Bevy 0.18); the APK's `assets/` is Bevy's asset
  source, a file in `filesDir` needs a file `AssetSource` or bytes in memory
  (10–13).
- `arora::studio::connect()` cannot run on Android as is: its app-data
  directory discovery (exe dir, `$HOME`, cwd) has no writable candidate there;
  the standalone and Studio's app both bypass it. The cloud TTS provider's
  reqwest installs `rustls-platform-verifier`, which on Android panics unless
  its Kotlin AAR is packaged and initialised (S:challenge-verdicts C7).

**Desktop bridge and registration** (S:challenge-ws-bridge-and-operator): an
in-app `AroraWSServer` over a `ServerConfig` with the control panel on, a
registry from `free_inputs`, a `reset` method and a `WsBridge` injected with
`with_bridge` answers `list_keys`, accepts `write_values`, runs `invoke reset`
and serves `GET /` (verified over the wire); `invoke` never reaches the run;
`studio::connect()` + `Bridge::update_device_info` registers with an app-owned
owners/name file, `connect_with_operator` is only needed for a prompt flow;
`rfd`'s `AsyncFileDialog` from a `NonSendMarker` system is the non-blocking
dialog on macOS (1–4).

### 2.11 Packaging, CI and publishing

- ros-viz-rs is a complete, green, single-crate release pipeline for a Bevy app:
  dmg (unsigned `create-dmg` script), deb (`cargo deb`), rpm
  (`cargo generate-rpm`), exe, apk (cargo-ndk + Gradle, debug-keystore
  signed), GitHub release tagged from `Cargo.toml`; Android emulator smoke on
  GitHub-hosted Ubuntu with KVM; one WebGL2 bundle to npm, WebGL2 + WebGPU
  only for its Pages demo (S:packaging-and-ci 1–6; S:challenge-verdicts C9).
- Its tag-from-manifest step does not transfer: vizij-rs's root manifest is a
  virtual workspace with no version. Its Windows job installs Npcap (pnet),
  which vizij does not need, and not NASM, which `aws-lc-sys` needs on Windows
  under every feature set of `vizij` (S:challenge-verdicts C9).
- vizij-rs CI never builds `vizij` without features, for wasm32, for Android,
  or on macOS; crates are published by hand-triggered OIDC Trusted Publishing
  in a fixed order and the tree is ahead of the registry; `vizij`,
  `vizij-arora`, `vizij-arora-store`, `vizij-arora-hal`,
  `vizij-animation-module` and `vizij-bundle` are `publish = false` at 0.0.0;
  npm packages are wasm-pack builds published by changesets over OIDC
  (S:packaging-and-ci 7, 10–12).
- vizij-web consumes vizij-rs only through the registry (`@vizij/runtime
  ^2.4.0`); local work symlinks through `wasm-links.mjs`; its Playwright suites
  run headless on SwiftShader and assert page errors, never pixels; Android
  release signing exists in `android.yml`; GitHub runners carry the Android
  SDK/NDK (S:packaging-and-ci 13–17).
- Nothing releases the Bevy app today; both the APK and wasm-bindgen need a
  `cdylib`, which the binary-only crate does not have (S:packaging-and-ci 19–20).

### 2.12 Drift and leftovers worth fixing on the way

README claims that are false today (S:standalone-anatomy 14): `ros2` as a
default feature, "10 Hz", remote-reachable control panel, transport controls in
the panel. Four Tauri commands without callers and three events without
listeners (S:standalone-anatomy 15). `demo-animation-studio/AGENTS.md` claims a
render dependency it does not have (S:demos-inventory 4). The standalone README
says pull requests build the debug APK; the workflow is dispatch-only
(S:demos-inventory 11). `crates/vizij/README.md` describes the web-parity
capture as reproducible; the spec is untracked (S:native-app-anatomy 13).
`ros-viz-rs/docs/MAINTAINER.md` describes a GameActivity build the pipeline
does not use (S:bevy-android-spike 1).

## 3. Target picture

### 3.1 One crate, four entry points

`crates/vizij` becomes one package with `[lib] crate-type = ["rlib", "cdylib"]`
and the `vizij` binary. No consumer takes the view without the face or the
face without the view, so there is no `vizij-view`/`vizij-face` split
(repo rule: extract only on real redundancy). The modules are named for what
they are — components of a device, not the device (section 1.1):

| Module | Content | Targets |
| --- | --- | --- |
| `view` | today's `view.rs`, `meta.rs`, `snapshot.rs`, `frames.rs` as a Bevy plugin, with per-face state as components rather than startup resources (one App hosts N faces): `FaceMeta` from bytes (the only entry), an in-memory asset source, pose application, frames (the rendered face into the store as an image), viewport fit, picking events, selection highlight, holds. The fit takes a rect and derives the camera per viewport; `rootBounds` is that rect's default and nothing in the API binds the rect to the GLB, so VIZ-130's animatable view rect stays open | all |
| `face` | the composition: `load_face` over bytes (the GLB's bindings and bundle into one graph spec), `builder_for` / `builder_with_guests` (the graph, the `RigHal`, the store and the modules folded into an `AroraBuilder` a host may extend), the free inputs, the neutral pose, the skills' fragments | all |
| `modules` | the host modules, one file each: `animation` (the engine as `AnimationModule` state per load), `gaze`, `viseme`, `tts_piper` (feature); each exposes `host_module()` and its function ids so any Arora — Vizij's or a robot's — loads it | all (Piper native) |
| `native` | the driver of a stand-alone face device: the Arora on a worker thread under arora's operator flow, the local WS bridge (`arora-bridge-ws` with the face's inputs and skills in its registry), the ROS 2 and Studio bridges the build adds, and a `RuntimeHandle` (`reload(bytes)`, `set_background`) so the TUI, the egui panel and the file dialog are interchangeable front ends | native, Android |
| `web` (`cfg(target_arch = "wasm32")`) | the wasm-bindgen surface, moved from `vizij-arora-web`, which is retired: `mount`, `loadFace` → a `FaceRuntime` (the page-paced Arora of one face, guest wasm modules loadable beside the host-linked ones), `placeFace`, picks, `describe`; no Bevy `App` is built until `mount` | wasm32 |
| `android` (`cfg(target_os = "android")`) | `#[bevy_main]`, the SAF/VIEW plumbing, the app-data directory; an `android/` Gradle directory in the crate | Android |
| `panel` (feature `egui`, `bevy_egui` 0.42) | the one egui `Operator` and device-info panel: owners, name, model family, endpoints, layout (root bounds, background); reused by desktop and Android | native, Android |
| `main.rs` | the desktop binary — the one place a device is spawned: CLI, TUI (feature `tui`), the window, `--ros2`, `--studio` | desktop |

A host that is already a device takes what it needs: `face::load_face` and
`face::builder_for` for the composed graph and its `RigHal`, `modules::*` for
the functions, `view::ViewPlugin` for the drawing — and folds them into its
own `AroraBuilder` beside its own HAL, store and bridges. Until arora holds
several HALs (section 1.1, P0.5), such a host wraps the robot's HAL and the
face's `RigHal` in one `Hal` of its own that routes by key; the runtime
change removes that wrapper.

Features: `desktop` (default) = `arora/native`, `arora/tui`, tokio
`rt-multi-thread`, crossterm, clap, env_logger; `studio` = `arora/studio-bridge`
(which implies `arora/native` until arora splits the Studio connector from the
executor hosts, ARORA-79); `tts-piper` (carries `rodio`); `egui`. `arora` is
declared with `default-features = false`; the wasm build takes none of the
native features.

Bevy: the seven-feature base (`default_app, 3d_bevy_render, scene, std,
bevy_winit, multi_threaded, webgl2`) plus `bevy_picking` and `mesh_picking` on
every target, `x11` and `wayland` under `cfg(target_os = "linux")`,
`android-native-activity` under `cfg(target_os = "android")`. No `audio`
feature (the app never uses Bevy's audio; it also lifts the API-26 floor on
Android).

Publication: the crate stays `publish = false`; the GitHub release is the
distribution. There is no Studio-branded build: Studio connects to a
stand-alone `vizij --studio` instance (section 3.7).

STUDIO-256's spike (`vizij-render` and a scene crate on Andy's unpushed
branch `feat/vizij-render-core`) is not a dependency and not the road taken
here: it shows how a scene could consume a face renderer, and one of its
findings is carried as a requirement (per-face state as components, never
startup resources, so one App hosts several faces). When the scene work
wants a face renderer, it consumes the repurposed `view` (as a library crate
if that is what it needs); that crate boundary is decided then, not now.

### 3.2 The browser: one module instance per page, faces as viewports

- **One module, both halves.** The device and the view share one wasm module
  and one thread; the view holds a clone of each device's `RigHal` and reads
  `pose()` at frame time, exactly as `view.rs` does natively; there is no
  mirror and no render store.
- **The JS drive stays the pacer.** `step(dt)` and `run(period)` keep today's
  meaning, `stop`/`running` are forwarded; the device is constructed and
  steppable without an `App` (the five Node tests and the authoring e2e run it
  with no canvas). No Bevy system steps the device: Bevy's wasm `Update` runs on
  `requestAnimationFrame`, which a hidden tab halts, whereas `run()` keeps the
  device alive on timers; and arora-web's device slot is private. `vizij::web`
  composes its surface over arora-web's public pieces rather than wrapping
  `AroraWeb`, or arora-web gains a constructor over a shared slot (P0).
- **One module instance per page, one `App` for the page's lifetime, N devices,
  one shared canvas.** The wrapper stays the memoized singleton `@vizij/runtime`
  2.x is; `mount(container)` once per page creates the App and a transparent
  canvas spanning the container; `loadFace(faceId, glb)` / `unloadFace(faceId)`
  spawn and despawn a face's scene, `Camera3d` and device; `setRects` places
  one viewport per face slot (the verified overlay pattern, `ClearColor::NONE`);
  `pick(faceId, x, y)` forwards slot pointer events. This covers the authoring
  app's main, reference and empty-state faces, the demo's one, and the
  showcase's five without a special case. Faces sit in slots spaced along
  X, so a camera sees only its own face: a mesh carrying `RenderLayers` renders
  its morph targets at zero weight on Bevy 0.19.1's storage-buffer path. A pick
  is cast over the morphed positions of the faces under the pointer. The
  App normally lives as long as the page; `unmount` is available as `AppExit`
  plus a canvas clear and a memory-source purge, and a later `mount` restarts
  cleanly (verified). A second module instance is not a supported pattern
  (linear memory is 137.6 MB with one face resident and 195.9 MB with two, flat
  over 25 load/unload cycles; the page may drop its own GLB copy after
  `loadFace`). A step's writes are drawn one frame later than they are made.
  The animation host module's engine becomes per-device state (closures over
  an owned engine) before N devices share an instance.
- **What the JS API adds**: `stop`, `running`, `mount`/`unmount`, `loadFace`,
  `unloadFace`, `setRects`, `pick`, `describe(gltf)` (bundle metadata for the
  UI: programs, clips, pose config, input constraints, over
  `Bundle::from_gltf_json`), `spawn(call)`/`halt(taskId)` over the interpreter
  module's SPAWN/HALT, `setSelection`, `showSelectionGlow`, `hold`,
  `setRootBounds`, `ready`/`error` status, `onStep`, and a `startRuntime`
  option `audio: { play, unlock }` with a default Web Audio implementation in
  the JS shim over one page-shared `AudioContext`. `composeFace` gains ad-hoc
  sources so the authoring motiongraph editor's `setGraphBundle` and its
  `applyGraphEdits` diff path keep working (VIZ-58 re-scoped). The `modules`
  argument of `start` goes: the animation module is linked as a host module
  (guest glue re-gated on `target_os = "wasi"` first), and
  `@vizij/animation-module`'s browser artifact and the `animation-module-boundary`
  CI job retire with the guest path.
- **The `${namespace}/` path prefix is retired**: one face is one device with
  its own store, so paths are the face's own (`rig/<faceId>/…`,
  `standard/…`), as on the native device. This is a protocol change for every
  consumer that builds `namespace/…` paths: the authoring app (11 files),
  `node-graph-authoring`, `tutorial-agent-face`, the showcase's control panel;
  they migrate with `runtime-react` 1.0. The `@vizij/render` store keys
  (`namespace/id`) are a different concept and stay with the headless store.
- **Loading**: `loadFace(faceId, bytes)` feeds `FaceMeta` and Bevy's glTF
  loader from one buffer through the in-memory asset source registered before
  `AssetPlugin`, each push under a fresh path, the previous scene despawned, the
  binding index reset; `AssetMetaCheck::Never`. A GLB without RobotData (plain
  Blender exports, the reference face's `aggressiveImport`) goes through the JS
  loader and the headless exporter before its first `loadFace`, because
  `FaceMeta` yields nothing for it.
- **One bundle, WebGL2.** `webgpu` stays a cargo feature built on dispatch until
  a consumer asks and CI can test it. Load-time UX (progress, caching,
  first-paint placeholder) is the page's job. `pkg/` (glue + wasm) is deployed
  as static assets and shipped once in the npm package.

### 3.3 The authoring app keeps its world model in JavaScript

- The viewport swaps at the `VizijRuntimeFace` seam; the panels do not change.
- `@vizij/render` is **kept and reworked over the Bevy view**: its `Vizij`
  React component becomes a face slot on the page's shared canvas (section
  3.2) with the same props its consumers pass today, so the authoring app and
  `runtime-react` keep importing it with minimal changes; the loader
  (`traverseThree`, `aggressiveImport`, clip extraction), the exporter
  returning bytes, the bundle helpers, the world types without React refs, and
  a store slimmed to world, animatables, values and selection stay. Deleted:
  the r3f canvas, the three.js renderables, the selection glow effect, the
  feature hooks, the memory counters. Added: the ~120-line scene-graph builder
  and a shared decoder for arora struct/f32 defaults (verified,
  S:challenge-headless-export). The exported node TRS and morph weights are
  the **authored defaults**, not the runtime pose snapshot; the shipped faces
  are re-exported once. Studio adopts this package (STUDIO-239), Bevy
  underneath; Studio may later use the Rust crates directly if that proves
  simpler. A Rust exporter is JSON-chunk surgery over the source GLB
  (RobotData schema, TRS, materials, BIN chunk verbatim) next to
  `vizij-bundle`; later, not a gate.
- **Structural edits** reach the view as they reach the device today: by
  reload, now as `loadFace(faceId, exportedBytes)` with the reload keyed on
  world data only; the export is a JSON re-serialization plus a buffer copy,
  and the Bevy load time per edit is measured in P4b before the path is
  accepted; static-feature scrubbing gets a `setStaticFeature` delta command so
  it does not export and reload per tick. Animatable descriptor edits and
  input values are device calls, unchanged.
- **Editor contract**: events out `picked(elementId)` (the app consumes one
  hit; Bevy's mesh ray cast uses base vertices, three's applied the morphs: a
  click on a thin morphed mesh lands on the element behind it, so the editor
  picks by nearest RobotData element within a tolerance), `pointerMissed`, `ready`/`error`, `onStep` (the
  motiongraph value sampler); commands in `setSelection(ids)`,
  `showSelectionGlow` (drawn as `Gizmos` polylines from CPU-extracted feature
  edges of the base mesh, since Bevy's wireframe is unavailable on WebGL),
  `setRootBounds` (the showcase, Studio's layout tab), `hold(paths)` (output
  locks stay a view-side hold applied between the `RigHal` read and pose
  application, per animatable and per component, matching
  `runtimeOutputLocks.ts`; the device keeps publishing), `loadFace`,
  `setStaticFeature`. Safe area, background and fit have no editor consumer:
  the safe-area outline stays a command for Studio's upload modal only, the
  background is CSS, the view fits on load and resize. `Element.id` is read
  from RobotData (the parser drops it today).
- **Render contract in `view`**: a lit material path for `standard`/`phong`
  elements reproducing three.js under one ambient light of π/2 (diffuse ×
  (1 − metalness) × ambient + emissive; `phong` adds specular/shininess),
  `basic` staying unlit, with a committed golden for the Blender-export preset;
  per-axis RobotData bindings (`translation.x`, `rotation.r`) so Studio-loaded
  faces read (section 3.7); vec2 translation and scalar rotation deferred
  until an exporter emits them (no shipped GLB and no authoring factory does).
  HSL is not an addition: no `Value` kind carries it and a static HSL colour is
  baked into the glTF material at export. **Ellipse and rectangle are out of
  the contract**: the loader converts a RobotData `ellipse`/`rectangle` node
  into a `shape` with a synthesized unit circle or plane mesh scaled by
  `width`/`height` and drops stroke features with a logged warning; no shipped
  face is affected.
- `VIZ-59`'s equivalence check gates the deletion of the pose-control bridge
  that lives in the same drained-changes path as the mirror.

### 3.4 Speech: `say` on every device, the agent outside

- `vizij-arora-tts` gains a wasm32 branch **under one skeleton**: one `Run`,
  one `say`, one content-keyed run map living in the module closure
  (`Provider { config, runs }` captured by the described function; a `static`
  cannot hold a `js_sys::Function`), `synthesize` unchanged over reqwest's
  fetch backend, and a target-gated producer: tokio + rodio natively (playhead
  from `Sink::get_pos()`), `spawn_local` + the page's `play(bytes, marks) →
  playhead()` on wasm. `API_URL` becomes a constructor parameter on every
  target (`examples/say.rs` constructs the provider). The `AudioContext` unlock
  is the page's, at the click that requests the microphone; a still-suspended
  context reports playhead 0 so the lips wait with the audio. **Halt reaches
  the provider as silence**: a run not polled for 250 ms stops its playback
  and leaves the run map, in the JS playback and in the native producer's loop
  alike, so a halted utterance stops and a repeated `say` restarts. The missing run id in the module ABI
  (arora-sdk `docs/async-functions.md`) stays a recorded limit: an agent
  repeating a sentence while it still plays collides.
- The browser device registers what the native device registers: the TTS host
  module, the `say`/`play_viseme` fragments with the face's rig prefix, the
  gaze module and `look_at` fragment (zero-dependency data); the ROS4HRI
  mapping stays the bundle's opt-in (composed when the GLB embeds
  `standard::ros4hri` or the page asks), matching today. The two skill
  compositions (standalone `skills.rs`, native `device.rs`) collapse into
  `vizij::face`. The fragments' `taskrun` node runs on the browser interpreter
  through the same synchronous in-process dispatch as natively, verified in
  headless Chrome (`play_viseme` through its envelope; the wasm `say` streaming
  visemes at the page's playhead, once per tick, never after terminal); the
  two wasm-bindgen tests join `vizij-arora-tts` and CI runs them under
  `wasm-pack test --headless --chrome` (Chrome and chromedriver of one version).
- **Lips through the standard need adaptations the faces lack.** The JS lipsync
  retires only once every shipped face carries a standard viseme adaptation:
  every tracked GLB carrying a bundle (fourteen in vizij-web) is re-exported
  with its `standard-adaptation` graph grafted (`vizij-bundle add-standard`; a
  sidecar exists for Quori only) and the authoring app's profile binding
  (vizij-web #133) authors the other faces' adaptations (P4a). The authoring
  `SpeechPanel`/`DemoVoicePanel` and the showcase
  `VoicePanel` are private JS-lipsync copies: they move onto the device's `say`
  in P4b, or are listed as surviving pose-weight producers; the "one viseme
  vocabulary" claim holds only if all of them go.
- **One agent demo** in the standalone's folder: a text agent (microphone →
  Deepgram → OpenAI, the STT/LLM half of `speech-react` kept as shared source
  if the authoring app keeps its conversation panel, else as app source) calling
  `say` through `spawn`, interrupting through `halt`. `tutorial-agent-face`
  stays beside it, because vizij.ai's public tutorials are built on it: it is
  ported on `runtime-react` 1.0 with its guidebook pages (P4b), its speech
  moved onto the device (`say`, or the standard viseme keys for Gemini's
  audio stream).
- **The face standard gains a conversation-state tier and an expression
  producer**: `standard/vizij/conversation/{speaking,user_speaking,thinking}`
  and `standard/vizij/expression/<name>`, adapted per face like the visemes
  ([VIZ-135](https://linear.app/semio-ai/issue/VIZ-135), a proposal; the
  standard's page and `vizij-bundle`'s coverage check are updated with it). The agent writes only standard keys: `speaking` around its
  run (1 on spawn, 0 on terminal status or stop; VIZ-128 is why the run status
  alone is not the source), `user_speaking` and `thinking` from its own state,
  expressions by standard name with the tutorial's synonym table as the
  agent-side mapping. The bundle's `speechConfig` keeps `voice`,
  `visemeGroupId` and `emotionGroupId` as the face's adaptation hints; the
  three topic paths, `mode`, `agentName`, `systemPrompt`, `autoActivateMic`
  and `apiBaseUrl` stop being exported and are ignored.
- Retired with the standalone: `@vizij/speech-react` (deprecated on npm, removed
  from the publish set), `--deepgram-key`, `--openai-key`, `--auto-mic`,
  `--speech-mode`, `--silence-ms`, and the `speak`/`interrupt`/`mute_microphone`
  WS app methods.

### 3.5 Desktop

The `vizij` binary composes its own local bridge the way the standalone does,
with no arora change: an `AroraWSServer` over a `ServerConfig` (`--bind`,
control panel on, `validate_paths` on) wrapped in `WsBridge`, the registry
mirrored from `free_inputs(&spec)` plus a `reset` method re-staging the
neutral inputs through the sibling store, `look_at`/`say` as registry methods
whose handlers dispatch through the device's public `LocalCaller` (fire and
forget: a client watches the run's status keys; a result-carrying `invoke` is
an `arora-bridge-ws` follow-up), `arora/*` filtered from pushes (they would
otherwise reach every client at 100 Hz), one server per device generation,
cancelled when the generation ends. `--studio` calls `studio::connect()` and
`Bridge::update_device_info` from an app-owned persisted owners/name file, and
`connect_with_operator` with the front end's `Operator` (the TUI prompt on a
terminal, the egui panel under `--features egui`) when nothing is persisted; the
Studio bridge is injected first, because the run serves the operator only the
first bridge's identity and access requests. The open-file path is Bevy's
`FileDragAndDrop` (no dependency) and `rfd`'s `AsyncFileDialog` created in a
`NonSendMarker` system and polled from a task (`FileDialog` would stall the
schedule), `rfd` with `default-features = false` and the `xdg-portal` backend
on Linux; `--glb` becomes optional only with a face-less first generation. The
standalone's window flags (`--fullscreen`, `--display`, `--width/--height`,
`--no-decorations`, `--always-on-top`, `list-displays`), `--glb <url>` and the
remembered last model are added: the guidebook's deploy and multi-screen pages
rest on them.

### 3.6 Android

The `android` module on the ros-viz-rs recipe (cargo-ndk, Gradle,
`NativeActivity`), targetSdk 34, minSdk 24 (no Bevy audio), arm64-v8a first.
One Kotlin `Activity` subclass that `System.loadLibrary`s the same cdylib,
handles the SAF picker (`ACTION_GET_CONTENT`) and both VIEW intent filters
(`launchMode="singleTask"`, `onNewIntent`) into `filesDir/model.glb`, loads
that file at launch when present, and sets immersive sticky mode and
keep-screen-on; the egui panel (section 3.1) with display-cutout spacers only
while it is open. Owners, device name and model family persist under
`filesDir` and answer the `Operator` prompts, prompting only when absent.
arora gains an app-data-directory override (`ARORA_DATA_DIR`, read before its
discovery, or an entry taking explicit key and token paths), set from
`AndroidApp::internal_data_path()`; the alternative without an arora change is
setting `HOME` before connecting. The cloud TTS provider's TLS root store is
decided before the first `say` on Android: package and initialise
`rustls-platform-verifier`'s AAR from `android_main`, or switch the provider to
a preconfigured webpki store as `arora-studio-bridge-client` does. Vulkan is
the only Android backend: a GLES build fails structurally in Bevy 0.19.1, and
the one hardware property that can still refuse Vulkan is a swapchain with no
sRGB format on a driver without `VK_KHR_swapchain_mutable_format` (bevy issue
15452), so a swapchain-format probe is the first step on a tablet. The
device-loss policy is `RenderErrorPolicy::Recover` or an explicit restart
(wgpu turns a frame over 1 s into a device loss; the default policy panics). Logging:
`android_logger` in `env_logger`'s place, Bevy's `LogPlugin` disabled as on
desktop. No `ros2-*` on Android. The applicationId (keep
`com.vizij.standalone` for in-place upgrades, or a new id with an uninstall
step) and the move of the signing secrets to vizij-rs are decided before the
first release. Rendering is verified on the API 34/35 emulator images
(section 2.10); the tablet run checks the hardware-only properties (swapchain
formats, frame rate, device-loss recovery) over adb, scripted.

### 3.7 Semio Studio

- **`apps/vizij-app` dissolves.** A stand-alone `vizij --studio` instance is
  what Studio connects to, the same way it connected to that app: the device
  registers with a name, model family and owners, appears in Studio, and is
  driven from there. The Tauri shell goes because a native Bevy window cannot
  coexist with tao on macOS or Android; what the app did that the `vizij`
  binary does not, the device-info form layered defaults ⊕ Studio-held
  (`Bridge::get_device_info()`) ⊕ operator input with a device restart on
  change, moves into the egui panel and the persisted owners/name file.
  semio_studio hosts no Rust and no branded artifact for this. STUDIO-257's
  first three items carry over to the panel; its fourth (the value mirror)
  disappears. An existing `vizij-app` identity file is not migrated.
- **A Studio-key profile is this project's deliverable**: under the `studio`
  feature, `vizij::face` composes a mapping source from `FaceMeta` bindings
  (like `ros4hri_source`) that strips `.target_position`, aggregates
  `<uuid>.{x,y,z}` / `{r,p,y}` / `{r,g,b}` into the compound key, drops
  `.studio_value` and `.target_velocity`, and echoes `<id>.position` as
  feedback. The bridge E2E (a Studio-side writer moves a scalar and a compound
  animatable of a fixture face) proves it and is P7's gate; semio_studio's
  `device-bridge-local.spec.ts` launches a deleted binary and asserts
  registration only. Studio's `retrieveGlb` (`GET_MODEL_GLB`) has no
  device-side responder in `arora-studio-bridge-client` 6.1.0 although `RigHal`
  implements `HalAssets`: P7 adds the responder (an ARORA ticket) or records
  that create-project-with-device needs a matching model asset in Studio.
- **A face is hardware of a device, not a second device** (section 1.1).
  Stand-alone, `vizij --studio` is the device. Inside a robot's device, the
  face is one more HAL and a few more modules under the robot's registration —
  Studio's own model, where Vizij content is a scene within the robot's scene
  and its animatables sit beside the robot's, already says so. What follows
  holds for both.
- **The scene screen shows the face from the device's state, as an image the
  view produces.** The scene keeps three.js as its surface; what changes is
  what the screen's texture is. Today `screen.tsx` hosts Studio's own
  `packages/vizij` renderer inside a drei `RenderTexture`, drawn from the
  values store (S:studio-consumers 11): a second face renderer, drifting from
  Vizij's. After: the Arora-side view renders the face and publishes each
  frame into the device's store — `view::frames` already does, natively:
  `display/face/compressed`, a PNG in the `sensor_msgs/CompressedImage` shape,
  at a rate (15 Hz under ROS4HRI), a HAL reading like any other key — and the
  screen's material maps that key, decoded in the browser. The Studio bridge
  carries arora `Value`s, so the frame travels as the `ArrayU8` field of the
  image structure; its wire encoding is JSON today (a byte per number), which
  is why the compact bytes encoding of the buffer wire format is on arora's
  side of this (an ARORA item, with the rate as the knob until then). The
  face-on-a-screen is then the same pixels as the robot's, and Studio's
  `packages/vizij` renderables retire from the scene too — leaving the upload
  modal's preview and export, `packages/core`'s loader and the stories, which
  **adopt `@vizij/render`** (STUDIO-239 proceeds), Bevy underneath.
- **Where the device runs decides how the image gets there.** A native
  `vizij --studio`, or a robot device with a face: the store key over the
  Studio bridge, above. A device Studio runs **in the page** — a device of
  Studio on Arora's World
  ([plan](https://github.com/semio-ai/semio_studio/pull/489), code from
  [#256](https://github.com/semio-ai/semio_studio/pull/256) on: one Arora
  store in the page, a namespace per device) — hosts the face as a component
  of that wasm module: the same `face`, `modules` and `view` linked into it (two
  cdylibs cannot share a store, S:studio-consumers 17), the frame either read
  back (`Screenshot` on WebGL2, the P0.2 spike) or sampled straight from the
  view's canvas as a `CanvasTexture`, no readback. This path **depends on
  studio-arora landing** and on it linking `vizij`'s library; it is a Studio
  decision, recorded here as a dependency (risk 13), not taken by this
  project. Until it lands, every face Studio shows live is a device over the
  bridge.
- **The scene reads a device's keys through Studio on Arora's seams**, however
  the device runs: the store port (Arora's `DataStore`: read, slot, subscribe)
  the scene, Vizij and animation packages are injected with (that plan's P4),
  and `SceneBinding`'s list of the store keys a view shows, each with the
  features it feeds: strings, no Studio type (its P5). A device over the bridge
  is mirrored into the same store under its id, so the face image key reaches
  the screen the same way from a stand-alone `vizij --studio`, a robot or an
  in-page device. A key crosses the bridge under its own name only if the
  bridge's key mapping round-trips it, and `display/face/compressed`, which
  has no component, comes back as `display/face.compressed`
  ([studio-bridge#102](https://github.com/semio-ai/studio-bridge/issues/102)).
- **Later**, when the scene itself moves to Bevy (STUDIO-256's render-to-
  texture, 1.05 ms per face), the face is an entity of the scene's App and
  the image round trip disappears. The Bevy scene takes from `SceneBinding`
  the store keys each view shows and reads them from the World's store in
  Rust; Studio's projection of them into its values store is what retires.
  The `view` crate boundary is decided then.
- Studio-exported faces (per-axis RobotData) become readable by the Bevy view
  through the per-axis bindings of section 3.3; the GLB-format convergence
  itself stays STUDIO-239's.
- A browser face reaching Studio **as a device** (a page's `FaceRuntime`
  registering over a browser device client, `zenoh-ts`) is a studio-bridge
  deliverable, not part of the retirement.

### 3.8 Fate of every app

| App | Fate |
| --- | --- |
| vizij-standalone | Tauri shell and native second device deleted (P8a); folder becomes the agent + Vizij demo (P8b) |
| tutorial-fullscreen-face, demo-vizij-player | ported on `runtime-react` 1.0 (P4b) |
| vizij-authoring | ported (P4b) through the reworked `@vizij/render`, after the authoring work in flight lands; SpeechPanel moves onto `say` (3.4) |
| tutorial-agent-face | ported on `runtime-react` 1.0 with its guidebook pages (P4b); its public routes keep working |
| vizij-showcase | ported on the shared-canvas viewports (P4b); the reference for many faces per page |
| demo-graph-studio, minimal-demo-graph | unchanged (no face) |
| demo-animation-studio, minimal-demo-animation, minimal-demo-animation-graph | deleted with Vizij's animation engine: a face's animations play in its device through Arora's animation module ([vizij-web#206](https://github.com/vizij-ai/vizij-web/pull/206)) |
| `@vizij/animation-react` | deleted with them ([vizij-web#206](https://github.com/vizij-ai/vizij-web/pull/206)) |
| vizij-ws-app, `packages/@vizij/arora-types`, `scripts/check-snap-env.mjs`, `dev:vizij-standalone` | deleted |
| `@vizij/animation-module` (browser artifact), `vizij-arora-web` | retired into the host-module path and `vizij::web` |
| semio_studio `apps/vizij-app` | dissolves; Studio connects to a stand-alone `vizij --studio` (3.7) |
| semio_studio `packages/vizij` | replaced by `@vizij/render` (STUDIO-239) except the scene-screen renderables, which stay on three.js (3.7) |
| semio_studio `studio-arora` (PR #256) | out of scope; a Studio decision (3.7) |

### 3.9 Packaging, CI and tests

- **Release** on a pushed `vizij-v<version>` tag (the mechanism
  `publish-npm.yml` already uses; no tag-from-manifest job, no version-bump
  gate): per-OS `cargo build -p vizij --release --features studio` (no
  `tts-piper`: GPLv3 and baked rpaths; `ros2-dds` only if packaged), uploaded as
  bare binaries plus the APK from P6 and the gzipped wasm; the Windows job adds
  NASM for `aws-lc-sys`; Linux jobs install Bevy's apt headers. The
  installers (dmg through `package_macos.sh`, deb through `cargo deb -p vizij`,
  rpm through `cargo generate-rpm -p vizij`, exe) are part of the same release
  and **gate the retirement of the standalone** (P8a); they ship unsigned and
  un-notarized until credentials exist. Artifact feature sets are tabled in
  the workflow.
- **npm**: `@vizij/runtime` 3.0.0 is published under the `next` dist-tag
  (`latest` stays on 2.4.0); P4a's additions ship as 3.x minors, published on
  merge, and 3.x becomes `latest` when P4b lands; `files` stops shipping `pkg/`
  twice; `pkg/` is refreshed or CI-built so the Node tests are a live gate.
- **CI tiering**: per PR, `cargo check --lib --target wasm32-unknown-unknown
  --no-default-features` and `cargo ndk -t arm64-v8a check -p vizij --lib
  --no-default-features --features studio,egui` (with
  `bevy/android-native-activity`), the native tests, and a Linux build of the
  binary; on `main` and dispatch, the `wasm-pack` WebGL2 build followed by a
  Playwright step that mounts Quori and Toasty on a 763×486 canvas at DPR 1
  with an opaque black clear, waits for the `ready` signal and uploads the two
  canvas screenshots, plus the APK job and the emulator smoke: x86_64 API 35
  (or 34) `google_apis` under KVM on `ubuntu-latest`, `-no-window -gpu
  lavapipe -noaudio -no-boot-anim`, emulator 36.4.9 or later, never
  `swiftshader_indirect` (it loses the device), a release-profile library
  (debug builds' naga debug info crashes gfxstream's validator); install,
  launch with a pushed fixture GLB, wait at least 15 s, then assert a
  screenshot showing the face, two screenshots 5 s apart differing in the
  animated region, and no `Caught` line in logcat (`dumpsys gfxinfo` reads 0
  for Bevy and proves nothing). A self-hosted Apple-silicon Mac with `-gpu
  host` is the GPU-backed variant; GitHub's arm64 macOS runners cannot run the
  emulator. The wasm-bindgen browser tests of `vizij-arora-tts` run in the
  same job as the wasm build.
  `rust-cache` keyed on lock + target + feature set; each Bevy target is 2–5 GB
  against the repo cache cap.
- **Visual oracle**: the committed native golden set (plus the Blender-export
  golden) stays the reference; `snapshot-regression` takes `needs: [wasm]` and
  compares the wasm screenshots to the same references with the same
  `mean_diff` when `VIZIJ_WASM_SNAPSHOTS` names the directory; tolerance 10/255
  until the first SwiftShader-versus-lavapipe measurement says otherwise; the
  three.js collages under `docs/compare/` are frozen. A macOS/Metal strict run,
  as ros-viz-rs keeps, is decided once the wasm case shows the drift.
- **Memory**: the native heap-floor test stays; the authoring
  memory-checkpoint scenarios (25 mount/unmount cycles, StrictMode included)
  gate the browser view; Android samples `dumpsys meminfo` in the smoke script.
- **Size gates**: a gzipped wasm ceiling per release (floor 7.6 MB) and the APK
  size next to it.

### 3.10 What is retired

`apps/vizij-standalone`'s Tauri shell and native run, `packages/@vizij/speech-react`,
`.github/workflows/android.yml` (vizij-web, after vizij-rs produces a signed
APK), `scripts/check-snap-env.mjs`, the untracked leftovers, `@vizij/render`'s
React renderer and canvas, `runtime-react`'s mirror and JS composition,
`vizij-arora-web` (into `vizij::web`), `@vizij/animation-module`'s browser
artifact and the `animation-module-boundary` job, semio_studio's
`apps/vizij-app`, the standalone's speech flags and WS app methods, and the
`namespace/` path convention.

## 4. Plan

Phases end with a gate CI or a named person can check. Sizes are relative
(S: days, M: one to two weeks, L: several weeks of one person). The critical
path to the web renderer's retirement is P0 → P1 → P3 → P4a → P4b → P8b, the
agent demo P3b → P4c → P8b; the Android path is
Gate 0 → P1 → P6 → P8a; P5 starts now and P7 follows it.

### P0 Now, in parallel (each S)

1. **Gate 0, Android rendering: passed** on the emulator (API 34/35 arm64,
   host GPU and lavapipe, Vulkan; S:challenge-android-render) and in CI:
   [`android.yml`](https://github.com/vizij-ai/vizij-rs/blob/main/.github/workflows/android.yml)
   boots the x86_64 API 35 `google_apis` image under KVM on `ubuntu-latest`
   with `-gpu lavapipe`. The tablet is no longer needed to prove that Bevy
   0.19 renders and is used in P6 for the hardware-only properties.
2. **Spikes on the existing wasm target dir**: done for bytes loading, App
   restart, picking, the one-module device + view, and the `taskrun` fragments
   in headless Chrome (S:challenge-wasm-one-module, S:challenge-tts-wasm).
   The animation host module and `spawn`/`halt` are in the browser module;
   hidden pages step on a timer. Still to run: a `Screenshot`/`Readback` on
   WebGL2 (CI's browser snapshot uses a page screenshot); one WebGPU
   measurement.
3. **Studio bridge E2E harness** in semio_studio: a Studio-side writer
   (`studio-bridge`'s `tui` binary or a zenoh script) writes
   `<id>.target_position` for one animatable of a fixture face; the face process
   logs what reached its HAL. Expected today: the mismatch of section 2.9; the
   harness is P7's gate.
4. **Hygiene with real consumers**: `vizij-graph-core` compiles without
   `urdf_ik`; `@vizij/runtime` ships `pkg/` once and refreshes it; the native
   TTS playhead reads `Sink::get_pos()`; the animation module's guest glue is
   gated on `target_os = "wasi"` and its engine becomes per-instance state
   (verified with a real `wasm-pack build` and an import-table inspection);
   `exportScene` returns bytes, `load-gltf` parses buffers first, React refs
   leave the world types, the lodash import loads under Node; the drift of
   section 2.12.
5. **arora-sdk**: the app-data-directory override (gates P6.2); **several
   HALs in one device** (section 1.1: the builder takes HALs the way it takes
   bridges, each owning the keys it describes, writes fanned out by key,
   update streams merged; the ARORA ticket is filed by this plan and its
   design precedes P7, where a robot device first takes a face); optionally
   `pub use arora_bridge_ws` under `native` so `vizij` does not pin the bridge
   crate in lockstep; the `studio-bridge`/`native` split (ARORA-79) if a
   wasmtime-free Android build is wanted; a `stop` path or run id for `say`
   (contract change, documented if deferred).
6. Publishing the player crate chain (VIZ-126 hygiene) is off the retirement
   path: its only 1.0.0 consumer is the standalone's lock, which P8a deletes.

### P1 Crate layout and the view module (S to M)

One crate, lib + bin, the modules of section 3.1; the `view` module is a pure
move of today's four files, then its face state becomes per-face components
(the snapshot goldens guard both steps); `desktop` default feature;
per-target Bevy tables; `FaceMeta` from bytes as the only entry; the
`RuntimeHandle`. First commit: the wasm32 and
cargo-ndk check jobs in CI (with `--features studio`). Gate: `snapshot-regression` unchanged; both
checks green; the Linux binary builds; the 33 tests plus one that drives the
composition for N frames headless through `SnapshotPlugin` and reads a pose
through `RigHal`.

Deferred to P4a as P1b: the lit material path with its Blender-export golden,
per-axis bindings, `Element.id`, the `vizij-bundle` container sharing.

### P3 The browser module (M) ∥ P3b browser `say` (M)

P3: `vizij::web`, `mount`/`unmount`, `loadFace`/`unloadFace`, `setRects`,
`describe`, `stop`/`running`, `spawn`/`halt`, the animation module as a host
module, the WebGL2 `wasm-pack` job, the Playwright screenshots, the
`snapshot-regression` wasm case. Gate: Quori and Toasty on a plain page within
tolerance; 25 `loadFace`/`unloadFace` cycles with bounded memory and no WebGL
context loss; each viewport showing its own face alone; the five Node tests green. The
25 cycles run in `npm/@vizij/runtime/tests/browser/memory.mjs` and natively in
`crates/vizij/tests/headless_face.rs`.

P3b (independent, starts now in the interop crate): the TTS wasm branch (the
per-target producers of `vizij-arora-tts`, with the 250 ms idle-stop rule in
both), the audio hook, the two wasm-bindgen tests in CI, the fragment
registration on the browser device, the adapted re-exports of the four
shipped faces. Gate: a Playwright spec calls `say` and
asserts `standard/vizij/viseme/<shape>` changes over time and the hook received
bytes and marks.

### P4a What the web consumers need (M to L)

Every capability an app reads or calls exists before any app moves, so no app
is pinned to the 0.4 line and none works around a gap:

- **The standard and the shipped faces.** The `vizij-face` profile gains
  blink, the apps' emotions and the conversation-state tier. The tracked GLBs
  are re-exported with their standard adaptation and the authored defaults
  (3.3, 3.4).
- **`@vizij/runtime` 3.x,** one minor per item, published on merge:
  - `describe()` returns the face's bundle (poses and groups, rig inputs with
    ranges and defaults, programs with labels, clips, metadata);
  - programs started, paused, stopped and replaced at run time, several at
    once;
  - the bundle's clips loaded into the animation module, with their transport
    and state from JavaScript;
  - `reset()` over the `rest` module;
  - framing and tone mapping per face;
  - the authoring view's surface (picks with misses, selection glow, `hold`,
    `setStaticFeature`, the headless exporter's bytes);
  - P1b's render contract.
- **`@vizij/node-graph` 0.9** across vizij-web, independent of the rest.

The gate is a browser test per capability, and `vizij-bundle validate` at L2
for every shipped face.

### P4b The web consumers, landed together (L)

`@vizij/render` 1.0 makes `Vizij` a face slot on the page's shared canvas.
`@vizij/runtime-react` 1.0 is the provider over `describe` and the device
API. The mirror, the JS composition, the three.js bundle extraction, the
neutral staging, the guest-module loading and the `namespace/` prefix are
deleted, along with `@vizij/speech-react`.

Every app moves:
- `tutorial-fullscreen-face`;
- `demo-vizij-player`;
- the showcase, its slots on one canvas;
- `tutorial-agent-face`, with its guidebook pages;
- the authoring app.

The authoring app follows its own order:
1. The picking, pixel and GLB-export e2e are built before the port.
2. The headless exporter and the plain-GLB import → export → load path.
3. The viewport swap.
4. The motion-graph editor and the timeline on the runtime's programs and
   clips.
5. The memory-checkpoint workflow in StrictMode.
6. The Bevy load time per structural edit, measured and accepted.

Each app's smoke spec gains the `ready` signal and a non-uniform canvas pixel
sample. One integration branch takes one pull request per package or app and
reaches `main` once all are green. `@vizij/runtime` 3.x then becomes `latest`.

### P4c The agent demo (M)

Depends on P3b and on the standard's conversation-state tier. The
standalone's folder is rewritten as the text agent over `spawn(say)`/`halt`,
writing the conversation-state and expression keys by standard name;
`speech-react` is deprecated.

### P5 Desktop (M, starts now)

The in-app local bridge and registry (section 3.5) with a wire test inside
`cargo test -p vizij` (`list_keys` lists the inputs, one `write_values`
accepted, `invoke reset` succeeds, `GET /` is the panel); `--studio` through
`connect()` + `update_device_info` and the persisted owners/name file; the egui
`Operator` panel built once here (feature `egui`); `FileDragAndDrop` and the
`rfd` dialog; the window flags, URL loading and remembered model; the release
workflow with a binary and an installer per desktop OS; a CHANGELOG for
`vizij`. Gate: a tagged release with dmg, deb, rpm and exe; with no
`DEVICE_OWNERS`, the prompt appears and registration succeeds. The `deploy/*`
guidebook pages are rewritten when this ships.

### P6 Android (L, after Gate 0 passes)

The `android` module, the Gradle directory (pinned `ndkVersion`, targetSdk 34),
the Kotlin subclass, the app-data directory, the persisted answers, the
auto-load, the TLS decision, `android_logger`; then a **link-and-launch gate**
with `studio` and the cloud TTS compiled in (aws-lc through cmake, oboe,
wasmtime if still present: logcat shows the bridge registering); CI `apk` +
the rendering `smoke` of 3.9 on main and dispatch, `cargo ndk check` per PR;
signing from `android.yml`'s pattern moved to vizij-rs. **Retirement gate: an
adb script** (`android/scripts/device-gate.sh`) run against Victor's tablet
plugged in or reached by `adb connect`, repeatable and runnable from a
self-hosted runner on demand: probe the swapchain formats first (an sRGB
format, or `VK_KHR_swapchain_mutable_format`), install the release APK, load a GLB through a
VIEW intent (`am start` on a pushed file) and through the picker (a UI
Automator tap sequence, or a debug-only intent extra when the picker cannot be
driven), reboot, assert the face and its Studio identity come back, then claim
once in Studio and move a scalar and a compound animatable from the bridge
E2E writer; then force a device loss and check `RenderErrorPolicy::Recover` brings the
face back; every step leaves a screenshot and logcat in the run's artifact
folder, which the Linear ticket links with the APK sha and the
device model and Android version.

### P7 Semio Studio (M, after P5 and Studio on Arora's P4 and P5)

The Studio-key profile under the `studio` feature; the E2E of P0.3 passing on
a scalar and a compound animatable with a stand-alone `vizij --studio` as the
device (the face loaded from a Studio-exported, per-axis GLB), registered and
driven the way `apps/vizij-app` was; **the face image on the scene screen**
(section 3.7: `screen.tsx` maps the device's `display/face/compressed` key,
read through the store port under the device's namespace and named in
`SceneBinding`; the bridge carries it once its name round-trips,
studio-bridge#102; the rate is the knob; gate: the scene shows the
stand-alone device's face moving under the E2E's writes); the `retrieveGlb`
decision; `apps/vizij-app` deleted with its references (`package.json`,
`.changeset/config.json`, the two docs pages); STUDIO-239 pointed at the
reworked `@vizij/render` and STUDIO-257 re-targeted at the panel. The in-page
device path (studio-arora hosting the face component) is a Studio decision
taken outside this phase; a robot device taking a face beside its own HAL
waits on P0.5's arora change.

### P8a Retire the Tauri standalone (S, after P6's gate and P5's installers)

Delete the Tauri shell, the native run, `android.yml` (once vizij-rs has
produced a signed APK), `check-snap-env.mjs`, `dev:vizij-standalone`, the
leftovers; the four `deploy/*` pages, `deploy/swap-the-speech-provider.md`,
`deploy/bring-your-own-visemes.md`, `deploy/hardware-ros-and-multi-screen-topologies.md`;
a README for the Android app replacing the standalone's Android section.
Gate: no `@tauri-apps/*` in vizij-web's lockfile; no Tauri instructions under
`deploy/*`.

### P8b Retire the web renderer (M, after P4b and P4c)

`three` only in the authoring app's loader; `@vizij/render` headless;
`speech-react` gone; the 25 further vizij-web pages and vizij-docs
`ARCHITECTURE.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `STANDARD_INPUTS.md`,
`control/paths-and-standard-controls.md`, `control/orchestration-and-diagnostics.md`,
vizij-rs `docs/skills.md` and `crates/vizij/README.md`; the website
projection regenerated; `../summary.md` and ROADMAP; the tickets re-pointed:
VIZ-13, VIZ-58, VIZ-59, VIZ-74, VIZ-77, VIZ-126, VIZ-128, VIZ-130, VIZ-131,
STUDIO-239, STUDIO-256, STUDIO-257, ARORA-79.

## 5. Risks and open questions

Risks, most severe first:

1. **Android hardware is unverified** although the emulator draws
   (S:challenge-android-render): a tablet whose Vulkan swapchain lists no
   sRGB format and lacks `VK_KHR_swapchain_mutable_format` fails
   `Surface::configure` in Bevy 0.19.1 (bevy issue 15452, a fix belongs to
   bevy_render or wgpu); wgpu maps a frame over 1 s to a device loss (issue
   9029), so recovery must be configured; emulator frame rates bound nothing.
   The emulator's CI shape (x86_64 image under KVM with lavapipe) and linking
   and launching with `studio` and TTS are covered by the Android smoke. The
   fallback (Tauri shell
   around the wasm view) stays recorded, off the path.
2. **Browser payload and memory**: 28 MB / 8.2 MB gzipped per page for the
   combined module; 137.6 MB of linear memory with one face resident, 195.9 MB
   with two, flat over 25 load/unload cycles (a high-water mark: what Bevy
   retains in its allocator and GPU-side buffers are not measured); one
   instance per page is the design, faces as viewports; the size ceiling and
   the 25-cycle memory gate protect it. Face-ready on SwiftShader is 2 s for
   Quori and 16 s for Toasty, the latter unexplained and unmeasured on a GPU.
   A face slot living in another stacking or scroll context than the shared
   canvas is not covered.
3. **Studio's writes do not reach the face** (section 2.9): the key profile
   in P7 is the mitigation; until then no app moves a face from Studio.
4. **Lips need adaptations the shipped faces lack**: P3b re-exports the four
   GLBs; the authoring app gains adaptation embedding; otherwise `say` speaks
   without a mouth on every face but Quori.
5. **Studio-capable builds ship wasmtime** until arora splits `studio-bridge`
   from `native`; on Android that puts wasmtime's link and initialisation on
   the gate path.
6. **Export semantics change**: the exporter writes authored defaults, not
   the runtime pose; three of five shipped faces differ on the first frame
   until the device writes, and are re-exported once.
7. **The say contract has no stop and no run id**: interruption by silence is
   a convention; repeated utterances collide; an arora ABI change if the demo
   needs better.
8. **Cold build cost**: 27 CPU-minutes per wasm build, 20+ minutes per APK;
   the tiering and caching of section 3.9 are part of the design.
9. **The reference face's plain-GLB path** depends on the headless exporter
   landing before the viewport swap (ordered in P4b).
10. **Installers are on the critical path** without signing or notarization
    credentials; a dmg that macOS refuses to open is a gate that cannot close
    until they exist.
11. **Two Bevy face renderers may coexist for a while**: `view` here and
    STUDIO-256's spike on Andy's machine; the plan takes nothing from that
    branch, so the only cost is agreeing, when the scene work needs a face
    renderer, that it consumes the repurposed `view` rather than the spike.
12. **A hybrid device has no home in arora yet**: the builder takes one HAL.
    A robot adding a face wraps two HALs in one of its own until arora holds
    several (P0.5); the wrapper is a real `Hal` (routing by key, merging
    updates), so nothing built on it is thrown away, but two wrappers in two
    hosts is the drift this plan exists to avoid.
13. **A face on Studio's in-page devices has not landed**: Studio on Arora is
    on main
    ([semio_studio#623](https://github.com/semio-ai/semio_studio/pull/623)),
    and the face-on-a-screen path that goes through it (section 3.7) needs it
    linking `vizij`'s library. Until then the scene shows faces
    only from devices over the bridge, at the bridge's frame cost (JSON
    bytes until the buffer wire format lands).

The eleven decisions of the first review are recorded in section 1. Still
open for Victor: a tablet, only if the newer emulator images also draw nothing
(Gate 0); the VIZ ticket for the standard's conversation-state tier.

Open technical questions (the studies and the code on main closed bytes
loading, App restart, picking, the one-module device + view, the `taskrun`
fragments in headless Chrome, `reqwest` and `spawn_local` in the device's tick,
the `AudioContext` unlock, Android rendering on the emulator and in CI, and the
private files directory of a NativeActivity process): `Screenshot` readback on
WebGL2 (also the in-page face-on-a-screen's readback, or the `CanvasTexture`
alternative); the frame's wire cost over the Studio bridge at 15 Hz and the
rate a scene screen needs; the hidden-tab behaviour of a mounted page; one WebGPU measurement;
the overlay canvas's alpha across wgpu versions; a tablet's swapchain formats, frame rate and device-loss
recovery; Toasty's 16 s face-ready time; frame time of the combined module on
a GPU adapter with several faces.

## 6. Acceptance criteria

1. `vizij-standalone` no longer exists as a Tauri app; its folder holds the
   agent + Vizij demo on the wasm view.
2. Every face-rendering app in vizij-web draws through the wasm Bevy view on
   one shared canvas per page, via `@vizij/render`'s reworked `Vizij`;
   `@vizij/render` contains no three.js renderer; `three` is a dependency of
   its loader and exporter only.
3. The native app and the wasm view render the two reference faces and the
   Blender-export preset within the golden tolerance in CI; the Android app
   renders them on the named tablet.
4. On that tablet: install from the APK, open a GLB from the picker and from a
   VIEW intent, reboot and recover the face and its Studio identity, claim the
   device once in Studio, move a scalar and a compound animatable from Studio.
5. `say` works on the native app and in the browser demo, lips driven by the
   viseme players from the same fragment on every shipped face.
6. A stand-alone `vizij --studio` instance registers with Studio and is driven
   from Studio the way `apps/vizij-app` was, in the bridge E2E, loading a
   Studio-exported face; `apps/vizij-app` is gone.
7. A tagged release carries a binary and an installer (dmg, deb, rpm, exe) per
   desktop OS.
8. The agent demo writes only standard keys: visemes through `say`, the
   conversation-state tier, expressions by standard name.
9. The guidebook's deploy, integrate and control pages describe the new
   surfaces; the runtime summary and the tickets of P8b point here.
