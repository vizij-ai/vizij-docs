<!-- tags: type=guidebook-module; status=written; topics=guidebook,control,runtime,interactions -->

> **Last updated:** 2026-03-13
> **Purpose:** teach the smallest believable runtime control win through obvious maintained interactions

# First Control Interactions

## Guidebook Context

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Experience](../experience/README.md)<br>Current: [Control](README.md)<br>Next: [Customize](../customize/README.md) on the customization route or [Integrate](../integrate/README.md) on the fast route |
| Depth ladder in this bucket | Above: none, this is the entry depth in this bucket<br>Current: `Surface`<br>Below: [Paths and Standard Controls](paths-and-standard-controls.md), [Runtime Inputs and Semantics](runtime-inputs-and-semantics.md), [Control Surfaces and Configuration Layers](control-surfaces-and-configuration-layers.md), [Orchestration and Diagnostics](orchestration-and-diagnostics.md) |
| Module position in this bucket | Previous in bucket: start at [Control](README.md)<br>Current module: `First Control Interactions`<br>Next in bucket: [Paths and Standard Controls](paths-and-standard-controls.md) |
| Reference bridges | [Renderer and Rigging Reference](../reference/renderer-and-rigging-reference.md)<br>[Runtime Quickstart Reference](../reference/runtime-quickstart-reference.md)<br>[Glossary and Terminology Bridge](../support/glossary-and-terminology-bridge.md) |
| Module type | walkthrough |
| Bucket overview | [Control](README.md) |

## Reader Outcome

After this page, you should be able to use the maintained fullscreen tutorial to trigger two different kinds of control, explain how their behavior differs, and connect each visible interaction to the code that stages it.

## Starting State

Run this from the `vizij-web` root:

```bash
cd /home/chris/Code/Semio/vizij_ws/vizij-web
pnpm run dev:tutorial-fullscreen-face
```

Open the local Vite URL if it is not already open.

This page assumes you already completed [Hello Face Quickstart](../experience/hello-face-quickstart.md) and have the face rendering locally.

## The Two Control Patterns You Are Learning

This app teaches two useful control ideas immediately:

1. continuous standard-input control through mouse gaze
2. discrete authored-state control through pose hotkeys

Both are real runtime writes. They just write into different parts of the runtime model.

Quick term bridge before you continue:

1. `standard control` means a reusable runtime channel such as eye position.
2. `pose weight` means the current strength of a named authored state such as `happy` or `surprise`.
3. `path` means the runtime address the hook writes, not the visible UI widget itself.

## What This Page Is Not Proving Yet

This page proves that the runtime can accept and apply different kinds of control writes.

It does not yet prove:

1. that you have an application integration shell,
2. that you have authored new behavior,
3. that you have a deployment endpoint,
4. that every control category in Vizij behaves the same way.

## Walkthrough

### 1. Confirm runtime readiness before testing control

Do not test control while the app is still loading.

Wait until:

1. the face is fully visible
2. there is no loading or initialization message blocking the view
3. repeated mouse movement produces consistent eye motion

Why this matters:

1. `tutorial-fullscreen-face` stages a neutral pose baseline when the runtime becomes ready
2. the interaction hooks only make sense after the provider has loaded the face and registered the runtime state
3. a visible face is not automatically a ready control surface

If you are not confident the app is healthy yet, go back to [Hello Face Quickstart](../experience/hello-face-quickstart.md) or check [Validation Checkpoints](../support/validation-checkpoints.md).

### 2. Use mouse gaze as a continuous control

Move the pointer across the viewport and watch the eyes respond.

Expected result:

1. eye movement changes smoothly as the pointer moves
2. the interaction feels continuous rather than one-shot
3. the face returns toward neutral when the pointer stops driving gaze

Open:

1. `vizij-web/apps/tutorial-fullscreen-face/src/hooks/useMouseGaze.ts`

What to look for:

1. pointer position is normalized into a reusable value range
2. the hook calls runtime input staging rather than mutating the canvas directly
3. the control paths target the face's standard eye-position channels

The important mental model is simple: mouse movement becomes a stream of runtime input values.

### 3. Use pose hotkeys as a discrete authored-state control

Press the number keys shown by the app.

Expected result:

1. a visible face pose or expression animates in
2. releasing the key lets the pose animate back out
3. repeated key presses work consistently

Open:

1. `vizij-web/apps/tutorial-fullscreen-face/src/hooks/usePoseHotkeys.ts`

What to look for:

1. the hook derives pose-weight paths from the loaded pose config
2. it uses runtime helpers such as `buildPoseWeightPathMap()` and `animateValue(...)`
3. the interaction is based on named authored states, not direct eye-position steering

The mental model here is different: a key press selects one authored state and animates its weight.

### 4. Compare the two control styles directly

Use this comparison while the app is open:

| Interaction | What you do | What changes visibly | Runtime meaning |
| --- | --- | --- | --- |
| Mouse gaze | move the pointer | eyes track continuously | writes standardized eye-position inputs |
| Pose hotkeys | press and release a number key | expression or pose weight animates in and out | writes authored pose-weight values |

This is the first important control lesson in Vizij:

1. not every control write is the same kind of write
2. standardized channels and authored pose weights are both valid, but they solve different problems
3. later pages explain the path grammar and semantics behind these interactions

### 5. Inspect the code shape that makes both patterns work

You have already seen the behavior in the browser. Now connect it to the runtime API surface:

1. `useMouseGaze.ts` uses runtime input staging for continuous steering
2. `usePoseHotkeys.ts` uses runtime animation helpers for temporary pose blends
3. both hooks depend on the same `VizijRuntimeProvider` and `useVizijRuntime()` foundation from `FaceApp.tsx`

That common foundation matters. Vizij control is not a pile of unrelated tricks. The runtime stays consistent while the control semantics change.

## What You Should Be Able To Say Now

By the end of this page, the correct short explanation is:

1. mouse gaze is a continuous standard-control example
2. hotkeys are a discrete pose-weight example
3. both go through runtime APIs
4. they differ because they write to different semantic control surfaces

## Fast Recovery If It Fails

Use these shortcuts:

1. if the face is visible but gaze does not move, compare the current app state with [Hello Face Quickstart](../experience/hello-face-quickstart.md)
2. if hotkeys do nothing, verify the app finished loading before testing
3. if you need a route-level definition of healthy behavior, use [Validation Checkpoints](../support/validation-checkpoints.md)
4. if the runtime reaches an error state, use [Troubleshooting Matrix](../support/troubleshooting-matrix.md)

## Success Check

You are done with this page when:

1. mouse movement visibly steers gaze
2. number keys visibly animate authored facial states
3. you can explain the difference between continuous standard-input control and discrete pose-weight control
4. you can point to the two hooks that stage those writes

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
2. `vizij-web/apps/tutorial-fullscreen-face/src/FaceApp.tsx`
3. `vizij-web/apps/tutorial-fullscreen-face/src/hooks/useMouseGaze.ts`
4. `vizij-web/apps/tutorial-fullscreen-face/src/hooks/usePoseHotkeys.ts`
5. `vizij-web/packages/@vizij/runtime-react/README.md`

## Recommended Next Steps

Continue to [Paths and Standard Controls](paths-and-standard-controls.md).

That page names the path vocabulary underneath the gaze and pose interactions you just used.

Use these branch points after that:

1. If you want to stay on the fast route toward embedding, continue later to [Minimal Web Player](../integrate/minimal-web-player.md).
2. If you want to start owning the face after the control model is clear, branch to [Tweak an Existing Face](../customize/tweak-an-existing-face.md).
