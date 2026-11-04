# One wasm module holds N JS-paced Arora devices and one Bevy 0.19 App for the page's lifetime: faces load from bytes into per-face viewports, 25 reload cycles hold memory flat, mesh picking works on SwiftShader, and the App exits and restarts in the same instance
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,bevy,wasm,browser,arora,picking,memory,testing -->
> **Last updated:** 2026-11-04

> **Related documents:** [Central plan](../bevy_everywhere-plan.md) · [bevy-wasm-spike](bevy-wasm-spike.md) · [arora-wasm-constraints](arora-wasm-constraints.md) · [challenge-verdicts](challenge-verdicts.md)

The composition this study proved is on vizij-rs main as
[`crates/vizij/src/web.rs`](https://github.com/vizij-ai/vizij-rs/blob/main/crates/vizij/src/web.rs): one App per page, `mount` once, `loadVizij`
per face, each face a JS-paced device (`VizijRuntime`) drawn in the rectangle `placeVizij` gives it,
behind [`@vizij/runtime`](https://github.com/vizij-ai/vizij-rs/tree/main/npm/@vizij/runtime). Its gates run there:
[`tests/browser/faces.mjs`](https://github.com/vizij-ai/vizij-rs/blob/main/npm/@vizij/runtime/tests/browser/faces.mjs) (two faces on one
canvas, picks), [`tests/browser/memory.mjs`](https://github.com/vizij-ai/vizij-rs/blob/main/npm/@vizij/runtime/tests/browser/memory.mjs)
(25 cycles), and natively
[`crates/vizij/tests/headless_face.rs`](https://github.com/vizij-ai/vizij-rs/blob/main/crates/vizij/tests/headless_face.rs). Two mechanisms on
main differ from the ones measured here. Faces are kept apart by slots along X, not by render layers
([`SLOT_STRIDE`](https://github.com/vizij-ai/vizij-rs/blob/main/crates/vizij/src/view/mod.rs)): a mesh carrying `RenderLayers` renders its morph
targets at zero weight on Bevy 0.19.1's storage-buffer morph path. Picks are cast over the morphed
positions, not by Bevy's mesh picking ([`view/pick.rs`](https://github.com/vizij-ai/vizij-rs/blob/main/crates/vizij/src/view/pick.rs)), which
misses an element a morph has moved.

The study's crate, page, Playwright drivers, result files, screenshots, build, HTTP and browser
console logs and built modules are not kept: the figures and log lines quoted on this page are the
record. The crate built in the `bevy-wasm` study's target directory; the base module and a
second module with `bevy_picking` + `mesh_picking` are measured separately. The machine's load average was 100–190 during the
builds and the first browser runs (another spike's Android build ran alongside) and
15 during the last runs; sizes and pass/fail results do not depend on it, timings do
and are quoted with their load.

## Findings

1. **The device and the view compile and run in one wasm module.** The crate takes `bevy =0.19.1` with the seven-feature base, `arora =9.11.1` with
   `default-features = false`, `arora-types 2.5.1`, `arora-behavior 8.4.0`,
   `arora-hal 3.0.0`, the four `vizij-arora-*` interop crates and `vizij-api-core`
   as path dependencies, `getrandom 0.4.3` with `wasm_js`, `wasm-bindgen 0.2.128`
   (CLI 0.2.128). `cargo build --release --target wasm32-unknown-unknown --lib`
   rebuilt the dependency graph in 23 m 26 s wall / 6 m 22 s user
   on a target directory that already held Bevy (the vizij and arora crates plus the Bevy crates that feature unification recompiled); a
   crate-only rebuild is 37.0 s + 22.3 s of `wasm-bindgen --target web` at load
   100 and 13.4 s + 6.9 s at load 15. The crate keeps `crate-type = ["cdylib", "rlib"]`,
   so cargo skips the profile's `lto = true` as in the bevy-wasm spike.
2. **Size delta against the view-only spike: +2.7 MB after wasm-bindgen, +2.0 MB
   after wasm-opt.** 50,735,413 B raw; 44,972,312 B after wasm-bindgen
   (10,375,109 B gzipped); 27,959,526 B after
   `wasm-opt -Os --strip-debug --strip-producers` (binaryen 123, 7 m 23 s at load
   110; 8,219,061 B gzipped). The bevy-wasm spike:
   47,811,936 / 42,276,381 (9,652,814 gz) / 25,992,930 (7,625,738 gz). Sections
   after wasm-opt: code 23,271,247 B, data 4,359,076 B.
   With `bevy_picking` + `mesh_picking`: 52,499,568 B raw, 46,566,489 B after
   wasm-bindgen (+1,594,177 B), 10,648,989 B gzipped (+273,880 B); that feature
   pair recompiles twelve Bevy crates (`bevy_render`, `bevy_mesh`, `bevy_camera`,
   `bevy_gltf`, `bevy_pbr`, …): 20 m 52 s wall / 17 m 24 s user.
3. **The JS-owned device and the Bevy world share a `RigHal` clone without a
   borrow conflict.** `FaceDevice` holds
   `Rc<RefCell<Option<Arora>>>`; `step(dtMs)` takes `try_borrow_mut` and
   surfaces a held borrow as a JS exception; the Bevy world
   holds only the `RigHal` clone on a per-face `Face` component and reads
   `pose()` in `apply_poses` every `Update` (the logic of `crates/vizij/src/view.rs:477-560`). `stepErrors` stayed empty in every run; a Quori pose
   has 372 entries, a Toasty pose 310.
4. **`step()` from `requestAnimationFrame` interleaves with Bevy's frame loop one
   to one, Bevy first.** The order trace is `FSFSFS…` with one face and `SSFSSF…`
   with two (`F` = `apply_poses` ran, `S` = a JS `step`). bevy_winit registers its `requestAnimationFrame`
   callback at `mount`, the page registers its loop afterwards, so within one
   browser frame Bevy draws the pose of the previous step and a step's writes are
   drawn one frame later. Frames and page ticks count together (12/12, 23/23); no
   frame runs twice between two steps and no step twice between two frames.
5. **A rig input written from JS moves the face.**
   `rig/quori_latest/propsrig/l_eye/translation/x` 3.35 → 6.35 (`readValues` before and after) changes one pixel cluster of 5,446 px with
   bounding box (384, 240)–(472, 336), the right-hand eye of slot A; nothing else changes.
   `rig/quori_latest/propsrig/mouth/jawud/value` 0.093 → 1.0 opens the mouth
   (cluster (192, 312)–(496, 400)).
6. **On Quori a standard mouth key is a graph output, not a free input.**
   `rig/quori_latest/standard/vizij/mouth/morph/jaw_open` written 1.0 reads 1.0
   before the next step and 0 after it (`afterWrite {f32: 1}`, `afterStep {f32: 0}`); the bundle's
   rig graph lists it as a direct input, so
   one of the composed `pose-driver`/`standard-adaptation` graphs writes it every
   tick. A consumer moves Quori's mouth through the rig inputs or the pose weights.
7. **The GLB reaches Bevy from the bytes JS hands over, never from `assets/`.**
   `MemoryAssetReader { root: Dir }` is registered as the `mem` source before `DefaultPlugins` (`bevy_asset-0.19.1/src/io/memory.rs:265`),
   `AssetPlugin { meta_check: AssetMetaCheck::Never }` (the field is `meta_check`, `bevy_asset-0.19.1/src/lib.rs:254`, the variant
   `AssetMetaCheck::Never`, `lib.rs:319`), each push lands under
   `mem://<faceId>-<n>.glb` (`Dir::insert_asset`, `memory.rs:50`) and is removed at despawn (`Dir::remove_asset`, `memory.rs:77`). The HTTP log holds one `GET /assets/<name>.glb` per face file
   per page load (the page's own `fetch`) and no `.meta` request over 27 requests.
   The scene renders.
8. **Two faces render in one App, one canvas, two viewport cameras.** Quori in
   slot A (600 × 400), Toasty in slot B (340 × 300), `Camera.viewport` from the DOM
   rects through `setRect`, `ClearColor::NONE` outside the
   viewports and the page colour showing through. Both devices step from the page's one loop and
   each answers its own writes (Toasty's `propsrig/mouth/jawud/value` opens
   Toasty's mouth only).
9. **All faces sit at the world origin, so each camera sees every face until
   render layers separate them.** Without layers, Toasty appears inside Quori's
   viewport at Quori's scale and Quori's opened mouth appears at the bottom of Toasty's. One
   `RenderLayers::layer(n)` per face on its camera and a `Propagate(RenderLayers)`
   on the scene root under `HierarchyPropagatePlugin::<RenderLayers>`
   (`bevy_app-0.19.1/src/propagate.rs:43,73`)
   follow the scene's children as they spawn and confine each viewport to its face.
10. **25 `unloadFace`/`loadFace` cycles hold linear memory flat and keep the WebGL
    context.** `WebAssembly.Memory.buffer.byteLength` is 195,887,104 B once both
    faces are resident and identical after every unload and every reload of all 25
    cycles; `isContextLost()` false throughout, no `webglcontextlost` event, 25
    `despawned` and 27 `indexed` log lines; the 25th reload renders pixel-identical to the first two-face frame (0 pixels changed), and
    both devices answer writes afterwards (finding 5). The 25 cycles took 376.6 s
    at load 110 (per-cycle 9.4–25.1 s, reload ready in 4.4–15.6 s); at load 15 a reload is ready in 2.3–2.7 s.
11. **Mesh picking works under WebGL2 on SwiftShader and reports the glTF node
    and its RobotData id.** `MeshPickingPlugin` plus an `On<Pointer<Click>>`
    observer that walks `ChildOf` up to the `Face`; seven
    Playwright clicks, every one hit its own face and a named node: slot A (301, 250) → `InnerFace` (`a934cf4f…`), (206, 205) →
    `R_EyeWhite`, (386, 205) → `L_EyeWhite`, (56, 65) → `Background`; slot B
    (106, 150) → `R_BLid`, (171, 215) → `Mouth` (`2e67149d…`), (36, 65) →
    `Stripe8`; the JS callback fired once per click. The backend casts against
    `Assets<Mesh>` in the main world
    (`bevy_picking-0.19.1/src/mesh_picking/ray_cast/mod.rs:175`; "all meshes that
    have `RenderAssetUsages::MAIN_WORLD` are pickable", `mesh_picking/mod.rs:3`),
    which the glTF loader's default `load_meshes: RenderAssetUsages::default()`
    keeps (`bevy_gltf-0.19.1/src/loader/mod.rs:223`); it filters by the camera's
    `RenderLayers` (`mesh_picking/mod.rs:104-105`), so the per-face layer of
    finding 9 is what keeps a slot's clicks on its face. Quori's mouth click
    landed on `InnerFace`: the ray cast uses the mesh's base vertices, not the
    morphed ones.
12. **`AppExit` ends the App and a second `App::run` in the same module instance
    succeeds.** `stop()` raises a flag that `bookkeeping` turns into `AppExit::Success`; the world, with a `NonSend`
    `RunGuard`, is dropped 0.7–1.9 s later; frames stop (18, 18) while the page's
    ticks go on (35, 44) and the JS-owned device keeps stepping (66 steps,
    `deviceAfterStop.ok`); a write on that device changes no pixel. A second `mount()` logs `Creating new window`, `App::run returned:
    Success`, one `ERROR Could not set global logger and tracing subscriber as
    they are already set` from `LogPlugin`, then loads, indexes and renders a new
    face whose eye moves on a write (frames 41 → 50; cluster (384, 240)–(472, 336)). No
    `RecreationAttempt`. The mechanism in winit 0.30.13: `EventLoopBuilder::build`
    refuses a second loop while the static `EVENT_LOOP_CREATED` is set
    (`winit-0.30.13/src/event_loop.rs:69,118-120`) and the web runner clears the
    flag when the spawned loop finishes
    (`platform_impl/web/event_loop/runner.rs:719-720`, `allow_event_loop_recreation`,
    `event_loop.rs:130-133`, `cfg(web_platform)`). The bevy-wasm spike's
    `RecreationAttempt` came from a second `App::run` while the first loop was
    still alive.
13. **The canvas keeps its last frame after `AppExit`.** The running and stopped screenshots are pixel-identical; an unmounting page clears
    or hides the canvas itself, and the exited App leaves its `mem` entries and
    the static `faceCount` behind (172.0 MB after a restart with one new Quori).
14. **Linear memory: 5.6 MB after `init`, 19.5 MB after `mount`, 35.0 MB after
    the first frames, 137.6 MB with one Quori, 195.9 MB with Quori and Toasty,
    196.5 MB with picking**; the
    two-face figure is the plateau of finding 10. The GLB is copied twice inside
    the module (the `mem` source's `Vec<u8>` and the loader's read) on top of the
    page's `Uint8Array`; decoded textures and the Bevy allocator's retained blocks
    make up the rest, and the JS-visible heap size is a high-water mark.
15. **Face-ready time is dominated by Bevy's load, not the device.** Quori is
    ready 2.2 s after `loadFace` at load 15, 26 s at load 100, 61–81 s at load 190; Toasty 15.8–17.6 s at every load
    (`readyMsB`); composing the device (bundle parse, graph, neutral staging,
    `Arora::build`) is 0.5–0.8 s of it (`loadMs`).

## Questions answered

- **Q1 One module, JS-paced.** Compiles in one module (finding 1). Build time:
  23 m 26 s for the dependency graph on a warm Bevy target, 13–37 s + 7–22 s per
  crate rebuild. Size delta: +2.7 MB after wasm-bindgen (+6.4 %), +2.0 MB after
  wasm-opt (+7.6 %), +0.6 MB gzipped (finding 2). Borrow issue: none (finding 3).
  Ordering: Bevy's frame runs before the page's step in every browser frame, so a
  write shows one frame after its step, never reordered (finding 4). The face moves
  on a rig input (finding 5); a standard mouth key on Quori is overwritten by the
  composed graphs (finding 6).
- **Q2 Two faces, one App; 25 cycles.** Both render in their viewports
  (finding 8) once each face has its render layer (finding 9); memory is flat at
  195.9 MB across 25 unload/load cycles and the WebGL context survives
  (finding 10). The P3 gate passes on this spike.
- **Q3 Load from bytes.** Yes: `mem` source registered before `AssetPlugin`, a
  fresh path per push, `AssetMetaCheck::Never` through the 0.19 field
  `meta_check`, no `.meta` request (finding 7).
- **Q4 Picking.** Mesh picking works on WebGL2/SwiftShader, reports the glTF node
  name and the RobotData id, and needs the mesh retained in the main world, which
  the glTF loader's default usage keeps (finding 11).
- **Q5 App restart.** Success, not `RecreationAttempt`: after `AppExit` the web
  runner re-allows event-loop creation and a second `App::run` renders a new face
  in the same instance (finding 12). The plan does not need it; the disputed
  reading is settled.

## Evidence

| Item | Command | Result |
| --- | --- | --- |
| Base build | `cargo build --release --target wasm32-unknown-unknown --lib`, `wasm-bindgen --target web --out-dir pkg --no-typescript` | 23 m 26 s (deps); crate-only 37.0 s + 22.3 s, 13.4 s + 6.9 s; 50,735,413 B raw, 44,972,312 B after wasm-bindgen, 10,375,109 B gz |
| wasm-opt | `wasm-opt -Os --strip-debug --strip-producers` (binaryen 123) | 27,959,526 B, 8,219,061 B gz, 7 m 23 s |
| Picking build | `--features picking` = `bevy/bevy_picking`, `bevy/mesh_picking` | 20 m 52 s wall, 17 m 24 s user; 52,499,568 B raw, 46,566,489 B after wasm-bindgen, 10,648,989 B gz |
| Server | `python3 -m http.server 8766` | 27 requests, one per `.glb` per page load, no `.meta` |
| Screenshot diffs | connected pixel clusters and changed-pixel counts between two screenshots | the cluster boxes and counts quoted in the findings |

The browser runs were Playwright drivers against the page: Q1 one face and a write; Q2 25
cycles without layers and 3 with them; Q4 seven clicks on the picking module; Q5 stop and
restart, without and with writes.

The JS surface exercised: `mount(selector)`, `loadFace(id, bytes) →
FaceDevice { step, setValue, readValues, poseLen, steps, alive, release }`,
`unloadFace(id)`, `setRect(id, x, y, w, h)`, `clearRect`, `faceReady`, `faceCount`,
`frames`, `running`, `stop`, `orderTrace`; under `picking`: `setClickCallback`,
`drainClicks`. The page owns a `Map<faceId, FaceDevice>` and steps
every device from one `requestAnimationFrame` loop with `dt = min(t − last, 100)`;
`unload` = `unloadFace` + `clearRect` + `release()` + `free()`.

Device composition (as `vizij-arora-web/src/lib.rs:108-111,524`
and `crates/vizij/src/device.rs`): `Bundle::from_gltf_json` over the GLB's JSON
chunk, `compose(["rig","pose-driver","pose","standard-adaptation"],
ProgramSelect::None, false, [ros4hri_source])`, `ProcessingGraph::from_spec`, the
`play_viseme` task fragment, `neutral_stage_writes` into a `BlackboardStore`,
`Arora::builder().with_hal(RigHal).with_data_store(store)
.with_behavior_interpreter(graph).with_host_module(viseme)`.

### Bevy view against three.js at run time

The same page, `tutorial-fullscreen-face` with Quori, on the Bevy view and on the three.js
renderer: headless Chrome on an Apple M1's GPU (ANGLE on Metal), 1280×800 at device scale 1,
HTTP cache off, one run per phase, the face's program running (idle) and the face speaking.
Taken 2026-10-16, before the merge of the Bevy view
([vizij-web#206](https://github.com/vizij-ai/vizij-web/pull/206)). These are CPU-share readings, not
instruction counts, on a host whose load was not controlled, so they are indicative only; the
browser module has shrunk since ([Decisions](../../../../current_documentation/DECISIONS.md) carries its size).

| Reading | Bevy idle | Bevy speaking | three.js idle | three.js speaking |
| --- | --- | --- | --- | --- |
| First face frame after navigation | 3.69 s | 4.31 s | 2.89 s | 3.09 s |
| Transferred | 31.7 MB | 31.7 MB | 9.5 MB | 9.5 MB |
| Frames per second | 60 | 60 | 60 | 60 |
| Main thread busy (of wall time) | 0.311 | 0.314 | 0.882 | 0.892 |
| Of which script | 0.298 | 0.302 | 0.875 | 0.885 |
| CPU, renderer process (cores) | 0.361 | 0.358 | 0.897 | 0.904 |
| CPU, GPU process (cores) | 0.121 | 0.117 | 0.055 | 0.055 |
| CPU, all processes (cores) | 0.499 | 0.491 | 0.965 | 0.971 |
| wasm linear memory | 115.9 MB | 115.9 MB | 252.4 MB | 252.6 MB |
| JS heap used | 6.1 MB | 6.2 MB | 21.2 MB | 40.6 MB |
| Page memory (`measureUserAgentSpecificMemory`) | 133.8 MB | 133.8 MB | 313.8 MB | 314.0 MB |

Both hold 60 frames/s. The Bevy page spends about a third of the three.js page's main-thread
time and half its CPU, and twice its GPU-process CPU, at about three times the download and a
first frame 0.8 s later when idle.

## Implications for the target picture
- Section 3.2 holds for the one-module, one-App, N-device, viewport composition
  and gains one requirement it does not state: **every face's scene and camera
  carry a distinct `RenderLayers`**, propagated over the spawned hierarchy, because
  all faces share one world origin (finding 9); mesh picking filters on the same
  layers, so the layer is also what keeps `pick(faceId, x, y)` on its face
  (finding 11).
- **The JS pacer costs one frame of latency** between a `step` and its pixels
  (finding 4); `run(period)` on timers shows a step at the next
  `requestAnimationFrame` after it.
- **Linear memory is above the plan's figure**: 137.6 MB with one face, 195.9 MB
  with two, flat over reloads (findings 10, 14), against section 5's "about 90 MB
  per instance" for a view-only module. The page can drop its own GLB copy after
  `loadFace`.
- **`AssetMetaCheck::Never` and the `mem` source are the loading design**
  (finding 7); no `assets/` directory ships with the module.
- **`unmount` can be `AppExit`** (finding 12): "the App is never exited" is a
  choice, not a constraint; an `unmount` that exits also clears the canvas and
  purges the `mem` entries (finding 13).
- **Picking against morphed meshes is approximate** (finding 11): the ray cast uses
  base vertices, so a thin mouth under a morph resolves to the mesh behind it; the
  authoring viewport's `picked` needs either a tolerance or a pick by the nearest
  RobotData element.
- **On Quori the standard mouth keys are outputs** of the composed graphs
  (finding 6); the agent and `say` paths write through the pose weights and the
  viseme fragment, not the standard morph keys.
- **Face-ready time on SwiftShader** is 2 s for Quori and 16 s for Toasty on an
  idle machine (finding 15): the Playwright jobs budget per face, and the load-time
  UX of section 3.2 is where the difference shows.

## Implications for the plan

- P3's gate (Quori and Toasty on a plain page; 25 `loadFace`/`unloadFace` cycles
  with bounded memory and no WebGL context loss) passes on this spike
  (findings 8, 10); P3 adds the render-layer requirement to `view`'s per-face
  components (finding 9).
- P3's JS surface: `loadFace` takes bytes and the page may release its copy;
  `stop` keeps its device meaning; an `unmount` = `AppExit` + canvas clear +
  `mem` purge is available (findings 12, 13).
- Risk 2 becomes about 200 MB per page with two faces resident and flat over
  reloads (finding 14); the 25-cycle gate reads the plateau.
- Section 3.9's CI budget: one wasm build of the combined crate is 23 m 26 s on a
  warm Bevy target, 13–37 s + 7–22 s per source change; wasm-opt adds 7 min; the
  picking feature pair recompiles twelve Bevy crates (20 m 52 s) and adds 1.6 MB
  (finding 2). A `cdylib`-only crate would restore fat LTO at the bevy-wasm spike's
  9-minute link.
- Open question "App restart in one wasm instance" in section 5 is closed
  (finding 12); "Bevy 0.19 glTF from an in-memory buffer", "mesh picking under
  SwiftShader" and "the one-module device + view step" are closed (findings 7, 11,
  3–4).

## Open questions

- Where Toasty's 16 s of face-ready time goes (glTF parse, PNG decode, material and
  pipeline compilation) and what the same load costs on a GPU adapter.
- The standard-key write-back on Quori (finding 6): which composed graph owns
  `standard/vizij/mouth/morph/*` when the pose driver is present, and whether the
  other shipped faces behave the same.
- What Bevy retains after a despawn inside its own allocator (the JS-visible heap
  is a high-water mark; GPU-side buffers are outside linear memory).
- NOT RUN: a hidden-tab run (the plan's reason for `run(period)`); `webgpu`; a GPU
  adapter; the animation host module, `spawn`/`halt` and `describe`; picking with a
  tolerance for morphed meshes.
