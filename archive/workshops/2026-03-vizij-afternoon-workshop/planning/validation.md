<!-- tags: family=workshop; type=validation; workshop_kind=production; workshop_status=delivered; topics=workshop,workshops,vizij-afternoon-workshop,planning,validation -->

# Validation Record

Last updated: 2026-03-09

## Summary

The workshop kit was validated against the current `vizij-web` apps and updated after discovering a real runtime blocker in the live workshop surfaces.

## Resolved Blocker

Observed issue:

1. `tutorial-fullscreen-face`
2. `tutorial-agent-face`
3. `demo-vizij-player`
4. `vizij-authoring`

All four apps initially blanked in-browser with:

1. `pageerror _jsxDEV is not a function`

Root cause:

1. The shell environment had `NODE_ENV=production`, which caused Vite dependency prebundling to resolve `react/jsx-dev-runtime` in production mode during dev.

Fix applied in `vizij-web`:

1. Added explicit `process.env.NODE_ENV` development defines for workshop-app Vite configs.
2. Added matching `optimizeDeps.esbuildOptions.define` values so prebundled React dev runtime stays usable even in a polluted shell environment.

Relevant commit in `vizij-web`:

1. `1c543884` — `fix: force dev react runtime for workshop apps`

## Browser Smoke Results

After the fix, the following apps rendered in a headless Playwright pass without the `_jsxDEV` error:

1. `tutorial-fullscreen-face`
2. `tutorial-agent-face`
3. `demo-vizij-player`
4. `vizij-authoring`

Notable console caveats:

1. Repeated WebGL `ReadPixels` performance warnings appeared in the headless browser for the runtime-heavy apps.
2. `tutorial-agent-face` remains disconnected by default until a local `VITE_GEMINI_API_KEY` is configured.
3. `demo-vizij-player` and `vizij-authoring` showed dependency-resolution warnings during Vite optimize-deps startup, but the browser smoke pass and builds completed successfully.

## Build Results

Completed successfully:

1. `pnpm --filter fullscreen-face build`
2. `pnpm --filter tutorial-agent-face build`
3. `pnpm --filter demo-vizij-player build`
4. `pnpm --filter vizij-authoring build`

Notes:

1. Large chunk-size warnings were emitted for the production bundles.
2. No build failures were observed during the targeted workshop-app validation pass.

## Visual Evidence

Captured screenshots:

1. `assets/screenshots/tutorial-fullscreen-face.png`
2. `assets/screenshots/tutorial-agent-face.png`
3. `assets/screenshots/demo-vizij-player.png`
4. `assets/screenshots/vizij-authoring.png`

Deck artifacts:

1. `slides/vizij-afternoon-workshop-deck.html`
2. `slides/vizij-afternoon-workshop-deck.pdf`
3. `slides/speaker-notes.md`
