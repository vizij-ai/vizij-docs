# Bevy 0.19 builds to an installable Android APK from this Mac; `vizij` type-checks for Android behind one missing feature
<!-- tags: family=project; type=reference; project_status=proposal; topics=android,bevy,vizij-rs,ros-viz-rs,packaging,wgpu,emulator -->
> **Last updated:** 2026-09-28
> **Related documents:** [Central plan](../bevy_everywhere-plan.md) · [Native app anatomy](native-app-anatomy.md) · [Standalone anatomy](standalone-anatomy.md)

Paths are repo-relative (`ros-viz-rs`, `vizij-rs`, `vizij-web`); registry
sources are quoted as `<crate>-<version>/path`. The spike's sources and
screenshots are in
[vizij-rs `spikes/bevy-everywhere/bevy-android/`](https://github.com/vizij-ai/vizij-rs/tree/spikes/bevy-everywhere/spikes/bevy-everywhere/bevy-android)
(branch `spikes/bevy-everywhere`; `app/` is the Bevy crate plus its Gradle
project; `screen*.png`). Build logs, raw logcat dumps and APKs are not kept:
the commands, timings and log lines quoted on this page are the record.

## Findings

1. **The ros-viz-rs Android recipe is cargo-ndk + a four-file Gradle project
   with no Java/Kotlin.** `cargo ndk -t arm64-v8a -o android/app/src/main/jniLibs
   build --release --lib` drops the cdylib into `jniLibs`; Gradle packages it
   with the framework's `android.app.NativeActivity`, pointed at the library by
   the `android.app.lib_name` meta-data (`ros-viz-rs/android/app/src/main/AndroidManifest.xml:21-27`,
   `android/app/build.gradle:6-31`, `android/settings.gradle`, `android/build.gradle`).
   Bevy is built with `android-native-activity`, deliberately not GameActivity
   (`ros-viz-rs/Cargo.toml:156-165`, `docs/wiki/DesignDecisions.md:64-94`); the
   entry point is `#[bevy_main] pub fn main()` in a `cfg(target_os = "android")`
   module (`src/android.rs:27-36`). CI (`.github/workflows/android-apk.yml`)
   uses Java 17, SDK platform 34 + build-tools 34, NDK r27c, Gradle 8.7, copies
   `libc++_shared.so` next to the library for oboe (`:76-83`), signs release
   with the debug keystore, and smoke-tests on an x86_64 API 34 emulator with
   `-gpu swiftshader_indirect`, grabbing a screenshot (`android/scripts/smoke-test.sh`).
   `[package.metadata.android]` (`Cargo.toml:47-60`) is cargo-apk/xbuild
   metadata that the Gradle route never reads. `docs/MAINTAINER.md:68-93` is
   stale (says GameActivity and "no APK yet").
2. **Bevy 0.19.1 selects no Android activity backend by default.**
   `default_platform` lists neither `android-game-activity` nor
   `android-native-activity` (`bevy-0.19.1/Cargo.toml:2762-2773`; the two
   features exist at `:2636-2637`), whereas 0.18 put `android-game-activity`
   in its defaults (`ros-viz-rs/Cargo.toml:88-95`). `android_shared_stdcxx` is
   gone from 0.19 (`grep android bevy-0.19.1/Cargo.toml` finds only the two
   features). Without a backend, `android-activity` 0.6.1 fails to compile
   (`android-activity-0.6.1/src/lib.rs:352` `compile_error!`, plus five
   follow-on errors in `input.rs`).
3. **That missing feature is the only Android compile error in `vizij`.**
   `cargo ndk -t arm64-v8a check -p vizij` (default features) fails with
   exactly the six `android-activity` errors above and nothing else
   (113 s). Enabled from the command line
   (`--features bevy/android-native-activity`, no source change), the same
   check passes with **0 errors, 0 warnings** across 472 crates
   (`Finished` after 23 min while a
   Bevy build ran alongside), and with `studio` added it passes again with 0
   errors across 445 more crates including zenoh 1.10.1, firestore 0.50.0,
   gcloud-sdk 0.30.2, arora-studio-bridge-client 6.1.0 and ring 0.17.14
   (8 min incremental). wasmtime 45.0.3 (arora's
   `native` → `wasmtime-host`), crossterm 0.28.1, ratatui 0.29.0 and both
   rodio lines type-check for `aarch64-linux-android`. The native build
   scripts ran through the NDK toolchain: aws-lc-sys 0.45.0 (cmake, produced
   `libaws_lc_0_45_0_crypto.a`), oboe-sys 0.6.1 (cc, `liboboe-ext.a`),
   zstd-sys. `check` does not link, so link-time gaps remain possible
   (finding 6 shows one such gap for Bevy's own audio).
4. **`vizij`'s Android-relevant dependency shape** (`cargo tree --target
   aarch64-linux-android -i`): aws-lc-sys comes
   from reqwest 0.13.5 ← `vizij-arora-tts` (rustls' default provider), so a
   cmake in the NDK cross-build is required by the cloud TTS provider, not by
   the Studio bridge; ring appears only with `studio` (zenoh's quinn/rcgen and
   arora's `rustls/ring`). Two audio stacks coexist: `bevy_audio` → rodio
   0.22.2 → cpal 0.17.1 (AAudio, no C++) and `vizij`/`vizij-arora-tts` →
   rodio 0.20.1 → cpal 0.15.3 → oboe 0.6.1 (C++, `c++_static` unless the
   `oboe-shared-stdcxx` feature is on; `cpal-0.15.3/Cargo.toml:116-118`,
   `oboe-sys-0.6.1/build.rs:289-292`). cpal needs no "oboe feature" on
   Android: the dependency is unconditional for `target_os = "android"`.
5. **A minimal Bevy 0.19.1 app builds and packages with the copied recipe.**
   Spike: cdylib + `#[bevy_main]`, clear color, spinning cube, the Quori GLB
   from the APK's `assets/` under an orthographic camera fitted to the meshes'
   AABB (`app/src/lib.rs`, `app/Cargo.toml`). Toolchain on this Mac: NDK
   25.1.8937393 (its darwin-x86_64 prebuilt runs under Rosetta on the M1),
   Temurin JDK 21, the Gradle 8.14.3 wrapper copied from
   `vizij-web/apps/vizij-standalone/src-tauri/gen/android`, AGP 8.11.0 (both
   already in `~/.gradle`), compileSdk 36, cargo-ndk 4.1.2 (`cargo install
   cargo-ndk --locked`, about a minute). Commands and timings are in the
   Evidence table: cold release build 2314 s contended by the T3 check, the
   vizij-rs workspace profile (`opt-level = "s"`, `lto`, `codegen-units = 1`)
   1283 s contended, leaf-only rebuild 10 s, `./gradlew assembleDebug` 22-41 s,
   `adb install` 2 s.
6. **Bevy 0.19's `audio` feature raises the Android API floor to 26.** cpal
   0.17.1's AAudio backend links `-laaudio`, which the NDK sysroot provides
   from API 26 only (`ndk/25.1.8937393/.../aarch64-linux-android/{24,26}/`);
   cargo-ndk defaults to platform 21 and the link fails with `unable to find
   library -laaudio`. `cargo ndk -P 26` (and
   `minSdk 26`) fixes it. ros-viz-rs (Bevy 0.18, oboe) ships minSdk 24.
7. **Sizes.** `--release` (opt 3, no LTO): `.so` 143.5 MB, 93.1 MB after
   `llvm-strip`. Workspace profile: 90.8 MB, 55.1 MB stripped; release APK
   **56.2 MB** (library stored uncompressed, Quori GLB 6.5 MB deflated to
   0.9 MB). AGP strips only when `ndkVersion` names an installed NDK;
   otherwise it logs "Unable to strip … packaging them as they are" and the
   APK is 91.9 MB. cargo-ndk copied no
   `libc++_shared.so` (nothing in Bevy 0.19's default graph links it).
8. **The APK installs and launches on the arm64 API 32 AVD; Bevy boots but
   wgpu 29's Vulkan device cannot allocate a buffer on the emulator, so no
   frame is drawn.** Both headless (`-gpu swiftshader_indirect`, adapter
   "SwiftShader Device (LLVM 10.0.0)", `device_type: Cpu`) and host GPU
   (`-no-window -gpu host`, adapter "Apple M1", driver "MoltenVK 1.4.0",
   `device_type: VirtualGpu`) log `Buffer size 32 is greater than the maximum
   buffer size (0)` for `bevy_pbr`'s "GPU clustering vertex buffer", then a
   panic in `wgpu-29.0.4/src/backend/wgpu_core.rs:2253` (`Buffer::get_mapped_range`)
   and "Encountered a panic in system"; the process stays alive (pid
   reported), the screenshot shows the launcher (`screen.png`,
   `screen-gpuhost-vulkan.png`). wgpu derives
   `max_buffer_size` from `VK_KHR_maintenance4::maxBufferSize` capped by
   `maintenance3::maxMemoryAllocationSize` (`wgpu-hal-29.0.4/src/vulkan/adapter.rs:1428-1447`);
   the emulator's Vulkan ICD (goldfish/gfxstream, Android 12 image) reports 0
   there. Not reproduced on hardware: no device was available. ros-viz-rs's
   CI screenshot comes from Bevy 0.18 on an x86_64 API 34 image, so the
   difference is wgpu 29 and/or the Android 12 arm64 image (unverified which).
9. **Forcing wgpu's GL backend needs a feature Bevy 0.19 does not expose.**
   Bevy's `webgl2` is wgpu's wasm-only `webgl`; the native GLES backend is
   `bevy_render/gles` (`bevy_render-0.19.1/Cargo.toml:45`) with no `bevy`-level
   alias (`grep '^gles' bevy-0.19.1/Cargo.toml` finds nothing). With
   `Backends::GL` and no `gles`, Bevy panics "Unable to find a GPU!"
   (`screen-gl.png`). Enabling `gles` means a direct `bevy_render`
   dependency for feature unification (`app/Cargo.toml`, 619 s rebuild of the
   render stack). With it, wgpu finds "Android Emulator OpenGL ES Translator
   (Apple M1)", OpenGL ES 3.0, and Bevy creates its window, but
   `Surface::configure` is refused: `Downlevel flags
   DownlevelFlags(SURFACE_VIEW_FORMATS) are required but not supported on the
   device`, then `Surface::get_current_texture_view` panics ("Surface is not
   configured for presentation"); `dumpsys gfxinfo` counts 0 frames
   (`screen-gpuhost-gles.png`). Bevy 0.19
   configures its surface with an sRGB view format, which this GLES 3.0
   translator cannot provide. So neither wgpu backend draws a frame on this
   emulator; hardware behaviour of either is unverified.
10. **Logging reaches logcat twice by default.** Bevy's `LogPlugin` installs an
    Android layer (`bevy_log-0.19.1/src/lib.rs:21,370-371`, `android_log-sys`)
    and android-activity also redirects stdout/stderr under the tag
    `RustStdoutStderr`; every event appears in both forms.
    `vizij` disables `LogPlugin` and routes `tracing` → `log` → env_logger or
    the TUI pane (`crates/vizij/src/main.rs:266,313`, `Cargo.toml` tracing
    comment), so on Android it needs either the `LogPlugin` kept or
    `android_logger` (0.15.1 is already in the standalone's lock).
11. **No file picker exists for a Bevy app on Android today.** rfd 0.16.0 has
    backends only for gtk3/xdg-portal (Linux/BSD), macOS, Windows and wasm
    (`rfd-0.16.0/src/backend/`, target tables in `Cargo.toml:88-152`). The
    Tauri standalone gets a GLB in three ways, all through Kotlin: VIEW intent
    filters for `model/gltf-binary` and `*.glb`/`*.gltf` captured by
    `MainActivity.kt:26-41` into `filesDir/opened_model.glb` and read by
    `get_glb_source` (`src-tauri/src/lib.rs:1275-1291`); the dialog plugin's
    Android picker (`tauri-plugin-dialog-2.6.0/android/src/main/java/DialogPlugin.kt:62-63`,
    `ACTION_GET_CONTENT`) whose `content://` result `plugin-fs` reads and copies
    into `appLocalDataDir` (`src/lib/modelStore.ts:1-8,45-55`). A NativeActivity
    app has the JavaVM and Activity handles (`ndk-context`, used by ros-viz-rs
    `src/app.rs:205-230` for `moveTaskToBack`), enough to `startActivity`, but
    `onActivityResult` needs an Activity subclass: the SAF route means one
    small Kotlin class (as Tauri does), not pure Rust. Unverified beyond
    reading; not built.
12. **Assets: the APK is Bevy's default source on Android.** `AssetPlugin`
    reads `assets/` from the APK through `AndroidAssetReader`
    (`bevy_asset-0.19.1/src/io/android.rs:17-33`, `ANDROID_APP.asset_manager()`);
    the spike packages `assets/quori.glb` that way. A GLB copied into the
    app's files dir is outside that source: `vizij`'s
    `UnapprovedPathMode::Allow` absolute-path load (`main.rs:262-264`) needs a
    file `AssetSource` or bytes in memory on Android. Whether the spike's GLB
    loaded is unknown: the render world died before the first frame and the
    log shows no glTF error.
13. **bevy_egui 0.39.1 runs on Android** (clipboard and URL opening gated off
    for `target_os = "android"`: `bevy_egui-0.39.1/Cargo.toml:303-311`,
    `src/lib.rs:158,198`, `src/output.rs:25`); ros-viz-rs draws its connection
    bar with it on Android and reserves the system bars with spacer panels
    computed from `AndroidApp::content_rect()` because Bevy 0.18/winit 0.30
    have no safe-area API (`src/android.rs:38-121`, `DesignDecisions.md:72-94`).
    Bevy 0.19.1 is still on winit 0.30.13 (`vizij-rs/Cargo.lock`), so the
    same interim applies.
14. **The Studio bridge's crates already build and run on Android inside the
    Tauri standalone**: its Android CI build is `--no-default-features
    --features studio-bridge` (`vizij-web/.github/workflows/android.yml:79-82`),
    with zenoh 1.9.0, rustls 0.23.42 (`ring` provider installed by the app),
    firestore 0.49.0, gcloud-sdk 0.30.1, reqwest 0.13.2, aws-lc-rs 1.17.1 in
    `src-tauri/Cargo.lock`; `vizij` with `studio` type-checks for Android
    (finding 3).

## Questions answered

**T1 — What is ros-viz-rs's Android recipe?** Gradle project + cargo-ndk;
neither cargo-apk nor xbuild (finding 1). The `[package.metadata.android]`
table is dead metadata for those tools. Bevy 0.18 feature list = defaults
expanded by hand minus `android-game-activity`, plus `android-native-activity`
in the Android target table.

**T2 — Does a minimal Bevy 0.19.1 APK build, install, launch and render on
the emulator?** Build, package, install and launch: yes (findings 5-7), with
two recipe deltas versus ros-viz-rs — select the activity backend explicitly
(finding 2) and build against API 26 (finding 6). Render: no frame on this
emulator, neither under Vulkan (finding 8) nor under GLES (finding 9); the
cause is the emulator's drivers in both cases, and no hardware was available.

**T3 — What in `vizij` blocks an Android build?** Only Bevy's unselected
activity backend (finding 3). Grouped by crate: `android-activity` 0.6.1 — 6
errors, all one cause. crossterm/ratatui (TUI), rodio/cpal/oboe, wasmtime,
arora `native`+`tui`, `vizij-arora-tts` (reqwest + aws-lc-sys) and the
`studio` feature all type-check for `aarch64-linux-android`. Not verified:
linking and running them (finding 3, open questions).

**T4 — What would the Bevy app need on Android beyond compiling?** A GLB entry
path (intent filter and/or SAF via a Kotlin Activity subclass; no rfd —
finding 11) feeding an in-memory or file asset source (finding 12); audio
works through cpal's AAudio (API 26) and oboe (finding 4, 6); the Studio
bridge crates are known to link and run on Android from the Tauri build
(finding 14); a minimal in-app UI can be bevy_egui with the safe-area spacer
pattern (finding 13); logging via `LogPlugin` or `android_logger` (finding 10).

## Evidence

### Builds and runs (all under the spike directory; `CARGO_TARGET_DIR` inside it)

| Step | Command | Result |
|---|---|---|
| T3 check, defaults | `cargo ndk -t arm64-v8a check -p vizij` (in vizij-rs) | exit 101 after 113 s; 6 errors, all `android-activity-0.6.1` |
| T3b check, backend selected | `cargo ndk -t arm64-v8a check -p vizij --features bevy/android-native-activity --keep-going` | exit 0, 0 errors, 0 warnings, 472 crates, 1391 s (contended) |
| T3c check, + studio | same `--features bevy/android-native-activity,studio` | exit 0, 0 errors, 445 further crates, 484 s |
| Spike build 1 | `cargo ndk -t arm64-v8a -o android/app/src/main/jniLibs build --release --lib` | 2314 s cold (contended); one spike-code error (`AmbientLight` is a component in 0.19) |
| Spike build 2 | same, fixed | 7 s; link error `unable to find library -laaudio` (platform 21) |
| Spike build 3 | `… -P 26 …` | 10 s; `libbevy_android_spike.so` 143.5 MB |
| Size profile | `… -P 26 … build --profile small --lib` (opt s, lto, cgu 1) | 1283 s cold (contended); 90.8 MB, 55.1 MB stripped |
| Gradle | `./gradlew --no-daemon assembleDebug` / `assembleRelease` | 22-41 s / 55 s; APK debug 150 MB, release 56.2 MB stripped |
| Install + launch | `adb install -r …; adb shell am start -n ai.vizij.bevyspike/android.app.NativeActivity` | 2 s; process alive 15 s later |
| Screenshot | `adb exec-out screencap -p > screen.png` | launcher only (render panic, finding 8) |

### Runtime log, host GPU emulator

```
AdapterInfo { name: "Apple M1", driver: "MoltenVK", driver_info: "1.4.0", backend: Vulkan, device_type: VirtualGpu … }
ERROR bevy_gilrs: Failed to start Gilrs. Gilrs does not support current platform.
INFO  bevy_pbr::cluster: GPU clustering isn't supported on this device; falling back to CPU clustering.
ERROR bevy_render::error_handler: Caught rendering error: Validation Error
  In Device::create_buffer, label = 'GPU clustering vertex buffer'
    Buffer size 32 is greater than the maximum buffer size (0)
thread '<unnamed>' panicked at …/wgpu-29.0.4/src/backend/wgpu_core.rs:2253:18:
Error in Buffer::get_mapped_range: Validation Error
```

The headless SwiftShader run is identical except for the adapter line; the
emulator itself was healthy (1 core, 1.9 GiB, Android 12, 1080x2220).

### Environment on this Mac

| Item | Value |
|---|---|
| Host | Apple M1, macOS 25.6; NDK prebuilt is darwin-x86_64 (Rosetta) |
| SDK | `~/Library/Android/sdk`: platforms 32/33/36, build-tools 35.0.0/37.0.0, NDK 25.1.8937393 + 30.0.15729638, cmdline-tools `latest` (sdkmanager not on PATH), emulator 36.6.11 |
| AVD | `Pixel_3a_API_32_arm64-v8a` (Android 12, Vulkan through goldfish/gfxstream; MoltenVK ICD with `-gpu host`) |
| Java / Gradle | Temurin 21 at `/usr/libexec/java_home -v 21`; Gradle 8.14.3 wrapper (cached), AGP 8.11.0 (cached from the Tauri project); no `gradle` on PATH |
| Rust | cargo 1.96.0, target `aarch64-linux-android`; cargo-ndk 4.1.2 installed by this study |
| cmake | 3.28.3 (`/Applications/CMake.app`), used by aws-lc-sys |

### Gradle project deltas from ros-viz-rs (`app/android/`)

`namespace`/`applicationId` `ai.vizij.bevyspike`; `compileSdk 36`; `minSdk 26`;
`ndkVersion '25.1.8937393'` (so AGP strips); `abiFilters 'arm64-v8a'`; AGP
`8.11.0`; manifest `android.app.lib_name = bevy_android_spike`; the Gradle
wrapper files copied from the Tauri gen project; `assets/quori.glb` added.

## Implications for the target picture

- **Android packaging of the Bevy view is a solved recipe**: ros-viz-rs's
  Gradle-plus-cargo-ndk layout carries over unchanged; the 0.19-specific
  deltas are the explicit `android-native-activity` feature and API 26. A
  `vizij-view` library plus a thin Android crate (cdylib, `#[bevy_main]`)
  fits it directly.
- **`vizij` as it is today compiles for Android without dropping arora's
  `native`/`tui` defaults** (finding 3). Dropping them is still the right
  target for Android — the TUI has no terminal, wasmtime has no guests to
  host, and both add size — but it is not a prerequisite for a first APK.
- **Rendering on Android is unproven.** The emulator cannot draw a single
  Bevy 0.19 frame under Vulkan; hardware behaviour is unknown. This turns the
  retirement gate ("installs on an Android tablet, opens a GLB, reaches
  Semio Studio") into the first thing to test on the actual tablet, not the
  last. On this emulator a CI smoke test can only assert "launches and stays
  alive": both wgpu backends fail before the first frame (findings 8-9).
- **The operator UI on Android has a known shape**: bevy_egui panels with
  safe-area spacers (ros-viz-rs) for the endpoints and the Studio-owner
  prompt; the GLB comes through an intent filter and a SAF picker that needs
  one Kotlin Activity subclass, so "no Java/Kotlin" is not a property the
  Vizij APK can keep.
- **The Studio bridge and TLS stacks are the same crates the Tauri standalone
  already ships on Android**; no new native dependency appears, and the
  cmake requirement (aws-lc-sys) comes from the cloud TTS provider's reqwest,
  which the picture keeps (`say` stays on the device).
- **Size**: a bare Bevy 0.19 view is a 56 MB APK under the workspace profile;
  `vizij` adds arora, wasmtime, zenoh, firestore and TTS — expect well over
  that (not measured).

## Implications for the plan

1. Add to `crates/vizij` (or the future view crate) a
   `[target.'cfg(target_os = "android")'.dependencies]` table enabling
   `bevy/android-native-activity`, a `cdylib` target and a `#[bevy_main]`
   entry that skips the CLI; keep `LogPlugin` on Android.
2. Copy `ros-viz-rs/android/` into vizij-rs with the names changed,
   `minSdk 26`, `ndkVersion` set, and a CI job modelled on `android-apk.yml`
   (`cargo ndk -P 26`, platform 36 or 34, API 26+ emulator).
3. Validate rendering on the real tablet before any further Android work; in
   parallel try a newer arm64 system image (API 34/35) on the emulator to
   learn whether `max_buffer_size = 0` (Vulkan) and the missing
   `SURFACE_VIEW_FORMATS` (GLES) are image-specific; only then decide whether
   a `bevy_render/gles` fallback build is worth carrying (finding 9).
4. Design the GLB entry: VIEW intent filter + SAF picker in a Kotlin
   `NativeActivity` subclass writing into `filesDir`, and a file or
   in-memory `AssetSource` on the Bevy side (`FaceMeta` from bytes).
5. Trim the Android feature set afterwards (arora without `native`/`tui`,
   drop vizij's own `crossterm`), measuring the APK each time.
6. Record in the ros-viz-rs docs drift found here (MAINTAINER.md vs
   android-apk.yml) only if ros-viz-rs is touched; it is outside this plan.

## Open questions

- Does wgpu 29 render on real Android hardware (Vulkan, or GLES with
  `bevy_render/gles`), and on newer emulator images (API 34/35 arm64, not
  installed here)? The Vulkan failure is in the emulator's reported
  `maxBufferSize`/`maxMemoryAllocationSize` (which of the two is 0 was not
  isolated); the GLES failure is the translator's missing sRGB surface view
  formats.
- Does the full `vizij` crate *link* for Android (check passed; no link
  attempted): oboe's `c++_static`, wasmtime's signal handling, the two cpal
  stacks, aws-lc's assembly objects? And does wasmtime's JIT run under
  Android's W^X rules if `native` is kept?
- Two cpal hosts (AAudio via bevy_audio, oboe via rodio 0.20) in one process:
  do they share the output device without conflict?
- Fullscreen: ros-viz-rs deliberately keeps the system bars; a face display
  wants edge-to-edge immersive mode — not tried.
- Whether the spike's `assets/quori.glb` loads through `AndroidAssetReader`
  is unknown until a frame renders.
