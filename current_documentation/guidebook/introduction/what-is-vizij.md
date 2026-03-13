<!-- tags: type=guidebook-module; status=written; topics=guidebook,introduction,orientation -->

> **Last updated:** 2026-03-13
> **Purpose:** explain what Vizij is, what it enables, and how a new reader should choose the next step

# What Is Vizij?

## Guidebook Context

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: Start of guidebook<br>Current: [Introduction](README.md)<br>Next: [Experience](../experience/README.md) |
| Depth ladder in this bucket | Above: none, this is the entry depth in this bucket<br>Current: `Surface`<br>Below: [System Mental Model](system-mental-model.md), [Customization Concepts Primer](customization-concepts-primer.md), [Architecture Bridge](architecture-bridge.md) |
| Module position in this bucket | Previous in bucket: start at [Introduction](README.md)<br>Current module: `What Is Vizij?`<br>Next in bucket: [How To Use This Guidebook](how-to-use-this-guidebook.md) |
| Reference bridges | [Guidebook Learning Model](../learning-model.md)<br>[Guidebook Module Inventory](../module_inventory-reference.md)<br>[Glossary and Terminology Bridge](../support/glossary-and-terminology-bridge.md) |
| Module type | concept page |
| Bucket overview | [Introduction](README.md) |

## Reader Outcome

After this page, you should understand what Vizij is for, what kinds of work it enables, and which maintained route you should follow next.

## Module Notes

- This page is the first-stop orientation for readers deciding whether Vizij matches their needs.
- It explains the maintained public route at a high level: first contact, customization, integration, and deployment.
- Runtime architecture, control vocabulary, authoring internals, and topology detail are intentionally left for later modules.

## What You Need

You do not need to understand the internal architecture before reading this page.

It is enough to know that Vizij is about expressive digital faces that can be shown, controlled, customized, integrated into applications, and carried through to real deployment surfaces.

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

### The Builder Spine

| Stage | Current visual anchor | What it proves |
| --- | --- | --- |
| Hello Face | [fullscreen-demo.png](../assets/screenshots/fullscreen-demo.png) | the smallest maintained runtime can render a face and respond visibly |
| Authoring | [vizij-authoring.png](../assets/screenshots/vizij-authoring.png) | the face can become an editable artifact instead of only a runtime demo |
| Player | [player-demo.png](../assets/screenshots/player-demo.png) | the same runtime can live inside a bundle-first shell with visible diagnostics and controls |
| Deployment | operator-ready runtime status, endpoint identity, and connection proof | deployment is validated through runtime health, slot/control discovery, and recovery checks rather than a single hero screenshot |

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

## How To Choose Your Next Page

If this page convinced you that Vizij is relevant, the next question is how you want to enter the system.

Choose based on your immediate goal:

1. if you want the fastest concrete proof, go to [Hello Face Quickstart](../experience/hello-face-quickstart.md),
2. if you want to understand how the guidebook routes are organized, go to [How To Use This Guidebook](how-to-use-this-guidebook.md),
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

## Recommended Next Steps

1. If you want the first concrete proof, read [Hello Face Quickstart](../experience/hello-face-quickstart.md).
2. If you want the route map first, read [How To Use This Guidebook](how-to-use-this-guidebook.md).
3. If you want the deeper conceptual map, read [System Mental Model](system-mental-model.md).
