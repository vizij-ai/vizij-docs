<!-- tags: type=reference; status=in_progress; topics=website,documentation,teaching,content -->

> **Related documents:** [Website & Ecosystem summary](../summary.md) · [Documentation Strategy & Content - Plan & Tracking](documentation_strategy-plan.md) · [Public Teaching Gap Audit](public_teaching_gap_audit-reference.md) · [Vizij Roadmap & Active Programs](../../../../current_documentation/ROADMAP.md)
>
> **Last updated:** 2026-03-10
> **Purpose:** page-by-page sourcebook and implementation brief for upgrading public docs, tutorials, and demos from descriptive copy into actual teaching content

# Public Page Teaching Sourcebook

## 1. How To Use This Sourcebook

For each public page in scope, this sourcebook lists:

1. the real learner goal,
2. the implementation truth that must be taught,
3. the specific code, commands, paths, or assets worth showing,
4. the artifacts the learner should be able to produce,
5. ideas for making the page educational and engaging.

The intent is not to mirror repo-local docs. The intent is to extract the exact material a public reader needs to succeed.

## 2. Shared Teaching Rules For The Whole Site

Every technical page should include these elements unless there is a strong reason not to:

1. **Outcome**: one sentence describing what the reader will be able to do.
2. **Prerequisites**: exact tools, env vars, files, and expected prior pages.
3. **Concrete artifact**: what they will produce by the end.
4. **One minimal example**: commands and code small enough to copy.
5. **Validation**: what they should see if it worked.
6. **Troubleshooting**: the 2-4 most likely failures, tied to actual current failure modes.
7. **Implementation bridge**: exact repo/app/package references for deeper detail.

## 3. Shared Facts That Need To Appear Repeatedly

These facts recur across multiple pages and should be taught consistently:

1. Runtime setup centers on `VizijRuntimeProvider`, `VizijRuntimeFace`, and `useVizijRuntime`.
2. Asset bundles are the unit of runtime loading. A bundle can include:
   - `glb`
   - `rig`
   - `pose`
   - `animations`
   - `initialInputs`
   - `metadata`
3. Embedded `VIZIJ_bundle` metadata is the preferred export path from authoring.
4. Standard inputs use `/standard/...` style control paths.
5. Authoring now distinguishes:
   - animatable layer,
   - `/propsrig/...` low-level channels,
   - abstract rig layer,
   - pose layer.
6. Pose weights currently resolve to:
   - `rig/{face}/poses/{poseId}.weight`
7. Runtime inputs are `ValueJSON`, commonly:
   - `{ float: 0.5 }`
8. Browser and standalone are both first-class deployment references.

### Site implementation constraints

The content plan needs to be implemented against the current site architecture, not against an imagined CMS.

1. All `/docs/*` and `/tutorials/*` public copy currently lives in `vizij-ai.github.io/src/site-content/vizij/guides.ts`.
2. The docs and tutorials hub pages live in `vizij-ai.github.io/src/site-content/vizij/hubs.ts`.
3. `vizij-ai.github.io/src/components/guides/GuidePage.tsx` currently renders only hero content, overview panels, prose sections, bullets, ordered bullets, and link cards.
4. `vizij-ai.github.io/src/components/guides/HubPage.tsx` currently renders only hub cards and action buttons.
5. The current guide schema does not support code blocks, command blocks, screenshots, validation states, troubleshooting tables, or implementation-anchor callouts.
6. That means the public pages cannot become genuinely instructional by copy edits alone; the site needs new content primitives in addition to new writing.

### Primary source anchors

These are the first files to reopen when drafting or validating page rewrites.

1. Site copy and route composition:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
   - `vizij-ai.github.io/src/site-content/vizij/hubs.ts`
   - `vizij-ai.github.io/src/components/guides/GuidePage.tsx`
   - `vizij-ai.github.io/src/components/guides/HubPage.tsx`
   - `vizij-ai.github.io/src/react-pages/demos/DemosPage.tsx`
2. Public micro-labs and site-side runtime behavior:
   - `vizij-ai.github.io/src/components/tutorial-labs/HelloFaceLab.tsx`
   - `vizij-ai.github.io/src/components/tutorial-labs/RendererDataModelLab.tsx`
   - `vizij-ai.github.io/src/components/tutorial-labs/RiggingControlLab.tsx`
   - `vizij-ai.github.io/src/components/tutorial-labs/AnimationLab.tsx`
   - `vizij-ai.github.io/src/components/tutorial-labs/TutorialRuntime.tsx`
   - `vizij-ai.github.io/src/components/demos/ShowcaseRuntime.tsx`
   - `vizij-ai.github.io/src/demo-lib/*`
3. Current implementation references in `vizij-web`:
   - `apps/tutorial-fullscreen-face/tutorial.md`
   - `apps/tutorial-fullscreen-face/src/FaceApp.tsx`
   - `apps/tutorial-agent-face/tutorial.md`
   - `apps/tutorial-agent-face/src/FaceApp.tsx`
   - `apps/tutorial-agent-face/src/hooks/useGeminiLive.ts`
   - `apps/tutorial-agent-face/src/hooks/useAgentFaceTools.ts`
   - `apps/vizij-authoring/README.md`
   - `apps/vizij-authoring/docs/ARCHITECTURE.md`
   - `apps/vizij-authoring/docs/Authoring_Blueprint.md`
   - `apps/vizij-standalone/README.md`
   - `packages/@vizij/runtime-react/README.md`
   - `packages/@vizij/render/README.md`
4. Canonical project references outside `vizij-web`:
   - `vizij-docs/current_documentation/ARCHITECTURE.md`
   - `vizij-docs/current_documentation/ROADMAP.md`
   - `vizij-docs/current_documentation/workshops/vizij-afternoon-workshop/handouts/vizij-runtime-quickstart.md`
   - `vizij-docs/current_documentation/workshops/vizij-afternoon-workshop/handouts/renderer-rigging-reference.md`
   - `vizij-docs/current_documentation/workshops/vizij-afternoon-workshop/handouts/animation-integration-deployment-reference.md`
   - `vizij-assets/quori-rigged/*`
   - `vizij-assets/tiago-rigged/*`

## 4. Page-by-Page Content Requirements

### 4.1 `/demos/`

**Learner goal**

Understand what Vizij can do live and know where each behavior comes from.

**Must teach**

1. Each demo section is a runtime slice built on `VizijRuntimeProvider` via the site-local `ShowcaseRuntime`.
2. Face assets come from site bundles that point to:
   - `vizij-ai.github.io/public/demos/assets/Quori_Current_Extended.glb`
3. Rig Controls stage exact path/value writes through `setInput()`.
4. Expressions map buttons to pose weight paths.
5. Gaze maps pointer movement to standard eye position paths.
6. Voice depends on external API configuration (`VITE_API_URL`) and drives viseme paths plus audio playback.

**Concrete examples to embed**

```tsx
const bundle = {
  namespace: "demo",
  glb: { kind: "url", src: new URL("./face.glb", import.meta.url).href },
};

<VizijRuntimeProvider assetBundle={bundle} autostart>
  <VizijRuntimeFace />
</VizijRuntimeProvider>;
```

```ts
setInput(`rig/${faceId}/standard/left_eye/pos/x`, { float: 0.4 });
setInput(`rig/${faceId}/standard/right_eye/pos/x`, { float: 0.4 });
```

```ts
// Voice demo dependency
// .env.local
VITE_API_URL="https://your-api-base.example.com"
```

**Validation**

1. Rig controls visibly change one face output.
2. Expression buttons return to neutral after release.
3. Gaze follows the pointer.
4. Voice playback visibly drives the mouth only when API configuration exists.

**Presentation ideas**

1. Add collapsible "How this works" drawers under each demo section.
2. Add a "Try it on the site / Build it in your app" two-column pattern.
3. Add path overlays for rig controls and pose buttons while interacting.

### 4.2 `/docs/`

**Learner goal**

Choose the right kind of page before they start reading.

**Must teach**

1. Docs explain system contracts and mental models.
2. Tutorials explain how to complete a build step.
3. Demos show live behavior.

**Concrete content**

Add a short routing block:

```md
If you want a face on screen quickly, start with Tutorials -> Hello Face.
If you want to understand why the face behaves the way it does, read Docs -> Renderer Data Model.
If you want to feel the runtime first, open Demos.
```

**Presentation ideas**

1. Add "Best for" tags on each card.
2. Add a three-path decision strip above the hub cards.

### 4.3 `/docs/getting-started/`

**Learner goal**

Set up the toolchain and understand the maintained learning path.

**Must teach**

1. Tooling:
   - Node.js 18+
   - pnpm 9 via Corepack for Vizij workspaces
2. Public maintained path and how it relates to current implementations:
   - `Hello Face` -> `tutorial-fullscreen-face`
   - `Authoring` -> `vizij-authoring`
   - runtime integration -> `demo-vizij-player`
   - live behavior -> `tutorial-agent-face`
   - deployment -> `vizij-standalone`
3. Fastest starter asset path:
   - use Quori sample assets first

**Concrete examples to embed**

```bash
corepack enable
pnpm install
```

```bash
cd vizij-web
pnpm run dev:tutorial-fullscreen-face
```

**Validation**

1. Reader knows which page/app to open first.
2. Reader can name the first artifact: a working runtime face.

**Presentation ideas**

1. Add a visual pipeline strip with exact app names in small reference text.
2. Add a "Start here now" command block.

### 4.4 `/docs/architecture/`

**Learner goal**

Understand how public docs, web apps, Rust cores, and assets fit together.

**Must teach**

1. `vizij-rs` owns runtime semantics and wasm packages.
2. `vizij-web` owns React packages and app surfaces.
3. `vizij-assets` owns shared binary samples.
4. `vizij-docs` owns internal strategy and architecture truth.
5. `vizij-ai.github.io` owns curated public teaching output.

**Concrete examples to embed**

```text
vizij-rs -> wasm packages
vizij-web/packages/@vizij/runtime-react -> runtime provider
vizij-web/apps/vizij-authoring -> bundle authoring/export
vizij-web/apps/tutorial-agent-face -> live speech/gaze/viseme integration
vizij-web/apps/vizij-standalone -> operator-facing desktop deployment
```

**Validation**

Reader can explain how one authored GLB moves through authoring, runtime, and deployment.

**Presentation ideas**

1. Add a repo-map diagram.
2. Add one lifecycle storyboard for a single face.

### 4.5 `/docs/renderer-data-model/`

**Learner goal**

Understand paths, values, namespaces, and state progression.

**Must teach**

1. Runtime inputs are staged by path and value.
2. `ValueJSON` uses explicit typed wrappers such as `{ float: 0.5 }`.
3. Namespace and face id matter.
4. Standard gaze uses four path writes for two-dimensional eye motion.

**Concrete examples to embed**

```tsx
const { setInput, faceId } = useVizijRuntime();

setInput(`rig/${faceId}/standard/left_eye/pos/x`, { float: 0.25 });
setInput(`rig/${faceId}/standard/right_eye/pos/x`, { float: 0.25 });
setInput(`rig/${faceId}/standard/left_eye/pos/y`, { float: -0.15 });
setInput(`rig/${faceId}/standard/right_eye/pos/y`, { float: -0.15 });
```

```json
[
  { "path": "rig/face/standard/left_eye/pos/x", "value": { "float": 0.25 } },
  { "path": "rig/face/standard/right_eye/pos/x", "value": { "float": 0.25 } }
]
```

**Validation**

Reader can predict which visible change a given path/value pair should cause.

**Presentation ideas**

1. Add a path-to-visual overlay on the face.
2. Add a "write log" panel that mirrors the live tutorial lab.

### 4.6 `/docs/rigging-and-control-model/`

**Learner goal**

Understand how reusable controls map onto face-specific implementation.

**Must teach**

1. Standard inputs are conventions under `/standard/...`.
2. Low-level generated rig channels live under `/propsrig/...`.
3. Abstract rig controls do not directly write animatable leaves.
4. Pose weights are addressed at `rig/{face}/poses/{poseId}.weight`.

**Concrete examples to embed**

```text
/standard/semio/left_eye/pos/x
/standard/semio/right_eye/pos/y
/propsrig/<face>/<shape>/<feature>/<component>
rig/<face>/poses/blink.weight
```

```json
{
  "path": "rig/quori/poses/viseme_p.weight",
  "value": { "float": 1 }
}
```

**Validation**

Reader can explain:

1. what is portable,
2. what is face-specific,
3. why `/propsrig` exists,
4. where pose weights are written.

**Presentation ideas**

1. Add a layered diagram from abstract control -> propsrig -> animatable.
2. Add side-by-side "portable path" vs "face-specific path" examples.

### 4.7 `/docs/animation-model/`

**Learner goal**

Understand the shape of animation assets and the runtime playback contract.

**Must teach**

1. Animation clips are reusable assets with duration, tracks, and keyframes.
2. Runtime can trigger stored clips or animate individual values.
3. Clip playback and ad hoc value tweens solve different problems.

**Concrete examples to embed**

```tsx
await playAnimation("greeting");
await animateValue(`rig/${faceId}/poses/blink.weight`, { float: 1 }, { duration: 0.18 });
```

```ts
const storedAnimation = {
  name: "Scalar Ramp",
  duration: 2000,
  tracks: [
    {
      id: "scalar",
      animatableId: "demo/scalar",
      points: [
        { id: "k0", stamp: 0.0, value: 0 },
        { id: "k1", stamp: 1.0, value: 1 },
      ],
    },
  ],
};
```

**Validation**

Reader can explain when to use `playAnimation()` and when to use `animateValue()`.

**Presentation ideas**

1. Add a timeline visualizer.
2. Add a small "clip anatomy" diagram.

### 4.8 `/docs/deployment-model/`

**Learner goal**

Understand the difference between browser deployment and standalone deployment.

**Must teach**

1. Browser runtime is still a first-class deployment target.
2. `vizij-standalone` is the operator-facing desktop path.
3. Standalone includes a WebSocket server and optional built-in web control panel.

**Concrete examples to embed**

```bash
pnpm run dev:vizij-standalone
pnpm tauri build
```

```bash
./vizij-standalone --glb /path/to/avatar.glb --fullscreen --display 1
```

```json
{
  "type": "set_slot_values",
  "values": {
    "standard/vizij/left_eye/pos/x": { "f64": 0.4 },
    "standard/vizij/right_eye/pos/x": { "f64": 0.4 }
  }
}
```

**Validation**

Reader can name the correct deployment mode for their use case and the first command to try.

**Presentation ideas**

1. Add a browser-vs-standalone comparison table.
2. Add a small operator workflow storyboard.

### 4.9 `/tutorials/`

**Learner goal**

Choose the next build step confidently.

**Must teach**

1. Which pages have runnable labs.
2. Which pages are workflow-heavy and rely on screenshots/code.
3. Which implementation surfaces back each tutorial.

**Concrete content**

Add per-card metadata like:

```md
Backed by: tutorial-fullscreen-face
Backed by: vizij-authoring
Backed by: tutorial-agent-face
Backed by: vizij-standalone
```

**Presentation ideas**

1. Add a progress spine.
2. Add "You will build" text on every card.

### 4.10 `/tutorials/hello-face/`

**Learner goal**

Render a face and trigger one deterministic visible change.

**Must teach**

1. How to install runtime dependencies.
2. How to define a minimal asset bundle.
3. How to render a `VizijRuntimeFace`.
4. How to trigger one pose or one path write.
5. That the package depends on wasm assets and the app bundler must emit `.wasm` resources correctly.

**Concrete examples to embed**

```bash
pnpm add @vizij/runtime-react @vizij/render @vizij/orchestrator-react react react-dom
```

```tsx
const assetBundle = {
  namespace: "demo",
  glb: { kind: "url", src: new URL("./face.glb", import.meta.url).href },
  pose: {
    stageNeutralFilter: (_id, path) => !path.includes("/color/"),
  },
};

export function App() {
  return (
    <VizijRuntimeProvider assetBundle={assetBundle} autostart>
      <VizijRuntimeFace />
    </VizijRuntimeProvider>
  );
}
```

```ts
setInput(`rig/${faceId}/poses/blink.weight`, { float: 1 });
```

**Validation**

1. Face appears.
2. Loading state clears.
3. Trigger causes visible expression change.

**Presentation ideas**

1. Pair the runnable lab with a "lab -> code" mapping callout.
2. Add a tiny status HUD screenshot.

### 4.11 `/tutorials/renderer-data-model/`

**Learner goal**

Reproduce the live path writes used in the lab.

**Must teach**

1. The four standard gaze paths.
2. Why two UI sliders produce four path writes.
3. How clamping works.

**Concrete examples to embed**

```ts
const STANDARD_GAZE_PATHS = {
  leftX: "standard/left_eye/pos/x",
  leftY: "standard/left_eye/pos/y",
  rightX: "standard/right_eye/pos/x",
  rightY: "standard/right_eye/pos/y",
};
```

```ts
setInput(`rig/${faceId}/${STANDARD_GAZE_PATHS.leftX}`, { float: nextHorizontal });
setInput(`rig/${faceId}/${STANDARD_GAZE_PATHS.rightX}`, { float: nextHorizontal });
setInput(`rig/${faceId}/${STANDARD_GAZE_PATHS.leftY}`, { float: nextVertical });
setInput(`rig/${faceId}/${STANDARD_GAZE_PATHS.rightY}`, { float: nextVertical });
```

**Validation**

Reader can connect the path list to the visible eye movement.

**Presentation ideas**

1. Add highlighted path chips that light up while the slider moves.
2. Add a "what changed?" reflection prompt below the lab.

### 4.12 `/tutorials/authoring/`

**Learner goal**

Import a face, inspect it, rig it, and export a runtime-usable bundle.

**Must teach**

1. `vizij-authoring` is the reference implementation.
2. Import options include local GLB, URL, graph imports, or bundled GLB.
3. Export target is a bundled GLB with Vizij metadata.
4. Important authored layers:
   - animatable layer,
   - `/propsrig`,
   - abstract rig,
   - poses.

**Concrete examples to embed**

```bash
cd vizij-web
pnpm --filter vizij-authoring dev
```

```md
Checklist:
1. Load GLB.
2. Inspect discovered animatables.
3. Verify generated `/propsrig` channels.
4. Create or validate abstract rig inputs.
5. Add poses or pose groups.
6. Export bundled GLB.
7. Validate in a runtime app immediately.
```

**Validation**

Reader can name the exported artifact and the next runtime surface to test it in.

**Presentation ideas**

1. Use annotated screenshots of the Setup, Channels, and Mapping tabs.
2. Use a "before export / after export" artifact panel.

### 4.13 `/tutorials/rigging-and-control/`

**Learner goal**

Map portable controls and custom controls onto a real face.

**Must teach**

1. Standard controls first, custom controls second.
2. Pose weight paths and standard input paths are both part of the control story.
3. Validation should happen in runtime, not only in authoring.

**Concrete examples to embed**

```text
Portable:
/standard/semio/left_eye/pos/x

Runtime pose control:
rig/quori/poses/viseme_p.weight
```

```md
Validation pass:
1. Trigger standard gaze inputs.
2. Trigger one pose weight.
3. Confirm exported bundle behaves the same in a runtime app.
```

**Validation**

Reader can explain which control is standardized and which is face-specific.

**Presentation ideas**

1. Use a "friendly control -> path fan-out" diagram.
2. Link the authoring screen to the existing rigging lab directly.

### 4.14 `/tutorials/minimal-player/`

**Learner goal**

Build the smallest reliable runtime shell outside authoring.

**Must teach**

1. This page should map explicitly to `tutorial-fullscreen-face`.
2. A minimal player is just:
   - asset bundle,
   - runtime provider,
   - runtime face,
   - loading/error handling,
   - optional simple interaction.
3. The bundler still needs the runtime wasm packages to resolve correctly.

**Concrete examples to embed**

```bash
cd vizij-web
pnpm run dev:tutorial-fullscreen-face
```

```tsx
if (loading) return <div>Loading face…</div>;
if (error) return <div>Error: {error.message}</div>;

return (
  <div className="fullscreen">
    <VizijRuntimeFace className="face-canvas" showSafeArea={false} />
  </div>
);
```

**Validation**

Reader can build a player that loads a bundle, renders, and reports status.

**Presentation ideas**

1. Use a "copy this skeleton" code card.
2. Show what not to include yet.

### 4.15 `/tutorials/animations/`

**Learner goal**

Add reusable motion and reason about playback state.

**Must teach**

1. Sequence playback used by the site lab is a teaching stand-in, not the whole animation system.
2. Runtime supports both stored clip playback and ad hoc rig-value tweening.

**Concrete examples to embed**

```tsx
await animateValue(binding.weightPath, { float: 1 }, { duration: 0.18 });
await animateValue(binding.weightPath, { float: 0 }, { duration: 0.18 });
```

```tsx
<AnimationProvider animations={storedAnimation} autostart updateHz={60}>
  <Panel />
</AnimationProvider>
```

**Validation**

Reader can:

1. start motion,
2. stop/reset motion,
3. explain what state the face ends in.

**Presentation ideas**

1. Add a timeline strip with playback head.
2. Add a "sequence order" badge list like the current lab, but explain the code behind it.

### 4.16 `/tutorials/agent-face/`

**Learner goal**

Connect a face to live conversational behavior safely and legibly.

**Must teach**

1. The reference app is `tutorial-agent-face`.
2. Required env:
   - `VITE_GEMINI_API_KEY`
3. Core live pieces:
   - mouse gaze,
   - idle gaze,
   - pose warmup,
   - Gemini live session,
   - viseme mouth,
   - speech anticipation,
   - optional tool-calling for gaze and emotion.

**Concrete examples to embed**

```bash
cd vizij-web
VITE_GEMINI_API_KEY=your_key pnpm --filter tutorial-agent-face dev
```

```ts
const SYSTEM_INSTRUCTION = [
  "Use express_emotion(emotion, intensity?, holdSeconds?)",
  "Use set_gaze(x, y, blink?, holdSeconds?)",
].join("\\n");
```

```ts
useVisemeMouth({
  audioManager,
  currentOutput: agentTranscript,
  enabled: geminiStatus === LiveStatus.CONNECTED,
  mode: mouthMode,
  transitionMs: blendWindowMs,
  leadMs,
});
```

**Validation**

Reader can explain:

1. what live services are required,
2. how the face degrades if they fail,
3. where gaze, emotion, and mouth behavior originate.

**Presentation ideas**

1. Add a "live pipeline" diagram.
2. Use audio/transcript/face timeline cards.

### 4.17 `/tutorials/deployment/`

**Learner goal**

Run a working face in browser or standalone mode with known operator expectations.

**Must teach**

1. Build and run commands for standalone.
2. Command-line options.
3. WebSocket endpoint and control panel behavior.
4. Browser runtime remains valid when desktop packaging is not needed.

**Concrete examples to embed**

```bash
pnpm run dev:vizij-standalone
pnpm tauri build
```

```bash
./vizij-standalone --glb /path/to/avatar.glb --fullscreen --display 1
```

```bash
npx wscat -c ws://localhost:9000
```

**Validation**

1. Standalone app loads a GLB.
2. WebSocket server is running.
3. Reader can send at least one control message.

**Presentation ideas**

1. Add a deployment mode chooser.
2. Add an operator checklist with "before demo / during demo / recovery" states.

## 5. Suggested Page Components To Build

To implement the content above without turning every page into an essay, add a small reusable teaching component set:

1. `OutcomeCard`
2. `PrereqChecklist`
3. `ArtifactTarget`
4. `CodeBridge`
5. `ValidationBlock`
6. `FailureModeTable`
7. `ImplementationReferenceCallout`
8. `PathExampleList`
9. `RuntimeFlowDiagram`

## 6. Engagement Ideas For The Follow-Up Design Pass

These ideas keep the pages educational without making them feel like dry internal docs.

1. **Lab-to-code toggles**: every runnable lab gets a synchronized code panel.
2. **Animated path overlays**: show which paths update when the user moves a control.
3. **Artifact cards**: show the exact output file or app state each tutorial creates.
4. **Failure-state storytelling**: show "what wrong looks like" for asset load failures, missing env vars, or wrong paths.
5. **Progress spine**: carry a persistent tutorial-progress rail across all tutorial pages.
6. **Reference implementation badges**: every page labels the app/package that currently backs it.
7. **Layer diagrams**: especially for rigging, animation, and deployment.
8. **Operator mode framing**: deployment pages should feel like handing the system to a real operator, not only publishing a build.

## 7. Minimum Deliverable For A Teaching-Ready First Pass

If time is limited, a first pass is sufficient when every page in scope has:

1. one real outcome,
2. one real example,
3. one real validation checkpoint,
4. one real troubleshooting section,
5. one exact implementation reference,
6. no false implication that the page is a full walkthrough when it is not.

## 8. Route-To-Source Anchor Map

The public rewrite should stay page-specific. These route maps connect each public page to the exact implementation surfaces that substantiate it.

### 8.1 `/demos/`

1. Site route and composition:
   - `vizij-ai.github.io/src/pages/demos.astro`
   - `vizij-ai.github.io/src/react-pages/demos/DemosPage.tsx`
2. Shared site runtime:
   - `vizij-ai.github.io/src/components/demos/ShowcaseRuntime.tsx`
   - `vizij-ai.github.io/src/components/demos/RuntimeFaceFrame.tsx`
3. Section behaviors:
   - `vizij-ai.github.io/src/components/demos/RigControlPanel.tsx`
   - `vizij-ai.github.io/src/components/demos/PoseButtonPanel.tsx`
   - `vizij-ai.github.io/src/components/demos/GazeInteractiveFace.tsx`
   - `vizij-ai.github.io/src/components/demos/VoicePanel.tsx`
4. Underlying runtime behavior:
   - `vizij-ai.github.io/src/demo-lib/useMouseGaze.ts`
   - `vizij-ai.github.io/src/demo-lib/usePoseHotkeys.ts`
   - `vizij-web/packages/@vizij/runtime-react/README.md`

### 8.2 `/docs/`

1. Hub copy:
   - `vizij-ai.github.io/src/site-content/vizij/hubs.ts`
2. Hub renderer:
   - `vizij-ai.github.io/src/components/guides/HubPage.tsx`
3. Cross-page framing truth:
   - `vizij-docs/current_documentation/ROADMAP.md`
   - `vizij-docs/current_documentation/ARCHITECTURE.md`

### 8.3 `/docs/getting-started/`

1. Public copy:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
2. Maintained implementation path:
   - `vizij-web/package.json`
   - `vizij-web/apps/tutorial-fullscreen-face/package.json`
   - `vizij-web/apps/tutorial-agent-face/package.json`
3. Project-level guidance:
   - `vizij-web/README.md`
   - `vizij-docs/current_documentation/ROADMAP.md`

### 8.4 `/docs/architecture/`

1. Public copy:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
2. Canonical repo roles:
   - `vizij-docs/current_documentation/ARCHITECTURE.md`
   - `vizij-web/README.md`
   - `vizij-rs/README.md`
3. Representative implementation surfaces:
   - `vizij-web/packages/@vizij/runtime-react/src/VizijRuntimeProvider.tsx`
   - `vizij-web/apps/vizij-authoring/README.md`
   - `vizij-web/apps/vizij-standalone/README.md`

### 8.5 `/docs/renderer-data-model/`

1. Public copy and lab:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
   - `vizij-ai.github.io/src/components/tutorial-labs/RendererDataModelLab.tsx`
2. Runtime API:
   - `vizij-web/packages/@vizij/runtime-react/README.md`
   - `vizij-web/packages/@vizij/runtime-react/src/hooks/useVizijRuntime.ts`
3. Typed value and path conventions:
   - `vizij-rs/crates/api/vizij-api-core/README.md`
   - `vizij-rs/npm/@vizij/value-json/README.md`
   - `vizij-docs/current_documentation/workshops/vizij-afternoon-workshop/handouts/renderer-rigging-reference.md`

### 8.6 `/docs/rigging-and-control-model/`

1. Public copy:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
2. Standard-path and normalization behavior:
   - `vizij-web/packages/@vizij/utils/src/rig/standard-inputs.ts`
3. Authoring and rig-layer truth:
   - `vizij-web/apps/vizij-authoring/README.md`
   - `vizij-web/apps/vizij-authoring/docs/ARCHITECTURE.md`
   - `vizij-web/apps/vizij-authoring/docs/Authoring_Blueprint.md`

### 8.7 `/docs/animation-model/`

1. Public copy and micro-lab:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
   - `vizij-ai.github.io/src/components/tutorial-labs/AnimationLab.tsx`
2. Runtime animation hooks:
   - `vizij-web/packages/@vizij/runtime-react/README.md`
   - `vizij-web/packages/@vizij/animation-react/README.md`
3. Workshop reference:
   - `vizij-docs/current_documentation/workshops/vizij-afternoon-workshop/handouts/animation-integration-deployment-reference.md`

### 8.8 `/docs/deployment-model/`

1. Public copy:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
2. Standalone operational reference:
   - `vizij-web/apps/vizij-standalone/README.md`
   - `vizij-web/packages/arora-websocket/src/server.rs`
3. Workshop deployment reference:
   - `vizij-docs/current_documentation/workshops/vizij-afternoon-workshop/handouts/animation-integration-deployment-reference.md`

### 8.9 `/tutorials/`

1. Hub copy:
   - `vizij-ai.github.io/src/site-content/vizij/hubs.ts`
2. Hub renderer:
   - `vizij-ai.github.io/src/components/guides/HubPage.tsx`
3. Maintained app sequence:
   - `vizij-web/package.json`
   - `vizij-docs/current_documentation/ROADMAP.md`

### 8.10 `/tutorials/hello-face/`

1. Public copy and lab:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
   - `vizij-ai.github.io/src/components/tutorial-labs/HelloFaceLab.tsx`
2. Reference implementation:
   - `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
   - `vizij-web/apps/tutorial-fullscreen-face/src/FaceApp.tsx`
   - `vizij-web/apps/tutorial-fullscreen-face/src/hooks/useMouseGaze.ts`
   - `vizij-web/apps/tutorial-fullscreen-face/src/hooks/usePoseHotkeys.ts`
3. Runtime package:
   - `vizij-web/packages/@vizij/runtime-react/README.md`

### 8.11 `/tutorials/renderer-data-model/`

1. Public copy and lab:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
   - `vizij-ai.github.io/src/components/tutorial-labs/RendererDataModelLab.tsx`
2. Runtime and typed-value APIs:
   - `vizij-web/packages/@vizij/runtime-react/README.md`
   - `vizij-rs/npm/@vizij/value-json/README.md`
3. Path reference:
   - `vizij-docs/current_documentation/workshops/vizij-afternoon-workshop/handouts/renderer-rigging-reference.md`

### 8.12 `/tutorials/authoring/`

1. Public copy:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
2. Reference app and docs:
   - `vizij-web/apps/vizij-authoring/README.md`
   - `vizij-web/apps/vizij-authoring/docs/README.md`
   - `vizij-web/apps/vizij-authoring/docs/ARCHITECTURE.md`
   - `vizij-web/apps/vizij-authoring/docs/Authoring_Blueprint.md`
3. Export/runtime bridge:
   - `vizij-web/apps/vizij-authoring/src/utils/runtimeBundle.ts`
   - `vizij-web/apps/vizij-authoring/src/hooks/useVizijExport.ts`

### 8.13 `/tutorials/rigging-and-control/`

1. Public copy and lab:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
   - `vizij-ai.github.io/src/components/tutorial-labs/RiggingControlLab.tsx`
2. Authoring control model:
   - `vizij-web/apps/vizij-authoring/README.md`
   - `vizij-web/apps/vizij-authoring/src/utils/standardInputPaths.ts`
   - `vizij-web/apps/vizij-authoring/src/utils/standardInputs.ts`
   - `vizij-web/packages/@vizij/utils/src/rig/standard-inputs.ts`
3. Pose-weight truth:
   - `vizij-web/apps/vizij-authoring/docs/ARCHITECTURE.md`

### 8.14 `/tutorials/minimal-player/`

1. Public copy:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
2. Minimal runtime reference:
   - `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
   - `vizij-web/apps/tutorial-fullscreen-face/src/FaceApp.tsx`
3. Heavier playback reference:
   - `vizij-web/apps/demo-vizij-player/README.md`
   - `vizij-web/apps/demo-vizij-player/src/App.tsx`

### 8.15 `/tutorials/animations/`

1. Public copy and lab:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
   - `vizij-ai.github.io/src/components/tutorial-labs/AnimationLab.tsx`
2. Runtime animation surfaces:
   - `vizij-web/packages/@vizij/runtime-react/README.md`
   - `vizij-web/packages/@vizij/animation-react/README.md`
3. Reference player and workshop material:
   - `vizij-web/apps/demo-vizij-player/src/components/AnimationPanel.tsx`
   - `vizij-docs/current_documentation/workshops/vizij-afternoon-workshop/handouts/animation-integration-deployment-reference.md`

### 8.16 `/tutorials/agent-face/`

1. Public copy:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
2. Reference implementation:
   - `vizij-web/apps/tutorial-agent-face/tutorial.md`
   - `vizij-web/apps/tutorial-agent-face/src/FaceApp.tsx`
   - `vizij-web/apps/tutorial-agent-face/src/hooks/useGeminiLive.ts`
   - `vizij-web/apps/tutorial-agent-face/src/hooks/useAgentFaceTools.ts`
   - `vizij-web/apps/tutorial-agent-face/src/hooks/useVisemeMouth.ts`
3. Workshop operational notes:
   - `vizij-docs/current_documentation/workshops/vizij-afternoon-workshop/handouts/animation-integration-deployment-reference.md`
   - `vizij-docs/current_documentation/workshops/vizij-afternoon-workshop/checklists/troubleshooting-playbook.md`

### 8.17 `/tutorials/deployment/`

1. Public copy:
   - `vizij-ai.github.io/src/site-content/vizij/guides.ts`
2. Standalone delivery reference:
   - `vizij-web/apps/vizij-standalone/README.md`
   - `vizij-web/apps/vizij-standalone/src/App.tsx`
   - `vizij-web/apps/vizij-standalone/src/hooks/useWebSocketSync.ts`
3. Protocol and operator references:
   - `vizij-web/packages/arora-websocket/src/server.rs`
   - `vizij-docs/current_documentation/workshops/vizij-afternoon-workshop/handouts/animation-integration-deployment-reference.md`
