<!-- tags: family=guidebook; type=guidebook-module; editorial_status=completed; publication_status=planned; topics=guidebook,deploy,ros4hri,visemes,lipsync -->

> **Last updated:** 2026-10-10
> **Purpose:** drive a deployed face's mouth from a lipsync source of your own, and know which entry point keeps which responsibility

# Bring Your Own Visemes

## Guidebook Context

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Integrate](../integrate/README.md)<br>Current: [Deploy](README.md)<br>Next: End of guidebook route |
| Depth ladder in this bucket | Above: [Easiest Standalone Deployment](easiest-standalone-deployment.md), [Operator and Deployment Model](operator-and-deployment-model.md), [Deployment Checks and Recovery](deployment-checks-and-recovery.md)<br>Current: `Advanced`<br>Below: none, this is the deepest current depth in this bucket |
| Module position in this bucket | Previous in bucket: [Swap the Speech Provider](swap-the-speech-provider.md)<br>Current module: `Bring Your Own Visemes`<br>Next in bucket: none, this is the last module in the bucket sequence |
| Reference bridges | [vizij-rs: ROS4HRI support](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md)<br>[vizij-rs: Skills](https://github.com/vizij-ai/vizij-rs/blob/main/docs/skills.md)<br>[vizij-rs: the face standard's visemes](https://github.com/vizij-ai/vizij-rs/blob/main/docs/face-standard.md#visemes) |
| Module type | comparison |
| Bucket overview | [Deploy](README.md) |

## Reader Outcome

After this page, you can feed a deployed `vizij` face's mouth from a lipsync source that is not its own text-to-speech — weights another node publishes, a per-viseme call, a ROS4HRI viseme stream, or a generator working from text — and choose the entry point by which responsibilities you want to keep (timing, crossfade, the reported state) and which you want the face to keep.

## Module Notes

- Read this when the visemes exist, or can be made, outside the device: a speech stack of your own, an animation tool, a phoneme aligner, a text-only generator.
- The page compares four entry points and states which of them a plain ROS 2 client can reach today.
- It does not cover choosing the speech engine behind the device's own `say`; that is [Swap the Speech Provider](swap-the-speech-provider.md).

## What You Need

1. The `vizij` device running a face that covers the face standard's viseme tier (`vizij-bundle validate --min-level 2`), under `--ros2 <namespace>` for the ROS 2 options, as [ROS4HRI support](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md) sets it up. The examples below use the repo's Quori face, `vizij --ros2 quori`.
2. A ROS 2 Jazzy shell on the same graph.

## Four Entry Points

The face's lips are fifteen weights, one per shape of the face standard's viseme set, at `standard/vizij/viseme/<shape>` — raw values a face maps onto its own poses, scaled by its lipsync gain, with no transition of its own. Everything about lipsync is who writes those weights and when.

| Entry point | You provide | The face provides | Reachable from |
| --- | --- | --- | --- |
| **the weights themselves** | the sequence, the timing, the envelope and the crossfade | the shape-to-pose mapping | any ROS 2 publisher, on one topic per shape |
| **`play_viseme(shape, weight, duration)`**, one call per viseme | the sequence and its timing | the envelope (80 ms in, held for `duration` or 250 ms, 150 ms out), the crossfade, the exclusivity, the reported state and feedback | a behavior or a Rust caller as a task run; the synthesized ROS action exists but its interface is not a ROS package yet |
| **a ROS4HRI viseme stream**, `hri_msgs/Viseme` on `/tts/viseme` | each viseme's shape, place in the utterance and duration | a `play_viseme` run per viseme, and everything that run provides | any ROS 2 publisher holding the message definitions |
| **`say(text, voice)`** through a provider of yours | text, and the provider turning it into visemes (audio optional) | the run, the lips, the feedback, ROS4HRI's `/skill/say` | ROS4HRI's `/skill/say` action, behaviors |

## Option 1 — Publish the Weights

Under `--ros2`, every viseme weight is a **free input** of the composition — a key the face's graphs read and nothing on the device writes — so the bridge subscribes one topic per shape, as a `std_msgs/msg/Float64`:

```
/<namespace>/keys/rig/<faceId>/standard/vizij/viseme/<shape>
```

The topic carries the face id: the face's own rig reads the weights under its prefix, `rig/<faceId>/…`, which is where a viseme player writes them too. List them to confirm the fifteen are there:

```bash
ros2 topic list | grep standard/vizij/viseme/
```

Then open the mouth on `aa` and hold it, then release it (with the device running as `vizij --ros2 quori`; `--once` waits for the device's subscription before it sends):

```bash
ros2 topic pub --once /quori/keys/rig/quori_latest/standard/vizij/viseme/aa \
  std_msgs/msg/Float64 "{data: 1.0}"
ros2 topic pub --once /quori/keys/rig/quori_latest/standard/vizij/viseme/aa \
  std_msgs/msg/Float64 "{data: 0.0}"
```

What this entry point means:

- **The store keeps the last value.** One message holds a shape until the next one; a producer with speech marks publishes each shape's rise and fall itself.
- **The weights are raw.** Nothing smooths them on the way to the rig, so attack, hold, release and the crossfade between shapes are your producer's. Rest is every weight at zero, `sil` included — `sil` is a shape a player writes at zero, not a switch to turn on.
- **Do not run a player at the same time.** A `play_viseme` or `say` run drives every one of the fifteen weights each tick from its own smoother and would overwrite yours until it ends.
- **The state stays at rest.** `standard/vizij/viseme`, the current shape a player reports for subtitles and mirrors, is written by the players only. With weights published and no player run, its own topic is not published, and the device-wide `/robot_face/viseme` stays at `sil`.

**Check:** the device publishes the controls its graphs write, so watch a mouth control of the face move with the weight — on Quori:

```bash
ros2 topic echo /quori/keys/rig/quori_latest/pose/control/propsrig_mouth_jawud_value
```

The bridge does not publish the weight topics themselves back (it refuses to echo a key it subscribes to), so watch the control, not the weight.

## Option 2 — Call `play_viseme` Per Viseme

When you want the face's envelope and crossfade rather than your own, call the `play_viseme(shape, weight)` skill once per viseme: each call plays its shape through the lipsync envelope — about half a second, a spoken viseme's span — and a new call takes the lips over, the previous run ending as preempted. `sil` plays rest. The run reports the current shape and its intensity as feedback and writes the `standard/vizij/viseme` state, so anything that follows speech follows this too.

It is a described device method, so a behavior calls it like any module function and a bridge spawns it as a task run (a `TaskHandle` with the run's status, feedback and update keys). A producer with speech marks — a phoneme aligner, a speech stack's viseme events — calls it at each mark.

**The ROS boundary today:** the bridge synthesizes an action server for it, `/<namespace>/actions/play_viseme` (`arora/action/play_viseme`, goal `shape`, `weight` and `duration`), and it is discovered on the graph; but that interface is not a ROS package, so `ros2 action send_goal` cannot build its goal until the definitions are generated for the client ([VIZ-121](https://linear.app/semio-ai/issue/VIZ-121)). From a ROS 2 node, stream the visemes instead (Option 3): the device plays each one through `play_viseme`.

## Option 3 — Stream ROS4HRI Visemes

When a speech stack of yours aligns its audio to lip shapes, publish each viseme as it plays:
- one `hri_msgs/Viseme` at a time on `/tts/viseme`;
- or an `hri_msgs/Visemes` on `/tts/visemes`, whose first viseme is the one at the audio playhead.

These are the topics and message shapes the ROS4HRI TTS nodes in the field publish. Upstream `hri_msgs` has no viseme message; arora-msgs-ros2 carries the definitions, and its README records the departure.

A viseme carries three fields:
- `value`: its code in the 15-shape set, `0` for `SIL`.
- `time`: seconds into the utterance.
- `duration`: seconds the shape is held.

The bridge lands all three on the device's `standard/ros4hri/viseme` keys in one change. The ROS4HRI mapping then spawns a `play_viseme` run of that shape at full weight, held for `duration` (the default envelope when `duration` is 0):
- **A new viseme takes the lips over**, crossfading from the shape before.
- **A new `time` plays a repeated shape again**, so two consecutive `PP` are two visemes.
- **Each message is the shape at the playhead.** The device plays a viseme when it arrives: your publisher owns the timing, and a `Visemes` message lands its first viseme only.

**Check:** the face reports what it plays on the device-wide state topic:

```bash
ros2 topic echo --qos-reliability best_effort /robot_face/viseme
```

## Option 4 — Visemes From Text

When what you have is text — no text-to-speech, or one that produces no visemes — write a `say` provider: the device's `say(text, voice)` contract is text in, status and a viseme stream out, and audio is the provider's own business, played or not. That keeps ROS4HRI's `/skill/say` as the entry point and the face's run driving the lips, with your generator behind it. [Swap the Speech Provider](swap-the-speech-provider.md), Option 3, states the contract and where a provider plugs in.

## What Is Not Wired

PAL's text lipsync topic, `/robot_face/tts`, is not served: text reaches the lips through `/skill/say` only, whose run synthesizes the speech and drives the mouth. `standard/ros4hri/speech/text` runs the other way: it carries what the face is saying, published on `/robot_face/speech`.

## Where This Leads

- [Swap the Speech Provider](swap-the-speech-provider.md) — the `say` contract, and a provider that produces visemes for text.
- [vizij-rs: Skills](https://github.com/vizij-ai/vizij-rs/blob/main/docs/skills.md) — the two viseme players, their envelope and feedback.
- [vizij-rs: ROS4HRI support](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md) — driving a key from ROS 2, and speaking through the standard skill.
