# Standard Inputs

<!-- tags: family=reference; type=reference; topics=standards,inputs,rigging -->
> **Last updated:** 2026-10-23

## Purpose

Standard inputs are a portable control schema. They let different faces share
poses, drivers, and tools by agreeing on a stable set of control paths. A rig
“adheres” to the standard by wiring these paths into its graph.

## Path Shape

The canonical standard input path is the authored form, the one rig inputs
carry in the authoring app and in a face's bundle:

```
/standard/{standard_namespace}/{channel}/{track}/{attribute}
```

Examples:

- `/standard/vizij/left_eye/pos/x`
- `/standard/vizij/right_eye/pos/y`
- `/standard/vizij/mouth/scale/x`

Use `standard namespace` for the inner namespace segment. In maintained Vizij
examples, the canonical standard namespace is `vizij`.

Legacy unnamespaced `/standard/...` examples may still appear in older material
or compatibility notes, but they are no longer the canonical teaching form.

## Related Surfaces

The same control appears in three forms:

| Surface | Canonical shape | Example | Use it for |
| --- | --- | --- | --- |
| standard input path | `/standard/{standard_namespace}/{channel}/{track}/{attribute}` | `/standard/vizij/left_eye/pos/x` | the authored form of a rig input |
| relative path | `standard/{standard_namespace}/{channel}/{track}/{attribute}` | `standard/vizij/left_eye/pos/x` | a face's own key without its rig prefix: the name the face standard and its profile give the control, the same on every face, and what `runtime.path()` takes |
| runtime path | `rig/{face}/standard/{standard_namespace}/{channel}/{track}/{attribute}` | `rig/{face}/standard/vizij/left_eye/pos/x` | the key in the face's device store: what an app writes, what a bridge lists and carries, what diagnostics show |

Each face is an Arora device of its own, and every key of the face lives under
its rig prefix, `rig/{face}/` (`runtime.rigPrefix` in `@vizij/runtime`, where
`runtime.path(relative)` builds a runtime path). A bridge carries keys as they
are, with no shorter alias in between: a client lists a device's keys and
writes, by runtime path, only the ones listed as writable, which are the face's
free inputs. A device-scoped profile's keys, such as ROS4HRI's
`standard/ros4hri/*`, carry no rig prefix.

## Scope and Required Set

The `vizij` namespace has an authoritative set: the **Vizij face standard**,
declared as data by the `vizij-face` profile. Its source is vizij-rs —
[the face standard](https://github.com/vizij-ai/vizij-rs/blob/main/docs/face-standard.md)
describes every key, and
[`profiles/vizij-face.json`](https://github.com/vizij-ai/vizij-rs/blob/main/crates/interop/vizij-arora-host/profiles/vizij-face.json)
is the profile itself, generated from the Rust constants and drift-tested. The
same profile is served at runtime by `profile("vizij-face")` in
`@vizij/runtime` and by `vizij-bundle profiles`.

A face adheres to the standard tier by tier: its `standard-adaptation` graph
maps the standard keys onto its own rig, and `vizij-bundle validate` reports
which keys of each tier it listens on. Coverage is graded L0–L3 over the four
pose tiers — gaze & lids, expressions, visemes, muscle — in that order; the
conversation state is reported without being graded.

## The Vizij Face Standard

Every key is an `f32` weight in `[0, 1]` resting at `0` unless the table says
otherwise. Paths are shown as relative paths; a face's device holds them under
its rig prefix (`rig/{face}/standard/vizij/...`).

| Tier | Keys | Range | Meaning |
| --- | --- | --- | --- |
| `gaze` | `standard/vizij/{left,right}_eye/pos/{x,y}` | `[-1, 1]` | eye position: `x` left to right, `y` down to up |
| `gaze` | `standard/vizij/{left,right}_eye_top_eyelid/pos/y` | `[0, 1]` | eyelid position: 0 open, 1 closed |
| `gaze` | `standard/vizij/blink` | `[0, 1]` | both eyes: 0 open, 1 closed |
| `gaze` | `standard/vizij/gaze/target/{x,y}` | `[0, 1]` | where the eyes look on the face's frame: origin top-left, `y` down; rests at 0.5, straight ahead |
| `gaze` | `standard/vizij/gaze/target/weight` | `[0, 1]` | how strongly the eyes hold the target: 0 not at all, 1 fully |
| `expression` | `standard/vizij/expression/<name>` | `[0, 1]` | one weight per named expression, 27 names |
| `viseme` | `standard/vizij/viseme/<shape>` | `[0, 1]` | one weight per viseme shape, the 15-shape set |
| `muscle` | `standard/vizij/face/<control>`, `standard/vizij/mouth/morph/jaw_open` | `[0, 1]` | fine controls keyed to FACS action units and ARKit blendshapes, 36 keys |
| `conversation` | `standard/vizij/conversation/{speaking,user_speaking,thinking}` | `[0, 1]` | the dialogue state, written 0 or 1 |

The 27 expression names are ROS4HRI's `hri_msgs/Expression` vocabulary —
`neutral`, `angry`, `sad`, `happy`, `surprised`, `disgusted`, `scared`,
`pleading`, `vulnerable`, `despaired`, `guilty`, `disappointed`,
`embarrassed`, `horrified`, `skeptical`, `annoyed`, `furious`, `suspicious`,
`rejected`, `bored`, `tired`, `asleep`, `confused`, `amazed`, `excited` — and
two faces implement beyond it, `concerned` and `sleepy`. The built-in ROS4HRI
mapping commands ROS4HRI's 25 by name; nothing in ROS4HRI reaches the other
two.

**Blink.** `standard/vizij/blink` is a level, not a trigger: whoever blinks
the face shapes each blink over time (the close and the reopen, about 0.2 s in
all), and the face renders the weight as is, with no transition of its own —
the same split as the visemes, which keeps a face's adaptation stateless. It
is independent of the two eyelid keys, which keep their meaning: a face closes
each lid at least as far as the stronger of the two, so a blink passes over
lids held half-closed and returns them there.

**Conversation state.** `speaking` is 1 while the face speaks — from the
moment its utterance starts (a `say` run is spawned) until it ends or is
stopped; `user_speaking` is 1 while the person the face talks with speaks;
`thinking` is 1 while the agent prepares its reply. The agent the face speaks
for writes them. They describe the dialogue, not the face: a face reacts as
its author chooses — a listening pose, an averted gaze while thinking — or not
at all.

Other namespaces under `/standard/{standard_namespace}/...` remain
project-defined conventions.

## Governance and Extension

When adding new standard inputs:

1. **Define the path** under `/standard/{standard_namespace}/...` and document its intent. A key in the `vizij` namespace is added to the Vizij face standard in vizij-rs, with its range, default and tier; it gets a ROS4HRI mapping where ROS4HRI has a counterpart.
2. **Map it in the rig** so the path produces a predictable effect.
3. **Update pose libraries** or tools that assume a stable set of channels.
4. **Communicate changes** to downstream teams to avoid drift.

## Best Practices

- Prefer stable, semantic names (`left_eye`, `mouth`, `brow`) over asset‑specific
  identifiers.
- Keep attributes small and consistent (`pos/x`, `rot/z`, `scale/y`) so they are
  composable.
- Normalize paths early (authoring tools should output canonical
  `/standard/{standard_namespace}/...` paths).

## Relationship to Rigs and Poses

- **Rigs** declare adherence by wiring standard inputs into their graphs.
- **Poses** target standard inputs to remain cross‑face portable.
- **Graphs** use standard inputs as upstream signals, then remap or blend into
  animatable outputs.
