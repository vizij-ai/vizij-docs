# Troubleshooting Playbook

Last updated: 2026-03-09

## Symptom: The face does not render

Check:

1. The app actually loaded the intended GLB.
2. The terminal has no missing WASM or asset errors.
3. The app is running from the correct repo root.

Fast recovery:

1. Restart the app.
2. Switch to the presenter machine for the live demo.
3. Continue the conceptual walkthrough using the handout and screenshots.

## Symptom: Mouse or hotkeys do nothing in `tutorial-fullscreen-face`

Check:

1. The face loaded with pose data.
2. The pointer is over the app.
3. The pose config exists in the bundle.

Fast recovery:

1. Reopen the page.
2. Inspect `usePoseHotkeys.ts` and explain the mapping if the live demo is flaky.

## Symptom: `tutorial-agent-face` will not connect

Check:

1. `VITE_GEMINI_API_KEY` is set.
2. Browser microphone permissions are granted.
3. Network access is available.

Fast recovery:

1. Switch to facilitator-led demo only.
2. Explain the UI states and mouth modes without requiring participant connection.
3. Reinforce the animation concepts with `demo-vizij-player`.

## Symptom: `vizij-authoring` feels too heavy or slow

Check:

1. Whether the machine is overloaded.
2. Whether the participant only needs observation rather than full editing.

Fast recovery:

1. Use the presenter machine for the live walkthrough.
2. Ask participants to focus on identifying paths and concepts instead of deep editing.

## Symptom: Deployment section feels too heavy for the room

Check:

1. Whether building or Tauri tooling is realistic in the time available.

Fast recovery:

1. Treat deployment as a guided architecture walkthrough.
2. Use the README, the checklist, and the sample message format.
3. Keep the participant task to explaining the control path, not shipping the binary.
