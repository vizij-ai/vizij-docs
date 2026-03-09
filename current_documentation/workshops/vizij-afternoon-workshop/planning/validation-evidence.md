# Validation Evidence

Last updated: 2026-03-09

## Validation Scope

This pass focused on workshop readiness:

1. verifying the core web apps launch locally
2. capturing workshop visuals from live app surfaces
3. exporting the presentation deck and participant workbook
4. checking the workshop packet for stale references and missing artifacts

## Local App Pass

The following local surfaces were launched from `vizij-web`:

1. `tutorial-agent-face`
2. `tutorial-fullscreen-face`
3. `demo-vizij-player`
4. `vizij-authoring`

Evidence captured:

1. `assets/screenshots/tutorial-agent-face.png`
2. `assets/screenshots/tutorial-fullscreen-face.png`
3. `assets/screenshots/demo-vizij-player.png`
4. `assets/screenshots/vizij-authoring.png`

## Export Pass

Generated artifacts:

1. `slides/vizij-afternoon-workshop-deck.html`
2. `slides/vizij-afternoon-workshop-deck.pdf`
3. `slides/previews/deck-cover.png`
4. `participant/vizij-afternoon-workbook.html`
5. `participant/vizij-afternoon-workbook.pdf`

## Content Consistency Checks

Checked for:

1. stale `vizij-ws-app` references in facilitator-facing materials
2. unfinished placeholders such as `TODO`, `TBD`, and `FIXME`
3. missing presentation and participant handout artifacts

## Caveats

1. `tutorial-agent-face` was validated as a live page surface, but the end-to-end connected conversation flow still depends on a locally configured `VITE_GEMINI_API_KEY`.
2. `vizij-standalone` is documented as the deployment anchor, but the Tauri runtime was not exercised end-to-end in this pass. The packet treats it as a guided deployment walkthrough unless a facilitator has already validated the local build path.
3. Some Vite dev servers reported non-fatal dependency-resolution warnings while still serving the apps. The packet is written to keep the workshop moving even if one surface needs facilitator-led fallback.
