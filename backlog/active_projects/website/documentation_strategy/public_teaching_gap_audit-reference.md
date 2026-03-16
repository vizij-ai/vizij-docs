<!-- tags: type=reference; status=in_progress; topics=website,documentation,teaching,audit -->

> **Related documents:** [Website & Ecosystem summary](../summary.md) · [Documentation Strategy & Content - Plan & Tracking](documentation_strategy-plan.md) · [Vizij Architecture & Documentation Guide](../../../../current_documentation/ARCHITECTURE.md) · [Public Page Teaching Sourcebook](public_page_content_brief-reference.md)
>
> **Last updated:** 2026-03-10
> **Scope:** `vizij-ai.github.io` routes under `/demos`, `/docs`, and `/tutorials`

# Public Teaching Gap Audit

## 1. Purpose

This audit reviews the current rendered public learning surfaces on `vizij-ai.github.io` as teaching tools, not as marketing pages.

The question for every page is:

> If a reader arrives with the intent implied by the page title, does the page teach enough correct, actionable information for them to go do that work on their own?

For the current site, the answer is usually "not yet."

The pages are visually coherent and structurally organized, but most of them still:

1. explain concepts rather than teach workflows,
2. announce a learning outcome without showing the concrete commands, files, paths, or code that produce that outcome,
3. point at implementation references without extracting the exact knowledge a reader needs, and
4. omit the validation checkpoints and failure cases that make learning transferable.

## 2. Review Method

This audit was grounded in four evidence layers:

1. Rendered route inventory and live page structure in `vizij-ai.github.io`
2. Source copy in `vizij-ai.github.io/src/site-content/vizij/guides.ts` and `hubs.ts`
3. Runnable lab and demo component behavior in `vizij-ai.github.io/src/components/tutorial-labs/*` and `src/components/demos/*`
4. Cross-repo implementation references in:
   - `vizij-web/packages/@vizij/runtime-react`
   - `vizij-web/packages/@vizij/render`
   - `vizij-web/packages/@vizij/animation-react`
   - `vizij-web/packages/@vizij/orchestrator-react`
   - `vizij-web/apps/tutorial-fullscreen-face`
   - `vizij-web/apps/tutorial-agent-face`
   - `vizij-web/apps/vizij-authoring`
   - `vizij-web/apps/vizij-standalone`
   - `vizij-docs/current_documentation/*`
   - `vizij-assets/*`

One quick rendered sanity check is worth calling out explicitly:

1. The reviewed `/docs/*` and `/tutorials/*` routes currently render with zero `<pre>` and zero `<code>` blocks in the delivered HTML.
2. For technical learning pages, that strongly correlates with the larger source-level finding: the current pages are mostly prose and navigation, not reproducible instruction.

## 3. Cross-Cutting Findings

### 3.1 The current pages mostly describe; they do not yet teach

The guide pages follow a clean pattern:

1. hero,
2. overview cards,
3. optional lab,
4. concept sections,
5. resource links.

That pattern is good for readability, but it is not enough for learning. The typical page still lacks:

1. exact setup commands,
2. required files and where they come from,
3. exact APIs or path shapes,
4. a minimal reproducible code example,
5. a "what to do when this fails" section tied to real failure modes,
6. a concrete artifact the learner should produce by the end.

### 3.2 The site promises walkthroughs that are longer and richer than the content supports

Examples:

1. `/tutorials/hello-face/` claims a 30-45 minute walkthrough but currently gives a short lab and three high-level prose sections.
2. `/tutorials/authoring/`, `/tutorials/minimal-player/`, `/tutorials/agent-face/`, and `/tutorials/deployment/` are labeled as walkthroughs or guides but do not contain enough steps to reproduce the workflow outside the page.

### 3.3 The tutorial micro-labs are useful, but they teach only the "feel" of the concept

The runnable labs do succeed at one narrow thing:

1. Hello Face proves that a face can load and one pose can be triggered.
2. Renderer Data Model proves that changing a few paths changes the face.
3. Rigging and Control proves that one friendly control can fan out into multiple rig paths.
4. Animations proves that a short timed sequence can play and reset.

What they do not currently teach is how to recreate that result in a real project. They need explicit "how this lab maps to code" callouts on the page itself.

### 3.4 The site does not yet consistently distinguish between concept pages and build pages

The docs pages should primarily teach mental models.

The tutorial pages should primarily teach task completion.

Right now both sets of pages use nearly the same content shape and nearly the same prose style, so the distinction between:

1. "understand this system"
2. "build this thing"

is too weak.

### 3.5 The public tutorial spine is not fully aligned with the internal maintained path

`vizij-docs/current_documentation/ROADMAP.md` defines the current public learning system as:

1. website as the landing and routing layer
2. mandatory builder spine:
   `Hello Face -> Authoring -> Player -> Deployment`
3. optional richer examples after `Player`, kept clearly secondary to the main route

The public site currently presents a different middle spine:

`Hello Face -> Renderer Data Model -> Authoring -> Rigging and Control -> Minimal Player -> Animations -> Agent Face -> Deployment`

This is not inherently wrong, but the site needs to explain the relationship explicitly:

1. which pages are conceptual prerequisites,
2. which pages map to maintained reference apps,
3. which pages are public abstractions over implementation-specific apps.

### 3.6 Demos expose powerful behaviors without teaching the underlying contracts

`/demos/` currently shows:

1. rig overrides,
2. pose-triggered expressions,
3. gaze interaction,
4. voice/viseme playback,
5. architecture cards.

That makes the system feel real, but not learnable. Readers can observe behavior without learning:

1. which paths are being written,
2. which runtime APIs are in play,
3. which asset metadata is required,
4. which external services are required,
5. how to reproduce the behavior.

### 3.7 Some pages omit important operational constraints that are already known in the codebase

Examples:

1. voice demos rely on `VITE_API_URL` and fail without it,
2. `tutorial-agent-face` requires `VITE_GEMINI_API_KEY`,
3. runtime-react depends on `.wasm` bundler configuration,
4. authoring exports are only meaningful when Vizij bundle metadata is embedded or manually supplied,
5. standard inputs and `/propsrig` contracts matter for portability, but the current pages do not teach them concretely.

## 4. Route-by-Route Audit Summary

| Route | What the page promises | Current teaching value | Main gap |
| --- | --- | --- | --- |
| `/demos/` | Try Vizij behavior live | Good experiential proof | Weak explanation of what is happening and how to reproduce it |
| `/docs/` | Understand core docs set | Good routing hub | Does not preview actual deliverables or how docs differ from tutorials |
| `/docs/getting-started/` | Start correctly | Good orientation prose | No install/setup, no artifact checklist, no exact next action |
| `/docs/architecture/` | Understand system layers | Good high-level framing | No concrete repo/app/package mapping diagrams or lifecycle example |
| `/docs/renderer-data-model/` | Understand paths and values | Good concept summary | No canonical path examples, no ValueJSON example, no state flow example |
| `/docs/rigging-and-control-model/` | Understand control portability | Good conceptual framing | No concrete standard path examples, no `/propsrig` explanation, no exported bundle example |
| `/docs/animation-model/` | Understand motion model | Good animation framing | No clip schema example, no playback API example, no authoring/runtime boundary example |
| `/docs/deployment-model/` | Understand deployment branches | Good strategic framing | No browser vs standalone comparison with concrete commands, files, and protocols |
| `/tutorials/` | Follow one maintained learning path | Good navigation hub | Does not explain which pages are conceptual vs implementation-backed |
| `/tutorials/hello-face/` | Get a face running | Useful micro-lab | No code, no asset preparation, no runtime provider example on the page |
| `/tutorials/renderer-data-model/` | Learn path writes | Useful micro-lab | No explanation of `setInput`, namespace, face id, or `ValueJSON` beyond the live widget |
| `/tutorials/authoring/` | Learn authoring workflow | Conceptual scaffold only | No UI steps, no export checklist, no screenshots, no runtime validation loop |
| `/tutorials/rigging-and-control/` | Learn rig mapping | Useful micro-lab | No actual authoring workflow, no binding path examples, no validation checklist |
| `/tutorials/minimal-player/` | Build a minimal runtime player | Conceptual scaffold only | No app skeleton, no provider code, no asset bundle example |
| `/tutorials/animations/` | Add reusable motion | Useful micro-lab | No clip authoring/export/import explanation, no API example beyond the demo logic |
| `/tutorials/agent-face/` | Integrate live conversational behavior | Conceptual scaffold only | No env setup, no integration boundary diagram, no viseme/emotion/gaze pipeline explanation |
| `/tutorials/deployment/` | Deploy a working face | Conceptual scaffold only | No build/run commands, no standalone CLI, no WebSocket payloads, no operator checklist |

## 5. Page-by-Page Findings

### 5.1 `/demos/`

**What a reader expects**

They expect to learn what Vizij can do and how those capabilities map to actual runtime concepts.

**What the page currently gives**

1. Live face previews
2. Search-and-stage rig control UI
3. Pose-triggered expression previews
4. Pointer-driven gaze interactions
5. Polly-backed voice/viseme playback UI
6. Three short architecture cards

**Why that is not enough**

The page proves behavior, but it does not teach:

1. the control path shapes behind the rig controls,
2. the pose weight paths behind expressions,
3. the standard gaze paths used by the gaze and renderer-data-model labs,
4. the voice service dependency (`VITE_API_URL`),
5. how the page is composed from `VizijRuntimeProvider`, `ShowcaseRuntime`, and asset bundles.

**Content gaps**

1. Add a "How each section works" explainer under every demo section.
2. Add one expandable code sample per section.
3. Add explicit dependency notes for the voice section.
4. Add "If you want to build this yourself, start here" links that point to tutorials and exact app/package references, not only the docs hub.

### 5.2 `/docs/`

**What a reader expects**

They expect the docs hub to explain the role of the docs relative to tutorials and demos.

**What the page currently gives**

A good card-based index, but no explicit explanation of:

1. what a doc page teaches,
2. what a tutorial page teaches,
3. what they should do first if their goal is "I want a face on screen."

**Content gaps**

1. Add a "How to use this site" section above the cards.
2. Make the first branching question explicit:
   - "Need a mental model?" -> docs
   - "Need a reproducible build?" -> tutorials
   - "Need to see behavior first?" -> demos

### 5.3 `/docs/getting-started/`

**What a reader expects**

A practical starting point with prerequisites, toolchain, and a first working artifact.

**What the page currently gives**

A learning-order explanation and success signals, but not:

1. installation commands,
2. current maintained app references,
3. asset requirements,
4. a concrete "first output" to build.

**Content gaps**

1. Add Node/pnpm prerequisites.
2. Add the actual package/app sequence:
   - public tutorials
   - `tutorial-fullscreen-face`
   - `vizij-authoring`
   - `demo-vizij-player`
   - `tutorial-agent-face`
   - `vizij-standalone`
3. Add the minimal asset/bundle requirement.
4. Add a literal "do this next" command block.

### 5.4 `/docs/architecture/`

**What a reader expects**

A concrete explanation of how the repos, packages, apps, assets, and public site fit together.

**What the page currently gives**

A solid layered story, but without enough verified structure:

1. no repo diagram,
2. no package/app mapping,
3. no walkthrough of how one exported GLB moves from authoring to runtime to deployment.

**Content gaps**

1. Add a repo/app/package table extracted from `vizij-docs/current_documentation/ARCHITECTURE.md`.
2. Add one concrete lifecycle example:
   - export a bundled GLB,
   - load it in `VizijRuntimeProvider`,
   - extend it in `tutorial-agent-face`,
   - deploy it via browser or `vizij-standalone`.

### 5.5 `/docs/renderer-data-model/`

**What a reader expects**

A clear explanation of paths, values, namespaces, and renderer-visible outputs.

**What the page currently gives**

High-level prose, but no canonical examples.

**Content gaps**

1. Show a real `setInput` example.
2. Show a real path family:
   - `rig/<face>/standard/left_eye/pos/x`
   - `rig/<face>/standard/right_eye/pos/x`
3. Explain `ValueJSON` using `{ float: ... }` examples.
4. Explain how `faceId` and `namespace` resolve in `useVizijRuntime()`.

### 5.6 `/docs/rigging-and-control-model/`

**What a reader expects**

A concrete explanation of how standard controls, abstract rig inputs, propsrig channels, and pose weights relate.

**What the page currently gives**

Good conceptual framing, but it omits the actual current contracts.

**Content gaps**

1. Teach the current authoring layer model from `vizij-authoring/docs/ARCHITECTURE.md` and `Authoring_Blueprint.md`.
2. Show the current generated low-level namespace: `/propsrig/...`
3. Show the current pose weight path: `rig/{face}/poses/{poseId}.weight`
4. Show one standard-input path family and how it differs from face-specific low-level paths.

### 5.7 `/docs/animation-model/`

**What a reader expects**

A real explanation of what an animation asset is in Vizij and how runtime playback works.

**What the page currently gives**

High-level language about reusable motion, but no clip shape or runtime API.

**Content gaps**

1. Show the actual clip shape at a simplified level:
   - animation id
   - duration
   - tracks
   - keyframes
2. Explain `playAnimation`, `stopAnimation`, and `animateValue`.
3. Explain the difference between clip playback and ad hoc rig-value tweening.
4. Show the authoring/runtime boundary clearly.

### 5.8 `/docs/deployment-model/`

**What a reader expects**

A practical explanation of browser deployment vs standalone deployment.

**What the page currently gives**

Strategy-level language about operator surfaces, but not enough task-level content.

**Content gaps**

1. Compare browser and standalone modes explicitly.
2. Add build/run commands.
3. Add the `vizij-standalone` CLI options and WebSocket endpoint.
4. Add one example JSON control payload.

### 5.9 `/tutorials/`

**What a reader expects**

A route through the learning sequence with clear page roles.

**What the page currently gives**

A good card index, but not enough sequencing clarity.

**Content gaps**

1. Mark pages as either:
   - concept prerequisite,
   - app-backed build step,
   - integration/deployment step.
2. State which pages have runnable labs and which pages rely on screenshots, code, or repo-local references.

### 5.10 `/tutorials/hello-face/`

**What a reader expects**

To build the first working face.

**What the page currently gives**

A good micro-lab and useful success signal, but no reusable recipe.

**Content gaps**

1. Add package install commands.
2. Add a minimal `VizijRuntimeProvider` + `VizijRuntimeFace` example.
3. Explain asset bundle anatomy.
4. Explain where the sample asset comes from.
5. Explain how the lab's pose buttons map to `rig/<face>/poses/...weight`.

### 5.11 `/tutorials/renderer-data-model/`

**What a reader expects**

To understand and reproduce path writes.

**What the page currently gives**

A useful live widget, but no explicit bridge from widget to code.

**Content gaps**

1. Add the exact `setInput()` calls used by the lab.
2. Explain why four paths move when two sliders move.
3. Explain range clamping and the meaning of `float`.
4. Explain namespace and face id resolution.

### 5.12 `/tutorials/authoring/`

**What a reader expects**

A usable import -> inspect -> edit -> export workflow.

**What the page currently gives**

Only conceptual summary text.

**Content gaps**

1. Add UI-backed step sequence from `vizij-authoring`.
2. Add screenshots or annotated panels.
3. Add export checklist:
   - bundled GLB
   - embedded `VIZIJ_bundle`
   - rig graph
   - pose config
   - animation metadata when present
4. Add "validate in runtime immediately" step.

### 5.13 `/tutorials/rigging-and-control/`

**What a reader expects**

To connect abstract controls to concrete face behavior.

**What the page currently gives**

One good lab plus conceptual prose, but not the real authoring workflow.

**Content gaps**

1. Add standard-input path conventions.
2. Add `/propsrig` and abstract-rig boundary explanation.
3. Add a binding example from authoring.
4. Add a validation pass in runtime and what to inspect when it fails.

### 5.14 `/tutorials/minimal-player/`

**What a reader expects**

To build the smallest standalone runtime surface outside authoring.

**What the page currently gives**

Only conceptual advice.

**Content gaps**

1. Add the actual app skeleton.
2. Add the exact asset bundle shape.
3. Add one status HUD pattern.
4. Add one optional interaction hook example.
5. Clarify whether this page maps to `tutorial-fullscreen-face`, `demo-vizij-player`, or both.

### 5.15 `/tutorials/animations/`

**What a reader expects**

To add reusable motion and understand playback.

**What the page currently gives**

A useful sequence lab, but not enough file/API detail.

**Content gaps**

1. Add clip structure example.
2. Add `AnimationProvider` or runtime clip playback example.
3. Explain when to use `playAnimation` vs `animateValue`.
4. Add troubleshooting for wrong clip id, timing, and reset behavior.

### 5.16 `/tutorials/agent-face/`

**What a reader expects**

To integrate live speech, visemes, gaze, emotions, and an agent backend.

**What the page currently gives**

A conceptual summary only.

**Content gaps**

1. Add env requirements:
   - `VITE_GEMINI_API_KEY`
2. Add runtime bundle setup.
3. Add viseme path conventions.
4. Add mouth mode explanation.
5. Add tool-calling boundary:
   - gaze tool
   - express-emotion tool
6. Add graceful-degradation checklist.

### 5.17 `/tutorials/deployment/`

**What a reader expects**

To run a built face outside local dev and understand operator-facing delivery.

**What the page currently gives**

Conceptual language, no operational procedure.

**Content gaps**

1. Add browser deployment steps.
2. Add `vizij-standalone` build and run commands.
3. Add WebSocket protocol example.
4. Add operator workflow checklist.
5. Add known limitations and follow-on work.

## 6. Highest-Value Fixes First

If this audit is implemented incrementally, the highest-value sequence is:

1. Fix `/docs/getting-started/`, `/tutorials/hello-face/`, `/tutorials/minimal-player/`, and `/tutorials/deployment/`
2. Add code-backed teaching content to `/tutorials/renderer-data-model/`, `/tutorials/rigging-and-control/`, and `/tutorials/animations/`
3. Add real workflow instruction to `/tutorials/authoring/` and `/tutorials/agent-face/`
4. Upgrade `/docs/*` pages with canonical path, bundle, and deployment examples
5. Upgrade `/demos/` with "how this works" teaching callouts and exact links into tutorials

## 7. Required Source Material To Extract

The missing educational content should be extracted from these verified sources first:

1. `vizij-web/packages/@vizij/runtime-react/README.md`
2. `vizij-web/packages/@vizij/render/README.md`
3. `vizij-web/packages/@vizij/animation-react/README.md`
4. `vizij-web/packages/@vizij/orchestrator-react/README.md`
5. `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
6. `vizij-web/apps/tutorial-agent-face/tutorial.md`
7. `vizij-web/apps/vizij-authoring/README.md`
8. `vizij-web/apps/vizij-authoring/docs/ARCHITECTURE.md`
9. `vizij-web/apps/vizij-authoring/docs/Authoring_Blueprint.md`
10. `vizij-web/apps/vizij-standalone/README.md`
11. `vizij-docs/current_documentation/ARCHITECTURE.md`
12. `vizij-docs/current_documentation/concepts/*`
13. `vizij-assets/quori-rigged/*`

## 8. Output Of This Audit

This file identifies where the current site fails to teach enough.

The companion file, `public_page_content_brief-reference.md`, is the page-by-page teaching sourcebook. It defines what each page should actually teach with concrete facts, commands, code, examples, route-to-source anchors, and presentation ideas.
