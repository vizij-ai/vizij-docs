<!-- tags: type=guidebook-module; status=written; topics=guidebook,customize,authoring,presets -->

> **Last updated:** 2026-03-11
> **Purpose:** deliver the smallest believable authoring win by changing an existing face without requiring the full customization pipeline

# Tweak an Existing Face

## Reader Outcome

After this page, you should be able to open an existing Vizij face in `vizij-authoring`, make one small believable change to that face, and explain why this counts as customization even though you are not building a rig from scratch.

## Intended Audience

This page is for readers who already understand the basic customization vocabulary, but do not yet want the full authoring pipeline all at once.

It is especially for readers who need proof that `Customize` can start with a modest, concrete win rather than a full rebuild.

## What You Need

From `vizij-web`:

```bash
pnpm run dev:vizij-authoring
```

It also helps if you have already read:

1. [Customization Concepts Primer](../introduction/customization-concepts-primer.md)
2. [Control Surfaces and Configuration Layers](../control/control-surfaces-and-configuration-layers.md)

You do not need to understand import normalization, rigging theory, or export packaging yet.

## Artifact Being Touched

The artifact in this page is an already-authored face session inside `vizij-authoring`.

That matters because this page is not about creating a face from nothing. It is about opening a face that already contains usable structure and making a small change to what is already there.

In practice, that usually means:

1. loading a preset or bundled face,
2. previewing it in the main runtime view,
3. adjusting an existing authored control, pose target, or label in the main authoring context.

## Why This Page Exists Separately

The first customization page should not begin with import safety, remapping, pose grouping, or export rules.

Readers often need one smaller proof first:

1. that `Customize` does not always mean “start from scratch,”
2. that `vizij-authoring` is an editing surface, not just a runtime demo,
3. that an existing face can already be meaningfully changed before the deeper pipeline is understood.

That is the boundary this page protects.

## The Smallest Believable Win

The lowest-friction customization win in the current tool is to load an existing face and change something that already exists in its authored setup.

That can be as small as:

1. adjusting an existing control value while watching the main face preview,
2. editing an existing authored pose target rather than inventing a new rig structure,
3. renaming or curating an existing feature label so the face becomes easier to work with.

The important idea is not which exact tweak you choose.

The important idea is that you are no longer only driving the face from a tutorial runtime. You are inside the authoring surface, touching the face’s editable authored state.

## Walkthrough

> TODO(content-model): Add an annotated screenshot here to point out the loaded face, the main editing surface, and the visible preview area where the first tweak should be checked. Best fit because this surface walkthrough depends on orientation inside the authoring UI before the reader can trust the steps.

### 1. Open the authoring surface with a known-good face

Launch `vizij-authoring` and load one of the maintained preset faces such as `quori:latest`.

The current app and test helpers make this preset-style flow a first-class path:

1. the main viewer starts in an empty state,
2. a preset load mounts the face into the main runtime,
3. the app surfaces readiness before you begin editing.

You are looking for the main runtime view to become ready and the face to appear in the preview.

### 2. Stay in the main face context

For this first win, stay focused on the main face.

Do not switch into reference-face comparison mode yet, and do not treat this as an import or transfer exercise.

This page is about changing the face you already have in front of you.

### 3. Make one existing thing visibly different

Use one of the existing authoring surfaces to make a small visible change:

1. select an existing pose or control entry,
2. adjust a value that already exists for that face,
3. watch the main preview respond.

The exact UI path can vary depending on which face bundle you loaded and which authored data it already contains, but the principle stays the same:

1. you are editing something already present in the face session,
2. the preview gives you immediate runtime-truthful feedback,
3. you are learning the artifact by touching it, not by rebuilding it.

### 4. Notice what you did not need

You did not need to:

1. import a brand-new raw asset,
2. define a new rig contract,
3. resolve cross-face mapping,
4. build an animation clip,
5. package an export.

That is why this page belongs at the start of the `Customize` bucket.

## What This Page Teaches and What It Does Not

This page teaches:

1. how to treat an existing authored face as editable,
2. how to look for a small believable customization win,
3. how to keep the first customization step narrower than the full pipeline.

This page does not teach:

1. what source assets are safe to import,
2. how reference-face copying and mapping work,
3. how rigging is defined in Vizij,
4. how poses and animations are authored in depth,
5. what leaves authoring during export.

Those need their own modules because they prevent different misunderstandings.

## How This Strengthens the Route

> TODO(content-model): Add a before/after pair here to show the smallest believable customization delta this page is trying to prove. Best fit because this section is arguing that a modest visible change still counts as real customization and the visual contrast would make that claim immediate.

This page turns the `Customize` bucket into a believable branch.

Without it, the route jumps too quickly from understanding control semantics to understanding the whole authoring system.

With it, the route becomes:

1. first prove you can change an existing face,
2. then learn what import changes,
3. then learn what transfer preserves,
4. then learn how rigging, poses, and animations work in detail.

## Success Check

You are done with this page when:

1. you have loaded an existing face in `vizij-authoring`,
2. you have made one small visible change in the main authoring context,
3. you can explain why that counts as customization rather than only control,
4. you know you do not need the full pipeline before making the first customization win.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/vizij-authoring/README.md`
2. `vizij-web/apps/vizij-authoring/src/App.tsx`
3. `vizij-web/apps/vizij-authoring/src/hooks/useVizijAssetLoader.ts`
4. `vizij-web/apps/vizij-authoring/AGENTS.md`
5. `current_documentation/guidebook/introduction/customization-concepts-primer.md`

## Next Step

1. If you want to understand what can safely come into authoring, continue to [Import](import.md).
2. If you already know your source assets and need the control-structure layer next, continue to [Rigging](rigging.md).
3. If the tweak made you want named authored states, continue to [Poses](poses.md).
