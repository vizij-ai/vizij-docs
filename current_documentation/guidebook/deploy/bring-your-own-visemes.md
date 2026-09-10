<!-- tags: family=guidebook; type=guidebook-module; editorial_status=completed; publication_status=planned; topics=guidebook,deploy,ros4hri,visemes,lipsync -->

> **Last updated:** 2026-09-10
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

After this page, you can feed a deployed `vizij` face's mouth from a lipsync source that is not its own text-to-speech — a topic another node produces, a per-viseme call, or a generator working from text — and choose the entry point by which responsibilities you want to keep (timing, crossfade, the reported state) and which you want the face to keep.

## Module Notes

- Read this when the visemes exist, or can be made, outside the device: a speech stack of your own, an animation tool, a phoneme aligner, a text-only generator.
- The page compares three entry points and states which of them a plain ROS 2 client can reach today.
- It does not cover choosing the speech engine behind the device's own `say`; that is [Swap the Speech Provider](swap-the-speech-provider.md).

## What You Need

1. The `vizij` device running a face that covers the face standard's viseme tier (`vizij-bundle validate --min-level 2`), under `--ros2 <namespace>` for the ROS 2 options, as [ROS4HRI support](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md) sets it up. The examples below use the repo's Quori face, `vizij --ros2 quori`.
2. A ROS 2 Jazzy shell on the same graph.

## Three Entry Points

The face's lips are fifteen weights, one per shape of the face standard's viseme set, at `standard/vizij/viseme/<shape>` — raw values a face maps onto its own poses with no transition of its own. Everything about lipsync is who writes those weights and when.

| Entry point | You provide | The face provides | Reachable from |
| --- | --- | --- | --- |
| **the weights themselves** | the sequence, the timing, the envelope and the crossfade | the shape-to-pose mapping | any ROS 2 publisher, on one topic per shape |
| **`play_viseme(shape, weight)`**, one call per viseme | the sequence and its timing | the envelope (80 ms in, 250 ms hold, 150 ms out), the crossfade, the exclusivity, the reported state and feedback | a behavior or a Rust caller as a task run; the synthesized ROS action exists but its interface is not a ROS package yet |
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
- **The state key stays silent.** `standard/vizij/viseme`, the current shape a player reports for subtitles and mirrors, is written by the players only; with weights published and no player run, its topic is not even published.

**Check:** the device publishes the controls its graphs write, so watch a mouth control of the face move with the weight — on Quori:

```bash
ros2 topic echo /quori/keys/rig/quori_latest/pose/control/propsrig_mouth_jawud_value
```

The bridge does not publish the weight topics themselves back (it refuses to echo a key it subscribes to), so watch the control, not the weight.

## Option 2 — Call `play_viseme` Per Viseme

When you want the face's envelope and crossfade rather than your own, call the `play_viseme(shape, weight)` skill once per viseme: each call plays its shape through the lipsync envelope — about half a second, a spoken viseme's span — and a new call takes the lips over, the previous run ending as preempted. `sil` plays rest. The run reports the current shape and its intensity as feedback and writes the `standard/vizij/viseme` state, so anything that follows speech follows this too.

It is a described device method, so a behavior calls it like any module function and a bridge spawns it as a task run (a `TaskHandle` with the run's status, feedback and update keys). A producer with speech marks — a phoneme aligner, a speech stack's viseme events — calls it at each mark.

**The ROS boundary today:** the bridge synthesizes an action server for it, `/<namespace>/actions/play_viseme` (`arora/action/play_viseme`, goal `shape` and `weight`), and it is discovered on the graph; but that interface is not a ROS package, so `ros2 action send_goal` cannot build its goal until the definitions are generated for the client ([VIZ-121](https://linear.app/semio-ai/issue/VIZ-121)). From a ROS 2 node, use Option 1 meanwhile.

## Option 3 — Visemes From Text

When what you have is text — no text-to-speech, or one that produces no visemes — write a `say` provider: the device's `say(text, voice)` contract is text in, status and a viseme stream out, and audio is the provider's own business, played or not. That keeps ROS4HRI's `/skill/say` as the entry point and the face's run driving the lips, with your generator behind it. [Swap the Speech Provider](swap-the-speech-provider.md), Option 3, states the contract and where a provider plugs in.

## What Is Not Wired

ROS4HRI's lipsync input is a text topic: `/robot_face/tts` and `/expressive_face/speech` land their text on the device's `standard/ros4hri/speech/text` key. Nothing routes that text into a `say` run, so publishing there moves no mouth ([VIZ-114](https://linear.app/semio-ai/issue/VIZ-114)). Speak through `/skill/say`, or drive the weights.

## Where This Leads

- [Swap the Speech Provider](swap-the-speech-provider.md) — the `say` contract, and a provider that produces visemes for text.
- [vizij-rs: Skills](https://github.com/vizij-ai/vizij-rs/blob/main/docs/skills.md) — the two viseme players, their envelope and feedback.
- [vizij-rs: ROS4HRI support](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md) — driving a key from ROS 2, and speaking through the standard skill.
