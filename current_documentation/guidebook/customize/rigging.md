<!-- tags: type=guidebook-module; status=written; topics=guidebook,customize,rigging,propsrig -->

> **Last updated:** 2026-03-11
> **Purpose:** define what rigging means in Vizij and explain the controllable structure that later poses, animations, and exports depend on

# Rigging

## Guidebook Context

1. **Bucket:** [Customize](README.md)
2. **Depth:** `Fundamentals`
3. **Module type:** concept page
4. **Bucket overview:** [Customize](README.md)
5. **Useful previous module:** [Reference-Face Transfer](reference-face-transfer.md)
6. **Useful next module:** [Poses](poses.md)

## Reader Outcome

After this page, you should be able to explain what rigging means in Vizij specifically, how rigging differs from raw scene data, and why later pose, animation, and export workflows depend on the rig layer being truthful.

## Module Notes

### Intended Audience

This page is for readers who are ready to move from “a face I can load or tweak” to “a face whose controllable structure I can reason about.”

It is especially for readers who have encountered the word `rig` before in other graphics tools and need to understand the Vizij-specific meaning rather than importing a generic CG definition.

### Artifact Being Touched

The artifact in this page is the face’s controllable structure inside authoring and runtime.

In Vizij, that structure is not just the mesh.

It includes:

1. animatable scene targets,
2. generated low-level rig channels under `/propsrig/...`,
3. authored abstract rig inputs and bindings,
4. the rules that keep authored controls from writing scene leaves directly.

That structure is what later authoring pages build on.

### Why This Page Exists Separately

Rigging needs its own page because it prevents a different misunderstanding than import or transfer.

Import answers “how does the face enter authoring?”

Transfer answers “how can one face help author another?”

Rigging answers “what is the control structure of this face once it is in the system?”

Without that distinction, readers collapse rigging into either raw geometry editing or pose authoring, and both are wrong for Vizij.

### What Rigging Does Not Teach

This page does not teach:

1. how to load a face into authoring,
2. how to copy poses or variables from a reference face,
3. how pose grouping semantics work,
4. how animation clips are authored over time,
5. how export packages the finished artifact.

Those are separate modules.

This page teaches the control structure those later modules rely on.

## What You Need

It helps if you have already read:

1. [Import](import.md)
2. [Reference-Face Transfer](reference-face-transfer.md)
3. [Customization Concepts Primer](../introduction/customization-concepts-primer.md)

You do not need to master pose groups or animation clips yet.

## What Rigging Means In Vizij

In Vizij, rigging is the process and resulting structure that turns a face from animatable scene data into a controllable system.

The current authoring architecture defines several layers:

1. the animatable layer,
2. the propsrig layer,
3. the abstract rig layer,
4. the pose layer,
5. the binding layer between authored controls.

The important rigging idea is that these layers are not interchangeable.

Rigging is the bridge between raw scene targets and the higher-level authored controls that later pages discuss.

## The Layer Boundary That Matters Most

The current blueprint and architecture keep one boundary especially strict:

1. animatable scene leaves are the render-facing sinks,
2. generated low-level rig channels write to those scene leaves,
3. authored abstract rig controls must not write animatable leaves directly.

That is why the current contract uses generated `/propsrig/...` paths for low-level rig metadata.

The rig is not only a naming system. It is a boundary system.

It tells the authoring tool and runtime which controls are low-level, which are authored abstractions, and how values are allowed to flow.

## PropsRig and Abstract Rig

> TODO(content-model): Add a diagram here to show the relationship between imported scene structure, the abstract rig, and the controllable `PropsRig` channels that later pose and animation layers depend on. Best fit because this section is about layer translation and that boundary is easier to retain visually than through prose alone.

Two rigging layers are especially important in current Vizij authoring.

### PropsRig

The propsrig layer is the low-level generated channel layer.

According to the current blueprint:

1. it is auto-created from animatable leaves,
2. it uses the `/propsrig/...` namespace,
3. it is the required bridge for direct scene writes,
4. it stays visible enough for debugging and inspection even when treated as implementation detail.

This means propsrig is close to the face’s actual rendered mechanics.

### Abstract rig

The abstract rig layer is where authored control meaning lives.

These are the higher-level inputs and bindings that may drive:

1. other abstract rig nodes,
2. one or more propsrig nodes.

They must not directly target animatable leaves.

That rule is what keeps the authored control model stable and reusable.

## Why Rigging Comes Before Poses and Animations

Poses and animations both assume there is already a trustworthy control surface to target.

In the current contract:

1. poses target abstract-rig inputs by identity,
2. pose graphs write to internal pose-control paths,
3. the rig graph owns final composition into effective channel values,
4. runtime writes reach scene leaves through the rig structure, not around it.

So when later pages talk about named states or motion over time, they are building on rigging rather than replacing it.

## What Readers Actually Do In Authoring

> TODO(content-model): Add an annotated screenshot here to show where rig structure is inspected or validated inside the current authoring surface. Best fit because this section is turning the rigging concept back into a maintained UI surface and readers need to see where the structure becomes tangible.

Rigging in the guidebook sense is not a demand to memorize every internal file.

What readers need to recognize in the current authoring surface is:

1. importing a face does not finish the rigging story,
2. the tool auto-generates and normalizes low-level rig channels,
3. authored inputs and bindings sit above those low-level channels,
4. later pose and animation authoring depend on these layers lining up.

The current README’s Standard Feature Spaces workflow also shows the public side of this idea:

1. channels can be viewed and edited,
2. mappings can be configured,
3. standardized input structure supports interoperability between faces.

That is rigging in Vizij terms: shaping the face into a controllable, reusable input model.

## A Useful Mental Model

Use this stack when reasoning about rigging:

1. scene leaves are what the renderer ultimately moves,
2. propsrig channels are the low-level controlled bridge to those leaves,
3. abstract rig inputs are the higher-level authored controls,
4. poses and animations later write into or compose with that rig structure,
5. export carries the resulting structure forward.

If you keep that stack clear, later customization pages become much easier to trust.

## Success Check

You are done with this page when:

1. you can explain the difference between animatable data, propsrig, and abstract rig,
2. you can explain why abstract rig controls do not directly write scene leaves,
3. you can explain why later poses and animations depend on rigging rather than replacing it,
4. you can explain what makes the Vizij meaning of rigging different from a generic graphics-only description.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/vizij-authoring/docs/Authoring_Blueprint.md`
2. `vizij-web/apps/vizij-authoring/docs/ARCHITECTURE.md`
3. `vizij-web/apps/vizij-authoring/README.md`
4. `vizij-web/apps/vizij-authoring/src/hooks/useRigGraphImport.ts`
5. `current_documentation/guidebook/reference/renderer-and-rigging-reference.md`

## Next Step

1. If you want to understand named authored facial states next, continue to [Poses](poses.md).
2. If you want to understand authored motion over time later, continue to [Animations](animations.md).
