# Animating Faces Tutorial

This guide explains how to run the `demo-animating-faces` app, load assets produced by the Vizij pipeline, and understand the code that wires everything together. The demo lives at `vizij-web/apps/demo-animating-faces` and is the primary playground for blending high-level face rigs, driving them with UI sliders and animation clips, and inspecting the merged orchestrator outputs.

## Prerequisites

- Node 18+ with `pnpm` installed (the repo uses workspaces).
- Pipeline exports:
  - Face GLB from `demo-vizij-render`.
  - Low-level rig graph (`GraphSpec` JSON) targeting that GLB.
  - One or more high-level rig graphs from `demo-vizij-rigging`.
  - Optional animation clip JSON files (same schema the app exports).

Install workspace dependencies from the repo root:

```bash
pnpm install
```

## Running the App

Start the dev server from the workspace root:

```bash
pnpm --filter demo-animating-faces dev
```

This serves the app with hot reload. To ship a production build use `pnpm --filter demo-animating-faces build`.

## Loading Assets

The **Assets** panel handles all file imports:

1. **Load GLB** – choose the face mesh exported by `demo-vizij-render`. You will be prompted for a friendly label. The GLB is streamed into `@vizij/render` via `useGlbLoader` which derives the Vizij root and injects it into the shared render store.
2. **Load Graph** – import the low-level rig JSON that maps rig channels to renderer animatables. This must match the GLB you loaded.
3. **Add Rig** – add any number of high-level rigs. Each file is normalised into a `GraphAsset`, assigned a generated ID, and selected by default. Toggle rigs on/off using the checklist next to the file names.
4. **Add Animation** – import animation clip JSON. Clips can also be created from scratch inside the app.

All asset metadata (labels, selections, slider states, animation weights) is persisted to `localStorage`. A bundle hash derived from the GLB and low-level rig keeps different faces isolated.

When both the GLB and the low-level rig are present, click **Start Orchestrator** in the Bootstrap panel. The app keeps the orchestrator idle until you explicitly launch it, so you can stage all of the inputs before any graphs begin running.

## Understanding the Orchestrator Merge

- `useOrchestratorBootstrap` exposes a `start()` function used by the **Start Orchestrator** button and mirrors the runtime status for the header chip.
- `useOrchestratorMerging` rebuilds the merged controller every time the active rig list, animations, or persisted slider state changes.
  - Low-level rig, selected high-level rigs, UI bridges, animation bridges, and an optional debug graph are registered and merged using equal-weight blending.
  - UI bridge graphs stage slider values on the `ui/<rigId>/<channel>` namespace and forward them into the rig outputs.
  - Animation bridges map sampled clip values from `animation/<clipId>/<channel>` into the same rig channels so manual sliders and animations stack correctly.
  - Diagnostics such as namespace violations, output collisions, and missing staged UI inputs are surfaced to the UI.

The merged graph ID and individual registration configs can be exported from the Diagnostics panel for inspection or debugging.

## Working With Rigs

Active rigs appear in the **Rig Controls** panel:

- Inputs are grouped by top-level path segments (e.g. `poses`, `controls`).
- Each slider stages a float into the orchestrator and mirrors the value in a numeric input for precise edits.
- **Neutral Pose** resets all inputs for a rig to the defaults declared on its graph `Input` nodes.
- **Capture Preset** stores the current slider snapshot; presets can be recalled or deleted and persist with the bundle.

Because UI inputs use the `ui/<rigId>/<channel>` namespace, they will not collide with the rig outputs provided by upstream demos.

## Authoring Animations

The **Animations** panel repurposes the animation editor from `demo-render-no-rig`, but the channel picker is populated from rig input paths so clips always target valid orchestrator channels.

- Create or import clips, rename them, and adjust their duration and weight.
- Add tracks, select target channels, and edit keyframes in the table UI.
- Playback runs on `requestAnimationFrame`; the sampled values are staged each frame with the clip’s current weight applied.
- The live channel monitor displays the most recent staged values for quick validation.

Clips export to simple JSON and can be re-imported later or into other demos that honour the same channel naming convention.

## Diagnostics & Debugging

The **Diagnostics** panel surfaces:

- Registered controllers (graphs vs. animation controllers) to validate orchestrator wiring.
- Subscriptions for UI and animation inputs so you can confirm every channel you expect is staged.
- Current frame timings and the latest merged writes coming out of the orchestrator.
- Any namespace violations (outputs not under `rig/…`), collisions between rigs, or UI inputs that were not staged.
- Quick export of the merged graph spec for offline analysis.

## Persistence & Reset

State is automatically persisted under `demo-animating-faces/v2`. If you need a clean slate:

- Use the **Clear All** button in the Assets panel, which also deletes the bundle from storage.
- Or run `localStorage.clear()` (or remove the specific keys) from the browser console while the app is open.

## Maintaining the Code

Key entry points:

- `src/App.tsx` – lays out the panels and orchestrator bootstrap flow.
- `src/state/AppStateContext.tsx` – centralised state machine for assets, sliders, presets, and animations.
- `src/orchestrator/useOrchestratorMerging.ts` – extracts rig inputs, builds bridge graphs, and registers the merged controller.
- `src/components/*` – UI panels; each isolates its orchestration logic.
- `src/hooks/useGlbLoader.ts` – streams GLB blobs into the Vizij renderer.

Run the standard checks before committing:

```bash
pnpm --filter demo-animating-faces lint
pnpm --filter demo-animating-faces typecheck
pnpm --filter demo-animating-faces build
pnpm --filter demo-animating-faces test
```

That’s it—load your pipeline assets, blend a few rigs, author clips, and inspect the merged outputs all in one place.
