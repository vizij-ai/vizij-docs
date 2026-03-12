<!-- tags: type=guidebook-module; status=written; topics=guidebook,introduction,architecture,repo-map,documentation-authority -->

> **Last updated:** 2026-03-11
> **Purpose:** connect the guidebook’s learner-facing route model to the real cross-repo architecture and documentation authority model without confusing either one for the other

# Architecture Bridge

## Reader Outcome

After this page, you should be able to explain:

1. why the guidebook buckets are a teaching system rather than the repo map,
2. which repos and docs own which kinds of implementation truth,
3. how the maintained public route maps onto the deeper cross-repo platform,
4. when to stay in the guidebook and when to move into repo-local implementation docs.

## Intended Audience

This page is for readers who already understand:

1. [What Is Vizij?](what-is-vizij.md),
2. [System Mental Model](system-mental-model.md),
3. the main route through `Experience`, `Control`, `Customize`, `Integrate`, and `Deploy`.

It is especially for contributors, facilitators, and advanced readers who are starting to cross the boundary between learner-facing explanation and implementation-facing documentation.

## What You Need

It helps if you can inspect these internal anchors:

1. `vizij-docs/current_documentation/ARCHITECTURE.md`,
2. `vizij-docs/current_documentation/concepts/ARCHITECTURE_PRIMER.md`,
3. `vizij-docs/current_documentation/ROADMAP.md`,
4. `guidebook/reference/README.md`.

You do not need crate-by-crate or package-by-package detail to use this page well.

## Artifact Being Touched

The artifact here is not a runtime bundle or app surface.

The artifact is the documentation boundary itself:

1. learner-facing guidebook structure,
2. cross-repo architecture framing,
3. documentation authority mapping,
4. route-to-implementation handoff.

This page exists so those four things do not drift into one another.

## Why This Page Exists

The guidebook is organized into buckets because that is the cleanest way to teach Vizij.

Vizij itself is not organized that way.

That difference is healthy, but only if it is explicit.

Without this page, advanced readers often make one of four mistakes:

1. they treat guidebook pages as if they were implementation specifications,
2. they assume the repo map should look like the teaching route,
3. they treat every repo as equally authoritative for every kind of truth,
4. they blur together asset, runtime shell, integration surface, and deployment endpoint.

This page prevents that drift.

## Two Views Have To Coexist

The current architecture docs require Vizij to be read through two views at once.

### 1. The guidebook or public-route view

This is the maintained learner-facing route:

```text
Hello Face
-> Authoring
-> Player
-> Deployment
```

In guidebook terms, that route is taught through:

1. `Experience`,
2. `Control`,
3. `Customize`,
4. `Integrate`,
5. `Deploy`,
6. supported by `Introduction` and `Support`.

This view is about teaching order and reader confidence.

### 2. The deeper platform view

This is the cross-repo system behind the route:

1. `vizij-rs` defines core runtime semantics and WASM-facing contracts,
2. `vizij-web` composes those contracts into authoring, runtime, tutorial, and standalone apps,
3. `vizij-assets` carries reusable meshes, rigs, and graph artifacts,
4. `vizij-docs` carries cross-repo strategy, architecture framing, and lifecycle truth,
5. `vizij-ai.github.io` is the curated public front door.

This view is about implementation authority and system boundaries.

> TODO(content-model): Add a diagram here to show the teaching-route view beside the deeper platform view. Best fit because this section introduces the page's core coexistence claim and a side-by-side visual would make the boundary between the two views more legible.

Both views are real. The mistake is treating one as if it replaces the other.

## The Guidebook Is A Teaching Structure

The guidebook buckets answer questions like:

1. what should a reader learn first,
2. what misunderstanding should a page prevent,
3. what should the next step be,
4. how should the route feel coherent.

They do not answer:

1. which package owns a type,
2. which repo defines a contract,
3. which app is the deepest implementation source,
4. how every runtime subsystem is wired internally.

That is why the guidebook can be canonical for teaching without pretending to be the canonical implementation spec.

## Documentation Authority By Surface

At a practical level, the current authority model is:

1. `vizij-docs` owns cross-repo architecture, roadmap framing, decisions, known issues, and documentation strategy.
2. `vizij-rs` and `vizij-web` local docs own package, crate, app, and workflow detail.
3. `vizij-assets` owns the binary asset source of truth.
4. `vizij-ai.github.io` owns the curated public-facing narrative and route entry.
5. transitional workshop or top-level `/docs` material should be treated as source material to extract from, not co-equal long-term authority.

This is the main bridge the page needs to establish.

> TODO(content-model): Add a comparison here to map each documentation surface to the type of truth it owns. Best fit because this section is already enumerating authority boundaries and would be stronger as a scan-friendly reference bridge.

## Mapping The Public Route To The Platform

A simple way to keep the bridge clear is to map the learner route to the deeper system surfaces.

### Experience and Control

These buckets are mostly taught through maintained apps and guidebook language.

They are often implemented in `vizij-web` tutorial or demo surfaces, but their deeper runtime truth still depends on the runtime contracts summarized in `vizij-docs` and implemented across `vizij-rs` and `vizij-web`.

### Customize

This bucket is still learner-facing, but its strongest implementation truth lives in `vizij-web/apps/vizij-authoring` and its local docs.

The guidebook teaches the route through import, rigging, poses, animations, procedural programs, and export.

The app and local authoring docs own the fine-grained implementation behavior.

### Integrate

This bucket is where runtime provider, embedding, application shells, and richer app patterns become the main teaching concern.

The guidebook route teaches those ideas.

The concrete implementation truth lives mostly in `vizij-web` apps and packages such as `@vizij/runtime-react`.

### Deploy

This bucket teaches the endpoint and operator model.

Its deeper current truth is spread across `vizij-docs` runtime plans and the `vizij-web` standalone surfaces, not inside the guidebook alone.

## When To Stay In The Guidebook

Stay in the guidebook when your main question is:

1. what does this concept mean,
2. what should I learn next,
3. what artifact am I touching,
4. how does this bucket connect to the larger route.

That is the guidebook’s job.

## When To Leave The Guidebook

Leave the guidebook when your main question becomes:

1. which repo or package owns this behavior,
2. what is the current code contract,
3. what does this app or crate actually implement,
4. where is the authoritative implementation detail.

At that point, the guidebook should route you outward instead of stretching itself beyond scope.

## What This Page Does And Does Not Cover

This page does cover:

1. the difference between teaching structure and platform structure,
2. the current authority map for major documentation surfaces,
3. the bridge from learner route to repo reality.

This page does not cover:

1. ABI details,
2. crate or package signatures,
3. detailed runtime internals,
4. operational hardening decisions,
5. current bug-by-bug implementation status.

Those belong in architecture docs, repo-local docs, or project-tracking docs.

## Success Check

You are done with this page when:

1. you can explain why the guidebook bucket model is not the repo map,
2. you can identify which documentation surface owns which type of truth,
3. you can route from a learner-facing question to the right implementation-facing source,
4. you can describe the public route and the deeper platform view without treating them as conflicting stories.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-docs/current_documentation/ARCHITECTURE.md`
2. `vizij-docs/current_documentation/concepts/ARCHITECTURE_PRIMER.md`
3. `vizij-docs/current_documentation/ROADMAP.md`
4. `current_documentation/guidebook/introduction/system-mental-model.md`
5. `current_documentation/guidebook/learning-model.md`
6. `current_documentation/guidebook/content-model-reference.md`
7. `current_documentation/guidebook/reference/README.md`

## Next Step

If you want to return to learner-facing system framing, go to [System Mental Model](system-mental-model.md).

If you want the route-first builder path, go to [How To Use This Guidebook](how-to-use-this-guidebook.md) and then [Hello Face Quickstart](../experience/hello-face-quickstart.md).

If you need stable vocabulary before leaving the guidebook, go to [Glossary and Terminology Bridge](../support/glossary-and-terminology-bridge.md).
