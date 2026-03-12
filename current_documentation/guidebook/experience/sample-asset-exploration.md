<!-- tags: type=guidebook-module; status=written; topics=guidebook,experience,sample-assets,comparison -->

> **Last updated:** 2026-03-11
> **Purpose:** help readers compare sample face assets without confusing exploratory asset browsing with the maintained build route

# Sample Asset Exploration

## Guidebook Context

1. **Bucket:** [Experience](README.md)
2. **Depth:** `Advanced`
3. **Module type:** walkthrough
4. **Bucket overview:** [Experience](README.md)
5. **Useful previous module:** [Existing Asset Sandbox](existing-asset-sandbox.md)
6. **Useful next module:** [Experience](README.md)

## Reader Outcome

After this page, you should be able to compare current sample face assets by teaching usefulness, choose a sensible sample for your next step, and explain where sample exploration stops and deeper `Control`, `Customize`, or `Integrate` work begins.

## Module Notes

### Intended Audience

This page is for readers who already understand the quick sample experience and now want to look across the visible sample set more deliberately.

It is especially for readers asking:

1. which face should I use next,
2. which sample is actually maintained enough to teach from,
3. when does browsing assets stop being helpful and deeper work begin.

### Why This Page Exists

The sample set is useful, but it can also mislead readers if every asset is treated as equally ready for every route.

This page exists to prevent three mistakes:

1. choosing a sample only because it looks interesting,
2. assuming every sample is equally controllable or equally well anchored in maintained apps,
3. treating exploratory asset browsing as if it were the customization pipeline.

The right sample choice reduces confusion later.

### Artifact Being Touched

The artifact here is the sample asset set itself:

1. raw faces,
2. rigged faces,
3. example assets already tied to maintained apps,
4. the decision about which asset is appropriate for which learning goal.

This is still an `Experience` page because the reader is comparing what is available before committing to deeper authoring or integration work.

### What This Page Does And Does Not Cover

This page does cover:

1. how to choose a sensible sample for the next learning step,
2. how to avoid over-generalizing from one asset,
3. how to distinguish route-ready samples from exploratory ones.

This page does not cover:

1. full asset acquisition policy,
2. asset QA or CI gating,
3. deep rig standardization work,
4. the complete customization pipeline.

Those belong elsewhere.

## What You Need

It helps if you have already read:

1. [Existing Asset Sandbox](existing-asset-sandbox.md),
2. [Tweak an Existing Face](../customize/tweak-an-existing-face.md),
3. [Minimal Web Player](../integrate/minimal-web-player.md).

The current sample inventory is best grounded by:

1. `vizij-assets`,
2. `demo-vizij-player`,
3. `tutorial-fullscreen-face`,
4. the workshop source audit in `vizij-docs`.

## Not Every Sample Serves The Same Teaching Job

In the current workspace, the visible sample inventory spans several kinds of assets:

1. raw faces in `vizij-assets/raw_faces`,
2. rigged or partially rigged faces such as Quori, Hugo, and Tiago variants,
3. faces already attached to maintained tutorial or player examples.

Those are not interchangeable.

The safest rule is:

prefer the sample that is already tied to the teaching job you actually want next.

## A Practical Comparison Frame

When comparing sample assets, ask four questions.

> TODO(content-model): Add a comparison table here to score the current sample assets by maintained app anchor, rig readiness, representative teaching value, and best next bucket. Best fit because this module is explicitly comparative and readers need a compact decision surface, not prose alone.

### 1. Is there a maintained app anchor for this asset

If a sample already appears in a maintained tutorial or player surface, it is usually a better teaching choice than a visually interesting asset with no current walkthrough anchor.

That is the difference between:

1. exploring an asset,
2. learning from an asset.

### 2. Is the asset already rigged enough for your goal

Some assets are useful because they are already bound to a believable control or playback path.

Others are better treated as raw material for later authoring work.

If your goal is fast proof, pick the asset that is already route-ready.

If your goal is authoring ownership, pick the asset that makes the next customization step believable.

### 3. Does the sample match your next bucket

Choose by next step:

1. if you want more runtime interaction, prefer a sample already tied to `Experience`, `Control`, or `Integrate`,
2. if you want to author changes, prefer a sample that has a believable path into `Customize`,
3. if you want to compare visual behavior only, stay in `Experience` and do not pretend you are already customizing or deploying.

### 4. Is the sample representative or just exploratory

Some samples are useful for exploration but not for the maintained public route.

That is fine, as long as it stays explicit.

Exploratory assets should not quietly become canonical teaching examples just because they are available.

## The Current Healthy Way To Use Sample Assets

The healthiest current sample-asset behavior is:

1. use maintained app anchors first,
2. treat rigged and route-ready samples as the easiest next step,
3. treat raw or lightly prepared assets as exploratory unless the guidebook says otherwise,
4. move into `Customize` only when the goal is to change the artifact rather than compare it.

This keeps sample exploration honest.

> TODO(content-model): Add a guided lab here to have readers pick two sample assets, justify which route each supports, and name the first page they should open next. Best fit because this is an advanced Experience page and a guided lab would turn the comparison framework into actual decision practice.

## Success Check

You are done with this page when:

1. you can explain why not every sample asset is equally useful for the same teaching goal,
2. you can choose a sample based on the next bucket you actually want,
3. you can tell when a sample is route-ready versus exploratory,
4. you know when to leave asset exploration and move into `Control`, `Customize`, or `Integrate`.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-assets`
2. `vizij-web/apps/demo-vizij-player/src/App.tsx`
3. `vizij-web/apps/tutorial-fullscreen-face/src/FaceApp.tsx`
4. `current_documentation/guidebook/experience/existing-asset-sandbox.md`
5. `current_documentation/guidebook/customize/tweak-an-existing-face.md`
6. `current_documentation/ROADMAP.md`
7. `current_documentation/workshops/vizij-afternoon-workshop/planning/source-audit.md`

## Next Step

If you want to keep interacting with a maintained sample, continue to [Existing Asset Sandbox](existing-asset-sandbox.md) and then into `Control`.

If you want to start changing the chosen artifact, continue to [Tweak an Existing Face](../customize/tweak-an-existing-face.md).

If you want to load a chosen face into a real app shell, continue to [Minimal Web Player](../integrate/minimal-web-player.md).
