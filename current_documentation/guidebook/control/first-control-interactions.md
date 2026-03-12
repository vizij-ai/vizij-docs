<!-- tags: type=guidebook-module; status=written; topics=guidebook,control,runtime,interactions -->

> **Last updated:** 2026-03-11
> **Purpose:** teach the smallest believable runtime control win through obvious maintained interactions

# First Control Interactions

## Reader Outcome

After this page, you should be able to launch the maintained fullscreen tutorial face, wait for a trustworthy ready state, use mouse gaze and pose hotkeys to trigger obvious visible changes, and explain that these interactions are runtime writes with different meanings underneath.

## Intended Audience

This page is for readers who already have a Vizij face rendering and now want the smallest believable control success before learning the full control model.

It is especially useful after [Hello Face Quickstart](../experience/hello-face-quickstart.md).

## What You Need

From `vizij-web`:

```bash
pnpm install
pnpm run dev:tutorial-fullscreen-face
```

Then open the local URL printed by Vite.

You do not need to know full path grammar yet.

## Artifact Being Touched

This page uses the maintained `tutorial-fullscreen-face` app.

The concrete surfaces you are touching are:

1. the runtime lifecycle in `FaceApp.tsx`,
2. the mouse-gaze hook in `useMouseGaze.ts`,
3. the hotkey hook in `usePoseHotkeys.ts`.

## Why This Page Exists

This page is separate because many readers need one fast control success before they are ready for control vocabulary.

It prevents two common mistakes:

1. thinking the face is only a rendered asset with some demo-only UI tricks,
2. thinking they must understand full path syntax before trying any runtime control.

This page teaches visible cause and effect first. The fundamentals pages explain the deeper model afterward.

## Walkthrough

### 1. Wait for readiness before you trust the interaction

> TODO(content-model): Add an annotated screenshot here to call out the loading, initializing, ready, and error states in `tutorial-fullscreen-face`. Best fit because this walkthrough starts with readiness recognition and the key teaching cues are visible UI states.

Open `tutorial-fullscreen-face` and watch the status first.

In the maintained app, `FaceApp.tsx` distinguishes:

1. loading,
2. error,
3. not-ready initialization,
4. ready.

That matters because the interaction hooks are enabled only when the runtime is ready. Once ready, the app also stages the neutral pose baseline with `stagePoseNeutral()`.

For a learner, the practical rule is simple:

1. if you still see `Loading face…`, wait,
2. if you see `Initialising orchestrator…`, wait,
3. if you see an error, fix that before reasoning about control,
4. only trust the interaction examples after the face is fully live.

This is the first control lesson: a visible face is not the same thing as a ready runtime.

### 2. Move the mouse and watch gaze respond

Move the pointer across the face area.

You should see the eyes track the pointer. When the pointer leaves or you release after a pointer interaction, the eyes return to neutral.

This is the smallest obvious continuous control win in the maintained tutorial app.

Underneath, `useMouseGaze.ts` does not directly animate the canvas. It computes normalized pointer values and writes runtime inputs for left and right eye position channels through `setInput(...)`.

The important learner takeaway is:

1. the visible effect is eye movement,
2. the runtime action is writing gaze-related values,
3. the interaction is continuous while the pointer moves.

You do not need the full path anatomy on this page. You only need to recognize that mouse gaze is a runtime write to reusable eye-control channels, not a one-off DOM effect.

### 3. Press number keys and watch named facial states respond

After the face is ready, press the number keys shown in the hint overlay.

The app maps `1` through `5` to the first available entries in the pose rig config. On key down, the selected entry animates toward full weight. On key up, it animates back toward zero.

What you should notice:

1. this interaction is discrete rather than continuous,
2. it triggers a named facial state rather than eye steering,
3. the visible change depends on what the current bundle exported as its first pose entries.

In the maintained hook, `usePoseHotkeys.ts` builds runtime paths from the current pose definitions and uses `animateValue(...)` to move the relevant weight up and back down.

The learner-facing point is not the exact string format. The point is that hotkeys are also runtime writes, but they mean something different from mouse gaze.

### 4. Notice that both interactions are real runtime control, not the same kind of control

> TODO(content-model): Add a comparison here to contrast mouse gaze with pose hotkeys across control style, path kind, and visible behavior. Best fit because this section is the first place readers must separate two valid control patterns without overloading them with full control theory.

Mouse gaze and hotkeys both make the face change, but they are not interchangeable.

Mouse gaze writes continuously into standardized eye-position channels.

Hotkeys animate named weight paths derived from the bundle's pose definitions. In practice, those may represent pose-like, emotion-like, or similar authored groups depending on the bundle.

That distinction matters because Vizij control is not just "send a number somehow."

Different visible interactions write into different semantic parts of the runtime:

1. some writes steer reusable channels,
2. some writes blend named authored states,
3. both are valid runtime control,
4. neither should be mistaken for full control theory on its own.

## What This Page Covers and Does Not Cover

This page covers:

1. readiness before interaction,
2. mouse gaze as a maintained continuous control example,
3. hotkeys as a maintained named-state control example,
4. the idea that visible interactions are runtime writes with meaning underneath.

This page does not cover:

1. full path syntax,
2. the complete semantic categories of inputs, outputs, visemes, and animations,
3. all control surfaces or deployment-facing slots,
4. authoring new poses or changing the exported bundle.

Those belong on the next pages.

## Success Check

You are done with this page when:

1. you can tell the difference between a rendered face and a ready runtime,
2. moving the mouse visibly steers gaze,
3. pressing and releasing number keys visibly triggers and releases named facial states,
4. you can explain that both interactions are runtime writes, but not the same kind of runtime write.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
2. `vizij-web/apps/tutorial-fullscreen-face/src/FaceApp.tsx`
3. `vizij-web/apps/tutorial-fullscreen-face/src/hooks/useMouseGaze.ts`
4. `vizij-web/apps/tutorial-fullscreen-face/src/hooks/usePoseHotkeys.ts`
5. `vizij-web/packages/@vizij/runtime-react/README.md`
6. `vizij-web/apps/tutorial-agent-face/src/FaceApp.tsx`
7. `vizij-web/apps/vizij-standalone/README.md`
8. `vizij-web/apps/vizij-standalone/src/hooks/useWebSocketSync.ts`

## Next Step

Go next to [Paths and Standard Controls](paths-and-standard-controls.md).

That page explains the path vocabulary underneath the gaze and hotkey examples you used here.

After that, continue to [Runtime Inputs and Semantics](runtime-inputs-and-semantics.md) to learn what those writes mean more precisely, and to [Control Surfaces and Configuration Layers](control-surfaces-and-configuration-layers.md) to understand where different kinds of controls show up across Vizij.
