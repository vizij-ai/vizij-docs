# Demo Animating Faces Plan

## Overview

_Summary: Build a dedicated app that loads pipeline-generated face assets and rigs, merges them through the orchestrator, and lets authors blend manual sliders with timeline-driven animations on expressive faces._

- Successor to the experimental `demo-render-no-rig` flow, but targeting the standardized rig assets exported from `demo-vizij-render` (low level) and `demo-vizij-rigging` (high level).
- Primary surface for showcasing how multiple high-level rigs can coexist, be merged automatically via equal-weight blending, and drive the same low-level rig that ultimately manipulates the `.glb`.
- Designed to stand alone: the document assumes no familiarity with other demos and describes every dependency, workflow, and implementation step needed to ship the app.

## Goals & Non-Goals

_Summary: Clarify the boundaries of the effort._

- **Goals**
  - Load face components (GLB, low-level rig graph, any number of high-level rig graphs, and animation clips) via dedicated UI buttons without relying on filenames or manifests.
  - Generate UI sliders for every high-level rig input and stage their values to the orchestrator through a consistent namespace (`ui/<rigId>/<channel>`).
  - Combine the low-level rig, selected high-level rigs, and auto-generated UI/animation bridge graphs into a single merged orchestrator controller using `BlendEqualWeights`.
  - Provide lightweight animation authoring so clips can target any exposed rig channel and play back through the merged orchestrator.
  - Persist the last loaded assets, rig selections, and control states to localStorage so sessions survive reloads.
  - Offer diagnostics (graph registry, merge status, staged inputs, merged writes) so rig authors can validate output quickly.
- **Non-Goals**
  - Inline graph editing or topology changes (graphs are authored in the rigging tool).
  - Reliance on `rig.config.json` metadata or per-file summaries; all information must be derivable from the graphs themselves or the renderer.
  - Automatic bundle parsing based on directory structure or filenames.
  - High-end timeline tooling (curve editors, dopesheet); focus on simple keyframe playback.
  - Maintaining the legacy `demo-render-no-rig` app (it is slated for removal after this launches).

## Core User Journeys

_Summary: Anchor the design in the workflows we must support._

- **Load & preview assets** – User clicks “Load GLB” to pick a face, “Load Low-Level Rig Graph” for the rig mapping, and “Add High-Level Rig Graph” buttons for each rig they want. The app restores the last session automatically when re-opened.
- **Select rigs & blend interactively** – Before registering anything with the orchestrator, the user decides which high-level rigs are active. Toggling selections rebuilds the orchestrator so sliders only reflect loaded rigs, and the merged face updates live.
- **Author & play animations** – User imports or creates animation clips targeting rig channels, plays them back while adjusting slider weights, and exports clips for later use.

## Feature Breakdown

_Summary: Track progress across the main capability areas._

### Asset Loading Workflow

- **Status:** Completed — 2025-10-20T17:00:54Z
- Independent load buttons for GLB, low-level rig graph, high-level rig graphs, and animation clips.
- Prompt for editable labels on import, persist bundle metadata keyed by a bundle hash, and restore serialized payloads from localStorage on startup.

### Multi-Rig UI Controls

- **Status:** Completed — 2025-10-20T17:00:54Z
- Parse high-level graph inputs to create grouped slider panels, allow preset capture/apply and neutral pose resets, and stage UI values into the orchestrator under the `ui/` namespace.

### Animation Authoring & Playback

- **Status:** Completed — 2025-10-20T17:00:54Z
- Adapt the existing animation editor to target rig channels, evaluate clips per frame, and push values via animation bridge graphs for blending.
- Provide timeline editing (tracks, keyframes, channel select), per-clip weight controls, clip import/export, playback transport, and live channel monitors.

### Orchestrator Diagnostics & Reload

- **Status:** Completed — 2025-10-20T17:00:54Z
- Tear down and rebuild the orchestrator whenever the selected rig set changes, and expose controller/merge diagnostics for debugging.
- Surface subscription lists, namespace/collision warnings, merged writes, timings, and allow merged spec export via the diagnostics panel.

### Persistence & Session Restore

- **Status:** Completed — 2025-10-20T17:00:54Z
- Persist loaded assets, active rig selections, slider states, and animation playback context to localStorage keyed by a bundle hash derived from the GLB and low-level rig.

## Assets & Data Sources

_Summary: Describe the artifacts and how we consume them._

- **Inputs expected from the pipeline**
  - `face.glb` – exported from `demo-vizij-render`, ready for Vizij renderer.
  - `low_level_rig.json` – serialized `GraphSpec` for the low-level rig; no reliance on `GraphBindingSummary` or other supplemental data.
  - `*.rig.json` – high-level rig graphs generated by `demo-vizij-rigging`. They drive the standard rig namespace (`rig/<faceId>/...`) and contain all necessary defaults within their nodes.
  - `*.animation.json` – optional animation clips targeting standard rig paths directly.
- **Loading mechanics**
  - Provide separate file inputs or drag-and-drop zones for each type. The UI prompts for a label when multiple high-level rigs or animations are loaded.
  - Store the raw JSON for graphs/animations and the parsed GLB scene in memory; persist the serialized forms plus metadata (e.g., label, face ID) to localStorage for restore.
- **Graph validation**
  - Normalize graphs with `orchestrator.normalizeGraphSpec` to ensure ABI compatibility.
  - Verify that high-level rig outputs write inside `rig/<faceId>/...` and inputs pull from that namespace or their own prefixed variants (e.g., `graph/<rigId>/...`).
  - Reject graphs that include renderer outputs directly; only the low-level graph should write to renderer animatable paths.

## Runtime Architecture

_Summary: Identify subsystems and their responsibilities._

- **Renderer subsystem** – Reuse Vizij render hooks (`Vizij`, `useVizijStore`) to display the GLB and apply merged writes. Maintain a namespace abstraction so multiple faces can be debugged if needed.
- **Orchestrator subsystem**
  - Encapsulated by an `OrchestratorBridgeProvider` responsible for WASM init, controller registration, stepping, and value staging.
  - Because rig selections happen prior to registration, the provider must support complete teardown/rebuild on demand, including reloading the WASM orchestrator if necessary.
- **Data store**
  - React context or Zustand store capturing loaded assets, active rig subset, slider state, animation state, orchestrator metadata, and diagnostics.
  - Services for persistence (localStorage), orchestrator bridging, and renderer updates interact through this store.
- **UI shell**
  - Left sidebar: asset loaders, rig selection list with pre-registration toggles, animation clip library.
  - Center: face viewer with camera controls, safe-area toggle, and playback overlay.
  - Right pane (tabbed): controls (sliders + presets), animations (timeline + transport), orchestrator diagnostics (graph registry, merged writes).
- **Frame loop**
  - `requestAnimationFrame` drives orchestrator stepping, slider staging, animation evaluation, and renderer updates.

## Graph Strategy & Orchestrator Integration

_Summary: Define controller types, merge behavior, and lifecycle._

- **Controller categories**
  1. **Low-level rig graph (`graph:low-level`)** – Loaded from file, converts standard rig channels into renderer animatable outputs.
  2. **High-level rig graphs (`graph:high:<label>`)** – Loaded per user selection; consume their own `Input` nodes and produce standard rig outputs.
  3. **UI bridge graphs (`graph:ui:<label>`)** – Auto-generated per active rig. Each `Input` node reads `ui/<rigId>/<channel>` and feeds an `Output` node writing the channel expected by the high-level graph.
  4. **Animation bridge graphs (`graph:anim:<clipId>`)** – Auto-generated per animation clip. Map `animation/<clipId>/<channel>` inputs to the shared channel without any prefix.
  5. **Optional diagnostics graph (`graph:debug`)** – Emits merged rig values to a `debug/` namespace for inspection.
- **Merge configuration**
  - Use `registerMergedGraph` with merge order `[low-level, ...high-level, ...ui bridges, ...animation bridges, debug]`.
  - Conflict strategy: `outputs = "blend"`, `intermediate = "blend"` (`OutputConflictStrategy::BlendEqualWeights`), ensuring equal contribution when multiple sources write the same path.
  - Avoid namespace conflicts by limiting UI/animation bridges to their dedicated prefixes on inputs while writing to the canonical channel on outputs.
- **Subscriptions & staging**
  - Union all required `Input` paths across generated graphs. Stage values each frame using `orchestrator.setInput` for `ui/` and `animation/` namespaces.
  - After merge, verify there are no remaining unsatisfied inputs; surface warnings in diagnostics if any remain.
- **Lifecycle**
  - On any change to the active rig list or animation set, dispose of the current orchestrator bridge, regenerate bridge graphs, and rebuild the merged controller from scratch.
  - Keep track of controller IDs and merged graph ID for clean removal during teardown.

## Rig Input Discovery & UI Generation

_Summary: Explain how sliders and presets are derived directly from graphs._

- Traverse each high-level rig graph for `Input` nodes containing a `path` parameter.
- Derive labels from path segments (e.g., `poses/happy.weight → Happy Weight`) and evaluate default values from the node’s `value` parameter or connected constants.
- Group inputs by top-level path segments (`poses`, `controls`, etc.) to organize sliders.
- Build a `RigDefinition` object: `{ rigId, label, graphSpec, inputs: [{ path, label, valueKind, defaultValue }], presets }`.
- Generate presets by scanning the graph for constant pose records or by storing snapshots when the user clicks “Capture Current”.
- Slider changes update the per-rig state store and immediately call `setInput('ui/<rigId>/<channel>', value)` (debounced for performance).

## Animation Authoring & Playback

_Summary: Detail how clips interact with orchestrator channels._

- Reuse the `AnimationEditor` and `OrchestratorAnimatableOption` pattern from `demo-render-no-rig`, but construct options from rig inputs rather than animatable IDs.
- Each option maps to `animation/<clipId>/<channel>` with a known value kind (inferred from the rig input node).
- Playback loop:
  1. Evaluate active clips (interpolate keyframes).
  2. Write the result to `animation/<clipId>/<channel>` via `setInput`.
  3. Allow clip weights for manual blending (multiply values before staging).
- Provide clip import/export (JSON), playback controls (play/pause, loop, scrub), and live channel monitors indicating current values.

## UI Layout & Interaction Design

_Summary: Capture structural and usability decisions._

- **Header** – App title, quick actions (reload orchestrator, reset sliders, export merged spec), current face summary.
- **Left sidebar** – Stacked sections: asset loaders (buttons + file info), active rig checklist (pre-registration toggles), animation clip library with load/create buttons.
- **Main viewport** – Face viewer on top, playback HUD (current clip/time), optional debug overlays (safe area, merged value readouts).
- **Right tabs**
  - `Controls` – Collapsible rig panels with sliders, numeric inputs, preset buttons, and staging indicators.
  - `Animations` – Timeline editor, transport, per-channel inspector, and clip metadata.
  - `Diagnostics` – Controller list, merged graph summary, latest merged writes, active subscriptions, and errors/warnings.
- **Accessibility** – Keyboard navigation for sliders, high contrast labels, and optional numeric entry fields for precise values.

## State Management & Persistence

_Summary: Outline the application state model._

- `AssetState`: loaded GLB, low-level graph, high-level graph list, animation list, each with serialized payloads and labels.
- `RigSelectionState`: which high-level rigs are marked active before registration, plus derived defaults and last slider values.
- `AnimationState`: clip definitions, playback position, selection, and evaluation cache.
- `OrchestratorState`: controller IDs, merged graph ID, subscriptions, diagnostics (merged writes, frame timings).
- `RendererState`: namespace, camera pose, viewer toggles.
- Persist `AssetState`, `RigSelectionState`, and `AnimationState` to localStorage under a hash computed from the core files (GLB + low-level graph) to avoid collisions across faces.

## Implementation Plan

_Summary: Milestones with explicit status tracking._

1. **Scaffold & Infrastructure**
   - **Status:** Completed — 2025-10-19T20:57:51-07:00
   - Create `apps/demo-animating-faces` (Vite), configure tooling, and add navigation entry.
   - Implement orchestrator bootstrapping hook (WASM init, frame loop) and placeholder face viewer.
2. **Asset Loading Pipeline**
   - **Status:** Completed — 2025-10-20T17:00:54Z
   - Build loaders for GLB, low-level graph, high-level graph, and animation clip files with labeling prompts.
   - Display load status/errors and persist serialized payloads + metadata to localStorage for session restore.
3. **Graph Selection & Merging**
   - **Status:** Completed — 2025-10-20T17:00:54Z
   - Parse high-level graphs into `RigDefinition` objects, auto-generate UI bridge graphs, and rebuild the orchestrator whenever the active rig list changes.
   - Register the merged graph (`BlendEqualWeights`) consisting of low-level, selected high-level, UI bridges, animation bridges, and optional diagnostics graph.
4. **Rig Control Panels**
   - **Status:** Completed — 2025-10-20T17:00:54Z
   - Render slider panels from `RigDefinition` inputs, handle grouping, provide preset capture/apply, and stage values to the orchestrator.
   - Implement per-rig reset, neutral pose, and slider persistence.
5. **Animation System**
   - **Status:** Completed — 2025-10-20T17:00:54Z
   - Adapt animation editor to use rig channels, evaluate clips, stage animation inputs, and manage clip library (import/export).
   - Auto-generate animation bridge graphs and rebuild orchestrator when the clip set changes.
6. **Diagnostics & Polish**
   - **Status:** Completed — 2025-10-20T17:00:54Z
   - Build diagnostics tab (controller list, merged spec export, merged writes log, subscription viewer).
   - Add performance instrumentation and finalize documentation/README.

## Testing & Validation

_Summary: Ensure robustness and correctness._

- **Unit tests**
  - UI bridge generation: verify inputs/outputs match rig channels and subscriptions are correct.
  - High-level input parser: confirm slider definitions are derived correctly from sample rigs.
  - Persistence helpers: ensure localStorage round-trips restore the previous session accurately.
  - Added automated coverage for UI bridge wiring and bundle hashing; expand with persistence round-trip cases.
- **Integration tests**
  - Orchestrator rebuild: simulate toggling rigs and verify merged outputs remain consistent.
  - Animation playback: run deterministic frame simulation to confirm staged values align with keyframes.
- **Manual QA**
  - Load various combinations of rigs/animations, verify toggling prompts orchestrator rebuilds, observe merged face behavior.
  - Stress test with simultaneous slider adjustments and animation playback to catch performance regressions.
  - Validate export/import loops for animations and merged graph specs.
- **Tooling**
  - Add `pnpm test --filter demo-animating-faces` coverage to CI.
  - Provide optional debug hotkeys (e.g., `D` for diagnostics overlay) to aid development.

## Risks & Open Questions

_Summary: Track uncertainties and mitigation ideas._

- **Rig label derivation** – Without metadata, path-derived labels may be unfriendly; provide editable display names stored per session.
- **Channel naming collisions** – Validate during load to prevent two rigs from exposing identical channels unless intentional.
- **Performance on large graphs** – Monitor node counts and frame times, add lazy graph loading if the merged graph becomes too heavy.
- **WASM reload latency** – Cache the orchestrator module instance to minimize rebuild cost when rigs are toggled frequently.
- **Animation blending nuance** – Equal-weight blending may not fit all scenarios; consider future extensions for adjustable weights.
- **Undo/redo for sliders** – Not included in v1; reassess based on user feedback.

## Reuse & Reference Implementation Notes

_Summary: Identify prior work we can leverage._

- Reuse components from `demo-render-no-rig` (animation editor, slider widgets, orchestrator bridge helpers) with refactors to point at rig-based channels.
- Follow orchestration guidance in `vizij-orchestrator-core/merge_tutorial.md`, especially around equal-weight merging and subscription handling.
- Borrow GLB loading patterns and animatable inspection utilities from `demo-vizij-render`.
- Align styling and layout with other Vizij demo apps for visual consistency.
