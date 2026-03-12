<!-- tags: type=guidebook-module; status=written; topics=guidebook,deploy,standalone,operator -->

> **Last updated:** 2026-03-12
> **Purpose:** deliver the cleanest first deployment endpoint in the guidebook route

# Easiest Standalone Deployment

## Guidebook Context

1. **Bucket:** [Deploy](README.md)
2. **Depth:** `Surface`
3. **Module type:** walkthrough
4. **Bucket overview:** [Deploy](README.md)
5. **Useful previous module:** [Deploy](README.md)
6. **Useful next module:** [Operator and Deployment Model](operator-and-deployment-model.md)

## Reader Outcome

After this page, you should be able to explain the cleanest first deployment path for a Vizij face, launch the maintained standalone surface in development, and understand what counts as a real deployed result.

## Module Notes

### Intended Audience

This page is for readers who have already reached the player stage and now need a practical deployment endpoint rather than another demo.

### Artifact Being Touched

The deployment anchor here is `vizij-standalone`.

Its job is to package a Vizij face into a standalone desktop application that:

1. loads a GLB or GLTF face,
2. exposes a WebSocket control surface,
3. can serve a built-in web control panel on the same host,
4. behaves like a real operator-facing endpoint.

## What You Need

From `vizij-web`:

```bash
pnpm run dev:vizij-standalone
```

This page assumes you already understand:

1. what a runtime shell is,
2. what face artifact is being loaded,
3. why deployment is different from just viewing a face locally in a tutorial.

## What Counts As Deployed

For this first deployment page, “deployed” means more than “the face rendered.”

It means:

1. a face is loaded into the standalone app,
2. the runtime reports a healthy state,
3. the WebSocket control surface is available,
4. a same-host operator path is believable.

That is enough for the first deployment endpoint. ROS, hardware, and multi-screen topologies come later.

## Current Networking Boundary

The current implementation binds the control server to `127.0.0.1:{port}`.

That means:

1. the default endpoint is `ws://localhost:9000`,
2. same-host control is the strongest current truth,
3. the built-in web control panel is part of the same local deployment surface,
4. LAN-first operator stories belong to future topology work, not this first deployment page.

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

### 3. Confirm the control endpoint

The default control endpoint is:

```text
ws://localhost:9000
```

The built-in web control panel uses the same local control surface. That makes it a practical operator path for the first deployment story without requiring a second machine.

### 4. Know the first useful commands

For local development:

```bash
pnpm run dev:vizij-standalone
```

For a built artifact, the app README documents:

1. `pnpm tauri build`,
2. executable output locations,
3. runtime CLI flags like `--glb`, `--port`, `--fullscreen`, and `--display`.

## First Operator Check

Before you call the result “deployment-shaped,” confirm all of these:

1. the face is loaded,
2. the WebSocket server is running,
3. the runtime is ready,
4. the built-in control panel or another same-host client can connect,
5. the face responds predictably to control input.

If those are true, the reader has crossed from “demo” to “deployment-shaped runtime surface.”

## Current Useful Visuals

| State | Visual |
| :--- | :--- |
| **Endpoint (Face)** | ![Standalone Endpoint](../assets/screenshots/vizij-standalone-endpoint.png) |
| **Status UI** | ![Standalone Status](../assets/screenshots/vizij-standalone-status-ui.png) |
| **Control Panel** | ![Web Control Panel](../assets/screenshots/vizij-standalone-web-control-panel.png) |

These captured diagnostics show the "No model loaded" state and the built-in control panel UI.

## Success Check

You are done with this page when:

1. you can describe why `vizij-standalone` is the first deployment anchor,
2. you know the default WebSocket endpoint and the role of the built-in control panel,
3. you can explain what makes the result deployed rather than merely demoed,
4. you understand that current guidebook truth is same-host control, not LAN-first control.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/vizij-standalone/README.md`
2. `vizij-web/apps/vizij-standalone/src/App.tsx`
3. `vizij-web/apps/vizij-standalone/src/hooks/useWebSocketSync.ts`
4. `vizij-web/apps/vizij-standalone/src-tauri/src/lib.rs`
5. `current_documentation/guidebook/reference/animation-integration-and-deployment-reference.md`

## Next Step

1. If you now need the operational model behind this endpoint, continue to [Operator and Deployment Model](operator-and-deployment-model.md).
2. If you want the first deployment validation loop after that, continue to [Deployment Checks and Recovery](deployment-checks-and-recovery.md).
