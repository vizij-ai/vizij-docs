<!-- tags: type=guidebook-bucket; status=in_progress; topics=guidebook,introduction -->

> **Last updated:** 2026-03-11
> **Purpose:** orient readers to Vizij and help them choose a route through the guidebook

# Introduction

`Introduction` is the first documentation bucket.

Its job is not to teach every subsystem. Its job is to help a new reader understand what Vizij is, why it exists, what the major pieces are, how the guidebook works, and where they should go next.

## Bucket Overview

This bucket should establish:

1. that the guidebook is a teaching structure rather than the system architecture,
2. the broad relationship between assets, runtime, control, customization, integration, and deployment,
3. the main reader routes through the guidebook,
4. where implementation truth lives when a reader is ready to go deeper.

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
3. route or decision guides,
4. simple diagrams,
5. related guidebook links.

### Fundamentals

**Teaching objective:** establish the stable mental model that lets readers interpret later buckets correctly.

**Misunderstandings to prevent:**

1. confusing asset, runtime face, player, integration surface, and deployment target,
2. assuming the quick-start surface is the whole system,
3. assuming the teaching buckets are the engineering boundaries.

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
5. guidebook cross-links back into practical modules.

## Planned Modules

| Module | Depth | Module type | Teaching focus |
| --- | --- | --- | --- |
| What Is Vizij? | Surface | concept page | explain what Vizij is and what it enables |
| [How To Use This Guidebook](how-to-use-this-guidebook.md) | Surface | decision guide | route readers into the right bucket and depth |
| System Mental Model | Fundamentals | concept page | explain how the major parts relate |
| Architecture Bridge | Advanced | reference bridge | connect the guidebook model to real implementation surfaces |

## Recommended Teaching Approaches

1. Prefer clarity and routing over volume.
2. Keep this bucket reader-facing even when it references architecture.
3. Use diagrams when they reduce ambiguity, not because every page needs one.
4. End pages with concrete next-step links into `Experience`, `Control`, or the relevant route.

## Cross-Links

1. [Guidebook README](../README.md)
2. [Guidebook Learning Model](../learning-model.md)
3. [Guidebook Content Model Reference](../content-model-reference.md)
4. [Guidebook Module Inventory](../module_inventory-reference.md)
5. [Experience](../experience/README.md)
6. [Control](../control/README.md)
7. [Guidebook Support](../support/README.md)
