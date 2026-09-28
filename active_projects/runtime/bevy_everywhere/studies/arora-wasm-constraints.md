# The arora device composition runs in-schedule on wasm32; every interop crate compiles except the TTS provider, and no Studio bridge exists for a browser device
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,wasm,arora,bevy,tts,studio-bridge -->
> **Last updated:** 2026-09-28
> **Related documents:** [Central plan](../bevy_everywhere-plan.md)

Spike directory (manifest, sources, run summary):
[vizij-rs `spikes/bevy-everywhere/arora-wasm/`](https://github.com/vizij-ai/vizij-rs/tree/spikes/bevy-everywhere/spikes/bevy-everywhere/arora-wasm)
(branch `spikes/bevy-everywhere`; `Cargo.toml`, `src/lib.rs`, `run-steps.sh`,
`logs/summary.txt`). The per-step cargo logs are not kept: `logs/summary.txt`
gives each step's exit code, time and first error, and the log lines quoted on
this page are the record.
Toolchain: stable 1.96.0 (vizij-rs pins no toolchain), target `wasm32-unknown-unknown`,
`arora = "=9.11.1"` from the registry as `vizij-rs/Cargo.lock:393-395` pins it, the
vizij-rs crates as path dependencies, the lock seeded from `vizij-rs/Cargo.lock`.

## Findings

1. **`arora` 9.11.1 with `default-features = false` compiles for `wasm32-unknown-unknown`** —
   cold `cargo check` in 5m55s, exit 0 (`logs/summary.txt`). Its `native`
   feature is the only thing that pulls wasmtime, `arora-bridge-ws`, clap, env_logger and the
   operator front end (registry copy `arora-9.11.1/Cargo.toml:26-38`, same feature list in
   the local checkout); `tui` and `studio-bridge` both imply `native` (registry
   `Cargo.toml:39-51`). The runtime keeps only `tokio` `sync` on every target and gates the
   executor-bearing tokio (`rt-multi-thread`, `macros`, `time`) to
   `cfg(not(target_arch = "wasm32"))`, with `gloo-timers` on wasm
   (`arora-sdk/crates/arora/Cargo.toml:77,105-110`).
2. **Bevy on `wasm32` is single-threaded and `NonSend` data is main-thread only**, so an
   `Arora` (`!Send`: `Rc`, `RefCell`, `arora-9.11.1/src/lib.rs:93-160`) can be stepped from
   a Bevy system as a non-send resource. `bevy_tasks-0.19.1/src/lib.rs:21-27,93-103` selects
   `single_threaded_task_pool` whenever `target_arch = "wasm32"`;
   `bevy_ecs-0.19.1/src/world/mod.rs:2067` — "Systems with `NonSend` resources are always
   scheduled on the main thread"; `bevy_app-0.19.1/src/app.rs:493`
   (`App::insert_non_send_resource`).
3. **`Arora::step(dt)` is the embedder-clock entry point and is documented for exactly this
   use**: "`dt` is the elapsed time since the previous step, measured by the caller's driver
   (`run` natively, `requestAnimationFrame` on the web)" —
   `arora-9.11.1/src/runtime.rs:552-572`; the crate doc: "A device runs either on `run`,
   which paces the steps itself, or on an embedder calling `step` from its own clock"
   (`runtime.rs:9-10`). `step` is synchronous, non-blocking, and sweeps the HAL and bridge
   seams itself (`sweep_now`, `runtime.rs:574`), so no `run` loop is needed to drain them.
4. **ARORA-68 (Done, 2026-07-20, arora-sdk PR #163) is what makes `Arora::run` exist on
   wasm32** in 9.11.1: `web_time::Instant` for dt (`runtime.rs:27`), the metronome sleeping
   on `gloo_timers` under `cfg(target_arch = "wasm32")` (`runtime.rs:640-665`), and the
   overrun arm yielding to the browser macrotask queue so a device that always overruns
   still shares the page (`runtime.rs:651-664`). `run` is not native-gated; its doc says
   where a self-paced loop survives in a browser: throttled on the main thread once hidden,
   full-rate in a dedicated Web Worker (`runtime.rs:30-49`). The unreleased local checkout
   (arora 10.0.0, branch `feat/arora-97-arora-types`) has byte-identical `runtime.rs` and
   `lib.rs` (`diff` empty), so nothing further on this landed after 9.11.1.
5. **`arora-web` 6.1.0 exposes both drives to JS and nothing else paces the device**:
   `AroraWeb::step(dt_ms)` converts a rAF millisecond delta to `Duration`
   (`arora-web-6.1.0/src/lib.rs:240-250`); `AroraWeb::run(period_ms)` hands the device to
   `Arora::run` under `wasm_bindgen_futures::future_to_promise` with a oneshot stop
   (`lib.rs:262-300`). vizij-web drives the device on the page's main thread either way —
   `runtime-react/src/VizijRuntimeProvider.tsx:2099,3609-3611` (rAF → `device.step(dt*1000)`)
   and `runtime-react/src/engine/aroraEngine.ts:153` (`device.run(periodMs)`); no Web Worker
   hosts it (`grep Worker` over `runtime-react/src` and `apps/vizij-standalone/src`: none).
6. **vizij-arora-web is the proven wasm composition and it is store+HAL+graph only**:
   `arora` 9 no-default, `arora-web` 6, `vizij-arora-store`, `vizij-arora-hal`,
   `vizij-arora-behavior`, `vizij-api-core`, `vizij-arora-host` (no `publish-frames`), all
   gated to `cfg(target_arch = "wasm32")` (`vizij-rs/crates/interop/vizij-arora-web/Cargo.toml:17-45`);
   it registers **no host module** (`src/lib.rs:94-125`: `with_hal`, `with_data_store`,
   `with_behavior_interpreter`, `with_module` for guest wasm only). CI builds it with
   wasm-pack (`vizij-rs/.github/workflows/ci.yml:68-69`).
7. **`vizij-graph-core` does not build without its default `urdf_ik` feature, on any
   target**: `eval/eval_node.rs:20-21` and `eval/graph_runtime.rs:8` import
   `super::urdfik::{…}` unconditionally while `urdfik.rs:83-85` gates the items
   (E0432, `logs/summary.txt`; reproduced natively). The feature is therefore not a lever
   to trim the wasm build; with `urdf_ik` on (`k` + `urdf-rs`) the crate compiles for wasm32
   (`logs/summary.txt`).
8. **`vizij-arora-host`'s `publish-frames` feature compiles for wasm32** (`logs/summary.txt`,
   exit 0, 14s): `arora-msgs-ros2` 1.2.0 keeps `ros2-client` optional behind its `interop`
   feature (`~/.cargo/registry/src/*/arora-msgs-ros2-1.2.0/Cargo.toml:58-62`,
   `src/lib.rs:54-64`), so the default is serde message types only. The native app enables
   the feature (`vizij-rs/crates/vizij/Cargo.toml:66`) and `frames.rs:180` pushes the
   rendered frame through `RigHal::push_reading`; the browser runtime builds without it
   (finding 6), and nothing in the browser would carry a frame anyway (finding 13).
9. **The animation host module registers the same way on wasm**: `animation::host_module()`
   is `ModuleBuilder::new(ids::MODULE).function(…)…build()` over the module crate's native
   functions and generated `Value` conversions (`vizij-rs/crates/vizij/src/animation.rs:23-86`),
   and `AroraBuilder::with_host_module` / `HostModule` / `ModuleBuilder` are exported without
   any feature gate (`arora-9.11.1/src/lib.rs:61,370`). `vizij-animation-module` is a plain
   rlib+cdylib with `lazy_static` engine state (`src/lib.rs:82-90`); its build script's
   `tokio` `rt-multi-thread` is a **build-dependency**, compiled for the host, so it does not
   touch the wasm target (`vizij-animation-module/Cargo.toml:21-26`); step 5 in
   `logs/summary.txt` records the wasm outcome of the crate plus a `with_host_module`
   registration.
10. **The TTS cloud provider is native-bound in three places and carries no `cfg`**
    (`vizij-rs/crates/interop/vizij-arora-tts/src/lib.rs`, `grep cfg`: none): a lazily built
    `tokio::runtime::Runtime` + `spawn` + `spawn_blocking` (`lib.rs:82-90,186-201`; manifest
    `tokio = {features = ["rt-multi-thread", "time"]}`, `Cargo.toml:21`), `rodio` output
    stream + `std::thread::sleep` playback loop (`lib.rs:206-245`), `std::time::Instant`
    (`lib.rs:228`, panics on wasm32-unknown-unknown). `reqwest` 0.13 itself has a wasm
    (`fetch`) backend and `std::env::var("API_URL")` degrades to the default URL
    (`lib.rs:187`). The poll shape — `Future::poll` on a `JoinHandle` with a no-op waker,
    per-run state in a content-keyed map (`lib.rs:139-177`) — is the portable part.
    On wasm32 the crate fails in `tokio` itself — "Only features sync,macros,io-util,rt,time
    are supported on wasm" (`logs/summary.txt`, `tokio-1.53.1/src/lib.rs:479`) — before
    `reqwest` is reached; `cpal` 0.15.3 and `symphonia` did compile, so `rodio` is not the first blocker, only the runtime-bound playback loop is.
11. **device.rs assumes a worker thread in six places**, none of them in the composition
    itself (`builder_for`, `device.rs:344-402`, is pure): the `std::thread::Builder` spawn
    holding the `Arora` (`device.rs:299-338`, "constructed inside the worker thread — it is
    not `Send`"), `std::sync::mpsc` for `DeviceEvent` and the reload hand-off
    (`device.rs:303,498`), a `tokio` multi-thread runtime hosting the TUI command pump and
    the operator `AroraBuilder::run` (`device.rs:455-532`; `run`, `with_frontend`, `tui`,
    `local_ws_bridge` are `native`-only — `arora-9.11.1/src/lib.rs:20-35,380-406`),
    `step_forever`'s `std::thread::sleep` + `std::time::Instant` (`device.rs:576-589`), and
    the filesystem in `load_face` (`glb.canonicalize()`, `FaceMeta::from_glb_file` →
    `std::fs::read`, `device.rs:231-235`, `meta.rs:116`).
12. **The device→view feed already works by shared handles, not by the thread**: the view
    holds a sibling `RigHal` clone (`view.rs:37-40`) and polls `device.rig.pose()` every
    frame in `apply_pose` (`view.rs:476-488`); `RigHal` is `Arc<Mutex<Inner>>` with
    synchronous `try_send` (`vizij-arora-hal/src/lib.rs:59-62,158-160`), and it also offers an
    owned delta stream, `pose_updates()` (`lib.rs:91-95`). `DeviceEvent` is drained with
    `try_recv` in `apply_device_events` (`view.rs:140-160`). In one wasm module all of this
    is the same code on one thread; the `Mutex` is never contended.
13. **No browser device reaches Studio today, and the device-side Studio client is
    native-only by declaration**: `arora-studio-bridge-client` 6.1.0 pulls `zenoh` 1.9,
    `firestore`, `gcloud-sdk` and `tokio` `rt` (registry `Cargo.toml:33-105`), and its README
    states it "is not meant to be compiled to WebAssembly"
    (`studio-bridge/device-client/README.md:31-32`); on wasm32 it fails in `mio` — "This wasm
    target is unsupported by mio. If using Tokio, disable the net feature"
    (`logs/summary.txt`; 48 errors in `mio` 1.2.3) — i.e. the Zenoh transport's
    socket layer, before Firestore or gcloud are reached. The bridge's browser transport exists only on the **Studio** side: the router
    serves the native Zenoh protocol to devices and `zenoh-plugin-remote-api` over WebSocket
    to browsers (`studio-bridge/README.md:61-63`), and `studio-bridge-studio-client` is a
    wasm-bindgen cdylib that binds `@eclipse-zenoh/zenoh-ts` through a dynamic import
    (`studio-bridge/studio-client/src/zenoh_ts.rs:65-80`, `Cargo.toml:63-80`). Semio Studio's
    web app consumes that client (`semio_studio/apps/studio/src/main.tsx:52-57`,
    `hooks/use-device-live-data.ts:66-70`); `apps/vizij-app` is a Tauri app whose device is
    native `arora` with `studio-bridge` (`apps/vizij-app/src-tauri/Cargo.toml:19-22`).
14. **`arora` with `native` does not build for wasm32**: the feature the vizij-rs native app
    uses (`vizij/Cargo.toml:32`, default features) pulls wasmtime 45 and cranelift, and the
    build dies in `errno` — "The target OS is \"unknown\" or \"none\", so it's unsupported by the
    errno crate" (`logs/summary.txt`; via `rustix`, 22s in). The Bevy wasm build
    of `crates/vizij` must therefore depend on `arora` with `default-features = false`,
    which also drops the operator flow it cannot use (finding 11).

## Questions answered

**Q1 — Which arora crates and features compile on wasm32-unknown-unknown?**
The library slice: `arora` with `default-features = false` (finding 1), i.e. `arora-engine`
without `wasmtime-host`/`native-host` (the browser executor is selected by target cfg,
`arora-9.11.1/src/lib.rs:620-624`), `arora-types`, `arora-hal`, `arora-bridge`,
`arora-behavior`, `arora-behavior-tree`, `arora-simple-data-store`, plus `arora-web` (itself
`cfg(target_arch = "wasm32")`-only, `arora-sdk/crates/arora-web/Cargo.toml:13-30`).
`native`, `tui`, `studio-bridge` are off the table (findings 1, 13, 14). The two memory rules
hold in the graph: no `tokio = "full"` anywhere in it, and the one build-dependency `tokio`
(`vizij-animation-module`) compiles for the host (finding 9).

**Q2 — Compile spike, crate by crate.** See the table under Evidence. In short: `arora`
(no default features), `vizij-api-core`, `vizij-graph-core` (with `urdf_ik`),
`vizij-arora-store`, `vizij-arora-hal`, `vizij-arora-host` (with or without
`publish-frames`), `vizij-arora-behavior`, `vizij-animation-module` (registered as a host
module, stepped from an embedder clock) and `arora-web` all compile for wasm32.
`vizij-graph-core` without `urdf_ik` fails on every target (finding 7). `vizij-arora-tts`
fails in `tokio` (`rt-multi-thread`; finding 10). `arora-studio-bridge-client` fails in
`mio` (finding 13). `arora/native` fails in `errno` under wasmtime (finding 14).

**Q3 — The run loop.** `AroraWeb::run` = `Arora::run` under `future_to_promise`
(finding 5); `Arora::run` on wasm sleeps on `gloo-timers` and measures dt with `web_time`
(finding 4, landed as ARORA-68). A Bevy wasm app does not need `run` at all: a system holding
the `Arora` as a `NonSend` resource calls `Arora::step(time.delta())` each frame — the exact
mode the API documents ("`requestAnimationFrame` on the web") and the one the spike's
`step_once` compiles (`src/lib.rs:53-55`). Bevy's wasm schedule is single-threaded and
`NonSend` systems run on the main thread (finding 2), which is also the thread winit's rAF
loop and the WebGPU canvas live on. What is lost by not running in a Web Worker is the
hidden-tab cadence (finding 4's doc), which is the same trade the three.js standalone makes
today (finding 5).

**Q4 — Device→view feed in one module; bridges in the browser.** Feed: unchanged
(finding 12). Worker-thread assumptions to replace (finding 11): the thread → construct the
`Arora` in a Bevy startup system and insert it as a non-send resource; `std::sync::mpsc` for
`DeviceEvent` → keep (it is single-threaded-safe on wasm) or replace with Bevy `Messages`;
the tokio runtime + TUI pump + `AroraBuilder::run` operator flow → gone (native-only; the
browser's operator surface is the JS surface, which is what the standalone's demo and the
authoring app use); `step_forever` → a Bevy `Update` system; `load_face` on a path → the
same composition over GLB bytes (`FaceMeta`/`Bundle` parse from bytes already: `meta.rs:116`
is the only `std::fs` call, and `RigHal::set_model_glb` takes bytes). Bridges: for the demo
and the authoring app, none beyond `AroraWeb`'s JS surface (`step`/`run`/`call`/store
accessors, finding 5). For a browser face piloted from Studio there is nothing to reuse:
the device-side client is native-only and no browser device exists today (finding 13); the
router does speak WebSocket to browsers, and a Rust-in-wasm binding to `zenoh-ts` is proven
on the Studio side, so a browser device client is buildable but is new work in studio-bridge.

**Q5 — Host modules in wasm.** Registration is target-agnostic (finding 9). Async host
functions keep the poll-on-tick contract (`arora-sdk/docs/async-functions.md`: `Running` is
`Poll::Pending`; "Browser (wasm): a Web Worker running the work; messages posted back land
on a channel the function polls"; the doc's own recommendation is a non-blocking `http`
host capability shaped after `wasi:http`). The cloud `say` on wasm needs (finding 10):
`wasm_bindgen_futures::spawn_local` (or a Bevy `AsyncComputeTaskPool` task, which on wasm is
the same single-threaded executor) in place of the tokio runtime, keeping the
`JoinHandle`-poll shape but polling a `oneshot`/shared cell instead; `reqwest`'s wasm
backend or `web_sys::fetch` for the two POSTs (the request framing is unchanged); Web Audio
(`web_sys::AudioContext` / `decodeAudioData` / `AudioBufferSourceNode`, playhead from
`AudioContext.currentTime`) instead of `rodio` + a sleeping thread; `web_time::Instant`.
None of this is cfg'd today; the crate has no wasm branch at all. The Piper provider is a
GPL C library with `bindgen` and out of scope for wasm (`vizij-piper/Cargo.toml`).

## Evidence

### Compile spike: `cargo check --target wasm32-unknown-unknown --features <step>`

Cumulative steps (each includes the previous unless noted). `logs/summary.txt` gives each
step's exit code, time and `first_error`, the first `error` line of its cargo output.

| Step | Adds | Result | Detail |
| --- | --- | --- | --- |
| 0 | `arora =9.11.1`, `default-features = false` | compiles (5m55s cold) | — |
| 1 | `vizij-api-core`, `vizij-graph-core` (`default-features = false`) | **fails** | E0432 `super::urdfik::*` unresolved (not wasm-specific, finding 7) |
| 1-urdf | `vizij-graph-core/urdf_ik` (`k`, `urdf-rs`) | compiles (108s) | — |
| 2 | `vizij-arora-store`, `vizij-arora-hal` | compiles (2s) | — |
| 3 | `vizij-arora-host` | compiles (3s) | — |
| 3-frames | `vizij-arora-host/publish-frames` (branch off 3) | compiles (14s) | `arora-msgs-ros2` without `interop` |
| 4 | `vizij-arora-behavior` | compiles (7s) | — |
| 5 | `vizij-animation-module` + `with_host_module(ModuleBuilder…)` + `step_once` (`src/lib.rs:24-55`) | compiles (12s) | the build script ran on the host |
| 6 | `vizij-arora-tts` (branch off 5) | **fails** | `tokio`: "Only features sync,macros,io-util,rt,time are supported on wasm" |
| 7 | `arora-web =6.1.0` (branch off 5) | compiles (9s) | — |
| 8 | `arora-studio-bridge-client =6.1.0` alone | **fails** | `mio`: "This wasm target is unsupported by mio" |
| 9 | `arora/native` alone | **fails** | `errno` (under `rustix` / wasmtime 45): "target OS is unknown" |

Steps 2-5 and 7 are seconds because they add only the named crates on top of the cached
step; the crate lists above are what each step compiled for the first time.

### Where each worker-thread assumption lives

| device.rs | What | In-schedule replacement |
| --- | --- | --- |
| `299-338` `start` | `thread::Builder::spawn`, `Arora` built inside | Build in a `Startup` system; `insert_non_send_resource` |
| `303`, `42` | `std::sync::mpsc` `DeviceEvent` | Keep, or Bevy `Messages<DeviceEvent>` |
| `446-540` `supervise` | tokio multi-thread runtime, `tokio::spawn(pump)`, `tokio::select!` over `AroraBuilder::run` | Not applicable in the browser (`native`-only API); reload = rebuild the resource |
| `472-483` | `arora::tui::commands_frontend` | `tui` feature, native only |
| `121` `attach_bridges` | `arora::local_ws_bridge()` (`arora-bridge-ws`, tokio-tungstenite server) | None in the browser; the JS surface is the local bridge |
| `576-589` `step_forever` | `std::thread::sleep`, `std::time::Instant` | `Update` system calling `Arora::step(time.delta())` |
| `231-235` `load_face` | `Path::canonicalize`, `std::fs::read` | Bytes from fetch / file picker into the same parser |

### The arora 9.11.1 wasm surface, by line

- Executor selection: `lib.rs:609-638` (`native` → wasmtime + native host; `!native && wasm32`
  → `BrowserExecutor`; `!native && !wasm32` → no executor, "the slice that builds on every
  target — including the 32-bit Android ABIs, where wasmtime has no backend").
- Run loop: `runtime.rs:80-113` (`select_biased!` over metronome tick, HAL feed, inbound).
- Metronome: `runtime.rs:619-666`.
- `step`: `runtime.rs:572-611`.
- `native`-gated entry points: `operator` (`lib.rs:20-21`), `studio` (`28-29`), `tui`
  (`32-33`), `with_frontend` (`380-381`), `AroraBuilder::run` (`405-406`).

## Implications for the target picture

- The face device can be **one wasm module with the Bevy view**: `Arora` as a non-send
  resource stepped by an `Update` system, `RigHal` cloned into the view resource as today,
  no worker, no second module, no postMessage marshalling. The authoring app and the demo
  talk to it through the same `AroraWeb`-style JS surface vizij-arora-web exposes, so those
  consumers change renderer, not protocol.
- A **Web-Worker-hosted device with the view as a rendering subscriber** stays possible
  (ARORA-68's motivation) but is a different composition: the `RigHal` handle would no
  longer be shareable and the pose would cross `postMessage`; it buys hidden-tab cadence
  only. Not needed for the target as scoped (the face idles with its page).
- **`say` in the browser is new work** either way: a wasm branch of `vizij-arora-tts`
  (fetch + Web Audio) or a JS-side provider registered as a host module through the JS
  surface. The contract (`vizij-arora-behavior::speech`) and the viseme players are portable
  already.
- **Frame publishing is a non-issue for the wasm build**: `publish-frames` compiles there,
  so `crates/vizij` can keep one feature set across targets; whether a browser face pushes
  frames is a bridge question (nothing carries them in the browser), not a build one.
- **A browser face piloted from Studio needs a browser device client** in studio-bridge (a
  `Bridge` over `zenoh-ts` + Firebase JS auth), mirroring what `studio-bridge-studio-client`
  does for the operator side; the wasm face is not the piece that blocks it.
- `apps/vizij-app` (Tauri) keeps its native `arora` + `studio-bridge` device; consuming the
  Bevy view as a library there is a native question, not a wasm one.

## Implications for the plan

1. Fix `vizij-graph-core` so `default-features = false` compiles (gate the two `use` sites),
   or drop the pretence that `urdf_ik` is optional. Small, independent, worth doing first.
2. Split `crates/vizij/src/device.rs` into the target-agnostic composition (`load_face` over
   bytes, `builder_for`, the skill modules) and a native driver (thread + operator flow); the
   browser driver is a Bevy plugin owning the `Arora` as a non-send resource. The spike's
   `compose` + `step_once` are the shape.
3. Give `vizij-arora-tts` a `wasm32` branch (spawn_local + fetch + Web Audio) behind
   `cfg(target_arch)`, keeping the `say` closure and run map; or provide the browser `say`
   as a JS host module. Decide before the demo folder is written, since the demo is where
   `say` is exercised.
4. Build `crates/vizij` for wasm with `arora` `default-features = false` (finding 14) and
   without `rodio`, `crossterm`, `clap`/`env_logger` on that target — all of them are
   unconditional dependencies today (`vizij/Cargo.toml:12-14,46-52,81`) and belong
   under `[target.'cfg(not(target_arch = "wasm32"))'.dependencies]`.
5. A Studio-piloted browser face is a studio-bridge deliverable (browser device client);
   list it as out of the retirement gate unless the plan wants it.

## Open questions

- Does Bevy's `AsyncComputeTaskPool` on wasm (single-threaded, `web-task` backed) suffice to
  host the `say` fetch + audio future, or should the TTS crate depend on
  `wasm-bindgen-futures` directly to stay Bevy-free? Not tested.
- Whether `reqwest` 0.13's wasm backend compiles with the crate's current feature set
  (`json`) once the tokio use is cfg'd out — step 6 fails in `tokio` before `reqwest` is
  checked, so this is unverified. `cpal`/`symphonia` did compile, but
  `rodio::OutputStream::try_default()` on a wasm build without cpal's `wasm-bindgen`
  feature is untested at run time.
- `std::sync::Mutex` in `RigHal` and in the TTS run map on wasm32: fine single-threaded,
  but a future Web-Worker split would need the HAL side of the seam redesigned.
- Whether the Studio router's WebSocket remote-api can serve a *device* (liveliness,
  queryables) — studio-client's e2e tests fake a device natively
  (`studio-bridge/studio-client/Cargo.toml:40-48`), which suggests the device role over
  the remote API has not been exercised.
