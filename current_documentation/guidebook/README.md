<!-- tags: type=guidebook; status=written; topics=guidebook,documentation,website,tutorials,workshops,matrix -->

> **Last updated:** 2026-03-12
> **Purpose:** canonical markdown source of truth for reusable Vizij teaching content

# Vizij Guidebook

This folder is the canonical source of truth for reusable Vizij teaching content.

It is upstream of:

1. public documentation,
2. public tutorials,
3. public demos and walkthrough pages,
4. workshop participant materials,
5. workshop facilitator materials,
6. event pages that need to route readers into evergreen learning paths.

It is not the place for:

1. roadmap and governance material,
2. repo-local implementation trackers,
3. facilitator timing and event operations,
4. page-specific website copy,
5. site-component implementation constraints.

Those remain in their owning locations.

## Organizing Rule

The documentation of Vizij is organized around six conceptual buckets:

1. `Introduction`
2. `Experience`
3. `Control`
4. `Customize`
5. `Integrate`
6. `Deploy`

Vizij itself is not organized around those buckets. Vizij remains organized around its actual architecture, runtime model, assets, tooling, and deployment surfaces.

Each documentation bucket is taught at three depth levels:

1. `Surface`
2. `Fundamentals`
3. `Advanced`

The difference between `Surface`, `Fundamentals`, and `Advanced` is primarily about teaching goal and conceptual depth, not about a fixed media template. Any depth level may use prose, diagrams, screenshots, videos, code, demos, walkthroughs, links, or references in whatever quantity is required to teach the concept accurately.

See [learning-model.md](learning-model.md) for the full guidebook model and [content-model-reference.md](content-model-reference.md) for the canonical teaching primitives.

## Downstream Publishing Rule

The guidebook defines the ideal teaching system first.

Website docs, tutorials, demos, workshops, and event pages are downstream projections of that system.

If a downstream publishing surface lacks support for a needed teaching primitive, that surface should eventually be extended rather than forcing the guidebook to become less expressive.

## Guidebook Teaching Standard

Guidebook learner pages should feel complete in their own right.

In practice, that means:

1. tutorial and walkthrough pages should be executable end to end from the guidebook alone
2. concept pages should explain the maintained examples with enough concrete specificity that the reader does not need to guess which app, package, or file the page is talking about
3. implementation anchors should deepen or verify the lesson, not carry the lesson on their own
4. the main route should move quickly into the real task, not spend most of the page on meta framing

The writing bar for tutorial-class pages is the best current `vizij-web` walkthroughs: clear setup, small relevant code excerpts, visible checkpoints, honest scope boundaries, and an obvious next move.

## Common Routes

1. Fast existing-face deployment route:
   `Introduction -> Experience -> Control -> Integrate -> Deploy`
2. Customization route:
   `Introduction -> Experience -> Control -> Customize -> Integrate -> Deploy`

## Five Navigation Directions

Every learner-facing guidebook module should make five movements easy:

1. process movement across buckets:
   readers should be able to see the previous bucket, current bucket, and next bucket immediately
2. depth movement inside the current bucket:
   readers should be able to see whether they are at `Surface`, `Fundamentals`, or `Advanced`, plus what sits above or below that depth
3. local module movement inside the current bucket:
   readers should be able to move to the previous or next module in the bucket sequence without guessing
4. recommendation movement:
   readers should be able to follow linked recommended next steps or optional next steps at the bottom of the page
5. reference movement:
   readers should be able to follow linked guidebook references or implementation anchors when they need verification or deeper detail

If a page does not make those five movements legible, it is under-contextualized for the guidebook.

## Core Guidebook Docs

1. [learning-model.md](learning-model.md)
   - explains the six buckets, the depth ladder, and how readers move through the matrix
2. [content-model-reference.md](content-model-reference.md)
   - defines the canonical teaching primitives and how they should be used
3. [module_inventory-reference.md](module_inventory-reference.md)
   - maps planned guidebook modules to bucket, depth, teaching objective, content forms, anchors, and downstream outputs
4. [public_projection_manifest-reference.md](public_projection_manifest-reference.md)
   - defines the downstream public docs/tutorial projection contract and points to the machine-readable schema
5. [support/guidebook-quality-criteria.md](support/guidebook-quality-criteria.md)
   - defines how guidebook modules, routes, and downstream projections should be judged as a communication system

## Bucket Map

1. [introduction](introduction/README.md)
   - orientation, system mental model, architecture bridge, and route selection
2. [experience](experience/README.md)
   - immediate contact with a working face, including `Hello Face` and richer experience examples
3. [control](control/README.md)
   - understanding how a face is manipulated and what the runtime is doing
4. [customize](customize/README.md)
   - import, transfer, rigging, posing, animating, procedural authoring, and export
5. [integrate](integrate/README.md)
   - loading, playback, minimal player, embedding, and richer application patterns
6. [deploy](deploy/README.md)
   - standalone deployment, operator flows, and deeper deployment topologies

## Cross-Cutting Layers

1. [reference](reference/README.md)
   - concise reusable reference modules that can bridge multiple buckets
2. [support](support/README.md)
   - troubleshooting, validation, glossary, quality criteria, media guidance, and support material
3. [assets](assets/README.md)
   - reusable screenshots and video references after classification

## Authoring Rules

1. Reusable teaching content should be authored here first.
2. Bucket organization is the reader-facing teaching structure; it must not be confused with Vizij's actual architecture.
3. Content selection is governed by teaching need, not by quotas such as "one diagram" or "one code sample."
4. Module pages should use as many explainers, visuals, executable examples, interactive elements, operational guides, and reference bridges as needed to teach the concept accurately.
5. Workshop packets and website pages should package or project these modules rather than becoming the canonical source.
6. Repo-local docs remain the source for implementation detail and engineering truth at the package, app, and crate level.
7. Public-route metadata belongs in `public_projection_manifest.json`; guidebook module bodies remain the canonical learner-facing content.
