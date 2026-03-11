<!-- tags: type=reference; status=in_progress; topics=guidebook,animation,integration,deployment -->

> **Last updated:** 2026-03-11
> **Guidebook note:** promoted from the workshop handout so this version can become the reusable canonical source

# Animation, Integration, and Deployment Reference

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

## Handy Commands

```bash
pnpm run dev:demo-vizij-player
pnpm --filter tutorial-agent-face run dev
pnpm run dev:vizij-standalone
```

## Handy Message Format

`vizij-standalone` uses typed values over WebSocket. Most animation-like controls use floats such as:

```json
{
  "type": "set_slot_values",
  "values": {
    "rig/robot/standard/left_eye/pos/x": { "f64": 0.5 }
  }
}
```

## Downstream Use

This reference should feed:

1. animation workflows
2. agent-face tutorials
3. deployment docs and operator guidance
4. facilitator live-demo notes
