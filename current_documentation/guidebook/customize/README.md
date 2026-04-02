<!-- tags: family=guidebook; type=guidebook-bucket; editorial_status=completed; publication_status=planned; topics=guidebook,customize,authoring -->

> **Last updated:** 2026-03-31
> **Purpose:** organize the customization and ownership work that lets readers make a face their own

# Customize

`Customize` is the bucket where readers move from controlling an existing face to changing or creating what the face actually is and does.

This bucket is not mandatory for the fastest deployment of an existing face, but it is essential for the route where readers want to make the system more their own.

## Process Position

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Control](../control/README.md)<br>Current: [Customize](README.md)<br>Next: [Integrate](../integrate/README.md) |
| Depth ladder in this bucket | Surface: [Tweak an Existing Face](tweak-an-existing-face.md)<br>Fundamentals: [Import](import.md), [Reference-Face Transfer](reference-face-transfer.md), [Rigging](rigging.md), [Poses](poses.md), [Animations](animations.md), [Procedural Programs](procedural-programs.md), [Export](export.md)<br>Advanced: [Deep Custom Pipeline](deep-custom-pipeline.md) |
| Reference bridges | [Renderer and Rigging Reference](../reference/renderer-and-rigging-reference.md)<br>[Validation Checkpoints](../support/validation-checkpoints.md)<br>[Troubleshooting Matrix](../support/troubleshooting-matrix.md) |
| Route relationship | Optional middle bucket on the customization route; carries authored artifacts forward into [Integrate](../integrate/README.md). |

## Bucket Overview

This bucket should help a reader:

1. tweak an existing face without needing the full pipeline all at once,
2. understand the authoring stages that change a face or behavior,
3. learn how import, transfer, rigging, posing, animation, procedural programs, and export relate,
4. connect customization work to later integration and deployment stages.

## Expressive Face Authoring Path

Use this table when you know you need `Customize` but are not sure which authoring mode comes first:

| If your immediate goal is... | Open this next | Why |
| --- | --- | --- |
| make one believable change to an existing maintained face | [Tweak an Existing Face](tweak-an-existing-face.md) | lowest-friction authoring win |
| bring a new asset or authored metadata into the tool | [Import](import.md) | establishes a trustworthy authoring session |
| borrow variables or poses from a second face | [Reference-Face Transfer](reference-face-transfer.md) | review-gated copy into the main face |
| define reusable expression states | [Poses](poses.md) | state-first authoring layer |
| author timed expressive motion | [Animations](animations.md) | timeline and transport model |
| author reactive or organic behavior | [Procedural Programs](procedural-programs.md) | computed behavior from inputs plus logic |
| package the result for runtime use | [Export](export.md) | artifact boundary into `Integrate` |

## Which Authoring Mode Should I Use?

| If the behavior you want is... | Start with | Escalate when... |
| --- | --- | --- |
| a reusable named expression such as `smile` or `blink` | [Poses](poses.md) | you need motion over time or continuous reaction |
| a timed sequence with deliberate beats and duration | [Animations](animations.md) | playback needs to react continuously to live input |
| a continuously derived response such as wobble, follow, or thresholded reactivity | [Procedural Programs](procedural-programs.md) | the behavior needs a broader app or service loop |
| a small visible edit before deeper authoring decisions | [Tweak an Existing Face](tweak-an-existing-face.md) | you need a durable authored artifact instead of a quick tweak |

## Depth Ladder

### Surface

**Teaching objective:** deliver the lowest-friction customization win.

**Misunderstandings to prevent:**

1. thinking customization requires starting from scratch,
2. thinking the only valid outcome is a fully custom asset,
3. confusing a quick tweak with the full authoring pipeline.

**Often useful content:**

1. annotated screenshots,
2. short walkthroughs,
3. validation checks,
4. before and after examples,
5. related guidebook links.

### Fundamentals

**Teaching objective:** establish the core authoring mental model and the main stages that readers must understand to customize reliably.

**Misunderstandings to prevent:**

1. confusing import with transfer,
2. not understanding what rigging, posing, animation, procedural programs, or export each contribute,
3. losing the relationship between authoring steps and the artifacts they produce.

**Often useful content:**

1. concept explainers,
2. workflow maps,
3. screenshots,
4. annotated screenshots,
5. videos,
6. implementation bridges.

### Advanced

**Teaching objective:** support deeper ownership, more from-scratch work, and more sophisticated customization paths.

**Misunderstandings to prevent:**

1. assuming advanced customization is only more of the same UI work,
2. missing how asset prep, rigging, authored behavior, and export fit together,
3. skipping failure recognition and recovery in fragile workflows.

**Often useful content:**

1. workflow maps,
2. deeper walkthroughs,
3. videos,
4. troubleshooting,
5. failure-state examples,
6. implementation anchors.

## Bucket Modules

| Module | Depth | Module type | Teaching focus |
| --- | --- | --- | --- |
| [Tweak an Existing Face](tweak-an-existing-face.md) | Surface | walkthrough | deliver the fastest customization success |
| [Import](import.md) | Fundamentals | concept page | explain what enters authoring and what import validates |
| [Reference-Face Transfer](reference-face-transfer.md) | Fundamentals | concept page | explain authoring-side transfer from a reference face to the main face |
| [Rigging](rigging.md) | Fundamentals | concept page | explain what rigging means in Vizij |
| [Poses](poses.md) | Fundamentals | concept page | explain pose authoring and visible changes |
| [Animations](animations.md) | Fundamentals | concept page | explain animation authoring and usage |
| [Procedural Programs](procedural-programs.md) | Fundamentals | concept page | explain authored procedural behavior |
| [Export](export.md) | Fundamentals | operational guide | explain what leaves authoring and how later stages consume it |
| [Deep Custom Pipeline](deep-custom-pipeline.md) | Advanced | walkthrough | teach the fuller make-it-your-own path |

## Recommended Teaching Approaches

1. Keep the teaching sequence artifact-aware: show what is being changed and what is produced.
2. Use screenshots and annotated visuals heavily when the authoring UI matters.
3. Use videos when motion or multi-step transformation is the real point.
4. Tie every stage back to what later `Integrate` and `Deploy` modules will consume.

## Cross-Links

1. [Guidebook Learning Model](../learning-model.md)
2. [Guidebook Content Model Reference](../content-model-reference.md)
3. [Guidebook Module Inventory](../module_inventory-reference.md)
4. [Customization Concepts Primer](../introduction/customization-concepts-primer.md)
5. [Control](../control/README.md)
6. [Integrate](../integrate/README.md)
7. [Renderer and Rigging Reference](../reference/renderer-and-rigging-reference.md)
8. [Guidebook Assets](../assets/README.md)
