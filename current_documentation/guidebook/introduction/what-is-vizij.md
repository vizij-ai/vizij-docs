<!-- tags: type=guidebook-module; status=written; topics=guidebook,introduction,orientation -->

> **Last updated:** 2026-03-11
> **Purpose:** explain what Vizij is, what it enables, and how a new reader should choose the next step

# What Is Vizij?

## Reader Outcome

After this page, you should understand what Vizij is for, what kinds of work it enables, and which maintained route you should follow next.

## Intended Audience

This page is for:

1. readers encountering Vizij for the first time,
2. builders deciding whether Vizij matches their needs,
3. contributors who need a quick public-facing orientation before reading deeper pages.

## What You Need

You do not need to understand the internal architecture before reading this page.

It is enough to know that Vizij is about expressive digital faces that can be shown, controlled, customized, integrated into applications, and carried through to real deployment surfaces.

## Artifact Being Touched

The artifact here is the Vizij system as a maintained learning and builder path.

At the public route level, that path is:

`Hello Face -> Authoring -> Player -> Deployment`

This page explains that path at a high level. It does not try to teach the implementation details of each stage.

## What Vizij Is

Vizij is a system for working with expressive digital faces as real runtime artifacts rather than as static media.

In practice, Vizij lets you:

1. start from a working face,
2. control visible behavior at runtime,
3. customize or author the face further when needed,
4. load that result into a player or application,
5. carry it into a deployment surface that an operator or end user can actually use.

That is why Vizij is best understood as a path, not just as a renderer, a demo, or an authoring tool by itself.

## Why A New Reader Should Care

Vizij matters if you need more than a pre-rendered character clip.

It is useful when you want a face that can:

1. respond live to inputs,
2. expose controllable behaviors instead of only fixed playback,
3. be adjusted or rebuilt through an authoring workflow,
4. move from local experimentation into a maintained player and deployment story.

The important promise is not that every surface is equally simple. The important promise is that there is a maintained route from first visible success to something you can actually build on.

## The Maintained Builder Path

The current public framing for Vizij is one maintained builder spine:

`Hello Face -> Authoring -> Player -> Deployment`

> TODO(content-model): Add a diagram here to show the maintained builder spine from first proof through deployment. Best fit because this section defines the reader's first route-level mental map and a simple visual would make the stage boundaries easier to retain.

Each stage answers a different question.

### Hello Face

This is the first proof that Vizij is real.

You run a working face, trigger visible changes, and build trust that the runtime is doing something live rather than showing a static asset.

### Authoring

This is where customization becomes concrete.

You work with the face as an editable artifact so you can adjust, transfer, rig, pose, animate, and export what you need without treating the runtime demo as the only product surface.

### Player

This is where the authored or selected face becomes part of a reusable runtime shell.

The player stage matters because it turns a face into something that can be loaded, validated, and embedded in a more deliberate application context.

### Deployment

This is where Vizij stops being only a local experiment.

Deployment covers the practical end surfaces where the face is actually run, operated, and checked as a usable system.

## What This Page Does And Does Not Teach

This page teaches:

1. the broad purpose of Vizij,
2. the maintained public route through the system,
3. the difference between first contact, customization, integration, and deployment at a high level.

This page does not teach:

1. the runtime architecture in depth,
2. path semantics or control vocabulary,
3. authoring internals such as rigging and pose structure,
4. deployment topology or protocol detail.

Those belong to later guidebook modules.

## How To Choose Your Next Page

If this page convinced you that Vizij is relevant, the next question is how you want to enter the system.

Choose based on your immediate goal:

1. if you want the fastest concrete proof, go to `Hello Face`,
2. if you want to understand how the guidebook routes are organized, go to `How To Use This Guidebook`,
3. if you want the conceptual map behind the route before you touch more pages, go to [System Mental Model](system-mental-model.md).

Most new readers should still start by seeing something work.

## Success Check

You are done with this page when:

1. you can explain Vizij as a maintained path for working with expressive digital faces,
2. you can name the current builder spine as `Hello Face -> Authoring -> Player -> Deployment`,
3. you know whether your next step is first contact, route selection, or a deeper mental model.

## Implementation Anchors

Use these when you need the current authoritative framing behind this page:

1. `vizij-docs/current_documentation/guidebook/README.md`
2. `vizij-docs/current_documentation/guidebook/introduction/README.md`
3. `vizij-docs/current_documentation/guidebook/introduction/how-to-use-this-guidebook.md`
4. `vizij-docs/current_documentation/ROADMAP.md`
5. `vizij-docs/current_documentation/ARCHITECTURE.md`

## Next Step

1. If you want the first concrete proof, read [Hello Face Quickstart](../experience/hello-face-quickstart.md).
2. If you want the route map first, read [How To Use This Guidebook](how-to-use-this-guidebook.md).
3. If you want the deeper conceptual map, read [System Mental Model](system-mental-model.md).
