<!-- tags: family=guidebook; type=guidebook-module; editorial_status=completed; publication_status=planned; topics=guidebook,customize,profiles,ros4hri,exposure -->

> **Last updated:** 2026-07-31
> **Purpose:** explain what a standard profile is, how to load, edit, and re-export one in `vizij-authoring`, and when to embed it into your GLB versus letting the runtime supply it

# Standard Profiles

## Guidebook Context

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Control](../control/README.md)<br>Current: [Customize](README.md)<br>Next: [Integrate](../integrate/README.md) |
| Depth ladder in this bucket | Above: [Tweak an Existing Face](tweak-an-existing-face.md)<br>Current: `Fundamentals`<br>Below: [Deep Custom Pipeline](deep-custom-pipeline.md) |
| Module position in this bucket | Previous in bucket: [Procedural Programs](procedural-programs.md)<br>Current module: `Standard Profiles`<br>Next in bucket: [Export](export.md) |
| Reference bridges | [Paths and Standard Controls](../control/paths-and-standard-controls.md)<br>[Validation Checkpoints](../support/validation-checkpoints.md) |
| Module type | operational guide |
| Bucket overview | [Customize](README.md) |

## Reader Outcome

After this page, you should be able to say what a standard profile does for a face, load the shipped ROS4HRI profile in `vizij-authoring`, edit it (in the graph editor or as JSON), re-export it, and decide — deliberately — whether your face should embed its own copy or rely on the runtime's built-in.

## Module Notes

- Read this when your face must understand an external command vocabulary — ROS4HRI first — without hand-wiring that vocabulary into the face's own graphs.
- The page stays on the authoring surface: what the profile graph is, and the load/edit/re-export/embed loop.
- The ROS-side counterpart — how a deployed device's bridge exposes typed ROS 2 topics and the `/skill/look_at` action onto these same keys (the bridge's *exposure profile*) — is deploy-time configuration, documented in [vizij-rs's ROS4HRI support](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md).

## What You Need

1. A face loaded in `vizij-authoring` (see [Import](import.md)),
2. a passing familiarity with [Paths and Standard Controls](../control/paths-and-standard-controls.md).

## What A Standard Profile Is

A standard profile is a **node graph that translates one command vocabulary into the Vizij face standard**. The shipped `ros4hri` profile reads the `standard/ros4hri/*` keys (expression name/valence/arousal, gaze target, action units, visemes) and writes `standard/vizij/*` controls — which the face's own graphs then turn into the motion of its particular rig.

That layering is the point: the profile is **face-independent** (it only writes standard control paths), and the face is **vocabulary-independent** (it only implements the face standard). Any compliant face gains ROS4HRI understanding by composing the profile next to its own graphs.

## You Usually Don't Need To Do Anything

The shipped profiles travel **with the runtime, not with your GLB**:

- the native `vizij` app composes the ROS4HRI profile **by default** for every face it runs (`--no-ros4hri` opts out);
- web deployments get the same via `@vizij/runtime`: `standardProfiles()` lists the shipped profiles and `composeFace()` composes them next to your face's graphs.

So a face exported without any profile still understands ROS4HRI wherever it runs — provided it implements the face-standard controls the profile writes. What your GLB must actually carry is **face-standard coverage**, and `vizij-bundle validate --min-level <n>` reports it by tier (gaze & lids, expressions, visemes, muscle/AU).

The canonical source of the shipped profile lives in the **vizij-rs repository**: [`crates/interop/vizij-arora-host/profiles/ros4hri.json`](https://github.com/vizij-ai/vizij-rs/blob/main/crates/interop/vizij-arora-host/profiles/ros4hri.json) — a committed JSON asset, regenerated from a builder and drift-tested, so what the runtime composes and what you load in the authoring app are the same graph.

## Loading A Profile Into Your Session

**File → Standard Profiles** lists every profile the runtime ships, with a checkbox per profile.

Checking `ros4hri` **embeds** a copy into your working face: the profile graph is adapted to your face's rig and carried in the bundle under the stable id `standard::ros4hri`. From that moment it is *your face's* copy:

- it exports with the GLB (yes — the profile saves into your GLB) and survives re-import;
- at runtime, an embedded profile **overrides** the built-in of the same id — your pinned copy composes, the shipped one stays out — while other profiles are unaffected;
- **unchecking removes it** from the next export, and the face falls back to the runtime's built-in.

Embed when you intend to change the mapping, or when you want the face to carry a *pinned* profile version that no runtime update can silently alter. Leave it unchecked when the shipped mapping is what you want — you'll track improvements for free.

## Editing A Profile

Two editing routes, from the same **File → Standard Profiles** submenu:

**In the graph editor** — `Edit ros4hri in Graph Editor…` opens the embedded copy as an exclusive editor session (a banner offers **Apply to Profile** / **Discard**; your program edits are parked meanwhile). The profile's input/output endpoint nodes are not deletable — they are the contract with the store — but everything between them is yours to rewire. *Apply* writes the result back into the embedded `standard::ros4hri` copy.

**As JSON** — `Export JSON` writes the profile in its **canonical, face-independent form** (rig adaptations stripped), suitable for versioning, review, or out-of-app editing. `Replace from JSON` re-imports such a file into the embedded copy, re-adapting it to your face. Export → edit → replace round-trips exactly.

## Re-Exporting

Nothing extra to do: an embedded (and possibly edited) profile is part of the bundle, so the ordinary [Export](export.md) carries it in the GLB. On the command line, [`vizij-bundle`](https://github.com/vizij-ai/vizij-rs/tree/main/crates/tools/vizij-bundle) does the same without the app: `vizij-bundle add-standard face.glb --standard ros4hri -o out.glb` (re-runnable to update in place).

## Verify Before You Ship

1. `vizij-bundle validate --min-level <n>` — the face covers the standard tiers your deployment needs;
2. load the exported GLB back into the authoring app — the profile shows checked, and re-export still carries it;
3. drive a `standard/ros4hri/*` key (e.g. an expression name) in the running face and watch the mapped controls respond.

## Where This Leads

- [Export](export.md) — the artifact boundary this rides through.
- [Loading, Playback, and Embedding](../integrate/loading-playback-and-embedding.md) — the profile at work in an integrated runtime.
- [vizij-rs ROS4HRI support](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md) — the key contract, per-channel behavior, and the deployed bridge's topic/action exposure.
- [Swap the Speech Provider](../deploy/swap-the-speech-provider.md) and [Bring Your Own Visemes](../deploy/bring-your-own-visemes.md) — the deployed face's speech and lipsync, which the profile leaves to the viseme players.
