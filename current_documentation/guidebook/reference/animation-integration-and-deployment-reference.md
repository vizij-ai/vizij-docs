<!-- tags: family=guidebook; type=reference; editorial_status=completed; publication_status=planned; topics=guidebook,animation,integration,deployment -->

> **Last updated:** 2026-03-31
> **Purpose:** provide the compact reference bridge between animation transport, richer app integration, and the standalone deployment slot contract

# Animation, Integration, and Deployment Reference

## Guidebook Context

1. **Bucket:** [Guidebook Reference](README.md)
2. **Depth role:** cross-cutting reusable reference layer
3. **Module type:** reference bridge
4. **Bucket overview:** [Guidebook Reference](README.md)
5. **Useful previous module:** [Renderer and Rigging Reference](renderer-and-rigging-reference.md)
6. **Useful next module:** [Guidebook Reference](README.md)

## Reader Outcome

After this page, you should be able to recall the main maintained animation and live-integration anchors, plus the operator-facing slot contract used by the standalone deployment path.

## Use This Reference When

Open this page when you already know you are working in one of these three areas and need a compact reminder of:

1. animation transport and playback helpers,
2. the maintained live-integration anchor,
3. the deployment-facing slot-writing contract.

If you are still learning the main public route, use this page as a lookup reference rather than as the first teaching page.

## Animation

Use `demo-vizij-player` to discuss:

1. loaded assets
2. rig controls
3. animation clips
4. diagnostics and graph/orchestrator wiring

Use `@vizij/runtime-react` to discuss:

1. `playAnimation`
2. `stopAnimation`
3. `animateValue`
4. merge and blending behavior at the runtime level

## Live Integration

Use `tutorial-agent-face` to discuss:

1. conversation engine connection
2. viseme mapping
3. blend window and lead tuning
4. expression and gaze tools

Important notes:

1. the app requires `VITE_GEMINI_API_KEY` to connect live
2. treat live connection as a facilitator-led or credentialed path unless readers are properly configured

## Deployment

Use `vizij-standalone` to discuss:

1. packaging a runtime as a desktop app
2. exposing a WebSocket control surface
3. serving a built-in web control panel
4. moving from local demo to robot-facing control

## Deployment Transport Contract

Keep the operator-facing slot name separate from the internal runtime path:

| Layer | Example | Use it for |
| --- | --- | --- |
| discovered slot name | `standard/vizij/left_eye/pos/x` | WebSocket client writes and operator control |
| internal runtime path | `rig/{faceId}/standard/vizij/left_eye/pos/x` | runtime and diagnostics reasoning |

## Handy Local Entry Points

```bash
pnpm run dev:demo-vizij-player
pnpm --filter tutorial-agent-face run dev
pnpm run dev:vizij-standalone
```

## Handy Message Format

`vizij-standalone` uses typed values over WebSocket. If the endpoint exposes standard gaze slots, a write can look like:

```json
{
  "type": "set_slot_values",
  "values": {
    "standard/vizij/left_eye/pos/x": { "f64": 0.5 }
  }
}
```

## Best Next Pages

1. If you need the longer animation authoring route, continue to [Animations](../customize/animations.md).
2. If you need the richer app route, continue to [Application Integration Patterns](../integrate/application-integration-patterns.md).
3. If you need the deployment readiness loop behind this transport contract, continue to [Deployment Checks and Recovery](../deploy/deployment-checks-and-recovery.md).
