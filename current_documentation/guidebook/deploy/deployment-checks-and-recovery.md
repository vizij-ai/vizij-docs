<!-- tags: family=guidebook; type=guidebook-module; editorial_status=completed; publication_status=planned; topics=guidebook,deploy,validation,recovery,standalone -->

> **Last updated:** 2026-10-23
> **Purpose:** define the first deployment readiness loop and the fastest recovery path for the standalone endpoint

# Deployment Checks and Recovery

## Guidebook Context

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Integrate](../integrate/README.md)<br>Current: [Deploy](README.md)<br>Next: End of guidebook route |
| Depth ladder in this bucket | Above: [Easiest Standalone Deployment](easiest-standalone-deployment.md)<br>Current: `Fundamentals`<br>Below: [Hardware, ROS, and Multi-Screen Topologies](hardware-ros-and-multi-screen-topologies.md) |
| Module position in this bucket | Previous in bucket: [Operator and Deployment Model](operator-and-deployment-model.md)<br>Current module: `Deployment Checks and Recovery`<br>Next in bucket: [Hardware, ROS, and Multi-Screen Topologies](hardware-ros-and-multi-screen-topologies.md) |
| Reference bridges | [Animation, Integration, and Deployment Reference](../reference/animation-integration-and-deployment-reference.md)<br>[Validation Checkpoints](../support/validation-checkpoints.md)<br>[Troubleshooting Matrix](../support/troubleshooting-matrix.md) |
| Module type | operational guide |
| Bucket overview | [Deploy](README.md) |

## Reader Outcome

After this page, you should be able to decide whether the first Vizij deployment endpoint is actually deployed, run a compact readiness loop against that endpoint, and recover the most common first-line failures without drifting into a full support runbook.

## Module Notes

- Read this after [Easiest Standalone Deployment](easiest-standalone-deployment.md) and [Operator and Deployment Model](operator-and-deployment-model.md) when you need a repeatable readiness and first-recovery loop.
- The page assumes one real endpoint: `vizij-standalone`, one loaded face, and one operator path through the built-in panel or a direct WebSocket client.
- It stops before deep protocol debugging, hardening, and advanced topology work.

## What You Need

This page assumes:

1. `vizij-standalone` is already running or you are actively validating it,
2. you have a face asset available to load,
3. you already know the deployment surface from [Easiest Standalone Deployment](easiest-standalone-deployment.md),
4. you already understand the runtime-plus-operator model from [Operator and Deployment Model](operator-and-deployment-model.md).

This page does not repeat the standalone setup walkthrough, packaging steps, or deeper topology choices. It is the public-facing readiness and first-recovery layer once the standalone app is already in front of you.

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

Keep this compact gate beside the longer walkthrough:

| Stage | What to check | Healthy signal | First recovery move |
| --- | --- | --- | --- |
| 1. face loaded | app is not in `No model loaded`, `Loading...`, or explicit error state | face is visible | reload the asset or choose another known-good GLB |
| 2. runtime ready | the runtime panel reaches `ready` and shows useful fields such as `Face ID`, `Constraints`, or slot hints | runtime state is settled and controllable | stop and compare runtime state before testing the socket |
| 3. control service up | the app keeps the local port running and the reported endpoint matches your client target | `ws://127.0.0.1:<port>` is the live endpoint | reconnect to the exact port the app reports |
| 4. slot discovery works | the built-in panel populates or slot listing returns concrete entries | real slot names are discoverable | stop guessing slot names and copy a returned slot |
| 5. one write and reset succeed | a visible write lands and `reset` returns the face toward defaults | one successful control round trip plus recoverability | retry with discovered slots, then escalate if visible behavior still fails |

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
4. `Path: rig/{faceId}/<slot>`.

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

## Path Certainty Rule

Treat these as different evidence, not as interchangeable strings:

| String type | Example | Use it for |
| --- | --- | --- |
| runtime path | `rig/{faceId}/standard/vizij/left_eye/pos/x` | confirming which internal runtime path the app expects |
| deployment slot | `standard/vizij/left_eye/pos/x` | writing values from the built-in panel or a WebSocket client |

The fastest way to lose deployment confidence is to remember one of these forms and guess the other from memory.

Copy the deployment slot from the endpoint first, then use the runtime path only to confirm the bridge is targeting the face you think it is.

### 4. Confirm slot discovery or path availability

Before sending a control write, confirm that the endpoint actually knows what can be controlled.

You can validate that in either of two simple ways:

1. use the built-in web control panel and let it discover slots dynamically,
2. ask the WebSocket endpoint to list slots.

One filtered slot-list request can look like this:

```json
{
  "type": "list_slots",
  "path": "standard/vizij/left_eye"
}
```

If the loaded face exposes standard gaze slots, a healthy response may return entries such as:

1. `standard/vizij/left_eye/pos/x`,
2. `standard/vizij/left_eye/pos/y`.

This matters because the standalone app writes incoming values to `rig/{faceId}/{slot}` internally. If slot discovery fails or the slot is wrong, the deployment is not operational yet even if the face is visible.

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

If you instead receive an unknown-path error, do not keep guessing paths. Go back to slot discovery first and copy a real returned slot name.

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

Do not treat recovery as one blind checklist.

Start at the **first condition that is failing**, perform the matching action, and only continue when that condition has become healthy.

### Recovery Decision Table

| If this is the first failing condition... | Take this action now | Continue only when... |
| --- | --- | --- |
| the app is in `No model loaded`, stuck on `Loading...`, or in an explicit error state | reload the asset or choose another known-good GLB/GLTF | the face is visible and the app is no longer in a load or error state |
| the face is visible but the runtime panel is not `ready` | stop testing socket or control writes and check runtime readiness first | `Runtime: ready` is visible and the panel shows useful fields such as `Face ID`, `Constraints`, or slot hints |
| the runtime is ready but the control client is not clearly connected to the live endpoint | reconnect to the exact port the app reports | the server status is running and your client is pointed at that exact local endpoint |
| the socket is reachable but you do not yet have a trusted slot name to write to | run slot discovery or use the built-in panel to discover slots | you have copied one real returned slot name instead of guessing |
| you have a discovered slot but do not know whether control is actually working | send one small write to that exact discovered slot | the response reports success and the face changes visibly |
| the write worked but the face is now left in a driven or uncertain state | invoke `reset` and confirm recoverability | the face returns toward defaults and one small retry still works |

### Ordered Recovery Flow

Use this order only after you identify the first failed condition above.

### 1. Recover asset load state first

Enter here when:

1. the app is in `No model loaded`,
2. the face never appears,
3. the app enters its explicit error state after load.

Action:

1. return to the file picker with **Back** if needed,
2. open the GLB/GLTF again or choose another known-good asset,
3. wait for the runtime state to settle before checking anything else.

Continue only when:

1. the face is visible,
2. the app is no longer in the explicit load or error state,
3. you are back at a believable runtime surface rather than a broken load state.

### 2. Recover runtime readiness before testing control

Enter here when the face appears but the endpoint still does not feel operational.

Action:

1. verify the top-right panel reaches `Runtime: ready`,
2. confirm `Constraints` is not effectively empty for the face you expect to control,
3. confirm the `Face ID` and `rig/{faceId}/<slot>` hint are present.

Continue only when:

1. the runtime panel reports `ready`,
2. the runtime is exposing real control-related fields,
3. you are no longer guessing whether the face is actually controllable.

If the runtime never becomes ready, stop here and route to [Troubleshooting Matrix](../support/troubleshooting-matrix.md).

### 3. Recover endpoint connection clarity

Enter here when runtime looks healthy but control still does not work.

Action:

1. read the port from the app UI,
2. confirm the server status is running rather than still starting,
3. connect your client to that exact local endpoint.

Continue only when:

1. the reported port and the client target match,
2. the socket server is staying up,
3. you can stop asking whether the failure is just the wrong endpoint.

If the control client is pointed at the wrong port, fix that before doing anything else.

### 4. Recover path certainty through slot discovery

Enter here when the socket is reachable but writes fail or you are about to guess a path from memory.

Action:

1. list slots or use the built-in control panel to discover them,
2. copy a real returned slot name,
3. retry with that exact discovered value.

Continue only when:

1. you have one concrete slot name from the endpoint itself,
2. you are no longer inventing control strings,
3. the next write test is grounded in discovered runtime truth.

### 5. Recover confidence with one small write

Enter here when you have a discovered slot but still need to separate connection problems from runtime problems.

Action:

1. send one known numeric write to a discovered slot,
2. confirm the response reports success,
3. confirm the face changes visibly.

Continue only when:

1. the write returns success,
2. the face changes in a way you can actually observe,
3. you have proved that the control path is real rather than merely reachable.

If the response is successful but nothing changes visually, treat that as a runtime or asset-level problem and escalate to Support.

### 6. Recover a known-good state with reset

Enter here after a successful write or whenever the face has been driven into an unwanted state.

Action:

1. invoke `reset` from the panel or socket client,
2. confirm the face returns toward defaults,
3. rerun one small write to prove the loop still works.

Continue only when:

1. reset returns the face toward defaults,
2. the face is back in a state you trust,
3. a small retry confirms that recoverability still holds.

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
3. discover a real slot name before writing to it,
4. perform one successful control write,
5. use reset or asset reload to get back to a known-good state,
6. recognize when to stop and move into Support.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/vizij-standalone/README.md`
2. `vizij-web/apps/vizij-standalone/src/App.tsx`
3. `vizij-web/apps/vizij-standalone/src/hooks/useWebSocketSync.ts`
4. `vizij-web/apps/vizij-standalone/src-tauri/src/lib.rs`
5. `vizij-web/apps/vizij-standalone/src-tauri/src/connection_manager.rs`
6. `vizij-web/apps/vizij-standalone/src/hooks/aroraWsProtocol.ts` (app-local protocol types; formerly `@vizij/arora-types`)

## Recommended Next Steps

1. If the endpoint passes this loop and you need the deeper deployment branch, continue to [Hardware, ROS, and Multi-Screen Topologies](hardware-ros-and-multi-screen-topologies.md).
2. If the endpoint passes this loop and you want the support checklist beside you, keep [Validation Checkpoints](../support/validation-checkpoints.md) open as the reusable companion page.
3. If the endpoint does not pass this loop, go directly to [Troubleshooting Matrix](../support/troubleshooting-matrix.md).
