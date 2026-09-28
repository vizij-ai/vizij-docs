# What vizij-standalone is made of, and what the Bevy app already replaces
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,standalone,tauri,android,bevy,studio-bridge,ws-bridge -->
> **Last updated:** 2026-09-28
> **Related documents:** [Central plan](../bevy_everywhere-plan.md)

Paths are repo-relative: `standalone/` = `vizij-web/apps/vizij-standalone/`,
`vizij/` = `vizij-rs/crates/vizij/`, `arora/` = `arora-sdk/crates/arora/`,
`ws/` = `arora-sdk/crates/arora-bridge-ws/`. Registry sources are the versions
the standalone locks (`Cargo.lock`: arora 9.11.1, arora-bridge-ws 4.0.0); the
arora-sdk checkout's `studio/` module is byte-identical to the published 9.11.1
(`diff` empty). Raw outputs:
[vizij-rs `spikes/bevy-everywhere/standalone-anatomy/`](https://github.com/vizij-ai/vizij-rs/tree/spikes/bevy-everywhere/spikes/bevy-everywhere/standalone-anatomy)
(branch `spikes/bevy-everywhere`; the `.txt`/`.out` names below are relative to
it).

## Findings

1. **The Tauri host runs two Arora devices.** The webview runs the face's own
   graphs in wasm (`VizijRuntimeProvider driveRuntime`, `standalone/src/App.tsx:273-278`)
   and holds the canonical store; the Rust side builds a second `arora::Arora`
   (no HAL) over a `SimpleDataStore` with the gaze module, the `vizij-arora-tts`
   module, the ROS4HRI-profile interpreter carrying the `look_at` fragment, and
   the WS (+ optional ROS 2) bridges (`standalone/src-tauri/src/lib.rs:659-708`,
   `skills.rs:23-30,50-65`). The two stores are stitched by IPC: webview →
   `publish_values` (`lib.rs:1260-1273`), store → `update-values` event
   (`lib.rs:1594-1617`).
2. **The mirror is change-driven, coalesced at 50 ms, not a 10 Hz poll.** The
   webview seeds one full `getStoreSnapshot()` then forwards `subscribeToStoreChanges`
   deltas, skipping `arora/*` and `vizij/animations/out`
   (`standalone/src/hooks/useWebSocketSync.ts:346-417`). `README.md:98` and the
   `lib.rs:1252-1258` comment still describe an interval push.
3. **Nine WS-registry methods are app methods, not device methods:** `reset`,
   `mute_microphone`, `get_mic_muted`, `speak`, `interrupt`, `transport/list|play|pause|stop`
   (`lib.rs:303-485`). They emit Tauri events into the webview. The WS bridge
   hands the run only `Update`/`Get` (`ws 4.0.0 src/bridge.rs:50-85`); `invoke`
   dispatches to the server registry (`ws src/server.rs:570-576`). The described
   device methods (`look_at`, `say`) are unreachable over WS in both apps; only
   the ROS 2 bridge binds `look_at` as an action.
4. **arora's auto-attached local bridge is inert for writers and serves no
   control panel.** `arora::local_ws_bridge()` uses `ServerConfig::default()`
   (`arora 9.11.1 src/run.rs:108-133`): port 9000, loopback, `validate_paths: true`,
   `serve_control_panel: false` (`ws src/server.rs:40-49`), and nothing in arora
   or `vizij/` populates the registry (grep: no `set_keys`/`register_method`).
   Wire check (`ws-default-writes.out`):
   `list_keys` → `[]`, `list_methods` → `[]`, `write_values` →
   `"Unknown input path(s)"`, `invoke reset` → `Method not found`, HTTP `GET /`
   → connection reset. The plan's "HTTP control panel arora-bridge-ws already
   serves" does not hold for the Bevy app as built.
5. **The standalone's WS server binds loopback too.** `ServerConfig::with_port`
   keeps `127.0.0.1` (`ws src/server.rs:53-58`); `lib.rs:1500-1505` never sets
   `bind_address`. `README.md:69` ("from another machine or a phone") and the
   `http://<ip>:port` log (`lib.rs:1673-1678`) are wrong; `README.md:125` is right.
6. **The Studio bridge lives outside the run, on its own thread**, sharing the
   store (`lib.rs:1051-1166,970-1049`, `host.rs:1-10`). Inbound `Update`/`Get`/
   `ListKeys` are served from the store; `ListMethods`/`DescribeMethods` answer
   empty; `Call` errors (`host.rs:22-84`). Studio cannot call device methods on
   the standalone; in the Bevy app the Studio bridge is inside the run.
7. **The standalone duplicates arora's token storage under different paths.**
   Same XSalsa20Poly1305 `nonce||ciphertext` scheme (`lib.rs:831-922` vs
   `arora src/studio/token_storage.rs`), stored at
   `app_local_data_dir/studio_refresh_token{,.key}` instead of arora's
   `<exe dir|home|cwd>/.semio/arora/{key,refresh_token}` (`arora src/studio/app_data_files.rs:24-57`).
   Owners persist in `studio_owners.json` (`lib.rs:781-808`); the device name
   `vizij-<8 chars>` is regenerated every launch (`lib.rs:810-824,1568`).
8. **The Bevy `--studio` flow has no prompt and no persistence of owners.**
   `vizij/src/device.rs:155-161` calls `arora::studio::connect()` (env-only:
   `DEVICE_OWNERS`, `DEVICE_NAME`, … — `arora src/studio/mod.rs:168-182,274-299`);
   with nothing set, no `DeviceInfo` is registered at all. arora's operator
   prompt (`connect_with_operator`, `mod.rs:113-145`) runs only from
   `AroraBuilder::run` when no bridge was injected (`arora src/lib.rs:413-422`),
   and the app always injects the local bridge (`device.rs:121-124`). The seam
   exists: `arora::operator::Operator` and `studio::connect_with_operator` are
   public (`arora src/lib.rs:21,29`; `operator.rs:86-89`).
9. **Android gets a GLB three ways, all through the webview's file plugin:** a
   VIEW intent copied by `MainActivity` to `<filesDir>/opened_model.glb`
   (`gen/android/.../MainActivity.kt:26-41`, manifest intent filters `:26-48`)
   and read by `get_glb_source` under `cfg(target_os = "android")`
   (`lib.rs:1283-1291`, the only Android cfg in the code); the SAF picker
   (`tauri-plugin-dialog`) whose `content://` URI `plugin-fs` reads; and the
   saved copy `appLocalDataDir/model.glb` + `model.json` (`src/lib/modelStore.ts`).
   Manifest permissions: `INTERNET` only (`AndroidManifest.xml:3`); minSdk 24,
   target/compile 36 (`app/build.gradle.kts:27-33`); ABIs universal/arm64/arm/x86/x86_64.
10. **The Android build is `--no-default-features --features studio-bridge`**
    (`.github/workflows/android.yml:79-82,288`); ros2 is dropped (rustdds). Its
    normal-dependency closure on `aarch64-linux-android` is 775 crates
    (483 without studio-bridge): zenoh 1.9.0, rustls 0.23.42 with **both** ring
    0.17.14 and aws-lc-rs 1.17.1/aws-lc-sys 0.42.0 (via arora-studio-bridge-client,
    hyper-rustls/reqwest, quinn), firestore 0.49.0, gcloud-sdk 0.30.1, tonic 0.14.6,
    hyper 1.8.1, reqwest 0.13.2, rustls-platform-verifier(-android), tokio 1.49,
    tauri 2.10.3/wry 0.54.2; no wasmtime, no openssl
    (`tree-android-studio-bridge.txt`, `closure-sizes.txt`).
11. **The Bevy crate pulls arora's `native`+`tui` defaults, which the standalone
    deliberately avoids for Android.** `vizij/Cargo.toml:32` (`arora = "9.10"`,
    default features) → wasmtime 45.0.3, cranelift, ratatui, crossterm on every
    target, 866 crates on `aarch64-linux-android`, 1137 with `studio`
    (`tree-vizij--target_aarch64-linux-android.txt`, `tree-vizij_studio--target_aarch64-linux-android.txt`).
    The standalone's `arora = { default-features = false }` exists "so the
    Android targets stay buildable" (`standalone/src-tauri/Cargo.toml:20-24`).
    `vizij/` has no `android`/`wasm32` mention anywhere; ros-viz-rs ships
    `android/` and `web/` recipes.
12. **`@vizij/speech-react` exists only for the standalone.** Sole dependent
    (grep of every `package.json`); its README names the standalone as the
    reference and validation target (`packages/@vizij/speech-react/README.md:52,121`).
    `hooks/aroraWsProtocol.ts` is the app-local remnant of the retired
    `@vizij/arora-types`; `packages/@vizij/arora-types/` and `apps/vizij-ws-app/`
    are untracked leftovers (only `node_modules` / one `.gitignore`).
    `@tauri-apps/*` appear in no other app. Everything else the standalone
    imports is shared (Evidence, table C). Semio Studio references neither.
13. **Nothing but android.yml exercises the standalone in CI.** `ci.yml` has no
    cargo job; the Rust unit tests (`skills.rs:67-166`, `lib.rs:1795-1964`) run
    only by hand. The emulator smoke asserts a window and a WebView only
    (`AppLaunchTest.kt:30-57`).
14. **Docs drift in `README.md`:** `ros2` called a default feature (`:35,:382`)
    while `Cargo.toml` has `default = []`; "10 Hz" (`:98`); remote-reachable
    control panel (`:69`); the control panel "exposes transport controls" (`:75`)
    while `control_panel.html` invokes only `reset` (`ws src/control_panel.html:792-802`).
15. **Four Tauri commands have no caller:** `stop_ws_server`, `get_port`,
    `get_web_port`, `read_glb_file` (`lib.rs:1774-1790` vs `grep invoke src/`).
    Three emitted events have no listener: `ws:started`, `ws:stopped`,
    `studio-bridge:error` (`lib.rs:627,722,946,1154`).
16. **The standalone's native `say` is lip-less.** `vizij_arora_tts::host_module()`
    is registered (`lib.rs:662`) but the interpreter carries only the `look_at`
    fragment (`skills.rs:28`); the module's viseme out-parameter is mapped by
    "the caller" (`vizij-arora-tts 1.0.0 src/lib.rs:12-16`). Speech with lips is
    the browser pipeline behind the `speak` WS method.

## Questions answered

**Q1 — What the Tauri host does.** One `arora` run per host start (finding 1),
built on thread `arora-device` with its own tokio runtime and stopped by a child
cancel token (`lib.rs:636-719`); `set_slots` rebuilds it when the catalog changes
(`lib.rs:1234-1246`). Lifecycle: `start_host` registers the WS methods, wraps the
process-wide `AroraWSServer` in a `WsBridge`, binds with 20×100 ms retries, spawns
the serve loop (`lib.rs:574-727`); `stop_host` cancels and joins (`:730-748`);
setup starts it and the webview retries via `start_ws_server` (`:1650-1658`,
`App.tsx:206-220`). Tauri commands (`lib.rs:1774-1790`): `start_ws_server`,
`stop_ws_server`, `is_ws_running`, `get_port`, `get_web_port`, `set_slots`
(advertise catalog to the WS registry → `list_keys` + write allow-list, seed
defaults, rebuild run), `publish_values`, `get_glb_source`, `read_glb_file`,
`get_speech_keys`, `set_mic_muted_state`, `set_transport_catalog`,
`studio_bridge_owner_status`, `studio_bridge_set_owners`, `get_endpoints`. Events
Rust→webview: `reset`, `mute-microphone`, `speak`, `interrupt-speech`,
`animation-play|pause|stop`, `program-play|pause|stop`, `update-values`,
`ws:started`, `ws:stopped`, `studio-bridge:error`. WS-registry methods: finding 3.
Store→webview pump: finding 1 (built-in `arora/*` keys filtered). Studio owner
flow: precedence `DEVICE_OWNERS` env (also persisted) → `studio_owners.json` →
prompt (`lib.rs:1543-1586`); owner changes travel a `watch` channel and
re-register live under the same name (`lib.rs:1027-1043`); access requests are
auto-allowed (`host.rs:93-109`); `DeviceInfo` = name, `model_family "Vizij"`,
`software_version "vizij-standalone-0.1.0"`, owners (`lib.rs:760-769`); token
persistence: finding 7. Transport catalog: the webview diffs animations/programs
every 200 ms and pushes `set_transport_catalog` (`App.tsx:414-491`); `transport/list`
returns it as a JSON string (`lib.rs:416-442`). Mic mute: `AppState.mic_muted`
starts `true` (`lib.rs:1638`), set by `mute_microphone` (`:344`) and by the
webview from `!speech.listening` (`:1349`, `App.tsx:608-612`). CLI (`lib.rs:150-236`):
`--log-level`, `-p/--port 9000`, `--no-web-control`, `-g/--glb <path|url>`,
`-f/--fullscreen`, `-d/--display`, `-W/--width 800`, `-H/--height 600`,
`--no-decorations`, `--always-on-top`, `--deepgram-key`, `--openai-key`,
`--api-url`, `--auto-mic`, `--speech-mode`, `--silence-ms`, `--ros2-domain-id 0`
and `--ros2-namespace vizij` (feature `ros2`), subcommand `list-displays`
(desktop, `tao`). Env fallbacks incl. `VITE_*` and a `.env` via `dotenvy`
(`lib.rs:1455,1509-1538`; `src-tauri/.env` is untracked, `.env.example` tracked).
Window placement is `cfg(desktop)` (`lib.rs:1684-1770`). Features: `default = []`,
`ros2`/`ros2-dds`/`ros2-zenoh`, `studio-bridge` (`Cargo.toml`).

**Q2 — What the React side does.** `main.tsx` mounts `App` plus the
`StudioOwnerPrompt` overlay. `App.tsx`: model sources = CLI `get_glb_source`
(URL → url bundle; path → `plugin-fs` bytes) else the saved model (`:158-201`);
screens = loading / error ("Try Another File") / no model ("Open GLB/GLTF File",
`EndpointsPanel`, `--glb` tip, `:222-269`) / face; native dialog via
`@tauri-apps/plugin-dialog` filtered to gltf/glb, then `saveModel` (`:122-155`);
background color per model in `localStorage` (`:20-41`); tap anywhere toggles
the "Back" and "Switch model" controls (`:618-657`); DEV-only settings panel
(background input, endpoints, runtime status/errors, face id, constraint/output/
transport counts, FPS, speech status, per-clip and per-program Play/Pause/Stop,
`:659-868`); mic button when the bundle has `speechConfig` and keys are set
(`:870-893`); DEV-only Debug button (`:895-936`); Settings screen (current model,
open file, background, `:938-982`); autoplay of the bundle's active motion graph
(`:350-381`); speech overrides from `get_speech_keys` (`:313-339`).
`useWebSocketSync`: lower-cased `faceId`; local defaults from `inputConstraints`;
`set_slots` once ready with de-aliased input paths typed `f64` with min/max/default
(`:209-250`); `update-values` → short rig paths become numeric `setInput("rig/{faceId}/…")`,
anything else `setInput` verbatim (`:264-309`); `reset` → defaults (`:311-330`);
the outbound mirror (finding 2). `useSpeechController` wraps `@vizij/speech-react`
(Deepgram STT, OpenAI chat, Polly-via-`API_URL` playback): keys from CLI → env →
localStorage (`:112-175`), enabled iff the bundle carries `speechConfig`, mode
`echo|conversation` (`:196`), writes `/speech/speaking`, `/speech/user_speaking`,
`/speech/thinking` rig inputs (`:198-203,369-397`), emotion poses from a pose
group folded into the LLM prompt (`:205-230,326-340`); exposes `listening`,
`toggleMic`, `setMicMuted`, `speak`, `interrupt`, `status`. `lib/modelStore.ts`:
`appLocalDataDir/model.glb` + `model.json {fileName, savedAt}`. `hooks/aroraWsProtocol.ts`:
`AroraType` + `NodeInfo` for `set_slots`. `EndpointsPanel` polls `get_endpoints`
every 3 s and lists WS/ROS 2/Studio plus the `@vizij/runtime` `skills()` registry.
`StudioOwnerPrompt`: modal for Firebase UID(s); Skip/Escape persists `[]`.

**Q3 — Android.** Findings 9–11. Warm-start VIEW intents are captured but not
reloaded (`MainActivity.kt:18-24`). No `RECORD_AUDIO` permission is declared, so
the in-app STT cannot capture on Android (inferred from the manifest; not run).
`usesCleartextTraffic` is true only in debug (`build.gradle.kts:30,50`). The
local build recipe (memory note `vizij-standalone-android-build`) was verified
without `--features studio-bridge`; the studio-bridge closure adds aws-lc-sys,
a cmake/NDK C build, which CI (NDK r26d) does compile.

**Q4 — Parity matrix.** Evidence, table B.

**Q5 — Packages.** Finding 12 and table C.

**Q6 — Studio flow coverage.** Findings 7, 8. The Bevy app covers token
persistence (arora's) and env-driven owners; it does not cover the owner prompt,
owner persistence, the per-launch generated name, or the endpoints readout. On
Android, arora's app-data discovery (exe dir → `$HOME` → cwd) is unverified.

## Evidence

**A. Where each concern lives in the standalone**

| Concern | Standalone | Notes |
|---|---|---|
| Native device | `lib.rs:659-708`, `skills.rs` | no HAL; ROS4HRI profile + `look_at` fragment |
| Webview device | `App.tsx:273-278`, `@vizij/runtime-react` | canonical store, drives the face |
| Store seam | `publish_values` `:1260`, `update-values` `:1594` | finding 2 |
| WS server | `lib.rs:1500-1505,574-629` | loopback, control panel unless `--no-web-control` |
| ROS 2 | `lib.rs:665-702` (feature) | inputs from webview catalog as `Float64` |
| Studio | `lib.rs:1051-1166`, `host.rs` | own thread, outside the run |
| Speech | `useSpeechController.ts`, `@vizij/speech-react` | browser only |
| Model persistence | `modelStore.ts` | app-private copy, all platforms |

**B. Parity: standalone vs `vizij` (Bevy)**

| Feature / flag | Standalone | Bevy `vizij` | Status |
|---|---|---|---|
| `--glb <path>` | path or URL (`lib.rs:1482-1495`) | path, required (`main.rs:36-38`) | same (URL: missing in Bevy) |
| Native open-file dialog | `plugin-dialog` (`App.tsx:122`) | none; TUI `g` prompt for a path (`device.rs:472-478`) | missing in Bevy |
| Remembered last model | `modelStore.ts` | none | missing in Bevy |
| Switch model at runtime | Settings screen | TUI `g` rebuilds the device (`device.rs:441-540`) | same |
| Background color | per-model, persisted | `--background`, TUI `b` (`main.rs:56`, `device.rs:563`) | same (persistence missing) |
| `--fullscreen --display --width --height --no-decorations --always-on-top`, `list-displays` | `lib.rs:172-195,1684-1770` | none; window = face aspect at 720 px (`main.rs:233-258`) | missing in Bevy |
| `-p/--port`, catalog on WS registry, write allow-list | `lib.rs:1210-1232` | fixed 9000, empty registry, writes rejected (finding 4) | missing in Bevy |
| Web control panel / `--no-web-control` | served on the WS port | not served (finding 4) | missing in Bevy |
| WS `reset`, `mute_microphone`, `get_mic_muted`, `interrupt` | registry methods | none | obsolete by design |
| WS `speak` | browser TTS pipeline | `say` device method + say skill (`vizij/README.md:102-157`) | present in Bevy, other plane |
| WS `transport/*` | registry methods over Tauri events | animation module functions (`device.rs:391`), `--program`, `--no-autoplay` | obsolete over WS; present as device functions |
| `look_at` skill | described, ROS 2 action | same, plus `/skill/say`, `play_viseme` | same (Bevy superset) |
| ROS 2 (`ros2`/`ros2-dds`/`ros2-zenoh`) | `--ros2-domain-id`, `--ros2-namespace` | `--ros2 [ns][:domain]`, `--no-ros4hri`, face image | same (Bevy superset) |
| Studio: connect, token | own copy of arora's scheme (finding 7) | arora's (`studio/token_storage.rs`) | same |
| Studio: owner prompt + persistence | in-UI modal, `studio_owners.json` | env only (finding 8) | missing in Bevy |
| Studio: device name | `vizij-<random>` per launch | `DEVICE_NAME` or unregistered | both weak |
| Studio: method plane | none (`host.rs:61-73`) | inside the run | present only in Bevy |
| Endpoints panel | `EndpointsPanel.tsx` | none | missing (minimal UI accepted) |
| STT/LLM (`--deepgram-key --openai-key --speech-mode --auto-mic --silence-ms`) | `@vizij/speech-react` | none | obsolete by design |
| Mic mute state | `AppState.mic_muted` | none | obsolete by design |
| Two stores + mirror | yes | one store | obsolete by design |
| `--headless --snapshot --size --frame-rate --frame-format --frame-id --fit --zoom --ambient --unlit --graphs --no-stage-neutral` | none | `vizij/README.md:41-59` | present only in Bevy |
| Local Piper TTS (`tts-piper`) | none | feature | present only in Bevy |
| Android APK, VIEW intent, SAF, CI | yes (findings 9–10) | no target, no recipe in-crate | missing in Bevy (gate) |
| Desktop installers | Tauri bundler `targets: "all"` (`tauri.conf.json:24-27`); no CI job builds them | none | missing (not a gate) |
| Logging | `--log-level`, `tauri-plugin-log` | TUI log pane / `env_logger` | same |

**C. vizij-web dependency sharing (grep of every `package.json`)**

| Package | Consumers besides the standalone |
|---|---|
| `@vizij/speech-react` (workspace) | none |
| `@tauri-apps/api`, `plugin-dialog`, `plugin-fs`, `plugin-log`, `cli` | none |
| `@vizij/runtime-react` | demo-vizij-player, tutorial-fullscreen-face, tutorial-agent-face, vizij-authoring, vizij-showcase, speech-react |
| `@vizij/render` | vizij-authoring, vizij-showcase, runtime-react, speech-react |
| `@vizij/runtime` (npm) | vizij-authoring, runtime-react |
| `@vizij/node-graph-authoring`, `@vizij/node-graph-react`, `@vizij/node-graph` | demo-graph-studio, vizij-authoring, minimal demos, runtime-react |
| `@vizij/value-json` (npm) | 8 others |
| `@vizij/utils` | 11 others |
| `three`, `@react-three/fiber`, `@react-three/drei` | showcase, both tutorials, render |

**D. Closure sizes (`cargo tree --locked -e normal`, unique crates)**

| Crate / features | host | aarch64-linux-android |
|---|---|---|
| standalone, none | 497 | 483 |
| standalone, `studio-bridge` | 786 | 775 |
| standalone, `ros2` | 572 | 560 |
| `vizij`, none | 868 | 866 (wasmtime, ratatui, android-activity) |
| `vizij`, `studio` | 1144 | 1137 (arora-studio-bridge-client 6.1.0, zenoh 1.10.1, aws-lc-sys 0.45.0) |

## Implications for the target picture

- The "minimal operator UI" desktop story needs the local bridge to be usable:
  registry populated with the device's keys and a `reset`-class method, the
  control panel enabled, and a bind-address choice. None of this is in
  `arora::local_ws_bridge()` today (finding 4); it is a small arora change or a
  `vizij`-side `ServerConfig`.
- Android needs what the standalone gets from Tauri for free: a file picker, a
  persisted model copy, a VIEW intent, an owner prompt with persistence, and an
  app-private data directory for arora's token. arora's `Operator` trait is the
  seam for the prompt (finding 8); its app-data discovery is not Android-shaped.
- arora's `native` default (wasmtime + dynamic-library hosts) and `tui` ride
  into every `vizij` target (finding 11). The standalone proves the portable
  slice suffices for a device without wasm modules; the Bevy app registers
  everything as host modules and needs neither host either.
- The `say` contract is already the Bevy app's speech plane; the standalone's
  browser pipeline, `speak`, mic mute, and `@vizij/speech-react` retire with it.
- The "agent + Vizij" browser demo has a precedent in `tutorial-agent-face`
  (Gemini Live over `@vizij/runtime-react`), not in the standalone.

## Implications for the plan

- Add to the desktop workstream: make the local WS bridge writable and serve the
  control panel (arora `ServerConfig` + registry mirror of the device's inputs).
  Without it "the HTTP control panel arora-bridge-ws already serves" is false.
- Add to the Android workstream: an Android target for `vizij` (ros-viz-rs
  `android/` recipe), trimming arora to `default-features = false` + what the
  app uses, aws-lc-sys/cmake in the NDK build, an in-app owner prompt through
  `Operator`, and an Android-writable token location (`IDENTITY_FILE` exists;
  the key path does not have an override, `mod.rs:203-207`).
- The retirement checklist for vizij-web: delete `apps/vizij-standalone`,
  `packages/@vizij/speech-react`, the `dev:vizij-standalone` script and
  `scripts/check-snap-env.mjs`, `.github/workflows/android.yml`, and the
  untracked leftovers `packages/@vizij/arora-types/`, `apps/vizij-ws-app/`.
- Fix or drop the README drift (finding 14) if the standalone lives on past
  the gate.

## Open questions

- Does `dirs::home_dir()` / `current_exe().parent()` give arora a writable
  directory on Android? Unverified; the standalone uses Tauri's
  `app_local_data_dir()` instead.
- Is `WebView` speech capture on Android intended at all? The manifest has no
  `RECORD_AUDIO`; nothing documents this.
- Does `arora-bridge-ws` 5.0.0 (unreleased into either app) change the
  empty-registry write rejection? Its `process_message` keeps the same check.
- Who, if anyone, connects to the Bevy app's `ws://127.0.0.1:9000` today? No
  vizij-web app sends `write_values`.
