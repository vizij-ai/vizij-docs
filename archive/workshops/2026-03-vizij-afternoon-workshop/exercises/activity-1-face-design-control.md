<!-- tags: family=workshop; type=exercise; workshop_kind=reusable; workshop_status=ready; topics=workshop,workshops,vizij-afternoon-workshop,exercises,activity-1-face-design-control -->

# Activity 1 Lab: Face Design and Control

Last updated: 2026-03-09

Time block: `2:45 pm to 3:30 pm`

## Goal

Move from inspecting a face asset to controlling it in a live runtime.

## Part A: Inspect a Face in `vizij-authoring`

1. Launch:

```bash
pnpm run dev:vizij-authoring
```

2. Load one sample asset:
   - `Quori_Current.glb`
   - `Toasty_Current.glb`
3. Identify at least three features you can describe to a partner:
   - one eye control
   - one mouth control
   - one pose or expression control
4. Record one example path pattern you observe.

Checkpoint:

1. You can name one feature and the path shape that controls it.

## Part B: Hello Face in `tutorial-fullscreen-face`

1. Launch:

```bash
pnpm run dev:tutorial-fullscreen-face
```

2. Confirm the face renders.
3. Move the mouse and watch the gaze change.
4. Press number keys and note which visible poses trigger.
5. Open `apps/tutorial-fullscreen-face/src/FaceApp.tsx` and identify:
   - the asset bundle
   - the runtime provider
   - the runtime face component

Checkpoint:

1. You can explain what the provider is doing at a high level.

## Part C: Renderer Data Model and Rigging

1. Open `apps/tutorial-fullscreen-face/src/hooks/useMouseGaze.ts`.
2. Find the path pattern for eye movement.
3. Open `apps/tutorial-fullscreen-face/src/hooks/usePoseHotkeys.ts`.
4. Find the path pattern for pose weights.
5. Return to `vizij-authoring` and compare the path ideas to what you saw in the authoring UI.

Checkpoint:

1. You can explain the difference between a standard control path and a pose-weight path.

## Stretch Tasks

Pick one if you finish early:

1. Swap to a different sample GLB in `vizij-authoring` and compare control coverage.
2. Change one hotkey mapping in `usePoseHotkeys.ts`.
3. Add one custom note about how you would organize poses for your own face.

## Debrief Questions

1. What felt stable and reusable across faces?
2. What part of the path system felt confusing?
3. What would make rig inspection faster for first-time users?
