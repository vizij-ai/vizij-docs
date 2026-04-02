<!-- tags: family=guidebook; type=guidebook; editorial_status=completed; publication_status=planned; topics=guidebook,documentation,website,tutorials,workshops,matrix -->

> **Last updated:** 2026-03-31
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

The guidebook is organized around a bucket-and-depth teaching model.

Its canonical structure lives in [learning-model.md](learning-model.md), which defines:

1. the six guidebook buckets,
2. the three depth levels,
3. the common reader routes,
4. the navigation contract for learner-facing pages.

Use this README as the practical entry page for the guidebook itself, and use [content-model-reference.md](content-model-reference.md) for the canonical teaching primitives.

## Downstream Publishing Rule

The guidebook defines the ideal teaching system first.

Website docs, tutorials, demos, workshops, and event pages are downstream projections of that system.

If a downstream publishing surface lacks support for a needed teaching primitive, that surface should eventually be extended rather than forcing the guidebook to become less expressive.

## Public Site Projection Workflow

The public docs/tutorial pages in `vizij-ai.github.io` are generated from this guidebook.

Maintained workflow:

1. edit the canonical guidebook markdown under `vizij-docs/current_documentation/guidebook/`
2. update `public_projection_manifest.json` when public route metadata, hub grouping, redirects, or route adjacency need to change
3. from `vizij-ai.github.io`, run `npm run content:sync:guidebook`
4. review the generated outputs in:
   - `src/generated/guidebook/pages/`
   - `src/generated/guidebook/hubs.json`
   - `src/generated/guidebook/redirects.json`
   - `public/guidebook-assets/`
5. commit the guidebook source change together with the regenerated public output when the public site should pick up that update

Do not treat `vizij-ai.github.io/src/generated/guidebook/` as the canonical editing surface. Those files are generated output and can be overwritten by the sync step.

## Guidebook Teaching Standard

Guidebook learner pages should feel complete in their own right.

In practice, that means:

1. tutorial and walkthrough pages should be executable end to end from the guidebook alone
2. concept pages should explain the maintained examples with enough concrete specificity that the reader does not need to guess which app, package, or file the page is talking about
3. implementation anchors should deepen or verify the lesson, not carry the lesson on their own
4. the main route should move quickly into the real task, not spend most of the page on meta framing

The writing bar for tutorial-class pages is the best current `vizij-web` walkthroughs: clear setup, small relevant code excerpts, visible checkpoints, honest scope boundaries, and an obvious next move.

## Public Route Mapping

The guidebook bucket chain is the only public route framing.

`Introduction` is the public entry bucket. The main build progression starts after it and runs through `Experience -> Control -> Customize -> Integrate -> Deploy`.

App and demo names remain useful, but only as anchors inside the bucket model:

| Guidebook bucket | Public meaning | Strongest current app/doc anchor |
| --- | --- | --- |
| `Introduction` | orientation, route choice, and entry into the system before building | `introduction/what-is-vizij.md` and `introduction/how-to-use-this-guidebook.md` |
| `Experience` | first proof that a maintained face runs and responds visibly | `Hello Face Quickstart` |
| `Control` | understanding runtime interactions and stable control semantics | `First Control Interactions` |
| `Customize` | changing the face, rig, poses, animations, or exportable artifact | `vizij-authoring` and `Tweak an Existing Face` |
| `Integrate` | embedding the face inside an app or runtime shell | `Minimal Web Player` / `demo-vizij-player` |
| `Deploy` | reaching an operator-facing or same-host endpoint | `Easiest Standalone Deployment` / `vizij-standalone` |

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
