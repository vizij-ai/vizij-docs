<!-- tags: type=guidebook-module; status=written; topics=guidebook,introduction,customize,concepts -->

> **Last updated:** 2026-03-11
> **Purpose:** give readers the core customization vocabulary before they enter the authoring branch

# Customization Concepts Primer

## Reader Outcome

After this page, you should be able to explain the major customization concepts that show up later in the guidebook: rigs, poses, animations, procedural programs, and the artifacts that carry them forward.

## Intended Audience

This page is for readers who are not ready to author yet, but do need a clean conceptual map of the terms used in the `Customize` bucket.

## What You Need

You do not need to have used `vizij-authoring` yet.

It helps if you have already:

1. read [How To Use This Guidebook](how-to-use-this-guidebook.md),
2. seen at least one working Vizij face in the `Experience` bucket.

## Why This Page Exists

Readers often need to understand the words before they understand the workflow.

Without that vocabulary, the `Customize` bucket can feel like a wall of unexplained concepts:

1. rig
2. pose
3. animation
4. procedural program
5. exportable bundle or authored artifact

This page gives the conceptual layer first, so later customization pages can focus on actual authoring work.

## The Core Concepts

### Rig

A rig is the controllable structure of the face.

In Vizij terms, the rig is the layer that gives stable, meaningful control channels to what would otherwise just be raw scene or animatable data.

That is why rigging matters: it turns a face from geometry into something you can control predictably.

### Pose

A pose is a named facial state or authored expression.

Instead of manually adjusting many controls every time, a pose lets you refer to a meaningful state such as a smile, blink, or surprised expression and then blend that state in by weight.

### Animation

An animation is authored motion over time.

Where a pose is a state, an animation is a timed sequence of value changes. In practice, that means a face can move through an authored clip rather than only jumping to one named state.

### Procedural Program

A procedural program is authored behavior that computes values rather than storing a fixed pose or fixed clip.

This is the concept that lets authored logic shape behavior dynamically. It is the most graph-like customization concept in the current guidebook.

### Exportable Artifact

Customization work has to leave authoring in a form later stages can use.

In Vizij, that usually means some combination of:

1. the face asset itself,
2. rig information,
3. pose data or pose configuration,
4. animation data,
5. bundled metadata that later runtime or deployment surfaces can load.

That is why `Export` belongs in `Customize` even though it also affects `Integrate` and `Deploy`.

> TODO(content-model): Add a comparison here to distinguish rig, pose, animation, procedural program, and exportable artifact in one compact teaching block. Best fit because this section introduces a cluster of adjacent terms that readers will otherwise blur together before they reach the Customize bucket.

## How These Concepts Relate

A useful mental model is:

1. the rig defines what can be controlled,
2. poses define named states over those controls,
3. animations define authored motion over time,
4. procedural programs define computed or graph-driven behavior,
5. export carries the authored result into later runtime surfaces.

This is not yet the authoring workflow. It is the conceptual stack underneath it.

> TODO(content-model): Add a diagram here to show the conceptual stack from controllable structure through exported artifact. Best fit because this section is already phrased as a layered mental model and would benefit from a visual ordering cue.

## What This Page Is Not

This page does not teach:

1. how to import a face,
2. how to create a pose group,
3. how to keyframe an animation,
4. how to edit a procedural graph,
5. how to export a finished asset.

Those are `Customize` modules.

## Why This Belongs In Introduction

These concepts appear early in the public story, even when a reader is still deciding whether they need the full customization branch.

So this page belongs in `Introduction` because it helps the reader interpret later buckets before they have to commit to an authoring workflow.

## Success Check

You are done with this page when:

1. you can explain the difference between a rig, a pose, an animation, and a procedural program,
2. you can explain why export is part of the customization story,
3. you can enter `Customize` without those terms feeling undefined.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/vizij-authoring/README.md`
2. `vizij-web/apps/vizij-authoring/docs/Authoring_Blueprint.md`
3. `vizij-web/apps/vizij-authoring/docs/pose_grouping_explainer.md`
4. `current_documentation/concepts/ARCHITECTURE_PRIMER.md`
5. `current_documentation/guidebook/customize/README.md`

## Next Step

1. If you want the broader system relationship next, continue to [System Mental Model](system-mental-model.md).
2. If you want the actual authoring branch, continue to [Tweak an Existing Face](../customize/tweak-an-existing-face.md).
