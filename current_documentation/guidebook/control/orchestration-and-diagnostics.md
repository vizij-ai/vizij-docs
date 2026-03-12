<!-- tags: type=guidebook-module; status=written; topics=guidebook,control,orchestration,diagnostics -->

> **Last updated:** 2026-03-11
> **Purpose:** teach how Vizij runtime control actually executes frame to frame and how to diagnose control failures without drifting into deployment or authoring runbooks

# Orchestration and Diagnostics

## Guidebook Context

1. **Bucket:** [Control](README.md)
2. **Depth:** `Advanced`
3. **Module type:** operational guide
4. **Bucket overview:** [Control](README.md)
5. **Useful previous module:** [Control Surfaces and Configuration Layers](control-surfaces-and-configuration-layers.md)
6. **Useful next module:** [Control](README.md)

## Reader Outcome

After this page, you should be able to trace a control action through the Vizij runtime in the right order:

1. readiness,
2. staged input writes,
3. orchestrator scheduling and merge,
4. blackboard updates,
5. renderer outputs,
6. visible face behavior.

You should also be able to recognize where that chain is breaking when control does not behave as expected.

## Module Notes

### Intended Audience

This page is for readers who already understand:

1. path vocabulary from [Paths and Standard Controls](paths-and-standard-controls.md),
2. runtime meaning from [Runtime Inputs and Semantics](runtime-inputs-and-semantics.md),
3. the difference between runtime-facing control and deployment-facing surfaces from [Control Surfaces and Configuration Layers](control-surfaces-and-configuration-layers.md).

It is an advanced control page, not a getting-started page.

### Why This Page Exists

This page needs to exist separately because readers often understand paths and input semantics but still cannot explain why a real runtime control succeeds, lags, conflicts, or appears to do nothing.

The main misunderstanding it prevents is treating runtime control as a direct UI-to-renderer mutation.

Vizij does not work that way. A control action usually succeeds only if the full runtime chain is healthy:

1. the runtime is actually ready,
2. the write is staged to the expected path,
3. the orchestrator steps and merges controllers,
4. the blackboard ends up with the intended values,
5. the renderer receives outputs that correspond to animatables on the loaded face.

If you skip that model, debugging becomes guesswork.

### Artifact Being Touched

The artifact here is the runtime execution chain itself:

1. `VizijRuntimeProvider` lifecycle and status,
2. staged input writes from hooks, drivers, or external clients,
3. orchestrator scheduling and merge behavior,
4. shared blackboard state,
5. renderer-facing output application,
6. observability surfaces that reveal which stage failed.

### What This Page Covers and Does Not Cover

This page covers:

1. how runtime control executes in practice,
2. how `@vizij/runtime-react` stages writes before a step,
3. how orchestrator schedule and merge affect results,
4. how to inspect likely failure points,
5. how to use standalone and WebSocket material as adjacent diagnostic evidence.

This page does not cover:

1. full path grammar,
2. core semantic categories in depth,
3. authoring graph construction,
4. packaging or CLI walkthroughs,
5. network hardening,
6. deployment support runbooks.

For those, branch later into `Integrate` or `Support`.

## What You Need

It helps if you have already looked at:

1. `tutorial-fullscreen-face`,
2. `@vizij/runtime-react`,
3. one operational control surface such as `vizij-standalone`.

You do not need to know authoring internals or deployment packaging details to use this page.

## The Runtime Control Chain

> TODO(content-model): Add a timeline diagram here to show the runtime chain from readiness through staged inputs, orchestrator merge, blackboard updates, renderer outputs, and visible face behavior. Best fit because this module's central teaching goal is sequence-sensitive reasoning and a timeline would make the failure order easier to retain.

The practical execution model is:

```text
ready runtime
-> host stages inputs
-> orchestrator steps controllers
-> controller writes are merged
-> blackboard state advances
-> renderer-facing values are applied
-> visible face output changes
```

That sequence matters. A failure earlier in the chain can make later surfaces look broken even when they are healthy.

### 1. Readiness gates whether control is meaningful

In `tutorial-fullscreen-face`, `FaceApp.tsx` distinguishes three learner-visible states before successful control:

1. `Loading face…`
2. `Initialising orchestrator…`
3. ready runtime

It also renders an error state when initialization fails.

This is not cosmetic. The runtime hooks are only trustworthy once the provider is ready. The app also calls `stagePoseNeutral()` after readiness so the bundle's neutral pose baseline is staged before interaction.

The first diagnostic rule is therefore:

If the runtime is not ready, do not reason about hotkeys, pointer control, or external slot updates yet.

### 2. Host code stages writes, not scene mutations

In `useMouseGaze.ts`, pointer movement is converted into normalized values and written through `setInput(...)` to paths like:

1. `rig/{faceId}/standard/left_eye/pos/x`
2. `rig/{faceId}/standard/right_eye/pos/y`

In `usePoseHotkeys.ts`, key presses call `animateValue(...)` against pose-derived paths such as:

1. `rig/{faceId}/{group}/{pose_slug}.weight`

The runtime-react README makes the staging rule explicit: inputs are buffered in a per-frame buffer and flushed together before each `step()`.

That means a hook can look correct in UI code and still fail later because:

1. it wrote the wrong path,
2. it wrote under the wrong face id or namespace,
3. the runtime never stepped,
4. a later controller or merge policy overrode the result.

### 3. The orchestrator is the execution coordinator

The architecture primer defines the orchestrator as the coordinator between controllers and the renderer.

Its responsibilities are:

1. schedule graphs and animations,
2. apply their writes deterministically,
3. merge results into a consistent frame,
4. emit the frame's merged writes and conflicts.

The current documented schedules are:

1. `SinglePass`: animations then graphs,
2. `TwoPass`: graphs then animations then graphs.

That distinction matters when diagnosing behavior that seems one frame late, overridden, or dependent on feedback between controllers.

### 4. Merge behavior determines what survives conflicts

Two different layers of merge matter in the current implementation:

1. controller execution inside an orchestrator frame, where conflicts are surfaced in frame diagnostics,
2. explicit merged-graph registration, where strategies such as `error`, `namespace`, and blend-like policies decide how overlapping outputs are handled.

For guidebook readers, the practical lesson is simple:

If multiple controllers can produce the same target path, you must assume merge behavior can change what finally reaches the blackboard.

Do not assume the last UI event automatically wins.

### 5. Blackboard state is the shared runtime truth between controllers

The blackboard is the shared typed-path state that graphs and animations read and write.

This is why Vizij control can span multiple surfaces:

1. a pointer hook can stage inputs,
2. a graph can transform them,
3. an animation can add or blend time-based changes,
4. the renderer can then apply the resolved values.

The blackboard is also why diagnosis should ask:

`Did the path get staged?`

then:

`Did the orchestrator produce the expected merged write?`

and only then:

`Did the renderer show the intended change?`

### 6. Renderer outputs are the end of the chain, not the whole chain

The visible face is evidence, but it is late evidence.

`@vizij/runtime-react` exposes `outputPaths`, and `@vizij/orchestrator-react` exposes frame and path subscriptions such as `useOrchFrame()` and `useOrchTarget(path)`.

Those are the surfaces that let you distinguish:

1. no input staged,
2. input staged but no merged output,
3. merged output exists but does not correspond to the expected face or animatable,
4. renderer output changed but the visible effect is subtle or filtered.

## A Reliable Diagnostic Order

> TODO(content-model): Add a checklist here to summarize the six-step diagnostic order into a compact reusable operator flow. Best fit because this advanced operational guide is teaching a repeatable procedure that readers should be able to scan under pressure.

When control fails, inspect in this order.

### 1. Confirm lifecycle status first

Check the runtime status surface before inspecting paths.

In current runtime-react docs and types, the useful fields are:

1. `loading`
2. `ready`
3. `error`
4. `errors`
5. `outputPaths`
6. `controllers`

For failures, the documented error `phase` values are:

1. `assets`
2. `orchestrator`
3. `registration`
4. `animation`
5. `bridge`
6. `driver`
7. `unknown`

Use those phases to narrow the failure domain quickly.

Examples:

1. `assets` means do not start debugging control paths yet.
2. `registration` suggests the bundle or controller registration did not complete cleanly.
3. `driver` points at input-driver lifecycle problems rather than rig semantics.
4. `animation` means time-based control may be failing even if direct `setInput` writes still work.

### 2. Verify the exact path being written

Do not debug "gaze" or "a pose" abstractly. Debug the actual path string.

Minimal checks:

1. does the path include the expected `rig/{faceId}/...` prefix,
2. is the face id lowercased the same way the current hooks expect,
3. is the group or channel name the one the loaded bundle actually exported,
4. if the surface is namespace-aware, are you looking at a namespaced path or a short path.

This prevents a common advanced mistake:

The control surface looks correct conceptually, but the runtime write is landing on a path no registered controller or renderer output actually uses.

### 3. Check namespace and face identity together

Namespace mismatch and face mismatch are easy to confuse.

The runtime-react docs describe namespacing for shared orchestrators. The standalone WebSocket hook also normalizes incoming slot paths and rebuilds a full runtime path as:

`rig/${faceId}/${normalizedPath}`

It then uses `${namespace}/${fullPath}` when reading from orchestrator snapshots.

That gives you a concrete diagnostic rule:

1. if writes appear to vanish in a shared runtime, inspect namespace first,
2. if writes target the wrong or a nonexistent face, inspect `faceId`,
3. if short slot paths work in one surface but not another, inspect the normalization boundary between external slot names and internal rig paths.

### 4. Check constraints, defaults, and reset behavior

The standalone hook uses `inputConstraints` as a source of:

1. slot discovery,
2. default values,
3. min and max metadata,
4. reset behavior.

This is useful well beyond standalone.

Minimal diagnostics:

1. if a slot never appears, inspect whether the runtime exposed any matching input constraints,
2. if reset behaves strangely, compare current values against constraint defaults,
3. if a surface initializes local values from defaults, confirm the defaults match the loaded face rather than an older bundle,
4. if the system "works once" and then returns to neutral, inspect whether a reset or neutral-stage flow is intentionally writing zeros or default values back in.

This is exactly the kind of issue that can feel like a renderer bug when it is actually a slot/default lifecycle issue.

### 5. Check whether the orchestrator is stepping and merging

If paths and status look correct but nothing visible changes, inspect orchestrator evidence.

The current observability anchors are:

1. `useOrchFrame()` for latest frame data,
2. `useOrchTarget(path)` for a single blackboard path,
3. frame fields such as `merged_writes` and `conflicts`,
4. runtime `outputPaths`.

Healthy questions to ask:

1. did a new frame step at all,
2. does the expected path show up in `merged_writes`,
3. are there conflicts on that path,
4. is the write present only under a namespaced key you were not watching,
5. is the expected output absent because no controller publishes that path.

If `merged_writes` is empty, the orchestrator-wasm README explicitly points to a useful first check: confirm that a controller actually emits output paths.

### 6. Check whether the renderer side has a matching target

A merged write is necessary, but it is not sufficient.

You still need a renderer-facing path or animatable bridge that corresponds to the loaded face.

This is where face mismatch and bundle mismatch often show up:

1. writes are present,
2. the runtime appears healthy,
3. but the loaded GLB or bundle metadata does not line up with the control paths you are producing.

That is why the architecture primer warns that face identity must stay consistent across rig graphs, pose configs, and bundles.

## Common Failure Patterns

> TODO(content-model): Add a failure-state example here to show one concrete symptom-to-breakpoint trace, such as inputs staging successfully while renderer-visible change still fails. Best fit because this section is about diagnosis and a worked failure example would turn the abstract chain into a believable debugging pattern.

### Runtime never becomes ready

Likely checks:

1. inspect `error` and `errors` before touching control code,
2. use `phase` to separate asset load failure from orchestrator creation or registration failure,
3. do not trust downstream diagnostics until `ready` is true.

### Pointer or hotkey control does nothing in the tutorial app

Likely checks:

1. confirm the UI is past `Loading face…` and `Initialising orchestrator…`,
2. verify the face bundle included pose data if hotkeys are expected,
3. inspect the full `rig/{faceId}/...` path being written,
4. confirm no neutral-stage or key-up flow is resetting the same path immediately.

### External slot updates arrive but the face does not change

Likely checks:

1. inspect how the incoming slot name is normalized,
2. confirm the short slot path maps to the same face and namespace the runtime uses,
3. compare against `inputConstraints` to see whether the slot exists and what its default is,
4. inspect `getPathSnapshot`, `useOrchTarget`, or `merged_writes` before blaming rendering.

### The wrong control appears to move or nothing obvious changes

Likely checks:

1. inspect path mismatch first,
2. inspect namespace and face mismatch second,
3. inspect whether the value is being written to a subtle channel rather than a pose-like channel,
4. inspect whether a blend or conflict policy is diluting the visible result.

### Control works in one app but not another

Likely checks:

1. compare lifecycle handling,
2. compare namespace and face resolution,
3. compare whether the app writes short slot paths or fully qualified rig paths,
4. compare whether one app stages neutral or reset values automatically.

## What Good Observability Looks Like

For advanced control work, a healthy runtime surface usually gives you at least:

1. visible `loading`, `ready`, and `error` status,
2. the current `namespace` and `faceId`,
3. error history with `phase`,
4. controller registration visibility,
5. a way to inspect `outputPaths`,
6. a way to inspect frame-level writes and conflicts,
7. a way to compare current values against defaults or constraints.

Without those surfaces, you are forced to debug from the visible face alone, which is the least informative stage in the pipeline.

## Route Forward

Once you understand this execution model:

1. go to `Integrate` if you need to build richer application shells around the runtime,
2. go to `Support` if you need broader recovery patterns and route-level troubleshooting,
3. go to `Customize` only if the issue is really authored rig or bundle content rather than runtime execution.

## Success Check

You are done with this page when:

1. you can explain why readiness is part of control diagnosis rather than a separate concern,
2. you can describe the runtime chain from staged input to renderer output,
3. you know where merge and blackboard state fit into that chain,
4. you can name the first checks for path mismatch, namespace mismatch, face mismatch, and slot/default/reset problems,
5. you can say when an issue belongs in `Integrate` or `Support` rather than deeper control reasoning.

## Implementation Anchors

Use these when you need the current implementation truth:

1. [ARCHITECTURE_PRIMER.md](/home/chris/Code/Semio/vizij_ws/vizij-docs/current_documentation/concepts/ARCHITECTURE_PRIMER.md)
2. [runtime-react README.md](/home/chris/Code/Semio/vizij_ws/vizij-web/packages/@vizij/runtime-react/README.md)
3. [FaceApp.tsx](/home/chris/Code/Semio/vizij_ws/vizij-web/apps/tutorial-fullscreen-face/src/FaceApp.tsx)
4. [useMouseGaze.ts](/home/chris/Code/Semio/vizij_ws/vizij-web/apps/tutorial-fullscreen-face/src/hooks/useMouseGaze.ts)
5. [usePoseHotkeys.ts](/home/chris/Code/Semio/vizij_ws/vizij-web/apps/tutorial-fullscreen-face/src/hooks/usePoseHotkeys.ts)
6. [vizij-standalone README.md](/home/chris/Code/Semio/vizij_ws/vizij-web/apps/vizij-standalone/README.md)
7. [useWebSocketSync.ts](/home/chris/Code/Semio/vizij_ws/vizij-web/apps/vizij-standalone/src/hooks/useWebSocketSync.ts)
8. [orchestrator-react README.md](/home/chris/Code/Semio/vizij_ws/vizij-web/packages/@vizij/orchestrator-react/README.md)

## Next Step

If your next problem is application assembly, continue to the `Integrate` bucket, especially the maintained integration modules that explain loading and embedding around the runtime.

If your next problem is broader recovery or failure triage, continue to [Troubleshooting Matrix](../support/troubleshooting-matrix.md).
