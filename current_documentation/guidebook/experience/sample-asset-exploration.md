<!-- tags: type=guidebook-module; status=written; topics=guidebook,experience,sample-assets,comparison -->

> **Last updated:** 2026-03-12
> **Purpose:** help readers compare sample face assets without confusing exploratory asset browsing with the maintained build route

# Sample Asset Exploration

## Guidebook Context

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Introduction](../introduction/README.md)<br>Current: [Experience](README.md)<br>Next: [Control](../control/README.md) |
| Depth ladder in this bucket | Above: [Hello Face Quickstart](hello-face-quickstart.md), [Richer Interactive Example](richer-interactive-example.md), [Existing Asset Sandbox](existing-asset-sandbox.md)<br>Current: `Advanced`<br>Below: none, this is the deepest current depth in this bucket |
| Module position in this bucket | Previous in bucket: [Existing Asset Sandbox](existing-asset-sandbox.md)<br>Current module: `Sample Asset Exploration`<br>Next in bucket: none, this is the last module in the bucket sequence |
| Reference bridges | [Runtime Quickstart Reference](../reference/runtime-quickstart-reference.md)<br>[Validation Checkpoints](../support/validation-checkpoints.md)<br>[Troubleshooting Matrix](../support/troubleshooting-matrix.md) |
| Module type | walkthrough |
| Bucket overview | [Experience](README.md) |

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
4. the curated sample registry in `demo-vizij-player`.

## Not Every Sample Serves The Same Teaching Job

In the current workspace, the visible sample inventory spans several kinds of assets:

1. raw faces in `vizij-assets/raw_faces`,
2. rigged or partially rigged faces such as Quori, Hugo, and Tiago variants,
3. faces already attached to maintained tutorial or player examples.

Those are not interchangeable.

The safest rule is:

prefer the sample that is already tied to the teaching job you actually want next.

## Walkthrough

Use this page as a guided decision lab for choosing the right sample for the next bucket.

The goal is not to browse everything. The goal is to pick one sample that is honest for the bucket you actually want next.

### 1. Start with the next bucket, not the prettiest face

Use this route-first table before you open anything else:

| If your next bucket is... | Start with this maintained sample anchor | Why it is the best first sample | What it does not prove yet |
| --- | --- | --- | --- |
| `Control` | `tutorial-fullscreen-face` / [Hello Face Quickstart](hello-face-quickstart.md) | the interaction path is already route-ready and visibly responsive | deeper control semantics or richer app-shell ownership |
| `Customize` | `vizij-authoring` preset path / [Tweak an Existing Face](../customize/tweak-an-existing-face.md) | the face is already editable inside authoring | import repair, deep rigging, or export readiness |
| `Integrate` | `demo-vizij-player` / [Minimal Web Player](../integrate/minimal-web-player.md) | the face already lives inside a believable player shell | deployment or operator topology |
| exploratory browsing only | `vizij-assets/raw_faces` and lightly prepared assets | useful for visual exploration or future prep work | route-ready teaching value on their own |

If a sample is not already tied to a maintained app anchor, treat it as exploratory by default.

### 2. Open one route-ready sample and one exploratory sample

Choose two comparison targets:

1. one route-ready sample from the table above,
2. one exploratory asset from `vizij-assets/raw_faces` or another lightly prepared source.

Use that pair to make the boundary visible:

1. the route-ready sample shows what the next bucket can immediately build on,
2. the exploratory sample shows what still needs more preparation, authoring, or validation before it can carry teaching weight.

Expected result:

1. one sample already has a believable next page,
2. the other sample is interesting, but not yet a trustworthy route anchor.

### 3. Compare the pair with four concrete questions

Ask these in order:

1. **Is there a maintained app anchor for it?**
   If not, it is probably exploratory rather than route-ready.
2. **Is it rigged enough for the next bucket you want?**
   A sample can be visually impressive and still be the wrong next choice.
3. **Does it match the bucket you actually want next?**
   A strong `Customize` sample is not automatically the best `Integrate` sample.
4. **Is it representative or just available?**
   Use the sample that teaches the next move honestly, not the one that merely exists in the repo.

### 4. Make the route decision immediately

Once the comparison is done, do not stay in asset-browsing mode.

Pick the next bucket and open the matching page now:

1. if the route-ready sample is best for hands-on interaction, continue to [First Control Interactions](../control/first-control-interactions.md),
2. if the route-ready sample is best for authoring ownership, continue to [Tweak an Existing Face](../customize/tweak-an-existing-face.md),
3. if the route-ready sample is best for app-shell work, continue to [Minimal Web Player](../integrate/minimal-web-player.md).

### 5. Write down what the chosen sample proves and what it does not

Before leaving this page, state the result in one short sentence:

1. `This sample is route-ready for <bucket> because ...`
2. `This sample is not yet enough for <other bucket> because ...`

That small discipline prevents the most common mistake in sample exploration:

confusing an interesting asset with a trustworthy next teaching step.

## Success Check

You are done with this page when:

1. you can explain why not every sample asset is equally useful for the same teaching goal,
2. you can choose a sample based on the next bucket you actually want,
3. you can tell when a sample is route-ready versus exploratory,
4. you know when to leave asset exploration and move into `Control`, `Customize`, or `Integrate`.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/demo-vizij-player/README.md`
2. `vizij-web/apps/demo-vizij-player/docs/runtime-react-walkthrough.md`
3. `vizij-web/apps/demo-vizij-player/src/data/samples.ts`
4. `vizij-web/apps/demo-vizij-player/src/App.tsx`
5. `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
6. `vizij-web/apps/vizij-authoring/README.md`

## Recommended Next Steps

1. If your chosen sample is best for hands-on interaction, continue to [First Control Interactions](../control/first-control-interactions.md).
2. If your chosen sample is best for authoring ownership, continue to [Tweak an Existing Face](../customize/tweak-an-existing-face.md).
3. If your chosen sample is best for app-shell work, continue to [Minimal Web Player](../integrate/minimal-web-player.md).
