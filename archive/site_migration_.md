# Website Node-Graph Migration Plan

## Objectives
- Reach behavioral parity between the public website demos and `vizij-site`, with the website powered by the node-graph runtime for expression and viseme blending rather than ad-hoc math.
- Consolidate the pose/rig data model so both apps share `Pose`, `Track`, and `VizijLowRig` utilities, ensuring rigs receive the same channel coverage (mouth, eyelids, brows, highlights).
- Standardize on `@vizij/animation-react` as the animation runtime during the transition, replacing vizij-site's bespoke WASM player while preserving feature parity.
- Deliver a maintainable node-graph specification (JSON) that includes rig definitions and can be loaded/manipulated at runtime, with React bindings that feed graph outputs into the shared rig layer.

## Current State Comparison

### vizij-site
- Uses a pose-centric pipeline: `useBlendTree` orchestrates expression blending, spring filtering, and viseme overlay before writing to rigs (`vizij-web/apps/vizij-site/src/components/VizijExpressionsDemo.tsx:175`).
- `BlendNode` provides weighted-average, overlay, additive, multiply, and max blending across arbitrary channels using Math.js (`vizij-web/apps/vizij-site/src/components/viseme-demo/BlendNode.tsx:36`).
- `VizijLowRig` maps pose channels to animatable ids so rigs receive the full control vector (`vizij-web/apps/vizij-site/src/config/low_rig.ts`), populated via `useRiggedModelLoader` (`vizij-web/apps/vizij-site/src/hooks/useModelLoader.ts:79`).
- Expression and viseme presets are stored as `Pose` objects with full channel coverage (`vizij-web/apps/vizij-site/src/config/expression.ts`, `vizij-web/apps/vizij-site/src/config/viseme.ts`).
- Motion smoothing happens through the `useSpringFilter` hook before the final blend (`vizij-web/apps/vizij-site/src/components/viseme-demo/SpringFilter.tsx`).
- Viseme playback is driven by the WASM animation player, feeding MotionValues that in turn update the rig (`vizij-web/apps/vizij-site/src/hooks/useWasmAnimationPlayer.ts`).

### website
- Expression/viseme demos work directly in numeric space, averaging scalar values and dividing by two with the active viseme (`vizij-web/apps/website/src/components/VizijExpressionsDemo.tsx:171`).
- Both demos depend on `@vizij/animation-react` players and manipulate animatable ids directly each frame rather than through poses (`vizij-web/apps/website/src/components/VizijVisemeDemo.tsx:86`, `vizij-web/apps/website/src/components/VizijExpressionsDemo.tsx:125`).
- Model loader exposes only scale/morph ids without rig maps (`vizij-web/apps/website/src/hooks/useModelLoader.ts`), preventing reuse of the low-rig abstraction.
- Expression/viseme definitions are simple scalar maps (`vizij-web/apps/website/src/config/expression.ts`, `vizij-web/apps/website/src/config/viseme.ts`); no channel awareness beyond mouth scale/morph.
- No node-graph runtime or provider is wired into the website bundle today.

## Gap Summary
- **Data model**: website lacks the shared `Pose`/`Track`/`VizijLowRig` utilities, so channels outside the mouth are ignored.
- **Blending**: website averages scalars while vizij-site blends full poses with configurable operations and validation.
- **Smoothing**: website jumps directly to target values; vizij-site runs a spring filter before viseme overlay.
- **Runtime**: node-graph runtime (`@vizij/node-graph-react`) is absent from the website, so there is no path to drive blending graphs or reuse the editor-generated specs.
- **Playback**: website relies on `@vizij/animation-react` players, whereas vizij-site already consumes the WASM player that better aligns with the node-graph toolchain.
- **Config parity**: assets, bounds, and initial values are duplicated but not in sync; maintaining two sets invites drift.

## Migration Strategy (Node-Graph Focused)

### Phase 0 – Align foundations
- Adopt the `vizij-site` config modules inside the website (either via shared package or aliased imports) so the website uses the same `Pose`, `Track`, `ChannelArchetype`, `VizijLowRig`, and expression/viseme pose presets.
- Replace `useModelLoader` in the website with `useRiggedModelLoader` to obtain `VizijLowRig` instances and eliminate direct `setVal` calls in components.
- Migrate vizij-site to the `@vizij/animation-react` provider used on the website so both surfaces rely on the same animation runtime ahead of node-graph integration.

### Phase 1 – Integrate the node-graph runtime
- Add `@vizij/node-graph-react` to the website bundle and wrap the relevant page subtree in `NodeGraphProvider` with throttled updates (mirror `apps/demo-node-graph/vite.config.ts:28` bundler adjustments if required).
- Establish a directory for graph specs (e.g., `apps/website/src/nodegraphs/expression-viseme.json`) and a loader utility that hydrates the JSON and calls `reload` on the provider. These specs will become the source of truth for both the blend logic and rig definitions.
- Build a `useNodeGraphPose` helper that reads vector outputs from the graph (`useNodeOutput` + `valueAsNumber`) and materializes a `Pose` with the shared channel set, so rigs can stay pose-driven.

### Phase 2 – Encode expression blending in the graph
- Express each base expression pose as a `VectorConstant` node containing the flattened mouth/eye/brow tracks in the agreed channel order.
- For each expression weight slider, map UI state into node parameters via `setParam` on `Slider` or `Constant` nodes; sum weights with `Add` nodes and clamp to avoid division by zero.
- Use existing vector math nodes (`VectorScale`, `VectorAdd`, `VectorSubtract`, `VectorIndex`) to recreate the `weighted_average_overlay` logic from `BlendNode` (scale diffs by weights, sum, divide by total, add back neutral).
- Expose the blended pose as a vector output node that the React layer converts to a `Pose`; keep feeding that pose through the existing `useSpringFilter` hook (React-based spring/damper) for the short term, scheduling a future graph node once requirements stabilize.

### Phase 3 – Add viseme overlay graph stages
- Pipe the spring-filtered expression pose into the graph as an input vector (React updates a `VectorConstant` node parameter each frame with the current filtered pose values).
- Feed the active viseme pose coming from the shared `@vizij/animation-react` player into another vector input node; expose viseme weights (from TTS playback) as scalar params to modulate blending strength.
- Recreate the final `weighted_average` viseme overlay from `useBlendTree` inside the graph so the graph output emits the fully blended pose vector.

### Phase 4 – Rig definition & output nodes
- Expand the graph spec JSON to include rig metadata (animatable ids, channel-to-track mappings) so the node graph fully describes the rig interface alongside blend logic.
- For each track that should reach the rig (mouth scales, morph, eyelids, brows), add `VectorIndex` + `Output` nodes that reference those rig mappings; the React adapter reads graph outputs and invokes `VizijLowRig.apply` using the metadata supplied in the JSON.
- Remove the remaining direct `setVal` calls from components once the rig is driven exclusively through `VizijLowRig.apply` fed by node-graph results.

### Phase 5 – Validation & handoff
- Compare runtime values between vizij-site and the updated website for a set of canned expression/viseme scripts; log pose vectors to ensure parity.
- Add regression tests around the graph spec (e.g., snapshotting JSON, unit tests for the React pose adapter).
- Document how to iterate on the graph (source of truth JSON, how to round-trip with the editor in `apps/demo-node-graph`) and update README/in-code comments accordingly.

## Tracking Checklist
- [ ] Share `Pose`, `Track`, `ChannelArchetype`, and `VizijLowRig` modules between vizij-site and website.
- [ ] Swap website loaders to `useRiggedModelLoader` and verify rigs expose the same channel maps as vizij-site.
- [ ] Standardize both surfaces on `@vizij/animation-react` and remove the vizij-site WASM hook.
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
