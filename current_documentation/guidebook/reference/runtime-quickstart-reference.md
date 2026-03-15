<!-- tags: type=reference; status=written; topics=guidebook,runtime,quickstart -->

> **Last updated:** 2026-03-13
> **Purpose:** provide the fastest canonical reminder of the maintained React runtime shell and the first runtime helpers most readers actually need

# Runtime Quickstart

## Guidebook Context

1. **Bucket:** [Guidebook Reference](README.md)
2. **Depth role:** cross-cutting reusable reference layer
3. **Module type:** reference bridge
4. **Bucket overview:** [Guidebook Reference](README.md)
5. **Useful previous module:** [Guidebook Reference](README.md)
6. **Useful next module:** [Renderer and Rigging Reference](renderer-and-rigging-reference.md)

## Reader Outcome

After this page, you should be able to recall the smallest maintained Vizij runtime shell, the most common runtime helpers, and the path forms that show up first in the guidebook.

## Use This Reference When

Open this page when you already know you are building or inspecting a React runtime shell and need a compact reminder of:

1. the minimum `VizijAssetBundle` plus `VizijRuntimeProvider` plus `VizijRuntimeFace` shape,
2. the main helper methods from `useVizijRuntime()`,
3. the first runtime path forms you are likely to write or inspect.

If you are still choosing your first path, start with the public tutorial route and come back here when you need the compact reminder.

## The Core Mental Model

The smallest useful Vizij runtime app has three pieces:

1. a `VizijAssetBundle`
2. a `VizijRuntimeProvider`
3. a `VizijRuntimeFace`

## Fastest Maintained Local Entry

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
3. Speech-driven viseme or emotion behavior:
   still stages canonical pose weights such as `rig/{face}/poses/{poseId}.weight`
4. Internal pose-graph routing:
   `rig/{face}/pose/control/{inputId}` is runtime-internal and usually not the path you stage by hand

Pose groups still exist to control how subsets of poses blend. They are not part of the pose input path itself.

## Runtime Path Reminder

This reference is about runtime paths, not deployment slot names:

| Surface | Example | Use it for |
| --- | --- | --- |
| runtime path | `rig/{face}/standard/left_eye/pos/x` | `setInput(...)`, `animateValue(...)`, runtime reasoning |
| deployment slot name | `standard/vizij/left_eye/pos/x` | endpoint-driven writes in `vizij-standalone` |

## Best Maintained Source

Read and run:

1. `apps/tutorial-fullscreen-face/src/FaceApp.tsx`
2. `apps/tutorial-fullscreen-face/src/hooks/useMouseGaze.ts`
3. `apps/tutorial-fullscreen-face/src/hooks/usePoseHotkeys.ts`

## Best Next Pages

1. If you need the longer teaching route behind these helpers, return to [Minimal Web Player](../integrate/minimal-web-player.md).
2. If you need path-family detail, continue to [Paths and Standard Controls](../control/paths-and-standard-controls.md).
3. If you need deployment slot writing rather than runtime helper calls, continue to [Animation, Integration, and Deployment Reference](animation-integration-and-deployment-reference.md).
