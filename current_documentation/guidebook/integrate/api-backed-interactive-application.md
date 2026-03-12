<!-- tags: type=guidebook-module; status=written; topics=guidebook,integrate,api-backed,interactive-application,runtime-react -->

> **Last updated:** 2026-03-11
> **Purpose:** teach how a richer API-backed Vizij application is assembled without confusing external service behavior with a different runtime model

# API-Backed Interactive Application

## Reader Outcome

After this page, you should be able to explain how a richer API-backed Vizij application is assembled:

1. the Vizij runtime shell becomes ready,
2. an external API session becomes ready,
3. service events are translated into runtime tool calls,
4. the face and surrounding UI reflect those results honestly.

You should also be able to explain why this is still the same Vizij runtime model, not a different system.

## Intended Audience

This page is for readers who already understand:

1. [Loading, Playback, and Embedding](loading-playback-and-embedding.md),
2. [Application Integration Patterns](application-integration-patterns.md),
3. [Orchestration and Diagnostics](../control/orchestration-and-diagnostics.md) if they want the deepest runtime framing.

It is for readers who now need one concrete advanced integration pattern, not just a comparison page.

## What You Need

It helps if you can inspect the current maintained example in `vizij-web`:

1. `apps/tutorial-agent-face/src/FaceApp.tsx`,
2. `apps/tutorial-agent-face/src/hooks/useGeminiLive.ts`,
3. `apps/tutorial-agent-face/src/hooks/useAgentFaceTools.ts`,
4. `packages/@vizij/runtime-react/README.md`.

If you want to run that example locally:

```bash
pnpm run dev:tutorial-agent-face
```

You do not need provider-auth depth, prompt-engineering guidance, or deployment hardening to understand this page.

## Artifact Being Touched

The artifact here is the application layer around a Vizij face runtime:

1. a `VizijAssetBundle` and `VizijRuntimeProvider`,
2. a visible face surface rendered through `VizijRuntimeFace`,
3. an external API or live-service session,
4. a tool bridge that translates service events into runtime actions,
5. UI state that exposes readiness, transcripts, controls, and failures.

This matters because the face runtime is only one part of the richer app. The application also owns the service session and the translation boundary between the service and the face.

## Why This Page Exists

This page needs to exist separately because `Application Integration Patterns` helps readers choose a pattern, but it does not show how one advanced pattern is actually assembled.

The main misunderstanding this page prevents is:

`API-backed face app` does not mean `different Vizij runtime architecture`.

The current maintained example still uses:

1. `VizijRuntimeProvider`,
2. `VizijRuntimeFace`,
3. runtime helpers such as `animateValue` and `stagePoseNeutral`,
4. the same readiness and control chain described elsewhere in the guidebook.

What changes is the application layer around that runtime shell.

## What This Page Covers And Does Not Cover

This page does cover:

1. the runtime shell plus API-session split,
2. tool-call translation into Vizij runtime actions,
3. the readiness boundaries that matter in a richer app,
4. the maintained `tutorial-agent-face` example as one concrete pattern.

This page does not cover:

1. provider-specific account setup,
2. authentication and secret-management strategy,
3. prompt design,
4. speech transport internals,
5. production security and observability,
6. deployment topology.

Those are real concerns, but they are not the teaching job of this module.

## One Stable Runtime Shell

The current maintained example still starts with the same stable runtime shell:

1. define a `VizijAssetBundle`,
2. mount `VizijRuntimeProvider`,
3. render `VizijRuntimeFace`,
4. wait for `loading`, `error`, and `ready` to settle,
5. stage a neutral pose baseline before richer interaction begins.

In `tutorial-agent-face`, that shell is visible in `FaceApp.tsx`.

The app does not bypass the runtime because it talks to an API. It still waits for the runtime to load the asset, initialize the orchestrator, and expose a healthy face surface first.

That is the first thing to preserve when you build this pattern.

## The Actual Integration Flow

> TODO(content-model): Add a sequence diagram here to trace runtime readiness, API session readiness, tool invocation, runtime helper calls, and face/UI updates in order. Best fit because this section is procedural and readers need to see ownership handoffs across the application stack.

The clean learner-facing flow is:

```text
runtime shell ready
-> API session connected
-> service events trigger tool calls
-> tool handlers call Vizij runtime helpers
-> face behavior and UI state update
```

Each stage owns a different responsibility.

### 1. Runtime readiness comes first

In `FaceApp.tsx`, the app explicitly distinguishes:

1. `Loading face…`,
2. `Initialising orchestrator…`,
3. runtime error,
4. ready runtime.

This is not optional polish.

If the runtime is not ready, tool handlers should not pretend the face can respond. In the current example, `useAgentFaceTools` throws `"Face rig not ready yet."` if the tool layer is asked to act too early.

That is the first readiness boundary:

The face runtime must be healthy before the service-backed layer can do anything meaningful.

### 2. API-session readiness is separate

Once the face runtime is healthy, the app can establish its external session.

In the current example, `useGeminiLive` manages:

1. `DISCONNECTED`,
2. `CONNECTING`,
3. `CONNECTED`,
4. `ERROR`.

That is a second readiness boundary.

A face can be runtime-ready while the service session is disconnected or failing. The user-facing app needs to show both truths at once instead of collapsing them into one vague `loading` state.

This is one of the most important lessons in the page:

`runtime ready` and `service ready` are different claims.

## The Tool Bridge Is The Real Application Layer

The richest part of the pattern is the tool bridge between the service and the Vizij runtime.

In the maintained example, the service does not write renderer values directly. Instead:

1. the service emits tool calls such as `set_gaze` and `express_emotion`,
2. `useGeminiLive` receives those calls,
3. `handleFunctionCalls` in `useAgentFaceTools` validates and translates them,
4. the translation layer calls runtime helpers such as `animateValue`,
5. the runtime stages those writes and the face updates through the normal orchestration path.

That boundary is what keeps the pattern coherent.

The service decides what it wants the face to do.

The app decides how that request maps into valid Vizij runtime actions.

The runtime decides how those staged actions become visible behavior.

## Tool Parameters Are Not Direct Renderer Writes

This page needs to state one boundary very clearly:

Tool parameters are not direct renderer writes.

In the current example, `set_gaze` is translated into several runtime path writes, including paths like:

1. `rig/{faceId}/standard/left_eye/pos/x`,
2. `rig/{faceId}/standard/right_eye/pos/x`,
3. `rig/{faceId}/standard/left_eye/pos/y`,
4. `rig/{faceId}/standard/right_eye/pos/y`.

`express_emotion` resolves a matching pose binding, then animates the relevant pose-weight path rather than mutating the rendered face directly.

That means the richer application is still using the same runtime vocabulary taught in `Control` and earlier `Integrate` pages.

## Path And Namespace Contracts Still Matter

The presence of an external service does not remove path discipline.

The current tool bridge still depends on:

1. the resolved `faceId`,
2. the expected `rig/{faceId}/...` path family,
3. pose bindings that actually exist in the loaded asset,
4. runtime helpers that write through the provider-owned execution chain.

If the service asks for an emotion or path shape that the current face does not support, the application layer must reject or translate it honestly.

This is why `useAgentFaceTools` resolves emotion bindings against the loaded pose set instead of assuming any arbitrary emotion name will work.

## UI Feedback Is Part Of The Pattern

> TODO(content-model): Add an annotated screenshot here to label the face surface, transcript area, session-status chips, connection controls, and error surfaces in the maintained app. Best fit because this section is teaching readers how to interpret a richer UI shell and the important cues are spatial.

An API-backed face app is not just a face with an invisible backend.

The app also owns surrounding experience surfaces such as:

1. session status chips,
2. connect and disconnect actions,
3. transcript display,
4. toggles for function calling,
5. voice or mouth-mode selection,
6. visible error messages.

Those surfaces matter because they tell the reader what failed:

1. runtime setup,
2. service connection,
3. tool execution,
4. or face behavior itself.

Without that feedback, advanced integration becomes difficult to trust or diagnose.

## The Maintained Example Is Only One Example

The current maintained example uses Gemini Live, audio, transcripts, and function calling.

That is useful because it makes the pattern concrete.

It should not be mistaken for the only possible API-backed design.

The stable teaching point is broader:

1. keep the Vizij runtime shell intact,
2. establish a separate service/session layer,
3. translate service intent into runtime actions through a tool bridge,
4. keep readiness and failure ownership explicit.

Another provider or service can still follow that same architecture.

## What This Pattern Prevents

When assembled correctly, this pattern prevents several common advanced mistakes:

1. treating a richer app as if it needs a different Vizij runtime,
2. collapsing runtime readiness and session readiness into one ambiguous state,
3. letting service calls bypass the runtime contract,
4. assuming any emotion or gaze request is valid without checking the loaded face,
5. hiding failures behind conversational UI instead of exposing the real boundary that failed.

## Success Check

You are done with this page when:

1. you can describe the API-backed pattern as `runtime shell + service session + tool bridge`,
2. you can explain why tool calls are translated into runtime helpers instead of direct renderer writes,
3. you can explain the difference between runtime readiness and service readiness,
4. you can explain why the maintained provider example is a pattern anchor, not the only valid provider choice.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/tutorial-agent-face/src/FaceApp.tsx`
2. `vizij-web/apps/tutorial-agent-face/src/hooks/useGeminiLive.ts`
3. `vizij-web/apps/tutorial-agent-face/src/hooks/useAgentFaceTools.ts`
4. `vizij-web/packages/@vizij/runtime-react/README.md`
5. `current_documentation/guidebook/integrate/loading-playback-and-embedding.md`
6. `current_documentation/guidebook/integrate/application-integration-patterns.md`
7. `current_documentation/guidebook/control/orchestration-and-diagnostics.md`

## Next Step

If you want the broader advanced picture beyond this one pattern, continue to [Rich Interactive Applications](rich-interactive-applications.md).

If you realize you still need the fundamentals route, go back to [Application Integration Patterns](application-integration-patterns.md) or [Loading, Playback, and Embedding](loading-playback-and-embedding.md).

If your next concern is operator-facing deployment rather than richer app behavior, continue to [Operator and Deployment Model](../deploy/operator-and-deployment-model.md).
