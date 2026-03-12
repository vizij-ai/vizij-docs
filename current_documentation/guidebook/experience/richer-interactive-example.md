<!-- tags: type=guidebook-module; status=written; topics=guidebook,experience,richer-example,tutorial-agent-face -->

> **Last updated:** 2026-03-11
> **Purpose:** show one maintained richer first-contact example without replacing the main beginner route

# Richer Interactive Example

## Reader Outcome

After this page, you should be able to explain what a richer first-contact Vizij experience looks like, what it proves beyond `Hello Face`, and why it is still an optional branch rather than the canonical first step.

## Intended Audience

This page is for readers who have already seen:

1. [Hello Face Quickstart](hello-face-quickstart.md),
2. [Existing Asset Sandbox](existing-asset-sandbox.md),
3. or one of the early `Integrate` pages.

It is for readers who want to see a more expressive, more application-shaped example before they decide whether to go deeper into `Integrate`.

## What You Need

The current maintained anchor for this page is `vizij-web/apps/tutorial-agent-face`.

If you want to run it:

```bash
pnpm --filter tutorial-agent-face dev
```

The app can be inspected as a richer surface without live connection, but the current conversation loop requires `VITE_GEMINI_API_KEY` to connect.

## Artifact Being Touched

The artifact here is a maintained richer sample experience:

1. a provider-backed runtime face,
2. local interaction around gaze and pose behavior,
3. a larger app shell with status and controls,
4. an optional live service-backed loop.

This is still an experience page because the reader is primarily observing what the system can feel like, not yet learning how to build it.

## Why This Page Exists

`Hello Face` is the right main route because it gives the fastest believable proof with the least setup.

That still leaves one real reader need:

some readers want to see what Vizij feels like when the face is part of a more expressive application surface.

This page exists to satisfy that need without distorting the main route.

It prevents three common misunderstandings:

1. thinking the simplest demo is the largest thing Vizij can feel like,
2. thinking richer interaction is the default beginner path,
3. thinking a richer example automatically proves deployment or production readiness.

## What The Current Example Adds

Compared with `Hello Face`, the maintained richer example adds:

1. a larger HUD around the face,
2. explicit connection controls,
3. transcript and session feedback,
4. optional function-calling behavior for gaze and expression,
5. more visible tuning surfaces such as voice and mouth mode.

That makes the example feel closer to an actual interactive application instead of a focused runtime tutorial.

> TODO(content-model): Add a comparison table here to contrast `Hello Face` with this richer example across shell complexity, optional service dependency, and teaching goal. Best fit because readers need to see why this branch is richer without mistaking it for the main route.

## What This Example Proves

This example proves:

1. a Vizij face can live inside a richer app shell,
2. the same provider-based runtime can support a more expressive experience,
3. richer interaction can combine local behavior and optional service-backed behavior,
4. the face can remain understandable even when the UI around it becomes more product-like.

That is enough to justify the example as an optional branch.

## What This Example Does Not Prove

This example does not prove:

1. that conversation or live service integration is required for Vizij,
2. that the app is the canonical first route,
3. that provider-specific configuration is the main thing new readers should learn,
4. that the example is already the deployment story.

Those are the boundaries that keep this page in `Experience` instead of letting it drift into `Integrate` or `Deploy`.

## How To Read This Example Correctly

The clean learner-facing interpretation is:

1. the face still uses the same core runtime ideas,
2. the richer shell adds more state, controls, and feedback,
3. optional live behavior makes the example more expressive,
4. if you want to understand how it is assembled, the next stop is `Integrate`, not another experience page.

That is the whole point of the page.

> TODO(content-model): Add an annotated screenshot here to call out the HUD, connection controls, transcript area, and face region. Best fit because this module is about reading a richer app-shaped surface correctly and the important teaching cues are spatial.

## A Good Reason To Choose This Branch

Use this richer example branch when you want:

1. a more product-shaped first impression,
2. a stronger sense of how a face can participate in a larger interactive loop,
3. motivation before committing to the deeper integration pages.

Do not choose it because you think it is the required setup for using Vizij at all.

## What This Page Does And Does Not Cover

This page does cover:

1. what makes the richer sample feel different from `Hello Face`,
2. what the sample proves,
3. where the sample stops and deeper integration teaching begins.

This page does not cover:

1. provider setup,
2. detailed API-backed architecture,
3. speech or viseme tuning internals,
4. deployment semantics.

Those belong in later buckets.

## Success Check

You are done with this page when:

1. you can explain why this example is richer than `Hello Face`,
2. you can explain why it is still optional,
3. you can describe what it proves without over-claiming production or deployment readiness,
4. you know that the next teaching step is `Integrate` if you want to understand how it is built.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/tutorial-agent-face/src/FaceApp.tsx`
2. `vizij-web/apps/tutorial-agent-face/AGENTS.md`
3. `current_documentation/guidebook/experience/hello-face-quickstart.md`
4. `current_documentation/guidebook/experience/existing-asset-sandbox.md`
5. `current_documentation/guidebook/integrate/api-backed-interactive-application.md`
6. `current_documentation/guidebook/integrate/rich-interactive-applications.md`

## Next Step

If you want to understand how this richer surface is assembled, continue to [API-Backed Interactive Application](../integrate/api-backed-interactive-application.md) or [Rich Interactive Applications](../integrate/rich-interactive-applications.md).

If you want to stay on the simplest maintained route, go back to [Hello Face Quickstart](hello-face-quickstart.md).
