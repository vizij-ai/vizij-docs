# Bevy 0.19.1 renders a Vizij face GLB in a browser canvas; what that build costs and what keeps `vizij` off wasm today
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,bevy,wasm,webgl2,vizij-rs,browser,ci,multi-face -->
> **Last updated:** 2026-09-28
> **Related documents:** [Central plan](../bevy_everywhere-plan.md)

All paths are repo-relative; `vizij-rs` is the default repo. Registry sources are
quoted as `<crate>-<version>/path` (the `~/.cargo/registry` copy of what
`Cargo.lock` resolves). The spike's sources, build script, pages and
screenshots are in
[vizij-rs `spikes/bevy-everywhere/bevy-wasm/`](https://github.com/vizij-ai/vizij-rs/tree/spikes/bevy-everywhere/spikes/bevy-everywhere/bevy-wasm)
(branch `spikes/bevy-everywhere`; `SPIKE/` below): `Cargo.toml`, `src/lib.rs`,
`build.sh`, `index.html`, `multi-a.html`, `multi-b.html`, `multi-c.html`,
`shoot.js`, `pixdiff.py`, `t4-check.sh`, `wasm-sections.py`, `lto-variant/`,
`shots/`, `pkg-lto/`. Build, HTTP and console logs and the built `.wasm` are
not kept: the timings, sizes and log lines quoted on this page are the
record.

## Findings

1. **Bevy 0.19.1 renders a Vizij face GLB with morph targets into a page canvas
   over WebGL2, and the morphs animate.** A 190-line crate (`SPIKE/src/lib.rs`)
   mirroring `crates/vizij/src/view.rs` (orthographic camera fitted to the
   authored `rootBounds`, `Tonemapping::None`, `DebandDither::Disabled`,
   `Msaa::Sample4`, materials made unlit/double-sided with the ambient factor
   baked in) loads `assets/Quori_Current_Extended.glb` and oscillates the
   Mouth's `jawud` and the lids' first target. Two headless screenshots 0.9 s
   apart differ on 4.2 % of the canvas pixels, with the jaw open in one and
   closed in the other (`SPIKE/shots/single-default-{1,2}.png`; §Evidence A).
2. **The Bevy feature set that suffices for the face is
   `default_app, 3d_bevy_render, scene, std, bevy_winit, multi_threaded, webgl2`**
   (`SPIKE/Cargo.toml`): ros-viz-rs's expanded default list
   (`ros-viz-rs/Cargo.toml:97-118`) minus 2d, ui, audio, picking, gilrs, x11,
   wayland, sysinfo, default_font and the Android backends. `3d_api` carries
   `morph`, `morph_animation` and `bevy_gltf` (`bevy-0.19.1/Cargo.toml`,
   features `3d_api`/`3d_bevy_render`). No `getrandom` backend flag and no
   `web` feature spelling were needed: `bevy_winit` turns `bevy_app/web`,
   `bevy_platform/web` and `bevy_reflect/web` on for the `wasm32` target itself
   (`bevy_winit-0.19.1/Cargo.toml:145-158`).
3. **The build is heavy: 41 min cold, 47.8 MB raw, 42.3 MB after wasm-bindgen,
   9.65 MB gzipped** — cold `cargo build --release --target wasm32-unknown-unknown`
   with vizij-rs's profile (`opt-level = "s"`, `lto = true`, `codegen-units = 1`,
   `Cargo.toml:40-43`): wall 41 m 10 s, CPU 24 m 59 s user + 2 m 30 s sys, on an
   8-core / 16 GB Mac whose load average sat between 100 and 200 throughout
   because sibling sub-studies were building at the same time; the CPU time
   is the fairer number. Of the 42.3 MB, 24.7 MB is code, 13.1 MB is the
   `name` custom section (symbol names, droppable), 4.1 MB is data (§Evidence
   B). `wasm-bindgen --target web` took
   9.6 s; native `wasm-opt -Os --strip-debug` takes 2 m 49 s and leaves
   26.0 MB (7.6 MB gzipped) — the npm `binaryen` package's JavaScript wasm-opt
   had produced nothing after 30 min. An incremental rebuild after a one-line change takes 14 s wall
   — because **cargo applies no LTO to this crate**: the final `rustc` runs
   with `-C codegen-units=1 -C opt-level=s
   -C strip=debuginfo` and no `-C lto` (`cargo build -v`, §Evidence B). A lib
   target whose `crate-type` includes `rlib` is excluded from LTO by cargo's
   `Target::can_lto` rule (inferred from the flags; cargo's source was not
   read), and the spike copied `["cdylib", "rlib"]` from vizij-rs's wasm
   crates (`crates/interop/vizij-arora-web/Cargo.toml:9`) and ros-viz-rs
   (`ros-viz-rs/Cargo.toml:176`) — so those builds are not LTO'd either,
   whatever `[profile.release] lto = true` says. A `cdylib`-only variant
   (`SPIKE/lto-variant/`) recompiles the whole dependency graph under cargo's
   LTO unit hashes (every dependency gets `-C linker-plugin-lto`) and links
   with `-C lto`: 19 m 18 s wall / 19 m CPU for the whole graph, of which the
   fat-LTO link of the final crate alone is ≈ 9 min — and it buys 7 % after
   wasm-opt (24.2 MB / 7.2 MB gzipped, against 26.0 MB / 7.6 MB without LTO;
   §Evidence B). The wasm-opt figures are there too.
4. **The wasm-bindgen CLI must match the locked crate version exactly, and the
   machine's does not**: `~/.cargo/bin/wasm-bindgen` is 0.2.104, `Cargo.lock`
   resolves `wasm-bindgen 0.2.128` (`Cargo.lock:11463-11465`); `cargo install
   wasm-bindgen-cli --version 0.2.128 --locked` took 4 m 14 s. vizij-rs's CI
   installs `wasm-pack` instead (`.github/workflows/ci.yml:62-63`), which
   downloads the matching CLI itself.
5. **Headless Chromium composites the WebGL2 canvas with no flags at all.**
   Playwright 1.61's Chromium 149 (`chromium-1228`) reports
   `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device …))` by default, and
   `--use-angle=swiftshader`, `--enable-unsafe-swiftshader`, both together, or
   `--use-gl=angle --use-angle=swiftshader --ignore-gpu-blocklist` change
   nothing: every variant renders and animates (4.0–5.0 % changed pixels,
   §Evidence C). Bevy logs `The selected adapter is using a driver that only
   supports software rendering` (`bevy_render-0.19.1/src/renderer/mod.rs:291`)
   and disables OIT, SSAO, atmosphere, GPU preprocessing and clustering on that
   adapter — none of which the face uses.
6. **Two `App::run()`s in one wasm module cannot coexist**: the second panics at
   `bevy_winit-0.19.1/src/lib.rs:128` — `Failed to build event loop:
   RecreationAttempt` — because winit keeps one process-wide
   `EVENT_LOOP_CREATED` flag (`winit-0.30.13/src/event_loop.rs:69,118`) that the
   web backend only resets when a spawned loop is destroyed
   (`winit-0.30.13/src/platform_impl/web/event_loop/runner.rs:719-721`). The
   first app keeps running; the second canvas stays blank; `LogPlugin` also
   errors (`Could not set global logger … already set`). Sequential apps
   (exit, then start) would be allowed by winit; concurrent ones are not
   (`SPIKE/shots/multi-a-1.png`, §Evidence D).
7. **Two instances of the same wasm module, each in its own memory, run two
   faces side by side.** Importing the generated glue twice under distinct
   URLs (`./pkg/x.js?instance=a`, `?instance=b`) yields two module objects
   (`a === b` is false), because the glue caches its instance in a module-level
   `wasm` variable (`wasm-bindgen-cli-support-0.2.128/src/js/mod.rs:1550,1570`)
   — one per module instance. Both `start()` calls succeed; Quori and Toasty
   render and animate in their own canvases (5.3 % / 28.8 % changed pixels,
   `SPIKE/shots/multi-b-{1,2}.png`). The price is one 42 MB module compiled
   and instantiated per face; memory use per instance is unmeasured.
8. **One App, one full-page transparent canvas and one viewport camera per DOM
   element works — the three.js "multiple elements" pattern.** `start_overlay`
   spawns N `Camera3d`s with `order = i`; the page pushes each slot's
   `getBoundingClientRect()` every animation frame through an exported
   `set_rects`, and a system sets `Camera.viewport` in physical pixels
   (`SPIKE/src/lib.rs`, `apply_rects`). Both slots show the animating face at
   their own size (26.9 % / 20.9 % changed pixels, `SPIKE/shots/multi-c-{1,2}.png`).
   The region outside every viewport is cleared with the *global* `ClearColor`
   resource (Bevy's default `srgb_u8(43, 44, 47)`, measured `[43,44,47,255]` in
   the canvas, §Evidence E), not the cameras' own clear color, so it must be
   set to `Color::NONE`. With that one line the canvas outside the viewports
   reads `[0,0,0,0]`, and the page's text, gradient and slot borders show
   through around the two animating faces
   (`SPIKE/shots/multi-c-v2-{1,2}.png`, §Evidence E) — even though wgpu's WebGL
   backend advertises only `CompositeAlphaMode::Opaque`
   (`wgpu-hal-29.0.4/src/gles/adapter.rs:1275`): the canvas context it creates
   has `alpha: true, premultipliedAlpha: true`, and the cleared alpha reaches
   the compositor.
9. **The four interop crates already check clean for wasm32**:
   `cargo check -p {vizij-arora-store, vizij-arora-hal, vizij-arora-behavior,
   vizij-arora-host} --target wasm32-unknown-unknown --locked` all exit 0
   (31 s, 16 s, 29 s, 2 s including their dependencies) — consistent with
   `vizij-arora-web` already composing them for the browser
   (`crates/interop/vizij-arora-web/Cargo.toml`).
10. **`crates/vizij` does not check for wasm32, and the first wall is arora's
    default features, not Bevy.** `cargo check -p vizij --target
    wasm32-unknown-unknown --locked` stops in 87 s at `errno`: *"The target OS
    is "unknown" or "none", so it's unsupported by the errno crate"*. `errno`
    reaches the wasm target through `rustix ← cap-primitives/cap-net-ext ←
    wasmtime-wasi ← arora-engine` (`cargo tree -i errno`, §Evidence F), i.e.
    arora's `native` default feature (`arora-9.11.1/Cargo.toml:27-38`:
    `native` = `arora-bridge-ws`,
    `env_logger`, `clap`, `arora-engine/wasmtime-host`, `native-host`), which
    `crates/vizij/Cargo.toml` requests with `arora = "9.10"`. With
    `--keep-going`, six crates fail independently of one another — `errno`,
    `io-extras` and `wasmtime-internal-fiber` (*fibers are not supported on
    this platform*) via `arora-engine`'s wasmtime host; `getrandom 0.2` (*enable
    the "js" feature*) via `rand ← tokio-tungstenite ← arora-bridge-ws ← arora`;
    `mio 1.2` (*This wasm target is unsupported by mio. If using Tokio, disable
    the net feature*) via tokio's `net`; and `crossterm` (16 `E0433`/`E0425`
    errors on missing libc/rustix items) via both `vizij` itself and arora's
    `tui` feature (§Evidence F). tokio, cpal/rodio and reqwest never compile
    in that run because their own dependencies fail first, so the list is the
    first layer only.
11. **Beyond arora, the `vizij` crate's own sources are host-bound in seven
    places**: `tokio::runtime::Builder::new_multi_thread()` (`device.rs:455`)
    with `tokio = { features = ["rt-multi-thread", "time"] }`
    (`crates/vizij/Cargo.toml`), rejected on wasm by
    `tokio-1.53.1/src/lib.rs:467-479` (`compile_error!("Only features
    sync,macros,io-util,rt,time are supported on wasm.")`); `std::thread`
    (`device.rs:6,311`); `crossterm` (`main.rs:352-355`); `env_logger`
    (`main.rs:149`); `clap` (`main.rs:13`, `view.rs:43`, `frames.rs:39`);
    `std::fs::read` for the GLB (`meta.rs:116`); `SystemTime::now()` for frame
    stamps (`frames.rs:224`); and `rodio` (`tts_piper.rs:177-194`, plus
    `vizij-arora-tts`'s own `rodio`, `reqwest`, `tokio rt-multi-thread`). The
    view half (`view.rs`) itself uses nothing host-specific.
12. **Bevy's asset loader fetches `assets/<path>` relative to the page and
    probes a `.meta` sidecar first**: the HTTP log shows
    `GET /assets/Quori_Current_Extended.glb.meta → 404` then the GLB, a harmless
    console error to expect in the browser device
    (`bevy_asset-0.19.1/src/io/wasm.rs`, `src/lib.rs:344`).
13. **`App::run()` returns immediately on the web**: the winit runner spawns the
    loop and returns `AppExit::Success` (`bevy_winit-0.19.1/src/state.rs:895-900`,
    logged `App::run returned: Success` in the console), so a JS `start()` is
    non-blocking and the page keeps control.

## Questions answered

**T1 — Can Bevy 0.19.1 render a Vizij face GLB in a browser canvas, and what
does the wasm build cost?** Yes (finding 1). Cost: 41 min wall / 27.5 min CPU
cold on a heavily loaded 8-core Mac; 47.8 MB raw, 42.3 MB after wasm-bindgen,
9.65 MB gzipped, 26.0 MB / 7.6 MB gzipped after native wasm-opt; with fat LTO
(`cdylib`-only crate) 24.2 MB / 7.2 MB gzipped at ≈ 9 min per link
(findings 3–4).

**T2 — Does the face render and animate in a browser, and does the WebGL canvas
composite headlessly?** Yes and yes: Playwright's headless Chromium renders and
animates it with no flags; SwiftShader is already its default adapter, and the
`--use-angle=swiftshader` / `--enable-unsafe-swiftshader` flags are no-ops there
(finding 5).

**T3 — Multiple faces on one page?** (a) Two Apps in one module: no, winit's
single event loop (finding 6). (b) Two module instances: yes, at one module
per face (finding 7). (c) One App, one overlay canvas, viewport cameras: yes,
with the global `ClearColor` set transparent, verified (finding 8).

**T4 — What blocks a wasm build of `vizij` today, and which interop crates pass?**
All four interop crates pass. `vizij` fails first on arora's `native` default
features (wasmtime/cap-std → rustix → errno), then on tokio's multi-thread
runtime and the host-only pieces listed in finding 11 (findings 9–11; full
failing-crate list in §Evidence F).

## Evidence

### A. Single face (T1/T2)

| Item | Value |
|---|---|
| Crate | `SPIKE/Cargo.toml`, `SPIKE/src/lib.rs` (edition 2021, `bevy = "=0.19.1"`, `wasm-bindgen = "=0.2.128"`) |
| Camera | `Projection::Orthographic` with `ScalingMode::AutoMin { min_width: 22.58, min_height: 14.41 }` (Quori's `rootBounds`, read from the GLB's `Scene` node `RobotData`), `Transform::from_xyz(cx, cy, 100)` looking at `(cx, cy, 0)` — `view.rs`'s `Fit::Contain` |
| Window | `Window { canvas: Some("#face-a"), fit_canvas_to_parent: true, prevent_default_event_handling: false }` |
| Page | `SPIKE/index.html`: `<canvas id="face-a">` in a 763×486 stage; `import('./pkg/bevy_wasm_spike.js')`, `await mod.default()`, `mod.start('#face-a', 'Quori_Current_Extended.glb')` |
| wasm ready | 239 ms from `import` to `init()` resolved (local server, 42 MB) |
| Screenshot pair | `shots/single-default-{1,2}.png`: 35 distinct colors in the canvas, 15,415 / 370,818 pixels changed (4.2 %) between t+5 s and t+5.9 s; jaw closed in 1, open in 2 |

### B. Build cost (T1)

| Step | Time | Size |
|---|---|---|
| `cargo install wasm-bindgen-cli --version 0.2.128 --locked --root SPIKE/tools` | 4 m 14 s | — |
| `cargo build --release --target wasm32-unknown-unknown --lib` (cold, load avg 100–200) | 41 m 10 s wall, 24 m 59 s user, 2 m 30 s sys | `bevy_wasm_spike.wasm` 47,811,367 B |
| `wasm-bindgen --target web --no-typescript` | 9.6 s | `bevy_wasm_spike_bg.wasm` 42,276,002 B; `.js` 100,577 B |
| `gzip -9` of the wasm-bindgen output | — | 9,652,623 B |
| wasm-opt `-Os --strip-debug --strip-producers` (native binaryen `version_123` arm64 release tarball in `SPIKE/tools/`) | 2 m 49 s wall, 259 s user | 25,992,930 B raw (code 21,619,686; data 4,053,900; no `name` section), 7,625,738 B gzipped |
| the same through `npx -y -p binaryen wasm-opt` (binaryen 132's JavaScript build) | killed after 30 min without output | — |
| Incremental rebuild after a one-line change (same profile, same load; no LTO, see below) | 14.2 s wall, 3.1 s user (+ wasm-bindgen 26 s) | 47,811,936 B raw, 42,276,381 B after wasm-bindgen |
| `cdylib`-only variant (`SPIKE/lto-variant/`; cargo applies fat LTO; 225 of the 300 units recompiled, the 75 reused ones being host build scripts and proc-macros; load avg 90–150) | 19 m 18 s wall, 19 m 00 s user, 1 m 24 s sys, of which the final crate (the LTO link) ≈ 8.5–9 min | 39,362,215 B raw; 35,010,796 B after wasm-bindgen (code 22,004,191; `name` 8,883,492; data 3,822,475), 8,817,694 B gzipped; after native wasm-opt 24,222,078 B (code 20,172,624; data 3,768,513), 7,205,261 B gzipped (`SPIKE/pkg-lto/`) |

Final-crate `rustc` flags of the `["cdylib", "rlib"]` build (`cargo build -v`):
`-C codegen-units=1 -C opt-level=s -C strip=debuginfo` — no `-C lto`. In the
`cdylib`-only variant every dependency is compiled with `-C linker-plugin-lto`
in addition, which is why cargo recompiles the whole graph rather than reusing
the first build's artifacts; the final crate's flags are `-C codegen-units=1 -C
lto -C opt-level=s -C strip=debuginfo` with `--crate-type cdylib`.

Section breakdown of the 42,276,002 B wasm-bindgen output
(`SPIKE/wasm-sections.py`): `code` 24,717,290; `name` 13,068,087;
`data` 4,109,871; `element` 221,240; `function` 127,223; rest < 40 KB.

### C. Headless compositing (T2)

Playwright 1.61.0 (`semio_studio/node_modules/playwright`), Chromium 149.0.7827.55
(`~/Library/Caches/ms-playwright/chromium-1228`), `chromium.launch({ headless:
true, args })`, viewport 1100×720, `SPIKE/shoot.js`:

| args | `UNMASKED_RENDERER_WEBGL` | rendered | changed pixels |
|---|---|---|---|
| none | ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0)), SwiftShader driver) | yes | 4.2 % |
| `--use-angle=swiftshader` | same | yes | 4.5 % |
| `--enable-unsafe-swiftshader` | same | yes | 4.0 % |
| both | same | yes | 4.5 % |
| `--use-gl=angle --use-angle=swiftshader --ignore-gpu-blocklist` | same | yes | 5.0 % |

Console under every variant: `AdapterInfo { name: "ANGLE (…SwiftShader…)",
device_type: Cpu }`, the b0006 software-rendering warning, and the capability
fallbacks listed in finding 5. A "GPU stall due to ReadPixels" GL performance
warning repeats a few times.

### D. Two faces (T3 a/b)

| Page | Mechanism | Outcome |
|---|---|---|
| `multi-a.html` | one `init()`, `start('#face-a')` then `start('#face-b')` | first returns; second throws `RuntimeError: unreachable` after the panic `Failed to build event loop: RecreationAttempt` (`bevy_winit-0.19.1/src/lib.rs:128`); `bevy_log` errors `Could not set global logger and tracing subscriber as they are already set`; face-a animates (1.0 % changed), face-b blank (2 colors, 0 changed) |
| `multi-b.html` | `import('./pkg/x.js?instance=a')` and `?instance=b`, each `await init()` | `a === b` false; both `start()` return; Quori (5.3 % changed) and Toasty (28.8 % changed) animate side by side |

Toasty's striped background in `multi-b-1.png` is the spike's naive
oscillation of every morphed node's first target (`round` on `FaceGEO` and
`FaceShadowGeo`), not a rendering defect (unverified beyond the target names).

### E. Overlay canvas with viewport cameras (T3 c)

`multi-c.html`: `#overlay { position: fixed; inset: 0; pointer-events: none }`
holding the canvas; two in-flow dashed slots (400×260 and 300×300); a
`requestAnimationFrame` loop calling `set_rects(Float32Array)` with each
slot's `getBoundingClientRect()`; `start_overlay('#face-overlay', glb, 2)`.
Cameras: `Camera { order: i, clear_color: Custom(Color::NONE) }`, viewport =
rect × `scale_factor`, clamped to the canvas, camera deactivated when the
clamped rect is empty (`SPIKE/src/lib.rs`, `apply_rects`).

| Check | Result |
|---|---|
| Both slots draw the face at their own size | yes (`shots/multi-c-{1,2}.png`; slot A 26.9 %, slot B 20.9 % changed pixels) |
| Canvas outside the viewports, global `ClearColor` left at Bevy's default | `[43, 44, 47, 255]` read back through `drawImage` — Bevy's default global `ClearColor`; the page text under it is hidden |
| Canvas context attributes | `alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: false` (wgpu's WebGL context, `wgpu-hal-29.0.4/src/gles/web.rs:101-105`) |
| `Window { transparent: true }` | reaches winit as `with_transparent(true)` (`bevy_winit-0.19.1/src/winit_windows.rs:133`); wgpu's gles adapter offers `composite_alpha_modes: [Opaque]` only (`wgpu-hal-29.0.4/src/gles/adapter.rs:1275`) |
| Canvas outside the viewports, global `ClearColor(Color::NONE)` | canvas outside the viewports reads `[0,0,0,0]`; screenshot samples at (400,20)/(700,550) are the page gradient `(42,42,63)`/`(38,38,51)`; the status text and both dashed slot borders are visible; slot A 26.7 % changed pixels (`shots/multi-c-v2-{1,2}.png`) |
| Screenshot cost | a full-viewport software-rendered canvas made Playwright's `page.screenshot` exceed its 30 s default at 1100×720; it passed at 800×600 with a 120 s timeout |

### F. `cargo check` for wasm32 (T4)

`SPIKE/t4-check.sh`, `CARGO_TARGET_DIR=SPIKE/target-t4`, `--locked` (the lock
file is untouched; `git status` clean):

| Crate | Exit | Time | Errors |
|---|---|---|---|
| vizij-arora-store | 0 | 31 s | 0 |
| vizij-arora-hal | 0 | 16 s | 0 |
| vizij-arora-behavior | 0 | 29 s | 0 |
| vizij-arora-host | 0 | 2 s | 0 |
| vizij (default features) | 101 | 87 s | `errno v0.3.14` build script: *The target OS is "unknown" or "none", so it's unsupported by the errno crate* |

`cargo tree -p vizij --target wasm32-unknown-unknown -i errno` (target-side
paths only; the `cbindgen` path is a host build-dependency):
`errno ← rustix ← {cap-net-ext, cap-primitives ← cap-fs-ext/cap-std} ← wasmtime-wasi ← arora-engine ← arora ← vizij`.

`cargo tree -e features -i tokio` on that target requests `rt-multi-thread`,
`net`, `fs`, `io-std`, `mio`, `socket2`, `macros`, `sync`, `time` — five of
which `tokio-1.53.1/src/lib.rs:467-479` rejects on `target_family = "wasm"`.

With `--keep-going`, the crates that
fail independently of each other, and who pulls them on the wasm32 target
(`cargo tree -i <crate> --edges normal`):

| Failing crate | Error | Pulled by |
|---|---|---|
| `errno 0.3.14` | build script: target OS "unknown" unsupported | `rustix ← cap-primitives/cap-net-ext ← wasmtime-wasi ← arora-engine ← arora (native)` |
| `io-extras 0.18.4` | unresolved rustix/libc items | `cap-std family ← wasmtime-wasi ← arora-engine` |
| `wasmtime-internal-fiber 45.0.3` | *fibers are not supported on this platform* | `wasmtime ← arora-engine (wasmtime-host) ← arora, vizij-arora-tts` |
| `getrandom 0.2.17` | *wasm*-unknown-unknown targets are not supported by default, enable the "js" feature* | `rand_core ← rand 0.8 ← tokio-tungstenite ← arora-bridge-ws ← arora (native)` |
| `mio 1.2.3` | *This wasm target is unsupported by mio. If using Tokio, disable the net feature* | `tokio 1.53 (net)` ← `arora`, `arora-bridge-ws`, `tokio-tungstenite`, `arora-engine`, `vizij-arora-tts`, and `vizij` itself (`rt-multi-thread`) |
| `crossterm 0.28.1` | 16 × `E0433`/`E0425`/`E0432` (libc, rustix) | `vizij` directly (`main.rs:352`) and `arora (tui)` |

## Implications for the target picture

- **The renderer half is portable now.** Nothing in `view.rs`'s approach
  (orthographic fit, unlit shaded materials, `MorphWeights` writes, no scene
  light) needed changing for WebGL2; the face looks like the native one. A
  `vizij-view` library carved out of `crates/vizij` can target
  `wasm32-unknown-unknown` with the seven-feature Bevy list above and be
  driven from JS through a handful of `#[wasm_bindgen]` exports (`start`,
  `set_rects`, a pose setter).
- **The device half is what has to be re-cut for the browser.** The browser
  device already exists as `vizij-arora-web` on `arora` with
  `default-features = false`; the wasm face app is that crate plus the view,
  not `crates/vizij` compiled for wasm. `crates/vizij`'s operator flow (tokio
  multi-thread runtime, std thread, TUI, clap, env_logger, rodio, file paths,
  `SystemTime`) stays native-only behind features or a separate binary.
- **Bundle size is the browser's cost, not a blocker**: 26 MB / 7.6 MB gzipped
  after wasm-opt without LTO (42 MB / 9.7 MB before), 24 MB / 7.2 MB with fat
  LTO, versus a three.js bundle in the low MB; the numbers in §Evidence B set
  the floor for this feature set. Load-time UX (progress, caching, a
  first-paint placeholder) belongs in the browser device's page, as ros-viz-rs
  does (`ros-viz-rs/web/index.html`, the `#loading` spinner).
- **Several faces on one page have exactly two shapes**: one module instance per
  face (simple; N × 42 MB instantiated, N event loops; finding 7), or one
  App with one overlay canvas and viewport cameras (one module, one event
  loop, the page reports element rects; finding 8). The authoring app's face
  viewport and the standalone demo need one face; Studio's scene (several
  faces on 3D screens) is the case that decides between the two.
- **Headless CI screenshots of the wasm view need no GPU**: Playwright's
  Chromium already composites through SwiftShader, so the browser-side
  snapshot tests can run where vizij-web's e2e already runs.

## Implications for the plan

- Build the browser view as a `cdylib` crate with the trimmed Bevy feature
  list, `wasm-bindgen 0.2` pinned to the workspace lock, and a CI job that
  installs `wasm-pack` (as `.github/workflows/ci.yml` already does) or a
  version-matched `wasm-bindgen-cli`; budget 25–30 CPU-minutes per cold build
  and cache the target dir.
- Give the wasm view one `App` per module and one canvas per app; expose
  `set_rects`-style viewport control only if the Studio scene needs several
  faces in one page; never call `start()` twice on one module.
- Set `ClearColor(Color::NONE)` and per-camera `Custom(Color::NONE)` in overlay
  mode (§Evidence E).
- Decide LTO per profile, knowingly: `lto = true` applies only to a
  `crate-type = ["cdylib"]` crate (a separate `rlib` crate if native code needs
  the same library), costs ≈ 9 min per link on this machine, and saves 7 %
  after wasm-opt — so keep it out of the development profile and treat it as
  a release-only option; wasm-opt with `--strip-debug` (drops the 13 MB
  `name` section) is the step that matters and belongs in the release
  pipeline, with the size trend published per release. `vizij-arora-web` and
  the other `["cdylib", "rlib"]` wasm crates are in the no-LTO case today
  whatever their profile says.
- For the browser device, depend on `arora` with `default-features = false`
  (as `vizij-arora-web` does) and keep tokio out of the browser build; the
  `vizij` crate's `rt-multi-thread` tokio, `std::thread`, crossterm,
  env_logger, clap, rodio and `std::fs` paths become `#[cfg(not(target_arch =
  "wasm32"))]` or move to the native binary.
- Expect the `.meta` 404 in browser consoles and either serve empty sidecars
  or configure `AssetPlugin { meta_check: AssetMetaCheck::Never }`
  (unverified for 0.19; check the field name).
- Treat the software-rendering fallbacks Bevy logs on SwiftShader as noise in
  CI; the face uses none of the disabled features.

## Open questions

- The overlay canvas's alpha rides on wgpu's WebGL backend creating the
  context with `alpha: true` while advertising `Opaque` only; a wgpu change
  in either direction (honoring `Opaque` by disabling alpha, or exposing
  `PreMultiplied`) would alter it. Pin the behavior with a test when the
  overlay pattern is adopted.
- Memory per module instance in the two-instance pattern (finding 7) is
  unmeasured; a 42 MB module twice may matter on tablets.
- The dim first screenshot of `multi-c-1.png` (both faces at reduced
  brightness in one capture) is unexplained: a compositor capture timing
  artifact under SwiftShader is the likely cause, unverified.
- WebGPU (`bevy/webgpu`) was not built; ros-viz-rs ships both bundles and
  selects by adapter (`ros-viz-rs/.github/workflows/pages.yml:36-41`); whether
  the face gains anything from WebGPU (batched morphs need storage buffers
  that WebGL2 lacks: `Sparse buffer updates disabled … max_storage_buffers_per_shader_stage (0)`)
  is worth one measurement.
- Build time on an idle machine is unmeasured; the 41 min figure was taken at
  load 100–200. The CPU time (27.5 min) is the number to plan CI around.
- `bevy_log`'s global-subscriber error on a second App suggests disabling
  `LogPlugin` in library builds, as `crates/vizij/src/main.rs:266` already does
  for the native window; unverified whether Bevy 0.19 offers a per-App logger.
