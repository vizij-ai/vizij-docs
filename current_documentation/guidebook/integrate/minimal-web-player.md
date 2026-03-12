<!-- tags: type=guidebook-module; status=written; topics=guidebook,integrate,player,runtime-shell -->

> **Last updated:** 2026-03-11
> **Purpose:** establish the smallest believable player-stage runtime surface in the guidebook route

# Minimal Web Player

## Reader Outcome

After this page, you should understand what the first trustworthy player-stage runtime surface needs, how the current maintained player anchor exposes those pieces, and what to validate before moving toward deployment.

## Intended Audience

This page is for readers who have already seen a face work and now want to understand the smallest useful application shell that can host it on the web.

## What You Need

From `vizij-web`:

```bash
pnpm run dev:demo-vizij-player
```

It also helps if you have already completed:

1. [Hello Face Quickstart](../experience/hello-face-quickstart.md)
2. [Paths and Standard Controls](../control/paths-and-standard-controls.md)

## Artifact Being Touched

The guidebook idea of a minimal player is:

1. a known-good asset or bundle,
2. a runtime shell that can load it honestly,
3. a visible face surface,
4. clear loading, ready, and error states,
5. only enough control to prove the shell is healthy.

The current maintained implementation anchor is `demo-vizij-player`.

That app is richer than the eventual smallest public shell, but it already shows the discipline this page needs to teach: clear bootstrap state, visible loading behavior, a face viewport, and explicit diagnostics.

## What Makes a Player Minimal

> TODO(content-model): Add a comparison table here to separate the minimum trustworthy player states from richer app concerns that intentionally belong later. Best fit because this section is defining scope by exclusion and readers benefit from a scan-friendly boundary between “minimal” and “not yet.”

A minimal player is not “the smallest amount of code possible.”

It is the smallest runtime shell that still behaves like a real app.

For wave 1, that means the player should make these states obvious:

1. asset loaded or not loaded,
2. runtime bootstrapped or not bootstrapped,
3. face visible or not visible,
4. errors visible when something fails.

## Walkthrough

> TODO(content-model): Add an annotated screenshot here to label the bootstrap checklist, face viewer, controls, animations, and diagnostics panels. Best fit because this walkthrough is teaching readers how to read the shell anatomy before they understand every panel in depth.

### 1. Launch the player anchor

From `vizij-web`:

```bash
pnpm run dev:demo-vizij-player
```

When it opens, look for these panels:

1. `Bootstrap Checklist`
2. `Face Viewer`
3. rig controls
4. animations
5. diagnostics

You are not trying to master all of them yet. You are using the app to understand the anatomy of a trustworthy runtime shell.

### 2. Read the player shell states

The `Bootstrap Checklist` teaches the first player rule: runtime state must be visible.

The app explicitly shows:

1. GLB loader state,
2. orchestrator runtime state,
3. registered controllers,
4. active high-level rigs.

The `Face Viewer` teaches the second player rule: the viewport must be honest.

It shows:

1. `Loading GLB...`
2. a visible error if the GLB fails,
3. a face when the root id is ready,
4. a clear empty state when no GLB is loaded.

### 3. Keep the first player restrained

The point of the first player is not to rebuild authoring inside the player.

The point is to prove:

1. a face can be loaded,
2. the shell can report health honestly,
3. the runtime and viewer are wired clearly enough that later work has a trustworthy base.

That is why the player stage belongs after `Control` and before `Deploy`.

## What Not To Add Yet

Do not treat the first player as:

1. a full authoring UI,
2. a live conversation app,
3. a deployment shell with every operator concern,
4. a huge custom control dashboard.

The first player is the calm runtime branch point. Once it is healthy, you can move either toward richer integration or toward deployment.

## Current Useful Visual

> TODO(content-model): Add a checklist here to summarize the minimum player validation pass a reader should complete before branching to richer integration or deployment. Best fit because this is the last surface-stage pause point and a compact gate would reinforce what “trustworthy enough to continue” actually means.

An existing screenshot already lives at:

`current_documentation/workshops/vizij-afternoon-workshop/assets/screenshots/demo-vizij-player.png`

It captures the panel structure clearly enough for wave 1.

## Success Check

You are done with this page when:

1. you can explain what makes the player shell healthy,
2. you can name the bootstrap and face-viewer states that matter,
3. you understand why the player stage should stay restrained before deployment.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/demo-vizij-player/src/App.tsx`
2. `vizij-web/apps/demo-vizij-player/src/renderer/FaceViewport.tsx`
3. `vizij-web/apps/demo-vizij-player/README.md`
4. `current_documentation/guidebook/reference/animation-integration-and-deployment-reference.md`

## Next Step

1. If you want the fundamentals behind what this shell is loading and hosting, continue to [Loading, Playback, and Embedding](loading-playback-and-embedding.md).
2. If your goal is a real endpoint right away, continue to [Easiest Standalone Deployment](../deploy/easiest-standalone-deployment.md).
