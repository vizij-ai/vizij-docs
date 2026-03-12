<!-- tags: type=reference; status=written; topics=guidebook,runtime,quickstart -->

> **Last updated:** 2026-03-11
> **Guidebook note:** promoted from the workshop handout so this version can become the reusable canonical source

# Runtime Quickstart

## The Core Mental Model

The smallest useful Vizij runtime app has three pieces:

1. a `VizijAssetBundle`
2. a `VizijRuntimeProvider`
3. a `VizijRuntimeFace`

## Minimal Command

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

1. `setInput(path, value)` stages an input
2. `animateValue(path, target, options)` tweens a value
3. `playAnimation(id, options)` triggers a stored clip
4. `stagePoseNeutral()` restores the neutral pose

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

## Downstream Use

This reference should feed:

1. Hello Face workflow pages
2. getting-started docs
3. workshop participant quickstarts
4. facilitator runtime setup notes
