<!-- tags: type=reference; status=written; topics=guidebook,learning-model,matrix -->

> **Last updated:** 2026-03-11
> **Purpose:** define how readers move through the Vizij guidebook and how bucket plus depth combine into a teaching system

# Guidebook Learning Model

## 1. Core Principle

The documentation of Vizij is organized around six conceptual buckets.

Vizij itself is not organized around those buckets. Vizij remains organized around its actual architecture, runtime model, assets, tooling, and deployment surfaces.

The buckets are a teaching structure for the docs.

## 2. The Six Documentation Buckets

1. `Introduction`
2. `Experience`
3. `Control`
4. `Customize`
5. `Integrate`
6. `Deploy`

These buckets represent a reader-facing explanation of the system, not the system's internal architecture.

## 3. The Three Depth Levels

Every bucket should support three depth levels:

1. `Surface`
   - immediate orientation and usable success
   - enough context to understand what the reader is seeing or doing
   - a clear next step
2. `Fundamentals`
   - core mental models, vocabulary, structure, and operational basics
   - what a serious reader must understand to work reliably in that bucket
3. `Advanced`
   - extension, ownership, customization, architecture-sensitive behavior, and richer implementation patterns
   - what a reader needs when they are going deeper rather than merely getting started

The difference between these levels is about teaching goal and conceptual depth, not about whether a page has a particular number of diagrams, screenshots, code examples, or videos.

## 4. How Readers Move Through the Matrix

This model exists so readers can:

1. move across the whole Vizij journey at a shallow depth,
2. stop at the bucket they need right now,
3. dive deeply into one bucket without being forced through everything else,
4. follow different routes depending on whether they want to deploy quickly or make the system more their own.

## 5. Common Reader Routes

### Fast existing-face deployment route

`Introduction -> Experience -> Control -> Integrate -> Deploy`

This route is for readers who want the cleanest path from first encounter to a real deployment of an existing face.

### Customization route

`Introduction -> Experience -> Control -> Customize -> Integrate -> Deploy`

This route is for readers who want to modify an existing face or build something more their own before they integrate and deploy it.

## 6. Relationship to the Content Model

The bucket-and-depth model describes where a module sits in the teaching system.

The [content-model-reference.md](content-model-reference.md) document describes how that module should be taught. A `Surface` page and an `Advanced` page may both use diagrams, screenshots, code, or video if those are the right tools for the job.

## 7. Relationship to Public Surfaces

The guidebook is the ideal canonical teaching system.

Downstream surfaces should project it in different forms:

1. website hubs should route readers into the right bucket and depth,
2. public docs should usually emphasize `Fundamentals`,
3. tutorials should often bridge `Surface` into `Fundamentals`,
4. demos often live in `Experience` and `Control`,
5. workshops should package bucket modules into time-boxed learning flows,
6. advanced implementation walkthroughs may draw heavily from `Advanced` modules in `Customize`, `Integrate`, and `Deploy`.

If a downstream surface cannot yet support a needed teaching primitive well, the downstream surface should eventually adapt rather than forcing the guidebook model to shrink.
