<!-- tags: type=guidebook-module; status=written; topics=guidebook,support,glossary,terminology -->

> **Last updated:** 2026-03-11
> **Purpose:** give readers a route-level terminology seam so the same Vizij artifact can be described correctly across authoring, runtime, integration, and deployment pages

# Glossary and Terminology Bridge

## Guidebook Context

1. **Bucket:** [Guidebook Support](README.md)
2. **Depth role:** cross-cutting reusable support layer
3. **Module type:** reference bridge
4. **Bucket overview:** [Guidebook Support](README.md)
5. **Useful previous module:** [Troubleshooting Matrix](troubleshooting-matrix.md)
6. **Useful next module:** [Media Intake and Usage Guide](media-intake-and-usage-guide.md)

## Reader Outcome

After this page, you should be able to translate the same Vizij thing across buckets without confusing:

1. the face artifact with the app that hosts it,
2. authored structure with live runtime control,
3. integration language with deployment language,
4. surface UI labels with the more stable runtime meaning underneath.

## Module Notes

### Intended Audience

This page is for readers who are moving between `Customize`, `Control`, `Integrate`, and `Deploy` and keep seeing familiar words used at slightly different layers.

It is especially useful for:

1. builders following the full `Hello Face -> Authoring -> Player -> Deployment` route,
2. workshop readers who need a compact shared vocabulary,
3. guidebook authors who want one stable route-level language.

### Why This Page Exists

This page needs to exist separately because several important Vizij words are correct in more than one bucket, but they do not mean exactly the same thing in each one.

Without a bridge page, readers often make these mistakes:

1. treating the face artifact, player shell, and deployment endpoint as the same artifact,
2. using `control` to mean both authored capability and live runtime writes,
3. using `loading` for everything from asset fetch to runtime readiness to service connection,
4. reading `slot` as one universal concept when the route uses it differently at different layers.

This page prevents those misunderstandings by giving the smallest shared vocabulary that lets readers switch buckets cleanly.

### Artifact Being Touched

The artifact here is the route-level vocabulary itself.

This page is about how one maintained Vizij face is described as it moves through:

1. asset and authoring language,
2. runtime control language,
3. integration language,
4. deployment and operator language.

It is not a giant dictionary and it is not a replacement for the deeper bucket pages.

### What This Page Covers And Does Not Cover

This page covers:

1. the route-level translation between asset, runtime, integration, and deployment language,
2. the small set of terms that change meaning by context or look equivalent when they are not,
3. where to go next for the deeper explanation.

This page does not cover:

1. exhaustive file-format detail,
2. ABI or package-ownership detail,
3. full authoring internals,
4. deployment topology decisions,
5. every specialized term used inside repo-local implementation docs.

## What You Need

It helps if you have already read:

1. [What Is Vizij?](../introduction/what-is-vizij.md),
2. [System Mental Model](../introduction/system-mental-model.md),
3. [Paths and Standard Controls](../control/paths-and-standard-controls.md),
4. [Loading, Playback, and Embedding](../integrate/loading-playback-and-embedding.md).

You do not need package-level knowledge or a full architecture audit.

## Fast Orientation Map

Use this table first when the same artifact seems to get renamed as you move through the guidebook.

| If you are thinking about... | `Customize` or asset view | `Control` or runtime view | `Integrate` or app view | `Deploy` or operator view |
| --- | --- | --- | --- | --- |
| the main thing itself | face artifact | runtime-controlled face | embedded face surface | deployed endpoint carrying a face |
| the authored package around it | authored artifact bundle | runtime bundle inputs and controllers | `VizijAssetBundle` or runtime bundle | loaded face plus exposed operator control surface |
| making it move now | authored capability | runtime control | playback inside an app shell | operator-driven or client-driven control |
| where values go | authored rig and behavior definitions | paths, values, shapes, blackboard writes | provider and face component lifecycle | slots and typed values exposed to clients |
| whether it is usable yet | export succeeded | inputs can stage and render | loading, ready, error states are honest | runtime ready, client connected, face responds |

One sentence to keep in mind:

`the asset carries structure, the runtime executes behavior, the app hosts the face, and deployment exposes an operator-facing endpoint`

## The Core Bridge Terms

Use this quick-reference block when a guidebook term and an implementation term seem close but are not interchangeable.

| Guidebook-facing term | Common implementation-facing label | What it means in practice | Strongest owning surface |
| --- | --- | --- | --- |
| `face artifact` | GLB, bundled GLB, loaded asset | the face asset and authored data that later surfaces can load | `vizij-authoring` export flow |
| `authored artifact bundle` | export bundle, bundled GLB, GraphSpec + IR + assets | the package authoring produces for runtime consumers | `vizij-authoring` |
| `runtime bundle` | `VizijAssetBundle`, `assetBundle`, resolved bundle | the app-facing runtime payload handed to `VizijRuntimeProvider` | `@vizij/runtime-react` |
| `runtime control` | `setInput(...)`, `animateValue(...)`, clip/program transport | live writes and playback happening right now | runtime-react apps |
| `application integration surface` | provider tree, face component, diagnostics shell | the app shell that hosts the face as part of a broader UI | `tutorial-fullscreen-face`, `demo-vizij-player`, `tutorial-agent-face` |
| `deployment surface` | WebSocket endpoint, web control panel, slots | an operator-facing endpoint with exposed control and recoverable health | `vizij-standalone` |

The terms below are the ones most likely to save you from crossing buckets incorrectly.

### Face Artifact

At the route level, `face artifact` means the face as an authored thing that can be loaded later.

In `Customize`, that usually means:

1. a face asset such as a GLB,
2. authored rig, pose, animation, or related metadata,
3. an exported result that later buckets can consume.

In `Integrate` or `Deploy`, the face artifact is still important, but it is no longer the whole system. It becomes the thing the runtime loads into a larger shell.

Use this term when you want to talk about the face itself without accidentally meaning the app or endpoint around it.

### Runtime Bundle / Authored Artifact Bundle

In current guidebook pages, the implementation-facing term you will usually see is `runtime bundle`, including `VizijAssetBundle` in the React integration layer.

For route-level teaching, it is also useful to think of this as the `authored artifact bundle`: the face artifact plus the authored runtime information needed to load it honestly.

Treat these as bridge labels, not as proof that every layer uses the same type name.

The important idea is:

1. authoring produces a face plus authored behavior definitions,
2. integration loads a runtime bundle that carries those definitions forward.

If you need the actual app-facing integration shape, go to [Loading, Playback, and Embedding](../integrate/loading-playback-and-embedding.md).

### Runtime Control

`Runtime control` means live values being driven now.

This is different from authored capability.

Authoring defines what can be controlled. Runtime control is the current use of that capability through typed writes, controller output, playback, or operator input.

If a page is asking "what is the face doing right now?", you are in runtime-control language, not asset language.

### Application Integration Surface

An `application integration surface` is the app shell that hosts a face as part of a broader use case.

In the current guidebook, that usually means:

1. a provider that boots the runtime,
2. a face component or visible rendering surface,
3. loading, ready, and error states,
4. optional hooks, controls, or app logic layered on top.

This is the right term when you mean "the face inside my app," not "the artifact on disk" and not "the deployed endpoint."

### Deployment Surface

A `deployment surface` is where the integrated system is actually operated.

In the current guidebook, the first deployment model is the standalone endpoint plus its control path.

Use `deployment surface` when the important question is operational:

1. is the runtime healthy,
2. can a client connect,
3. can an operator drive the face,
4. can obvious failures be recognized and recovered from.

Deployment is not just integration somewhere else. It adds an operator-facing control story.

### TypedPath / Path

`Path` is the learner-facing short form. `TypedPath` is the architecture-facing name for the stricter contract.

A path tells the runtime what a value means and where it belongs.

This matters across buckets because paths let:

1. authored controls stay addressable,
2. runtime inputs stay stable across apps,
3. deployment-facing slots map to meaningful control targets.

When a guidebook page says `path`, read it as "stable semantic address," not as an arbitrary string label.

### Value

A `Value` is the typed payload written at a path.

This page does not need the full union or encoding detail. The route-level point is simpler:

1. the runtime is not only moving UI widget state,
2. it is moving typed values with stable meaning.

If you are asking "what was actually written?", you are asking about the value.

### Shape

A `Shape` is the expected structure of a value.

At the route level, this matters because Vizij tries to keep control contracts deterministic across authoring, runtime, app integration, and deployment.

If `Value` answers "what payload?", `Shape` answers "what kind of payload is valid here?"

### Standard Control Path

A `standard control path` is a reusable rig-facing control channel, such as the standard gaze channels introduced in [Paths and Standard Controls](../control/paths-and-standard-controls.md).

Use this term when the control is:

1. lower-level than a named authored expression,
2. reusable across faces in a normalized way,
3. best understood as a controllable rig channel.

### Pose-Weight Path

A `pose-weight path` drives the strength of a named authored pose.

This is not the same thing as a standard control path.

Use this term when the question is "how much of this authored facial state is active?"

This distinction matters because a slider that changes a reusable rig channel and a slider that blends `smile.weight` may look similar in a UI while meaning different things in the runtime.

### Viseme Path

A `viseme path` is the speech-related version of the same runtime idea: a stable path for mouth-shape behavior tied to speech or conversation flows.

It belongs in the same path-and-value family, but it is not equivalent to either:

1. a reusable standard control channel,
2. a named facial pose used for general expression.

Use this term when the face behavior is speech-shaped rather than generic expression control.

### Loading

`Loading` belongs to integration and deployment health language more than to authoring language.

In the guidebook, loading usually means:

1. the asset is being acquired,
2. the runtime bundle is being prepared,
3. the runtime has not reached usable readiness yet.

Do not use `loading` as a synonym for all early lifecycle states. A page may also need to distinguish initialization, service connection, or operator connection separately.

### Playback

`Playback` is what the runtime does over time once the face is loaded and usable.

Playback is not loading, and it is not embedding.

Use `playback` when the face is actively being driven through:

1. authored animations,
2. runtime value changes,
3. controller output that produces visible motion.

### Embedding

`Embedding` means placing a Vizij runtime surface inside a broader application.

Use this term when the design question is "how does this face live inside my app?" rather than:

1. "what authored artifact do I have?",
2. "what path am I writing?",
3. "what deployment endpoint is an operator using?"

This word belongs to `Integrate`, not to `Deploy`.

### Slot

`Slot` is one of the easiest words to misread, so keep its route-level meaning narrow.

In the deployment pages, a slot is the deployment-facing exposed controllable entry that a client can discover and write through the operator path.

That is the meaning this bridge page cares about.

This page does not try to unify every other implementation-specific use of `slot`, especially deeper authoring internals. If you are reading deployment guidance, think `exposed controllable path/value entry`, not "every slot concept in the repo."

### Ready / Loading / Error Healthy-State Markers

These are the route-level state markers readers should trust most when an app or endpoint is claiming to be usable.

At the guidebook level:

1. `loading` means not usable yet,
2. `ready` means the runtime surface is usable for the next intended action,
3. `error` means the route has broken and should not be treated as healthy.

These markers are especially important in `Integrate`, `Deploy`, [Validation Checkpoints](validation-checkpoints.md), and [Troubleshooting Matrix](troubleshooting-matrix.md).

They are not merely cosmetic UI chips. They are part of the guidebook's honest-success language.

## Confusing Labels To Translate Carefully

### `Face`

`Face` can mean:

1. the authored artifact being customized,
2. the visible rendered runtime result,
3. the face surface inside a player or app.

When precision matters, prefer `face artifact`, `runtime-controlled face`, or `embedded face surface`.

### `Control`

`Control` can mean:

1. authored controllability,
2. a runtime input or path write,
3. a visible UI widget,
4. an operator-facing client action.

When precision matters, prefer `runtime control`, `standard control path`, `pose-weight path`, or `operator control surface`.

### `Slot`

`Slot` should not be used as a generic synonym for any configurable thing.

In the route-level deployment story, it means a deployment-facing exposed control entry. If you mean a deeper authoring or binding concept, say that directly instead of relying on the word `slot` alone.

### `Loading`

`Loading` should not mean every kind of "not ready yet."

Use it for asset and runtime preparation. If the real issue is external-service connection or client connection, name that separately.

### `Embedding`

`Embedding` is about app placement and ownership boundaries.

It does not mean:

1. exporting an artifact,
2. loading an asset,
3. deploying an operator endpoint.

### `Deployment`

`Deployment` is not just "a player that is running."

Use it when the system has crossed into operator-facing use, exposed control, and recoverable operational health.

## How To Use This Bridge In The Main Route

Use this page as a seam, not as a destination.

Route back into the guidebook with this table instead of reopening the whole bucket blindly.

| If the confusing term is really about... | Re-enter here first | Why this is the best next page |
| --- | --- | --- |
| authored structure, bundle contents, or exportable artifacts | [Customization Concepts Primer](../introduction/customization-concepts-primer.md) | re-establishes rig, pose, animation, procedural, and export as separate layers |
| path syntax, pose weights, visemes, or runtime values | [Paths and Standard Controls](../control/paths-and-standard-controls.md) | names the runtime address grammar behind visible control behavior |
| runtime readiness, loading, playback, or embedding boundaries | [Loading, Playback, and Embedding](../integrate/loading-playback-and-embedding.md) | separates asset loading, runtime state, and app ownership clearly |
| advanced app-state versus session-state confusion | [API-Backed Interactive Application](../integrate/api-backed-interactive-application.md) | distinguishes runtime health from external-session health |
| operator endpoints, slots, and exposed control surfaces | [Operator and Deployment Model](../deploy/operator-and-deployment-model.md) | grounds deployment terms in the current standalone endpoint |
| whether the system is healthy enough to trust | [Validation Checkpoints](validation-checkpoints.md) | turns vague status language into explicit pass/fail signals |
| failure symptoms and next recovery moves | [Troubleshooting Matrix](troubleshooting-matrix.md) | maps symptom language back to the maintained recovery route |

## Success Check

You are done with this page when:

1. you can explain the same face as artifact, runtime-controlled surface, application surface, and deployment surface without collapsing those layers,
2. you can distinguish standard control paths, pose-weight paths, and viseme paths,
3. you can explain the difference between loading, playback, and embedding,
4. you can say what `slot` means in the deployment route without overgeneralizing it,
5. you know which deeper guidebook page to open next when a term still needs bucket-specific detail.

## Implementation Anchors

Use these when you need the current implementation truth behind this bridge:

1. `vizij-web/apps/vizij-authoring/README.md`
2. `vizij-web/apps/vizij-authoring/docs/ARCHITECTURE.md`
3. `vizij-web/packages/@vizij/runtime-react/README.md`
4. `vizij-web/packages/@vizij/runtime-react/src/utils/posePaths.ts`
5. `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
6. `vizij-web/apps/vizij-standalone/README.md`
7. `vizij-web/apps/vizij-standalone/src-tauri/src/lib.rs`
8. `vizij-docs/current_documentation/ARCHITECTURE.md`

## Next Step

1. If your main confusion is about runtime meaning, continue to [Runtime Inputs and Semantics](../control/runtime-inputs-and-semantics.md).
2. If your main confusion is about app lifecycle language, continue to [Loading, Playback, and Embedding](../integrate/loading-playback-and-embedding.md).
3. If your main confusion is about operator language and slots, continue to [Operator and Deployment Model](../deploy/operator-and-deployment-model.md).
