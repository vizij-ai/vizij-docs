<!-- tags: type=guidebook-module; status=written; topics=guidebook,customize,advanced,pipeline,export -->

> **Last updated:** 2026-03-11
> **Purpose:** synthesize the full advanced customization route from supported input through export-ready artifact without collapsing the stages into one vague authoring task

# Deep Custom Pipeline

## Guidebook Context

1. **Bucket:** [Customize](README.md)
2. **Depth:** `Advanced`
3. **Module type:** walkthrough
4. **Bucket overview:** [Customize](README.md)
5. **Useful previous module:** [Export](export.md)
6. **Useful next module:** [Customize](README.md)

## Reader Outcome

After this page, you should be able to explain the full advanced customization route as a sequence of checkpoints:

1. start from a supported face or imported asset,
2. establish or repair controllable structure,
3. author meaningful states and behavior,
4. validate export readiness,
5. hand off a believable artifact to `Integrate`.

## Module Notes

### Intended Audience

This page is for readers who have already gone through the `Customize` fundamentals and now need the whole route in one view.

It is especially for readers who might otherwise think advanced customization means:

1. doing more of the same UI work,
2. making many changes without staged validation,
3. treating export as an afterthought.

### Why This Page Exists

The fundamentals pages teach each stage separately because they need their own conceptual boundaries.

This page exists because advanced readers eventually need to see how those stages fit together as one route.

Without this synthesis page, the common failure mode is:

`I changed many things in authoring, so I must be near the finish line.`

That is not reliable enough.

The deep pipeline only works when each stage produces the right kind of artifact for the next one.

### Artifact Being Touched

The artifact here is the full authored face package as it moves through authoring:

1. imported or chosen face data,
2. authored control structure,
3. pose and motion behavior,
4. export validation state,
5. bundled output ready for later runtime use.

This is not one edit. It is a staged pipeline.

### What This Page Does And Does Not Cover

This page does cover:

1. the sequence of the full customization route,
2. the staged checkpoints between import and export,
3. the handoff from advanced customization into `Integrate`.

This page does not cover:

1. robot or ROS integration,
2. deployment topology,
3. low-level runtime namespacing work,
4. deep compile or IR internals beyond export-readiness signals.

Those belong in later buckets or deeper implementation docs.

## What You Need

You should already understand:

1. [Import](import.md),
2. [Reference-Face Transfer](reference-face-transfer.md),
3. [Rigging](rigging.md),
4. [Poses](poses.md),
5. [Animations](animations.md),
6. [Procedural Programs](procedural-programs.md),
7. [Export](export.md).

The current implementation anchors live mainly in `vizij-web/apps/vizij-authoring`.

## The Deep Pipeline In Order

> TODO(content-model): Add a workflow map here to show the advanced route from source asset through rigging, authored behavior, validation, and export-ready output. Best fit because this module is explicitly synthesizing the full customization pipeline and a route map would make the stage boundaries easier to carry forward.

The clean advanced route is:

```text
supported base or imported asset
-> controllable structure
-> authored semantic states and motion
-> export validation
-> bundled artifact
-> integration handoff
```

Each stage solves a different problem.

### 1. Start from a supported base, not a vague goal

The deepest customization work still needs a credible starting point.

That can be:

1. a maintained face you are modifying,
2. an imported face that has passed the right safety and structure checks,
3. a transferred or mapped reference that gives you a believable path toward usable control.

If the starting artifact is unclear, every later stage becomes harder to trust.

### 2. Establish controllable structure

The next job is not visual polish. It is controllable structure.

In guidebook terms, this is where `Reference-Face Transfer` and `Rigging` matter most.

The goal is:

1. the right targets exist,
2. the structure is mapped in a Vizij-usable way,
3. later authored behavior has something stable to drive.

If this stage is weak, later poses, animations, or procedural behavior will look more successful than they really are.

### 3. Author semantic states and behavior

Once the structure is trustworthy, authored behavior can become meaningful.

That usually means some combination of:

1. poses for named states,
2. animations for authored motion over time,
3. procedural programs for computed behavior.

These are not interchangeable tools.

The point of the advanced pipeline is not to use all of them automatically. The point is to choose the right behavior layers for the artifact you are actually building.

### 4. Validate before export

A deep custom pipeline becomes reliable only when export readiness is treated as a real checkpoint.

In the current app, export is not just file output. It is also where the authoring surface checks whether the bundle is coherent enough to leave authoring as a believable artifact.

That is why export-related guardrails and bundle audits matter.

If the face still depends on unresolved structure mistakes, confusing mappings, or incomplete authored behavior, export may succeed as a file operation while still failing as a route milestone.

### 5. Hand off to Integrate

The output of this route is not deployment.

It is an artifact that is believable enough to enter `Integrate`.

That handoff matters because advanced customization is still upstream of runtime loading, playback, embedding, and deployment.

If the reader finishes this page understanding that boundary, the page has done its job.

## The Advanced Reader Mistakes This Prevents

> TODO(content-model): Add a troubleshooting note here to connect each common advanced mistake to the stage where it should be caught or corrected. Best fit because this page is trying to prevent fragile pipeline drift and readers need recovery guidance as well as warning prose.

This page is mainly here to prevent these mistakes:

1. treating the full pipeline like one long authoring session without checkpoints,
2. assuming a visually improved face is automatically export-ready,
3. assuming poses, animations, and procedural behavior are interchangeable,
4. forgetting that export is a bridge to `Integrate`, not the same thing as successful runtime use.

## Success Check

You are done with this page when:

1. you can describe the deep customization route as a sequence of checkpoints rather than one vague authoring effort,
2. you can explain why controllable structure must come before authored behavior,
3. you can explain why export readiness is its own milestone,
4. you know that the next bucket after a successful deep custom pipeline is `Integrate`.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/vizij-authoring/README.md`
2. `vizij-web/apps/vizij-authoring/docs/Authoring_Blueprint.md`
3. `vizij-web/apps/vizij-authoring/src/hooks/useVizijExport.ts`
4. `vizij-web/apps/vizij-authoring/src/utils/bundleAudit.ts`
5. `current_documentation/guidebook/customize/export.md`
6. `current_documentation/guidebook/customize/procedural-programs.md`
7. `current_documentation/guidebook/integrate/loading-playback-and-embedding.md`

## Next Step

If you need the artifact boundary itself, go back to [Export](export.md).

If the face is ready to leave authoring, continue to [Loading, Playback, and Embedding](../integrate/loading-playback-and-embedding.md).
