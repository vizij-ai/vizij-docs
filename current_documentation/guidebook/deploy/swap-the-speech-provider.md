<!-- tags: family=guidebook; type=guidebook-module; editorial_status=completed; publication_status=planned; topics=guidebook,deploy,ros4hri,speech,tts,visemes -->

> **Last updated:** 2026-09-10
> **Purpose:** choose which text-to-speech speaks for a deployed face, or bring your own, without touching the face

# Swap the Speech Provider

## Guidebook Context

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Integrate](../integrate/README.md)<br>Current: [Deploy](README.md)<br>Next: End of guidebook route |
| Depth ladder in this bucket | Above: [Easiest Standalone Deployment](easiest-standalone-deployment.md), [Operator and Deployment Model](operator-and-deployment-model.md), [Deployment Checks and Recovery](deployment-checks-and-recovery.md)<br>Current: `Advanced`<br>Below: none, this is the deepest current depth in this bucket |
| Module position in this bucket | Previous in bucket: [Hardware, ROS, and Multi-Screen Topologies](hardware-ros-and-multi-screen-topologies.md)<br>Current module: `Swap the Speech Provider`<br>Next in bucket: [Bring Your Own Visemes](bring-your-own-visemes.md) |
| Reference bridges | [vizij-rs: Speech (TTS)](https://github.com/vizij-ai/vizij-rs/blob/main/crates/vizij/README.md#speech-tts)<br>[vizij-rs: Skills](https://github.com/vizij-ai/vizij-rs/blob/main/docs/skills.md)<br>[vizij-rs: ROS4HRI support](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md) |
| Module type | operational guide |
| Bucket overview | [Deploy](README.md) |

## Reader Outcome

After this page, you can decide which text-to-speech engine speaks for a deployed `vizij` face — one of the two shipped providers, the cloud provider on a deployment of your own, or a provider you write — and verify from a ROS 2 shell that the lips follow whichever one you chose.

## Module Notes

- Read this when the shipped voice is not the one your deployment needs: another engine, your own cloud account, a language the shipped voices lack, or a system that already speaks and only needs its mouth animated.
- The page stays on the native device (`vizij`, the Rust app that renders a face over an Arora device). The web standalone lip-syncs by other means and is not covered here.
- It does not teach how the `say` skill drives the lips; [Skills](https://github.com/vizij-ai/vizij-rs/blob/main/docs/skills.md) does. What you need to know is stated in the next section.

## What You Need

1. [vizij-rs](https://github.com/vizij-ai/vizij-rs) checked out, with a Rust toolchain that builds `cargo build -p vizij`, and a face GLB that covers the face standard's viseme tier (`vizij-bundle validate --min-level 2` reports it; the repo's Quori face does).
2. For the ROS 2 check at the end: the device built with a ROS 2 backend (`--features ros2` for DDS, `--features ros2-zenoh` for rmw_zenoh) and a ROS 2 Jazzy shell on the same graph — the setup [ROS4HRI support](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md) walks through.

## How Speech Reaches the Lips

The device speaks through one function, `say(text, voice) → Status`, provided by a **provider**: a host module the device registers under a fixed function id. The `say` skill hosts that call in a task run and re-invokes it every tick while it reports `Running`. On each call the provider streams the **viseme at the audio playhead** — one of the face standard's fifteen shapes (`sil PP FF TH DD kk CH SS nn RR aa E ih oh ou`) — through a mutable `viseme` out-parameter, and the skill drives the face's lips from it, with the crossfade and the run feedback the face owns.

So the split is clean:

- the **provider** decides what is said, how the audio is produced and played, and which shape the mouth is making at each moment;
- the **face** decides what a shape looks like and how one blends into the next.

A build carries exactly one provider. Swapping the speech is choosing which module the binary registers; nothing in the face, the skill, or the ROS surface changes.

## Option 1 — Pick a Shipped Provider at Build Time

| Provider | Build | Voice | Visemes come from |
| --- | --- | --- | --- |
| Cloud (default) — AWS Polly behind Vizij's HTTP endpoint, no credentials in the app | `cargo run -p vizij -- --glb face.glb` | the `voice` call parameter names a Polly voice (default `Ruth`) | Polly's viseme speech marks |
| Piper — fully local, no network at run time | `cargo run -p vizij --features tts-piper -- --glb face.glb` | `PIPER_VOICE` / `PIPER_VOICE_CONFIG` environment variables; the `voice` parameter is ignored | espeak-ng phonemes, mapped to the standard shapes |

The first Piper build provisions everything itself (libpiper, a default English voice) into `~/.cache/vizij-piper`; it needs `cmake` and a C++ toolchain, and the network once. It links GPLv3 code, which the default build does not.

**Check:** the `say` example drives the provider exactly as the device does and prints the viseme stream as it advances:

```bash
cargo run -p vizij --example say -- "Hello, world!"
cargo run -p vizij --features tts-piper --example say -- "Hello, world!"
```

You hear the utterance, see `viseme:` lines change while it plays, and the run ends with `done`.

## Option 2 — Keep the Cloud Provider, Use Your Own Deployment

The cloud provider calls two HTTP endpoints. Host them on your own account — `POST /tts/get-audio` and `POST /tts/get-visemes`, body `{"voice", "text"}`, returning the audio bytes and Polly's viseme speech marks respectively — and point the app at the base URL:

```bash
API_URL=https://your-host/api cargo run -p vizij -- --glb face.glb
```

**Check:** the same `say` example, with `API_URL` set, speaks through your deployment.

## Option 3 — Write Your Own Provider

A provider is a host module implementing the `say` contract. The contract — the function id, its parameter ids and its described signature — ships in the [`vizij-arora-tts`](https://crates.io/crates/vizij-arora-tts) crate, so a provider references it without depending on the skill that hosts the call. What yours must do:

1. **Describe the function** under its own module id: `ModuleBuilder::new(MODULE_ID).described_function(SAY_ID, "say", say_signature(), say).build()`.
2. **Poll on tick.** `say` is called once per tick. The first call reads the text (`SAY_TEXT_PARAM_ID`) and the voice, and starts synthesis and playback off the tick thread; every call returns `task::running()` until the utterance ends, then `task::success()` (or `task::failure()`). The two shipped providers keep the live utterance in a `JoinHandle` they poll each call.
3. **Stream the viseme.** Every result carries the current shape as a mutated field on `SAY_VISEME_PARAM_ID`, one of the fifteen standard shapes; `sil` at rest and in the final result. Map your engine's phonemes or speech marks to the standard set — the cloud provider's `polly_shape` and the Piper provider's phoneme table are the two shipped examples.
4. **Audio is yours.** Play it however suits your deployment (the shipped providers use rodio), or do not play it at all: the contract is text in, status and visemes out. A provider that only produces visemes for text — for a system whose speech plays elsewhere — is a complete provider; the device's own test suite runs a scripted one.

That last point is the answer when your engine speaks but produces no visemes: the provider plays your engine's audio and derives the viseme stream from the text with a phonemizer of your choice, timed against the playhead. It is exactly what the Piper provider does with espeak-ng's phonemes.

**Where it plugs in today.** The `vizij` binary registers one provider, selected by a build feature: `tts-piper` swaps the cloud module for the Piper one, and `crates/vizij/src/tts_piper.rs` is the template (a module file, a `host_module()` constructor, the registration in `device.rs` behind the feature). Add yours the same way — a sibling module behind a feature that swaps the registration. The app exposes no library entry point to register a provider from outside the crate, so a third-party provider is a change to the `vizij` crate, not a plug-in.

**Check:** build the `say` example with your feature; then the device.

## Verify on the ROS Side

Whichever provider you built, the ROS surface is the same. Run the device under the ROS4HRI exposure (`--ros2 <namespace>`) and send ROS4HRI's speech skill a goal from a ROS 2 shell:

```bash
ros2 action send_goal /skill/say communication_skills/action/Say \
  "{meta: {priority: 128}, input: 'Hello, I am a talking face.'}" --feedback
```

The feedback streams `viseme:` and `intensity:` lines as the face speaks and the goal ends `SUCCEEDED`. The shapes you see are your provider's, timed by your provider; the face renders them. The `Say` definition with these two feedback fields is vendored in [`arora-msgs-ros2`](https://github.com/semio-ai/arora-sdk/tree/main/crates/arora-msgs-ros2), where the extension to the ROS4HRI standard is recorded.

## When It Does Not Work

| Symptom | Likely cause |
| --- | --- |
| no sound, cloud provider | the endpoint is unreachable; `API_URL` points elsewhere than your deployment |
| the first Piper build fails | `cmake` or a C++ toolchain is missing, or the one-time download had no network |
| the mouth stays shut, every viseme `sil` | your mapping table does not know the engine's codes (the shipped providers log an unknown code at `warn`) |
| the lips move but the ROS goal never reaches the device | the device and the shell are not on the same ROS graph; see the rmw_zenoh setup in [ROS4HRI support](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md) |

## Where This Leads

- [Bring Your Own Visemes](bring-your-own-visemes.md) — when the source of the mouth's motion is not a text-to-speech at all.
- [vizij-rs: Speech (TTS)](https://github.com/vizij-ai/vizij-rs/blob/main/crates/vizij/README.md#speech-tts) — the providers' setup in full.
- [vizij-rs: Skills](https://github.com/vizij-ai/vizij-rs/blob/main/docs/skills.md) — the `say` skill's run: envelope, feedback, exclusivity.
