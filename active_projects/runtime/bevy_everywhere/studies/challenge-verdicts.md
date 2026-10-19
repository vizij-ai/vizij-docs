# Challenge verdicts on the target picture and the plan
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,standalone,bevy,wasm,android,review -->
> **Last updated:** 2026-09-18
> **Related documents:** [Central plan](../bevy_everywhere-plan.md)

## Findings

The first version of sections 3 and 4 of the central plan was attacked claim by
claim (feasibility, cost and simplicity, consumer impact), verified by three
spikes, and scored by three judges. Every claim survived only with amendments;
one was refuted. Sections 3 to 6 of the plan are the amended versions. The
raw verdicts (arguments with file:line evidence, one JSON object per lens) are
in the workflow journal of the session that ran them; this page records what
was adopted.

| Claim (first draft) | Verdicts | What changed in the plan |
| --- | --- | --- |
| C1 One wasm module = device + view; thirteen methods verbatim; device stepped from Bevy `Update` as a `NonSend` resource; animation module host-linked | holds with amendment ×3 | The JS drive stays the pacer (hidden tabs halt `requestAnimationFrame`; Node tests run the device with no canvas; arora-web's device slot is private). `step`/`run` keep their meaning; no in-schedule driver. The animation module's guest glue is re-gated on `target_os = "wasi"` and its `lazy_static` engine becomes per-device state. `composeFace` gains ad-hoc sources (VIZ-58). The wrapper singleton stays. |
| C2 N faces = N module instances; overlay kept for many faces; teardown by dropping the App | holds with amendment ×2 | About 90 MB of linear memory per instance, pinned for the page's lifetime (measured); the authoring memory-churn e2e mounts faces 25 times. One instance per page, one App, N devices, viewports per face slot; `loadFace`/`unloadFace`; the App is never exited. Whether winit allows restarting an App in one instance is disputed by source reading (bevy_winit spawns the loop; the two refuters read `event_loop_recreation` differently) and stays an open question. |
| C3 Authoring keeps a JS world model; `@vizij/render` headless; structural edits by `loadFaceBytes(exportedGlb)`; output locks as a device-side input override | holds with amendment ×3 | Picking needs `bevy_picking`/`mesh_picking`; the glow is `Gizmos` polylines (wireframes are unavailable on WebGL); `picked` needs the RobotData `id`, which the parser drops; output locks are a view-side `hold` on rig outputs (an input override cannot freeze a graph output); scrubbing needs a `setStaticFeature` delta; plain GLBs go through import → export → `loadFace`; the headless exporter is verified (see `challenge-headless-export`) with one semantic change (authored defaults in TRS). The Rust rendering project STUDIO-256 must be reconciled before P1. |
| C4 Ellipse/rectangle out; vec2, scalar rotation, HSL and PBR extras cheap | holds with amendment ×2 | No shipped face (vizij-web or Studio) carries a primitive; the loader converts them to shape meshes and drops strokes. HSL cannot reach the device (no `Value` kind). PBR extras are not cheap: the view is unlit, and Blender exports (colour in `emissiveFactor`, black base, metallic 1) render black; a lit material path and a Blender-export golden are required. vec2 and scalar rotation have no producer and are deferred. `setRootBounds` has consumers (showcase, Studio layout). |
| C5 TTS wasm branch with fetch + JS audio callback; fragments registered in the browser; text agent; speech-react and the JS lipsync retire | holds with amendment ×3 | One skeleton, target-gated producer, run map in the module closure, `API_URL` a constructor parameter, page-owned `AudioContext` unlock, halt by silence, run-id collision recorded (see `challenge-tts-wasm`). Lips need standard viseme adaptations that only Quori has: the four shipped GLBs are re-exported with one, the authoring app gains embedding, and the authoring/showcase private lipsync copies get a stated fate. `spawn`/`halt` join the JS surface. The ROS4HRI mapping stays the bundle's opt-in. `speechConfig` fields are split into kept and ignored. One agent demo; `tutorial-agent-face`'s fate is a decision. |
| C6 `semio-vizij` Bevy binary in semio_studio; scene screen keeps three.js; per-axis RobotData is STUDIO-239's | holds with amendment ×3 | No crate in semio_studio (six first-time crate publications or a git dependency); the Studio-branded build is a release matrix entry of vizij-rs. Studio's writes do not reach the face today (`<id>.target_position`, per-axis split); a Studio-key profile in the device is this project's deliverable and the bridge E2E its gate. `retrieveGlb` has no device responder. STUDIO-239 is re-scoped (no `@vizij/render` renderer to swap onto); Studio keeps its renderables for the scene screen, the upload modal, `packages/core` and the stories. `bevy_egui` 0.42, not 0.39. |
| C7 Android on the ros-viz-rs recipe, API 26, Kotlin subclass, egui panel, Operator, key-path override, hardware first | holds with amendment ×3 | The arora override must cover the app-data directory (discovery has no writable candidate on Android). `rustls-platform-verifier` must be packaged and initialised, or the provider switches to webpki. minSdk 24 without Bevy audio; targetSdk 34; `LogPlugin` off and `android_logger`; the Kotlin subclass loads the library, sets immersive mode, carries both intent filters and `singleTask`; owners and name persist and re-inject; auto-load `model.glb`; applicationId and signing-secret moves decided; `studio-bridge` implies `native` (wasmtime rides along). |
| C8 Usable local WS bridge through arora's `ServerConfig`; `rfd` dialog; `--studio` via `Operator` | holds with amendment ×2 | No arora change: everything is public in `arora-bridge-ws` and verified over the wire (see `challenge-ws-bridge-and-operator`); `invoke` never reaches the run (a bridge follow-up); `arora/*` must be filtered from pushes; one server per generation; `AsyncFileDialog` from a `NonSendMarker` system, `FileDragAndDrop` free; `--studio` via `connect()` + `update_device_info` with a persisted owners file; Studio bridge first in the list; `vizij` pins `arora-bridge-ws` on arora's line. |
| C9 `release-vizij.yml` copied from ros-viz-rs; two web bundles; `@vizij/runtime` 3.0; native-vs-wasm oracle | holds with amendment ×2 | Adapted, not copied: tag on `vizij-v<version>`, no manifest-version step, NASM on Windows for `aws-lc-sys`, no `tts-piper` in installers; one WebGL2 bundle; `pkg/` shipped once; CI tiered per PR versus main; the wasm screenshots feed `snapshot_regression` through an env var, same metric; the Android smoke greps `panicked at`. |
| C10 Six-unit crate split; arora `default-features = false` everywhere; seven Bevy features on every target | cost: holds with amendment; consumers: **refuted** | One crate, lib + bin, four entry points; the seven-feature list does not compile on Linux (winit needs `x11`/`wayland`) and lacks picking; per-target feature tables; `studio-bridge` implies `native`; `vizij-arora-web` retires into `vizij::web`. |

Judges (0–10): risk ordering and gates 6, completeness 7, effort and
sequencing 5. Adopted from them: Gate 0 (Android hardware) moved to P0; the
Studio bridge E2E harness moved to P0; the spikes for glTF-from-bytes,
`Screenshot` on WebGL2 and the `taskrun` fragments moved to P0; P1 and P2
merged on one crate; P3 split from the browser `say` (P3b); P4 split into P4a,
P4b ∥ P4c; P5 started now and P7 placed after it; the egui `Operator` panel
built once; P8 split into P8a (Tauri shell, gated on Android) and P8b (web
renderer, gated on the browser port); every gate given a checkable criterion;
the desktop parity gaps (window flags, URL loading, remembered model) added;
the `namespace/` migration listed as a protocol change; fates given to
`studio-arora`, the authoring and showcase speech panels, the animation
module's browser artifact, `tests/ros4hri` and `examples/say.rs` (they stay in
the binary), and the Studio consumers of `packages/vizij`.

The three spikes the challenge's budget cut were run afterwards and are
sibling pages: `challenge-wasm-one-module` (bytes loading, App restart,
picking under SwiftShader, two faces on one canvas over 25 cycles),
`challenge-android-render` (the API 34/35 images draw under Vulkan; GLES and
SwiftShader do not), and the completed `challenge-tts-wasm` test run. The
completeness critic did not run; the judges' completeness lens covers part of
its ground.

## Questions answered

- Does the target picture hold as first written? No claim held verbatim; the
  amended versions are sections 3.1 to 3.10 of the plan.
- Which amendments are structural? The single crate (C10), the JS-paced device
  (C1), one module instance per page with viewports (C2), the lit material
  path (C4), the Studio-key profile (C6), the app-data-directory override and
  the TLS verifier on Android (C7), the in-app WS bridge with no arora change
  (C8), and the tiered CI with one web bundle (C9).
- Which refuter claims contradict each other? Whether winit resets its
  event-loop flag for a spawned loop (C1 feasibility and C2 cost read
  `event_loop_recreation = false`; C2 feasibility reads `true`); resolved only
  by running it (P0 spike).

## Evidence

The verdict objects are in the workflow journal
`~/.claude/projects/-Users-victor-paleologue-Code-Semio-semio-studio/3db729c2-88a1-4330-986e-37ae26376064/subagents/workflows/wf_1d21c73e-461/journal.jsonl`
(30 result records). The three spike studies are siblings of this page.

## Implications for the target picture

Applied in sections 3.1 to 3.10 of the central plan.

## Implications for the plan

Applied in section 4 of the central plan.

## Open questions

Section 5 of the central plan carries them: the decisions requested from
Victor and the technical questions the unfinished spikes left open.
