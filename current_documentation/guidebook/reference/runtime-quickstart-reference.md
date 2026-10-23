<!-- tags: family=guidebook; type=reference; editorial_status=completed; publication_status=planned; topics=guidebook,runtime,quickstart -->

> **Last updated:** 2026-10-23
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

After this page, you should be able to recall the smallest maintained Vizij runtime shell, the most common runtime calls, and the path forms that show up first in the guidebook.

## Use This Reference When

Open this page when you already know you are building or inspecting a React runtime shell and need a compact reminder of:

1. the minimum `VizijCanvas` plus `VizijRuntimeProvider` plus `VizijRuntimeFace` shape,
2. the main calls on the face's `Runtime` from `useVizijRuntime()`,
3. the first runtime path forms you are likely to write or inspect.

If you are still choosing your first path, start with the public tutorial route and come back here when you need the compact reminder.

## The Core Mental Model

The smallest useful Vizij runtime app has three pieces:

1. `<VizijCanvas>` from `@vizij/render`: the page's one canvas, on which `@vizij/runtime`'s Bevy view draws every face
2. a `VizijRuntimeProvider`, given the face's GLB: it loads the face as an Arora device and steps it
3. a `VizijRuntimeFace`: the face's slot, a `<div>` the canvas draws the face over

## Fastest Maintained Local Entry

```bash
pnpm run dev:tutorial-fullscreen-face
```

## Minimal Shape

```tsx
import { VizijCanvas } from "@vizij/render";
import { VizijRuntimeFace, VizijRuntimeProvider } from "@vizij/runtime-react";

const faceAssetUrl = new URL(
  "../../vizij-authoring/public/assets/Quori_Current_Extended.glb",
  import.meta.url,
).href;

export function FaceApp() {
  return (
    <>
      <VizijCanvas />
      <VizijRuntimeProvider glb={faceAssetUrl}>
        <VizijRuntimeFace style={{ width: 480, height: 360 }} />
      </VizijRuntimeProvider>
    </>
  );
}
```

## Useful Runtime Calls

From `useVizijRuntime()`: `status` (`loading`, `ready`, `error`), `error`, `runtime` (the face's `Runtime` from `@vizij/runtime`) and `description` (what the face's GLB declares: poses, rig inputs, programs, animations).

On the `runtime`:

1. `runtime.path(relative)` builds one of the face's keys: `rig/{face}/` + `relative`
2. `runtime.setValue(path, value)` and `runtime.writeValues({ ... })` write keys
3. `runtime.invoke("say", { text })` and `runtime.invoke("play_viseme", { shape, weight })` speak and play visemes
4. `runtime.invoke("reset")` returns every key to its rest

From `useAnimateValue()`: `animateValue(path, target, { duration })` tweens a key.

## Paths To Remember

1. An expression of the face standard:
   `rig/{face}/standard/vizij/expression/{name}`
2. Where the eyes look:
   `rig/{face}/standard/vizij/gaze/target/{x,y,weight}`
3. A viseme, written by `say` and `play_viseme`:
   `rig/{face}/standard/vizij/viseme/{shape}`
4. A face's own pose weight:
   `rig/{face}/poses/{pose_id}.weight`
5. Internal pose-graph routing:
   `rig/{face}/pose/control/{inputId}` is runtime-internal and usually not the path you write by hand

Pose groups exist to control how subsets of poses blend. They are not part of the pose input path itself.

## Runtime Path Reminder

| Form | Example | Use it for |
| --- | --- | --- |
| runtime path | `rig/{face}/standard/vizij/left_eye/pos/x` | `runtime.setValue(...)`, `animateValue(...)`, bridge writes, runtime reasoning |
| relative path | `standard/vizij/left_eye/pos/x` | naming the face standard's control; `runtime.path(...)` turns it into the runtime path |

## Best Maintained Source

Read and run:

1. `apps/tutorial-fullscreen-face/src/FaceApp.tsx`
2. `apps/tutorial-fullscreen-face/src/hooks/useFaceHotkeys.ts`
3. `packages/@vizij/runtime-react/README.md`

## Best Next Pages

1. If you need the longer teaching route behind these calls, return to [Minimal Web Player](../integrate/minimal-web-player.md).
2. If you need path-family detail, continue to [Paths and Standard Controls](../control/paths-and-standard-controls.md).
3. If you need writes from outside the page rather than runtime calls, continue to [Animation, Integration, and Deployment Reference](animation-integration-and-deployment-reference.md).
