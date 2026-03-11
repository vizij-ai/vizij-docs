<!-- tags: type=guidebook-module; status=in_progress; topics=guidebook,integrate,loading,embedding,playback -->

> **Last updated:** 2026-03-11
> **Purpose:** explain the basic mechanics of getting a Vizij face loaded into a usable application surface and keeping that surface honest

# Loading, Playback, and Embedding

## Reader Outcome

After this page, you should be able to explain the three core integration ideas in the guidebook route: loading, playback, and embedding.

## Intended Audience

This page is for readers who already understand the minimal player stage and now need a clearer model of what the runtime is doing when an app becomes a usable Vizij surface.

## What You Need

It helps if you have already:

1. completed [Minimal Web Player](minimal-web-player.md),
2. read [Runtime Inputs and Semantics](../control/runtime-inputs-and-semantics.md),
3. seen at least one app built on `@vizij/runtime-react`.

## Artifact Being Touched

The artifact here is the integration chain itself:

1. a GLB or bundled face asset,
2. a runtime bundle description,
3. a provider that boots the runtime,
4. a face component or equivalent rendering surface,
5. optional hooks or application logic layered on top.

## Three Terms That Need To Stay Distinct

### 1. Loading

Loading is the moment the app acquires the asset and prepares the runtime.

That usually includes:

1. reading a GLB or equivalent asset source,
2. extracting or attaching rig, pose, and animation metadata,
3. creating the runtime bundle the provider will use,
4. surfacing loading or error states honestly.

### 2. Playback

Playback is what happens when the runtime actually drives the face over time.

This includes:

1. playing authored animations,
2. tweening values such as gestures or eye movement,
3. exposing a ready state where the face can respond predictably.

Playback can be very simple in a minimal player or much richer in a more interactive app.

### 3. Embedding

Embedding is how a Vizij runtime surface lives inside a broader application.

In React terms, the basic embedded pattern is:

1. create or supply an asset bundle,
2. wrap the page or feature in `VizijRuntimeProvider`,
3. render `VizijRuntimeFace`,
4. add only the hooks and UI that serve the page's purpose.

Embedding is the bridge from “a face exists” to “this face now belongs to my app.”

## What This Bucket Actually Needs To Teach

For the guidebook route, the `Integrate` bucket does not need to teach every possible application pattern at once.

At the fundamentals level, it needs to teach:

1. what is being loaded,
2. how the runtime surface reports loading, ready, and error states,
3. what counts as healthy playback,
4. how a face is embedded into a simple application shell,
5. where the boundary is between integration and deployment.

That is enough for the first real application understanding.

## How The Maintained Route Demonstrates These Ideas

`demo-vizij-player` demonstrates restrained application integration:

1. it loads a known-good face artifact,
2. it makes bootstrap and error states visible,
3. it exposes playback and diagnostics clearly,
4. it proves that a face can live in an application shell without becoming authoring or deployment.

`tutorial-agent-face` demonstrates that richer apps still build on the same base:

1. a runtime provider,
2. a runtime face,
3. application hooks,
4. additional control or API layers.

That is why this bucket exists before `Deploy`. Integration is where a face becomes part of a usable app surface, even before it becomes a standalone endpoint.

## A Small Integration Anatomy

The smallest recurring anatomy in the current repo is:

1. `VizijAssetBundle`
2. `VizijRuntimeProvider`
3. `VizijRuntimeFace`
4. application-specific hooks or panels

If a reader can identify those pieces, they can usually orient themselves in any maintained Vizij web app.

## Healthy Surface-Level Signals

At the surface level of this bucket, a reader should be able to confirm:

1. the asset actually loaded,
2. the runtime reached a usable state,
3. the face is visible,
4. a small amount of playback or interaction works,
5. errors are surfaced clearly when something fails.

If those signals are not visible, the application shell is not yet a trustworthy integration example.

## What This Page Should Prevent

Readers often confuse:

1. loading with playback,
2. a richer application example with a different runtime model entirely,
3. integration with deployment,
4. an application shell with an authoring or operator surface.

Keeping these terms separate prevents that confusion.

## Current Useful Visuals

Existing screenshots already live at:

1. `current_documentation/workshops/vizij-afternoon-workshop/assets/screenshots/demo-vizij-player.png`
2. `current_documentation/workshops/vizij-afternoon-workshop/assets/screenshots/tutorial-agent-face.png`

For this page, `demo-vizij-player` is the primary visual anchor and `tutorial-agent-face` is the richer comparative anchor.

## Success Check

You are done with this page when:

1. you can define loading, playback, and embedding in distinct terms,
2. you can point to the provider-plus-face pattern in a runtime app,
3. you can explain the minimum healthy signals of a trustworthy integration surface,
4. you can explain why integration is a separate bucket from deployment.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/packages/@vizij/runtime-react/README.md`
2. `vizij-web/apps/demo-vizij-player/src/App.tsx`
3. `vizij-web/apps/tutorial-agent-face/src/FaceApp.tsx`
4. `current_documentation/guidebook/reference/runtime-quickstart-reference.md`
5. `current_documentation/guidebook/reference/animation-integration-and-deployment-reference.md`

## Next Step

1. If your goal is the operator-facing endpoint, continue to [Operator and Deployment Model](../deploy/operator-and-deployment-model.md).
2. If you only need the first practical shell, keep [Minimal Web Player](minimal-web-player.md) as the compact route anchor.
