<!-- tags: type=guidebook-module; status=in_progress; topics=guidebook,deploy,standalone,operator -->

> **Last updated:** 2026-03-11
> **Purpose:** deliver the cleanest first deployment endpoint in the guidebook route

# Easiest Standalone Deployment

## Reader Outcome

After this page, you should be able to explain the cleanest first deployment path for a Vizij face, launch the maintained standalone surface in development, and understand what counts as a real deployed result.

## Intended Audience

This page is for readers who have already reached the player stage and now need a practical deployment endpoint rather than another demo.

## What You Need

From `vizij-web`:

```bash
pnpm run dev:vizij-standalone
```

This page assumes you already understand:

1. what a runtime shell is,
2. what face artifact is being loaded,
3. why deployment is different from just viewing a face locally in a tutorial.

## Artifact Being Touched

The deployment anchor here is `vizij-standalone`.

Its job is to package a Vizij face into a standalone desktop application that:

1. loads a GLB or GLTF face,
2. exposes a WebSocket control surface,
3. can serve a built-in web control panel,
4. behaves like a real operator-facing endpoint.

## What Counts As Deployed

For this first deployment page, “deployed” means more than “the face rendered.”

It means:

1. a face is loaded into the standalone app,
2. the runtime reports a healthy state,
3. the WebSocket control surface is available,
4. an operator or remote client has a believable control path.

That is enough for the first deployment endpoint. ROS, hardware, and multi-screen topologies come later.

## Walkthrough

### 1. Launch the standalone app in development

From `vizij-web`:

```bash
pnpm run dev:vizij-standalone
```

If no model is loaded on startup, the app presents a file-picker flow.

That is still part of the deployment story: the app is a real runtime surface, not just a static sample page.

### 2. Confirm the deployment states

The standalone app teaches the first deployment checklist through its UI:

1. loading state while the bundle is being prepared,
2. explicit error state if loading fails,
3. no-model state with file-picker recovery,
4. runtime state once the face is active,
5. WebSocket connection state,
6. visible port and namespace information.

These states matter because deployment credibility comes from clear operation and recovery, not only from rendering.

### 3. Confirm the control endpoint

The default control endpoint is:

```text
ws://localhost:9000
```

The built-in web control panel uses the same control surface. That makes it a practical operator path for the first deployment story.

At this stage, the important idea is not every protocol detail. It is that deployment now includes a runtime plus a remote control path.

### 4. Know the first useful commands

For local development:

```bash
pnpm run dev:vizij-standalone
```

For a real built artifact, the app README documents:

1. `pnpm tauri build`
2. executable output locations
3. runtime CLI flags like `--glb`, `--port`, `--fullscreen`, and `--display`

That is the boundary between the first deployment walkthrough and deeper operator or packaging docs.

## First Operator Check

The first operator check is simple:

1. the face is loaded,
2. the WebSocket server is running,
3. the runtime is ready,
4. a control client can connect or the built-in web control panel can be used.

If those are true, the reader has crossed from “demo” to “deployment-shaped runtime surface.”

## Current Useful Visual

Wave 1 does not yet have a dedicated standalone screenshot in the guidebook assets.

That is an explicit media gap to fill later. For now, the app README and the standalone UI states are enough to support the page.

## Success Check

You are done with this page when:

1. you can describe why `vizij-standalone` is the first deployment anchor,
2. you know the default WebSocket endpoint and the role of the web control panel,
3. you can explain what makes the result deployed rather than merely demoed.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/vizij-standalone/README.md`
2. `vizij-web/apps/vizij-standalone/src/App.tsx`
3. `vizij-web/apps/vizij-standalone/src/hooks/useWebSocketSync.ts`
4. `current_documentation/guidebook/reference/animation-integration-and-deployment-reference.md`
5. `current_documentation/workshops/vizij-afternoon-workshop/exercises/activity-2-animation-integration-deployment.md`

## Next Step

1. If you now need the operational model behind this endpoint, the next wave should deepen the `Deploy` bucket with `Operator and Deployment Model`.
2. If you need richer application behavior before deployment, return to the `Integrate` bucket for later advanced modules.
