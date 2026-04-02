<!-- tags: family=guidebook; type=guidebook-bucket; editorial_status=completed; publication_status=planned; topics=guidebook,introduction -->

> **Last updated:** 2026-03-31
> **Purpose:** orient readers to Vizij and help them choose the right learning path through the docs

# Introduction

`Introduction` is the first documentation bucket.

Its job is not to teach every subsystem. Its job is to help a new reader understand what Vizij is, why it exists, what the major pieces are, how the docs are organized, and where they should go next.

## Process Position

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: Start of guidebook<br>Current: [Introduction](README.md)<br>Next: [Experience](../experience/README.md) |
| Depth ladder in this bucket | Surface: [What Is Vizij?](what-is-vizij.md), [How To Use This Guidebook](how-to-use-this-guidebook.md)<br>Fundamentals: [System Mental Model](system-mental-model.md), [Customization Concepts Primer](customization-concepts-primer.md)<br>Advanced: [Architecture Bridge](architecture-bridge.md) |
| Reference bridges | [Guidebook Learning Model](../learning-model.md)<br>[Guidebook Module Inventory](../module_inventory-reference.md)<br>[Glossary and Terminology Bridge](../support/glossary-and-terminology-bridge.md) |
| Route relationship | First stop in every route; usually continues into [Experience](../experience/README.md). |

## Bucket Overview

This bucket should establish:

1. that the guidebook is a teaching structure rather than the system architecture,
2. the broad relationship between assets, runtime, control, customization, integration, and deployment,
3. the core customization concepts readers will meet later, such as rigs, poses, animations, and procedural programs,
4. the main learning paths through the docs,
5. where implementation truth lives when a reader is ready to go deeper.

## Depth Ladder

### Surface

**Teaching objective:** give a new reader a fast, confident orientation and route them into the right next experience.

**Misunderstandings to prevent:**

1. thinking `Introduction` is a technical subsystem,
2. thinking they must understand everything before trying Vizij,
3. thinking the docs are organized the same way as the internal architecture.

**Often useful content:**

1. framing notes,
2. concept explainers,
3. starting-point guides,
4. simple diagrams,
5. related docs links.

### Fundamentals

**Teaching objective:** establish the stable mental model that lets readers interpret later buckets correctly.

**Misunderstandings to prevent:**

1. confusing asset, runtime face, player, integration surface, and deployment target,
2. assuming the quick-start surface is the whole system,
3. entering `Customize` without understanding the basic meaning of rig, pose, animation, or procedural program,
4. assuming the teaching buckets are the engineering boundaries.

**Often useful content:**

1. concept explainers,
2. glossary notes,
3. system diagrams,
4. conceptual walkthroughs,
5. implementation bridges.

### Advanced

**Teaching objective:** connect the teaching model to the real cross-repo structure and implementation authority.

**Misunderstandings to prevent:**

1. using guidebook pages as substitutes for repo-local engineering docs,
2. misunderstanding which repos or docs own implementation truth,
3. treating teaching abstractions as ABI or package boundaries.

**Often useful content:**

1. implementation bridges,
2. repo links,
3. comparisons,
4. architecture diagrams,
5. cross-links back into practical modules.

## Bucket Modules

| Module | Depth | Module type | Teaching focus |
| --- | --- | --- | --- |
| [What Is Vizij?](what-is-vizij.md) | Surface | concept page | explain what Vizij is and what it enables |
| [Choose a Learning Path](how-to-use-this-guidebook.md) | Surface | decision guide | help readers choose the right starting path and level of detail |
| [System Mental Model](system-mental-model.md) | Fundamentals | concept page | explain how the major parts relate |
| [Customization Concepts Primer](customization-concepts-primer.md) | Fundamentals | concept page | explain the core customization vocabulary before the authoring branch |
| [Architecture Bridge](architecture-bridge.md) | Advanced | reference bridge | connect the guidebook model to real implementation surfaces |

## Recommended Teaching Approaches

1. Prefer clarity and routing over volume.
2. Keep this bucket reader-facing even when it references architecture.
3. Use diagrams when they reduce ambiguity, not because every page needs one.
4. End pages with concrete next-step links into `Experience`, `Control`, `Customize`, or the relevant route.

## Cross-Links

1. [Guidebook README](../README.md)
2. [Guidebook Learning Model](../learning-model.md)
3. [Guidebook Content Model Reference](../content-model-reference.md)
4. [Guidebook Module Inventory](../module_inventory-reference.md)
5. [Experience](../experience/README.md)
6. [Control](../control/README.md)
7. [Customize](../customize/README.md)
8. [Guidebook Support](../support/README.md)
