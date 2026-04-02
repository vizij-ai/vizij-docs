<!-- tags: family=workshop; type=handout; workshop_kind=reusable; workshop_status=ready; topics=workshop,workshops,vizij-afternoon-workshop,handouts,animation-integration-deployment-reference -->

# Handout: Animation, Integration, and Deployment Reference

Last updated: 2026-03-09

## Animation

Use `demo-vizij-player` to discuss:

1. Loaded assets
2. Rig controls
3. Animation clips
4. Diagnostics and graph/orchestrator wiring

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

Important note:

1. The app requires `VITE_GEMINI_API_KEY` to connect live.
2. Treat live connection as a facilitator-led segment unless participants are credentialed.

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
    "standard/vizij/left_eye/pos/x": { "f64": 0.5 }
  }
}
```
