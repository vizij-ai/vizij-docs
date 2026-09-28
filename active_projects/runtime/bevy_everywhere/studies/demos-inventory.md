# Every surface that renders a Vizij face, and what each needs from a browser Bevy view
<!-- tags: family=project; type=reference; project_status=proposal; topics=runtime,standalone,bevy,wasm,demos,e2e,guidebook -->
> **Last updated:** 2026-09-28
> **Related documents:** [Central plan](../bevy_everywhere-plan.md)

Revisions read: vizij-web `f69f0ba8`, vizij-rs `9406f66`, semio_studio `1c002e17`
(branch `chore/vizij-app-update`), vizij-docs worktree `docs/bevy-everywhere-study`.
Raw grep outputs are not kept; the citations below are against the revisions
above.

## Findings

1. **vizij-web has 11 apps; `apps/vizij-ws-app` is a residue.** `git ls-files apps/vizij-ws-app` returns one file (`src-tauri/.gitignore`); the rest of the directory is untracked build output. The 11 apps are the ones the root `package.json` `dev:*` scripts name (vizij-web/package.json:11-21).
2. **Six apps render a face, and all six do it through one component: `VizijRuntimeFace` from `@vizij/runtime-react`.** Mount sites: demo-vizij-player `src/App.tsx:35`; tutorial-fullscreen-face `src/FaceApp.tsx:125`; tutorial-agent-face `src/FaceApp.tsx:325`; vizij-showcase `src/components/RuntimeFaceFrame.tsx:58`; vizij-authoring `src/components/app/Viewer.tsx:738` and `src/components/app/RuntimeFaceFrame.tsx:69`; vizij-standalone `src/App.tsx:624`. No vizij-web app mounts `@vizij/render`'s bare `Vizij` directly.
3. **`VizijRuntimeFace` is one react-three-fiber `<Canvas>` per mount.** `packages/@vizij/runtime-react/src/VizijRuntimeFace.tsx:2,15` wraps `Vizij` from `@vizij/render`; `packages/@vizij/render/src/vizij.tsx:47-110` returns a `<Canvas>` (WebGL, `antialias: true`, `NoToneMapping`) per instance. "N faces on a page" therefore means N WebGL contexts today.
4. **Five apps render no face and depend on neither `@vizij/render` nor `@vizij/runtime-react`**: demo-animation-studio, demo-graph-studio, minimal-demo-animation, minimal-demo-animation-graph, minimal-demo-graph (manifests: none lists either package; `grep three|@react-three|@vizij/render` over their `src/` finds only two 2D chart `<canvas>` elements in demo-animation-studio). demo-animation-studio's `AGENTS.md:5,15` claims it uses `@vizij/render`; the manifest and source do not — doc drift.
5. **`@vizij/render` is the authoring app's scene model, not only its renderer.** 44 files under `apps/vizij-authoring/src` import it; the symbols are the store (`useVizijStore`, `createVizijStore`, `VizijContext`), the world/bundle types (`World`, `VizijBundleExtension`, `LoadedVizijAsset`, `Feature`, `Group`, `Selection`) and the GLB I/O (`loadGLTFFromBlobWithBundle`, `exportScene`) — `packages/@vizij/render/src/index.tsx` re-exports store, types, load-gltf, export and vizij-bundle modules. vizij-showcase and vizij-standalone import it too, for the store (`RuntimeFaceFrame.tsx:3`, root-bounds framing) and for `VizijSpeechConfig` (`useSpeechController.ts:3`).
6. **Multi-face pages exist in two apps.** vizij-showcase mounts 6 `VizijRuntimeProvider` (one arora device each) and 5 face canvases on one scrolling page (section 3 of Evidence). vizij-authoring can show 2 faces at once (main viewer `Viewer.tsx:685` + reference-face panel `ReferenceFaceRuntime.tsx:303`), and a third runtime (`emptyStateDemo/EmptyStateDemo.tsx:25`) replaces the main face while no asset is loaded (`Viewer.tsx:684-776`, ternary). Every other face app mounts exactly one.
7. **Speech is in four apps, in three shapes.** tutorial-agent-face: Gemini Live in the browser (`src/hooks/useGeminiLive.ts:167-168`, `@google/genai`, model `gemini-2.5-flash-native-audio-preview-12-2025` at `src/phoneme-core/constants.ts:3`), microphone via `getUserMedia`, visemes computed locally in `src/phoneme-core/`, no other network call (`grep fetch(|cloudfunctions|VITE_API` over its `src/` finds nothing). vizij-showcase VoiceSection and vizij-authoring SpeechPanel/DemoVoicePanel: Amazon Polly TTS+visemes through the semio-vizij Cloud Function (`apps/vizij-showcase/src/services/apiBase.ts:3`, `apps/vizij-authoring/src/services/apiBase.ts:3`). vizij-standalone: the full `@vizij/speech-react` pipeline — Deepgram STT, OpenAI chat (`packages/@vizij/speech-react/src/hooks/useConversation.ts:60`), Polly through `${apiBase}/tts/get-visemes|get-audio` (`services/pollyApi.ts:12,29`) — enabled only when the bundle carries `speechConfig` (`apps/vizij-standalone/src/App.tsx:342-345`; `useSpeechController.ts:190`). demo-vizij-player and tutorial-fullscreen-face have no speech (fullscreen-face's only "viseme" hit classifies poses for hotkeys, `usePoseHotkeys.ts:69`).
8. **CI (vizij-web/.github/workflows/ci.yml) has three jobs.** `build` (lines 12-29): `build:packages`, `format:check`, `lint:all`, `typecheck:all`, `test:all`, `build` — the last runs `vite build` for all 11 apps, vizij-standalone's web bundle included (its `build` script is `vite build`); no job builds the Tauri shell for desktop. `e2e` (30-49): the light Playwright suite. `authoring-smoke` (51-70): the authoring app's own Playwright `@smoke` project.
9. **The light e2e suite asserts page errors, never pixels.** `e2e/standalone-demos.ts:16-20` lists demo-vizij-player, demo-animation-studio, demo-graph-studio; `tests/standalone-demos-smoke.spec.ts` and `tests/authoring-smoke.spec.ts` assert `#root` non-empty and zero `pageerror`; `tests/demo-vizij-player-load-sample.spec.ts:19-20,44` clicks "Load sample" and asserts no arora value-marshalling error, explicitly ignoring WebGL errors (comment lines 13-15). `tests/authoring-journey.spec.ts:9` is skipped unless `RUN_HEAVY=1`. `e2e/playwright.config.ts:16-25` passes SwiftShader/ANGLE flags so three.js can get a GL context headlessly.
10. **The authoring in-app Playwright config has no GL flags** (`apps/vizij-authoring/playwright.config.ts`, projects `smoke`/`workflow` by tag); its 4 `@smoke` specs assert DOM test ids (`main-runtime-view`, `main-runtime-ready-flag`), not rendering. `e2e/refcap.workflow.pw.ts` — the headed screenshot capture vizij-rs `crates/vizij/README.md:187-190` names — is untracked (`git status` shows `??`).
11. **Android CI is on-demand and asserts only that a WebView appears.** `android.yml:29-31` runs the debug APK + emulator smoke on `workflow_dispatch` only; `release-apk` runs on `main` pushes when `tauri.conf.json` version has no release yet (181-218). `AppLaunchTest.kt:31-53` waits for an `android.webkit.WebView` object. `apps/vizij-standalone/README.md:497-499` says pull requests build the debug APK — drift against the workflow.
12. **The public website is not checked out locally; it is a generated projection of the guidebook.** No `vizij-ai.github.io` directory exists under `/Users/victor.paleologue/Code/Semio` (only 7 archived planning notes under `vizij-docs/archive/audits/2026-02-05-markdown-audit/vizij-ai.github.io/`). `guidebook/README.md:52-66` and `public_projection_manifest.json` (15 pages, hubs `docs` and `tutorials`) define what the site publishes; the manifest links four apps on GitHub: tutorial-fullscreen-face (line 485), tutorial-agent-face (729, 771), vizij-authoring (573, 611, 776), vizij-standalone (447, 786, 824). vizij-showcase, demo-vizij-player and the minimal demos are not projected; the site's `/demos/` hub is referenced by the manifest's actions but has no manifest source, so its content is unverifiable here.
13. **Guidebook references (32 pages carry at least one of the terms).** `vizij-standalone`: 19 pages, heaviest `deploy/easiest-standalone-deployment.md` (21 hits), `deploy/hardware-ros-and-multi-screen-topologies.md` (15), `deploy/operator-and-deployment-model.md` (9), `deploy/deployment-checks-and-recovery.md` (8). `runtime-react`: 26 pages. `VizijRuntimeFace`: 5 pages. `@vizij/render`, `three.js`, `WebGL`: 0 pages — the guidebook never names the renderer technology. Per-page counts in Evidence, section 5.
14. **vizij-rs ships no browser demo.** `crates/vizij/examples/` holds `say.rs` only; `npm/@vizij/*` has no demo folder and no README mentions a vizij-web app; `crates/vizij/README.md:6` states "no browser and no JS"; `grep wasm32|target_arch` over `crates/vizij/Cargo.toml` and `src/` finds no browser target — the browser Bevy view is not built today (subject of another sub-study).
15. **Semio Studio draws faces with its own three.js package, not `@vizij/render`.** `packages/vizij` (npm name `vizij`, deps three/@react-three) is mounted by `apps/vizij-app/src/content.tsx:215` (`<Vizij>`), `packages/scene/src/renderables/screen.tsx:213` (`InnerVizij` on a 3D screen in the Studio scene), `apps/studio/src/components/modals/upload-face-modal.tsx:5,29` and the Storybook stories under `apps/docs/stories/`. `apps/vizij-app` exists on `main` as the older Studio-bridge-client app; the Arora-device port is only on the current branch (16 files, +6720/−4379 vs main). No semio_studio workflow names vizij-app; `release.yml:1,84` publishes the `vizij` npm package.

## Questions answered

**Q1 — inventory table.** See Evidence, section 1 (one row per app plus the Studio surfaces).

**Q2 — fate of each app under "Bevy everywhere".** See Evidence, section 2. Summary: five no-face apps stay as they are; tutorial-fullscreen-face and demo-vizij-player port first (smallest, and the e2e-covered reference consumer); vizij-authoring's viewport ports but its `@vizij/render` dependency is a scene-model dependency that the view alone does not replace (Finding 5); tutorial-agent-face is the seed of the "agent + Vizij" demo in the standalone's folder and retires once the guidebook route points there; vizij-showcase is kept only if the view supports 5 instances per page, otherwise reduced to one face or retired; vizij-standalone retires at the Android gate; vizij-ws-app's residue is deleted.

**Q3 — the showcase multi-face pattern.** 6 devices, 5 canvases, one device per face (`ShowcaseRuntime.tsx:49-53`), lazy creation on first scroll-in, never unmounted, visibility-driven throttling (visible → normal loop; hidden driver → 1 Hz manual `step(1/hz, {forceRuntime:true})`; hidden passive → frozen). The view must provide N independent instances on one page with per-instance canvas, GLB, pause/step-rate control and JS control surface. Precise requirements and the three ways to satisfy them are in Evidence, section 3.

**Q4 — CI and e2e that would change.** `ci.yml` `e2e` and `authoring-smoke` jobs (GL flags, boot canaries, the load-sample regression), `android.yml` (retired with the standalone, gate moves to vizij-rs), `publish-npm.yml` (package set), `ci.yml` `build` (a wasm artifact must be consumable). Detail in Evidence, section 4.

**Q5 — pages to update.** Guidebook: the 32 pages of Evidence section 5, with `deploy/*` (4 pages, 53 standalone hits) and `integrate/*` + `experience/hello-face-quickstart.md` (VizijRuntimeFace code) as the substantive rewrites. vizij-web: 25 markdown files, listed in Evidence section 5.

## Evidence

### 1. Inventory (Q1)

Purpose is taken from each app's README/AGENTS.md. "Face" names the component; "Faces" is the maximum simultaneous count; "CI" is which ci.yml job exercises the app beyond `vite build` (all 11 are built); "Docs" is guidebook (G) / website manifest (W).

| App | Purpose | @vizij packages | Face | Faces | Speech | CI / e2e | Docs |
|---|---|---|---|---|---|---|---|
| demo-animation-studio | animation presets + rig editors, baked-track charts | animation, animation-react, utils, value-json | none (2D `<canvas>` charts) | 0 | no | e2e boot smoke (`standalone-demos.ts:18`) | — |
| demo-graph-studio | React Flow node-graph editor | node-graph, node-graph-react, node-graph-authoring, utils, value-json | none | 0 | no | e2e boot smoke (`:19`) | — |
| minimal-demo-animation | smallest animation-react smoke | animation-react, minimal-demo-ui, utils | none | 0 | no | build only | — |
| minimal-demo-animation-graph | animation → graph (URDF IK) sample | animation(+react), node-graph(+react), minimal-demo-ui, utils, value-json | none | 0 | no | build only | — |
| minimal-demo-graph | node-graph staging playground | node-graph(+react), minimal-demo-ui, utils, value-json | none | 0 | no | build only | — |
| demo-vizij-player | bundle-first reference runtime-react consumer (pose panel, metadata-driven face controls, diagnostics) | runtime-react, utils | VizijRuntimeFace (`App.tsx:35`) | 1 | no | e2e boot smoke + load-sample regression | G (15 pages) |
| tutorial-fullscreen-face | canonical minimal runtime tutorial: mouse gaze + pose hotkeys | runtime-react | VizijRuntimeFace (`FaceApp.tsx:125`) | 1 | no | build only | G (21 pages), W (hello-face) |
| tutorial-agent-face | live conversational face: Gemini Live, local visemes, agent tools for gaze/emotion | runtime-react | VizijRuntimeFace (`FaceApp.tsx:325`) | 1 | Gemini Live in-browser (STT+LLM+TTS), local phoneme→viseme | build only (needs `VITE_GEMINI_API_KEY` at run time, not build) | G (19 pages), W (agent-face) |
| vizij-showcase | multi-section public showcase (hero, expressions, gaze, voice, rig controls, mission/roadmap copy) | render, runtime-react | VizijRuntimeFace via `RuntimeFaceFrame.tsx:58` | 5 canvases / 6 devices | Polly TTS via Cloud Function (VoiceSection) | build only | — |
| vizij-authoring | runtime-truthful authoring: import GLB, rig/pose/graph authoring, export bundle | render, runtime-react, runtime, node-graph(+react, +authoring), utils, value-json | VizijRuntimeFace (`Viewer.tsx:738`, `RuntimeFaceFrame.tsx:69`) | 2 (main + reference); empty-state demo replaces main | Polly TTS via Cloud Function (SpeechPanel, DemoVoicePanel) | e2e authoring smoke (+ heavy journey), in-app `@smoke` job | G (28 pages), W (authoring, rigging) |
| vizij-standalone | Tauri desktop/Android runtime app; WS + web control panel, ROS 2, Studio bridge; maintenance-only (README:5-9) | render, runtime-react, runtime, speech-react, node-graph(+react, +authoring), utils, value-json | VizijRuntimeFace (`App.tsx:624`) | 1 | full speech-react pipeline, gated on bundle `speechConfig` | `vite build` in ci.yml; APK + WebView smoke in android.yml (on demand) | G (19 pages), W (deployment) |
| vizij-ws-app | residue (1 tracked file) | — | — | — | — | — | — |
| semio_studio `apps/vizij-app` | Studio-branded Tauri face registered as a Studio device | semio_studio `vizij` (three.js) | `Vizij` (`content.tsx:215`) | 1 | no | none | — |
| semio_studio `packages/scene` screen | a face on a 3D screen inside the Studio scene | semio_studio `vizij` | `InnerVizij` (`screen.tsx:213`) | per screen | no | studio CI (not face-specific) | — |

### 2. Proposed fate per app (Q2)

| App | Fate | Reasons |
|---|---|---|
| demo-animation-studio, demo-graph-studio, minimal-demo-* (5) | keep as is | no face, no render/runtime-react dependency (Finding 4); their e2e boot smokes stay as the wasm animation/graph canaries. |
| tutorial-fullscreen-face | port first | smallest face app (13 tracked files, one provider + one face + two hooks); it is the guidebook's Hello Face path (21 pages) and the website's `tutorials-hello-face`; its `tutorial.md` becomes the first "browser Bevy view" tutorial. |
| demo-vizij-player | port second | the declared reference consumer of runtime-react (`README.md:7-17`); the only face app with a load-driving e2e (`demo-vizij-player-load-sample.spec.ts`) — that spec becomes the wasm-view load canary. Needs the device's JS surface (metadata, `setValue`, transport), not only a canvas. |
| vizij-authoring | port the viewport; scene model is a separate decision | in scope by plan §1. Requirements beyond "draw a face": picking (`onPointerMissed`, selection glow, `Viewer.tsx:738-745`), `transformOutputWrite`, `setGraphBundle` hot-swap (README:19-21), root-bounds framing, 2 instances (main + reference). Its 44 `@vizij/render` imports are the GLB world/bundle model and export (Finding 5): retiring three.js here means either keeping `@vizij/render` as a headless data library or re-homing load/export in Rust (`vizij-bundle` already exists in vizij-rs). |
| tutorial-agent-face | seed of the "agent + Vizij" demo, then retire | it already is "an agent in JavaScript drives the face": Gemini Live in the page, function-call tools steer gaze/emotion, no server (Finding 7). Moving its agent loop onto the in-page arora device with the wasm view yields the demo plan §1 describes; the guidebook route `tutorials-agent-face` then points at the standalone's folder. Its local phoneme-core (Viterbi aligner over Gemini audio) overlaps the device's viseme players — which one drives the lips is an open question. |
| vizij-showcase | keep only if the view supports 5 instances per page; else reduce to one face or retire | not in CI, not in the guidebook, not in the website manifest; half its sections are marketing copy (mission, roadmap, community). It is the one consumer that dictates multi-instance (section 3). |
| vizij-standalone | retire at the Android gate; folder becomes the demo | plan §1. Its web control panel (`src-tauri/src/lib.rs:106-166`), ROS 2 and Studio-bridge surfaces are already covered natively by `crates/vizij` per `README.md:5-9`. `android.yml` retires with it. |
| vizij-ws-app | delete | one tracked `.gitignore`. |
| semio_studio apps/vizij-app | consume the Bevy view as a library (plan §1) | today it renders with semio_studio's own `vizij` package; `packages/scene`'s screen renderable is the second consumer of that package and is the plan's open question. |

### 3. The showcase multi-face pattern (Q3)

Mount sites (`apps/vizij-showcase/src/sections/*.tsx`): Hero (`HERO_FACES`, 1 entry, `data/heroFaces.ts:10-17`; `driveRuntime={index === 0}`), Expressions ×2 (`expressions-quori` panel runtime with no face frame, `hiddenStepHz={0}`; `expressions-quori-face` with a face, `driveRuntime`), Gaze (`driveRuntime`, `hiddenStepHz={1}`), Voice (`driveRuntime`, `hiddenStepHz={1}`), Controls (`autostart={false}`, `driveRuntime={false}`). Face frames: 5 (`HeroSection.tsx:107`, `ExpressionsSection.tsx:58`, `GazeInteractiveFace.tsx:82`, `VoiceSection.tsx:66`, `ControlsSection.tsx:33`).

Mechanics (`ShowcaseRuntime.tsx`):
- one `VizijRuntimeProvider` per section-face, namespace `vizij-showcase-<key>`, each loading the same GLB URL (`lib/faceAssets.ts:35-44`) — 6 devices, 6 GLB loads;
- `active={hasEntered}`: the provider is created the first time the section reaches 35 % visibility (`hooks/useSectionInView.ts:19,33-46`, `once: true`) and is never torn down;
- `autostart = autostart && visible`, `driveRuntime = driveRuntime && visible` (lines 44-53): a hidden face stops its normal loop;
- hidden *driver* faces are stepped by a `setInterval` at `hiddenStepHz` calling `step(1/hz, { forceRuntime: true })` (lines 68-89); `hiddenStepHz={0}` freezes;
- camera framing is written into the render store per face (`RuntimeFaceFrame.tsx:96-138`, `rootBounds`);
- a debug beacon broadcasts per-face `stepHz` (lines 91-116).

What a browser Bevy view must support to keep this app unchanged: (a) 5 independent instances on one page, each bound to its own DOM slot, created lazily on scroll, each with its own device and GLB; (b) per-instance pause / fixed-rate stepping from JS; (c) a per-instance JS control surface (`setInput`, `animateValue`, pose helpers, root-bounds framing); (d) 5 simultaneous GPU contexts, or their equivalent.

Three shapes satisfy (a): **N canvases, N wasm instantiations** (one Bevy `App` each; simplest mapping, heaviest — each instance carries its own wgpu device and asset load; WebGL context caps per page apply); **N canvases, one wasm instance with N windows** (Bevy's winit backend accepts a canvas selector per `Window`; whether one `App` drives several browser canvases on wasm is unverified here); **one full-page transparent canvas with N camera viewports** positioned under the DOM slots (one context, one asset load shared across faces, per-face cameras with `Viewport` rects; the DOM only reserves space). Only the third avoids multiplying GPU contexts and GLB loads; it changes how sections compose (a single view owns all faces). Which one is feasible belongs to the wasm sub-study.

### 4. CI jobs and e2e suites to rewrite (Q4)

| Surface | Today | Under Bevy everywhere |
|---|---|---|
| `ci.yml` `build` (12-29) | `vite build` of 11 apps incl. vizij-standalone's web bundle | the wasm view artifact must be consumable (published `@vizij/*-wasm`-style package or local link via `scripts/wasm-links.mjs`); the standalone folder builds the demo instead of the Tauri web bundle. |
| `ci.yml` `e2e` + `e2e/playwright.config.ts:16-25` | SwiftShader/ANGLE flags for three.js WebGL; page-error assertions only | flags change with the view's backend (WebGL2 via wgpu keeps ANGLE; WebGPU needs headless Dawn/SwiftShader flags — unverified); the "not composited headless" note (`crates/vizij/README.md:187-190`) means pixel assertions stay headed; the boot smokes survive as written if the view initialises without throwing. |
| `tests/demo-vizij-player-load-sample.spec.ts` | asserts the arora value marshalling after "Load sample" | keep: it becomes the wasm-view + device load canary; its `RUNTIME_ERROR` regex targets the arora device, not three.js. |
| `ci.yml` `authoring-smoke` + `apps/vizij-authoring/playwright.config.ts` | no GL flags; DOM test-id assertions on `main-runtime-view`, `main-runtime-ready-flag`, reference-face presets | test ids move to the view's wrapper; GL/WebGPU flags become necessary if the view throws without a context; `refcap.workflow.pw.ts` (untracked) is the only screenshot harness and stays headed. |
| `android.yml` | on-demand debug APK + WebView smoke; release APK on version bump | retired with vizij-standalone; the Android gate (install, open a GLB, reach Studio) moves to vizij-rs / ros-viz-rs recipes. |
| `publish-npm.yml` | publishes any `@vizij/*` version absent from npm | package set changes: `render`, `runtime-react`, `speech-react` translated or retired; new view package needs a one-time manual bootstrap (README "First publish"). |
| semio_studio CI | no job names vizij-app | unchanged until the Bevy view is consumed there. |

### 5. Documentation pages referencing the retired surfaces (Q5)

Guidebook (`current_documentation/guidebook`), hits per page as `standalone / runtime-react / VizijRuntimeFace`:

| Page | S | RR | VRF |
|---|---|---|---|
| README.md | 1 | 0 | 0 |
| control/control-surfaces-and-configuration-layers.md | 4 | 4 | 0 |
| control/first-control-interactions.md | 0 | 1 | 0 |
| control/orchestration-and-diagnostics.md | 3 | 6 | 0 |
| control/paths-and-standard-controls.md | 3 | 5 | 0 |
| control/runtime-inputs-and-semantics.md | 2 | 1 | 0 |
| customize/poses.md | 0 | 1 | 0 |
| deploy/deployment-checks-and-recovery.md | 8 | 0 | 0 |
| deploy/easiest-standalone-deployment.md | 21 | 1 | 0 |
| deploy/hardware-ros-and-multi-screen-topologies.md | 15 | 0 | 0 |
| deploy/operator-and-deployment-model.md | 9 | 1 | 0 |
| experience/existing-asset-sandbox.md | 0 | 1 | 0 |
| experience/hello-face-quickstart.md | 0 | 1 | 1 |
| experience/sample-asset-exploration.md | 0 | 1 | 0 |
| integrate/README.md | 0 | 1 | 0 |
| integrate/api-backed-interactive-application.md | 0 | 3 | 0 |
| integrate/application-integration-patterns.md | 0 | 6 | 3 |
| integrate/behind-the-face.md | 1 | 0 | 0 |
| integrate/loading-playback-and-embedding.md | 0 | 4 | 5 |
| integrate/minimal-web-player.md | 0 | 3 | 0 |
| integrate/rich-interactive-applications.md | 0 | 4 | 0 |
| introduction/architecture-bridge.md | 1 | 2 | 0 |
| introduction/how-to-use-this-guidebook.md | 2 | 1 | 0 |
| introduction/system-mental-model.md | 1 | 0 | 1 |
| module_inventory-reference.md | 0 | 1 | 0 |
| reference/animation-integration-and-deployment-reference.md | 3 | 1 | 0 |
| reference/package-rename-migration-reference.md | 0 | 2 | 0 |
| reference/renderer-and-rigging-reference.md | 0 | 1 | 0 |
| reference/runtime-quickstart-reference.md | 1 | 0 | 3 |
| support/glossary-and-terminology-bridge.md | 4 | 5 | 0 |
| support/troubleshooting-matrix.md | 3 | 1 | 0 |
| support/validation-checkpoints.md | 2 | 2 | 0 |

`public_projection_manifest.json` links vizij-standalone (lines 447, 786, 824), tutorial-fullscreen-face (485), tutorial-agent-face (729, 771), vizij-authoring (573, 611, 776) and must be regenerated with the guidebook (README.md:52-66). `@vizij/render` and three.js appear on no guidebook page.

vizij-web markdown (CHANGELOGs excluded): `README.md`, `AGENTS.md`, `apps/AGENTS.md`, `packages/AGENTS.md`, `next_steps.md`; `apps/vizij-standalone/README.md` (29 standalone hits); `apps/demo-vizij-player/README.md` and `docs/runtime-react-walkthrough.md` (7 VizijRuntimeFace hits); `apps/tutorial-fullscreen-face/README.md`, `tutorial.md`; `apps/tutorial-agent-face/README.md`, `tutorial.md`; `apps/vizij-showcase/README.md`; `apps/vizij-authoring/README.md`, `AGENTS.md`, `docs/plans/BACKLOG.md`, `docs/plans/TRACKER.md`, `docs/plans/authoring-reference-face-implementation-plan.md` (+ 7 archived notes/plans under `docs/archive/`); `apps/demo-animation-studio/AGENTS.md` (stale render claim); `packages/@vizij/render/README.md` + `AGENTS.md`; `packages/@vizij/runtime-react/README.md` + `AGENTS.md`; `packages/@vizij/speech-react/README.md`; `packages/@vizij/utils/README.md` + `AGENTS.md`.

Other vizij-docs pages naming the standalone or render package (outside the guidebook): `current_documentation/ARCHITECTURE.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `ROADMAP.md`, `concepts/deeper_exploration/STANDARD_INPUTS.md`.

## Implications for the target picture

- The browser view has exactly one integration point to replace in vizij-web: `VizijRuntimeFace` (7 mount sites). A drop-in with the same props (`className`, `showSafeArea`, `showSelectionGlow`, `onPointerMissed`) covers demo-vizij-player, both tutorials and the standalone's successor; the authoring viewport additionally needs picking and `transformOutputWrite`.
- "three.js retired" is two decisions, not one: the canvas (`Vizij`) and the scene/bundle model + GLB I/O that `@vizij/render` also carries for the authoring app. The view can replace the first without the second.
- Multi-instance is required by vizij-authoring (2) regardless of the showcase; the showcase raises it to 5 and adds per-instance throttling. The target must state how many views a page may hold and whether they share one GPU context.
- Speech in the browser demos is already "agent outside the face": Gemini Live (agent-face) and Polly-over-Cloud-Function (showcase, authoring) call no face-side server. The device keeps `say` + viseme players; the browser demos then need a JS path from agent audio/text to those players.
- Semio Studio has two face consumers of its own three.js package (vizij-app and the scene's screen renderable); plan §1 covers the first only.

## Implications for the plan

- Port order that minimises risk: tutorial-fullscreen-face → demo-vizij-player (with its load-sample e2e) → authoring viewport → agent demo in the standalone's folder → showcase decision.
- The e2e suite needs no new assertions to catch a broken wasm view: `#root` non-empty + zero page errors + the load-sample regression already fail on a view that throws. Add one headed screenshot job only if pixel parity is a gate.
- Retire `android.yml` and the standalone README's Android/CI sections together; fix the debug-APK-on-PR drift if the standalone outlives the first plan step.
- The guidebook rewrite is concentrated: 4 `deploy/*` pages (53 standalone hits) and 4 `integrate/*` + `experience/hello-face-quickstart.md` pages (VizijRuntimeFace code samples); then regenerate the website projection.
- Delete `apps/vizij-ws-app`; fix `apps/demo-animation-studio/AGENTS.md`'s render claim.

## Open questions

1. Can one Bevy `App` on wasm drive several browser canvases (N windows), or must the showcase/authoring use N wasm instantiations or one canvas with viewports? Unverified here; belongs to the wasm sub-study.
2. In the agent demo, which component drives the lips: the device's viseme players (from `say`) or tutorial-agent-face's local phoneme-core over Gemini's native audio? Gemini Live returns audio, not text-to-be-synthesised, so `say` does not apply as-is.
3. Does `@vizij/render` survive as a headless GLB world/bundle/export library for the authoring app, or does load/export move to Rust (`vizij-bundle`)?
4. Is vizij-showcase kept at all? It is in no CI, guidebook or manifest, and is the only consumer needing 5 instances.
5. Is semio_studio's `packages/scene` screen renderable (a face on a 3D screen) in scope, since it is a second consumer of Studio's own three.js face package?
6. What the public site's `/demos/` hub currently embeds cannot be verified locally (repo absent).
