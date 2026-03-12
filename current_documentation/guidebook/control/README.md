<!-- tags: type=guidebook-bucket; status=written; topics=guidebook,control,paths,inputs -->

> **Last updated:** 2026-03-11
> **Purpose:** help readers see and control a face before they try to customize it

# Control

`Control` comes before `Customize` in the main learning journey.

This bucket is about understanding how a face behaves once a reader can already see it working and now wants to manipulate it, inspect what is changing, and understand the control model.

## Bucket Overview

This bucket should help a reader:

1. trigger clear visible responses,
2. understand the difference between a visible control and the underlying runtime meaning,
3. learn the core vocabulary of paths, standard controls, runtime inputs, and related configuration layers,
4. understand which control or configuration surface they are actually looking at,
5. recognize where deeper orchestration, diagnostics, and richer interaction begin.

## Depth Ladder

### Surface

**Teaching objective:** show obvious cause and effect through a small set of visible controls.

**Misunderstandings to prevent:**

1. treating control as magic rather than a learnable model,
2. assuming all visible behaviors are driven in the same way,
3. thinking deeper control understanding is required before trying anything.

**Often useful content:**

1. embedded demos,
2. screenshots,
3. short videos,
4. walkthrough steps,
5. validation checks.

### Fundamentals

**Teaching objective:** establish the actual control mental model and the terms readers need to reason about the runtime.

**Misunderstandings to prevent:**

1. confusing UI controls with runtime paths or values,
2. not understanding what standard controls represent,
3. not knowing how gaze, visemes, poses, inputs, and bundle-level configuration differ in meaning,
4. confusing authoring-facing configuration with deployment-facing operator controls.

**Often useful content:**

1. concept explainers,
2. diagrams,
3. payload examples,
4. glossary notes,
5. comparisons,
6. implementation bridges.

### Advanced

**Teaching objective:** teach richer control patterns, diagnostics, orchestration, and more complex runtime behavior.

**Misunderstandings to prevent:**

1. assuming advanced control is just "more sliders",
2. missing the role of diagnostics and failure recognition,
3. confusing richer control patterns with customization or deployment concerns.

**Often useful content:**

1. conceptual walkthroughs,
2. diagrams,
3. API or payload examples,
4. troubleshooting,
5. failure-state examples,
6. implementation anchors.

## Bucket Modules

| Module | Depth | Module type | Teaching focus |
| --- | --- | --- | --- |
| [First Control Interactions](first-control-interactions.md) | Surface | walkthrough | teach obvious visible control cause and effect |
| [Paths and Standard Controls](paths-and-standard-controls.md) | Fundamentals | concept page | establish the core control vocabulary |
| [Runtime Inputs and Semantics](runtime-inputs-and-semantics.md) | Fundamentals | concept page | explain what inputs mean and what they write |
| [Control Surfaces and Configuration Layers](control-surfaces-and-configuration-layers.md) | Fundamentals | concept page | explain the major control and configuration surfaces and what they mean |
| [Orchestration and Diagnostics](orchestration-and-diagnostics.md) | Advanced | operational guide | teach deeper runtime behavior and debugging |

## Recommended Teaching Approaches

1. Prefer cause-and-effect teaching over abstract control theory.
2. Use diagrams or payload examples when they make semantics legible.
3. Keep `Control` focused on runtime behavior and configuration meaning before `Customize`.
4. Make failure recognition part of advanced teaching rather than an afterthought.

## Cross-Links

1. [Guidebook Learning Model](../learning-model.md)
2. [Guidebook Content Model Reference](../content-model-reference.md)
3. [Guidebook Module Inventory](../module_inventory-reference.md)
4. [Experience](../experience/README.md)
5. [Customize](../customize/README.md)
6. [Renderer and Rigging Reference](../reference/renderer-and-rigging-reference.md)
7. [Guidebook Support](../support/README.md)
