# Handout: Vizij Runtime Quickstart

Last updated: 2026-03-09

## The Core Mental Model

The smallest useful Vizij runtime app has three pieces:

1. A `VizijAssetBundle`
2. A `VizijRuntimeProvider`
3. A `VizijRuntimeFace`

## Minimal Commands

```bash
pnpm run dev:tutorial-fullscreen-face
```

## Minimal Shape

```tsx
const assetBundle = {
  namespace: "fullscreen-face",
  glb: {
    kind: "url",
    src: "/assets/hugo_rigged.glb",
    aggressiveImport: true,
  },
  pose: {
    stageNeutralFilter: (_id, path) => !path.includes("/color/"),
  },
};

export function FaceApp() {
  return (
    <VizijRuntimeProvider assetBundle={assetBundle} autostart>
      <VizijRuntimeFace className="face-canvas" showSafeArea={false} />
    </VizijRuntimeProvider>
  );
}
```

## Useful Runtime Helpers

From `useVizijRuntime()`:

1. `setInput(path, value)` to stage an input
2. `animateValue(path, target, options)` to tween a value
3. `playAnimation(id, options)` to trigger a stored clip
4. `stagePoseNeutral()` to restore the neutral pose

## Paths To Remember

1. Eye gaze:
   `rig/{face}/standard/left_eye/pos/x`
2. Pose weight:
   `rig/{face}/poses/{pose_name}.weight`
3. Viseme weight:
   `rig/{face}/visemes/{viseme_id}.weight`

## Best Demo Source

Read and run:

1. `apps/tutorial-fullscreen-face/src/FaceApp.tsx`
2. `apps/tutorial-fullscreen-face/src/hooks/useMouseGaze.ts`
3. `apps/tutorial-fullscreen-face/src/hooks/usePoseHotkeys.ts`
