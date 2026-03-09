# Source Audit

Last updated: 2026-03-09

## Primary Repositories Reviewed

1. `vizij-web`
2. `vizij-docs`
3. Existing workshop drafts under `/home/chris/Code/Semio/vizij_ws/docs/tutorials/robot-face-tutorial`

## Best Current App Anchors

### `vizij-authoring`

Best fit for:

1. Face design and control
2. Import and export walkthroughs
3. Renderer data inspection
4. Rigging and pose-group authoring

Why:

1. It is the current end-to-end authoring surface.
2. It already has sample GLBs and mature docs.

### `tutorial-fullscreen-face`

Best fit for:

1. Hello Face
2. Runtime provider overview
3. Mouse gaze and pose hotkeys
4. Basic renderer path reasoning

Why:

1. It is a focused runtime-react tutorial app.
2. It has clear, minimal code surfaces for live walkthroughs.

### `tutorial-agent-face`

Best fit for:

1. Real-time conversation engine segment
2. Viseme blending, lead, and expression controls

Why:

1. It already demonstrates a live Gemini integration.
2. It exposes tunable mouth and expression controls in the UI.

Known caveat:

1. Requires `VITE_GEMINI_API_KEY` to connect.

### `demo-vizij-player`

Best fit for:

1. Animation concepts
2. Orchestrator merge explanation
3. Diagnostic panel references

Why:

1. It has the clearest current panel-driven animation and rig-control surface.

### `vizij-standalone`

Best fit for:

1. Deployment and robot-facing control
2. WebSocket-driven external control demo

Why:

1. It is the current repo surface for standalone runtime plus WebSocket control.
2. It supersedes older workshop references to `vizij-ws-app`.

## Existing Draft Material Worth Reusing

Outside the committed docs repos, the `robot-face-tutorial` draft already contains:

1. A multi-section workshop outline
2. A slide-outline draft
3. Four existing handout PDFs

The draft will be treated as source material only. The final, maintained workshop kit lives in this folder.

## Gaps To Close

1. Consolidated facilitator packet does not exist yet.
2. Current committed screenshot set does not exist yet.
3. Participant quickstart and exercise packets need to be updated to the exact schedule.
4. Deployment materials need to be rewritten around `vizij-standalone`.
5. Conversation-engine guidance needs a clear fallback path for credential or network issues.
