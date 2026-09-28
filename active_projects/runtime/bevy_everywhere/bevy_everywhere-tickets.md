# Tickets for one Bevy view everywhere
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,standalone,bevy,wasm,android,authoring -->
> **Last updated:** 2026-09-28
> **Related documents:** [Central plan](bevy_everywhere-plan.md) · [Reading guide](bevy_everywhere-deck.md) · [Sub-studies](studies/)

The plan's phases decomposed into tickets, each with a definition of done a
reviewer can check and the implementation cues the studies produced. The
tickets live in the Linear project
[Rust Rendering for Vizij and the Studio Scene](https://linear.app/semio-ai/project/rust-rendering-for-vizij-and-the-studio-scene-8339c10df2b1/overview);
under the umbrella issue [VIZ-158](https://linear.app/semio-ai/issue/VIZ-158),
which also carries the working notes below; this page is the source they were
created from and is edited first when a ticket changes. Sizes: S days, M one to two weeks, L several weeks of one
person. Repos: vizij-rs unless stated.

Dependency spine: T01–T07 and T24 start now; T08 → T09 → T10 → T12 → T13 ∥ T15 → T23;
T08 → T18 → T19 → T22; T16 starts now → T17 → T22; T20 → T21; T20 → T25. Every ticket
below links its Linear issue; the issues carry the same scope, definition of
done and cues, and the blocking relations of this spine.

## Working notes for implementers

- Spike code: vizij-rs branch `spikes/bevy-everywhere`; its README lists what
  each directory establishes. Build outputs are not committed: a cold Bevy
  wasm build is about 27 CPU-minutes, a cold Android build about 20 minutes,
  a source change 14–37 s; the `wasm-bindgen` CLI must match the lock
  (0.2.128); the native `wasm-opt` binary is needed.
- Repo rules that bite here: vizij-rs work in sibling worktrees with their
  own `target`; its pre-commit runs clippy (3–5 min) and pre-push the
  workspace tests; never `cargo build --workspace` in arora-sdk; semio_studio's
  Rust is crates.io-only; a new crate's or npm package's first publish is
  manual (Trusted Publishing cannot create it); breaking changes are real
  MAJOR bumps with a CHANGELOG; docs and commits state what is true, not how
  it came to be; no draft PRs.
- Not a dependency: STUDIO-256's `vizij-render` branch (Andy's machine only).
  Out of scope: a browser face reaching Studio as a device (studio-bridge's).
  `studio-arora` (semio_studio PR #256, draft) is a dependency of the in-page
  face-on-a-screen path only; the scene screen itself is T25.
- The face is a component of a device, not the device (plan §1.1): the crate's
  modules are `view`, `face`, `modules`, `native`; "device" is the binary's
  stand-alone Arora and what Studio registers; the JavaScript surface hands
  out a `Runtime`.
- The vizij-docs validators hardcode another machine's path; check links by
  hand.

## P0, now, in parallel

### T01 Android emulator smoke in its CI shape (S) — [VIZ-136](https://linear.app/semio-ai/issue/VIZ-136)

**Scope.** A GitHub Actions job on `ubuntu-latest` that boots an x86_64 API 35
(or 34) `google_apis` image under KVM with `-gpu lavapipe`, installs a
Bevy 0.19 APK built from the spike recipe, and asserts that a face renders.

**Done when.** The job is green on `main` and on dispatch; it uploads a
screenshot showing the face, two screenshots 5 s apart that differ in the
animated region, and a logcat with no `Caught` line; a deliberately broken
render (a panic in a system) turns it red.

**Implementation cues.** Emulator 36.4.9 or later; never
`-gpu swiftshader_indirect` (wgpu-hal turns its 1 s acquire timeout into a
device loss, wgpu issue 9029); release-profile Rust code or `WGPU_DEBUG=0`
(naga's debug info crashes gfxstream's SPIR-V validator); first capture at
least 15 s after launch; `dumpsys gfxinfo` reads 0 for Bevy and proves
nothing; boot 25–35 s and first frame 10 s on the arm64 image on an M1, the
x86_64 image under KVM is unmeasured. Recipe and flags:
`studies/challenge-android-render.md`, ros-viz-rs `android-apk.yml` and
`android/scripts/smoke-test.sh` for the KVM and screenshot steps.

### T02 Studio bridge end-to-end harness (S, semio_studio + studio-bridge) — [VIZ-137](https://linear.app/semio-ai/issue/VIZ-137)

**Scope.** A test that starts a face device on the Studio bridge, has a
Studio-side writer set one animatable, and records what reached the device's
HAL. Today it documents the mismatch; in T21 it passes.

**Done when.** `RUN_BRIDGE_E2E=1` runs it locally against the router; its
output names the key Studio wrote and the key the device indexed; the
existing `device-bridge-local.spec.ts` no longer launches the deleted
`studio-bridge-headless` binary.

**Implementation cues.** Studio writes `<id>.target_position`,
`<id>.target_velocity`, `<id>.studio_value` and reads `<id>.position`, where
`<id>` is the RobotData UUID for scalars and `<uuid>.<axis>` for vectors,
eulers and colours (`apps/studio/src/store/subscriptions/device-subscriptions.ts:431-449`,
`packages/vizij/src/functions/gltf-loading/map-features.ts:46-73`); the Bevy
view indexes bare UUIDs and the Studio client passes keys verbatim. A
Studio-side writer: the `studio-bridge` `tui` binary or a zenoh script.
Study: `studies/studio-consumers.md`, `studies/challenge-verdicts.md` (C6).

### T03 vizij-rs hygiene with real consumers (S) — [VIZ-138](https://linear.app/semio-ai/issue/VIZ-138)

**Scope.** `vizij-graph-core` compiles with `default-features = false`; the
native TTS playhead reads `Sink::get_pos()` and both producers stop a run not
polled for 250 ms; the animation module's guest glue is gated on
`target_os = "wasi"` and its engine becomes per-instance state; `crates/vizij`
drops its unconditional `rodio` and `crossterm`.

**Done when.** `cargo check -p vizij-graph-core --no-default-features`
passes; a `wasm-pack build` of a crate that host-links `vizij-animation-module`
shows no `env.arora_dispatch` import in its import table; two devices in one
process own separate animation engines (a test); the say test in
`crates/vizij/src/device.rs` still passes; a halted native say run goes
silent within 250 ms (a test).

**Implementation cues.** `eval/eval_node.rs:20-21` and
`eval/graph_runtime.rs:8` import `urdfik` unconditionally; `rodio 0.20.1`
has `Sink::get_pos()` (`sink.rs:351`); the guest gate is
`vizij-animation-module/src/arora_generated/arora.rs:1-6`; the global engine
`vizij-animation-module/src/lib.rs:82-90`; the native play loop with no
idle-stop rule is the spike's `src/lib.rs:327`
(`studies/challenge-tts-wasm.md` 7). `rodio` is used only in `tts_piper.rs`;
`crossterm` only in `main.rs:352-355`.

### T04 `@vizij/runtime` packaging hygiene (S) — [VIZ-139](https://linear.app/semio-ai/issue/VIZ-139)

**Scope.** The npm package ships its wasm once, its `pkg/` is CI-built (or
refreshed) so the five Node tests are a live gate, and `stop()`/`running`
from arora-web 6.1.0 are forwarded.

**Done when.** The tarball holds one copy of the `.wasm`; `pnpm --filter
@vizij/runtime test` passes against a freshly built `pkg/` in CI; a
self-paced runtime can be stopped from JS.

**Implementation cues.** `files` lists `dist/` and `pkg/` while
`scripts/copy-wasm-pkg.mjs:49-57` copies `pkg/` into `dist/`; the checked-in
`pkg/` lags the source by six weeks and the `registries` test fails against it
(`studies/browser-device-anatomy.md` 15); `vizij-arora-web/src/lib.rs` has no
`stop`.

### T05 `@vizij/render` export and loader hygiene (S, vizij-web) — [VIZ-140](https://linear.app/semio-ai/issue/VIZ-140)

**Scope.** `exportScene` returns bytes (the download moves to the caller);
`load-gltf` parses an `ArrayBuffer` before trying a blob URL; React refs leave
the world types; the lodash import in `create-stored-data.ts` loads under Node
ESM; a Node test loads and re-exports Quori headlessly.

**Done when.** The spike's headless round-trip (Quori, Hugo, Toasty: zero
RobotData, bundle and material differences) runs as a `node --test` in the
package.

**Implementation cues.** `studies/challenge-headless-export.md` findings 1–3
and its T3 list of what stays; the blob-URL branch wins whenever
`URL.createObjectURL` exists, including Node; `import { createRef } from
"react"` is pulled by the world types today.

### T06 arora-sdk: app-data directory override and bridge re-export (S, arora-sdk) — [VIZ-141](https://linear.app/semio-ai/issue/VIZ-141)

**Scope.** `arora::studio::connect()` and `connect_with_operator()` accept an
app-data directory (`ARORA_DATA_DIR`, or an entry taking explicit key and
token paths) before their discovery; `arora` re-exports `arora_bridge_ws`
under `native`.

**Done when.** A test connects with a directory that discovery would not
find (no exe dir, no `HOME`, cwd `/`); `vizij` compiles against
`arora::arora_bridge_ws` without pinning the bridge crate itself.

**Implementation cues.** `ensure_app_data_dir()` runs first in `connect()`
(`src/studio/mod.rs:202`); `app_data_files.rs:24-49` tries the exe dir,
`dirs::home_dir()` (none on Android) and cwd; `IDENTITY_FILE` moves only the
token. `studio-bridge` implies `native` (`Cargo.toml:39-45`): splitting them
is ARORA-79 and is wanted only for a wasmtime-free Android build.

### T24 arora-sdk: a device holds several HALs (M, arora-sdk) — [ARORA-103](https://linear.app/semio-ai/issue/ARORA-103)

**Scope.** `AroraBuilder::with_hal` accepts several HALs (or a `with_hals`);
the runtime keeps a vector, each HAL owning the keys it describes, a write
fanned out to the owner of each key, the update streams merged into the step
loop's inbound as the bridges' are; `HalAssets::model_glb` with a stated
composition rule; `docs/architecture.md` says HALs.

**Done when.** A device built with two `FakeHal`s over disjoint key sets
routes each write to the right one and sees both update streams in its
store; a host extends `vizij`'s `face::builder_for` output with a second HAL
without wrapping (a doc example).

**Implementation cues.** Plan §1.1: a robot adds a face as one more piece of
hardware under one Studio registration, and a face grows into a robot by
adding a HAL — a builder line only if the runtime holds several HALs. The
bridges' vector (`AroraBuilder::with_bridge`, the merged inbound) is the
model. Overlapping ownership is a build error, not a merge rule. Until it
lands, a hybrid host wraps its HALs in one `Hal` routing by key (risk 12).

### T07 The remaining wasm spikes (S) — [VIZ-142](https://linear.app/semio-ai/issue/VIZ-142)

**Scope.** On the one-module spike crate: a `Screenshot`/`Readback` on
WebGL2 in headless Chromium; the hidden-tab behaviour of a mounted page
(does `run(period)` keep `say` runs alive while `requestAnimationFrame` is
paused); one WebGPU build and measurement; the animation host module and
`spawn`/`halt` in the combined module; frame time with two faces on a GPU
adapter.

**Done when.** `studies/challenge-wasm-one-module.md` has a numbered finding
per item, each verified or marked NOT RUN with the reason.

**Implementation cues.** The spike crate and its page harness are in
[vizij-rs `spikes/bevy-everywhere/challenge-wasm/`](https://github.com/vizij-ai/vizij-rs/tree/spikes/bevy-everywhere/spikes/bevy-everywhere/challenge-wasm)
(branch `spikes/bevy-everywhere`); source changes rebuild in 14–37 s on the
warm target; face-ready is 2 s (Quori) and 16 s
(Toasty) on SwiftShader.

## P1, the crate

### T08 `crates/vizij` as lib + bin with per-target features (M) — [VIZ-143](https://linear.app/semio-ai/issue/VIZ-143)

**Scope.** One package, `[lib] crate-type = ["rlib", "cdylib"]` plus the
binary; modules `view`, `device`, `web` (wasm32), `android`, `panel`
(feature `egui`); `desktop` default feature (`arora/native`, `arora/tui`,
tokio `rt-multi-thread`, crossterm, clap, env_logger); `arora` declared
`default-features = false`; Bevy trimmed to `default_app, 3d_bevy_render,
scene, std, bevy_winit, multi_threaded, webgl2` plus `bevy_picking`,
`mesh_picking`, with `x11`/`wayland` under Linux and
`android-native-activity` under Android; `FaceMeta` from bytes as the only
entry; the `device` command handle (`reload(bytes)`, `reregister`,
`set_background`); CI jobs `cargo check --lib --target wasm32-unknown-unknown
--no-default-features` and `cargo ndk -t arm64-v8a check --lib
--no-default-features --features studio,egui`.

**Done when.** `snapshot-regression` is unchanged; both check jobs are green;
`cargo build -p vizij` passes on ubuntu; the 33 tests pass plus one that
drives the composition headless through `SnapshotPlugin` for N frames and
reads a pose through `RigHal`.

**Implementation cues.** The view half (`view.rs`, `meta.rs`, `snapshot.rs`,
`frames.rs`, 1,482 lines) depends on nothing host-bound; the device half holds
tokio, the TUI, threads and bridges (`studies/native-app-anatomy.md` 1–3, 16).
`arora`'s `native` pulls wasmtime, cranelift, ratatui, crossterm; the seven
Bevy features alone do not compile on Linux (winit needs `x11` or `wayland`)
and lack picking (`studies/challenge-verdicts.md` C10). The `vizij-render`
spike of STUDIO-256 is not a dependency.

### T09 Per-face components and render layers in the view (S) — [VIZ-144](https://linear.app/semio-ai/issue/VIZ-144)

**Scope.** The view keeps every face's state as components on its scene
root, never as startup resources; each face's scene and camera carry a
distinct `RenderLayers` propagated over the spawned hierarchy; the binding
index is per face; `Element.id` is read from RobotData.

**Done when.** Two faces render in one App natively and in the wasm spike
page, each camera showing only its face; `snapshot-regression` unchanged;
picking reports the RobotData id.

**Implementation cues.** All faces sit at the world origin, so without
layers every camera sees every face; `HierarchyPropagatePlugin::<RenderLayers>`
plus `Propagate` on the scene root did it in the spike
(`studies/challenge-wasm-one-module.md` 2); mesh picking filters on the
camera's layers; `RawRobotData` in `meta.rs:86-98` drops `id` today.

## P3, the browser module

### T10 `vizij::web` and `@vizij/runtime` 3.0-alpha (M) — [VIZ-145](https://linear.app/semio-ai/issue/VIZ-145)

**Scope.** The wasm-bindgen surface moved from `vizij-arora-web` into the
crate's `web` module: today's device API verbatim plus `stop`, `running`,
`mount(container)` once per page, `loadFace(faceId, bytes)`/`unloadFace`,
`setRects`, `pick(faceId, x, y)`, `describe(gltf)`, `spawn`/`halt` over the
interpreter module, `setSelection`, `showSelectionGlow`, `hold`,
`setRootBounds`, `ready`/`error`, `onStep`, a `startRuntime` option
`audio: { play, unlock }`; the animation module host-linked and the `modules`
argument removed; the `namespace/` prefix gone; `AssetMetaCheck::Never` and
the in-memory asset source; one WebGL2 bundle built by `wasm-pack` in CI with
a Playwright screenshot step and the `snapshot-regression` wasm case;
`vizij-arora-web` deleted.

**Done when.** Quori and Toasty on a plain page match the goldens within the
32×32 mean-difference tolerance in CI; 25 `loadFace`/`unloadFace` cycles keep
linear memory flat and the WebGL context alive (a Playwright test); the five
Node tests pass; `pnpm --filter @vizij/runtime build` produces one `.wasm`;
`3.0.0-alpha` publishes through `publish-npm.yml`.

**Implementation cues.** The device stays JS-paced: Bevy's wasm `Update` runs
on `requestAnimationFrame`, which a hidden tab halts, and `AroraWeb`'s device
slot is private (`arora-web-6.1.0/src/lib.rs:181-199`), so compose the
surface over its public `store_json`, `LocalCaller` and the `behavior_error`
watch. Bevy's rAF callback runs before the page's, so a step's writes draw one
frame later. `App::run()` returns immediately on the web; `AppExit` then a
second `mount` works. Sizes: 28 MB / 8.2 MB gzipped after `wasm-opt -Os
--strip-debug`; 138 MB of linear memory with one face, 196 MB with two;
picking adds 1.6 MB. The `.meta` probe: `AssetPlugin { meta_check:
AssetMetaCheck::Never }` (`bevy_asset-0.19.1/src/lib.rs:254`). Wrapper
singleton and `init()` memoization stay (`npm/@vizij/runtime/src/index.ts:180-263`).
`composeFace` gains ad-hoc sources so `setGraphBundle` keeps working
(VIZ-58). Everything above is verified in
`studies/challenge-wasm-one-module.md` and `studies/bevy-wasm-spike.md`.

### T11 `say` in the browser (M) — [VIZ-146](https://linear.app/semio-ai/issue/VIZ-146)

**Scope.** The wasm32 branch of `vizij-arora-tts` under one skeleton (the
spike's cfg split), the page-side `play(bytes, marks) → playhead()` hook with
its default Web Audio implementation in the JS shim, `API_URL` as a
constructor parameter, the two wasm-bindgen tests in CI, the TTS host module
and the `say`/`play_viseme`/`look_at` fragments registered on the browser
device, and the four shipped GLBs (`Quori_Current_Extended`, `quori_temp`,
`Quori_Speaks`, `Hugo_Current_Extended`) re-exported with a standard viseme
adaptation.

**Done when.** A Playwright spec calls `say` on the browser device and asserts
`standard/vizij/viseme/<shape>` changes over time and the hook received bytes
and marks; `wasm-pack test --headless --chrome` runs in CI; each re-exported
face moves its mouth on `play_viseme("aa")`.

**Implementation cues.** `reqwest` with `json` already compiles for wasm32
(its fetch backend); only the producer (tokio runtime, rodio loop, `Instant`)
is native-bound; the run map holds a `js_sys::Function` and must live in the
module closure, not a `static`; the `AudioContext` unlock belongs to the page
at the click that requests the microphone; the fragments run on the browser
interpreter through the same synchronous dispatch as natively, verified
(`studies/challenge-tts-wasm.md` 1–10). Adaptation grafting:
`vizij-bundle add-standard`; a sidecar exists for Quori only
(`fixtures/faces/quori/standard-adaptation.json`). The CI job needs Chrome
and chromedriver of one version and the `wasm-bindgen` CLI pinned to the
lock (0.2.128). Runs are keyed by `hash(text, voice)`: a repeated sentence
while it plays collides (arora ABI, no run id).

## P4, the web consumers

### T12 `@vizij/runtime-react` 1.0 and `@vizij/render`'s face slot (M, vizij-web) — [VIZ-147](https://linear.app/semio-ai/issue/VIZ-147)

**Scope.** The provider over `describe()` and the device API: the value
mirror, the JavaScript graph composer, the three.js bundle extraction, the
neutral staging in JS and the guest-module loader deleted; `@vizij/render`'s
`<Vizij>` becomes a face slot on the page's shared canvas with its props
kept, its r3f canvas, renderables, glow effect and feature hooks deleted;
every consumer that builds `namespace/…` paths migrated (the authoring app's
11 files, `node-graph-authoring`, `tutorial-agent-face`, the showcase's
control panel); a `ready` signal and a non-uniform canvas pixel sample in
each app's smoke spec.

**Done when.** `tutorial-fullscreen-face`, `demo-vizij-player` (its
load-sample e2e) and `vizij-showcase` (five slots on one canvas) render on
the new module with their e2e green; `@vizij/runtime` 3.0.0 published;
`packages/@vizij/render` has no `three` import outside the loader and
exporter.

**Implementation cues.** `VizijRuntimeProvider.tsx` is 3,778 lines; the
mirror is `applyEngineChangesRef` → `setValues` (`:2645-2739`), the composer
`src/utils/composeGraph.ts`, the prefix `VizijRuntimeProvider.tsx:376-420`;
`VizijRuntimeFace` is the one mount site in every app (7 sites,
`studies/demos-inventory.md` 2); the showcase's `RigControlPanel.tsx:55-60`
builds the prefix itself; VIZ-59's pose-control bridge lives in the same
drained-changes path and is deleted after its equivalence check.

### T13 The authoring viewport on the Bevy view (L, vizij-web) — [VIZ-148](https://linear.app/semio-ai/issue/VIZ-148)

**Scope.** In order: a picking e2e, a pixel check and a GLB-export e2e (the
gate exists before the port); the headless exporter of T05 wired into
`ExportDialog` and the plain-GLB path (import → export → `loadFace`) for the
reference face; the viewport swap at `Viewer.tsx`; `setSelection` and
`showSelectionGlow`; `hold(paths)` replacing `transformOutputWrite`;
`setStaticFeature` for scrubbing; the reload keyed on world data only; the
authoring memory-checkpoint workflow in StrictMode; the Bevy load time per
structural edit measured.

**Done when.** The authoring smoke and workflow suites are green; the picking
e2e clicks a mesh and asserts the inspector target; the export e2e
round-trips Quori with zero differences; `preset-churn` and
`reference-face-churn` pass their 1 MB growth threshold in StrictMode; the
structural-edit reload time is recorded and accepted.

**Implementation cues.** Picking lands in `elementSelection` and the app
consumes only `[0]` (`Viewer.tsx:89-179`); the glow is drawn as `Gizmos`
polylines from feature edges of the base mesh (Bevy's wireframe is unavailable
on WebGL); Bevy's ray cast uses base vertices, so a thin morphed mesh needs a
tolerance or nearest-element pick; output locks filter rig output writes per
component (`runtimeOutputLocks.ts:147-217`) and stay a view-side hold; the
provider keys reloads on `JSON.stringify(world)` including mounted refs
(`updatePolicy.ts:77-93`); `aggressiveImport` yields no `FaceMeta`, hence the
export round-trip first. Studies: `authoring-viewport.md`,
`challenge-headless-export.md`, `challenge-verdicts.md` (C3).

### T14 The render contract for authored and imported faces (M) — [VIZ-149](https://linear.app/semio-ai/issue/VIZ-149)

**Scope.** In `view`: a lit material path for `standard`/`phong` elements
reproducing three.js under one ambient light of π/2 (`basic` stays unlit)
with a committed golden for the Blender-export preset; per-axis RobotData
bindings (`translation.x`, `rotation.r`) so Studio-loaded faces read; the
loader converts `ellipse`/`rectangle` nodes into shape meshes and drops
strokes with a warning.

**Done when.** `Quori_Latest_Blender_Export.glb` renders with its colours
(not black) and joins the snapshot goldens; a Studio-exported face renders
its translations and rotations; `snapshot-regression` unchanged for Quori and
Toasty.

**Implementation cues.** Blender exports carry their colour in
`emissiveFactor` over a black `baseColorFactor` with metallic 1, and
`view.rs:399-410` forces `unlit` (`studies/challenge-verdicts.md` C4);
Studio's world model is per-axis (`packages/vizij/.../map-features.ts:46-73`);
no shipped face carries a primitive (17 vizij-web and 6 Studio fixtures);
HSL is not a `Value` kind and is baked into materials at export.

### T15 The agent demo in the standalone's folder (M, vizij-web) — [VIZ-150](https://linear.app/semio-ai/issue/VIZ-150)

**Scope.** `apps/vizij-standalone` rewritten as one browser page: microphone
→ Deepgram → OpenAI (the STT/LLM half of `speech-react` kept as source) →
`spawn(say)`, barge-in through `halt`; `speaking`, `user_speaking`,
`thinking` and expressions written by standard name; `tutorial-agent-face`
folded in and its guidebook route re-pointed; `@vizij/speech-react`
deprecated on npm and removed from the publish set.

**Done when.** The page speaks a reply with lips driven by the device's
viseme players on a face carrying the adaptation; barge-in stops the audio
within 250 ms; the page writes no `rig/<faceId>/…` path; `speech-react` is
deprecated.

**Implementation cues.** Depends on T11 and on VIZ-135 (the conversation-state
tier); the standalone's speech controller and modes are in
`src/hooks/useSpeechController.ts` and `studies/speech-and-agent.md` 8–10;
`speaking` is written by the agent around its run (1 on spawn, 0 on terminal
status or stop), because a run can go terminal before the audio ends
(VIZ-128); `speechConfig` keeps `voice`, `visemeGroupId`, `emotionGroupId`
only.

## P5, desktop

### T16 The desktop binary's local bridge, registration and file open (M) — [VIZ-151](https://linear.app/semio-ai/issue/VIZ-151)

**Scope.** An in-app `AroraWSServer` over a `ServerConfig` (`--bind`, control
panel on) wrapped in `WsBridge`, the registry mirrored from `free_inputs`
plus `reset`, `look_at` and `say` handlers over the device's `LocalCaller`,
`arora/*` filtered from pushes, one server per device generation; `--studio`
through `studio::connect()` + `update_device_info` with a persisted
owners/name file and `connect_with_operator` with the egui `Operator` panel
(feature `egui`, `bevy_egui` 0.42) when nothing is persisted, the Studio
bridge injected first; `FileDragAndDrop` and `rfd`'s `AsyncFileDialog`; the
standalone's window flags (`--fullscreen`, `--display`, `--width/--height`,
`--no-decorations`, `--always-on-top`, `list-displays`), `--glb <url>`, the
remembered last model.

**Done when.** A wire test inside `cargo test -p vizij` lists the inputs,
accepts a `write_values`, runs `invoke reset` and gets the panel on `GET /`;
with no `DEVICE_OWNERS` the prompt appears and the device registers; a face
dropped on the window loads; each flag has a test or a documented manual
check.

**Implementation cues.** Everything is public in `arora-bridge-ws` and was
verified over the wire (`studies/challenge-ws-bridge-and-operator.md`):
`ServerConfig::with_port().bind_address().serve_control_panel(true)`,
`registry().set_keys`/`register_method_fn`, `WsBridge::new`; `invoke` never
reaches the run, so `look_at`/`say` handlers dispatch through the public
`LocalCaller` and clients watch status keys; the run serves the operator only
the first bridge's identity; `FileDialog::pick_file` would stall the schedule,
`AsyncFileDialog` from a `NonSendMarker` system does not; `rfd` with
`default-features = false` and `xdg-portal` on Linux; `bevy_egui` 0.39 pins
Bevy 0.18.

### T17 Release workflow with binaries and installers (M) — [VIZ-152](https://linear.app/semio-ai/issue/VIZ-152)

**Scope.** `release-vizij.yml` on a pushed `vizij-v<version>` tag: per-OS
`cargo build -p vizij --release --features studio` (no `tts-piper`),
installers (dmg through `package_macos.sh`, deb through `cargo deb -p vizij`,
rpm through `cargo generate-rpm -p vizij`, exe), the gzipped wasm attached,
NASM on Windows, Bevy's apt headers on Linux, a `CHANGELOG.md` for `vizij`.

**Done when.** A tag produces a GitHub release with one binary and one
installer per desktop OS, each launching `vizij --glb` on a clean machine of
that OS (manual check recorded in the release notes).

**Implementation cues.** ros-viz-rs `release.yml` is the model but reads the
version from the root manifest (vizij-rs's is a virtual workspace: tag from
`crates/vizij/Cargo.toml` instead) and installs Npcap, not NASM;
`aws-lc-sys` needs NASM on Windows under every feature set of `vizij`;
`tts-piper` is GPLv3 with baked rpaths; installers are unsigned until
credentials exist (`studies/packaging-and-ci.md`, `challenge-verdicts.md` C9).

## P6, Android

### T18 The Android app (L) — [VIZ-153](https://linear.app/semio-ai/issue/VIZ-153)

**Scope.** The `android` module (`#[bevy_main]`), the Gradle directory
(pinned `ndkVersion`, targetSdk 34, minSdk 24), one Kotlin `Activity`
subclass that loads the library, handles the SAF picker and both VIEW intent
filters into `filesDir/model.glb`, sets immersive mode; auto-load of that
file; the app-data directory from `internal_data_path()` (T06); persisted
owners, name and model family answering the panel; `android_logger`; the TLS
root store for the cloud TTS decided; `RenderErrorPolicy::Recover`; a
link-and-launch gate with `studio` and the cloud TTS compiled in.

**Done when.** The APK with `studio` and TTS links, installs on the API 35
emulator, and logcat shows the Studio bridge registering; a GLB opened from
the picker and from a VIEW intent renders; T01's smoke runs this APK.

**Implementation cues.** Bevy 0.19 selects no Android backend by default
(`bevy/android-native-activity` under the Android target table); the whole
`vizij` crate type-checks for `aarch64-linux-android` with `studio`, but
linking oboe, aws-lc and wasmtime is unverified; `rfd` has no Android
backend; a `NativeActivity` subclass must `System.loadLibrary` the same
cdylib; the cloud TTS's reqwest installs `rustls-platform-verifier`, which
panics unless its AAR is packaged and initialised from `android_main` (or the
provider switches to webpki as `arora-studio-bridge-client` does); no GLES
build draws, Vulkan only; `LogPlugin` stays disabled. Studies:
`bevy-android-spike.md`, `challenge-android-render.md`, `challenge-verdicts.md`
(C7).

### T19 Android CI, signing and the tablet gate script (M) — [VIZ-154](https://linear.app/semio-ai/issue/VIZ-154)

**Scope.** CI `apk` + T01's smoke on main and dispatch, `cargo ndk check`
per PR, signing from `android.yml`'s pattern moved to vizij-rs, the
applicationId decided; `android/scripts/device-gate.sh` against a tablet
over adb: swapchain-format probe, install, VIEW-intent and picker loads,
reboot, identity recovery, Studio claim, a scalar and a compound animatable
moved from the bridge writer, a forced device loss recovered; artifacts per
step.

**Done when.** The script passes on the named tablet with its artifacts
linked from the ticket (APK sha, model, Android version); `apps/vizij-standalone`'s
`android.yml` can be deleted (T22).

**Implementation cues.** A tablet whose Vulkan swapchain lists no sRGB format
and lacks `VK_KHR_swapchain_mutable_format` fails `Surface::configure` in
Bevy 0.19.1 (bevy issue 15452), so the probe comes first; wgpu maps a frame
over 1 s to a device loss (issue 9029); emulator frame rates bound nothing;
keep `com.vizij.standalone` for in-place upgrades or plan an uninstall step.

## P7, Semio Studio

### T20 Studio-key profile in the device and the passing E2E (M) — [VIZ-155](https://linear.app/semio-ai/issue/VIZ-155)

**Scope.** Under the `studio` feature, `vizij::device` composes a mapping
source from `FaceMeta` bindings that strips `.target_position`, aggregates
`<uuid>.{x,y,z}` / `{r,p,y}` / `{r,g,b}` into the compound key, drops
`.studio_value` and `.target_velocity`, echoes `<id>.position` as feedback;
the `retrieveGlb` decision (a device-side responder in
`arora-studio-bridge-client`, or the documented limitation).

**Done when.** T02's harness passes with a stand-alone `vizij --studio` as
the device, on a scalar and a compound animatable, loading a Studio-exported
(per-axis) face.

**Implementation cues.** The shape of `ros4hri_source` in
`vizij-arora-host/src/ros4hri.rs` is the model; `RigHal` already implements
`HalAssets::model_glb`, arora has no caller (`studies/studio-consumers.md` 3);
depends on T14's per-axis bindings.

### T25 The scene screen shows a device's face from the image its view publishes (M, semio_studio + vizij-rs) — [VIZ-159](https://linear.app/semio-ai/issue/VIZ-159)

**Scope.** `view::frames` publishes the rendered face into the store
(`display/face/compressed`, PNG, `sensor_msgs/CompressedImage` shape) under
`--studio` as it does under ROS4HRI, at `--frame-rate`; semio_studio's
`packages/scene/src/renderables/screen.tsx` maps the screen's material from
that key of the device, decoded in the browser, instead of hosting
`packages/vizij`'s `InnerVizij` in a drei `RenderTexture`; the frame's
`ArrayU8` rides the Studio bridge (JSON bytes until the buffer wire format's
compact encoding lands — an ARORA item; the rate is the knob).

**Done when.** With a stand-alone `vizij --studio` registered (T20's E2E),
the scene's screen shows that device's face and it moves under the E2E's
writes; frame rate and bytes per second measured and recorded.

**Implementation cues.** Plan §3.7: the scene keeps three.js as its surface;
the face on it is the device's pixels, so Studio keeps no face renderer of
its own and `packages/vizij`'s renderables leave the scene (the rest is
STUDIO-239's). `screen.tsx:204-226` is the one surface. The in-page device
path (studio-arora hosting the face component, the view's canvas as a
`CanvasTexture` or a `Screenshot` readback) is a Studio decision, recorded as
risk 13, not this ticket.

### T21 Retire `apps/vizij-app` and re-point the Studio tickets (S, semio_studio) — [STUDIO-263](https://linear.app/semio-ai/issue/STUDIO-263)

**Scope.** Delete `apps/vizij-app` and its references (`package.json:29`,
`.changeset/config.json:10`, the two docs pages); STUDIO-239 pointed at the
reworked `@vizij/render` with the scene screen's renderables kept; STUDIO-257
re-targeted at the egui panel (its value-mirror item closed).

**Done when.** `apps/vizij-app` is gone from `main`; a Studio user claims and
drives a stand-alone `vizij --studio` the way the app was driven (T20).

## P8, retirement

### T22 Delete the Tauri standalone (S, vizij-web) — [VIZ-156](https://linear.app/semio-ai/issue/VIZ-156)

**Scope.** The Tauri shell, the native second device, `android.yml`,
`check-snap-env.mjs`, `dev:vizij-standalone`, the untracked leftovers
(`packages/@vizij/arora-types`, `apps/vizij-ws-app`); the four `deploy/*`
guidebook pages, `swap-the-speech-provider.md`, `bring-your-own-visemes.md`,
`hardware-ros-and-multi-screen-topologies.md` rewritten; a README for the
Android app.

**Done when.** No `@tauri-apps/*` in vizij-web's lockfile; no Tauri
instructions under `deploy/*`; gated on T17's installers and T19's tablet
gate.

### T23 Retire the web renderer and re-point the docs (M, vizij-web + vizij-docs) — [VIZ-157](https://linear.app/semio-ai/issue/VIZ-157)

**Scope.** `three` only in `@vizij/render`'s loader and exporter;
`speech-react` gone; the remaining vizij-web pages and vizij-docs
`ARCHITECTURE.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `STANDARD_INPUTS.md`,
`control/paths-and-standard-controls.md`,
`control/orchestration-and-diagnostics.md`, vizij-rs `docs/skills.md` and
`crates/vizij/README.md`; the website projection regenerated; the runtime
summary and ROADMAP; the tickets re-pointed (VIZ-13, VIZ-58, VIZ-59, VIZ-74,
VIZ-77, VIZ-126, VIZ-128, VIZ-130, VIZ-131, STUDIO-239, STUDIO-256,
STUDIO-257, ARORA-79).

**Done when.** Gated on T13 and T15; `grep -r three vizij-web/apps` hits
nothing outside the loader; the guidebook names no `VizijRuntimeFace` canvas.
