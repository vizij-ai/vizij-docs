# The web renderer's anatomy: what @vizij/render and Studio's fork draw, store, import and export
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,render,three.js,bevy,studio,glb -->
> **Last updated:** 2026-09-28
> **Related documents:** [Central plan](../bevy_everywhere-plan.md)

Raw outputs (import census, GLB RobotData and material dumps, the Studio vs
`@vizij/render` diff) and the scripts that produced them are not kept.

## Findings

1. `@vizij/render` is 6,045 lines in 58 files; by role: rendering 1,884 (31%),
   scene store and world types 962, GLB import 1,972 (33%), bundle (`VIZIJ_bundle`)
   types and extract/apply 362, export 462, editing actions 343, misc 60
   (`vizij-web/packages/@vizij/render/src`, `wc -l`; table in Evidence).
   Only 30% of it draws; the rest is a world model, a loader and an exporter.
2. The draw path is one R3F `Canvas` per `<Vizij>` (`src/vizij.tsx:66-108`), an
   orthographic camera fitted *contain*-style to the root's `rootBounds`
   (`vizij.tsx:193-233`), one ambient light at π/2 (`vizij.tsx:141`), and a
   recursive `Renderable` switch over four element kinds: group, ellipse,
   rectangle, shape (`src/renderables/renderable.tsx:52-93`). Values reach the
   three.js objects through `useFeatures`, a per-feature zustand subscription
   on `state.values` keyed by `getLookup(namespace, animatableId)`
   (`src/hooks/use-features.ts:56-73`).
3. Ellipse and rectangle geometry is **generated in the renderer, not read from
   the GLB**: drei `Circle args=[1,100]` and `Plane args=[1,1]`, scaled by the
   `width`/`height` features (`renderables/ellipse.tsx:301-304,155-188`;
   `renderables/rectangle.tsx:300-303,155-192`); strokes are drei `Line`
   (three-stdlib `Line2` fat lines) over 600 or 5 generated points
   (`ellipse.tsx:263-276`, `rectangle.tsx:267-275`). The loader never reads a
   mesh for these kinds (`functions/gltf-loading/traverse-three.ts:86-113`), and
   `StoredShape` omits geometry (`types/shape.ts:67`;
   `functions/create-stored-data.ts:12`). Shapes use the GLB mesh
   (`traverse-three.ts:71-79`; `renderables/shape.tsx:73-79`).
4. No shipped face GLB contains an ellipse or rectangle: all 17 face fixtures in
   vizij-web carry only `shape` and `group` RobotData; the
   only ellipse/rectangle world in source is a hand-built Storybook story
   (`semio_studio/apps/docs/stories/prebuilt/quori.ts`, 3 entries). Every face
   fixture is `THREE.GLTFExporter` output with `extensionsUsed`
   `RobotData`,`VIZIJ_bundle` (+`KHR_materials_unlit` on Toasty/Hugo), all
   materials double-sided, no Draco, morph targets on up to 15 primitives with
   up to 13 targets. The bundle sits on a *node*, not the
   document root (`bundleNode=true, bundleRoot=false` for every fixture).
5. The Bevy view (`vizij-rs/crates/vizij/src/view.rs`, `meta.rs`) reads the same
   RobotData and binds five feature kinds plus morphs: translation, rotation,
   scale, color, opacity, `Morph(name)` (`meta.rs:160-174`); everything else is
   logged and skipped (`meta.rs:171-174`). `Element.kind` is stored but unused
   (`meta.rs:47-49`). Bevy therefore does not draw: ellipse/rectangle
   width/height/fill/stroke, PBR extras (roughness, metalness, shininess,
   emissive, emissiveIntensity, specular — `shape.tsx:213-257`), the selection
   glow (`effects/selection-glow-effect.tsx`), the safe-area outline
   (`vizij.tsx:255-280`), the "No Output" text (`vizij.tsx:238-247`), pointer
   hover/click selection, per-namespace re-instantiation of one world
   (`renderable.tsx:36-44`), Vector2 translations and scalar rotations
   (`view.rs:494-512` needs three components; web: `group.tsx:68-79`).
6. For shape+group faces the GLB alone carries what Bevy needs: meshes, materials,
   morph targets in the glTF proper; RobotData per node with animatable UUIDs,
   `morphTargets` names, `material` kind and `rootBounds`; `VIZIJ_bundle` on a
   node (host crate reads nodes first, then root:
   `vizij-rs/crates/interop/vizij-arora-host/src/lib.rs:86-94`). Node names are
   the join key (`meta.rs:142-147`; `view.rs:364-374`).
7. Consumers of `@vizij/render` by direct import: vizij-authoring 22 symbols in
   49 files, runtime-react 14 in 6, vizij-showcase 2, vizij-standalone 1 (the
   `VizijSpeechConfig` type only), speech-react 0 (dependency declared, no
   import), tutorial-agent-face / tutorial-fullscreen-face / demo-vizij-player 0
   (they import `@vizij/runtime-react` only). Only **one** consumer draws:
   `runtime-react/src/VizijRuntimeFace.tsx:2,15` renders `<Vizij>`; every app
   draws through it.
8. Semio Studio's `packages/vizij` is the **origin**, not a fork: first commit
   `3e7846e1 2025-01-09 "added vizij package"` (79 commits, last content change
   2026-04-28); `@vizij/render` first appears in vizij-web as a squash
   `b94d2bee 2025-12-05` and STUDIO-239 states it is Studio's package extracted.
   Same 52-file skeleton; 4 files identical, the renderables and loader
   rewritten on both sides.
9. Studio's world model is **per-axis**: features are keyed `translation.x`,
   `rotation.r` (RPY), `color.r`; compound stored animatables are split into
   derived `AnimatableNumber`s `${id}.${axis}` on load
   (`semio_studio/packages/vizij/src/functions/gltf-loading/map-features.ts:46-70`),
   assertions require the split keys (`traverse-three.ts:112-137`), and the
   exporter writes features as they are (`create-stored-features.ts:9-19`). A
   Studio-exported face therefore carries RobotData that vizij-web's loader
   rejects (`vizij-web .../traverse-three.ts:281-288` throws on missing
   `translation`) and Bevy skips as unmapped. The reverse direction loads.
10. Studio's vizij store owns no runtime values: `VizijData` has no `values`
    (`packages/vizij/src/store-types.ts:8-19`); `useFeatures` subscribes to
    `@semio/utils`' `useValuesStore` (`hooks/use-features.ts:66`) and writes go
    through `VizijValueWriterContext` (`context.ts:18-30`), which Studio routes
    into its animation-aware `setValue` (`apps/studio/src/providers/studio.tsx:68-84`).
11. Studio's consumers: `apps/studio` (upload-face modal: `loadGLTF(...,
    aggressive=true, safeArea)` then `@semio/scene`'s `exportGLTF` of the live
    three.js root — `components/modals/upload-face-modal.tsx:65-72,110`),
    `packages/core` (loads face assets into projects — `hooks/use-project-full-context.ts:481-490`),
    `packages/scene` (`renderables/screen.tsx:207-223`: `InnerVizij` inside a
    drei `RenderTexture` attached as the `map` of a Plane's material, in the
    scene's own canvas, with the *scene store* cast as `VizijStore`;
    `types/world.ts:11` unions Ellipse|Rectangle|Group into the scene World),
    `apps/docs` (stories), `apps/vizij-app` (full-window `<Vizij>`,
    `content.tsx:215`, values bridged by `pub.output` name, `content.tsx:121-133`).
12. VIZ-77 "Port Studio Vizij Improvements to Vizij-Web" (Todo, no priority,
    Saad, 2026-07-22): extract Studio's improvements into vizij-web without
    adopting `@semio/utils`, then plan reintegration. STUDIO-239 "Retire
    packages/vizij in favour of the published @vizij/render" (Backlog, Medium,
    Andy, 2026-09-03) is the Studio half: the case is retiring a duplicate
    renderer, explicitly *not* adopting the bundle layer, which "moves into
    Arora and out of Vizij"; `vizij@0.1.0` on npm was published from Studio
    with a wrong `repository.url`; it gates STUDIO-237 wave 3 (extracting
    `@semio/scene`, which depends on `vizij`).
13. `memoryInvestigation.ts` (46 lines) is an opt-in counter sink
    (`globalThis.__VIZIJ_MEMORY_INVESTIGATION__.enabled`) recording
    `canvasMountCount`, `mountedCanvasCount` (`vizij.tsx:58-64`),
    `rootReplacementCount` (`store.ts:371,383`), `gltf*LoadCount` and
    `dracoLoaderCreationCount` (`functions/load-gltf.ts:248-253,267-270`). The
    authoring app drives it (`apps/vizij-authoring/src/debug/memoryInvestigation.ts`,
    URL `memoryInvestigation=1`, scopes full / main-runtime-only /
    authoring-only) and a Playwright workflow measures idle heap, preset
    cycles and DOM counters with a `leakLikely` verdict
    (`apps/vizij-authoring/e2e/memory-investigation.workflow.pw.ts:44-60`). No
    recorded outcome lives in the repo.
14. Resource lifetime today: a new `GLTFLoader` + `DRACOLoader` per load, never
    disposed (`load-gltf.ts:248-253`); `Shape.geometry` (a `BufferGeometry`)
    lives in the store's world and is cloned per mounted shape
    (`shape.tsx:73-79`), and `addWorldElements(replace=true)` swaps worlds
    without disposing (`store.ts:377-391`); the package disposes only the
    selection-glow edges and material (`selection-glow-effect.tsx:99,114`).
    Whole-canvas cleanup is R3F's: 500 ms after unmount it disconnects events,
    disposes render lists, forces context loss and disposes the scene
    (`@react-three/fiber@9.5.0 dist/events-358c3764.cjs.dev.js:15840-15860`).
    `runtime-react` cancels its loops and clears playback maps on unmount
    (`VizijRuntimeProvider.tsx:3612-3656`) but disposes the arora device only
    when replacing it (`engine/aroraEngine.ts:203`).
15. Several faces per page is a shipped pattern: authoring mounts a main and a
    reference runtime (two providers, two stores, two canvases —
    `components/app/Viewer.tsx:685-745`, `ReferenceFaceRuntime.tsx:303-317,555`);
    the showcase mounts `RuntimeFaceFrame` in five sections under one provider
    (one store, five canvases, each an R3F `Canvas` with `frameloop` at its
    default `always`).

## Questions answered

**Q1 — What @vizij/render provides.** Rendering (Canvas, camera fit, safe area,
four renderables, materials, morphs, selection glow), the scene store (world +
animatables + values + selection + slots, 32 actions), GLB import (RobotData
path and "aggressive" three.js-scene path, bundle extraction, clip extraction),
export (GLTFExporter with bundle attach and GLB JSON sanitising), editing
actions and hooks. Table in Evidence §A.

**Q2 — Which consumer imports what.** Evidence §B. Draw-the-face: 2 symbols,
one consumer (runtime-react). World-model-or-store: 14 (authoring), 7
(runtime-react), 2 (showcase). Import-export (loaders, `exportScene`, bundle
schema types): 8 (authoring), 5 (runtime-react), 1 (standalone). Editing: no
dedicated symbols — authoring edits through store actions counted under store.
Misc: 0.

**Q3 — Drawing contract vs Bevy.** Findings 3-6 and Evidence §C. Ellipse and
rectangle are generated meshes driven by typed features; a GLB alone does not
carry what the web draws for them, and Bevy does not bind their features. For
shape+group faces, which is every shipped face, the GLB carries everything.

**Q4 — Studio's packages/vizij.** Findings 8-12 and Evidence §D. Origin of
`@vizij/render`, diverged into a per-axis, values-outside-the-store renderer
with no bundle layer. "Studio consumes the Bevy view as a library" is direct for
`apps/vizij-app` (a full-window face) and is *not* the same operation for the
face-on-a-screen in `packages/scene`, which needs the face as a texture inside
the scene's own WebGL context (§D.3).

**Q5 — Memory and perf constraints.** Findings 13-15 and Evidence §E.

## Evidence

### A. @vizij/render: export → category → lines

| Module (`src/…`) | Public exports | Category | Lines |
|---|---|---|---|
| `vizij.tsx` | `Vizij`, `VizijProps`, `InnerVizij`, `InnerVizijProps` | rendering | 285 |
| `renderables/{renderable,group,ellipse,rectangle,shape}.tsx`, `index.tsx` | internal (`Renderable`) | rendering | 1,365 |
| `effects/selection-glow-effect.tsx` | internal | rendering | 154 |
| `hooks/use-features.ts` | `useFeatures` | rendering (value→object) | 80 |
| `store.ts` | `VizijSlice`, `useDefaultVizijStore`, `createVizijStore`, `VizijStore` | store | 429 |
| `store-types.ts` | `VizijData`, `VizijActions`, `VizijStoreSetter`, `VizijStoreGetter` | store | 109 |
| `context.ts` | `VizijContext` | store | 5 |
| `hooks/use-vizij-store{,-subscription,-setter,-getter}.ts`, `use-deep`, `use-delayed-boolean` | `useVizijStore`, `useVizijStoreSubscription`, `useVizijStoreSetter`, `useVizijStoreGetter` | store | 107 |
| `types/{rectangle,ellipse,group,shape,feature,renderable-base,renderable-feature,selection,stored,world,index}.ts` | `Group`, `Ellipse`, `Rectangle`, `Shape`, `ShapeMaterial`, `Feature`, `AnimatedFeature`, `StaticFeature`, `StoredAnimatedFeature`, `Stored*`, `Selection`, `World`, `RenderableBase`, `RenderableFeature` | world model | 312 |
| `types/vizij-bundle.ts`, `types/animations.ts` | `VizijBundleExtension`, `VizijBundleGraphEntry`, `VizijBundleAnimationEntry`, `VizijPoseRigConfig`, `VizijSpeechConfig`, `VizijAnimationClipData`, … (18 types) | bundle schema | 179 |
| `functions/vizij-bundle.ts` | `extractVizijBundle`, `applyVizijBundle` | bundle | 183 |
| `functions/load-gltf.ts`, `load-gltf-blob.ts` | `loadGLTF`, `loadGLTFFromBlob`, `loadGLTFWithBundle`, `loadGLTFFromBlobWithBundle`, `loadGltfFromBlob`, `parseGlbJsonChunk`, `LoadedVizijAsset`, `EmptyModelError` | import | 429 |
| `functions/gltf-loading/{traverse-three,import-scene,import-group,import-mesh,import-geometry,map-features,extract-animations}.ts` | internal | import | 1,494 |
| `functions/transforms.ts`, `util.ts` | internal | import helpers | 49 |
| `functions/export.ts`, `exportable-bodies.ts`, `create-stored-data.ts`, `create-stored-features.ts` | `exportScene`, `ExportSceneOptions` (+ `getExportableBodies` store action) | export | 462 |
| `actions/{create-new-element,remove-children}.ts`, `functions/{create-animatable,create-world-element,compare-data}.ts` | internal (behind `createGroup`, `createAnimatable`, `setChildren`…) | editing | 343 |
| `memoryInvestigation.ts`, `index.tsx` | internal | misc | 60 |
| **Total** | | | **6,045** |

Store actions (`store-types.ts:23-97`): values (`setValue`, `setValues`),
world (`setVizij`, `addWorldElements`, `setWorldElementName`, `setParent`,
`setChild`, `setChildren`, `setGeometry`, `setMaterial`, `setReference`),
features (`setStaticFeature`, `setAnimatableValue`, `createAnimatable`,
`createStatic`), selection (`updateElementSelection`, `setHoveredElement`,
`onElementClick`, `clearSelection`), slots (`setSlot`, `setSlots`,
`clearSlot`), editing (`createGroup`, `setOrigin`, `setAxis`, `setTags`),
export (`getExportableBodies`), `setPreferences`.

### B. Consumer imports (distinct symbols; `(t)` = type-only)

| Consumer | draw-the-face | world-model-or-store | import-export | editing | misc |
|---|---|---|---|---|---|
| `apps/vizij-authoring` (49 files) | 0 | 14: `useVizijStore`, `useVizijStoreGetter`, `useVizijStoreSetter`, `createVizijStore`, `VizijContext`, `VizijData`(t), `VizijStoreSetter`(t), `World`(t), `Group`(t), `Shape`(t), `Feature`(t), `AnimatedFeature`(t), `Selection`(t), `ShapeMaterial`(t) | 8: `loadGLTFFromBlobWithBundle`, `exportScene`, `LoadedVizijAsset`(t), `VizijBundleExtension`(t), `VizijBundleGraphEntry`(t), `VizijBundleAnimationEntry`(t), `VizijPoseRigConfig`(t), `VizijSpeechConfig`(t) | 0 (edits via store actions) | 0 |
| `packages/@vizij/runtime-react` (6 files) | 2: `Vizij`, `VizijProps`(t) | 7: `VizijContext`, `createVizijStore`, `VizijStore`(t), `useVizijStore`, `VizijData`(t), `VizijActions`(t), `World`(t) | 5: `loadGLTFWithBundle`, `loadGLTFFromBlobWithBundle`, `VizijBundleExtension`(t), `VizijBundleGraphEntry`(t), `VizijBundleAnimationEntry`(t) | 0 | 0 |
| `apps/vizij-showcase` (1 file) | 0 | 2: `useVizijStore`, `useVizijStoreSetter` (writes `rootBounds`, `RuntimeFaceFrame.tsx:98-124`) | 0 | 0 | 0 |
| `apps/vizij-standalone` (2 files) | 0 | 0 | 1: `VizijSpeechConfig`(t) | 0 | 0 |
| `packages/@vizij/speech-react` | 0 (dependency declared, `package.json:35`, unused) | | | | |
| `apps/tutorial-agent-face`, `apps/tutorial-fullscreen-face`, `apps/demo-vizij-player` | 0 — `@vizij/runtime-react` only (`VizijRuntimeFace`) | | | | |

The authoring app keeps two stores: an editing store at the root
(`src/main.tsx:10-15`) and the runtime store created by `VizijRuntimeProvider`
(`VizijRuntimeProvider.tsx:1300`), whose `<VizijRuntimeFace>` is the viewport
(`components/app/Viewer.tsx:685-745`); bridges copy selection between them
(`Viewer.tsx:94-160`).

### C. Drawing contract: web vs Bevy

| Aspect | Web (`@vizij/render`) | Bevy (`crates/vizij`) | Gap |
|---|---|---|---|
| Camera | Orthographic at z=100, contain fit to `rootBounds`, refit on resize (`vizij.tsx:143-148,193-233`) | Orthographic at z=100, `FitProjection` contain/cover/stretch + zoom (`view.rs:201-298`) | Bevy ⊃ web |
| Lighting | `ambientLight π/2` + `MeshStandardMaterial` (`vizij.tsx:141`) | Unlit, albedo × ambient/π; `basic` → ×1 (`view.rs:66-71,388-396`) | Claimed pixel-exact on Quori (`view.rs:69-70`) |
| Color/tonemap/AA | sRGB out, `NoToneMapping`, `antialias` (`vizij.tsx:73-77`) | `Tonemapping::None`, `Msaa::Sample4` (`view.rs:319-321`) | none |
| Background | Transparent canvas (page CSS shows) | Clear color flag (`view.rs:60-61`) | operator UI detail |
| Shape transform | translation vec3/vec2, rotation euler ZYX or scalar Z, scale vec3/scalar (`group.tsx:60-93`) | vec3 only for translation/rotation; scale vec3 or scalar (`view.rs:494-521`) | vec2 / scalar rotation dropped |
| Shape material | 5 kinds; color rgb/hsl/vec3; opacity; roughness, metalness, shininess, emissive, emissiveIntensity, specular (`shape.tsx:170-257,325-358`) | color (rgba or xyz) and opacity only (`meta.rs:160-174`, `view.rs:522-546`) | PBR extras dropped; no shipped fixture carries them |
| Morphs | `morphTargetInfluences[i]` by dictionary (`shape.tsx:104-131`) | `MorphWeights` by index of name in `morphTargets` (`view.rs:451-461,547-555`) | none |
| Ellipse/rectangle | Generated Circle/Plane + fat-line stroke, 10 typed features (`ellipse.tsx`, `rectangle.tsx`; `types/ellipse.ts:22-33`) | Not bound; kind unused | dropped — no shipped face uses them |
| Selection glow, safe area, "No Output", hover/click | `selection-glow-effect.tsx`; `vizij.tsx:238-247,255-280`; `onElementClick` (`store.ts:53-115`) | none | authoring affordances |
| Multi-namespace | One world entry rendered per namespace in `refs`; slots (`renderable.tsx:36-44`; `store.ts:337-369`) | one scene | Studio scene feature; unused by faces |
| Draco | `DRACOLoader` registered (`load-gltf.ts:251`) | Bevy's glTF loader (Draco support unverified) | no face fixture needs it |
| Face swap | `addWorldElements(replace)` keeps a canvas (`store.ts:377-391`) | despawn root, reload, refit, reset index (`view.rs:164-196`) | equivalent |

### D. Studio's packages/vizij

**D.1 Relation.** Studio original (2025-01-09) → extracted as `@vizij/render`
(visible from 2025-12-05 squash) → both diverged. Lines changed per shared file:
`import-mesh.ts` 512, `shape.tsx` 479,
`rectangle.tsx` 446, `ellipse.tsx` 436, `export.ts` 351 (Studio 36 lines vs
369), `load-gltf.ts` 341 (74 vs 377), `vizij.tsx` 293, `import-group.ts` 263,
`traverse-three.ts` 250, `store.ts` 239, `map-features.ts` 195 (199 vs 38).
Studio-only: `hooks/use-vizij-value-writer.ts`, `types/element.ts`,
`utils/context-providers.tsx` (`skipVizijContext`), `r3f-jsx.d.ts`,
`saveJson.js`. Render-only: `effects/selection-glow-effect.tsx`,
`functions/{vizij-bundle,exportable-bodies}.ts`,
`gltf-loading/extract-animations.ts`, `types/{vizij-bundle,animations}.ts`,
`memoryInvestigation.ts`. Dependencies: Studio bundles three/r3f/drei/zustand as
dependencies plus `@semio/utils`/`@semio/ui` (`packages/vizij/package.json`);
render declares them as peers plus `@vizij/utils`.

**D.2 Format divergence.** Per-axis features and RPY eulers (Finding 9) mean
the two packages read RobotData one-way. Studio's browser-test fixture
`apps/studio/browser-tests/fixtures/files/quori-v2/quori.glb` shows the
per-axis keys (`shape.translation.x`, `shape.rotation.r`, `shape.color.r`,
`screen.*`, joints) — a Studio *scene*, but written by the same
`createStoredFeatures`.

**D.3 What "Studio consumes the Bevy view as a library" has to mean.** Two
different embeddings exist:

- `apps/vizij-app`: a full-window `<Vizij>` in a Tauri webview with a name-keyed
  value bridge (`content.tsx:121-133,215`). The Bevy view replaces the canvas
  and the bridge becomes the arora device; that is a library swap.
- `packages/scene` screen (`renderables/screen.tsx:205-225`): the face is a
  `RenderTexture` sampled by a plane *inside the Studio 3D scene*, in the same
  WebGL context and the same store. A Bevy wasm view owns its own canvas and
  wgpu context and cannot render into a three.js texture. The face must reach
  the scene as pixels: (a) per-frame copy from Bevy's canvas into a three.js
  `CanvasTexture` (one Bevy instance per screen); (b) the frame stream Bevy
  already publishes as HAL readings (`display/face`, 15 Hz default —
  `crates/vizij/README.md` flags table) uploaded as an image texture; (c) the
  three.js screen renderer stays and Studio's `packages/vizij` survives only
  as that thin renderer over a store it no longer owns (STUDIO-239's own end
  state); (d) the whole Studio scene moves to Bevy (out of scope). Each also
  needs the scene store's values to flow into a Bevy-hosted device instead of
  `useValuesStore`; the `VizijValueWriterContext` seam is where that write
  already routes (`context.ts:18-30`).

### E. Memory, teardown, GPU

- Counters and harness: Finding 13. What they were built to catch: canvases
  mounting more than once per view, repeated world replacement, one
  `GLTFLoader`+`DRACOLoader` allocation per load (never disposed).
- GPU-backed objects: `Shape.geometry` lives in the zustand world and is
  cloned per mount; nothing disposes old geometries on `addWorldElements(replace)`
  or `setVizij` — three.js frees GPU buffers only on `geometry.dispose()` or
  on R3F's `dispose(scene)` at canvas unmount, so a long-lived canvas that
  swaps faces accumulates GPU buffers (`store.ts:370-391`; `shape.tsx:73-79`).
- Canvas teardown: R3F handles it 500 ms after unmount (force context loss,
  scene dispose). The package relies on this rather than disposing itself.
- The runtime device: `runtime-react` never disposes the arora device on
  provider unmount, only on replacement (`aroraEngine.ts:203`).
- Multiple faces: authoring = 2 canvases + 2 stores + 2 devices; showcase = 5
  canvases on 1 store; each canvas is a WebGL context rendering every frame
  (`frameloop` default). Nothing in the package shares a renderer between
  faces or throttles hidden canvases; `runtime-react` throttles only the
  *step* loop (`VizijRuntimeProvider.tsx:3620-3645`, idle-visible/hidden fps).

## Implications for the target picture

- The Bevy view replaces 1,884 lines of drawing; the other 4,161 lines are a
  world model, loader and exporter that the target keeps only where authoring
  survives (vizij-authoring) — `runtime-react` needs from `@vizij/render` just
  `Vizij` plus the loaders and bundle types, and every runtime app draws
  through `runtime-react`. So the browser cut is one file
  (`VizijRuntimeFace.tsx`) plus the provider's load path, not the apps.
- Ellipse/rectangle are a web-only vocabulary with no shipped user; the target
  can declare them out of the view's contract without breaking a face. If they
  are ever wanted, they need a Bevy binding *and* a GLB representation, since
  today's GLB does not carry them.
- PBR extras, vec2 translations and scalar rotations are contract holes Bevy
  has today; none is exercised by a shipped fixture, all are cheap to add in
  `meta.rs`/`view.rs` if the authoring app keeps emitting them.
- Studio has two embeddings: `vizij-app` (a plain swap) and the scene screen (a
  texture problem). "Studio consumes the Bevy view as a library" is true for
  the first and needs a decision for the second (§D.3 a-d).
- Studio-authored faces are not readable by Bevy until the per-axis RobotData
  format is reconciled (VIZ-77 / STUDIO-239); the Bevy view inherits
  vizij-web's compound-feature format.

## Implications for the plan

- Sequence Studio last: STUDIO-239 (retire `packages/vizij` for `@vizij/render`)
  is planned before any Studio package extraction and is also the point where
  the RobotData format converges; the Bevy swap in Studio should land after
  it, or the plan takes on the format reconciliation itself.
- Decide the scene-screen embedding (§D.3) before promising "Bevy everywhere"
  in Studio; (c) keeps three.js alive for one renderer, (a)/(b) need a
  Bevy-side offscreen/canvas-texture path that does not exist yet on wasm.
- Multiple faces per page must be a stated capability of the wasm view: N
  faces = N Bevy instances unless the view learns to drive several canvases;
  the showcase's five canvases and authoring's two runtimes are the acceptance
  cases. A wasm Bevy instance also needs an in-page teardown path (React
  unmount) that R3F gives the web today for free.
- The memory-investigation harness (authoring e2e) is the natural regression
  gate for the wasm view's instance lifetime; port its checkpoints rather than
  its counters.
- Keep `@vizij/render`'s loaders/exporter/bundle types alive for the authoring
  app until the Rust layer owns bundle/pose/graph (STUDIO-239's stated
  direction); only the drawing half is replaced by this project.

## Open questions

- Does the three.js `GLTFExporter` serialise the generated Circle/Plane meshes
  and `Line2` strokes of ellipse/rectangle into a GLB at all? Unverified (no
  fixture, not tested); relevant only if these kinds are kept.
- Does Bevy 0.17's glTF loader accept `KHR_draco_mesh_compression`? No face
  fixture uses Draco; Studio's `robot-draco.glb` (a robot, not a face) does.
- Can one Bevy wasm app render into several page canvases, and can a Bevy wasm
  app be torn down and re-created in-page (React unmount/remount) without a
  page reload? Both decide whether "N faces per page" is N instances.
- Which embedding does Studio want for the face-on-a-screen (§D.3 a-d)?
- Does arora's `Value` carry HSL colours (the web accepts `RawHSL` for fill
  and shape colour); `as_rgb` in `view.rs:569-573` handles rgba and xyz only.
- What did the memory investigation conclude? The harness exists; no result is
  recorded in vizij-web.
