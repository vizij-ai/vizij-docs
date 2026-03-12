<!-- tags: type=guidebook-module; status=written; topics=guidebook,introduction,architecture,mental-model -->

> **Last updated:** 2026-03-11
> **Purpose:** give readers the stable system mental model that makes later guidebook buckets easier to interpret correctly

# System Mental Model

## Reader Outcome

After this page, you should be able to explain the major parts of Vizij, how authored assets and runtime control relate, and which conceptual contracts stay stable as a face moves from authoring into integration and deployment.

## Intended Audience

This page is for readers who already know what Vizij is for, but do not yet have a reliable internal map of the system.

It is especially useful before going deeper into `Control`, `Customize`, `Integrate`, or `Deploy`.

## What You Need

You do not need package-level or crate-level knowledge to use this page.

It helps if you have already:

1. read [What Is Vizij?](what-is-vizij.md),
2. seen the main public route as `Hello Face -> Authoring -> Player -> Deployment`.

## Artifact Being Touched

The artifact here is the Vizij system model itself:

1. a face asset and its authored metadata,
2. a runtime shell that loads and coordinates that asset,
3. control contracts that let values move predictably through the system,
4. application and deployment surfaces that expose the face to real users or operators.

This page explains how those parts relate.

It does not teach detailed control semantics, authoring steps, or a repo-by-repo implementation audit.

## Why This Page Exists

Readers can reach a working face quickly in Vizij.

That is useful, but it also creates a common misunderstanding: the first visible surface can look like the whole system.

It is not.

Vizij is easier to reason about if you keep five layers distinct:

1. the face artifact,
2. the authored behavior bundled with it,
3. the runtime coordination layer,
4. the application surface that exposes it,
5. the deployment surface where it is actually operated.

This page exists to keep those layers separate before later buckets teach them in more detail.

## The Stable System Map

At the most useful learner level, Vizij is a relationship between four things:

1. authored assets,
2. runtime control,
3. integration surfaces,
4. deployment surfaces.

Those are connected by a small set of stable contracts rather than by one single app.

> TODO(content-model): Add a diagram here to show the relationship between authored assets, runtime control, integration surfaces, and deployment surfaces. Best fit because this section establishes the central fundamentals mental model and needs a visual map more than more prose.

### 1. Authored assets

An authored Vizij face is more than mesh data.

At runtime, the system expects a face asset, typically a GLB, plus Vizij-authored metadata that can include:

1. rig structure,
2. pose information,
3. animation information,
4. graph-driven behavior or related runtime definitions.

This is why authoring matters. It produces a face that is not only visible, but controllable and portable.

### 2. Runtime control

The runtime is the part that turns authored structure into live behavior.

The current architecture stays intentionally small:

1. the `renderer` applies values to the visible face,
2. the `orchestrator` coordinates execution and merges writes,
3. graph and animation controllers generate or transform values,
4. the `blackboard` holds shared typed state between controllers.

The important learner-level point is that Vizij does not treat a face as a passive clip player. It treats the face as something live controllers can drive frame by frame.

### 3. Integration surfaces

An integration surface is the application shell that loads a face and exposes it in a usable app context.

That shell is not the same thing as the asset and not the same thing as the runtime contracts underneath it.

Its job is usually to:

1. load the asset and its bundle,
2. boot the runtime,
3. render the face,
4. expose the controls, state, or interactions the app actually needs.

### 4. Deployment surfaces

A deployment surface is where the integrated system is actually run for an end user or operator.

In the current docs and roadmap, that includes browser/runtime deployments and the standalone branch.

Deployment is therefore a real endpoint of the builder path, not just another demo.

## One Face, Multiple Layers

A useful sentence to keep in mind is:

`the asset carries structure, the runtime executes behavior, the app exposes a use case, and deployment makes that use case real`

That sentence prevents several later confusions:

1. a player is not the same thing as the face,
2. a runtime provider is not the same thing as authoring,
3. deployment is not merely "opening the demo somewhere else."

> TODO(content-model): Add a comparison here to distinguish asset, runtime, app shell, and deployment surface in one quick-reference block. Best fit because this is the exact layer-separation point where readers commonly collapse adjacent concepts together.

## The Runtime Contracts That Stay Stable

Later pages go deeper into control vocabulary, but this page should name the contracts that make the whole system coherent.

### Typed paths

Vizij addresses values through stable paths.

In the architecture docs, this contract is named `TypedPath`.

A path says what a value means and where it belongs in the system. Graphs, animations, runtime inputs, and renderer-facing writes all rely on that idea.

This is one reason later control pages care so much about path shape: paths are the shared addressing system.

### Values and shapes

Vizij moves typed values through the runtime rather than untyped loose payloads.

At a learner level:

1. a `Value` is the actual typed payload,
2. a `Shape` is the expected structure of that payload,
3. a `TypedPath` tells the runtime what semantic slot that value belongs to.

You do not need every encoding detail yet. You do need to know that Vizij depends on these typed contracts to keep authoring, runtime, and integration aligned.

### The blackboard

The blackboard is the shared runtime state where controllers read and write typed-path values.

You can think of it as the coordination surface between authored behavior and the visible renderer:

1. controllers write there,
2. the orchestrator schedules and merges those writes,
3. the renderer ultimately applies the resulting values.

That is why the blackboard matters conceptually even if you never inspect it directly in early workflows.

## Where Authoring Fits

Authoring belongs before integration because it defines the controllable structure a later runtime can load.

At a fundamentals level, the key idea is simple:

1. rigs define what can be controlled,
2. poses define named states over those controls,
3. animations define authored motion over time,
4. procedural or graph-driven behavior defines computed behavior,
5. export packages the result into an artifact later runtime surfaces can use.

This page does not teach how to perform those steps. It only gives the conceptual placement of authoring inside the larger system.

For that vocabulary in more detail, the next page is usually [Customization Concepts Primer](customization-concepts-primer.md).

## Where Control Fits

Control is the bridge between authored capability and live behavior.

If authoring answers "what can this face do?", control answers "what values are being driven right now?"

That includes:

1. standard controls,
2. pose weights,
3. animation playback,
4. other typed runtime inputs.

This page intentionally does not teach the detailed control taxonomy. It only establishes that control is not a separate world from authoring or rendering. It is the live use of the authored structure through shared runtime contracts.

## Where The Public Route Fits

The public builder spine is still the best outward-facing route:

`Hello Face -> Authoring -> Player -> Deployment`

This page should help you interpret that route correctly:

1. `Hello Face` proves the runtime is real,
2. `Authoring` changes the artifact and its behavior definitions,
3. `Player` shows the runtime inside an application shell,
4. `Deployment` makes that application usable in a real operating context.

The route is a teaching sequence, not the literal architecture diagram.

## What This Page Teaches And What It Does Not

This page teaches:

1. the major system parts a learner should keep separate,
2. how authored assets, runtime coordination, app integration, and deployment relate,
3. which conceptual contracts remain stable across those layers,
4. how to interpret the public builder route without mistaking it for the internal package map.

This page does not teach:

1. detailed path semantics,
2. rigging or pose-authoring workflow steps,
3. package-by-package ownership,
4. deployment topology or operator procedures,
5. low-level ABI or file-format details.

Those belong to later bucket pages and deeper implementation docs.

## Misunderstandings This Page Should Prevent

1. thinking the first demo or player surface is the whole system,
2. confusing the face asset with the application shell that hosts it,
3. treating authoring concepts as separate from runtime control,
4. assuming deployment is only a UI packaging step,
5. assuming the guidebook buckets are the same thing as engineering boundaries.

## Success Check

You are done with this page when:

1. you can describe Vizij as authored assets plus runtime coordination plus application and deployment surfaces,
2. you can explain the distinct roles of the renderer, orchestrator, controllers, and blackboard at a high level,
3. you can explain why typed paths, values, and shapes matter even before learning their detailed syntax,
4. you can place `Hello Face`, `Authoring`, `Player`, and `Deployment` in the overall system without confusing them for one another.

## Implementation Anchors

Use these when you need the current implementation truth behind this page:

1. `vizij-docs/current_documentation/concepts/ARCHITECTURE_PRIMER.md`
2. `vizij-docs/current_documentation/ARCHITECTURE.md`
3. `vizij-docs/current_documentation/ROADMAP.md`
4. `vizij-web/apps/vizij-authoring/README.md`
5. `vizij-web/apps/vizij-authoring/docs/Authoring_Blueprint.md`
6. `vizij-web/apps/vizij-authoring/docs/pose_grouping_explainer.md`

## Next Step

1. If you want the customization vocabulary behind rigs, poses, animations, and export, continue to [Customization Concepts Primer](customization-concepts-primer.md).
2. If you want the control vocabulary behind runtime addresses and standard controls, continue to [Paths and Standard Controls](../control/paths-and-standard-controls.md).
