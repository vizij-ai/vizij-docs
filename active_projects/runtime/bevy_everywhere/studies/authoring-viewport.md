# The authoring viewport is a derived three.js copy of the JS world model, and export walks that copy
<!-- tags: family=project; type=reference; project_status=proposal; topics=authoring,render,runtime-react,viewport,picking,export,bevy,wasm -->
> **Last updated:** 2026-09-16
> **Related documents:** [Central plan](../bevy_everywhere-plan.md)

**Scope.** This is vizij-web's authoring app over `@vizij/render` and
`@vizij/runtime-react`. Semio Studio's `packages/vizij` is a divergent origin
of the same renderer with its own contexts (a per-namespace `VizijContext`
over the scene store) and is covered by [studio-consumers](studio-consumers.md)
10–11, not here. The findings separate the **rendering** side (the drawn copy,
picking, selection, camera fit) from the **device** side (graph registration,
staged inputs, programs), which reaches the face through the runtime and is
untouched by the viewport swap.

## Findings

1. **The viewport draws through `@vizij/runtime-react`'s `VizijRuntimeFace`, a thin wrapper over `@vizij/render`'s `Vizij` (a react-three-fiber `Canvas`).** vizij-web/apps/vizij-authoring/src/components/app/Viewer.tsx:736-744; vizij-web/packages/@vizij/runtime-react/src/VizijRuntimeFace.tsx:6-23; vizij-web/packages/@vizij/render/src/vizij.tsx:47-110. The same pair is used by the reference face (RuntimeFaceFrame.tsx:69) and the empty-state demo (emptyStateDemo/EmptyStateDemo.tsx:13-27). Nothing in the app uses `@vizij/render`'s `Vizij` directly.
2. **Two `@vizij/render` zustand stores exist at edit time.** The app-level store created in `main.tsx:10-15` holds the authoring world model (`world`, `animatables`, `values`, `elementSelection`); every `VizijRuntimeProvider` creates its own second store (VizijRuntimeProvider.tsx:1298-1301) and the `Canvas` draws only from that one. The provider's store is seeded from the app store's world through a `kind: "world"` asset (apps/vizij-authoring/src/utils/runtimeBundle.ts:29-48, App.tsx:4178-4187) and `addWorldElements(world, animatables, replace=true)` (VizijRuntimeProvider.tsx:2287).
3. **Source of truth is the app-level render store plus the authoring stores; the drawn copy is derived.** `useRigController` mirrors the app store's `world`/`animatables`/`values` into `graphRuntimeStore` and publishes the app store's `setState` as `setStoreState` (useRigController.ts:1303-1321; graphRuntimeStore.tsx:31-33,56). Device outputs flow one way: arora device step → `applyEngineChanges` → runtime store `setValues` (VizijRuntimeProvider.tsx:2640-2739) → mesh mutation through per-feature subscriptions (packages/@vizij/render/src/hooks/use-features.ts:24-80). Only selection (finding 5) and export bodies (finding 12) flow back from the runtime store.
4. **World edits reach the running face by full reload; animatable edits by graph re-registration; input edits by `setInput`.** Structural edits (`sceneEditing.ts` reparent :578, duplicate :757, delete :995, materials :1065-1217; `featureMutations.ts:44-162`; rename useRigController.ts:3942-4041; `createMaterial` useSceneComposer.ts:758-829) call `setStoreState` on the app store, which produces a new `world` identity; the provider's update plan keys the GLB on `JSON.stringify(glb.world)` (runtime-react/src/updatePolicy.ts:77-93,154-202) and reloads the assets (a new runtime store world, a new device world). Animatable descriptor and default edits (featureMutations.ts:11-42; useSceneComposer.ts:228-281) leave `world` untouched, so no reload; they reach the device because `animatables` is an input of the rig graph compile (useRigController.ts:3308-3333) whose spec `RuntimeGraphBridge` re-registers with `setGraphBundle(…, { tier: "graphs" })` (Viewer.tsx:356-395). Input values are staged through `stageRuntimeInput` (Viewer.tsx:181-231; rigController/runtimeInputStaging.ts:62). Pose config and pose graph ride the same graph bridge; the motion-graph editor is published as a runtime program by `MotionGraphDriverBridge` (Viewer.tsx:465-477).
5. **Picking is implemented in `@vizij/render` with r3f pointer events and lands in the runtime store's `elementSelection`.** `onClick` on shape/ellipse/rectangle meshes (renderables/shape.tsx:320-323, ellipse.tsx:307-309, rectangle.tsx:306-308) calls `store.onElementClick` (store.ts:53-115), which stacks every intersection's `userData.selection` (shape.tsx:81-94) and toggles additively on the meta key. Groups carry no click handler (group.tsx:134-140). `Viewer`'s `RuntimeSelectionBridge` (Viewer.tsx:89-179) forwards the runtime selection to the app (`onSelectScene` → `useUnifiedSelection` → app store `elementSelection`, hooks/useUnifiedSelection.ts:42-101) and mirrors app-side selection back into the runtime store. `onPointerMissed` clears the app selection (Viewer.tsx:742-744; useRigController.ts:4200-4213).
6. **Hover is tracked but never used.** The renderables write `hoveredElement` (shape.tsx:292-306; group.tsx:112-131; ellipse/rectangle) and no consumer exists outside the store definition (grep across apps and packages). No hover highlight is drawn.
7. **Selection glow is a render-package effect on mounted three.js objects, toggled from the View menu.** `SelectionGlowEffect` builds an `EdgesGeometry` outline for each selected entry and copies the source object's world transform every frame (effects/selection-glow-effect.tsx:36-139); the app toggles it through `showSelectionGlow` (App.tsx:640,4168; AppMenuBar.tsx:523; Viewer.tsx:741).
8. **Absent from the authoring viewport:** drag or gizmo transforms, a debug grid, camera controls (fit is automatic to the root group's `rootBounds`, vizij.tsx:193-233, with no zoom/pan UI), screenshots or thumbnails (the only screenshot code is an untracked scratch Playwright harness, `e2e/refcap.workflow.pw.ts:22-24`, `git status`: `??`), a background setting (vizij.tsx:142 is commented out; the panel colour is CSS), and element visibility (no `visible` feature in the world types). The safe-area overlay exists in render (vizij.tsx:255-280) but the app always passes `showSafeArea={false}` (Viewer.tsx:740; RuntimeFaceFrame.tsx:69).
9. **`@vizij/render`'s own world-mutation actions are unused by the app.** `createGroup`, `setChildren`, `setParent`, `createAnimatable`, `setMaterial`, `setGeometry`, `setStaticFeature` (store.ts:143-336; actions/create-new-element.ts) have no caller in `apps/vizij-authoring/src`; the app mutates the world itself with pure functions plus `setStoreState`.
10. **The reference face is a second isolated face, not an overlay.** `ReferenceFaceRuntime` mounts its own `VizijRuntimeProvider` (own device, own store, namespace `refface`, URL-kind GLB with `aggressiveImport`; ReferenceFaceRuntime.tsx:228-239,303-318) in a resizable split panel next to the main viewer (App.tsx:4523-4538). It exchanges only input values and catalog metadata with the main face (`onStandardInputChange`, hooks/useReferenceFaceState.ts:425-443; referenceFace/mapping.ts). Its frame has no selection wiring.
11. **Import is three.js all the way down.** `loadGLTFFromBlobWithBundle` (render/src/functions/load-gltf.ts:311-377) runs `GLTFLoader` + `DRACOLoader` (:247-253); `traverseThree` (gltf-loading/traverse-three.ts:22-140) builds world entries from each node's `extensions.RobotData`, taking `geometry` from the three `Mesh` (:74) and a `refs` map per namespace; without RobotData and with `aggressiveImport`, `importScene`/`importGroup`/`importMesh` generate world entries and animatables from arbitrary meshes (transforms, material colour/opacity and PBR fields, morph targets: import-mesh.ts:233-272, import-geometry.ts:30-77) and derive `rootBounds` from the bounding box (:320-358). `extractVizijBundle` reads `VIZIJ_bundle` from node, scene or root extensions (vizij-bundle.ts:104-119). The app loader resets the app store, calls `addWorldElements` and keeps the parsed three `scene` as `exportSceneRoot` (hooks/useVizijAssetLoader.ts:825-830,954,985).
12. **Export walks mounted three.js objects, not the world model.** `getExportableBodies` returns `Group` refs from the store (store.ts:116-142); the app takes them from the runtime store through `RuntimeExportBodyBridge` (Viewer.tsx:236-300) and `ExportDialog` (:126-166,222-223), falling back to the load-time `exportSceneRoot`. `applyDefaultsToRobotData` rewrites `userData.gltfExtensions.RobotData` on those objects (utils/robotData.ts:8-58) — RobotData is put there at render time by each renderable (shape.tsx:86-94, group.tsx:54-58 via `createStoredRenderable`, functions/create-stored-data.ts:8-18, which omits `refs` and `geometry`). `buildVizijBundle` assembles the bundle in JS (hooks/useVizijExport.ts:1466), then render's `exportScene` (functions/export.ts:274-369) clones the subtree, grafts `VIZIJ_bundle` onto the root's userData (vizij-bundle.ts:121-183), runs three-stdlib `GLTFExporter` with `includeCustomExtensions`, and rewrites the GLB JSON to unwrap the wrapper node (:150-202). Ellipse and rectangle geometry exists only at render time (drei `<Circle args={[1, 100]}>`, `<Plane>`: ellipse.tsx:301-304, rectangle.tsx:300) and is exported as whatever mesh the exporter meets.
13. **The Rust tools cover the bundle and Value forms, not the scene.** `vizij-glb-migrate` parses and rewrites the GLB JSON chunk (crates/tools/vizij-glb-migrate/src/glb.rs) and normalizes Value payloads in `VIZIJ_bundle` graphs and `RobotData.features.*.value.default` (migrate.rs:69-207). `vizij-bundle` reads/writes `VIZIJ_bundle` (unpack, pack, add-graph, add-standard, add-profile), lists RobotData feature names per node in `inspect` (lib.rs:294-345) and validates profile coverage. Neither touches meshes, generates RobotData from a plain GLB, exports a scene, or validates RobotData structure beyond Value forms. The Bevy `vizij` crate reads RobotData + `VIZIJ_bundle` from the GLB (crates/vizij/src/meta.rs:57-67,137), loads it with bevy's glTF loader (view.rs:131), fits an orthographic camera to the authored bounds (view.rs:203-215), applies pose to `StandardMaterial` colour/alpha, `MorphWeights` and transforms (view.rs:342-531), and has a `--snapshot` PNG (main.rs:5); it has no picking, selection, hover, or ellipse/rectangle primitives (grep).
14. **No test touches canvas pixels or picking.** e2e specs assert DOM only: `main-viewer`, `main-runtime-view`, `main-runtime-ready-flag`, `main-runtime-status` text, `reference-face-runtime` (e2e/helpers.ts:19-45,118-135); `runtime-sessions` clicks DOM buttons through `evaluate`; `memory-investigation` reads `window.__vizijMemoryDebug`; `rig-state-gate` reads `localStorage`. `Viewer.test.tsx` mocks `@vizij/render` and `@vizij/runtime-react` entirely (:44-90) and asserts bridge calls (`setInput`, `setGraphBundle`, `stopAnimation`, reset batches; :168-864). `useSceneComposer.test.tsx` and `sceneEditing.test.ts` assert store/world state. `packages/@vizij/render` has no tests.
15. **The reload key serializes three.js objects once refs are mounted.** `JSON.stringify` of a world entry whose `refs.default.current` is a mounted `Mesh` grows from 496 to 1190 characters and changes value (stand-alone check, `spikes/authoring-viewport/world-signature.out`). Whether the app store's refs are ever populated (the Canvas mounts the runtime store's copy) is unverified; the exposure is the signature's dependence on renderer objects at all.

## Questions answered

**Q1 — Every UI↔scene interaction and who implements it.** See the table in Evidence. Picking, hover, glow, safe area, camera fit, and the three.js world mutation actions are `@vizij/render`; the device→store bridge, the world seed, and `VizijRuntimeFace` are `@vizij/runtime-react`; selection forwarding, world editing, export body capture, and all panels are the authoring app. Drag/gizmo, grid, camera controls, screenshots, background, visibility do not exist (finding 8).

**Q2 — Editing data flow and source of truth.** The world model lives in the app-level `@vizij/render` store (finding 2); the drawn face is a second store owned by the provider, re-seeded on world change (finding 4). Rig/pose edits reach the device through graph re-registration, input edits through `setInput`, world edits through a full asset reload; the runtime store is written only by the device bridge, and nothing flows back except selection and export bodies (findings 3-5, 12). The editor renders exclusively through `VizijRuntimeFace` (finding 1); the reference face is a second such runtime, not an overlay (finding 10).

**Q3 — Import/export versus the Rust tools.** JS owns GLB parsing into the world model (RobotData path and the aggressive import that synthesizes RobotData-equivalent entries from plain meshes), primitive geometry generation, RobotData writing at render time, and the GLTFExporter-based export with bundle grafting and GLB post-processing (findings 11-12). The Rust tools own bundle read/write/graft/validate and Value normalization of both bundle and RobotData defaults (finding 13). Only JS does: mesh/geometry handling, RobotData synthesis, primitive geometry, scene export, RobotData structural checks (via TypeScript assertions in traverse-three.ts:270-318).

**Q4 — Tests.** Finding 14: DOM readiness and bridge-call assertions only; no pixel, picking, or glow coverage anywhere.

**Q5 — Required view API for a Bevy wasm canvas.** See Evidence, "Bevy view API". About 8 events out, 12 commands in, and one state-sync decision; the hardest item is export, because today's GLB is produced from the three.js scene graph rather than from the world model.

## Evidence

### UI↔scene interactions (Q1)

| Interaction | Implemented in | Boundary crossing (file:line) |
| --- | --- | --- |
| Click picking (single, meta-additive, intersection stack) | render | shape.tsx:320-323, ellipse.tsx:307-309, rectangle.tsx:306-308 → store.ts:53-115 (`elementSelection`) → Viewer.tsx:89-179 → App `onSelectScene` (App.tsx:4495) |
| Clear on empty click | render → app | `onPointerMissed` Viewer.tsx:742-744 → useRigController.ts:4200-4213 |
| App-side selection (hierarchy, inspector) mirrored into the canvas | app → render store | useUnifiedSelection.ts:42-101 writes the app store; Viewer.tsx:132-176 writes the runtime store |
| Hover | render only | shape.tsx:292-306, group.tsx:112-131 → `hoveredElement`; no consumer |
| Selection glow | render, toggled by app | selection-glow-effect.tsx:36-139; Viewer.tsx:741; AppMenuBar.tsx:523 |
| Safe area | render; app always off | vizij.tsx:157,255-280; Viewer.tsx:740 |
| Camera fit (orthographic, auto to `rootBounds`) | render | vizij.tsx:143-148,193-233 — the camera is inferred from the authored rect; [VIZ-130](https://linear.app/semio-ai/issue/VIZ-130) proposes the rect as an animatable with `rootBounds` as its default, which the view's fit-over-a-rect keeps possible |
| Background | none (CSS panel) | vizij.tsx:142 commented |
| Drag/gizmo, grid, zoom/pan, screenshots, visibility | none | finding 8 |
| Reference face | app, second runtime | ReferenceFaceRuntime.tsx:303-318 |
| Element create/duplicate/delete/reparent | app (pure functions + `setStoreState`) | sceneEditing.ts:578,757,995; useSceneComposer.ts:477-500 |
| Static feature / material / animatable default edits | app → app store | featureMutations.ts:44-162; useSceneComposer.ts:228-281,758-829 |
| Rename | app → app store | useRigController.ts:3942-4041 |
| Orientation correction at import | app → device input | App.tsx:3265-3277 stages `/scene/rotation/*` inputs |
| Device outputs → meshes | runtime-react → render store → r3f | VizijRuntimeProvider.tsx:2640-2739; use-features.ts:24-80 |
| Export bodies | render store → app | store.ts:116-142; Viewer.tsx:236-300; ExportDialog.tsx:126-166 |

### Stores and flows (Q2)

| Store | Created | Holds | Written by | Read by |
| --- | --- | --- | --- | --- |
| App `@vizij/render` store | main.tsx:10-15 | world, animatables, values, elementSelection | loader (useVizijAssetLoader.ts:954), scene edits, selection | rig compile (useRigController.ts:1303-1313), runtime bundle (App.tsx:4178-4187), panels |
| Runtime `@vizij/render` store (main) | VizijRuntimeProvider.tsx:1298-1301 | copy of world + live values | provider seed (:2287), device bridge (:2737), canvas clicks | `Canvas`, selection bridge, export bridge |
| Runtime store (reference face, demo) | same, per provider | own face | own device | own `Canvas` |
| graphRuntimeStore | RigControllerProvider.tsx:77-81 | mirror of app store + graph specs + `setStoreState`, `stageRuntimeInput` | useRigController, Viewer bridges | panels, `useSceneComposer` |

Reload semantics: `resolveRuntimeUpdatePlan` compares `glbSignature` (`world:` + `JSON.stringify(world)`), rig/pose/animation/program signatures (updatePolicy.ts:77-202); `glbChanged` ⇒ `reloadAssets` (provider :2225-2310), `controllersChanged` ⇒ re-register graphs. Animatable defaults are not part of the GLB signature, so their edits are only visible through the rig graph (finding 4). Stand-alone check of the signature's content: `spikes/authoring-viewport/world-signature.mjs` and `.out`.

### Import/export pipeline versus Rust tools (Q3)

| Step | JS (`@vizij/render`, authoring) | Rust (`vizij-bundle`, `vizij-glb-migrate`, `vizij` crate) |
| --- | --- | --- |
| Parse GLB, read `VIZIJ_bundle` | load-gltf.ts:213-245; vizij-bundle.ts:104-119 | glb.rs; vizij-bundle lib.rs:30-45; meta.rs:57-67 |
| Read `RobotData` into a world/face model | traverse-three.ts:43-121 (typed, asserts :270-318) | meta.rs:137 (feature names, defaults); inspect lib.rs:294-345 |
| Synthesize RobotData-like entries from a plain GLB (`aggressiveImport`) | import-scene/group/mesh/geometry | none |
| Primitive geometry (ellipse, rectangle) | drei at render time (ellipse.tsx:301, rectangle.tsx:300) | none |
| Write RobotData | at render time into `userData` (shape.tsx:86-94; create-stored-data.ts) + export-time defaults (robotData.ts) | none (migrate only normalizes existing Values, migrate.rs:170-207) |
| Assemble `VIZIJ_bundle` | useVizijExport.ts:1466 | pack / add-graph / add-standard / add-profile |
| Write GLB | GLTFExporter + JSON unwrap (export.ts:274-369) | glb.rs re-serialization of the JSON chunk only (binary preserved) |
| Validate | graph normalization + bundle audits (useVizijExport.ts:1010-1058) | coverage/profile validation; `--check` Value canonicity |
| Rendered snapshot | none | `--snapshot` (main.rs:5) |

### Tests (Q4)

| Test | Asserts |
| --- | --- |
| e2e helpers `waitForMainFaceReady` (:32-45) | testids visible, status text contains `ready`; DOM only |
| e2e `reference-face.smoke`, `runtime-sessions`, `memory-investigation`, `rig-state-gate` | DOM state, button clicks via `evaluate`, `window.__vizijMemoryDebug`, `localStorage` |
| `refcap.workflow.pw.ts` (untracked) | writes element screenshots to a scratch folder; no assertion |
| `Viewer.test.tsx` | bridge spies with render and runtime-react mocked (:44-90) |
| `ReferenceFaceRuntime.test.tsx`, `RuntimeFaceControlsOverlay.test.tsx` | input routing and overlay DOM with the frame mocked |
| `useSceneComposer.test.tsx`, `sceneEditing.test.ts` | store/world results of edits |
| `packages/@vizij/render` | no tests |

### Bevy view API the editor requires (Q5)

State-sync model: the JS world model stays the source of truth (it already is; finding 3) and the view is a derived scene, as the runtime store is today. Two options exist for the derivation: (A) push the whole world on every structural edit and let the view rebuild (today's reload semantics, finding 4); (B) push a scene description once and apply deltas. (A) is what the editor does now and is enough for parity; (B) is an optimization. In both, the view owns the three.js-equivalent objects and the JS side never touches them.

Events out (view → editor):

| Event | Payload | Replaces |
| --- | --- | --- |
| `picked` | ordered hit stack of `{ id, namespace, type }`, modifier keys | store.onElementClick (store.ts:53-115) |
| `pointerMissed` | none | vizij.tsx:72, Viewer.tsx:742 |
| `hover` | `{ id } \| null` | `hoveredElement` (unused today; optional) |
| `pointerMove` | canvas coords, world coords | none today (demo mouse gaze reads DOM, not scene) |
| `ready` / `loading` / `error` | status | `useVizijRuntime().ready/loading/error` |
| `rootBounds` | center, size | `Group.rootBounds` read by the camera fit |
| `exportGlb` result | bytes | finding 12 (see below) |

Commands in (editor → view):

| Command | Payload | Replaces |
| --- | --- | --- |
| `loadWorld` | world + animatables (+ bundle) | `addWorldElements(…, replace)` (finding 2) |
| `applyWorldEdit` (optional delta form) | add/remove entry, reparent, feature static/animated switch, material kind, morph binding | finding 4's reload path |
| `setValues` | batch of `{ id, namespace, value }` | store.setValues (VizijRuntimeProvider.tsx:2737) — or none, if the device drives the view directly |
| `setSelection` | list of `{ id, namespace, type }` | Viewer.tsx:132-176 |
| `setSelectionGlow` | bool (+ colour) | Viewer.tsx:741 |
| `setSafeArea` | bool | vizij.tsx:157 |
| `fitCamera` | none / explicit bounds | vizij.tsx:193-233 |
| `setBackground` | colour | none today; ros-viz/Bevy has `ClearColor` (view.rs:161) |
| `resize` | css size, DPR | r3f `size` |
| `snapshot` | none → PNG bytes | none today; Bevy has `--snapshot` |
| `exportGlb` | world + animatables + bundle → GLB bytes | finding 12 |
| `dispose` | none | canvas unmount (memoryInvestigation counters) |

Surface size: roughly 8 events and 12 commands; the world/animatable/value types already exist in `@vizij/render` and `@vizij/utils`. The selection, glow, safe-area, fit, background and snapshot items are small (Bevy already has an orthographic fit and a snapshot). The hardest item is `exportGlb`: the JS export depends on the mounted three.js scene graph (mesh geometry, drei-generated primitives, `userData` RobotData written by the renderables, GLTFExporter, wrapper-node rewrite). With a Bevy view, either the view exports its own scene (Rust GLB writer, RobotData serialization, primitive meshes) or the editor keeps a headless three.js instance only for export; the world model today does not hold enough (no geometry for primitives, `geometry` is a three `BufferGeometry` object, finding 11) to write a GLB from data alone. Second hardest is picking parity: the intersection stack with `userData.selection` per mesh, group-versus-shape hit precedence and meta-additive toggling (store.ts:53-115) must be reproduced in Bevy picking and reach JS as an ordered stack.

## Implications for the target picture

- The editor already treats the drawn face as derived state re-seeded from a JS world model; a Bevy wasm view slots in at exactly the `VizijRuntimeFace` seam (finding 1-4) with the world push and the selection bridge as its contract. The panels do not need to change.
- The device→view path can shorten: today the device writes into a JS store that r3f subscribes to; a Bevy view hosting the device (as `crates/vizij` does natively) needs no JS `setValues` at all, but then the editor's `transformOutputWrite` lock filter (Viewer.tsx:598-609) and the pose-control bridge (VizijRuntimeProvider.tsx:2678-2714) must move into the view or the device.
- Export cannot be "the same view contract" as drawing; it needs its own owner (Rust GLB writer in the view, or a retained headless three.js exporter). Until decided, `@vizij/render`'s loader and exporter remain required by the authoring app even if it stops drawing with three.js.
- The reference face and the empty-state demo are additional view instances; the contract must support several canvases on one page, each with its own device and world (finding 10, 12).
- `vizij-bundle` and `vizij-glb-migrate` already cover the bundle half of the pipeline in Rust; the scene half (RobotData synthesis, primitives, GLB writing) is JS-only today.

## Implications for the plan

- Add a work item "Bevy view contract for editors" with the event/command table above; picking-stack parity and `exportGlb` ownership are its two design decisions.
- Keep `@vizij/render`'s `load-gltf`/`traverse-three`/`export` alive as a headless library until a Rust exporter exists; retiring the package's React renderer and retiring its loader/exporter are separate steps.
- Before replacing the viewport, add the missing tests: a picking e2e (click a mesh, assert the inspector target) and a glow/pixel check, since none exists to protect parity (finding 14).
- Reconsider the reload key: the provider keys reloads on a JSON dump of the world that includes renderer objects (finding 15); a Bevy view push should key on world data only.
- The reference face's `aggressiveImport` path (plain GLB → synthesized RobotData) is a JS-only capability the Bevy view must either receive as a pre-built world or reimplement.

## Open questions

- Should the Bevy view export the GLB (Rust RobotData + primitive meshes + glTF writer), or does the authoring app keep a headless three.js exporter fed from the world model? The answer sets whether `@vizij/render`'s functions survive.
- Does the authoring app want the view to own the device (as native `vizij` does) or keep the device in JS and push values? Owning the device removes the JS value bridge but moves output-lock filtering and pose-control recycling into Rust.
- Are ellipse/rectangle primitives still required, or can authoring normalize them to meshes at import so the Bevy view needs no primitive generator?
- Do hover and pointer-move events need to exist in the contract, given no current consumer, or can they be omitted until the demo's mouse-gaze needs scene coordinates?
