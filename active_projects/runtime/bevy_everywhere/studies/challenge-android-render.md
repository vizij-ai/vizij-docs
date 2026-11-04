# Bevy 0.19 draws and animates the Quori face on the API 34/35 arm64 emulator under Vulkan with a host GPU or lavapipe; SwiftShader loses the device at wgpu-hal's 1 s acquire timeout and every GLES build fails before its first frame
<!-- tags: family=project; type=reference; project_status=proposal; topics=android,bevy,wgpu,emulator,gfxstream,swiftshader,lavapipe,ci,vizij-rs -->
> **Last updated:** 2026-11-04
> **Related documents:** [Central plan](../bevy_everywhere-plan.md) · [Android packaging spike](bevy-android-spike.md)

The Android view this study cleared is on vizij-rs main: the Gradle project
[`crates/vizij/android/`](https://github.com/vizij-ai/vizij-rs/tree/main/crates/vizij/android) around
[`crates/vizij/src/android.rs`](https://github.com/vizij-ai/vizij-rs/blob/main/crates/vizij/src/android.rs). The CI case this study
leaves NOT RUN runs in [`android.yml`](https://github.com/vizij-ai/vizij-rs/blob/main/.github/workflows/android.yml): the x86_64 API 35
`google_apis` image under KVM with `-gpu lavapipe`, release-profile Rust code, its assertions in
[`smoke-test.sh`](https://github.com/vizij-ai/vizij-rs/blob/main/crates/vizij/android/scripts/smoke-test.sh). The study's scripts,
screenshots, run summaries, Vulkan probe and animation app, its raw logcat dumps, emulator
logs and build logs, and its APKs are not kept: the log lines, timestamps and pixel counts
quoted on this page are the record. Registry sources are quoted
as `<crate>-<version>/path:line`. Stack under test: Bevy 0.19.1, wgpu 29.0.4,
emulator 36.6.11 on an Apple M1, arm64 `google_apis` images API 32, 34 and
35, 2560x1600 tablet AVDs (2 vCPUs, 3 GB)
plus one 640x480 AVD, three APKs of `--release` Rust code: the packaging
spike's Vulkan build and `bevy_render/gles` build, and the animation build
(the same app with its spinning cube scaled to the face's fitted bounds and
placed in the lower-left quadrant, so rotation is visible).

## Findings

1. **The face draws under Vulkan on the API 34 and API 35 images with `-gpu
   host` (MoltenVK through gfxstream).** Screenshots show the Quori face (screen frame, eyes, mouth) over the clear colour:
   30 s after launch on API 34 (at 25 s still the clear colour), 15 s on API 35,
   5 s on API 35 with the animation build.
   Logcat carries no wgpu error for these runs: adapter `Apple M1`, driver
   `MoltenVK 1.4.0`, "GPU preprocessing is fully supported on this device". The full
   matrix is in Evidence.
2. **It animates: the cube rotates between screenshots 5 s apart at about
   3 Hz.** Animation build, API 35, `-gpu host`, 60 s: the cube's silhouette
   is a square at t=30 s and a hexagon at t=35 s; the lower-left quadrant differs by 2 255 to
   13 142 pixels (of 844 800) between every consecutive pair of the eleven pairs. The `fit: bounds` line, emitted
   after 180 `Update` frames, lands 54.7 s after `Creating new window`
   (logcat 17:46:41.283 → 17:47:35.939): 3.3 frames/s.
   Zero `Caught`, `panicked` or `ANR in` lines in that run.
3. **Lavapipe draws and animates too, with no device loss in 60 s.** `-gpu
   lavapipe` (emulator 36.4.9 release note: "Enabled Lavapipe as the default
   graphics software renderer to improve Vulkan compatibility across all
   platforms"; host ICD `llvmpipe (LLVM 21.1.4, 128 bits)`, Vulkan 1.4.330)
   on API 35, animation build: face and cube from t=10 s, lower-left changes of 5 321 to 14 911
   pixels per 5 s, `fit: bounds` 98.2 s after window creation
   (logcat 17:50:19.755 → 17:51:57.958): 1.8
   frames/s; zero `Caught`/`panicked` lines; the emulator log has no fence
   timeout (one create and one destroy of the `VkDevice`, the latter at
   kill). The guest sees `apiVersion 1.3.0`, `maxBufferSize 4095 MiB`,
   `maxMemoryAllocationSize 2 GiB`, no `VK_KHR_swapchain_mutable_format`.
4. **`dumpsys gfxinfo` and `dumpsys SurfaceFlinger --latency` are not
   evidence for a NativeActivity.** `gfxinfo` counts HWUI frames only and
   reads `Total frames rendered: 0` for every run, including the ones that drew; on API 35 `--latency` returns a header row only for every
   `RequestedLayerState{…}` name `--list` prints. The screenshot pair is the frame evidence; counting the
   cube's colour in one screenshot is confounded by the tablet taskbar's launcher
   icons (45 "orange" cells in every API 34/35 launcher screenshot).
5. **SwiftShader Vulkan never presents: wgpu-hal turns a slow frame into a
   device loss, and a small surface does not help.** The surface stays
   black, then logcat reads `Caught DeviceLost error: Unknown Unexpected
   error variant (driver implementation is at fault)` and the render system
   panics in `Buffer::get_mapped_range` (`wgpu-29.0.4/src/backend/wgpu_core.rs:2253`):
   17.4 s after window creation at 2560x1600 on API 35
   (logcat 16:47:53.766 → 16:48:11.204), 43.5 s on API 34 with the emulator alone, 11.1 s at 640x480 on API
   35 with the animation build
   (logcat 17:54:23.758 → 17:54:34.879; the screenshot at t=20 s shows the launcher). The mechanism
   is in wgpu-hal: `Surface::acquire` waits on the acquired image's fence
   with the frame timeout (`wgpu-hal-29.0.4/src/vulkan/swapchain/native.rs:473-474`;
   `FRAME_TIMEOUT_MS = 1000`, `wgpu-core-29.0.4/src/present.rs:32,170`), and
   a `VK_TIMEOUT` there goes through `map_host_device_oom_and_lost_err` →
   `map_host_device_oom_err` → `DeviceError::Unexpected`
   (`wgpu-hal-29.0.4/src/vulkan/mod.rs:1387-1393,1401-1406,1463-1470`), whose
   Display is the logged text (`wgpu-hal-29.0.4/src/lib.rs:381`). wgpu issue
   #9029 (open, February 2026) reports the same mapping on a Windows Intel
   GPU. The host side agrees that a SwiftShader frame exceeds seconds: the
   emulator logs `Timeout when waiting for the Qsri fence.` then `Destroyed
   VkDevice` (API 34 SwiftShader and API 35 640x480 runs), gfxstream's 3 s bound
   on the present fence (`kTimeoutNs` in gfxstream's `vk_android_native_buffer_operations.cpp`).
   The time to loss does not scale with pixels (11 s at 0.3 Mpx, 17 s at
   4.1 Mpx), so the cost is per frame (SwiftShader's LLVM 10 shader JIT and
   the CPU work on 2 vCPUs), not per pixel. Not a limit problem: the API
   34/35 SwiftShader ICD reports `maxBufferSize = 1 GiB`.
6. **The `max_buffer_size (0)` failure is the API 32 image's guest Vulkan
   driver, under both GPU modes, and no other image has it.** A Vulkan probe (a small `ash` program mirroring `wgpu-hal-29.0.4/src/vulkan/adapter.rs:1764-1767,1787-1799`) shows the API 32
   device advertising `apiVersion 1.3.0` without `VK_KHR_maintenance4`, so
   wgpu-hal chains `VkPhysicalDeviceMaintenance4Properties` by API version and
   reads `maxBufferSize = 0`; wgpu-hal takes
   `min(maxBufferSize, maxMemoryAllocationSize, i32::MAX)` with no guard
   against zero (`adapter.rs:1427-1447`). API 34/35 report 1 GiB (SwiftShader),
   9093 MiB (MoltenVK) and 4095 MiB (llvmpipe). The emulator release notes
   date Vulkan 1.3 through gfxstream to "system image with API 34" (emulator
   33.1.23). wgpu's CHANGELOG through v30.0.1 has no entry for
   `max_buffer_size`, `maintenance4` or the emulator: no fixed version exists;
   the API 32 image is what is retired.
7. **The `bevy_render/gles` build fails on every image and GPU mode, for two
   structural reasons that are not emulator quirks.** (a) Where the translator
   reports GLES 3.1 with compute (SwiftShader/ANGLE, all three images),
   `EnvironmentMapGenerationPlugin` queues its cubemap-SPD pipelines at plugin
   `finish` (`bevy_pbr-0.19.1/src/light_probe/generate.rs:103-125,356,372`,
   added by `light_probe/mod.rs:380`); their shader binds `mip_6` as
   `read_write` (`bevy_core_pipeline-0.19.1/src/mip_generation/downsample.wgsl:16,54`,
   `generate.rs:199`), which GLSL ES 3.1 forbids for non-r32 formats ("image
   variables must be qualified readonly and/or writeonly"), and Bevy's default
   error policy exits the app on the internal error
   ("Quitting the application due to Internal RenderError"). (b) Where the translator reports GLES 3.0 without
   compute (`-gpu host`, Metal GL), the plugin disables itself and the run
   reaches `Surface::configure`, which is refused: `Downlevel flags
   DownlevelFlags(SURFACE_VIEW_FORMATS) are required` then the `Surface is
   not configured for presentation` panic
   (`wgpu-29.0.4/src/backend/wgpu_core.rs:3934`).
   wgpu-hal sets `SURFACE_VIEW_FORMATS` only in the Vulkan adapter
   (`wgpu-hal-29.0.4/src/vulkan/adapter.rs:684-687`; wgpu issue #10337, open,
   proposes it for GLES over `EXT_sRGB_write_control`); Bevy asks for an
   sRGB view format whenever the surface's format list has no sRGB entry
   (`bevy_render-0.19.1/src/view/window/mod.rs:394-410`), and wgpu-hal lists
   sRGB GLES surface formats only when EGL is 1.5 or exposes
   `EGL_KHR_gl_colorspace` (`gles/egl.rs:415-424`, `gles/adapter.rs:1248-1259`),
   which the emulator's EGL does not. A hardware GLES 3.1 device hits (a); a
   GLES 3.0 device with `EGL_KHR_gl_colorspace` avoids both.
8. **The same `SURFACE_VIEW_FORMATS` check applies to Vulkan on hardware whose
   swapchain lists no sRGB format.** On Vulkan the flag needs
   `VK_KHR_swapchain_mutable_format` (`wgpu-hal-29.0.4/src/vulkan/adapter.rs:684-687`);
   none of the emulator ICDs have it (Evidence), and the runs that
   draw pass only because the swapchain offers an sRGB format first. Bevy
   issue #15452 (open) reports the failure on a real Android 12 device
   (Maleoon 910, Vulkan, Bevy 0.14.2); wgpu issue #10340 (September 2026, PR
   #10357) records that Android devices generally lack the extension and
   argues the flag out of the strict-compliance set. This is the one adapter
   property to read on the tablet before anything else.
9. **A second emulator or a cargo build on this Mac starves the guest**: those
   runs log ANRs of unrelated processes and show an "isn't responding" dialog over the face (15 `ANR in` lines in the API 35 run) and boot in 79 to 794 s; the three animation
   runs, each with the emulator alone, log zero ANRs and boot in 25 to 35 s.
10. **Naga's debug `OpSource` breaks gfxstream's guest SPIR-V validator** on
    emulator images ("SPIR-V ERROR: Invalid source language operand: 10",
    water-rs/waterui issue #764, fixed by PR #849 by stripping the debug and
    validation instance flags on emulator guests). Only builds with
    `InstanceFlags::DEBUG` are affected: wgpu-hal attaches naga debug info
    under that flag (`wgpu-hal-29.0.4/src/vulkan/adapter.rs:2624,2639`), and
    `InstanceFlags::from_build_config()` sets it under `debug_assertions`
    (`wgpu-types-29.0.4/src/instance.rs:258-264`), which Bevy's
    `WgpuSettings::default()` starts from (`bevy_render-0.19.1/src/settings.rs:130-144`).
    The spike's `--release` Rust code is not affected; a CI smoke on the
    emulator uses a release-profile library or sets `WGPU_DEBUG=0`.
11. **Hardware reports found**: a Bevy 0.19 APK runs on a Pixel 6 Pro and a
    Pixel 11 Pro XL while the same APK loses its device on the emulator
    (AceVik/baylee issue #1, open); the `driver implementation is at fault`
    loss on SwiftShader/gfxstream every 30–35 s under load is reported
    independently (water-rs/map-gpu issue #19; water-rs/waterui issue #860
    recreates the wgpu stack after each loss); a Bevy 0.14 app fails on a
    Maleoon 910 with the `SURFACE_VIEW_FORMATS` flag (bevy #15452). No report
    of Bevy 0.19/wgpu 29 failing to render on a mainstream Adreno or Mali
    device was found.
12. **Where the emulator can draw in CI.** GitHub's `ubuntu-latest` has KVM
    and no GPU: `-gpu host` is software there, and `-gpu lavapipe` is the
    software renderer that draws (finding 3). GitHub's arm64 macOS runners
    cannot run the emulator at all: "Nested-virtualization is not supported
    due to the limitation of Apple's Virtualization Framework" (GitHub docs,
    "Supported runners and hardware resources"). GitHub's GPU larger runners
    (Linux/Windows, NVIDIA T4) are the hosted option with a GPU; whether KVM
    is exposed there is NOT RUN. A self-hosted Apple-silicon Mac with `-gpu
    host` is the shape verified here. ros-viz-rs's smoke job (Bevy 0.18,
    x86_64 API 34, `-gpu swiftshader_indirect`,
    `ros-viz-rs/.github/workflows/android-apk.yml:101-130`,
    `android/scripts/smoke-test.sh`) asserts that the process is alive and
    grabs a screenshot; it never asserted a drawn frame, and its GPU mode is
    the one that loses the device here.

## Questions answered

**Q1 — Per image, GPU mode and backend: did a frame draw?** See the matrix in
Evidence. Drew: API 34 host Vulkan, API 35 host Vulkan (plain and animation
builds), API 35 lavapipe Vulkan. Did not: every SwiftShader run (Vulkan:
device lost at the acquire timeout, finding 5; GLES: shader translation
exit, finding 7a), every GLES run (finding 7), everything on API 32
(findings 6 and 7). Two CI candidates: for hosted Linux runners, **API 35
(or 34) `google_apis`, `-gpu lavapipe`, emulator ≥ 36.4.9, the Vulkan build,
release-profile Rust code** — verified on the arm64 image on an M1 host,
NOT RUN on the x86_64 image under KVM; for a machine with a GPU
(self-hosted Mac), the same image with `-gpu host`.

**Q2 — Two screenshots a few seconds apart.** Host GPU at t=30 s and t=35 s:
cube square, then hexagon, face identical. Lavapipe at t=15 s and t=20 s: 14 243
changed pixels in the cube's quadrant. Finding 2 and 3 give the frame
rates.

**Q3 — What is known about wgpu 29 / Bevy 0.19 on emulators and hardware.**
Findings 5, 6, 8, 10, 11: the zero buffer limit is the Android 12 image's
driver and has no wgpu fix; the SwiftShader device loss is wgpu-hal's 1 s
acquire timeout reported as `DeviceError::Unexpected` (wgpu #9029, open in
29.0.4 and absent from the CHANGELOG through 30.0.1), compounded by
gfxstream's 3 s present-fence bound, and is reported by three other
projects; lavapipe, the emulator's default software Vulkan since 36.4.9,
stays under the timeout; the `SURFACE_VIEW_FORMATS` requirement is Bevy's
sRGB view format meeting a driver without `swapchain_mutable_format`, seen
on one real device and under discussion in wgpu (#10340/#10357); naga debug
info kills the emulator's SPIR-V validator in debug builds; real Pixels run
Bevy 0.19.

**Q4 — Risk statement for section 5 risk 1 and P0 Gate 0.** Text in
"Implications for the plan".

## Evidence

Matrix (arm64 `google_apis` images; "drew" = face visible in the screenshot;
"anim" = the animation build, otherwise the packaging spike's builds):

| Image | `-gpu` | Backend | Result | Screenshots show |
|---|---|---|---|---|
| API 32 | swiftshader_indirect | Vulkan | no frame: `Buffer size 32 is greater than the maximum buffer size (0)`, panic `wgpu_core.rs:2253` | launcher |
| API 32 | host | Vulkan | no frame: same limit-0 error with adapter `Apple M1`/MoltenVK | launcher |
| API 32 | swiftshader_indirect | GLES | no frame: GLSL ES image-qualifier error, app exits | launcher |
| API 32 | host | GLES | no frame: `SURFACE_VIEW_FORMATS` refused, panic `wgpu_core.rs:3934` | no face |
| API 34 | swiftshader_indirect | Vulkan | no frame: black 44 s, DeviceLost, panic | black, t=5 s to t=45 s |
| API 34 | swiftshader_indirect | GLES | no frame: GLSL ES image-qualifier error, app exits | no face |
| API 34 | host | Vulkan | **drew** at t=30 s (t=25 s clear colour only) | clear colour, then the face |
| API 34 | host | GLES | no frame: `SURFACE_VIEW_FORMATS` refused | no face |
| API 35 | swiftshader_indirect | Vulkan | no frame: black, DeviceLost at +17 s, panic | black |
| API 35 | swiftshader_indirect | GLES | no frame: GLSL ES image-qualifier error, app exits | launcher |
| API 35 | host | Vulkan | **drew** at t=15 s | the face, t=15 s to t=45 s |
| API 35 | host | GLES | no frame: `SURFACE_VIEW_FORMATS` refused | no face |
| API 35 | host | Vulkan, anim | **drew and animated** from t=5 s, 3.3 frames/s | cube square at t=30 s, hexagon at t=35 s |
| API 35 | lavapipe | Vulkan, anim | **drew and animated** from t=10 s, 1.8 frames/s | 14 243 pixels changed from t=15 s to t=20 s |
| API 35, 640x480 | swiftshader_indirect | Vulkan, anim | no frame: black, DeviceLost at +11 s, panic | launcher at t=20 s |

Vulkan properties per ICD as the guest sees them, read by the `ash` probe:

| Image, `-gpu` | Device | `maintenance4` ext | `maxBufferSize` | `maxMemoryAllocationSize` | `swapchain_mutable_format` | wgpu `max_buffer_size` |
|---|---|---|---|---|---|---|
| API 32, swiftshader | SwiftShader Device (LLVM 10.0.0), api 1.3.0 | no | 0 | 1 GiB | no | 0 |
| API 34/35, swiftshader | same | no | 1 GiB | 1 GiB | no | 1 GiB |
| API 34/35, host | Apple M1 (MoltenVK), api 1.3.0 | no | 9093 MiB | 9093 MiB | no | `i32::MAX` |
| API 35, lavapipe | llvmpipe (LLVM 21.1.4, 128 bits), api 1.3.0 | no | 4095 MiB | 2 GiB | no | `i32::MAX` |

Procedure: each case booted the image, ran the probe, installed the APK, took a
screenshot every 5 s with its dominant colours and the changed-pixel count of the
lower-left quadrant between consecutive screenshots, and killed the emulator. Animation
build: `cargo ndk -t arm64-v8a -P 26 -o android/app/src/main/jniLibs build
--release --lib`, 21 min 34 s with the Bevy chain recompiled, `./gradlew
--no-daemon assembleDebug` 18 s, APK 94.9 MB (unstripped).


## Implications for the target picture

- Section 3.6's Android view is renderable with the plan's stack (Bevy 0.19.1,
  wgpu 29, `android-native-activity`, Vulkan): the face draws from the APK's
  own `assets/quori.glb` through `AndroidAssetReader` under an orthographic
  camera fitted to the meshes, and animates, on two current emulator images
  with a host GPU and on one with lavapipe.
- The `bevy_render/gles` fallback build is dead with this Bevy/wgpu pair
  (finding 7): the plan does not carry it. On hardware, Vulkan is the only
  path; the one property that can still refuse it is a swapchain without an
  sRGB format on a driver without `swapchain_mutable_format` (finding 8).
- Software rendering in CI means lavapipe, never SwiftShader: `-gpu
  swiftshader_indirect`, the mode ros-viz-rs and the plan's Gate 0 named,
  loses the device before the first frame at any resolution (finding 5).
- The emulator's frame rates (3.3 and 1.8 frames/s) bound nothing on a
  tablet; they do bound the smoke test's waits (face on screen 5 to 10 s
  after launch, a screenshot pair 5 s apart differs by thousands of pixels).
- Bevy 0.19's default `RenderErrorPolicy` exits on internal errors and ends
  a `DeviceLost` as a panic inside a system; a tablet's device loss
  (thermal, driver reset) needs `RenderErrorPolicy::Recover` or an explicit
  restart — a P6 item, not a gate.

## Implications for the plan

**Section 5, risk 1 (replacement text):** Android rendering on Bevy 0.19 is
verified on the emulator: the Quori face draws and animates under Vulkan on
the arm64 API 34 and API 35 `google_apis` images with `-gpu host` (MoltenVK
through gfxstream) and on API 35 with `-gpu lavapipe`
(S:challenge-android-render 1–3). It draws under no GLES build (two
structural failures in Bevy 0.19.1 + wgpu 29; the fallback build is dropped)
and under no SwiftShader mode (wgpu-hal's 1 s acquire timeout becomes a
device loss; wgpu #9029). The API 32 image is the only one with the zero
buffer limit and is retired. What remains for the tablet: (1) the adapter's
swapchain formats and `VK_KHR_swapchain_mutable_format` — a swapchain
without an sRGB format fails `Surface::configure` exactly as GLES does
(bevy #15452 on one real device); (2) frame rate and morph animation on
hardware, which the emulator cannot measure (3.3 frames/s with a host GPU
here); (3) the device-loss recovery policy. The fallback (Tauri shell around
the wasm view) stays recorded but is off the path.

**P0 Gate 0 (replacement text):** Passed on the emulator with: arm64 API 35
`google_apis` (API 34 equivalent), `-gpu host` and `-gpu lavapipe`, Vulkan
build, release-profile Rust code; evidence = a screenshot at 30 s showing
the face, two screenshots 5 s apart differing where the animated content
is, no `Caught` line in logcat; `dumpsys gfxinfo` and `SurfaceFlinger
--latency` are dropped from the evidence list. The CI smoke image is the
x86_64 API 35 (or 34) `google_apis` image on `ubuntu-latest` with KVM,
`-gpu lavapipe`, emulator ≥ 36.4.9 — the lavapipe result is verified on the
arm64 image on an M1 host only, so the first CI run is the x86_64
confirmation (NOT RUN); a self-hosted Apple-silicon Mac with `-gpu host` is
the second verified shape; GitHub's arm64 macOS runners cannot run the
emulator (no nested virtualization). `-gpu swiftshader_indirect` is
excluded. Debug-profile Rust builds are excluded from the emulator smoke
(naga debug info kills gfxstream's validator; finding 10). The tablet run
of P6's gate adds the swapchain-format probe (a Vulkan probe with a surface, or `vulkaninfo`) as its first step.

**Section 3.9:** the APK job builds `--release` Rust code for the smoke; the
smoke script asserts the screenshot and the screenshot-to-screenshot change
of the animated region, waits at least 15 s after launch before the first
capture (lavapipe's first frame lands at 10 s), and samples `dumpsys
meminfo`; the GLES feature and its build are removed from the matrix.

## Open questions

- The x86_64 API 34/35 image with `-gpu lavapipe` under KVM on
  `ubuntu-latest` (NOT RUN): the same host ICD, a different host
  architecture and CPU count; its boot and first-frame times set the smoke
  job's timeout.
- Frame rate and animation on hardware: nothing here bounds a tablet.
- Whether the tablet's Vulkan swapchain lists an sRGB format or supports
  `VK_KHR_swapchain_mutable_format` (finding 8); if neither, Bevy 0.19.1 fails
  to configure the surface and the fix is in `bevy_render` (render to a
  non-sRGB surface with manual encoding) or in wgpu (#10357).
- Whether GitHub's GPU larger runners expose KVM to the emulator (NOT RUN).
- Whether Bevy's `RenderErrorPolicy::Recover` brings the render world back
  after a device loss on Android (NOT RUN; the SwiftShader loss ends in a
  system panic under the default policy).
- Mesh picking, `bevy_egui` panels and the SAF/VIEW entry (packaging spike
  finding 11) are untested on the images that draw.
