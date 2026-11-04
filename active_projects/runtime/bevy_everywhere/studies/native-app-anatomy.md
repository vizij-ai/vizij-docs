# Anatomy of the `vizij` Bevy app and what a `vizij-view` library would carve out of it
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,bevy,vizij-rs,wasm,android,render-contract,tests -->
> **Last updated:** 2026-11-04
> **Related documents:** [Central plan](../bevy_everywhere-plan.md)

All paths are repo-relative and read the tree the study ran on; `vizij-rs` is the default
repo. Registry sources are quoted as `<crate>-<version>/path` (the `~/.cargo/registry` copy of
what `Cargo.lock` resolves). The library this study carves out is on vizij-rs main:
[`crates/vizij/src/lib.rs`](https://github.com/vizij-ai/vizij-rs/blob/main/crates/vizij/src/lib.rs) lays out its modules. Raw command
outputs are not kept: the commands and figures quoted on this page are the record.

## Findings

1. **`crates/vizij` is a single binary crate with no library target**: 12 source
   modules, 4,808 lines, plus one example and one integration test
   (`crates/vizij/Cargo.toml`, `crates/vizij/src/main.rs:15-30`). The view half
   (`view.rs` 681, `meta.rs` 229, `snapshot.rs` 157, `frames.rs` 415 = 1,482
   lines) has no dependency on arora's facade crate; the device half
   (`device.rs` 1,433 of which 590 are non-test, `animation.rs` 186, `gaze.rs` 28,
   `viseme.rs` 30) is where `arora`, tokio, the TUI and the bridges live.
2. **Four types cross the view/device seam**, all handed over in
   `main.rs:216-224`: `view::Face { meta: FaceMeta, glb_path }` (`view.rs:26`),
   `view::DeviceRes { rig: RigHal }` (`view.rs:38`),
   `view::DeviceEvents(Mutex<Receiver<DeviceEvent>>)` (`view.rs:34`) carrying
   `device::DeviceEvent::{FaceLoaded{glb_path, meta, rig}, Background}`
   (`device.rs:47-57`), and `frames::FrameConfig` (`frames.rs:63`). The pose
   itself crosses as `Vec<(TypedPath, Value)>` from `RigHal::pose()`
   (`crates/interop/vizij-arora-hal/src/lib.rs:100-111`); frames go back as a
   `StateChange` through `RigHal::push_reading` (`frames.rs:178-180`).
3. **The device runs on a std thread named `arora`, built there because `Arora`
   is `!Send`**: `device.rs:305-328`; the non-`Send` members are
   `function_index: Rc<HashMap<..>>` (`arora-9.11.1/src/lib.rs:105`),
   `interpreter: Rc<RefCell<..>>` (`arora-9.11.1/src/runtime.rs:393`) and the
   engine's `Rc<dyn Callable>` table (`arora-engine-4.1.0/src/call.rs:82`).
   Operator mode builds a tokio multi-thread runtime and `block_on`s
   `AroraBuilder::run()` (`device.rs:455-532`), whose loop is
   `arora.run(DEFAULT_STEP_PERIOD)` = 10 ms (`arora-9.11.1/src/run.rs:268-275`,
   `runtime.rs:52`). Quiet mode (snapshot) is a hand loop sleeping 10 ms
   (`device.rs:576-589`).
4. **The view polls, it does not subscribe**: every `Update`, `apply_pose` calls
   `device.rig.pose()` (`view.rs:488`), which clones the whole actuation state
   under the HAL mutex; `RigHal::pose_updates()` (delta stream) exists and is
   unused. `apply_device_events` drains the mpsc each frame (`view.rs:140-199`).
   The step loop and the draw loop are independent clocks (~100 Hz vs vsync/60).
5. **Frames and snapshots are Bevy-side capture into the HAL reading feed**:
   `frames::request_capture` throttles at `rate_hz`, spawns
   `Screenshot::image(offscreen)` or `Screenshot::primary_window()`, and the
   observer encodes RGBA (BGRA swizzled) as PNG or raw into the `sensor_msgs`
   value built by `vizij_arora_host::frames`, then `push_reading` under
   `display/face[/compressed]` (`frames.rs:135-249`). `snapshot::SnapshotPlugin`
   is DefaultPlugins minus `WinitPlugin` + `ScheduleRunnerPlugin` + a
   `Readback::texture` observer; `capture` drives `App::update` manually until
   `BindingIndex.ready`, 60 settle frames, then a bounded readback
   (`snapshot.rs:40-132`). `--headless` is the same offscreen target under
   `app.run()` with the device thread and bridges (`main.rs:288-343`).
6. **The render contract implemented** (`view.rs`): orthographic camera at
   z = 100 over `rootBounds` with a custom `FitProjection` (contain / cover /
   stretch, per-axis zoom; `view.rs:203-298`), `Tonemapping::None`,
   `DebandDither::Disabled`, `Msaa::Sample4`, clear color from `--background`;
   one unique `StandardMaterial` per element: `double_sided`, `cull_mode None`,
   `unlit`, base color × `ambient/π` (`basic` → ×1) (`view.rs:392-416`);
   features: translation (vec3), rotation (euler ZYX composed as Rz·Ry·Rx),
   scale (vec3 or scalar), color (linear RGB from `color_rgba` or vec3),
   opacity (alpha, `AlphaMode::Blend` under 1), morph weight by target name
   (`view.rs:494-556`). Nothing else in `RobotData` is read (`meta.rs:160-174`).
7. **What `@vizij/render` draws that the Bevy view does not**: the `ellipse` and
   `rectangle` primitives with `width/height` (as scale) and a `Line2` stroke
   (`strokeColor/Opacity/Width/Offset/Radius`), `fillColor/fillOpacity`
   (`vizij-web/packages/@vizij/render/src/renderables/ellipse.tsx:82-257`,
   `rectangle.tsx:82-261`, `types/ellipse.ts:22-33`, `types/rectangle.ts:22-34`);
   scalar rotation about Z and Vector2 translation keeping z (`group.tsx:61-80`);
   HSL colors (`shape.tsx:205-211`); PBR extras `roughness`, `metalness`,
   `shininess`, `emissive`, `emissiveIntensity`, `specular` and the `phong`,
   `lambert`, `normal` material kinds (`shape.tsx:213-257`, `types/shape.ts:31-63`);
   a null scale component collapsing a group to 0.1 (`group.tsx:83-86`); the
   safe-area outline (`vizij.tsx:255-280`), the selection glow
   (`effects/selection-glow-effect.tsx`), the "No Output" text (`vizij.tsx:238-247`),
   pointer hover/click selection, and `aggressiveImport` (deriving elements
   from a GLB with no `RobotData`, `functions/gltf-loading/traverse-three.ts:41-136`).
   Neither side draws textures, visibility or dynamic text (`types/*.ts`;
   `docs/proposal-vizij-native-app.md:54`). The Bevy view alone has cover /
   stretch / zoom fitting, a clear color, and frame publishing.
8. **Dependency reach** (Q2 table below): the default build's graph carries, on
   every target, tokio `rt-multi-thread`+`net`, crossterm, ratatui, wasmtime 45
   and tokio-tungstenite — all through `arora`'s default features `native` +
   `tui` (`arora-9.11.1/Cargo.toml` features) and vizij's own `tokio`,
   `crossterm`, `rodio` lines. `cargo tree --target wasm32-unknown-unknown`
   confirms they stay in the wasm graph; tokio's `rt-multi-thread`/`net` are a `compile_error!` on that target. The
   interop seams the view needs (`vizij-arora-hal`, `-store`, `-behavior`,
   `-host`, `vizij-api-core`) already build for wasm32-unknown-unknown: CI's
   `wasm` job builds `vizij-arora-web` over them (`.github/workflows/ci.yml:68`,
   `crates/interop/vizij-arora-web/Cargo.toml`).
9. **Nothing in the app loads a wasm module**: the animation, gaze, viseme and TTS
   modules are host modules (`device.rs:387-400`, `animation.rs:23`), so the
   wasmtime and `libloading` stacks pulled by `arora/native` are dead weight on
   every platform.
10. **`rodio` is a direct dependency used only under `tts-piper`**
    (`crates/vizij/Cargo.toml` `rodio = "0.20"`; use sites `tts_piper.rs:177-193`
    only); the default build links it for nothing. `bevy`'s default `audio`
    feature pulls a second rodio (0.22) and cpal (0.17) the app never uses
    (`Cargo.lock`; `bevy-0.19.1/Cargo.toml` `default = ["2d","3d","ui","audio"]`).
11. **Tests**: 33 unit tests in the default build (`main.rs` 3, `view.rs` 5,
    `meta.rs` 1, `frames.rs` 6 plus one under `ros2-*`, `device.rs` 17,
    `memory_tests.rs` 1) run on any host without a GPU or display — verified
    here: `cargo test -p vizij` passes all 33 in 254 s after an 18 min cold debug build; `device.rs:1364` (`ros4hri_drives_the_adapted_quori`)
    reports `ok` as a skip unless `VIZIJ_FIXTURES` names the Quori GLB; `ros2_tests.rs` (3 live-DDS
    tests, feature `ros2-dds`) are `cfg_attr(target_os = "macos", ignore)` for two
    and `#[ignore]` everywhere for the 35 s leak diagnostic (VIZ-118)
    (`ros2_tests.rs:129-136,365-372,469-478`).
12. **The snapshot regression compares the app to itself, not to the web**:
    `tests/references/{quori,toasty}.png` were rendered by `vizij --snapshot
    --no-autoplay` at the default 763×486 on black (`tests/snapshot_regression.rs:50-58`);
    the test is `#[ignore]`d, gated on `VIZIJ_FIXTURES`, and passes when the
    32×32 thumbnails differ by a mean under 10/255 (`:33-34,80-93`). CI runs it in
    the `snapshot-regression` job on `ubuntu-latest` with Mesa lavapipe
    (`mesa-vulkan-drivers`, `WGPU_BACKEND=vulkan`) and GLBs fetched from
    vizij-web's `main` (`.github/workflows/ci.yml:173-202`).
13. **The web-parity collages are not reproducible from the repo**:
    `crates/vizij/docs/compare/cmp-{quori,toasty}.png` landed with commit
    `0b98c0f` (VIZ-47); the web captures came from a scratch Playwright spec that
    was never committed (`crates/vizij/README.md:187-190`; no such spec under
    `vizij-web/apps/vizij-authoring/e2e/`, no generating script under
    `scripts/`). The 0.50 % / 0.66 % figures are a record, not a test.
14. **`tests/ros4hri` is a manual Docker harness, not a `cargo test`**: a
    `ros:jazzy` + `rmw_zenoh_cpp` image built from the `.msg`/`.action` files
    `arora-msgs-ros2` vendors, a `ros2-zenoh` build of the binary run
    `--headless --ros2`, and `ros2 action send_goal /skill/say` judged from its
    transcript; needs docker, the network (cloud TTS) and an audio output
    (`tests/ros4hri/README.md`, `say-feedback.sh`).
15. **The `RobotData` → binding parser exists once in Rust, in the app**
    (`meta.rs:113-204`). `vizij-arora-host::Bundle` parses only `VIZIJ_bundle`
    (`crates/interop/vizij-arora-host/src/lib.rs:86-98`); `vizij-bundle` reads
    `RobotData` feature names only for `inspect` (`crates/tools/vizij-bundle/src/lib.rs:304`)
    and owns its own GLB container split via the `gltf` crate's `Glb`
    (`:24-28`) while `meta.rs:207-219` hand-rolls one; `vizij-glb-migrate`
    rewrites `RobotData` defaults (`src/migrate.rs:81`); `vizij-arora-web` parses
    no GLB (the JS host does, in `@vizij/render`'s `traverse-three.ts`).
16. **A `vizij-view` library is a clean cut**: the four view modules depend only
    on `bevy`, `vizij-arora-hal`, `vizij-arora-host` (+ `publish-frames`, whose
    `arora-msgs-ros2` default features are pure serde types), `vizij-api-core`,
    `image`, `log`, `serde_json`, `anyhow` — none of tokio, clap, crossterm, or the
    `arora` facade. The only cross-references to fix are `DeviceEvent` (defined in
    `device.rs`, matched in `view.rs:157-197`), the `clap::ValueEnum` derives on
    `view::Fit` and `frames::FrameFormat`, and `frames::{publish_rate,
    default_frame_id}` (CLI policy, `frames.rs:97-121`).

## Questions answered

**Q1 — module map.** See Findings 1–2 and the Evidence table "Modules". Seam
types: `Face`/`FaceMeta`, `DeviceRes`(`RigHal`), `DeviceEvents`/`DeviceEvent`,
`FrameConfig`; values as `vizij_api_core::{TypedPath, Value}`; `Bundle` rides
inside `FaceMeta`.

**Q2 — dependency reach.** See the Evidence table "Dependencies". Summary: the
view's own graph is wasm- and Android-clean; everything that is not comes from
`arora`'s `native`/`tui` defaults, from vizij's `tokio`/`crossterm`/`rodio`
lines, from `vizij-arora-tts` (reqwest + rodio + tokio multi-thread) and from the
optional bridges. Android has no compile blocker in this graph by manifest
inspection (crossterm/tokio/rustdds are unix-generic; cpal uses `oboe`; wasmtime
is not target-gated), but this is not verified by a build here.

**Q3 — feed and thread model; what changes to step inside Bevy.** Findings 3–5.
Stepping the device inside Bevy's schedule on one thread means: build the
`Arora` on the main thread and store it with `World::insert_non_send`
(`bevy_ecs-0.19.1/src/world/mod.rs:2058`, the 0.19 name); a system in `Update`
(or `FixedUpdate` at 100 Hz) calling `arora.step(Time::delta())` — `step` is a
plain `&mut self` method (`arora-9.11.1/src/runtime.rs:572`), the same call
`vizij-arora-web` makes from `requestAnimationFrame` (`crates/interop/vizij-arora-web/src/lib.rs:131`).
That removes: the `arora` thread and the `Mode` split (`device.rs:299-338`), the
tokio runtime and `block_on` (`:455-532`), `AroraBuilder::run`/`with_frontend`/
`commands_frontend` (all `#[cfg(feature = "native")]`/`"tui"` in arora), and the
`DeviceEvents` channel (the view would take commands as Bevy messages). It
requires: bridges that need no tokio (the local WS bridge and `Ros2Bridge::new`
are `async` under tokio; on wasm the bridge is the JS surface `AroraWeb`
exposes), `FaceMeta::from_glb_bytes` fed from bytes the host fetched
(`meta.rs:120`; `load_face` uses `canonicalize` + `std::fs::read`,
`device.rs:231-235`), and a GLB reachable by Bevy's `AssetServer` (a URL on wasm).
`RigHal` is `Arc<Mutex>` and stays a plain `Resource` in both models.

**Q4 — render contract vs `@vizij/render`.** Findings 6–7 and the Evidence table
"Render contract".

**Q5 — tests and CI.** Findings 11–14 and the Evidence table "Tests".

**Q6 — the `vizij-view` split.** Findings 15–16 and the Evidence section
"Split sketch".

## Evidence

### Modules (`crates/vizij/src`)

| File | Lines | Class | Responsibility | Bevy | arora facade | tokio |
|---|---|---|---|---|---|---|
| `main.rs` | 447 | app | clap CLI; window / headless / snapshot runners; `restore_terminal` (crossterm) | yes | no | no |
| `device.rs` | 1,433 (590 non-test) | device | `load_face`, `builder_for`, `start` (worker thread), `supervise` (TUI generations), `pump` (g/b commands), `attach_bridges`, `free_inputs`, `step_forever` | no | yes | yes |
| `animation.rs` | 186 | device | animation module as a host module (`Value` marshaling) | no | yes | no |
| `gaze.rs`, `viseme.rs` | 28, 30 | device | look_at / play_viseme contracts as host modules | no | yes | no |
| `tts_piper.rs` | 315 | tts (`tts-piper`) | Piper provider; tokio handle, rodio playback, phoneme → viseme | no | yes | yes |
| `view.rs` | 681 | view | `ViewPlugin`: scene spawn, `FitProjection` camera, `index_scene` join, `apply_pose`, `apply_device_events` | yes | no | no |
| `meta.rs` | 229 | view | `FaceMeta` from the GLB JSON chunk: `RobotData` elements/animatables/`rootBounds` + `Bundle` | no | no | no |
| `snapshot.rs` | 157 | frames/headless | offscreen `SnapshotPlugin`, manual-update `capture`, `save_png` | yes | no | no |
| `frames.rs` | 415 | frames/headless | throttled `Screenshot` capture → `sensor_msgs` value → `RigHal::push_reading` | yes | no | no |
| `memory_tests.rs` | 244 | test | counting allocator, heap-floor probe over a frame feed | no | yes | yes |
| `ros2_tests.rs` | 643 | test (`ros2-dds`) | live DDS: LookAt action, data-topic input, leak diagnostic | no | yes | yes |

`examples/say.rs` (79 lines) drives the build's `say` provider from a hand tick
loop (compiles `tts_piper.rs` by `#[path]` under the feature).
`build.rs` (34 lines) only bakes the Piper rpath under `tts-piper`.

### Dependencies (`crates/vizij/Cargo.toml`, `Cargo.lock`, registry manifests)

Legend: W = wasm32-unknown-unknown, A = aarch64-linux-android. "manifest" =
reasoned from the crate's target gates and features, not built.

| Dependency (resolved) | Why it is there | W | A | Basis |
|---|---|---|---|---|
| `bevy` 0.19.1, default features | the view | yes (`default_platform` includes `webgl2`) | yes with an `android-*-activity` feature and a cdylib entry | `bevy-0.19.1/Cargo.toml` features |
| `arora` 9.11.1, defaults `native`+`tui` | device, TUI, local WS bridge, `run` | **no**: `native` → `arora-engine/wasmtime-host`, `arora-bridge-ws` (tokio-tungstenite), env_logger, clap; `tui` → ratatui/crossterm/sysinfo | manifest: yes (wasmtime is not target-gated; not built) | `arora-9.11.1/Cargo.toml`; wasm graph confirmed by `cargo tree --target` |
| `arora` with `default-features = false` | what `vizij-arora-web` uses | yes (CI `wasm` job) | yes | `ci.yml:68`, `vizij-arora-web/Cargo.toml` |
| `tokio` 1.53 `rt-multi-thread`,`time` (vizij's own) | `supervise`'s runtime | **no** (`compile_error!`) | yes | tokio target support; `cargo tree --target wasm32… -i tokio -e features` shows `rt-multi-thread`,`net`,`mio` enabled |
| `crossterm` 0.28 (vizij's own + ratatui) | `restore_terminal` | **no** (only `cfg(unix)`/`cfg(windows)` backends) | yes (unix) | `crossterm-0.28.1/Cargo.toml:160-196` |
| `rodio` 0.20 / `cpal` 0.15 | Piper playback only | needs `wasm-bindgen` feature, not enabled | yes via `oboe` (NDK C++ build) | `rodio-0.20.1/Cargo.toml:215`, `cpal-0.15.3/Cargo.toml:106-116` |
| `env_logger` 0.11 (+ arora's) | snapshot logger | compiles; `humantime`→`jiff` clock at runtime is unverified | yes | manifest |
| `image` 0.25 | PNG encode/decode | yes (bevy_image already depends on it) | yes | `cargo tree -i image` |
| `clap` 4 derive | CLI | compiles (no argv) | yes | crate knowledge |
| `futures`, `tracing`(log), `log`, `serde*`, `anyhow`, `uuid`(serde) | glue | yes | yes | pure Rust |
| `arora-types` 2, `arora-behavior` 8, `arora-behavior-tree-types` 1 | values, built-ins, Status ids | yes (arora-web builds them) | yes | `ci.yml:68` |
| `vizij-api-core`, `vizij-graph-core`, `vizij-arora` | values, graph engine | yes (`vizij-graph-wasm`, `vizij-api-wasm`) | yes | `ci.yml:64-66` |
| `vizij-arora-hal`, `-store`, `-behavior`, `-host` | the seams | yes (arora-web) | yes | `ci.yml:68` |
| `vizij-arora-host/publish-frames` → `arora-msgs-ros2` 1.2 default | `sensor_msgs` value shapes | yes: `default = []`, no `ros2-client` | yes | `arora-msgs-ros2-1.2.0/Cargo.toml` features |
| `vizij-animation-module` (rlib) | host-side animation functions | manifest: yes (uuid `v4` needs `getrandom` with a wasm backend — `vizij-arora-web` already enables `getrandom/wasm_js`) | yes | manifests |
| `vizij-arora-tts` 2.0 | cloud `say`: `reqwest` 0.13, `rodio` 0.20, tokio `rt-multi-thread`, `arora-engine` no-default | **no** (tokio multi-thread, rodio) | manifest: yes (rustls) | `crates/interop/vizij-arora-tts/Cargo.toml` |
| `vizij-piper` (`tts-piper`) | libpiper + onnxruntime + espeak-ng, GPLv3 | no (C++ dylibs) | not attempted (cmake cross-build) | `crates/interop/vizij-piper/Cargo.toml`, `build.rs` |
| `arora-bridge-ros2` 6.3 (`ros2-*`) | ROS 2 bridge: `ros2-client-multi-rmw` (rustdds or zenoh), tokio `rt` | no | manifest: yes (sockets); unverified | `arora-bridge-ros2-6.3.0/Cargo.toml` |
| `arora/studio-bridge` (`studio`) | Zenoh + Firebase connector, rustls | no | manifest: plausible; unverified | `arora-9.11.1/Cargo.toml` |
| dev: `ros2-client-multi-rmw` (dds), `arora-msgs-ros2`, `vizij-bundle`, `rand` | live tests, Quori graft | n/a | n/a | dev only |

### Render contract: Bevy view vs `@vizij/render`

| Aspect | Bevy view (`view.rs`) | `@vizij/render` | Gap |
|---|---|---|---|
| Camera | ortho at z=100, `FitProjection` contain/cover/stretch + zoom (`:203-298`) | ortho at z=100, contain fit only (`vizij.tsx:143-148,193-233`) | web lacks cover/stretch/zoom |
| Output | sRGB, `Tonemapping::None`, MSAA 4 (`:311-323`) | `SRGBColorSpace`, `NoToneMapping`, `antialias` (`vizij.tsx:73-77`) | none |
| Lighting | ambient baked: unlit × `ambient/π`, `basic` × 1 (`:392-416`) | `ambientLight(π/2)` on `MeshStandardMaterial`; `basic` unlit | equal by construction for standard/basic; phong/lambert/normal not modelled |
| Background | clear color (`--background`) | transparent canvas (page background) | web-only page compositing |
| Element kinds | any `RobotData` node with a mesh/morph; `kind` read but unused (`meta.rs:49`) | `group`, `shape`, `ellipse`, `rectangle` (`renderable.tsx:53-92`) | ellipse/rectangle fill/stroke features not applied |
| translation | vec3 | vec3, or vec2 keeping z | vec2 form |
| rotation | euler ZYX (`:508-510`) | euler ZYX, or scalar about Z (`group.tsx:73-80`) | scalar form |
| scale | vec3 or scalar (`:513-521`) | vec3 (null → 0.1), scalar, else 1 | null handling |
| color | linear RGB (`color_rgba`, vec3) (`:522-534`) | RGB, vec3, **HSL** (`shape.tsx:184-212`) | HSL |
| opacity | alpha + blend under 1 (`:535-546`) | same (`shape.tsx:170-183`) | none |
| morph weights | by target name → index (`:547-556`) | by target name → index (`shape.tsx:104-131`) | none |
| PBR extras | none | roughness, metalness, shininess, emissive(+Intensity), specular | web-only |
| ellipse/rectangle | none | width/height (scale), fill color/opacity, stroke color/opacity/width/offset/radius as a `Line2` | web-only |
| Overlays | none | safe-area outline, selection glow, hover/click, "No Output" | web-only (authoring UI) |
| Import without `RobotData` | refused (`index_scene` waits forever for named nodes) | `aggressiveImport` derives a world | web-only |
| Textures / visibility / text | none | none | none |
| Frames to the store | `display/face[/compressed]` | none | Bevy-only |

The two reference faces exercise only the shared subset: Quori and Toasty are
`shape` meshes with morphs (`docs/proposal-vizij-native-app.md:53-54`); whether
any shipped GLB carries `ellipse`/`rectangle` nodes is not established here.

### Tests

| Test | Where | Needs | Runs in |
|---|---|---|---|
| CLI, fit math, meta, frames encoding, free inputs, ROS4HRI mapping math, viseme/say runs, gaze fragments | `src/*.rs` unit tests (33) | nothing (no GPU, no network) | CI `rust` job: `cargo test -p vizij --features ros2-dds,studio,tts-piper` (`ci.yml:46`); hooks: `ros2-dds` only (`scripts/hook-tasks.sh:49-51`) |
| `ros4hri_drives_the_adapted_quori` | `device.rs:1364` | `VIZIJ_FIXTURES` with the Quori GLB | CI `snapshot-regression` job (`ci.yml:199-202`); skips elsewhere |
| `the_device_alone_keeps_a_flat_heap_under_a_frame_feed` | `memory_tests.rs:190` | 25 s wall time | CI `rust` job |
| LookAt action E2E, data-topic input | `ros2_tests.rs:136,372` | live DDS multicast; ignored on macOS | CI `rust` job (Linux) |
| `the_device_keeps_a_flat_heap_in_a_ros_graph` | `ros2_tests.rs:478` | 35 s; fails by design (VIZ-118) | never (`#[ignore]`) |
| `native_render_matches_reference` | `tests/snapshot_regression.rs:38` | a Vulkan adapter (lavapipe in CI), `VIZIJ_FIXTURES`; spawns the binary | CI `snapshot-regression` (`ci.yml:194-198`) |
| `/skill/say` from a native rclpy client | `tests/ros4hri/say-feedback.sh` | docker, `ros2-zenoh` build, network, audio device | manual only |
| Web-parity collages | `docs/compare/cmp-*.png` | headed Chromium + a scratch Playwright spec | not reproducible (Finding 13) |

Frames/snapshot code paths are exercised only by the snapshot job: no unit
test constructs a Bevy `App`.

Run here (macOS, default features, scratch `CARGO_TARGET_DIR`): cold build
18 m 22 s (a 10 GB debug target), 33 passed / 0 failed / 0 ignored in 254.54 s,
`native_render_matches_reference` ignored; the two ROS4HRI simulation tests
(`ros4hri_blink_pulses_and_commanded_close_wins`,
`ros4hri_gaze_maps_eyes_with_vergence`) exceed 60 s each in a debug build.

### Split sketch: `vizij-view` (library, Bevy plugin) out of `vizij` (binary)

Moves to `vizij-view`:

- `view.rs` entire: `ViewPlugin`, `Face`, `DeviceRes`, `ViewOptions`, `Fit`,
  `FitProjection`, `OffscreenTarget`, `BindingIndex`, `ViewCamera`, the value
  coercions. `Fit` loses its `clap::ValueEnum` derive (the binary maps its CLI
  enum onto it, as `frames.rs:51-58` already does for `FrameFormat`).
- `meta.rs` entire (`FaceMeta`, `Element`, `Binding`, `FeatureKind`,
  `from_glb_bytes`) — or, better, into a crate the bundler can share (Finding 15).
- `frames.rs` capture half: `FrameConfig`, `FramesPlugin`, `request_capture`,
  `publish_frame`, `to_rgba8`, `encode_frame`, `frame_reading`. The policy half
  (`publish_rate`, `default_frame_id`) stays with the CLI.
- `snapshot.rs` entire, behind a feature (it forces `ScheduleRunnerPlugin` and
  `WinitPlugin` off; the readback observer is generic).
- `DeviceEvent` becomes a view-owned command type (`LoadFace { glb, meta, rig }`,
  `Background`), delivered as a Bevy message or a channel resource the host fills.

Stays in the binary (`vizij`): `main.rs`, `device.rs`, `animation.rs`,
`gaze.rs`, `viseme.rs`, `tts_piper.rs`, `build.rs`, the tests, the features
`ros2-*`, `studio`, `tts-piper`.

Library dependency set: `bevy`, `vizij-arora-hal`, `vizij-arora-host`
(`publish-frames`), `vizij-api-core`, `image` (PNG encoder only), `log`,
`serde`, `serde_json`, `anyhow`. Consumers: the `vizij` binary,
`semio_studio/apps/vizij-app`, and a wasm host crate for the browser.

## Implications for the target picture

- **The browser build is a device-model change, not a view change.** The view
  modules are already wasm-clean by dependency; the thread + tokio + TUI +
  local-WS device driver is not. A wasm host steps the `Arora` inside Bevy's
  schedule (Q3) and gets its bridge from `AroraWeb`'s JS surface, exactly the
  composition `vizij-arora-web` ships today minus its own loop.
- **`arora`'s default features decide portability**: the desktop binary keeps
  `native`+`tui`; every other consumer takes `default-features = false`. Until
  ARORA-79 splits `native`, the desktop build also carries wasmtime and
  `libloading` for nothing (Finding 9).
- **`say` in the browser needs another provider**: `vizij-arora-tts` is
  reqwest + rodio + tokio multi-thread. The device "keeps the say skill" only if
  a wasm-capable provider (web audio, fetch) implements the same contract.
- **Android keeps the native device model** (threads and tokio are fine) but has
  no terminal: `commands_frontend` falls back to the headless front end when
  stdout is not a TTY (`arora-9.11.1/src/tui/mod.rs:77-91`), so the `g`/`b`
  commands have no channel; the view's face-swap and background events need a
  non-TUI producer (a file picker → `LoadFace`).
- **Replacing `@vizij/render` in the authoring viewport is more than the two
  reference faces**: ellipse/rectangle/stroke, HSL, PBR extras, safe-area,
  selection, hover, and `aggressiveImport` are authoring-side behaviors with no
  Bevy counterpart (Finding 7).
- **`FaceMeta` from bytes is the portable entry point** (`meta.rs:120`); the
  file-path entry (`canonicalize`, `std::fs::read`, `AssetServer::load(path)`) is
  desktop-only. On wasm the same GLB is fetched twice unless a custom Bevy
  `AssetLoader` yields meta and scene from one read.

## Implications for the plan

1. Extract `vizij-view` as a pure move (Finding 16) before any platform work; the
   `snapshot-regression` job is the guard that the render did not change.
2. Give the device two drivers behind one composition (`builder_for` stays the
   shared piece): the native thread driver (today's `supervise`/`step_forever`)
   and an in-schedule driver (`NonSend` `Arora`, `step(Time::delta())`) that the
   wasm host uses and that the desktop can use when no TUI is wanted.
3. Move `meta.rs` into a crate shared with `vizij-bundle`, and drop the
   hand-rolled GLB container split in favor of one implementation.
4. Pin `arora = { default-features = false }` everywhere but the desktop binary;
   remove vizij's unconditional `rodio` (gate it under `tts-piper`) and `crossterm`
   (gate under a `tui` feature with `restore_terminal`).
5. Turn the web-parity record into a test or delete the claim: commit the
   capture spec and a collage script, or keep only the self-referential
   snapshot regression and say so.
6. Decide the browser `say` provider before promising the say skill in the
   "agent + Vizij" demo.
7. Inventory shipped GLBs for `ellipse`/`rectangle`/PBR-extra usage to size the
   render-contract gap the authoring viewport actually needs closed.

## Open questions

- Which shipped GLBs (vizij-web presets, Studio faces, ROS `Quori_Latest_ROS.glb`)
  carry `ellipse`/`rectangle` nodes or PBR extras? Not inventoried here.
- Does `bevy_render`'s `Screenshot` readback work on wasm32 under WebGL2 (the
  default) or only WebGPU? The save-to-file branch is wasm-aware
  (`bevy_render-0.19.1/src/view/window/screenshot.rs:150`); the capture path
  was not exercised.
- Can Bevy 0.19 load a glTF scene from in-memory bytes (one fetch feeding both
  the meta parser and the scene) without a custom `AssetLoader`? Not verified.
- Does wasmtime 45 / `arora-engine/native-host` (`libloading`) build for
  `aarch64-linux-android`? Manifest-only reasoning; the Android spike decides,
  and the question dissolves if the Android build takes `arora` without `native`.
- Does the `env_logger`/`jiff` clock panic on wasm32-unknown-unknown without a
  `js` feature? Irrelevant once the wasm host owns logging, but unverified.
- `RigHal::pose()` clones the whole state per frame; `pose_updates()` exists —
  is the delta feed the right contract for a view that may run at 30 Hz on a
  tablet, and does anything else subscribe to it?
