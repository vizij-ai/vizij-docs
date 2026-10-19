# The authoring GLB export runs from the JS world model with no renderer: a headless three.js graph reproduces the file
<!-- tags: family=project; type=reference; project_status=proposal; topics=authoring,export,render,three.js,glb,robotdata,bundle,rust,headless -->
> **Last updated:** 2026-09-28
> **Related documents:** [Central plan](../bevy_everywhere-plan.md) · [Authoring viewport](authoring-viewport.md) · [Web render anatomy](web-render-anatomy.md)

Raw outputs:
[vizij-rs `spikes/bevy-everywhere/headless-export/`](https://github.com/vizij-ai/vizij-rs/tree/spikes/bevy-everywhere/spikes/bevy-everywhere/headless-export)
(branch `spikes/bevy-everywhere`) — `headless-export.mjs` (the spike),
`register.mjs` + `cjs-named-exports-loader.mjs` (loaders), `*_report.json`,
`trs-vs-defaults.mjs`, `glb-inventory-facts.txt`, `quori-census.json`,
`node-globals.txt`, `app-render-imports.txt`. The run logs and the exported GLBs
are not kept: the reports and the figures quoted on this page are the record. Node v22.13.0, three 0.170.0, three-stdlib 2.36.1, taken
from `vizij-web/packages/@vizij/render/node_modules` (vizij-web untouched).

## Findings

1. **A scene graph rebuilt from the world model with plain three.js objects, run
   through the unmodified `applyDefaultsToRobotData` and `exportScene`, reproduces
   the shipped file.** Input: `world`, `animatables`, `bundle` from
   `loadGLTFFromBlobWithBundle`; the graph mirrors what `group.tsx:54-58,134-140`
   and `shape.tsx:86-94,306-322` mount, minus React and r3f events (spike
   `buildHeadless`, ~120 lines). Quori_Current_Extended: 18 nodes in the same
   order, 15 meshes, 15 materials, 118 accessors and bufferViews, same
   `extensionsUsed` and scene; `RobotData` deep-equal on 18/18 nodes;
   `VIZIJ_bundle` string-equal (3,626,348 chars); materials 0 diffs;
   `extras.targetNames` equal; BIN chunk 2,808,256 bytes on both sides.
   Hugo_Current_Extended (21 nodes, `KHR_materials_unlit`) and Toasty_Current
   (49 nodes, 16 groups, 33 morph meshes) likewise (`*_report.json`).
2. **Round trip holds.** Reloading each headless GLB through the same loader gives
   0 diffs in world (refs and geometry objects excluded, geometry attribute sets
   compared), animatables, bundle, and `rootBounds` (`*_report.json`,
   `roundTrip`).
3. **The only residual diffs are node TRS and mesh `weights`, and they expose an
   inconsistency in the shipped files, not in the headless path.** The mounted
   meshes track the runtime store's values written by the device
   (`use-features.ts:56-73`), while `applyDefaultsToRobotData` rewrites defaults
   from the app store's `animatables` plus user-staged `values`
   (`useVizijExport.ts:713-729,852`) — two stores. So the files carry the runtime
   pose in node TRS/weights and the authored values in `RobotData`:
   Quori_Current_Extended 11/18 nodes disagree with their own defaults (eyes,
   lids, mouth morphs), Hugo_Current 6/21, Hugo_Current_Extended 3/21,
   Toasty_Current 2/49 — including Toasty's root `Scene` rotated 90° about X in
   the file (`[0.707,0,0,0.707]`) against a `(0,0,0)` default; Quori_Current 0/18
   (`trs-vs-defaults.mjs`). A headless export writes the defaults as TRS, so the
   two agree by construction.
4. **Nothing in the encoding needs a renderer or the DOM.** three-stdlib's
   `GLTFExporter` reaches `document.createElement("canvas")`/`OffscreenCanvas`
   only in `getCanvas()` for texture images (`GLTFExporter.js:385-388,897-934`)
   and for compressed-texture `decompress` (which needs a `WebGLRenderer`); the
   binary path uses `Blob`, `TextEncoder`, `blob.arrayBuffer()`, `btoa`
   (`:9-13,467-496`), all present in Node 22 where `OffscreenCanvas`, `ImageData`
   and `FileReader` are undefined (`node-globals.txt`). `GLTFLoader` builds a
   `TextureLoader` (`GLTFLoader.js:1382-1390`) it only uses for textures; GLB
   buffers are embedded, nothing is fetched; the `DRACOLoader`
   (`load-gltf.ts:247-253`) is constructed and never used. No face fixture hits
   any of this: 18/18 GLBs in vizij-web have 0 images, 0 textures, no Draco
   (`glb-inventory-facts.txt`).
5. **The DOM touchpoints are delivery and timing, not encoding.** `exportScene`'s
   `triggerBlobDownload` (`export.ts:28-39`: anchor element, `URL.createObjectURL`);
   `load-gltf.ts` prefers a blob URL plus `loadAsync` (fetch) whenever
   `URL.createObjectURL` exists (`:147-162,322-336`) and only otherwise calls
   `GLTFLoader.parse(arrayBuffer)` (`:169-202,343-376`) — Node 22 has
   `createObjectURL`, so headless use must take the parse branch explicitly;
   `load-gltf-blob.ts` uses `FileReader` (`:25`) and has no caller;
   `traverse-three.ts` imports `createRef` from `react` to seed `refs`
   (`:1,60-64,75-78`), the loader's only React dependency; the app hook waits up
   to 13 animation frames for mounted refs (`useVizijExport.ts:731-790`) and reads
   `localStorage` for the speech config.
6. **The app's fallback body is not equivalent.** Exporting the loader's three
   scene (`exportSceneRoot`, kept by `useVizijAssetLoader.ts:825,985`) adds a
   wrapper node (19 for 18), moves `VIZIJ_bundle` onto that wrapper and off the
   `RobotData` root, and writes loader-added `extras.name` and
   `extras.targetNames` on every node (`quori_report.json`, "fallback-vs-source").
7. **`extras.selection` in every shipped face is picking metadata.**
   `shape.tsx:86-94` stores `{id, namespace, type}` in `userData.selection` for
   `onElementClick`; `GLTFExporter` serializes leftover userData as `extras`.
   Blender exports lack it; no reader consumes it (grep across vizij-web,
   semio_studio, vizij-rs, ros-viz-rs — the last drops glTF extras outright,
   `ros-viz-rs/src/scene.rs:499`); a headless exporter can drop it.
8. **`aggressiveImport` runs headlessly too.** Toasty_Latest_Blender_Export (48
   nodes, no `RobotData`) → 49 world entries (a synthesized root), 298
   animatables, exported 291,464 bytes with `RobotData` on 49 nodes, reload 0
   diffs, 410 ms total; `deriveRootBounds` is `Box3.setFromObject`
   (`traverse-three.ts:320-358`), pure.
9. **Cost in Node**, Quori 6.5 MB: load 0.6–1.7 s, graph build 5–100 ms, export
   0.6–1.0 s, RSS ≤ 273 MB (`*_report.json`, `timingsMs`, `memoryMB`).
10. **Defaults are arora Values, and the renderables never apply them.** Quori's
    `RobotData` defaults: 36 `struct` vector3, 18 `struct` euler, 15 `struct`
    rgb, 44 `{f32}`, 0 plain (`quori-census.json`). `@vizij/render`'s guards test
    `.x/.y/.z` (`utils/src/animated-values.ts:227-263`), so a struct default never
    moves a mounted mesh — the device's first writes do. A headless builder must
    decode them (as `unwrapStructComponent`,
    `utils/src/rig/animatable-metadata.ts:91-110`, and runtime-react's
    `valueJSONToRaw` do); the spike does.
11. **Two headless-loading hazards.** `three` must resolve to one real path
    (pnpm's `.pnpm/three@0.170.0`) or `instanceof THREE.Scene` in
    `export.ts:302` fails; and `create-stored-data.ts`'s
    `import { omit } from "lodash"` does not load under Node ESM (UMD build, no
    named exports) — the package's own `node --test` loader
    (`tests/node-ts-loader.mjs`) cannot import that file either; the spike shims
    it (`cjs-named-exports-loader.mjs`).
12. **The app wiring already accepts a headless root.** Bodies enter export as
    `unknown` duck-typed on `traverse` (`useVizijExport.ts:88-100`) and
    `exportableBodies[0]` goes to `exportScene` (`:1070`). `ExportDialog` reads
    the app-level store (`useVizijStore((s) => s.world)`, `ExportDialog.tsx:125`);
    it is mounted through `AppWizards` outside `Viewer` (`App.tsx:4874-4879`),
    and the runtime provider lives only in `Viewer.tsx:685-747`. A root built
    from that store passes `applyDefaultsToRobotData` and `exportScene` with no
    signature change — that is what the spike ran.
13. **Rust today writes only the bundle.** `vizij-bundle` sets or grafts the
    `VIZIJ_bundle` object in the JSON chunk (`lib.rs:70-110`) over
    `Glb::to_bytes` (`glb.rs:113-134`: JSON chunk re-serialized, BIN chunk
    verbatim); `vizij-glb-migrate` normalizes Value payloads (`migrate.rs:1-20`);
    `meta.rs` reads a five-feature projection of `RobotData` (`:73-112,137-174`);
    `vizij-arora-host::Bundle::from_gltf_json` reads the bundle (`lib.rs:86`).
    Nothing writes `RobotData`, node TRS, materials or meshes. `gltf`/`gltf-json`
    1.4.1 are in vizij-rs's lock through `bevy_gltf`; `gltf_json::Root` is
    `Serialize` with `to_string` (`root.rs:223-228`), a typed JSON-chunk writer
    off the shelf.
14. **Every export needs the source GLB's geometry; the routes differ in how they
    carry it.** The world holds three `BufferGeometry` objects, and the three.js
    route re-encodes every accessor on each export (identical 2,808,256 bytes) —
    the reason it needs geometry objects at all. The editor's structural edits
    (rename, reparent, duplicate, delete, material kind, static/animated switch,
    defaults, labels, bundle) never create geometry; new geometry enters only
    through `aggressiveImport` of a Blender GLB (whose meshes already exist in
    that file) and through ellipse/rectangle primitives (out of contract). So a
    Rust exporter is JSON-chunk surgery over the source container plus a schema:
    the `meshes/accessors/bufferViews` and BIN chunk stay verbatim and are
    referenced by index (duplicate = two nodes on one mesh; delete = an
    unreferenced mesh, compacted or not).

## Questions answered

**T1 — Can the export run from the world model without WebGL or mounted r3f
objects, with `RobotData` and `VIZIJ_bundle` round-tripping?** Yes (findings 1,
2, 8). Exact diffs against the source, all faces: node count, order, mesh and
material counts, `RobotData` per node, `VIZIJ_bundle`, materials, morph target
names, `extras` — identical. Node TRS on 9/18 (Quori), 3/21 (Hugo), 2/49
(Toasty) nodes and 18 Quori morph weights differ, exactly the nodes whose file
TRS/weights already disagree with their own `RobotData` defaults (finding 3).

**T2 — What needs a renderer or the DOM, and do the faces hit it?** Only texture
image encoding and compressed-texture decompression in `GLTFExporter`, texture
loading in `GLTFLoader`, and Draco decoding need a canvas, renderer, or worker;
no face fixture has an image, texture, or Draco (finding 4). The remaining DOM
uses are the download anchor, the blob-URL loading branch, `FileReader` in an
uncalled helper, `react.createRef` in the loader, animation-frame waits and
`localStorage` in the app hook (finding 5).

**T3 — What becomes the headless library, what is deleted, can the app be fed a
headless root?** See Evidence: ~3,000 lines kept (import 1,972, export 369,
bundle 183, stored-data 44, types ≈ 500, slimmed store), ~1,950 deleted
(canvas, four renderables, glow, feature subscriptions, memory counters,
`load-gltf-blob`, store refs/picking/hover), ~120 lines added (graph builder,
material naming moved out of `shape.tsx`), `exportScene` returning bytes.
`ExportDialog`/`useVizijExport` take a headless root as-is (finding 12);
`RuntimeExportBodyBridge`, the `runtimeExportBodies` state, `exportSceneRoot`,
`resolveExportBodiesFromWorld` and the frame-wait loop go.

**T4 — Rust route versus this one.** `vizij-bundle` covers the bundle half; a
Rust `RobotData` + GLB writer adds a complete `RobotData` schema, TRS from
decoded defaults, material factors from features, and index-level node/mesh
surgery on the source container (findings 13, 14). Sized in words: comparable to
`migrate.rs` (497 lines) plus `meta.rs` (229); an accessor compactor is the only
piece without precedent, and it is optional. Its input is the source GLB plus
the world/animatables/bundle JSON, the same information the headless three.js
route holds as objects.

## Evidence

### Runs (`headless-export.mjs`, headless output versus source)

| Face | nodes / meshes / materials / accessors | RobotData diffs | bundle | materials | TRS-diff nodes (file ≠ own defaults) | round trip | load / build / export ms |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Quori_Current_Extended | 18/15/15/118 → same | 0/18 | equal | 0 | 9 (+18 weights) (11/18) | 0/0/0 | 590–1650 / 5–99 / 858–983 |
| Hugo_Current_Extended | 21/19/19/110 → same | 0/21 | equal | 0 | 3 (3/21) | 0/0/0 | 661 / 45 / 567 |
| Toasty_Current | 49/33/33/266 → same | 0/49 | equal | 0 | 2 (2/49) | 0/0/0 | 987 / 108 / 646 |
| Toasty_Latest_Blender_Export, `aggressiveImport` | 48 → 49 nodes, 33 meshes, 12 → 33 materials | n/a (synthesized on 49) | none | per-mesh by design | n/a | 0/0/0 | 22 / 7 / 328 |

Fallback body (loader scene) versus source, Quori: 19 nodes, bundle relocated to
the wrapper, `extras.name`/`extras.targetNames` added on 18 nodes (finding 6).

### Renderer and DOM touchpoints on the export path

| Location | Needs | Hit by face GLBs |
| --- | --- | --- |
| `GLTFExporter.getCanvas` → `processImage` (`:385-388,897-934`) | canvas 2D, `ImageData` | no (0 images/textures in 18 fixtures) |
| `GLTFExporter.decompress` (`:15-…`) | `WebGLRenderer` | no (no compressed textures) |
| `GLTFExporter` binary output (`:467-496`) | `Blob`, `TextEncoder` | yes — available in Node 22 |
| `GLTFLoader` textures (`:1382-1390`) | `createImageBitmap` / `<img>` | no |
| `DRACOLoader` (`load-gltf.ts:247-253`) | fetch of decoder, Worker | no (no Draco) |
| `load-gltf.ts:147-162,322-336` | blob URL + fetch, preferred when available | yes in browsers; parse branch (`:169-202,343-376`) is the headless one |
| `export.ts:28-39` `triggerBlobDownload` | `document`, `URL.createObjectURL` | yes — delivery only |
| `load-gltf-blob.ts:25` | `FileReader` | no caller |
| `traverse-three.ts:1` | `react.createRef` | yes — a `{current}` object |
| `useVizijExport.ts:731-790` | `requestAnimationFrame` ×≤13 | yes — waits for mounted refs |

### `@vizij/render` after the cut (lines from `wc -l`)

| Kept as the headless library | Lines | Deleted | Lines |
| --- | --- | --- | --- |
| `functions/load-gltf.ts` (parse branch first; drop blob-URL preference) | 377 | `vizij.tsx` (Canvas, camera fit, safe area, "No Output") | 285 |
| `functions/gltf-loading/*` (`traverse-three`, `import-*`, `map-features`, `extract-animations`) | 1,494 | `renderables/*` (`renderable`, `group`, `shape`, `ellipse`, `rectangle`) | 1,364 |
| `functions/export.ts` (returns bytes; download moves to the caller) | 369 | `effects/selection-glow-effect.tsx` | 154 |
| `functions/vizij-bundle.ts` | 183 | `hooks/use-features.ts`, `use-delayed-boolean.ts` | 106 |
| `functions/create-stored-data.ts`, `create-stored-features.ts`, `exportable-bodies.ts` | 93 | `memoryInvestigation.ts` (render counters) | 46 |
| `types/*` (drop `RefObject` fields) | ≈ 500 | `functions/load-gltf-blob.ts` | 52 |
| `store.ts`/`store-types.ts` as the app's world-model store (`world`, `animatables`, `values`, `elementSelection`, setters) | ≈ 300 of 538 | store: `refs`, `setReference`, `getExportableBodies`, `onElementClick`, `hoveredElement`, world-mutation actions unused by the app (`actions/*`, `create-animatable`, `create-world-element`, `compare-data`, `util`) | ≈ 600 |
| **new** `buildSceneGraph(world, animatables, rootId)` + `deriveMaterialName` (from `shape.tsx:394-434`) + Value decode (finding 10) | ≈ 120 | peer deps `@react-three/fiber`, `@react-three/drei`, `react-dom`, `tailwindcss`; `react` once `refs` leave the types | — |

The authoring app imports 22 symbols (`app-render-imports.txt`): 16 uses of
`VizijBundleExtension`, 11 of `World`, the store hooks, `Group`/`Feature`/
`Shape`/`ShapeMaterial`/`Selection` types, `loadGLTFFromBlobWithBundle` (1),
`exportScene` (1), `createVizijStore`/`VizijContext` (1). None of them is a
renderer.

### Authoring app changes

| Today | After |
| --- | --- |
| `RuntimeExportBodyBridge` inside the runtime provider (`Viewer.tsx:234-300`) | deleted |
| `runtimeExportBodies` state and handlers (`App.tsx:643-645,845-871,4497,4879`) | deleted |
| `exportSceneRoot` kept from the loader (`useVizijAssetLoader.ts:825,985`; `App.tsx:4878`) | deleted; the loader's three scene is released after `traverseThree` |
| `ExportDialog.getExportableBodiesForExport` (`:138-166`) + `utils/exportBodies.ts` | `buildSceneGraph(world, animatables, rootId)` from the app store the dialog already reads (`:125`) |
| `useVizijExport` mounted-ref wait loop and `fallbackExportBody` (`:731-790`) | deleted; `exportScene` returns bytes, the hook downloads them or hands them to the view's `loadFaceBytes` |
| Exported TRS/weights = runtime pose; `RobotData` defaults = authored (finding 3) | both = authored defaults (+ staged overrides) |

## Implications for the target picture

- Section 3.3's "headless library fed through a headless three.js scene graph"
  is verified end to end on the real functions; the reconstruction is small and
  mechanical, and `exportScene`, `applyDefaultsToRobotData`, the bundle graft and
  the GLB post-processing stay as they are.
- The headless export changes the file's semantics in one respect: node TRS and
  morph weights become the authored defaults instead of the runtime pose at
  export time. Bevy's `view.rs` loads node TRS from the glTF before the first
  store write, so a face whose authored default differs from its neutral pose
  (Toasty's root, finding 3) renders differently on the first frame than the
  same face exported from a mounted scene. The target must say which is
  canonical; defaults are the only choice that a stateless exporter can produce.
- `extras.selection` and the loader's `extras.name`/`targetNames` are renderer
  and loader residue in the file format; a headless exporter can stop writing
  them, and a Rust writer never would.
- The Rust exporter route is JSON surgery on the source container, not a mesh
  encoder: it needs the source GLB alongside the world JSON, and it needs a full
  `RobotData` schema that no Rust crate has yet. It is not a gate, as 3.3 says.

## Implications for the plan

- Risk 3 ("a headless three.js exporter fed from the world model is a rewrite of
  the export bridge") overstates the work: the bridge deletion is larger than the
  addition. Downgrade it; the real decision it hides is the TRS semantics above.
- P0 groundwork candidates, each small and independent: make `exportScene`
  return bytes; put `GLTFLoader.parse(arrayBuffer)` first in `load-gltf.ts`;
  drop `react.createRef` from the loader by removing `refs` from the world types;
  fix the `lodash` named import so `create-stored-data.ts` loads under Node
  ESM; add a Node test in `packages/@vizij/render/tests` that exports a fixture
  headlessly and asserts `RobotData`/bundle equality (the spike is the seed).
- P4's "headless exporter" item is: add `buildSceneGraph`, rewire `ExportDialog`
  to the app store, delete the bridge and the fallback body. It can land before
  the viewport swap, since it does not touch the canvas.
- Decide `extras.selection`: drop (clean files) or keep one release for
  byte-stable diffs of re-exported faces.
- The Rust exporter, if wanted later: `vizij-bundle` grows a `RobotData` schema
  and node/material writers over `Glb`; scope it as "surgery on the source GLB",
  not as a glTF encoder.

## Open questions

- Which pose does a file carry as node TRS: the authored defaults (headless,
  deterministic) or the neutral pose from the bundle's pose config? Toasty's
  90°-rotated root shows the two differ today.
- Should `applyDefaultsToRobotData` keep rewriting defaults from staged
  `values`, or should staging be a separate "bake pose" action once TRS and
  defaults are the same numbers?
- Does the headless build need `namespace` at all once refs are gone, or is
  `default` the only namespace an exported file ever names?
