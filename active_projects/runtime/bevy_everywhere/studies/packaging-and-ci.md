# Packaging and CI: what exists to build, test and release the Bevy app, its wasm package and its APK
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,bevy,ci,packaging,wasm,android,release -->
> **Last updated:** 2026-09-28
> **Related documents:** [Central plan](../bevy_everywhere-plan.md)

Raw outputs (registry queries, run listings, runner-image readmes, the downloaded
`@vizij/runtime` tarball) are not kept.

## Findings

1. **ros-viz-rs is a complete, green, single-crate release pipeline for a Bevy app on
   every target the plan names.** `release.yml` tags `v<Cargo.toml version>` on each
   push to `main` and, in one run, attaches a macOS `.dmg`, a Linux `.deb` and `.rpm`, a
   Windows `.exe` and an Android `.apk` to a GitHub release
   (ros-viz-rs/.github/workflows/release.yml:30-271). The 2026-07-16 run (v1.3.5) passed
   every packaging job; only `crates-io` and `npm` failed, both `continue-on-error`
   because their registry side is unconfigured (release.yml:87, :279).
2. **Debian/RPM packaging is metadata plus one cargo tool each.**
   `[package.metadata.deb]` (ros-viz-rs/Cargo.toml:21-28, `depends = "$auto"`) feeds
   `cargo deb` (release.yml:149-152); `[package.metadata.generate-rpm]`
   (Cargo.toml:33-40, `auto-req = "auto"`) feeds `cargo generate-rpm` after a release
   build (release.yml:174-179). Both run on `ubuntu-latest` with the Bevy apt headers
   (`libasound2-dev libudev-dev libwayland-dev libxkbcommon-dev`).
3. **The Android recipe is `cargo-ndk` + a hand-written Gradle project, not
   `cargo-apk`/`xbuild`.** `cargo ndk -t arm64-v8a -t x86_64 -o android/app/src/main/jniLibs
   build --release --lib --no-default-features --features rosbridge`, then
   `libc++_shared.so` copied per ABI from the NDK sysroot, then `gradle assembleRelease`
   (release.yml:248-262; android-apk.yml:71-87). The Gradle project has no Java/Kotlin:
   the manifest names the framework `android.app.NativeActivity` and
   `android.app.lib_name = ros_viz_rs` (ros-viz-rs/android/app/src/main/AndroidManifest.xml:20-27);
   release builds are debug-keystore-signed (android/app/build.gradle:21-30). The
   `[package.metadata.android]` block (Cargo.toml:47-60) is inert documentation for a
   tool the pipeline does not use.
4. **The Android emulator smoke test runs on GitHub-hosted `ubuntu-latest`.**
   `android-apk.yml:101-139` enables KVM, boots an API-34 x86_64 `google_apis` AVD with
   `-gpu swiftshader_indirect` through `reactivecircus/android-emulator-runner@v2`, and
   runs `android/scripts/smoke-test.sh`: install, launch, 40 s crash-buffer watch,
   `screencap` uploaded as an artifact and base64-inlined in the log
   (smoke-test.sh:13-84). Latest run: `apk` 23 min, `smoke-test` 3 min, both green.
   vizij-web's `android.yml` runs the same emulator for the Tauri standalone and
   documents its flake (`Failed to find ColorBuffer`) with a fresh-emulator retry
   (vizij-web/.github/workflows/android.yml:123-179).
5. **The web bundle is `wasm-pack build --target web` (release + default `wasm-opt`),
   built twice: a WebGL2 bundle and a `--features webgpu` bundle**
   (ros-viz-rs/.github/workflows/pages.yml:33-42; Cargo.toml:84 `webgpu = ["bevy/webgpu"]`).
   `web/index.html:231-242` picks the bundle by probing `navigator.gpu.requestAdapter()`
   (a *working* adapter, not the mere presence of `navigator.gpu`), and switching modes
   is a page reload because the Bevy app owns the canvas for the page's lifetime
   (index.html:244-256). The wasm is 51.2 MB raw / 13.9 MB gzip on the local build
   (ros-viz-rs has no `[profile.release]`; build flags of that local artifact are
   unverified).
6. **macOS packaging is a 60-line script around `create-dmg`**
   (ros-viz-rs/scripts/package_macos.sh:16-59): a hand-made `.app` bundle
   (`Info.plist`, `AppIcon.icns`) and a drag-to-install `.dmg`; unsigned, un-notarized
   (docs/MAINTAINER.md:96-99). Windows is a bare `.exe` copy (release.yml:213-216).
7. **vizij-rs CI never builds the `vizij` crate without features, for wasm32, or for
   Android, and never on macOS.** `ci.yml` jobs: `rust` (workspace `--all-features
   --exclude vizij`, then `cargo test -p vizij --features ros2-dds,studio,tts-piper`,
   clippy under `ros2-dds,studio,tts-piper` and `ros2-zenoh --bins`, fmt; :19-50),
   `wasm` (wasm-pack for the three wasm-bindgen crates, `wasm32-wasip1` for the
   animation module, pnpm build+test of the wrappers; :52-93), `bench-smoke`
   (dispatch-only), `registry` (:126-140), `animation-module-boundary` (:148-166),
   `snapshot-regression` (:173-202). All `ubuntu-latest`. Latest `main` run
   (2026-09-15): all green; `snapshot-regression` 3.5 min with a warm cache.
8. **The visual oracle today is a committed native golden set that was validated against
   three.js once.** `crates/vizij/tests/snapshot_regression.rs:17-27` embeds
   `tests/references/{quori,toasty}.png`; the test runs `vizij --glb … --snapshot …
   --no-autoplay` and requires a mean 32×32 per-channel difference `< 10.0`
   (:33-79). It is `#[ignore]`d and only the CI job runs it, on lavapipe
   (`WGPU_BACKEND=vulkan`, `mesa-vulkan-drivers`), with the two GLBs fetched from
   vizij-web `main` over raw.githubusercontent (ci.yml:188-198). The web-vs-native
   parity (0.50 % / 0.66 % differing samples) is a one-time collage under
   `crates/vizij/docs/compare/`, captured with a headed scratch Playwright spec because
   "headless Chromium does not composite the WebGL canvas"
   (crates/vizij/README.md:172-190).
9. **A native memory test exists and runs in plain `cargo test`; the ROS one is ignored.**
   `crates/vizij/src/memory_tests.rs:190` (`the_device_alone_keeps_a_flat_heap_under_a_frame_feed`,
   heap-floor via a counting global allocator) runs in the `rust` job;
   `ros2_tests.rs:476-478` (`the_device_keeps_a_flat_heap_in_a_ros_graph`) is
   `#[ignore]`d and fails by design until VIZ-118 (RustDDS per-sample retention).
10. **Crates are published by hand-triggered OIDC Trusted Publishing, in a fixed order,
    and the local versions are ahead of the registry.** `publish-crates.yml` (dispatch
    only) publishes `vizij-api-core vizij-graph-core vizij-arora-host vizij-arora-behavior
    vizij-arora-tts`, skipping versions already on the index (:31-47). crates.io holds
    api-core 1.0.0 / graph-core 1.3.0 / arora-host 1.0.0 / arora-behavior 1.0.0 /
    arora-tts 1.0.0 while the tree carries 1.1.0 / 1.4.0 / 2.1.0 / 1.1.0 / 2.0.0.
    `vizij` is `publish = false`, version 0.1.0, no CHANGELOG (crates/vizij/Cargo.toml:3-5);
    CHANGELOGs exist only for the animation and graph core/wasm crates.
    `publish-all-crates.yml` is a token-based `cargo workspaces publish` on `release-*`
    tags, superseded by the OIDC workflow.
11. **npm packages are built by wasm-pack and published by changesets over OIDC.**
    `scripts/build-{animation,graph,arora-web}-wasm.mjs` each run `wasm-pack build
    <crate> --target web --out-dir npm/@vizij/<pkg>/pkg --release`;
    `@vizij/animation-module` is `cargo build --target wasm32-wasip1 --release` plus a
    YAML→JSON header (npm/@vizij/animation-module/scripts/build-artifact.mjs:24-51).
    `publish-npm.yml` (dispatch with optional single `package`, or `npm-pub-*` tags)
    runs `changeset version` then `scripts/ci-publish.mjs` (materialise `workspace:`
    ranges, `build:wasm` + `build:shared`, `changeset publish`) with `id-token: write`
    and no token env (:16-18, :95-104) — the README's "NPM_TOKEN in repo secrets"
    (vizij-rs/README.md:319) describes the previous mechanism.
12. **`@vizij/runtime` 2.4.0 on npm is 5.34 MB unpacked / 1.58 MB tarball; its wasm is
    2,507,604 B raw and 755,894 B gzipped, shipped twice** (`pkg/` and `dist/pkg/`,
    because `files` lists both and `copy-wasm-pkg.mjs` copies `pkg/` into `dist/`;
    npm/@vizij/runtime/package.json:25-29, scripts/copy-wasm-pkg.mjs:49-57).
13. **vizij-web consumes vizij-rs only through the registry.** `@vizij/runtime ^2.4.0`
    in apps/vizij-authoring/package.json:36, apps/vizij-standalone/package.json:24,
    packages/@vizij/runtime-react/package.json:44; `@vizij/node-graph ^0.7.0` and
    `@vizij/value-json ^0.2.0` likewise. `scripts/wasm-links.mjs` symlinks
    `node_modules/@vizij/<pkg>` (root and nested) to `../vizij-rs/npm/@vizij/<pkg>` for
    local work (`link`/`unlink`/`status`, and `relink` on `postinstall`, :532-568);
    `ci.yml` never links, so a vizij-rs change reaches vizij-web CI only after an npm
    publish and a range bump.
14. **vizij-web publishes to npm per package against the registry, not from
    changesets.** `publish-npm.yml` runs on pushes touching `packages/**`;
    `scripts/publish-unpublished.mjs:60-66` classifies each `@vizij/*` package as
    published / unpublished / absent and publishes the unpublished ones with `npm publish
    --provenance --ignore-scripts` over OIDC; an absent package is reported as needing a
    one-time manual first publish (:139-146). The `.changeset/` config and
    `ci-publish.mjs` remain but are not on the CI path.
15. **vizij-web's Playwright suites run headless on SwiftShader; the authoring suite is
    tag-split.** `e2e/playwright.config.ts:16-26` passes `--enable-unsafe-swiftshader
    --use-gl=angle --use-angle=swiftshader --ignore-gpu-blocklist` so three.js gets a GL
    context; it boots the authoring app (5199) and three demos (5200-5202) and gates
    journeys behind `RUN_HEAVY=1`. `apps/vizij-authoring/playwright.config.ts:28-37`
    defines `smoke` / `workflow` projects by `@smoke` / `@workflow` tags over a
    build+preview server; CI runs `test:e2e:smoke` (ci.yml:65). 17 spec files include a
    memory checkpoint workflow (`memory-investigation.workflow.pw.ts`, JS heap +
    `measureUserAgentSpecificMemory`) and a reference-face smoke.
16. **Android release signing already exists in the same GitHub org.** vizij-web
    `android.yml:261-281` decodes `ANDROID_KEY_BASE64` into a keystore, writes
    `keystore.properties`, and fails the release if the secret is missing; the version
    and tag come from `tauri.conf.json` (`vizij-standalone-v1.4.0`, released 2026-07-18).
17. **GitHub-hosted runners already carry the Android toolchain.** ubuntu-24.04: SDK
    cmdline-tools, build-tools 34-37, platforms android-34…37, NDK 27.3 (default),
    28.2, 29.0 with `ANDROID_NDK_HOME` set, Gradle 9.7, Rust 1.98; macos-15: the same
    plus Android Emulator 37.1.11 (runner-images readmes). The emulator on Ubuntu is
    installed by `reactivecircus/android-emulator-runner`, which ros-viz-rs proves works
    with KVM.
18. **Bevy 0.19.1's default features include no Android activity backend and do
    include `webgl2`.** `default_platform` = std, bevy_gilrs, bevy_winit,
    bevy_clipboard, default_font, multi_threaded, webgl2, x11, wayland, custom_cursor,
    sysinfo_plugin (bevy-0.19.1/Cargo.toml:2762-2774); `android-game-activity` /
    `android-native-activity` are opt-in (bevy_winit-0.19.1/Cargo.toml). `crates/vizij`
    depends on `bevy = "0.19"` with defaults (crates/vizij/Cargo.toml:22), so an Android
    build must add one backend under a `[target.'cfg(target_os = "android")']` table,
    as ros-viz-rs does for 0.18 (ros-viz-rs/Cargo.toml:156-160).
19. **`vizij` is a binary-only crate.** `crates/vizij/src/main.rs` is the sole target;
    there is no `lib.rs`, no `crate-type = ["cdylib"]`, and no `cfg(target_arch =
    "wasm32")` / `cfg(target_os = "android")` in `crates/vizij/src`. Both the APK
    (`cargo ndk … --lib`) and wasm-bindgen need a cdylib, so the crate layout changes
    before any packaging recipe applies.
20. **Nothing releases the Bevy app today.** vizij-rs has no GitHub release (`gh release
    list` is empty; tags are `npm-*` and `release-0.3.0`), no tag-on-version workflow, no
    per-OS binary or installer job, no APK job, and no wasm package for `crates/vizij`.
    On this machine `cargo-deb`, `cargo-generate-rpm`, `cargo-dist`, `cargo-packager`,
    `cargo-bundle`, `cargo-apk`, `xbuild`, `trunk` and `wasm-opt` are absent;
    `wasm-pack`, `wasm-bindgen`, `cargo-ndk`, `cargo-tauri`, `cargo-mobile` and
    `create-dmg` are present.
21. **Semio Studio's `apps/vizij-app` is outside CI and outside the release flow.**
    `ci-cd.yml` and `release.yml` in semio_studio never mention it; `release.yml`
    publishes the three.js `vizij` npm package (packages/vizij, 0.1.0) via changesets +
    OIDC (semio_studio/.github/workflows/release.yml:1-30, :84). The Tauri app's
    `bundle.targets = "all"` (apps/vizij-app/src-tauri/tauri.conf.json) is the only
    installer configuration on the Studio side.

## Questions answered

**Q1 — ros-viz-rs recipes; reusable verbatim vs needing adaptation.**
deb/rpm: `cargo-deb` and `cargo-generate-rpm` driven by `[package.metadata.*]` (findings
2). Android: `cargo-ndk` into `jniLibs` + `libc++_shared.so` + Gradle with the framework
`NativeActivity`; no `cargo-apk`/`xbuild` (finding 3). Web: `wasm-pack build --target web`
twice (WebGL2 and `webgpu`), `index.html` probes for a working WebGPU adapter and reloads
to switch (finding 5). Release: one workflow tags from `Cargo.toml`, creates the GitHub
release, then fans out to dmg/deb/rpm/exe/apk/crates.io/npm jobs (finding 1).

Reusable verbatim (rename only): the `[package.metadata.deb]` / `[generate-rpm]` blocks;
the `tag`, `github-release`, `linux-deb`, `linux-rpm`, `windows-exe`, `macos-app` job
skeletons and `package_macos.sh`; the Gradle project (package id, `lib_name`, icons,
`versionName`); `smoke-test.sh` (`PKG`, `ACT`, APK name); the `pages.yml` wasm-pack
pattern; the adapter probe and reload-to-switch in `index.html`; the `version-bump` gate.

Needs adaptation: (a) crate layout — `vizij` must gain a cdylib `[lib]` for Android and
wasm (finding 19), and Bevy 0.19 needs an explicit `android-native-activity` (finding
18); (b) feature sets — ros-viz-rs ships `--no-default-features --features rosbridge` on
Android and web; the equivalent for `vizij` is "no `ros2-*`, no `tts-piper`", and whether
`studio` (arora's `studio-bridge`: Firebase + gcloud stack) cross-compiles to Android and
wasm is unverified here (the bevy-android / bevy-wasm sub-studies cover it); (c) the
release workflow reads `version` from the *root* `Cargo.toml` — vizij-rs is a workspace,
so it must read `crates/vizij/Cargo.toml` and build `-p vizij`; (d) `tts-piper` links
GPLv3 code and bakes dylib rpaths (crates/vizij/build.rs), so installers must be built
without it or ship the dylibs; (e) Windows needs the Npcap SDK only if a DDS `ros2-dds`
build is packaged (release.yml:197-205); (f) the three-`.so`-per-ABI, unstripped APK
weighs 318 MB in ros-viz-rs (finding 1's release assets) — a packaged `vizij` APK wants
`strip = true` and the workspace's LTO/`opt-level = "s"` profile, and probably arm64
only for the release variant.

**Q2 — vizij-rs CI, feature matrix, GPU jobs, crate and npm publishing.**
Jobs and coverage: finding 7. Feature matrix of `vizij`: `default = []`, `ros2` (alias of
`ros2-dds`), `ros2-dds`, `ros2-zenoh` (mutually exclusive with dds), `studio`,
`tts-piper` (crates/vizij/Cargo.toml:98-118); CI tests `ros2-dds,studio,tts-piper` and
clippies `ros2-zenoh --bins`; the default and the `studio`-only builds are not exercised.
GPU/display: only `snapshot-regression` renders, on lavapipe (software Vulkan) with
GLBs fetched from vizij-web `main` — no macOS/Metal job, unlike ros-viz-rs which keeps
macOS as the strict visual gate and Linux informational (ros-viz-rs/ci.yml:85-126).
Crates: finding 10. npm: findings 11-12; versioning is changesets
(`.changeset/config.json`, three pending changesets), with `npm-*` git tags.

**Q3 — vizij-web workflows, publish flow, Playwright, release coupling.**
Workflows: `ci.yml` (build / e2e / authoring-smoke), `android.yml` (standalone APK:
on-demand debug + emulator smoke; push-to-main signed release on version bump),
`publish-npm.yml` (registry-driven, finding 14). Playwright: finding 15. Coupling:
finding 13 — the registry range `^2.4.0` is the contract; `wasm-links.mjs` is local-only.

**Q4 — what a Bevy-app release needs that does not exist.** Finding 20 lists the gap;
the pieces exist elsewhere: per-OS binaries and installers in ros-viz-rs (findings 1, 2,
6), APK build in ros-viz-rs and signing secrets in vizij-web (findings 3, 16), runners
with SDK/NDK preinstalled (finding 17). The wasm package: `@vizij/runtime` is 2.5 MB /
0.76 MB gz of wasm (finding 12); ros-viz-rs's Bevy 0.18 + egui bundle is 51 MB / 13.9 MB
gz without LTO (finding 5). The bevy-wasm spike's build was still running at the time of
writing, so the Bevy-view number is **pending**; an unverified expectation from
vizij-rs's release profile (`opt-level = "s"`, `lto = true`, `codegen-units = 1`,
Cargo.toml:40-43) and a 3D-only feature set is 15-30 MB raw / 5-10 MB gzipped, i.e.
roughly ten times `@vizij/runtime`. Registry bootstrap: a new `@vizij/*` name and a new
crate name each need a manual first publish before Trusted Publishing applies (finding
14's script says so for npm; ros-viz-rs docs/MAINTAINER.md:23-37 for crates.io). Docs:
`docs.yml` builds typedoc + `cargo doc` for seven crates, not `vizij` (vizij-rs
package.json:53).

**Q5 — test strategy for the target.** See "Implications for the plan"; the proposal is
built from findings 8, 9, 15, 4 and 17.

## Evidence

### Release pipelines side by side

| Aspect | ros-viz-rs (Bevy app) | vizij-rs (`vizij` crate) | vizij-web (standalone) |
|---|---|---|---|
| Trigger | push to `main`, tag from `Cargo.toml` version, `version-bump` PR gate | none for the app; `publish-*` dispatch/tag for crates & npm | push to `main`, tag from `tauri.conf.json` version |
| GitHub release | yes, assets attached | none | yes, APK only (`vizij-standalone-v*`) |
| Linux | `.deb` (cargo-deb), `.rpm` (cargo-generate-rpm) | — | — |
| macOS | `.app` + `.dmg` (create-dmg), unsigned | — | — |
| Windows | bare `.exe` | — | — |
| Android | cargo-ndk + Gradle, debug-keystore-signed, arm64 + x86_64 | — | Tauri `android build`, release-keystore-signed from secrets, 4 ABIs |
| Web | wasm-pack ×2 (WebGL2, WebGPU) → GitHub Pages | wasm-pack for three interop crates → npm | Vite apps; e2e only |
| crates.io | Trusted Publishing, unconfigured (job fails, tolerated) | Trusted Publishing, 5 crates, versions behind the tree | — |
| npm | `NPM_TOKEN`, unconfigured (job fails, tolerated) | OIDC, changesets, 6 packages | OIDC, registry-driven |

### CI jobs that render or need a device

| Repo / job | Runner | GPU path | What it proves |
|---|---|---|---|
| ros-viz-rs `test-linux` visual regression | ubuntu | lavapipe, `continue-on-error` | informational |
| ros-viz-rs `test-macos` | macos-latest | Metal (paravirtual) | strict visual gate |
| ros-viz-rs `smoke-test` | ubuntu + KVM | swiftshader emulator | APK launches, screenshot |
| vizij-rs `snapshot-regression` | ubuntu | lavapipe | native render within 10.0 mean diff of golden |
| vizij-web `e2e`, `authoring-smoke` | ubuntu | Chromium + SwiftShader (WebGL) | pages render without errors |
| vizij-web `debug-apk` (dispatch) | ubuntu + KVM | swiftshader emulator, 2 retries | standalone launches |

### Sizes

| Artifact | Raw | Gzip |
|---|---|---|
| `@vizij/runtime` 2.4.0 `vizij_arora_web_bg.wasm` | 2,507,604 B | 755,894 B |
| ros-viz-rs `web/pkg/ros_viz_rs_bg.wasm` (local, Bevy 0.18 + egui, no LTO) | 51,222,312 B | 13,869,850 B |
| ros-viz-rs v1.3.5 `.rpm` / `.deb` / `.dmg` / `.exe` / `.apk` | 24 / 43 / 35 / 87 / 318 MB | — |
| Bevy view wasm (bevy-wasm spike) | pending | pending |

### Feature sets per target

| Target | ros-viz-rs | `vizij` today | `vizij` for the target (to establish) |
|---|---|---|---|
| Desktop | default (`ros2`, `rosbridge`), Bevy defaults minus `android-game-activity` | `ros2-dds` \| `ros2-zenoh`, `studio`, `tts-piper`; Bevy defaults | same, minus `tts-piper` in installers |
| Android | `--no-default-features --features rosbridge`, `android-native-activity` | not buildable (bin-only, no backend feature) | cdylib, `android-native-activity`, no `ros2-*`, `studio` if it cross-compiles |
| Web | `--no-default-features --features rosbridge[,webgpu]` | not buildable (bin-only) | cdylib, `webgl2` + `webgpu` bundles, no `ros2-*`/`tts-piper` |

## Implications for the target picture

- One crate, four packagings: the `vizij` crate needs a `[lib]` cdylib (finding 19)
  whose entry points are `main.rs` (desktop), `#[bevy_main]` (Android) and a
  `wasm_bindgen` `start`-style export (web), as ros-viz-rs lays out with `src/main.rs`,
  `src/android.rs` and its wasm exports. The browser entry replaces `vizij-arora-web`'s
  role as the npm-facing cdylib, so the npm package is a successor of `@vizij/runtime`
  (a MAJOR under the existing name) or a new name with a manual first publish.
- Two web bundles, not one: the WebGL2/WebGPU split with adapter probing is the
  shipped shape (finding 5); the authoring viewport and the demo page inherit the
  reload-to-switch constraint.
- The `studio` feature is the Android retirement gate's dependency ("reaches Semio
  Studio"); whether it cross-compiles is the first thing to establish, since vizij-web's
  standalone already ships `--features studio-bridge` on Android through Tauri
  (android.yml:79-82) — the same arora client crate.
- Installer sizes will be Bevy-sized: tens of MB per desktop package and an APK that
  must be stripped and LTO'd to stay well under ros-viz-rs's 318 MB.

## Implications for the plan

1. **Copy the ros-viz-rs pipeline into vizij-rs as a `release-vizij.yml`**, parameterised
   on `crates/vizij/Cargo.toml`'s version and `-p vizij`, with the crates-io/npm jobs
   dropped (those stay on the existing `publish-*` workflows) and the desktop jobs
   building without `tts-piper`. Add a `version-bump` gate scoped to `crates/vizij`.
2. **Land the crate-layout change first** (cdylib + Android/wasm entry points +
   `android-native-activity` target table), then the Android and web CI jobs, then the
   packaging jobs — each is a separate PR that CI can prove.
3. **Android CI in two jobs, like ros-viz-rs**: `apk` (cargo-ndk arm64 + x86_64,
   `libc++_shared.so`, Gradle) and `smoke-test` (KVM + swiftshader emulator, install,
   launch, crash-buffer watch, screenshot). Reuse vizij-web's signing-secret pattern for
   the release variant and its fresh-emulator retry for the flake. Extend the smoke
   script with "opens a GLB": `adb push` a fixture GLB and launch with an intent extra or
   a known app-storage path; "reaches Studio" needs credentials and network and stays a
   manual gate.
4. **Web CI job**: `wasm-pack build --target web` of the view crate for WebGL2 and
   WebGPU into the npm wrapper's `pkg/`, then a Playwright spec (Chromium +
   SwiftShader flags from vizij-web's config) that loads the page, waits for a
   readiness signal the JS glue exposes after the first rendered frame, and screenshots
   the canvas. Publish through the existing changesets + OIDC `publish-npm.yml`.
5. **Pixel parity when the web is Bevy-wasm**: three.js stops being the oracle; the
   committed golden set (native, lavapipe-validated, `MAX_MEAN_DIFF = 10.0` at 32×32)
   becomes the one reference. Add a *native-vs-wasm* case to `snapshot-regression`: the
   same commit's wasm bundle rendered by headless Chromium (SwiftShader WebGL2) with the
   same GLB and neutral pose, compared to the same golden with the same metric. Keep the
   web-vs-three.js collage under `docs/compare/` as a frozen, non-CI artefact of the
   migration. Consider re-adding a macOS/Metal run of `snapshot_regression` as the strict
   gate and keeping lavapipe informational, as ros-viz-rs does, once the wasm case shows
   how much software rasterisers drift.
6. **Memory tests**: keep the native heap-floor test in `cargo test`; for the browser,
   reuse the authoring `memory-investigation` checkpoint pattern against the Bevy
   canvas page, sampling `WebAssembly.Memory.buffer.byteLength` from the glue plus
   `measureUserAgentSpecificMemory`, before and after N steps; for Android, sample `adb
   shell dumpsys meminfo <pkg>` in the smoke script over a short frame feed. VIZ-118
   stays a DDS-side blocker for the ROS memory test.
7. **Registry bootstrap is a checklist item with a human in it**: a new crate or npm
   name needs Victor's manual first publish and Trusted Publisher registration; the
   `vizij` crate also needs a CHANGELOG and a version policy (MAJOR for breaking) before
   `publish = false` is lifted — or it stays unpublished and the GitHub release is the
   distribution, as ros-viz-rs's crates-io job failing harmlessly shows is workable.
8. **Studio's `apps/vizij-app` needs its own CI build** (semio_studio never builds it,
   finding 21) before it can consume the Bevy view as a library; the Tauri
   `bundle.targets = "all"` config is its installer path.

## Open questions

- Does `arora/studio-bridge` (Firebase + gcloud + rustls) compile for
  `aarch64-linux-android` and `wasm32-unknown-unknown`? (bevy-android / bevy-wasm
  sub-studies.)
- What is the Bevy view's wasm size under vizij-rs's release profile? (bevy-wasm spike,
  pending at the time of writing.)
- Is the WebGPU bundle testable headless in CI (`--enable-unsafe-webgpu` on Chromium
  with SwiftShader Vulkan), or does it stay a manual check while WebGL2 is the CI target?
- Does the successor npm package keep the `@vizij/runtime` name (MAJOR, no bootstrap) or
  take a new one (manual first publish)? The same choice for a crates.io name if the app
  is ever published there.
- Should the strict visual gate move to a macOS/Metal runner, as in ros-viz-rs, once a
  second software-rasterised render (wasm) is in the comparison?
- Release signing/notarization for macOS (`codesign`, `notarytool`) and a Play-Store
  keystore are absent everywhere; whether direct-download installers are enough is an
  assumption the plan already flags.
