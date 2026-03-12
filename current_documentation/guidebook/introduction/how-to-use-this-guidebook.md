<!-- tags: type=guidebook-module; status=written; topics=guidebook,introduction,routing -->

> **Last updated:** 2026-03-11
> **Purpose:** help readers choose the right route and depth in the guidebook without front-loading unnecessary complexity

# How To Use This Guidebook

## Reader Outcome

After this page, you should be able to choose the right Vizij learning route for your goal and know where to go next.

## Intended Audience

This page is for:

1. newcomers who want the shortest path to a working Vizij face,
2. builders who want to know where customization fits,
3. contributors who need to understand the guidebook structure before going deeper.

## What You Need

You do not need to understand Vizij architecture before using this page.

It is enough to know that Vizij can load and control expressive faces and that the guidebook is organized to help you learn that system in stages.

## Artifact Being Touched

The guidebook is the artifact here.

It is the canonical teaching system for Vizij. It is not the same thing as the internal architecture of the platform.

## Route Map

The guidebook is organized around six documentation buckets:

1. `Introduction`
2. `Experience`
3. `Control`
4. `Customize`
5. `Integrate`
6. `Deploy`

Each bucket supports three depth levels:

1. `Surface`
   - get oriented and succeed quickly
2. `Fundamentals`
   - learn the mental models and practical basics
3. `Advanced`
   - go deeper into ownership, extension, or more complex implementation patterns

> TODO(content-model): Add a workflow map here to connect bucket order with the three depth levels. Best fit because this page is a decision guide and readers need one compact visual that shows how route choice and depth choice interact.

## Start Here If

### You want the fastest believable route to a working deployment

Follow:

`Introduction -> Experience -> Control -> Integrate -> Deploy`

Use this route if you want to:

1. prove that Vizij works,
2. understand the control model,
3. get a face into a player,
4. reach a real deployment endpoint quickly.

### You want to make the face your own before deploying it

Follow:

`Introduction -> Experience -> Control -> Customize -> Integrate -> Deploy`

Use this route if you want to:

1. modify an existing face,
2. work on rigs, poses, or animations,
3. export something you now own,
4. then integrate and deploy it.

### You only need one concept right now

Jump directly to the bucket that matches the problem you are trying to solve:

1. `Experience` if you need first contact with a working face,
2. `Control` if you need to understand paths, standard controls, or runtime inputs,
3. `Customize` if you need authoring and export,
4. `Integrate` if you need a runtime shell or application embedding,
5. `Deploy` if you need a real endpoint, operator flow, or standalone path.

> TODO(content-model): Add a comparison here to contrast the fast deployment route, the customization route, and the single-bucket jump-in option. Best fit because this section is already where readers choose among adjacent paths and would benefit from a scan-friendly side-by-side.

## What This Guidebook Does Not Replace

This guidebook is deliberately reader-facing.

It does not replace:

1. repo-local implementation docs in `vizij-web` and `vizij-rs`,
2. internal roadmap and architecture authority docs in `vizij-docs/current_documentation`,
3. detailed app-level runbooks when the implementation surface matters more than the teaching abstraction.

When you need engineering truth, use the implementation anchors provided in each module.

## Suggested First Step

If you are new to Vizij, start with [Hello Face Quickstart](../experience/hello-face-quickstart.md).

That page is the fastest way to see a working face, trigger visible changes, and build trust in the runtime before you learn the deeper vocabulary.

## Success Check

You are done with this page when:

1. you can name the route you want to follow,
2. you know whether you need `Surface`, `Fundamentals`, or `Advanced` depth first,
3. you know which page you are opening next.

## Implementation Anchors

Use these when you need the canonical framing behind this page:

1. `current_documentation/guidebook/README.md`
2. `current_documentation/guidebook/learning-model.md`
3. `current_documentation/ROADMAP.md`
4. `current_documentation/ARCHITECTURE.md`

## Next Step

1. New reader: [Hello Face Quickstart](../experience/hello-face-quickstart.md)
2. Reader who wants the bucket overview first: [Introduction](README.md)
3. Reader who already saw a demo and needs semantics: [Paths and Standard Controls](../control/paths-and-standard-controls.md)
