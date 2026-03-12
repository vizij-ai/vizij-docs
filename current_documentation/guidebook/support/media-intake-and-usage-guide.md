<!-- tags: type=guidebook-module; status=written; topics=guidebook,support,media,screenshots,video,operations -->

> **Last updated:** 2026-03-11
> **Purpose:** define how screenshots and videos should be classified, selected, and reused so the guidebook and its downstream projections stay route-faithful and current

# Media Intake and Usage Guide

## Guidebook Context

1. **Bucket:** [Guidebook Support](README.md)
2. **Depth role:** cross-cutting reusable support layer
3. **Module type:** operational guide
4. **Bucket overview:** [Guidebook Support](README.md)
5. **Useful previous module:** [Glossary and Terminology Bridge](glossary-and-terminology-bridge.md)
6. **Useful next module:** [Guidebook Support](README.md)

## Reader Outcome

After this page, you should be able to:

1. classify screenshots and videos by their teaching role,
2. decide whether media belongs in the evergreen guidebook asset system or in a temporary workshop or event pack,
3. avoid using media that misrepresents the current maintained route,
4. choose the right next support surface when a capture is stale or misleading.

## Module Notes

### Intended Audience

This page is for people maintaining guidebook media and downstream projections, including:

1. documentation maintainers,
2. facilitators,
3. workshop or website producers,
4. contributors preparing screenshots or clips for route pages.

This is a support page, not a general design or video-production tutorial.

### Why This Page Exists

This page needs to exist separately because guidebook media has a different job from the guidebook prose.

The prose explains concepts and routes.

The media layer proves them visually.

Without a clear media policy, three things go wrong quickly:

1. stale captures start teaching the wrong route,
2. workshop-only visuals leak into the canonical guidebook,
3. screenshots from optional or historical surfaces get mistaken for the maintained public path.

This page prevents that drift.

### Artifact Being Touched

The artifact here is the guidebook media layer:

1. screenshots,
2. short video clips,
3. media references awaiting classification,
4. the decision about whether a capture is evergreen, temporary, or superseded.

This matters because media is teaching material. A wrong screenshot can teach the wrong route just as easily as a wrong paragraph can.

### What This Page Does And Does Not Cover

This page does cover:

1. classification,
2. route-faithful reuse,
3. evergreen versus temporary media boundaries,
4. the relationship between support media and canonical guidebook teaching.

This page does not cover:

1. design-system rules for image styling,
2. editing software workflows,
3. storage or hosting infrastructure,
4. automated capture tooling,
5. full production video standards.

Those may matter later, but they are not the core support problem right now.

## What You Need

It helps if you have already read:

1. [Guidebook Assets](../assets/README.md),
2. [Validation Checkpoints](validation-checkpoints.md),
3. [Troubleshooting Matrix](troubleshooting-matrix.md),
4. [Glossary and Terminology Bridge](glossary-and-terminology-bridge.md).

It also helps if you understand the maintained route order from the guidebook and roadmap.

## The First Question: What Teaching Job Does This Media Serve

Before classifying a screenshot or clip, ask:

1. what page or module is this helping,
2. what claim is it proving,
3. is it showing the maintained route or an optional branch,
4. will this still be true after the next normal guidebook update.

If you cannot answer those questions clearly, the media is not ready for evergreen placement.

## The Core Classification System

> TODO(content-model): Add a comparison table here to separate evergreen screenshots, evergreen video, workshop-only media, event-only media, and superseded assets by reuse criteria and storage outcome. Best fit because this module is a classification guide and the core teaching task is distinguishing adjacent media classes quickly.

The current guidebook asset policy already points toward five useful classes.

### 1. Evergreen screenshots

Use this class when the capture supports a maintained concept, workflow, or route page and is likely to stay accurate with only normal maintenance.

Examples:

1. a stable runtime status surface,
2. a clearly labeled authoring panel used in the maintained route,
3. a deployment or validation state that matches current guidebook language.

These belong in the guidebook asset tree once classified.

### 2. Evergreen video

Use this class when motion or sequence is the point and a still image would mis-teach the step.

Examples:

1. a short control interaction,
2. a multi-step authoring flow,
3. a deployment or operator interaction where timing matters.

These also belong in the guidebook asset system once the storage decision is clear.

### 3. Workshop-only media

Use this class when the capture is useful for facilitation but not stable enough for the canonical guidebook route.

Examples:

1. workshop-specific pacing screens,
2. facilitator rescue steps,
3. event-specific setup snapshots.

These should stay with workshop materials unless they are deliberately promoted later.

### 4. Event-only media

Use this class when the capture is tied to a specific talk, class, or event context.

These should not be treated as evergreen proof for the maintained route.

### 5. Superseded or duplicate media

Use this class when the capture:

1. teaches an older route,
2. duplicates a stronger existing capture,
3. shows UI that no longer matches the maintained guidebook language,
4. comes from a surface that is no longer canonical for the concept being taught.

These should not be kept in the evergreen asset layer as if they were active proof.

## Route Faithfulness Matters More Than Visual Appeal

> TODO(content-model): Add a before/after pair here to contrast a visually strong but route-misleading capture with a plainer but route-faithful evergreen capture. Best fit because this section is making a judgment call about teaching accuracy and one concrete contrast would make the policy easier to apply consistently.

A polished capture can still be wrong for the guidebook.

The main question is not:

`Does this look impressive?`

It is:

`Does this accurately support the maintained route and current implementation truth?`

That means:

1. use captures from maintained surfaces when possible,
2. prefer the main route over optional side branches,
3. clearly label optional richer examples when you do use them,
4. do not let historical workshop material quietly redefine the core story.

## How To Decide Whether A Capture Is Evergreen

> TODO(content-model): Add a decision guide here to help reviewers choose between promote, hold in workshop media, or reject as superseded. Best fit because this section is already applying evergreen criteria and would benefit from an explicit routing decision instead of checklist prose alone.

Treat a capture as evergreen only if all of these are true:

1. it matches the current maintained route or an explicitly labeled optional branch,
2. the UI state and terminology align with current guidebook pages,
3. the capture does not rely on temporary event framing,
4. the implementation surface is still maintained enough to trust publicly,
5. the capture would still make sense if reused in a website, tutorial, or workshop packet later.

If any of those fail, classify the media lower rather than forcing it into the evergreen set.

## Intake Checklist

When new screenshots or clips arrive, evaluate them in this order:

1. identify the bucket and module they support,
2. classify them as evergreen screenshot, evergreen video, workshop-only, event-only, or superseded,
3. check that the visible terminology matches the guidebook,
4. check that the route implication is correct,
5. check whether a stronger existing media item already covers the same teaching job,
6. place or reference the asset in the guidebook asset system only after that classification is clear.

## Success Check

You are done with this page when:

1. you can classify a new screenshot or clip into the right media class,
2. you can explain why a visually strong capture might still be wrong for the guidebook,
3. you can decide whether media belongs in the evergreen guidebook assets or a temporary workshop/event pack,
4. you know which support page to use when a capture is stale or misleading.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `current_documentation/guidebook/assets/README.md`
2. `current_documentation/guidebook/assets/screenshots/README.md`
3. `current_documentation/guidebook/support/validation-checkpoints.md`
4. `current_documentation/guidebook/support/troubleshooting-matrix.md`
5. `current_documentation/guidebook/support/glossary-and-terminology-bridge.md`
6. `vizij-docs/current_documentation/ROADMAP.md`
7. `vizij-docs/current_documentation/ARCHITECTURE.md`

## Next Step

If the issue is whether a page’s success state is being shown clearly enough, continue to [Validation Checkpoints](validation-checkpoints.md).

If the issue is that a capture is hiding or confusing a failure state, continue to [Troubleshooting Matrix](troubleshooting-matrix.md).

If you need to place or classify evergreen media next, continue to [Guidebook Assets](../assets/README.md).
