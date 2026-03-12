<!-- tags: type=guidebook-module; status=written; topics=guidebook,experience,hello-face,runtime -->

> **Last updated:** 2026-03-11
> **Purpose:** deliver the fastest convincing first Vizij runtime success with a working face

# Hello Face Quickstart

## Reader Outcome

After this page, you should be able to run a working Vizij face, trigger visible changes, and identify the three core runtime pieces that make the page work.

## Intended Audience

This page is for:

1. first-time Vizij readers,
2. workshop participants or builders who want an immediate success,
3. anyone who needs a trustworthy runtime baseline before moving into control, customization, or deployment.

## What You Need

From the `vizij-web` repo root:

```bash
pnpm install
```

Then you need the maintained Hello Face app:

```bash
pnpm run dev:tutorial-fullscreen-face
```

## Artifact Being Touched

This page uses `tutorial-fullscreen-face`, the current maintained runtime tutorial surface for first contact with Vizij.

The smallest useful runtime app has three pieces:

1. a `VizijAssetBundle`,
2. a `VizijRuntimeProvider`,
3. a `VizijRuntimeFace`.

## Walkthrough

### 1. Launch the app

From `vizij-web`:

```bash
pnpm run dev:tutorial-fullscreen-face
```

Open the local URL printed by Vite.

You should see a fullscreen face render successfully.

> TODO(content-model): Add an annotated screenshot here to show the fullscreen face state and the interaction hotspots a first-time reader should notice. Best fit because this walkthrough teaches a real visible surface and an annotated screenshot would reduce first-contact ambiguity before the reader starts interacting.

### 2. Trigger one visible runtime behavior

Do two quick interaction checks:

1. move the mouse and watch the eyes respond,
2. press number keys and note which visible poses trigger.

These interactions matter because they prove that the runtime is not just rendering a static asset. It is staging inputs and driving a face live.

### 3. Identify the runtime skeleton in the code

Open:

1. `apps/tutorial-fullscreen-face/src/FaceApp.tsx`
2. `apps/tutorial-fullscreen-face/src/hooks/useMouseGaze.ts`
3. `apps/tutorial-fullscreen-face/src/hooks/usePoseHotkeys.ts`

In `FaceApp.tsx`, find:

1. the asset bundle,
2. the runtime provider,
3. the runtime face component.

That is the core Hello Face anatomy.

### 4. Connect the visible behavior to the hooks

Open `useMouseGaze.ts` and find the eye-control path pattern.

Open `usePoseHotkeys.ts` and find the pose-weight path pattern.

You do not need to understand every line yet. The important idea is that visible behavior is being driven through stable runtime path writes, not through one-off view logic.

> TODO(content-model): Add a short video clip here to show mouse gaze and pose hotkey cause-and-effect in motion. Best fit because Experience surface pages benefit from motion evidence and the live behavior is the teaching point, not the code listing alone.

## What To Notice

`Hello Face` is doing three jobs at once:

1. proving the runtime stack is healthy,
2. exposing obvious cause and effect through gaze and hotkeys,
3. giving you a concrete code surface to inspect without overwhelming you.

This is why it is the first maintained route through the guidebook.

## Current Useful Visual

An existing screenshot already lives at:

`current_documentation/workshops/vizij-afternoon-workshop/assets/screenshots/tutorial-fullscreen-face.png`

It is good enough for wave 1 and can be promoted into the guidebook assets flow later.

## Success Check

You are done with this page when:

1. the face renders successfully,
2. the mouse changes gaze,
3. number keys trigger visible pose changes,
4. you can point to the asset bundle, provider, and face component in the code.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
2. `vizij-web/apps/tutorial-fullscreen-face/src/FaceApp.tsx`
3. `vizij-web/apps/tutorial-fullscreen-face/src/hooks/useMouseGaze.ts`
4. `vizij-web/apps/tutorial-fullscreen-face/src/hooks/usePoseHotkeys.ts`
5. `current_documentation/guidebook/reference/runtime-quickstart-reference.md`

## Next Step

1. If you want to understand the path model underneath what you just saw, read [Paths and Standard Controls](../control/paths-and-standard-controls.md).
2. If you only wanted to prove the runtime works, you can later branch to [Minimal Web Player](../integrate/minimal-web-player.md).
