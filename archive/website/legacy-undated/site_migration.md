# Website Node-Graph Migration Plan

## Objectives
- Modify the website to be powered by the node-graph runtime for expression and viseme blending rather than ad-hoc math.
- Consolidate the pose/rig data model so both apps share `Pose`, `Track`, and `VizijLowRig` utilities, ensuring rigs receive the same channel coverage (mouth, eyelids, brows, highlights).
- Deliver a maintainable node-graph specification (JSON) that includes rig definitions and can be loaded/manipulated at runtime, with React bindings that feed graph outputs into the shared rig layer.

## Progress Log


## Current State 

- Uses a pose-centric pipeline: `useBlendTree` orchestrates expression blending, spring filtering, and viseme overlay before writing to rigs (`vizij-web/apps/website/src/components/VizijExpressionsDemo.tsx`).
- `BlendNode` provides weighted-average, overlay, additive, multiply, and max blending across arbitrary channels using Math.js (`vizij-web/apps/website/src/components/viseme-demo/BlendNode.tsx`).
- `VizijLowRig` maps pose channels to animatable ids so rigs receive the full control vector, populated via `useRiggedModelLoader` from `@vizij/rig`.
- Expression and viseme presets are stored as `Pose` objects with full channel coverage (`vizij-web/packages/@vizij/config/src/expression.ts`, `vizij-web/packages/@vizij/config/src/viseme.ts`).
- Motion smoothing happens through the `useSpringFilter` hook before the final blend (`vizij-web/apps/website/src/components/viseme-demo/SpringFilter.tsx`).
- Expression and viseme demos still compute mouth targets numerically, but they now drive `VizijLowRig` instances via `Pose` updates rather than direct `setVal` calls (`vizij-web/apps/website/src/components/VizijExpressionsDemo.tsx`).
- Shared `@vizij/config`/`@vizij/rig` packages supply rig metadata and loaders, eliminating the bespoke website loader layer.
- Expression/viseme definitions remain mouth-centric; expanding channel coverage will come from the node-graph migration.
- No node-graph runtime or provider is wired into the website bundle today.

## Gap Summary
- **Data model**: website lacks the shared `Pose`/`Track`/`VizijLowRig` utilities, so channels outside the mouth are ignored.
- **Blending**: website averages scalars while website blends full poses with configurable operations and validation.
- **Smoothing**: website jumps directly to target values; website runs a spring filter before viseme overlay.
- **Runtime**: node-graph runtime (`@vizij/node-graph-react`) is absent from the website, so there is no path to drive blending graphs or reuse the editor-generated specs.
- **Playback**: website relies on `@vizij/animation-react` players, whereas website already consumes the WASM player that better aligns with the node-graph toolchain.
- **Config parity**: assets, bounds, and initial values are duplicated but not in sync; maintaining two sets invites drift.

## Migration Strategy (Node-Graph Focused)

### Phase 1 – Integrate the node-graph runtime
**Status:** In progress (2025-09-17T15:47:51Z)

- [ ] Add `@vizij/node-graph-react` to the website bundle and wrap the relevant page subtree in `NodeGraphProvider` with throttled updates (mirror `apps/demo-node-graph/vite.config.ts:28` bundler adjustments if required).
- [ ] Establish a directory for graph specs (`apps/website/src/nodegraphs/`) and a loader utility that hydrates the JSON and calls `reload` on the provider so the specs become the source of truth for blend logic and rig definitions.
- [ ] Build a `useNodeGraphPose` helper that reads vector outputs from the graph (`useNodeOutput` + `valueAsNumber`) and materializes a `Pose` with the shared channel set, keeping rigs pose-driven.

**Notes:** Settled on `apps/website/src/nodegraphs/` as the canonical JSON location after evaluating alternative package roots; this unblocks spec loading work.

### Phase 2 – Encode expression blending in the graph
**Status:** In progress (2025-09-17T15:48:22Z)

- [ ] Express each base expression pose as a `VectorConstant` node containing the flattened mouth/eye/brow tracks in the agreed channel order.
- [ ] Map expression weight sliders into node parameters via `setParam` on `Slider`/`Constant` nodes, accumulate weights with `Add`, and clamp totals to avoid divide-by-zero.
- [ ] Use `VectorScale`, `VectorAdd`, `VectorSubtract`, and `VectorIndex` nodes to replicate the `weighted_average_overlay` logic (apply diffs, normalize, reapply neutral).
- [ ] Expose the blended pose as a vector output node; continue routing it through `useSpringFilter` for smoothing until a graph-native spring node ships.

**Notes:** Confirmed that the node registry (`vizij-rs` vector utilities) already exposes the operations needed to rebuild `weighted_average_overlay`, so no custom nodes are required for this phase.

### Phase 3 – Add viseme overlay graph stages
**Status:** In progress (2025-09-17T15:48:41Z)

- [ ] Pipe the spring-filtered expression pose into the graph as an input vector (React updates a `VectorConstant` node parameter each frame with the current filtered pose values).
- [ ] Feed the active viseme pose coming from the shared `@vizij/animation-react` player into another vector input node; expose viseme weights (from TTS playback) as scalar params to modulate blending strength.
- [ ] Recreate the final `weighted_average` viseme overlay from `useBlendTree` inside the graph so the graph output emits the fully blended pose vector.

**Notes:** Validated that we can re-use the same spec directory to store a dedicated viseme overlay graph (`expression-viseme.json`) that takes both filtered expression and viseme vectors, simplifying deployment.

### Phase 4 – Rig definition & output nodes
**Status:** In progress (2025-09-17T15:49:00Z)

- [ ] Expand the graph spec JSON to include rig metadata (animatable ids, channel-to-track mappings) so the node graph fully describes the rig interface alongside blend logic.
- [ ] For each track that should reach the rig (mouth scales, morph, eyelids, brows), add `VectorIndex` + `Output` nodes that reference those rig mappings; the React adapter reads graph outputs and invokes `VizijLowRig.apply` using the metadata supplied in the JSON.
- [ ] Remove the remaining direct `setVal` calls from components once the rig is driven exclusively through `VizijLowRig.apply` fed by node-graph results.

**Notes:** Drafted a JSON schema stub for rig metadata that co-locates bounds, animatable ids, and graph output mapping, avoiding additional TS config files.

### Phase 5 – Validation & handoff
- Add regression tests around the graph spec (e.g., snapshotting JSON, unit tests for the React pose adapter).
- Document how to iterate on the graph (source of truth JSON, how to round-trip with the editor in `apps/demo-node-graph`) and update README/in-code comments accordingly.

## Tracking Checklist
- [ ] Introduce `NodeGraphProvider` and confirm bundler configuration loads `@vizij/node-graph-wasm`.
- [ ] Author the expression/viseme graph spec (including rig metadata) and load it in the website.
- [ ] Build a React adapter that turns graph vector outputs into `Pose` instances, applies `useSpringFilter`, and writes them via `VizijLowRig`.
- [ ] Replace scalar expression averaging in `VizijExpressionsDemo` with node-graph driven values.
- [ ] Replace direct viseme player outputs in `VizijVisemeDemo` with node-graph outputs.
- [ ] Run parity checks against vizij-site datasets and capture any residual differences for follow-up work.

## Decisions & Remaining Risks
- Spring/damper smoothing stays in React via `useSpringFilter` for now; we will plan a dedicated graph node once we can reuse it across surfaces.
- Graph specs, including rig definitions, will live as versioned JSON assets (round-tripped through the node-graph editor when convenient) and loaded via `NodeGraphProvider.reload`.
- Direct rig writes remain mediated by React adapters using `VizijLowRig.apply`; as the graph metadata now captures rig mappings, we can revisit native sink support later if needed.
- Risk: synchronizing animation-react migration on vizij-site may uncover compatibility gaps with existing WASM-only features—schedule validation runs during Phase 0 to catch regressions early.
