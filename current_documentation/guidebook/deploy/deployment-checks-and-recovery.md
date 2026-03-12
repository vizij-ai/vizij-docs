<!-- tags: type=guidebook-module; status=written; topics=guidebook,deploy,validation,recovery,standalone -->

> **Last updated:** 2026-03-11
> **Purpose:** define the first deployment readiness loop and the fastest recovery path for the standalone endpoint

# Deployment Checks and Recovery

## Guidebook Context

1. **Bucket:** [Deploy](README.md)
2. **Depth:** `Fundamentals`
3. **Module type:** operational guide
4. **Bucket overview:** [Deploy](README.md)
5. **Useful previous module:** [Operator and Deployment Model](operator-and-deployment-model.md)
6. **Useful next module:** [Hardware, ROS, and Multi-Screen Topologies](hardware-ros-and-multi-screen-topologies.md)

## Reader Outcome

After this page, you should be able to decide whether the first Vizij deployment endpoint is actually deployed, run a compact readiness loop against that endpoint, and recover the most common first-line failures without drifting into a full support runbook.

## Module Notes

### Intended Audience

This page is for readers who already understand the first standalone deployment path and operator model and now need a practical answer to a narrower question:

Is this endpoint healthy enough to call deployed, and what should I try first when that loop breaks?

### Why This Page Exists

The standalone deployment page gets the endpoint running.

The operator-model page explains what the endpoint consists of.

This page exists separately because operators still need one more layer: a repeatable readiness loop. Without that loop, it is easy to mistake “the app opened” for “the endpoint is deployed,” or to jump too quickly into deep debugging when a small recovery step would have been enough.

### Artifact Being Touched

The artifact here is the first real deployment endpoint:

1. the `vizij-standalone` runtime,
2. one loaded face asset,
3. the local WebSocket control service, usually `ws://localhost:9000`,
4. one operator path, either through the built-in web control panel or a direct WebSocket client.

### What This Page Does Not Cover

This page deliberately stops before:

1. full failure classification across all route stages,
2. deep protocol debugging,
3. security and network-hardening decisions,
4. packaging internals or shipping workflows,
5. ROS, hardware, or multi-screen deployment patterns.

Those belong in other pages because the goal here is a fast, dependable first recovery loop, not full operational ownership of every deployment topology.

## What You Need

This page assumes:

1. `vizij-standalone` is already running or you are actively validating it,
2. you have a face asset available to load,
3. you already know the deployment surface from [Easiest Standalone Deployment](easiest-standalone-deployment.md),
4. you already understand the runtime-plus-operator model from [Operator and Deployment Model](operator-and-deployment-model.md).

This page does not repeat the standalone setup walkthrough, packaging steps, or deeper topology choices.

## What “Deployed” Means For This First Endpoint

For this first deployment target, “deployed” should be defined in observable terms.

Call the endpoint deployed only when all of these are true:

1. a face is loaded and visible,
2. the runtime reaches a ready state,
3. the WebSocket control path is available on the port the app reports,
4. one control action succeeds against a real slot,
5. you can return the endpoint to a known-good state with a simple recovery action.

That definition is intentionally modest. It does not require advanced networking, ROS, hardware integration, or multi-screen orchestration.

## The Readiness Loop

> TODO(content-model): Add a checklist here to compress the readiness loop into a stage-by-stage deployment gate a facilitator or operator could reuse. Best fit because this module is operational by design and the core value is a repeatable readiness procedure.

Run the checks in this order.

### 1. Confirm the face is really loaded

The first signal is not abstract health. It is whether the endpoint is showing a real face.

Healthy first signs:

1. the app is not stuck on `Loading...`,
2. the app is not in the `Error:` state,
3. the app is not still showing `No model loaded`,
4. the face is visible in the runtime view.

If you are still at `No model loaded`, use **Open GLB/GLTF File** or relaunch with `--glb <path-or-url>`.

If you are in the error state, the first recovery is to try another file. This page treats asset reload as the first recovery, not as a separate support workflow.

### 2. Confirm the runtime is ready

Once a face is loaded, the app exposes a direct runtime status in the top-right panel.

Treat `Runtime: ready` as the deployment-ready signal.

Do not treat `loading` as good enough, and do not assume a visible window means the runtime is healthy if the status stays at `error`.

When the runtime is ready, the app also exposes useful supporting signals:

1. `Face ID`,
2. `Constraints`,
3. `Outputs`,
4. `Path: rig/{faceId}/<path>`.

Those fields matter because they tell you the runtime has discovered controllable inputs and can map external writes into the loaded face.

### 3. Confirm the WebSocket server and port

The app starts the WebSocket server automatically and polls whether it is running.

Use the port shown in the UI as your source of truth. In the current app, the default is `9000`, so the normal first endpoint is:

```text
ws://localhost:9000
```

Treat the deployment as not yet healthy if:

1. the status still looks like `Starting...`,
2. the app cannot keep the server running,
3. the port you expect and the port the app reports do not match.

This page stays at the local first endpoint. It does not cover network exposure strategy or hardening.

### 4. Confirm slot discovery or path availability

Before sending a control write, confirm that the endpoint actually knows what can be controlled.

You can validate that in either of two simple ways:

1. use the built-in web control panel and let it discover slots dynamically,
2. ask the WebSocket endpoint to list slots.

A direct slot-list request looks like this:

```json
{
  "type": "list_slots",
  "path": "standard/vizij/left_eye"
}
```

A healthy response returns slot entries such as:

1. `standard/vizij/left_eye/pos/x`,
2. `standard/vizij/left_eye/pos/y`.

This matters because the standalone app writes incoming values to `rig/{faceId}/{path}` internally. If slot discovery fails or the path is wrong, the deployment is not operational yet even if the face is visible.

### 5. Confirm one successful control write

Do one small write before declaring success.

For the first endpoint, eye gaze is a good probe because it is visible and the repo already documents the common paths:

```json
{
  "type": "set_slot_values",
  "values": {
    "standard/vizij/left_eye/pos/x": { "f64": 0.5 },
    "standard/vizij/right_eye/pos/x": { "f64": 0.5 }
  }
}
```

The success response is:

```json
{ "type": "set_slot_values_resp", "success": true }
```

A visible eye change plus a successful response is the deployment proof you want.

If you instead receive an unknown-path error, do not keep guessing paths. Go back to slot discovery first.

### 6. Confirm basic recoverability with reset

The endpoint should not only accept one write. It should also recover cleanly.

Use the built-in panel’s reset control or invoke the reset method directly:

```json
{
  "type": "invoke",
  "method": "reset",
  "request_id": "req-1"
}
```

The success response is:

```json
{
  "type": "invoke_resp",
  "success": true,
  "request_id": "req-1"
}
```

After reset, the face should return toward its defaults rather than staying stuck in the last driven pose.

That is enough recoverability for this page. Deeper recovery chains belong in Support.

## First-Line Recovery

When the readiness loop fails, use this sequence before escalating.

> TODO(content-model): Add a failure-state example here to trace one believable broken endpoint, such as a visible face with a non-ready runtime or a reachable socket with unusable slot discovery, through the first recovery moves. Best fit because this page is teaching operational recovery and a worked failure trace would help readers recognize when each branch of the loop applies.

### Asset reload

Use this when:

1. the app is in `No model loaded`,
2. the face never appears,
3. the app enters its explicit error state after load.

Fast action:

1. return to the file picker with **Back** if needed,
2. open the GLB/GLTF again or choose another known-good asset,
3. wait for the runtime state to settle before checking anything else.

### Runtime readiness check

Use this when the face appears but the endpoint still does not feel operational.

Fast action:

1. verify the top-right panel reaches `Runtime: ready`,
2. confirm `Constraints` is not effectively empty for the face you expect to control,
3. confirm the `Face ID` and `rig/{faceId}/<path>` hint are present.

If the runtime never becomes ready, stop here and route to [Troubleshooting Matrix](../support/troubleshooting-matrix.md).

### WebSocket status and port check

Use this when runtime looks healthy but control does not work.

Fast action:

1. read the port from the app UI,
2. confirm the server status is running rather than still starting,
3. connect your client to that exact local endpoint.

If the control client is pointed at the wrong port, fix that before doing anything else.

### Slot discovery and path check

Use this when the socket is reachable but writes fail.

Fast action:

1. list slots or use the built-in control panel to discover them,
2. copy a real returned path,
3. retry with that exact path.

Do not infer path names from memory if the endpoint can tell you the current ones.

### One control write

Use this when you need to separate connection problems from runtime problems.

Fast action:

1. send one known numeric write to a discovered slot,
2. confirm the response reports success,
3. confirm the face changes visibly.

If the response is successful but nothing changes visually, treat that as a runtime or asset-level problem and escalate to Support.

### Reset behavior

Use this after a successful write or when the face has been driven into an unwanted state.

Fast action:

1. invoke `reset` from the panel or socket client,
2. confirm the face returns toward defaults,
3. rerun one small write to prove the loop still works.

## When To Escalate To Support

Escalate out of this page when any of these are true:

1. asset reload does not clear the problem,
2. the runtime never reaches `ready`,
3. the WebSocket server will not stay up on the reported port,
4. slot discovery fails or returns unusable paths,
5. a successful write does not produce visible behavior,
6. reset does not return the face to a stable default state.

At that point, continue to:

1. [Validation Checkpoints](../support/validation-checkpoints.md) if you need to restate the expected healthy state,
2. [Troubleshooting Matrix](../support/troubleshooting-matrix.md) if you need the broader symptom-to-recovery map.

## Success Check

You are done with this page when you can do all of these without guessing:

1. state what “deployed” means for the first standalone endpoint,
2. check face loaded, runtime ready, and local WebSocket availability in order,
3. discover a real slot or path before writing to it,
4. perform one successful control write,
5. use reset or asset reload to get back to a known-good state,
6. recognize when to stop and move into Support.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/vizij-standalone/README.md`
2. `vizij-web/apps/vizij-standalone/src/App.tsx`
3. `vizij-web/apps/vizij-standalone/src/hooks/useWebSocketSync.ts`
4. `vizij-docs/current_documentation/guidebook/deploy/easiest-standalone-deployment.md`
5. `vizij-docs/current_documentation/guidebook/deploy/operator-and-deployment-model.md`
6. `vizij-docs/current_documentation/guidebook/support/validation-checkpoints.md`
7. `vizij-docs/current_documentation/guidebook/support/troubleshooting-matrix.md`

## Next Step

If the endpoint passes this loop, the next useful move is to keep the support layer handy through [Validation Checkpoints](../support/validation-checkpoints.md).

If the endpoint does not pass this loop, go directly to [Troubleshooting Matrix](../support/troubleshooting-matrix.md).
