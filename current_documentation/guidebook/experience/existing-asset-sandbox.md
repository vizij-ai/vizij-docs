<!-- tags: type=guidebook-module; status=written; topics=guidebook,experience,sandbox,existing-assets -->

> **Last updated:** 2026-03-11
> **Purpose:** explain what the first Vizij sandbox experience is actually proving and what parts are already prebuilt

# Existing Asset Sandbox

## Guidebook Context

1. **Bucket:** [Experience](README.md)
2. **Depth:** `Fundamentals`
3. **Module type:** concept page
4. **Bucket overview:** [Experience](README.md)
5. **Useful previous module:** [Richer Interactive Example](richer-interactive-example.md)
6. **Useful next module:** [Sample Asset Exploration](sample-asset-exploration.md)

## Reader Outcome

After this page, you should be able to explain what the existing-asset sandbox gives you for free, what parts of the experience are already prebuilt, and why this bucket comes before `Control`, `Customize`, or `Integrate`.

## Module Notes

### Intended Audience

This page is for readers who have already completed [Hello Face Quickstart](hello-face-quickstart.md) and now want a more accurate mental model of what they just touched.

### Artifact Being Touched

The existing-asset sandbox is not a blank project.

It is a prebuilt runtime experience composed of:

1. a sample face asset,
2. a prepared asset bundle,
3. a runtime provider that loads and wires the asset,
4. a small set of interaction hooks or controls,
5. a UI surface that makes the result immediately visible.

The maintained first sandbox anchor is `tutorial-fullscreen-face`.

## What You Need

It helps if you have already:

1. run `tutorial-fullscreen-face`,
2. seen a working face respond to mouse and hotkey input,
3. looked briefly at the app code without trying to understand the whole runtime yet.

## What The Sandbox Proves

When the sandbox works, it proves several important things quickly:

1. Vizij can load a real face asset and render it live.
2. Runtime input writes can cause visible behavior immediately.
3. The asset, rig, and pose data are aligned enough for the sample interactions to work.
4. A reader can start from a concrete, inspectable implementation instead of a slide or promise.

That is enough for first contact. It is not yet the same thing as understanding the runtime model or making the face your own.

## What Is Already Prebuilt

The sandbox removes several decisions for the reader on purpose.

Already chosen for you:

1. which face asset is loaded,
2. which bundle or rig data the app uses,
3. which inputs are exposed by the tutorial hooks,
4. what counts as the default neutral or startup state,
5. what visible interactions the sample prioritizes.

This is why the sandbox is a good starting point. It reduces the number of variables while still showing a real Vizij surface.

> TODO(content-model): Add a comparison diagram here to separate the prebuilt sandbox pieces from the later `Control`, `Customize`, and `Integrate` responsibilities. Best fit because this module is establishing a fundamentals mental model and the “already provided versus later owned” boundary is easier to retain visually.

## What The Sandbox Does Not Prove

The sandbox does not yet prove that you can:

1. author a new face,
2. import your own asset,
3. understand every runtime path or controller,
4. embed the face into your own application,
5. operate a deployment endpoint.

Those are later buckets.

> TODO(content-model): Add an FAQ here to answer common confusion about whether the sandbox counts as authoring, integration, or deployment. Best fit because this section is already framing what the sandbox does not prove and predictable reader misreadings belong in a targeted FAQ.

## A Useful Way To Read The Sandbox

Treat the first sandbox as a bounded demonstration of a working chain:

1. load an existing asset,
2. let the runtime register what it needs,
3. write a few known-good inputs,
4. observe visible behavior,
5. confirm the sample is healthy.

That makes it easier to ask the right next question:

1. `How is the face being controlled?` Move to `Control`.
2. `How do I get this into a usable shell of my own?` Move to `Integrate`.
3. `How do I change the asset or behavior?` Move later to `Customize`.

## Where Richer Experiences Fit

Not every sample experience needs to be equally simple.

Some experiences may add live conversation, richer UI, or deeper interaction while still functioning as first-contact surfaces. They are still examples of the same documentation bucket: a prebuilt experience that proves capability before the reader has to build or customize anything.

The important distinction is not whether the sample is simple or rich. It is whether the reader is still touching an existing asset in an existing sandbox rather than building their own system.

## Current Useful Visuals

Existing screenshots already live at:

1. `current_documentation/guidebook/assets/screenshots/tutorial-fullscreen-face.png`
2. `current_documentation/guidebook/assets/screenshots/tutorial-agent-face.png`

For this page, the `tutorial-fullscreen-face` screenshot is the primary visual anchor.

## Success Check

You are done with this page when:

1. you can explain what the sandbox is proving,
2. you can name which parts of the first experience are already prebuilt,
3. you can say why the sandbox is useful without mistaking it for customization or deployment.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
2. `vizij-web/apps/tutorial-fullscreen-face/src/FaceApp.tsx`
3. `vizij-web/packages/@vizij/runtime-react/README.md`
4. `current_documentation/workshops/vizij-afternoon-workshop/planning/source-audit.md`
5. `current_documentation/guidebook/reference/runtime-quickstart-reference.md`

## Next Step

1. If you want to understand the meaning of the input writes behind the sandbox, continue to [Runtime Inputs and Semantics](../control/runtime-inputs-and-semantics.md).
2. If you want to revisit the quickest runnable page first, return to [Hello Face Quickstart](hello-face-quickstart.md).
