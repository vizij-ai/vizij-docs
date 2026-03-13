# Demo Command Sheet

Last updated: 2026-03-13

Run all commands from the `vizij-web` repo root unless noted otherwise.

## One-Time Setup

```bash
pnpm install
```

## Core Workshop Apps

### Vizij Authoring

```bash
pnpm run dev:vizij-authoring
```

Use for:

1. Face design and control
2. Renderer data inspection
3. Rigging and pose groups

### Tutorial Fullscreen Face

```bash
pnpm run dev:tutorial-fullscreen-face
```

Use for:

1. Hello Face
2. Runtime-react walkthrough
3. Gaze and pose hotkeys

### Demo Vizij Player

```bash
pnpm run dev:demo-vizij-player
```

Use for:

1. Animation concepts
2. Rig-control panels
3. Orchestrator merge explanation

### Tutorial Agent Face

Required environment variable:

```bash
export VITE_GEMINI_API_KEY="<set locally before launch>"
```

Launch:

```bash
pnpm --filter tutorial-agent-face run dev
```

Use for:

1. Live conversation integration
2. Viseme lead and blend tuning
3. Emotion and gaze function-calling demo
4. Facilitator-led teaser and guided explanation, not a required participant app run

### Vizij Standalone

```bash
pnpm run dev:vizij-standalone
```

Use for:

1. Deployment narrative
2. WebSocket control walkthrough
3. Robot-facing runtime packaging
4. Guided deployment explanation rather than participant shipping

## Recommended Demo Order

1. `tutorial-agent-face` teaser
2. `vizij-authoring`
3. `tutorial-fullscreen-face`
4. `demo-vizij-player`
5. `tutorial-agent-face`
6. `vizij-standalone`

## Sample Assets

1. `apps/tutorial-fullscreen-face/public/assets/hugo_rigged.glb`
2. `apps/tutorial-agent-face/public/assets/Quori_Live.glb`
3. `apps/vizij-authoring/public/assets/Hugo_Current.glb`
4. `apps/vizij-authoring/public/assets/Quori_Current.glb`
5. `apps/vizij-authoring/public/assets/Toasty_Current.glb`

## Presenter Notes

1. Keep one terminal per app so restarts are fast.
2. Open the participant guide on a second monitor.
3. If the room is slow to install, bias toward facilitator-led demos plus partner discussions instead of dead time.
4. Treat `tutorial-agent-face` as facilitator-led and keep participants focused on observation plus worksheet notes.
5. Treat `vizij-standalone` as control-path understanding first, not full build-and-ship work.
