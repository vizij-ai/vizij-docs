<!-- tags: family=project; type=proposal; project_status=proposal; topics=runtime,ros4hri,expression,facs,viseme,skills -->

> **Last updated:** 2026-10-12

# Face interfaces — consistent messages for perceiving a face and commanding one

Status: proposal, for review before implementation. Companion to the [ROS4HRI face proposal](ros4hri_face-proposal.md).

## Summary

ROS4HRI describes a face in three vocabularies: a named expression or a valence/arousal point, FACS action units, and, in the viseme REP being prepared, the mouth's viseme. Each message mixes what a face *is* with how it was *observed* (a confidence) or *timed* (a time and a duration). That serves perception, but it makes the messages a poor fit for commanding a robot's face, and the command side has a single skill, `set_expression`.

This note proposes:
- **What Vizij does now, inside today's standard:** a `set_facial_action_units` skill on a topic, mirroring `set_expression`, and an explicit rule that the two conflict.
- **A counter-proposal for the standard:** messages layered so that the face's content is one type, shared by perception and action, with observation and timing as separate wrappers. Topics and skills follow one pattern across perception, action and the robot's own face state.

## What ROS4HRI defines today

| Content | Message | Where | Role |
|---|---|---|---|
| A person's expression | `hri_msgs/Expression`: `expression` (one of 25 names, not all expected to be handled), `valence`, `arousal`, `confidence` | `/humans/faces/<faceID>/expression` (REP-155) | perception |
| A person's action units | `hri_msgs/FacialActionUnits`: `header`, `float32[] intensity` and `float32[] confidence`, 99 each, ordered by FACS code | `/humans/faces/<faceID>/facs` (REP-155) | perception |
| The robot's expression | `interaction_skills/msg/SetExpression`: `std_skills/Meta meta`, `hri_msgs/Expression expression` | skill `set_expression`, interface **topic** `/skill/set_expression` | action |
| The robot's gaze | `interaction_skills/action/LookAt` | skill `look_at`, interface **action** `/skill/look_at` | action |
| A viseme | `Viseme`: `value`, `time`, `duration`; `Visemes`: a sequence of them | `/tts/visemes`, published by TTS nodes (IIIA's `hri_msgs` fork, the basis of the viseme REP being prepared) | a producer's output |

In ROS4HRI a skill is a capability with a manifest, and the manifest declares the interface that carries it. `set_expression` is a skill on a topic: fire-and-forget, latest wins, because setting a target state is not a task. `look_at` is a skill on an action, because tracking a target runs until it converges or is cancelled.

## The challenges

1. **A face's configuration is the same content whether perceived or commanded.** Intensity is what an action unit *is*: a detector reports it, and a face is commanded with it. Both sides need it, and it should be the same field of the same type.
2. **Confidence belongs to perception only.** It says how sure a detector is. Carried into a command, it has no meaning, and every implementer would invent one. Yet `SetExpression` embeds `hri_msgs/Expression` whole, confidence included, and a skill built on `FacialActionUnits` would inherit `confidence[99]` the same way.
3. **Timing belongs to playing, not to the viseme.** A viseme is a mouth shape. Some producers know only the shape: a lip-reading detector, or a live aligner that knows the shape at the playhead. Others hold a whole alignment, such as a TTS with speech marks. `time` and `duration` describe where a shape falls in a timeline, which is what an animation skill needs and what a pure producer cannot supply. In the `Viseme` message itself they force pure producers to fill fields they have no value for.
4. **Two skills that set the same face compete.** A named expression and a set of action units both describe the whole face's configuration: commanding one overrides the other. Two interfaces can coexist only if the conflict is explicit.
5. **A standard message type cannot be extended.** A type is identified by its name, and from Jazzy by a hash over its fields. An "extended" `SetExpression` would be a different type under the standard name: upstream clients would fail to match it on hash-checking middleware (rmw_zenoh) and mis-decode it elsewhere. A new capability needs a distinct interface with its own type.

## What Vizij does now, inside today's standard

- **`set_expression` stays exactly as ROS4HRI defines it.** The face takes the name, or the valence/arousal point when the name is empty, and ignores `confidence`.
- **A new skill, `set_facial_action_units`, on a topic, `/skill/set_facial_action_units`.** It mirrors `set_expression`: a target state that holds until changed and is reached through the face's smoothing, with no timing of its own. Its message is `SetFacialActionUnits`, in Vizij's own package (recorded as a departure in arora-msgs-ros2), carrying `std_skills/Meta meta` and the face's configuration as intensities only (the content type below). It does not reuse `hri_msgs/FacialActionUnits`, whose `confidence` would be meaningless in a command (challenge 2).
- **The conflict is stated.** `set_expression` and `set_facial_action_units` both set the face's expression, so a client chooses one. If both are used, the latest command takes the face over, crossfading from where it is. On the device, one run owns the face's expression at a time, the way one run owns the lips.
- **Visemes keep their current inputs.** The device takes the field's `/tts/viseme` and `/tts/visemes` and adopts the REP's names and types once it is accepted. The device reports the shape being spoken on `/robot_face/viseme`.

## Counter-proposal for the standard

### Messages in three layers

**Content: what a face is.** No header, no confidence, no timing. Perception, commands and state reports all carry the same content type.

```
# FacialActionUnits: a face's configuration in FACS.
# Sparse: an AU that is absent is not described (perception: not detected;
# command: left as it is).
uint8[] codes            # FACS action-unit codes
float32[] intensities    # [0, 1], one per code
```

```
# Expression: a categorical expression and/or a point in the valence/arousal plane.
string expression        # one of the listed names, empty for none
float32 valence          # [-1, 1]
float32 arousal          # [-1, 1]
```

```
# Viseme: a mouth shape (the industry 15-shape set).
uint8 SIL=0
uint8 PP=1
# … FF TH DD KK CH SS NN RR AA E IH OH OU
uint8 value
```

**Observation: how content was perceived.** It wraps the content with what only perception has.

```
# PerceivedFacialActionUnits
std_msgs/Header header
FacialActionUnits facial_action_units
float32[] confidences    # one per entry of facial_action_units
```

`PerceivedExpression` and `PerceivedViseme` follow the same shape: a header, the content, and a confidence.

**Timing: where content falls in a timeline.** It wraps content for playing.

```
# Timing: a span in a timeline.
builtin_interfaces/Duration start      # from the timeline's origin
builtin_interfaces/Duration duration
```

```
# TimedViseme
Viseme viseme
Timing timing
```

```
# VisemeTimeline: an alignment, e.g. a TTS's speech marks.
std_msgs/Header header   # stamp: the timeline's origin (the audio's start)
TimedViseme[] visemes
```

The same `Timing` serves any animation of face content later: timed expressions or timed action units for a scripted performance.

### Topics and skills

| Content | A person's face (perception) | The robot's face (action) | The robot's face (state) |
|---|---|---|---|
| expression | `/humans/faces/<faceID>/expression`, `PerceivedExpression` | skill `set_expression`, topic, `SetExpression {meta, Expression}` | `/robot_face/expression`, `Expression` |
| action units | `/humans/faces/<faceID>/facs`, `PerceivedFacialActionUnits` | skill `set_facial_action_units`, topic, `SetFacialActionUnits {meta, FacialActionUnits}` | `/robot_face/facs`, `FacialActionUnits` |
| viseme | `/humans/faces/<faceID>/viseme`, `PerceivedViseme` (lip reading) | skill `set_viseme`, topic, `SetViseme {meta, Viseme}`: the shape at the playhead, for live producers | `/robot_face/viseme`, `Viseme` |
| viseme timeline | none (a producer's output, not a perception): a TTS publishes `VisemeTimeline` | skill `play_visemes`, **action**, goal `{meta, VisemeTimeline}`, feedback the current `Viseme`, result the standard errno | none |

The pattern:
- **`set_*` skills are topics.** They set a state that holds until changed, and they carry content only.
- **`play_*` skills are actions.** They play a timeline that ends, so a client gets feedback, completion and cancellation. They carry timed content.
- **Perception and state reports carry the same content types as commands.** Perception adds observation; a state report adds nothing, since the robot knows its own face.

The state column names need settling against PAL's existing names. PAL uses `/robot_face/expression` as a command input, not as a state report.

### Conflicts, stated

- **The face's expression:** `set_expression` and `set_facial_action_units` describe the same configuration. A client chooses one; if both are used, the latest takes over.
- **The lips:** `set_viseme`, `play_visemes` and a speaking `say` all drive the mouth. The latest takes over, and while a viseme plays, the lips own the mouth and the expression keeps the rest of the face.

### Compatibility

The content and observation layers would change `hri_msgs/Expression` and `hri_msgs/FacialActionUnits`, which are standard types, so this layer is a proposal for the standard to adopt, never something Vizij ships under the standard's names (challenge 5). The viseme layer is where it can land first: the viseme REP is still being prepared, so separating `Viseme` from its timing costs no existing client.

Vizij's own new interfaces (`set_facial_action_units` now, `set_viseme` and `play_visemes` if adopted) use these shapes from the start, in Vizij's own package, so that adopting the standard later changes a package name and nothing else.

## Open questions

- **The `Say` feedback extension.** arora-msgs-ros2 extends `communication_skills/Say`'s feedback with `viseme` and `intensity`, so the device's `/skill/say` reports the lips as it speaks. By challenge 5, that is an extended standard type under the standard's name: a stock `Say` client may fail to match it on a hash-checking middleware. Whether to keep it, or serve the stock `Say` and report the lips only through `/robot_face/viseme`, is a separate decision.
- **Dense or sparse action units.** `hri_msgs/FacialActionUnits` is dense: 99 slots, most of them unused by any detector. The proposal makes it sparse, so that a command can set a few action units without zeroing the others, and a detector reports only what it detects. A dense form would need a marker for "not described".
- **Names and packages** for the content, observation and timing types, and whether `Timing` is shared with other animation skills, for example body gestures.
