<!-- tags: family=guidebook; type=guidebook-module; editorial_status=completed; publication_status=planned; topics=guidebook,introduction,customize,concepts -->

> **Last updated:** 2026-03-31
> **Purpose:** give readers the core customization vocabulary before they enter the authoring branch

# Customization Concepts Primer

## Guidebook Context

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: Start of guidebook<br>Current: [Introduction](README.md)<br>Next: [Experience](../experience/README.md) |
| Depth ladder in this bucket | Above: [What Is Vizij?](what-is-vizij.md), [How To Use This Guidebook](how-to-use-this-guidebook.md)<br>Current: `Fundamentals`<br>Below: [Architecture Bridge](architecture-bridge.md) |
| Module position in this bucket | Previous in bucket: [System Mental Model](system-mental-model.md)<br>Current module: `Customization Concepts Primer`<br>Next in bucket: [Architecture Bridge](architecture-bridge.md) |
| Reference bridges | [Guidebook Learning Model](../learning-model.md)<br>[Guidebook Module Inventory](../module_inventory-reference.md)<br>[Glossary and Terminology Bridge](../support/glossary-and-terminology-bridge.md) |
| Module type | concept page |
| Bucket overview | [Introduction](README.md) |

## Reader Outcome

After this page, you should be able to explain the major customization concepts that show up later in the guidebook: rigs, poses, animations, procedural programs, and the artifacts that carry them forward.

## Module Notes

- Use this page before the `Customize` bucket if you need a vocabulary map before you need hands-on authoring steps.
- It introduces the main authoring concepts early so later modules can focus on workflow rather than term definition.
- Import, pose authoring, keyframing, procedural editing, and export stay in the `Customize` modules.

## What You Need

You do not need to have used `vizij-authoring` yet.

It helps if you have already:

1. read [How To Use This Guidebook](how-to-use-this-guidebook.md),
2. seen a running Vizij face in the demos or the `Hello Face` tutorial.

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

That is why [Export](../customize/export.md) belongs in `Customize` even though it also affects `Integrate` and `Deploy`.

## Compact Comparison

| Concept | Reader-level meaning | Current implementation surface | Best used for |
| --- | --- | --- | --- |
| Rig | the controllable structure of the face | `vizij-authoring` separates authored abstract-rig controls from low-level `/propsrig/...` channels that actually write to scene targets | defining what can be driven in a stable, reusable way |
| Pose | a named facial state over those controls | pose config and pose graph data target canonical rig inputs and compile into pose-control paths | recalling a reusable expression such as `blink` or `smile` by weight |
| Animation | authored motion over time | authored timeline clips and imported animation payloads can be bundled into the exported artifact | replaying a specific timed motion sequence |
| Procedural program | computed behavior from selected inputs, graph logic, and selected outputs | the `Program` workspace stores nodes, edges, enabled inputs, enabled outputs, and any custom input paths | reacting continuously to live values instead of replaying a fixed clip |
| Exported artifact | the packaged result that leaves authoring | bundled GLB is the primary target, with supporting graph, pose-config, and pose-IR JSON exports | handing authored work to later runtime, integration, or debugging surfaces |

## How These Concepts Relate

A useful mental model is:

1. the rig defines what can be controlled,
2. poses define named states over those controls,
3. animations define authored motion over time,
4. procedural programs define computed or graph-driven behavior,
5. export carries the authored result into later runtime surfaces.

This is not yet the authoring workflow. It is the conceptual stack underneath it.

### Text-First Stack

| Layer | What it contributes | Current implementation truth |
| --- | --- | --- |
| Scene targets | the leaves that are actually rendered | the loaded face exposes animatable scene targets, but they are not meant to be the main authored control surface |
| PropsRig layer | low-level writeable channels for those scene targets | generated paths live under `/propsrig/...` and mediate scene writes |
| Abstract rig layer | the stable controls authors actually think in | authored controls can drive other abstract-rig nodes or propsrig nodes, but not animatable leaves directly |
| Pose / animation / procedural layers | the higher-level behavior tools | poses define named states, animations define timed clips, and procedural programs compute outputs from enabled inputs plus graph logic |
| Export boundary | the handoff into runtime use | export packages the authored result into a bundled GLB or supporting JSON/IR artifacts that later surfaces can load |

## Success Check

You are done with this page when:

1. you can explain the difference between a rig, a pose, an animation, and a procedural program,
2. you can explain why export is part of the customization story,
3. you can enter `Customize` without those terms feeling undefined.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/vizij-authoring/README.md`
2. `vizij-web/apps/vizij-authoring/docs/ARCHITECTURE.md`
3. `vizij-web/apps/vizij-authoring/docs/Authoring_Blueprint.md`
4. `vizij-web/apps/vizij-authoring/src/motiongraph/MotionGraphPanel.tsx`
5. `vizij-web/apps/vizij-authoring/src/hooks/useVizijExport.ts`

## Recommended Next Steps

1. If you want the broader system relationship next, continue to [System Mental Model](system-mental-model.md).
2. If you want the actual authoring branch, continue to [Tweak an Existing Face](../customize/tweak-an-existing-face.md).
