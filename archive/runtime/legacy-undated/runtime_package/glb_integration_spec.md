# Vizij GLB Integration Spec

## Current Asset Model

NOTE: "Current" is rapidly changing and very fluid. Don't take it as set in stone.

### GLB renderer assets
- The runtime loads `.glb` sources through `loadGLTF`, which wraps the Three.js loader and returns a Vizij `world` plus animatable definitions (`vizij-web/packages/@vizij/render/src/functions/load-gltf.ts:16-38`).
- During traversal, meshes export a `RobotData` custom extension that captures Vizij renderable metadata and animatable bindings (`vizij-web/packages/@vizij/render/src/functions/gltf-loading/traverse-three.ts:42-133`).
- Renderables author that extension by serialising their features and animatables into `userData.gltfExtensions.RobotData` before export (`vizij-web/packages/@vizij/render/src/renderables/group.tsx:62-139`, `vizij-web/packages/@vizij/render/src/functions/create-stored-data.ts:8-17`, `vizij-web/packages/@vizij/render/src/functions/create-stored-features.ts:9-25`).
- Authoring tools can refresh defaults/labels embedded in the extension without re-authoring the geometry (`vizij-web/apps/vizij-authoring/src/utils/robotData.ts:8-55`).
- The runtime wraps all of that inside an `assetBundle` object, which also carries rigs, poses, and optional animations (`vizij-web/packages/@vizij/runtime-react/src/types.ts:37-100`, `vizij-web/apps/tutorial-fullscreen-face/src/FaceApp.tsx:22-41`).

### Rig graphs
- Rig behaviour is declarative JSON describing nodes (`input`, `remap`, `constant`, etc.) and edges that wire high-level drivers to low-level outputs (`vizij-web/packages/@vizij/utils/src/rig/graph-builder.ts:10-158`).
- Each rig graph is packaged as `VizijGraphAsset` in the bundle and registered with the orchestrator at runtime (`vizij-web/packages/@vizij/runtime-react/src/VizijRuntimeProvider.tsx:390-452`).
- The orchestrator merges multiple graphs (e.g. base rig + pose graph) and publishes only the declared output paths into the renderer (`vizij-web/packages/@vizij/runtime-react/src/VizijRuntimeProvider.tsx:393-499`).

### Pose rig configuration
- Pose configs declare neutral input values and named poses keyed by the same standard rig identifiers the graphs emit (`vizij-web/apps/tutorial-fullscreen-face/src/assets/index.ts:5-26`, `vizij-web/apps/vizij-authoring/src/poseRig/types.ts:5-73`).
- On startup the runtime stages those neutral values into the rig using the collected input map, optionally filtering paths such as colour channels (`vizij-web/packages/@vizij/runtime-react/src/VizijRuntimeProvider.tsx:551-581`).

### Animation assets
- Animation sidecars are serialized Vizij `AnimationData` (StoredAnimation) JSON, the canonical format defined in `vizij-rs/crates/animation/vizij-animation-core/src/data.rs:61-101`, capturing named tracks of keypoints over canonical animatable ids.
- The demo tooling builds “bridge graphs” that expose animation values through synthetic `animation/<clip>/<channel>` inputs and feed them into rig outputs (`vizij-web/apps/demo-vizij-player/src/orchestrator/useOrchestratorMerging.ts:186-227`).
- Runtime animation registration expects those clips in the asset bundle and streams the sampled values into orchestrator inputs (`vizij-web/packages/@vizij/runtime-react/src/VizijRuntimeProvider.tsx:453-520`).

## glTF / GLB Capabilities

- A `.glb` file is the binary container for glTF 2.0, embedding the JSON scene graph alongside binary buffer and image blobs. Core objects include `scenes`, `nodes`, `meshes`, `materials`, `skins`, and `animations`.
- Animation samplers pair time accessors with value accessors and channels target `{ node, path }`, where `path` is restricted to `translation`, `rotation`, `scale`, or `weights`. Interpolation rules cover `STEP`, `LINEAR`, and `CUBICSPLINE`.
- glTF allows application data through `extras` on most objects, as well as formal extensions advertised in `extensionsUsed` / `extensionsRequired`.
- Recent ecosystem extensions such as `KHR_animation_pointer` broaden animation targets using JSON pointers, and vendor extensions can attach arbitrary structured data, but host applications must opt-in.
- The format is intentionally declarative and content-focused; it does not define compute graphs, orchestration rules, or high-level rig semantics beyond skinning/morph target constructs.

### Deep Dive: `KHR_animation_pointer`

- The `KHR_animation_pointer` extension augments glTF animation channels with a `pointer` string that follows RFC 6901 JSON Pointer semantics, allowing keyframes to target any numeric property inside the glTF JSON when paired with compatible accessor data. It effectively expands animation reach beyond the built-in node `translation`/`rotation`/`scale`/`weights` slots.
- Animation sampling remains the same pipeline—samplers still reference accessor indices for input (time) and output (values), and interpolation modes mirror core glTF. The extension’s job is to translate sampled values onto arbitrary JSON locations rather than fixed transform paths.
- Targets referenced via pointers must resolve to numeric scalars or arrays; tooling typically maps vector properties (e.g. material color) or morph weights. Non-numeric payloads (booleans, enums, strings) remain unsupported because accessors are typed arrays.
- The extension does not invent new evaluation logic. It only broadens where numeric results land. Applications still choose whether to consume, ignore, or override those values at runtime, and the glTF binary merely carries the data.

## Vizij Rig / Config / Animation Requirements

- **Rig graphs** encode evaluation logic (remaps, blending strategies, pose deltas) over stable path identifiers (`rig/<face>/<...>`). They rely on graph execution in the orchestrator rather than baked transforms.
- **Pose configs** assume an addressable registry of inputs, neutral baselines, and procedural blending at runtime. They need labels, metadata, and authoring history not directly tied to scene nodes.
- **Animation clips** cover scalar inputs but also colour, Euler, vector, boolean, and text tracks (see demo presets) and expect to drive rig paths, not node transforms.
- **Runtime bundle** expects the GLB geometry, rig graphs, and animations to be swappable pieces that can be composed, hot-reloaded, or merged independently.

## Alignment and Gaps

- glTF already carries Vizij renderable metadata via the `RobotData` extension, so piggybacking on `extensions` is proven feasible.
- Numeric animation tracks that drive transforms or morph weights could be mapped to native glTF animations, especially with `KHR_animation_pointer` to reference custom JSON locations. However, Vizij animations frequently target orchestrator paths that have no representation in the glTF node graph.
- Rig graphs are fundamentally a control-logic DSL with node types (`centered_remap`, `pose_blend`, etc.) that have no counterpart in glTF’s schema; representing them directly in glb would require a dedicated extension that preserves arbitrary graph structures.
- Pose configs and neutral staging are metadata about orchestrator inputs, not scene nodes. They would need to live under `extras` or a root-level extension but have no natural mapping to glTF primitives.
- Text and boolean animation tracks cannot be expressed with glTF animation samplers, which are limited to numeric vectors. Supporting them would require custom data blobs and a bespoke playback system even if embedded in the GLB.
- Keeping assets separate today allows independent iteration (e.g., new rig graph with same geometry). Embedding everything into the GLB would couple release cadence and complicate diffing or targeted updates.

## Proposal: Dual-Format Baked Animations

This is the primary pathway. It packages every Vizij asset inside the GLB, keeps orchestrator-friendly data intact, and additionally emits fully baked glTF animation channels for broad tool interoperability.

### `VIZIJ_bundle` extension overview
- **Location**: Root-level glTF extension (`extensions.VIZIJ_bundle`) declared in `extensionsUsed`/`extensionsRequired`.
- **Schema outline**:
  ```jsonc
  {
    "version": 1,
    "graphs": [
      { "id": "rig:face", "kind": "rig", "spec": { ... }, "hash": "..." },
      { "id": "pose:face", "kind": "pose", "spec": { ... } }
    ],
    "poses": {
      "config": { "neutralInputs": { ... }, "poses": [ ... ] },
      "metadata": { "author": "...", "createdAt": "..." }
    },
    "animations": [
      { "id": "smile", "format": "vizij", "clip": { ... }, "hash": "..." }
    ]
  }
  ```
  - `graphs` mirrors the existing `RigGraphSpec` JSON and tags each entry with a `kind` (`rig`, `pose`, `lowLevel`, etc.) plus provenance hashes so consumers can detect drift.
  - `poses` embeds the neutral input table and pose definitions exactly as today’s config files.
  - `animations` keeps the original Vizij `AnimationData` clips (channel → orchestrator path) alongside metadata describing how they were baked (sample rate, applied graph version).
- **Relationship to baked data**: Native glTF samplers created during export reside in the standard `animations` array of the core glTF JSON. They reference node transforms or `KHR_animation_pointer` targets derived from `RobotData`. The extension and the core glTF together form a complete bundle.

### Export pipeline
- **Retain Vizij clips**: Store the serialized `AnimationData` payloads under `VIZIJ_bundle.animations`, preserving channel-to-orchestrator mappings exactly as authored.
- **Drive the face**: During export, spin up the orchestrator with the bundled rig graphs (`vizij-web/packages/@vizij/runtime-react/src/VizijRuntimeProvider.tsx:390-520`) and feed each Vizij animation clip (serialized `AnimationData`) back through the graph. Sample at a configurable rate (e.g. per keyframe, plus oversampling for easing) to resolve the downstream renderer features (translation, rotation, color, etc.).
- **Map to glTF nodes**: Convert each sampled frame into transform or morph deltas on the associated Three.js objects. Since Vizij renderables already expose translation/rotation/scale and other features through `RobotData` (`vizij-web/packages/@vizij/render/src/renderables/group.tsx:62-139`), the exporter can look up the corresponding scene node and assign per-channel keyframes. Attributes that have no native slot (e.g. color) can target the `RobotData` extension via `KHR_animation_pointer`.
- **Bake and attach**: Write glTF animation samplers using the sampled data, referencing either core transform `path` values or `pointer` strings when needed. The baked animation lives alongside the geometry, while the raw Vizij clip remains in the extension for round-tripping.
- **Record provenance**: Embed metadata (hashes of the Vizij `AnimationData` clip + rig graph + sample rate) so the importer can detect divergence later.

### Import pipeline
- **Load both representations**: Parse `RobotData` + Vizij extension just as today to reconstruct the world and orchestrator inputs.
- **Verify baked output**: Optionally rerun the Vizij `AnimationData` clip through the orchestrator; compare the sampled transforms against the baked sampler (within a tolerance). If differences exceed the threshold, prompt to overwrite or keep the baked data.
- **User choice**: Offer three pathways—(1) trust the baked animation as-is, (2) regenerate and overwrite the sampler, or (3) discard baked channels and rely solely on Vizij runtime playback.

### Benefits
- **Interoperability**: Blender or any glTF viewer sees working keyframes immediately because the baked samplers use standard animation primitives.
- **Round-trip fidelity**: Vizij still owns the authoritative animation logic, so edits can flow back to orchestrator-friendly clips without losing intent.
- **Minimal workflow change**: Authoring surfaces continue to operate on the existing JSON clips; baking happens as a post-process during export.

### Risks and edge cases
- **Drift / precision**: Floating-point tolerances mean re-baked samples might not match bit-for-bit. Even identical rigs could produce small deviations when resampled at a different frame rate.
- **Sampling resolution**: Piecewise-linear sampling can miss higher-order easing or procedural spikes. Need adaptive sampling or curve fitting to avoid visibly stepped playback in external tools.
- **Feature coverage gaps**: Some Vizij features (e.g. material label metadata, text fields, or boolean toggles) lack direct glTF equivalents. These would remain Vizij-only and appear static in third-party viewers despite existing in the clip.
- **Payload size**: Storing both the raw Vizij clip and baked samplers increases file size proportionally to animation duration and sampling density.
- **Determinism requirements**: Baking assumes the orchestrator graph is deterministic given the inputs. Runtime-only drivers or randomness would need to be disabled or approximated during export.
- **Complex dependency graph**: Baking has to evaluate the full graph stack (high-level → low-level → renderer). If future rigs rely on runtime signals (e.g. camera-driven inputs), the exporter must supply substitutes or skip baking for those channels.

Overall the proposal is feasible: both representations can coexist, the baked animation improves tool compatibility, and the Vizij extension remains the system of record. The chief trade-offs are the additional export-time complexity, larger GLB payloads, and a careful approach to verifying baked output so authors trust what third-party tools display.

## Alternative Integration: Extension-Only Runtime Animations

This option keeps the GLB as a container for Vizij data but does **not** bake duplicate native animations. External tools only see animation data if they understand the Vizij extension or if limited channels are mapped via `KHR_animation_pointer`.

1. **Bundle orchestrator assets only**
   - `VIZIJ_bundle` still carries rig graphs, pose configs, and Vizij animation clips (`AnimationData` JSON) as described above, but we skip the baking step. The core glTF `animations` array remains empty (or limited to hand-authored tracks).
   - Optionally expose a small subset of numeric channels through `KHR_animation_pointer` for compatibility-critical paths, but avoid wholesale duplication.

2. **Exporter adjustments**
   - Simplify export: serialize current JSON sidecars into the extension and copy existing `RobotData` without running the orchestrator.
   - Maintain hashes/metadata so future tooling can decide whether to bake later or keep purely logical assets.

3. **Runtime behaviour**
   - `VizijRuntimeProvider` reads the extension and registers graphs/animations exactly as it does today. Since there are no baked samplers, orchestrator playback is the only way to drive the face once imported.
   - Optional utility can materialize native glTF animations at import time on demand (e.g., for previews) but the canonical asset stays extension-only.

4. **Trade-offs compared to dual-format baking**
   - **Pros**: Smaller GLB files, faster exports, zero risk of drift between baked/native versions, simpler tooling.
   - **Cons**: Third-party viewers see no motion unless they understand Vizij; interoperability suffers. Any conversion to baked form must happen later, potentially with inconsistent sampling choices.
   - **Who benefits**: Pipelines where Vizij is the sole consumer of the GLB or where baked previews are unnecessary.

## Recommended next steps
- Finalise the `VIZIJ_bundle` schema (graphs, poses, animations, provenance metadata) and document it for tooling implementers.
- Build an export prototype that runs the orchestrator to bake a single clip into native glTF channels; compare sampler output against the stored Vizij clip to benchmark drift.
- Implement the import-time validator that replays clips and flags divergences, including UI copy for overwrite/keep decisions.
- In parallel, evaluate the extension-only path by shipping a GLB without baked animations and confirming runtime consumption still works end to end; use this as a control case for file size and performance measurements.
