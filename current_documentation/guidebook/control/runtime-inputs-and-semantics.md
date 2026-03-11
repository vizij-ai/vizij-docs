<!-- tags: type=guidebook-module; status=in_progress; topics=guidebook,control,inputs,semantics -->

> **Last updated:** 2026-03-11
> **Purpose:** explain what runtime inputs mean, where they are written, and how visible face behavior maps to runtime semantics

# Runtime Inputs and Semantics

## Reader Outcome

After this page, you should be able to explain what a Vizij runtime input is, how it relates to typed paths and values, and how visible behavior on a face maps to a more stable runtime meaning underneath.

## Intended Audience

This page is for readers who already understand the basic path vocabulary from [Paths and Standard Controls](paths-and-standard-controls.md) and now need the next layer of runtime reasoning.

## What You Need

It helps if you have already:

1. completed [Hello Face Quickstart](../experience/hello-face-quickstart.md),
2. read [Paths and Standard Controls](paths-and-standard-controls.md),
3. seen at least one runtime app show loading, ready, and error states.

## Artifact Being Touched

The artifact here is not a single app screen. It is the runtime contract that multiple Vizij surfaces rely on:

1. typed paths,
2. typed values,
3. staged runtime inputs,
4. blackboard reads and writes,
5. output paths that can later be observed or rendered.

## The Core Semantic Chain

Visible face behavior is usually the end of a longer chain:

1. an app or hook decides to set an input,
2. the input is staged under a path,
3. graphs and animations read and write values against the shared runtime state,
4. the renderer receives the resulting animatable values,
5. the user sees a face change.

That is why the same visual behavior can show up in multiple apps. The UI is not the whole story. The runtime meaning is more stable than the surface.

## What A Runtime Input Actually Is

A runtime input is a value written with an explicit meaning.

The important parts are:

1. the path, which says what the input refers to,
2. the value, which says what data is being written,
3. the shape or expected kind of data, which keeps the runtime deterministic.

In the architecture primer, this is the `TypedPath` plus `Value` plus `Shape` contract.

That contract matters because Vizij does not want a control system that only works inside one UI. Inputs have to survive movement across apps, bundles, runtime controllers, and deployment surfaces.

## Staging, Reading, and Writing

The runtime is designed so inputs are staged first and then consumed during the runtime step.

At a high level:

1. the app stages a value,
2. the orchestrator advances a frame,
3. graphs and animations evaluate against the current state,
4. output values are merged deterministically,
5. the renderer applies the resulting values.

This is different from directly mutating a scene or attaching view-only state to a slider. Vizij is intentionally closer to a runtime control pipeline.

## Common Semantic Categories

The most useful categories for guidebook readers are:

1. standard controls, which expose reusable channels such as gaze or shared rig movement,
2. pose weights, which expose named authored states,
3. viseme weights, which expose speech-related mouth behavior,
4. animation controls, which drive authored time-based motion,
5. renderer outputs, which can be observed for UI, diagnostics, or logging.

These categories can all show up as paths, but they do not mean the same thing.

## Why Semantics Matter More Than UI Labels

Two controls can look similar in a UI and still represent different semantics.

For example:

1. a slider that writes `rig/{face}/standard/left_eye/pos/x` is steering a reusable rig channel,
2. a slider that writes `rig/{face}/poses/smile.weight` is blending a named authored state,
3. a speech-driven system may write viseme weights or animation-related channels without the user touching a control at all.

The visible widget is just a surface. The runtime meaning is the important teaching target.

## Where Readers See These Semantics In Practice

You can already see the semantic layers in the maintained apps:

1. `tutorial-fullscreen-face` stages gaze and pose inputs through tutorial hooks,
2. `tutorial-agent-face` layers conversation-driven viseme and expression behavior on top of the same runtime concepts,
3. `demo-vizij-player` exposes loading state, controllers, and output paths in a more application-like shell,
4. `vizij-standalone` maps externally driven values into deployment-facing control slots.

Those apps are different surfaces, but the runtime language underneath them is continuous.

## A Useful Mental Model

If a reader gets lost, return to this question:

`What value is being written, to which path, by which part of the runtime, and why?`

That question usually clarifies whether the reader is dealing with:

1. a user input,
2. an authored pose or animation,
3. a derived controller output,
4. a deployment-facing control signal.

## Current Useful Diagram

Wave 2 should add a simple runtime-semantics diagram showing:

1. app or hook,
2. staged input,
3. orchestrator and controllers,
4. renderer output,
5. visible face behavior.

Until then, the architecture primer is the best current textual diagram.

## Success Check

You are done with this page when:

1. you can explain why runtime inputs are more stable than any one UI,
2. you can distinguish staged inputs from rendered outputs,
3. you can describe how standard controls, poses, visemes, and animation-related values differ semantically.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `current_documentation/concepts/ARCHITECTURE_PRIMER.md`
2. `vizij-web/packages/@vizij/runtime-react/README.md`
3. `vizij-web/apps/tutorial-fullscreen-face/src/hooks/useMouseGaze.ts`
4. `vizij-web/apps/tutorial-agent-face/src/FaceApp.tsx`
5. `vizij-web/apps/vizij-standalone/src/hooks/useWebSocketSync.ts`

## Next Step

1. If you want to see how these runtime ideas become an application shell, continue to [Loading, Playback, and Embedding](../integrate/loading-playback-and-embedding.md).
2. If you want to stay on the fundamentals path inside `Control`, keep [Paths and Standard Controls](paths-and-standard-controls.md) nearby as the simpler vocabulary bridge.
