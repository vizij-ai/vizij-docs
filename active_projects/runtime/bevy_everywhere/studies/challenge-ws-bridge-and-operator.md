# The local WS bridge, the operator seam and the file dialog: what arora's public API already gives the vizij binary
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,ws-bridge,arora,operator,studio-bridge,rfd,desktop,android -->
> **Last updated:** 2026-09-16

> **Related documents:** [Central plan](../bevy_everywhere-plan.md)

Paths are repo-relative: `arora/` = `arora-sdk/crates/arora/`, `ws/` =
`arora-sdk/crates/arora-bridge-ws/`, `ros2/` = `arora-sdk/crates/arora-bridge-ros2/`,
`vizij/` = `vizij-rs/crates/vizij/`. Line numbers are those of the published
sources vizij-rs locks (`Cargo.lock`: arora 9.11.1, arora-bridge-ws 4.0.0,
arora-bridge 4.1.0, arora-types 2.5.1, arora-studio-bridge-client 6.1.0). The
spike that backs findings 1, 3, 4 and 6 is a native cargo project at
`scratchpad/spikes/ws-operator/` (its run log: `logs/ws-operator-run.out`).

## Findings

1. **A usable local bridge is a vizij-side change; no arora change is
   needed.** Everything `arora::local_ws_bridge()` does is public in
   arora-bridge-ws: `AroraWSServer::new(ServerConfig)`,
   `ServerConfig::with_port(p).bind_address(a).serve_control_panel(true)`
   (`ws/src/server.rs:27-78`), `server.registry().set_keys(..)` and
   `register_method_fn(..)` (`ws/src/registry.rs:59-113`),
   `WsBridge::new(server).await` (`ws/src/bridge.rs:47-91`), `server.bind()`
   and `server.run_on(listener, cancel)` (`server.rs:191-212`).
   `local_ws_bridge` (`arora/src/run.rs:108-133`) adds only a private
   `LocalBridge` wrapper whose `Drop` cancels the server (`run.rs:139-181`,
   forty lines to copy). The spike builds exactly that around a real
   `Arora` (`Arora::builder().with_data_store(..).with_bridge(..).build()`,
   `arora.run(Arora::DEFAULT_STEP_PERIOD)`) with two input keys and a `reset`
   method; on the wire: `list_keys` → both keys with kind/type/min/max/default,
   `list_methods` → `reset` and `ping`, `write_values` on a registered key →
   `success: true` then a `values_changed` push with the value, `read_values`
   → the value, `write_values` on an unregistered key →
   `"Unknown input path(s)"` (`validate_paths` stays on), `invoke reset` →
   `success: true` then a push carrying every default, `GET /` →
   `HTTP/1.1 200 OK` with the 26,245-byte `control_panel.html`
   (`<title>Arora Control</title>`).
2. **The WS bridge forwards only `Update` and `Get` to the run; `invoke`
   never leaves the server.** `WsBridge::new` registers the write and read
   handlers and nothing else (`ws/src/bridge.rs:54-85`); `process_message`
   answers `Invoke` from `registry.invoke_method` and `ListKeys`/`ListMethods`
   from the registry (`server.rs:570-576, 560-568`). Holds in 4.0.0, on
   arora-sdk `main` (arora 9.11.1 / ws 4.0.0) and on the checkout branch
   `feat/arora-97-arora-types` (arora 10.0.0 / ws 5.0.0), whose `ws/src` is
   byte-identical to 4.0.0 (`diff -r` empty: a version bump). No remote branch
   carries a `BridgeOp::Call` in `ws/src/bridge.rs`.
3. **A registry method reaches the run through the public `LocalCaller`.**
   `Arora::caller()` (`arora/src/lib.rs:206-260`, after `build()`, before `run()`)
   yields a `Clone + Send` caller; `Caller::call(&self, Call) -> CallFuture<'_>`
   enqueues before returning. The registry handler is synchronous
   (`Fn(HashMap<String, Value>) -> InvokeResult`, `registry.rs:17-30`), so the
   handler clones the caller into a task that awaits the reply (`CallFuture`
   borrows the caller) and answers `invoke_resp` with "accepted". Spike: `invoke
   ping` → `{"success":true,"value":{"str":"accepted"}}`, then the device's
   reply `Ok(CallResult { ret: String("pong (0 args)") })` on the task. The
   call's result cannot ride `invoke_resp` without an async handler in
   arora-bridge-ws (finding 5).
4. **The registry's keys can only come from vizij.** `BridgeOp::ListKeys`
   enumerates set paths without types (`arora/src/runtime.rs:318-334`); the
   WS `KeyInfo` (kind `input`, `value_type`, `min`, `max`, `default_value`,
   `ws/src/key.rs`) is what `validate_paths` checks (`registry.rs:86-95`).
   vizij already computes the face's free inputs with their types for the
   ROS 2 bridge (`free_inputs`, `vizij/src/device.rs:175-225`); feeding them to
   `set_keys` is the same list.
5. **Mirroring described methods generically belongs in arora-bridge-ws;
   mirroring the two known skills by hand is vizij-side.** `DescribeMethods`
   returns `Vec<MethodSignature>` (`module_id`, `id`, `name`, `Function` with
   parameter names, ids and frozen types; `arora-bridge/src/lib.rs:64-73`,
   `runtime.rs:350-378`); `Function::parameter_id(name)`
   (`arora-types/src/record/module.rs:155-161`) maps WS name-keyed `args` to
   `StructureField` ids. A `Status`-returning method (the ROS 2 bridge's
   action rule, `ros2/src/actions.rs:1-40,144`) is not called but spawned:
   `interpreter_module::encode_spawn(&call, RunPolicy::Concurrent)`
   (arora-behavior 8.4.0 `interpreter_module.rs:92-110`, public). Discovery
   needs a stepping device, so it runs after `take_inbound`, the way the ROS 2
   bridge's `discover` does (`ros2/src/bridge.rs:657-704`). In arora-bridge-ws
   this needs: a discovery task in `WsBridge::new`, a `FrozenTy` → `Type`
   mapping for `MethodParam`, and an async registry handler
   (`Registry::invoke_method` is already `async`, `registry.rs:138-150`, so
   `process_message` does not change). In vizij the same for `look_at`
   (`gaze::look_at_id()`, `look_at_signature()`,
   `vizij-arora-behavior/src/gaze.rs:31-33,73-103`) and `say`
   (`vizij_arora_host::skills::SAY_ID`, `say_signature()`) is two
   `register_method_fn` calls over a `LocalCaller` (finding 3).
6. **A connected WS client receives the clock at step rate.** Over 500 ms of
   idle the spike counts 59 `values_changed` pushes, all carrying only
   `arora/time` and `arora/dt`. This is the runtime's contract
   (`runtime.rs` test `the_clock_is_forwarded_outbound`: "a consumer that does
   not want it says so on its own side", `runtime.rs:1676-1720`); `WsBridge::try_send`
   does not filter (`bridge.rs:132-143`). The standalone filters `arora/*` in its mirror
   (S:standalone-anatomy 2). The `LocalBridge`-shaped wrapper of finding 1 is
   where vizij strips built-ins before delegating `try_send`.
7. **The Operator seam works from a bridge-injecting binary.**
   `studio::connect_with_operator(operator: &dyn Operator) -> Result<Option<Box<dyn Bridge>>>`
   is public (`arora/src/studio/mod.rs:113-145`), as are `Operator`
   (`ask_text(&self, label, required) -> Option<String>`,
   `decide_access(&self, &AccessRequestSummary) -> AccessRuling`,
   `arora/src/operator.rs:86-95`), `Frontend { operator, interactive, on_ready }`
   (`operator.rs:148-167`) and `AroraBuilder::with_frontend`
   (`lib.rs:381-384`). `AroraBuilder::run` resolves `studio::default_bridge`
   only when no bridge was injected (`lib.rs:406-423`), so a binary calls
   `connect_with_operator` itself. A custom `Frontend` also owns logging:
   `default_frontend` is what installs `env_logger` (`operator.rs:171-181`).
8. **arora persists no owner and regenerates the device name per launch.**
   `resolve_owners`: `DEVICE_OWNERS` else `ask_text(OWNER_LABEL, false)`;
   name: `DEVICE_NAME` else prompt else `arora-device-<random>`
   (`studio/mod.rs:304-357`; the suffix hashes the process id, so it differs
   every launch). The prompt labels are private constants: an `Operator`
   tells the owner prompt from the name prompt only by label text. The path
   that needs no `Operator` for registration: `studio::connect().await?` (it
   registers nothing when no `DEVICE_*` env var is set, `mod.rs:168-186,274-302`) then
   `bridge.update_device_info(Some(DeviceInfo { name, owners, .. })).await`
   (`Bridge::update_device_info`, public). Persistence of owners and name is
   the binary's file either way.
9. **Access requests are served for the first injected bridge only, and no
   bridge yields any today.** `run_builder_with_frontend` reads
   `get_device_info`, `device_id` and `access_requests` from
   `builder.bridges.first_mut()` (`run.rs:248-256`); vizij attaches the local
   bridge first (`device.rs:121-122`), so under `--studio` the front end's
   identity is the WS bridge's `None`. arora-studio-bridge-client 6.1.0 has no
   `AccessRequest` (grep empty), so every bridge uses the never-yielding
   default (`arora-bridge/src/lib.rs`). Bridge order matters once it does.
10. **Token and key files: `IDENTITY_FILE` exists, a key-path override does
    not, and the directory discovery is host-shaped.** `ensure_app_data_dir()`
    picks the first writable of the executable's directory, `$HOME`, the
    current directory, then `.semio/arora/` under it
    (`studio/app_data_files.rs:24-57`); key at `<dir>/key`, token at
    `IDENTITY_FILE` or `<dir>/refresh_token` (`studio/mod.rs:203-206`). A
    token moved by `IDENTITY_FILE` still needs `<dir>/key`. No writable
    directory fails `build_studio_bridge` ("could not create app data
    directory"). `dirs::home_dir()` on Android is `$HOME` alone (dirs-sys 0.5
    `lib.rs:33-42`: no passwd fallback); the executable's directory is the
    APK's native-library directory.
11. **rfd 0.16 on macOS: `AsyncFileDialog` is the one that fits a Bevy
    system; `FileDialog` blocks the schedule.** `FileDialog::pick_file` runs
    `NSOpenPanel runModal` on the main thread through `run_on_main`
    (`rfd/src/backend/macos/file_dialog.rs:18-30`, `utils.rs:20-31`): inline
    from the main thread (a nested modal loop; no Bevy frame until the panel
    closes), dispatched and awaited from any other thread (requires
    `NSApp.isRunning`, which winit 0.30.13 sets by `app.run()`,
    `winit/src/platform_impl/macos/event_loop.rs:299,332,365`). It panics
    off-main when the app is not running. `AsyncFileDialog::pick_file` →
    `ModalFuture::new` (`modal_future.rs:38-124`): with a running `NSApp` and
    a window it opens a sheet (`begin_modal` + completion block) and returns a
    `Send` future; rendering continues. The constructor must run on the main
    thread (`MainThreadMarker::new_unchecked`); a Bevy system taking
    `NonSendMarker` (bevy_ecs 0.19.1 `system_param.rs:1284-1285`) is pinned
    there; the future is then polled from a system
    (`futures_lite::future::poll_once`) or a task pool. `set_parent(&window)`
    (`file_dialog.rs:96`) attaches the sheet to the Bevy window. rfd's
    platform table lists Linux, Windows, macOS, wasm32 (`rfd/src/lib.rs:110-119`):
    no Android backend.

## Questions answered

- **Q1 — usable local bridge without an arora change?** Yes (finding 1).
  arora 9.11.1 + arora-bridge-ws 4.0.0 + arora-bridge 4.1.0, all from the
  registry, no missing public API. The one convenience an arora change would
  add is a `local_ws_bridge_with(ServerConfig)` returning the server handle,
  so the wrapper is not copied.
- **Q2 — registry mirror and `invoke`.** The WS bridge does not forward
  `Call` in 4.x, on `main`, or on the 5.0.0 branch (finding 2). Keys: vizij
  populates `set_keys` from `free_inputs` (finding 4). `reset`: vizij
  registers it, writing the neutral stage through its sibling store handle
  (spike: the write fans out as `values_changed`). `look_at`/`say`: reachable
  today with a vizij-side `register_method_fn` per skill over a `LocalCaller`
  and `encode_spawn` (findings 3, 5). Generic discovery of described methods
  and a result-carrying `invoke_resp` are an arora-bridge-ws change (finding
  5). The built-in clock filter is vizij's wrapper or an arora-bridge-ws
  change (finding 6).
- **Q3 — Operator from a binary that injects bridges.** Yes (finding 7).
  Sequence, with the real signatures:

  ```rust
  // device.rs, attach_bridges, under `studio`
  let operator: Arc<dyn arora::operator::Operator> = Arc::new(gui_operator);
  // pub async fn connect_with_operator(operator: &dyn Operator)
  //     -> Result<Option<Box<dyn Bridge>>>
  match arora::studio::connect_with_operator(&*operator).await {
      Ok(Some(studio)) => builder = builder.with_bridge(studio), // first, for the front end
      Ok(None) => log::info!("Studio declined (no owner)"),
      Err(e) => log::error!("studio bridge: {e:?}"),
  }
  builder = builder.with_bridge(local_bridge);
  let frontend = arora::operator::Frontend {
      operator,
      interactive: true,
      on_ready: Box::new(|_: Subscription, _: Option<DeviceInfo>, _: Option<String>| {}),
  };
  // pub fn with_frontend(self, Frontend) -> Self; pub async fn run(self) -> Result<()>
  builder.with_frontend(frontend).run().await
  ```

  `ask_text` is awaited on the device thread before `build()`; a GUI
  operator answers it from the Bevy thread over a channel, as the TUI does
  through its prompt queue (`arora/src/tui/mod.rs:137-160`). Persisting
  owners and the name is vizij's file; the `connect()` +
  `update_device_info` path needs no `Operator` for registration (finding 8).
  Files: `<exe dir | $HOME | cwd>/.semio/arora/{key, refresh_token}`;
  `IDENTITY_FILE` moves the token only; no key override (finding 10).
- **Q4 — rfd 0.16 from a Bevy system on macOS.** `AsyncFileDialog`, created
  in a `NonSendMarker` system, polled elsewhere; `FileDialog` works but
  freezes the view for the dialog's duration (finding 11).

## Evidence

- Spike: `scratchpad/spikes/ws-operator/` (`Cargo.toml`, `src/main.rs`,
  `logs/ws-operator-run.out`; `CARGO_TARGET_DIR` inside). Port 9124. It
  asserts every wire reply listed in finding 1, the `LocalCaller` round trip
  of finding 3, and the idle-feed count of finding 6.
- `arora/src/run.rs:108-181` (`local_ws_bridge`, `LocalBridge`),
  `run.rs:238-300` (`run_builder_with_frontend`).
- `ws/src/{server.rs,bridge.rs,registry.rs,handlers.rs,messages.rs,key.rs,method.rs}`
  at 4.0.0; `diff -r` against the checkout's `ws/src` empty; branch scan:
  `git show <branch>:crates/arora-bridge-ws/src/bridge.rs | grep BridgeOp::Call`
  empty for every remote branch.
- `arora/src/lib.rs` (`Arora::caller`, `LocalCaller`, `AroraBuilder::{with_bridge,with_frontend,run}`),
  `arora/src/runtime.rs:290-378` (`apply_command`), `:498-545` (flush, no
  built-in filter), `:1676-1720` (test `the_clock_is_forwarded_outbound`).
- `arora/src/operator.rs`, `arora/src/studio/{mod.rs,app_data_files.rs,token_storage.rs}`.
- `ros2/src/bridge.rs:657-704` (`discover`), `ros2/src/actions.rs:1-40,144`,
  `ros2/src/services.rs:146-157` (`call_of`).
- `vizij/src/device.rs:113-163,175-225` (`attach_bridges`, `free_inputs`),
  `vizij/src/gaze.rs`, `vizij-arora-behavior/src/gaze.rs:26-103`.
- `rfd-0.16.0/src/{lib.rs:79-86,110-119, file_dialog.rs, backend/macos/{file_dialog.rs,modal_future.rs,utils.rs}}`,
  `winit-0.30.13/src/platform_impl/macos/event_loop.rs:278-365`,
  `bevy_ecs-0.19.1/src/system/system_param.rs:1284-1290`,
  `dirs-sys-0.5.0/src/lib.rs:33-42`.

## Implications for the target picture

- Section 3.5's "through arora's `ServerConfig`" is right and needs no arora
  release: the binary owns the server (port, bind address, control panel),
  the registry (inputs from `free_inputs`, `reset`, the two skills) and a
  wrapper that cancels the server on drop and strips `arora/*` from pushes.
- The registry mirror is static per face generation: keys change when a face
  is loaded (`LoadFace`), so `set_keys` runs on every rebuild, and the
  `LocalCaller` is re-taken from each new device (it is obtained after
  `build()`). The methods registered by hand are the described skills the
  binary already knows; anything a bundle adds later is invisible over WS
  until arora-bridge-ws discovers methods itself.
- `invoke` over WS is fire-and-forget until arora-bridge-ws gains an async
  handler; a client wanting a `look_at` outcome watches the run's status keys
  on `values_changed`, as the ROS 2 action plane does.
- The Studio bridge goes first in the bridge list so the front end and the
  access-request loop see it.
- Registration without an `Operator` (`connect()` + `update_device_info`)
  is the simpler desktop and Android shape: one prompt owned by the app,
  one file for owners and name, no label matching. The `Operator` stays for
  `decide_access` once the Studio client yields requests.
- Android: the token directory discovery has no writable candidate unless
  `$HOME` is set; both the key and token paths need to be settable, so
  section 3.6's "an override for the key path is an arora change" widens to
  "the app-data directory, or both paths, must be injectable".
- The open-file dialog is `AsyncFileDialog` from a main-thread system;
  Android keeps its Kotlin SAF picker (rfd has no Android backend).

## Implications for the plan

- **P0.4** splits. Vizij-side (P5, no arora dependency): the hand-built local
  bridge with `ServerConfig`, the registry mirror, `reset`, the built-in
  filter, Studio first in the bridge list. arora-sdk (P0, optional for the
  desktop gate): `local_ws_bridge_with(ServerConfig)`; the key-path /
  app-data-dir override (needed before P6.2); the generic method mirror and
  async `invoke` in arora-bridge-ws (a follow-up, not a gate). The TTS
  playhead item stays as is.
- **P5**: `AsyncFileDialog` in a `NonSendMarker` system raising `LoadFace`;
  `--studio` through `connect()` + `update_device_info` with a persisted
  owners/name file, `connect_with_operator` only where a prompt-driven flow
  is wanted.
- **P6.2**: the owner prompt does not need an `Operator` either; the arora
  change the phase depends on is the token/key path injection (finding 10).
- The spike's assertions are the shape of a `vizij` integration test for the
  local bridge (a client over the wire against a built device), cheap to keep.

## Open questions

- Does the arora-bridge-ws method mirror become generic (DescribeMethods
  discovery, async `invoke_resp`) before or after the standalone retires?
  It is not on the retirement path.
- Should `WsBridge::try_send` drop `arora/*` itself, or is the per-consumer
  filter the intended contract for every bridge (the ROS 2 bridge publishes
  them as topics)?
- `$HOME` inside an Android app process, and whether `NativeActivity`
  exposes the private files directory to Rust without JNI, decide the shape
  of the arora path override (a directory, or two paths).
- The Studio client's access requests: when `arora-studio-bridge-client`
  yields them, the front end's `decide_access` must reach the Bevy UI; the
  channel shape is the same as the owner prompt's.
