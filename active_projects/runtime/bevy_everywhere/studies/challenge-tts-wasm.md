# The say provider carries a wasm32 branch under its unchanged contract: fetch synthesis, a page-owned playhead, and both viseme fragments run on the browser interpreter
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,speech,tts,visemes,wasm,browser,agent -->
> **Last updated:** 2026-09-16

> **Related documents:** [Central plan](../bevy_everywhere-plan.md) · [speech-and-agent](speech-and-agent.md) · [arora-wasm-constraints](arora-wasm-constraints.md) · [arora-sdk async-functions](https://github.com/semio-ai/arora-sdk/blob/main/docs/async-functions.md)

Compile-and-test spike: `scratchpad/spikes/tts-wasm/` (`src/lib.rs` the provider with
the cfg split, `tests/browser.rs` the wasm-bindgen tests, `tests/native.rs` the native
twin, `www/play.js` the page's playback callback, `logs/` the raw outputs). Registry
versions are vizij-rs's lock: arora 9.11.1 (arora-engine 4.1.0), reqwest 0.13.5,
tokio 1.53.1, wasm-bindgen 0.2.128.

## Findings

1. **`reqwest = { version = "0.13", features = ["json"] }` — the crate's declaration
   as it stands — compiles for `wasm32-unknown-unknown`, and `synthesize` ports
   unchanged.** reqwest's manifest puts the entire native stack (hyper, rustls,
   tokio, h2/h3, …) under `cfg(not(wasm32))` and pulls js-sys / wasm-bindgen /
   wasm-bindgen-futures / web-sys with only the `fetch` features on wasm
   (`reqwest-0.13.5/Cargo.toml:245-278, 287-441`); the default features
   (`default-tls`, `http2`, `system-proxy`) are inert there. `Client::new`, `post`,
   `json(&body)`, `send`, `error_for_status`, `bytes`, `json::<T>` all exist on the
   wasm client (`src/wasm/client.rs:51,76`, `request.rs:239`, `response.rs:92-177`).
   `cargo check --target wasm32-unknown-unknown`: clean, 0 warnings, 54 s on the
   warm arora-wasm target dir (`logs/check-wasm32.log`).
2. **Only the producer is native-bound, so the split is one module with two bodies.**
   tokio `rt-multi-thread` is the compile error on wasm (`tokio-1.53.1/src/lib.rs:470-479`),
   rodio's blocking loop and `Instant` are the rest. The spike keeps the contract,
   `synthesize`, the marks→shape mapper (`shape_at`), the run map and the `say` entry
   shared, and gates `platform::{Run, spawn, poll}` per target
   (`src/lib.rs`: `mod native` under `cfg(not(target_arch = "wasm32"))`, `mod web`
   under `cfg(target_arch = "wasm32")`). tokio and rodio move under
   `[target.'cfg(not(target_arch = "wasm32"))'.dependencies]`; the wasm side adds
   wasm-bindgen, wasm-bindgen-futures, js-sys, serde-wasm-bindgen and nothing else
   (`Cargo.toml`). The native branch checks clean too (`logs/check-native.log`,
   4 m 01 s cold).
3. **The wasm producer is `spawn_local` + a JS callback, and the tick only samples.**
   `spawn(config, …)` spawns a future that awaits `synthesize`, then calls the page's
   `play(Uint8Array, marks)` and keeps the `playhead()` function it returns in the
   run's `Rc<RefCell<Phase>>`; `poll` calls `playhead()` each tick — a number is the
   playhead in ms (mapped through `shape_at`), `null` ends the run in `Success`, a
   throw ends it in `Failure` (`src/lib.rs` `mod web`). The wasm binary carries no
   Web Audio binding: no `AudioContext` web-sys feature, no decode, no scheduling.
4. **The run map has to live in the module closure, not in a `static`.** A wasm run
   holds a `js_sys::Function`, which is `!Send`; a `static LazyLock<Mutex<HashMap<_, Run>>>`
   (the crate's current shape) requires `Run: Send` and does not compile. A
   `HostModule` function is `Box<dyn FnMut(Call) -> …>` with no `Send` bound
   (`arora-engine-4.1.0/src/module.rs:37`), so a `Provider { config, runs }` captured
   by the `described_function` closure is the map's home on both targets. Runs stay
   content-keyed (the ABI still carries no run id) but are now per module instance.
5. **`API_URL` becomes a constructor parameter on every target.** `Config { api_base }`
   replaces `std::env::var` (silently the default on wasm); on wasm `Config` also
   carries `play: js_sys::Function`. The device composition is the only caller that
   knows either.
6. **The `AudioContext` unlock is the page's, at the gesture that starts the session.**
   The provider's `say` runs inside device ticks — `requestAnimationFrame` or
   `AroraWeb::run`'s loop — and neither is a user-activation context, so a
   provider-side `resume()` would stay `suspended` under the autoplay policy. The
   page creates one context and calls `unlock()` from the click that also requests the
   microphone (the agent demo has that click anyway). `www/play.js` handles a still-
   suspended context: `playhead()` returns 0 until `statechange` reports `running`,
   so the lips wait with the audio (`Running` + `sil`), and playback starts on the
   context's own clock (`ctx.currentTime - startedAt`). A web-sys-inside-wasm design
   would need the same page-side unlock, which is why it is the larger option.
7. **Halting a say run reaches the provider only as silence.** The interpreter's halt
   prunes the fragment, so the provider's `say` stops being invoked; nothing in the
   module ABI tells it. Natively the tokio task plays the audio to its end; in the
   browser the scheduled source would too. `play.js` turns the missing poll into a
   stop: no `playhead()` call for 250 ms stops the source. The native producer needs
   the same last-poll rule in its playback loop for "interruption is the run's halt"
   (plan 3.4) to be true.
8. **The say fragment asks nothing of a provider beyond the poll-on-tick `Status` and
   the `viseme` out-parameter, once per tick, never after terminal.** `eval_task_run`
   dispatches `call_module_with_outputs`, latches a terminal status and re-emits it
   without calling again, and reads slot `mutated_0` = `record_keys[0]` =
   `SAY_VISEME_PARAM_ID` (`vizij-graph-core/src/eval/eval_node.rs:395-470`);
   dispatch is `CallBridgeFunctions::dispatch_full` → `arora_call`, the engine's
   synchronous in-process path (`vizij-arora-behavior/src/lib.rs:62-90`), the same
   on wasm. `device.rs:1221-1330` `a_say_run_streams_the_provider_s_visemes_to_the_lips`
   is that contract as a test: a scripted provider, 2 calls in 2 ticks, 5 in all,
   none after `Success`.
9. **The play_viseme fragment runs on `ProcessingGraph` natively in a plain `cargo test`.**
   PENDING_DEVICE The spike's `tests/native.rs` `play_viseme_runs_on_the_native_interpreter`
   runs the same fragment over a two-node passthrough base graph with no HAL:
   PENDING_NATIVE. The players need the store and the interpreter, nothing else.
10. **Both fragments run on the browser interpreter, in Chrome, headless.**
    `wasm-pack test --headless --chrome` (`logs/wasm-pack-test-chrome.log`):
    PENDING_WASM. `play_viseme_runs_on_the_browser_interpreter` mirrors the native
    assertions (aa > 0.8 after 0.2 s, `sil` and `Success` after 0.65 s);
    `say_streams_the_visemes_at_the_page_s_playhead` spawns `say("hello")` on the wasm
    provider with a scripted synthesizer (still awaited through `spawn_local`) and a JS
    `play` whose playhead advances 40 ms per poll and returns `null` after 260 ms: the
    audio bytes and marks reach JS after one microtask yield, `PP` at 0–40 ms, `aa`
    once the playhead passes the 100 ms mark, `sil` at 200, `Success` after `null`,
    the playhead polled exactly once per tick (8 polls) and never after.
11. **The alternative — `say` native-only, a JS lipsync producer driving
    `play_viseme(shape, weight)` — costs a spawn per mark and keeps the JS producer
    alive.** `play_viseme` is an exclusive 480 ms envelope (attack 80 / hold 250 /
    release 150 ms, `vizij-arora-host/src/skills.rs:108-110`) spawned through
    `call()` → SPAWN as JSON; Polly marks arrive every ~50–120 ms, so each mark
    preempts the previous run (a crossfade takeover, `viseme.rs:35-43`) rather than
    the say driver's continuous stream, and one JSON round trip per mark rides the
    device's step. It keeps `useSpeechPlayback` + `visemeMapping` + `poseUtils` +
    `pollyApi` (974 lines) or the tutorial's aligner path (`useVisemeMouth` +
    `audioManager`, 1,132 lines) as the lipsync owner, and `speaking` stays a JS fact
    instead of a run status.

## Questions answered

**T1 — The cfg split, and where the unlock happens.** Shared: contract re-exports,
`polly_shape`, `SpeechMark`, `synthesize` (reqwest, target-independent), `shape_at`,
`Config`, `host_module`, the `Provider` with its content-keyed run map, `say`'s
argument parsing and result shaping. Native: `Run { JoinHandle<Value>, Arc<Mutex<&str>> }`,
a tokio task for the fetch, `spawn_blocking` for rodio, the viseme cell advanced at
`Sink::get_pos()` (rodio 0.20.1 `sink.rs:351`; compiles, `logs/check-native.log`),
`Future::poll` with `Waker::noop()`. wasm32: `Run { Rc<RefCell<Phase>> }` with
`Fetching | Playing { playhead, marks, next, current } | Ended(Value)`, a `spawn_local`
future for fetch + `play(...)`, `playhead.call0()` per tick. The unlock is in the page,
in the gesture handler that opens the session; the callback design keeps every Web Audio
concern (context, decode, scheduling, suspended-state wait, idle stop) in `play.js`
(findings 2–7).

**T2 — What compiles, what needed cfg.** wasm32: clean (finding 1). Native: clean
(finding 2). The cfg needed: the two `[target]` dependency sections, `mod native` /
`mod web`, the `play` field of `Config`, and a scripted-synthesizer seam that is
wasm-only (an `Rc` future cannot cross onto the tokio runtime). The `HostModule`
registration through `arora::ModuleBuilder` with `arora = { default-features = false }`
compiles on both targets; `compose()` registers the say and play_viseme fragments,
routes `SAY_ID` to the provider's module id, and mounts the viseme and tts host modules
— the browser twin of `device.rs:365-400`.

**T3 — The fragments' expectations, native and wasm.** Nothing beyond `Status` +
`mutated[viseme]` per tick (finding 8). Native `cargo test`: the product's own
device.rs tests and the spike's twin (finding 9). wasm: the two wasm-bindgen tests
above (finding 10); the runner is `wasm-pack test --headless --chrome`, which
downloaded a wasm-bindgen CLI matching the lock (0.2.128; the installed one is
0.2.104) and a chromedriver matching Chrome 152 on first run.

**T4 — Which is simpler, which honors "the device keeps say".** For a one-page demo
the JS producer is fewer new Rust lines (zero) but not less work: the pose-id viseme
map and the Polly cursor stay, the `speaking` state stays JS, and every mark is a
SPAWN. The wasm branch is ~150 lines of Rust behind cfg plus an ~80-line `play.js`,
and it makes the browser demo run the same `say` the native app runs — acceptance
criterion 5 ("lips driven by the viseme players from the same fragment") is only met
by it. The JS producer honors "the device keeps play_viseme", not "the device keeps say".

## Evidence

### The provider, piece by piece

| Piece | Shared / native / wasm | Where |
|---|---|---|
| `say` contract, `polly_shape`, `SpeechMark`, `shape_at`, run map, `say` entry | shared | `src/lib.rs` top level |
| `synthesize` (two POSTs, mp3 + marks) | shared — reqwest fetch on wasm | `src/lib.rs`; `reqwest-0.13.5/src/wasm/*` |
| Producer: tokio task + `spawn_blocking` + rodio, `Sink::get_pos()` | native | `src/lib.rs` `platform::native` |
| Producer: `spawn_local` + `play(bytes, marks)` → `playhead()` | wasm | `src/lib.rs` `platform::web` |
| Web Audio: context, unlock, decode, schedule, suspended wait, idle stop | page (JS) | `www/play.js` |
| Configuration: `api_base`, `play` | constructor | `Config` |
| Registration + fragments | shared | `compose()`, `viseme_host_module()` |

### Commands and results

| Check | Command (in the spike dir) | Result |
|---|---|---|
| wasm32 provider + composition | `CARGO_TARGET_DIR=…/arora-wasm/target cargo check --target wasm32-unknown-unknown` | clean, 0 warnings, 54 s (`logs/check-wasm32.log`) |
| native provider + tests build | `CARGO_TARGET_DIR=…/arora-wasm/target-host cargo check --tests` | clean, 4 m 01 s cold (`logs/check-native.log`) |
| native tests (unit + play_viseme) | `… cargo test` | PENDING_NATIVE_TABLE (`logs/test-native.log`) |
| product device.rs tests | `cd vizij-rs && … cargo test --locked -p vizij --lib -- device::tests::a_play_viseme_run… a_new_play_viseme_run… a_say_run…` | PENDING_DEVICE_TABLE (`logs/test-vizij-device-native.log`) |
| browser tests | `… wasm-pack test --headless --chrome` | PENDING_WASM_TABLE (`logs/wasm-pack-test-chrome.log`) |
| fragment unit tests (prior study) | `cargo test -p vizij-arora-behavior -p vizij-arora-host --lib` | 4 + 5 pass (`spikes/speech-and-agent/test-behavior-host.log`) |

### The JS playback contract (`www/play.js`)

`createPlayback()` → `{ play, unlock, context }`. `play(bytes: Uint8Array, marks:
{time, value}[]) → playhead: () => number | null`: `0` while decoding or while the
context is suspended, ms since `source.start()` afterwards, `null` once `onended` or
stopped; a decode failure is rethrown from `playhead()`. A 250 ms poll gap stops the
source. The provider passes the marks as plain objects (`serde_wasm_bindgen`); the
page never needs them except to display.

### Files read

- vizij-rs: `crates/interop/vizij-arora-tts/{Cargo.toml,src/lib.rs}`,
  `crates/interop/vizij-arora-behavior/src/{speech.rs,viseme.rs,lib.rs}`,
  `crates/interop/vizij-arora-host/src/skills.rs`, `crates/interop/vizij-arora-web/{Cargo.toml,src/lib.rs,tests/proof.rs}`,
  `crates/vizij/src/{device.rs,viseme.rs}`, `crates/node-graph/vizij-graph-core/src/eval/{eval_node.rs,node_function.rs}`,
  `Cargo.lock`, `.github/workflows/ci.yml`.
- arora-sdk: `docs/async-functions.md`. Registry: `arora-9.11.1`, `arora-engine-4.1.0/src/module.rs`,
  `arora-web-6.1.0/src/lib.rs`, `arora-behavior-8.4.0/src/{interpreter_module.rs,task.rs}`,
  `reqwest-0.13.5`, `tokio-1.53.1/src/lib.rs`.
- vizij-web (line counts only): `packages/@vizij/speech-react/src/**`, `apps/tutorial-agent-face/src/{hooks/useVisemeMouth.ts,utils/audioManager.ts}`.

## Implications for the target picture

- **Section 3.4 holds, with the callback returning a playhead function.** The provider
  hands the page `{audioBytes, marks}` and receives `playhead()`; it never reads
  `AudioContext.currentTime` itself. The page's clock is still the viseme clock — it
  is read through the function. `Config { api_base, play }` is the constructor the
  section calls "API_URL becomes a constructor parameter".
- **One crate, two producers.** The branch belongs in `vizij-arora-tts` under
  `[target]` sections, not in a sibling crate: contract, `synthesize`, mapper and run
  map are shared, and the crate already declares reqwest in the form that works.
- **The module closure owns the run map.** The `static RUNS` goes; each mounted
  provider owns its runs. The native clock moves to `Sink::get_pos()` in the same pass.
- **The browser device's composition is `compose()`**: `set_function_modules(SAY_ID →
  tts module)`, `set_task_fragment` for say and play_viseme with the face's rig prefix,
  `with_host_module` for the viseme and tts modules — what `vizij-arora-web::start`
  lacks today (`lib.rs:105-117`) and what `vizij-device` unifies with `device.rs:365-400`.
  `start()` gains the page's `play` callback and the rig prefix.
- **A halt must stop the audio on both targets.** A last-poll timestamp in each
  producer (250 ms idle → stop) is the rule until the ABI carries a halt; without it
  the agent's interruption stops the lips and not the voice.
- **The demo runs the device's `say`.** The JS lipsync producer is retired as the
  plan proposes; the audio-agent shape (`tutorial-agent-face`) keeps its aligner
  because it has no text to hand to `say`, and stays the second shape, not the demo.

## Implications for the plan

1. **P3's TTS item is confirmed feasible at S size**: the cfg split (~150 Rust lines
   in `vizij-arora-tts`), `play.js` (~80 lines) shipped with `@vizij/runtime`, the
   registration in `start()`. Land it before P4's demo work.
2. **Add the two wasm-bindgen tests to `vizij-arora-tts`** (`tests/browser.rs` here is
   the draft) and run them in CI with `wasm-pack test --headless --chrome`; ci.yml
   runs no browser test today, and `vizij-arora-web/tests/proof.rs` is likewise
   unrun. CI needs Chrome and a wasm-bindgen CLI pinned to the lock (0.2.128).
3. **Risk 4 ("the say fragment's `taskrun` on the browser interpreter is unverified")
   is retired** by finding 10; the open technical questions "reqwest's wasm backend
   with the crate's features" and "the `AudioContext` user-gesture unlock" are
   answered by findings 1 and 6.
4. **Write the idle-stop rule into both producers** with the branch, and state in
   `docs/skills.md` that a halted say run goes silent within 250 ms.
5. **The publish prerequisite stands**: the crate chain (tts 2.0.0, behavior 1.1.0,
   host 2.1.0) is on main and unpublished (S:speech-and-agent 24); the wasm branch is
   a MINOR of `vizij-arora-tts` on top of it.
6. **`@vizij/runtime` 3.0's `start()` signature carries the playback callback**;
   document `createPlayback()` and the unlock rule on the guidebook's integrate page.

## Open questions

- **Real audio, real fetch, headless.** The tests script the synthesizer and the
  playhead; a Playwright smoke with `--autoplay-policy=no-user-gesture-required`
  against the cloud function would close the last gap (decode of the mp3, `onended`,
  CORS of `get-audio`/`get-visemes` from a page — the web demo already calls both).
- **Run identity.** Content-keyed runs collide when an agent repeats itself
  (S:speech-and-agent open questions); unchanged by the branch, and an arora-sdk
  ABI question.
- **Halt in the ABI.** Whether arora's module ABI gains a halt/abandon notification,
  which would replace the idle-stop heuristic on both targets.
- **Decode latency accounting.** `decodeAudioData` of a whole mp3 precedes the first
  audible sample; the run reports `Running`/`sil` meanwhile, so lips and audio stay
  aligned, but the agent sees a longer "speaking" than the audio's length by that
  much.
- **Where `play.js` ships.** With `@vizij/runtime` (proposed) or inside the demo app;
  the former makes `say` work for every consumer of the browser device.
