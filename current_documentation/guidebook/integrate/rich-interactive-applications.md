<!-- tags: type=guidebook-module; status=written; topics=guidebook,integrate,interactive-applications,advanced,runtime-react -->

> **Last updated:** 2026-03-12
> **Purpose:** explain how richer Vizij applications grow beyond the minimal player while preserving the same runtime contract and honest ownership boundaries

# Rich Interactive Applications

## Guidebook Context

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Control](../control/README.md) on the fast route or [Customize](../customize/README.md) on the customization route<br>Current: [Integrate](README.md)<br>Next: [Deploy](../deploy/README.md) |
| Depth ladder in this bucket | Above: [Minimal Web Player](minimal-web-player.md), [Loading, Playback, and Embedding](loading-playback-and-embedding.md), [Application Integration Patterns](application-integration-patterns.md)<br>Current: `Advanced`<br>Below: none, this is the deepest current depth in this bucket |
| Module position in this bucket | Previous in bucket: [API-Backed Interactive Application](api-backed-interactive-application.md)<br>Current module: `Rich Interactive Applications`<br>Next in bucket: none, this is the last module in the bucket sequence |
| Reference bridges | [Runtime Quickstart Reference](../reference/runtime-quickstart-reference.md)<br>[Animation, Integration, and Deployment Reference](../reference/animation-integration-and-deployment-reference.md)<br>[Validation Checkpoints](../support/validation-checkpoints.md) |
| Module type | operational guide |
| Bucket overview | [Integrate](README.md) |

## Reader Outcome

After this page, you should be able to explain how richer Vizij applications grow from the same runtime foundation while adding:

1. local interaction layers,
2. service-backed behavior loops,
3. larger app-shell responsibilities,
4. more explicit readiness and failure surfaces.

You should also be able to explain what makes an app `richer` without pretending it is a different Vizij runtime.

## Module Notes

- Read this after the `Integrate` fundamentals and, ideally, after [API-Backed Interactive Application](api-backed-interactive-application.md).
- The page focuses on richer application shells around a Vizij runtime surface: local interaction rules, service or session layers, surrounding UI state, and the ownership boundaries that keep those apps coherent.
- Provider setup, security, observability, and hardware topology stay downstream.

## What You Need

It helps if you can inspect these maintained anchors:

1. `vizij-web/packages/@vizij/runtime-react/README.md`,
2. `vizij-web/apps/tutorial-agent-face/src/FaceApp.tsx`,
3. `vizij-web/apps/tutorial-agent-face/src/hooks/useGeminiLive.ts`,
4. `vizij-web/apps/tutorial-agent-face/src/hooks/useAgentFaceTools.ts`.

It also helps if you keep the `Integrate` boundary clear:

1. this bucket owns application assembly,
2. `Deploy` owns endpoint and operator topology,
3. `Support` owns reusable validation and recovery language.

## What Makes An Application Richer

A richer application is not defined by having more chrome on the screen.

It becomes richer when the app owns more than basic loading and face display. In practice, that usually means the app now owns some mix of:

1. local interaction rules,
2. service or session coordination,
3. higher-stakes feedback and status surfaces,
4. larger product workflows around the face.

The face is still important, but it is no longer the entire product surface.

## One Runtime Contract, More App Ownership

The stable contract still looks the same:

```text
asset bundle
-> runtime provider
-> orchestrator-managed updates
-> renderer-facing output
-> visible face
```

What changes in richer applications is the amount of application-owned logic around that chain.

The important rule is:

add app ownership without bypassing the runtime contract.

That means:

1. keep runtime readiness explicit,
2. keep path and face identity discipline intact,
3. translate app or service intent into runtime helpers,
4. expose failures at the layer that actually failed.

## The Main Rich-App Shapes

Use this table before reading the detailed shape descriptions:

| Rich-app shape | Runtime owner | New app-owned layer | Teaching goal | Strongest maintained anchor |
| --- | --- | --- | --- | --- |
| local interactive face surface | `VizijRuntimeProvider` | local hooks, timers, and small behavior rules | show how a face becomes interactive without changing the runtime model | `tutorial-fullscreen-face` |
| service-backed interactive surface | `VizijRuntimeProvider` plus a separate session layer | connection state, tool bridge, and service-facing UI | show how external events become runtime actions without bypassing the runtime | `tutorial-agent-face` |
| diagnostics or workflow-heavy app shell | `VizijRuntimeProvider` | panels, sample/library state, diagnostics, transport controls, and broader product UI | show how a face stays understandable inside a larger app surface | `demo-vizij-player` |

Richer Vizij applications usually grow along three axes.

### 1. Local interactive face surfaces

This is the first richer step.

The app keeps the provider-owned runtime shell, then adds local behavior such as:

1. gaze input,
2. pose triggers,
3. lightweight idle behavior,
4. local HUD controls,
5. immediate status feedback.

This shape is still fairly contained, but it already requires the app to own behavior timing and readiness gating more carefully than a minimal player.

### 2. Service-backed interactive surfaces

This is the next richer step.

The app now owns a separate service or session layer and a translation boundary between that layer and the Vizij runtime.

The maintained `tutorial-agent-face` example shows this clearly:

1. the runtime shell stays provider-based,
2. the service session has its own connection state,
3. tool calls are translated into runtime actions,
4. the app surfaces transcripts, toggles, and connection feedback.

This is richer because the face participates in a broader behavior loop instead of only reacting to local UI events.

### 3. Larger app shells around the face

A richer app can also grow by surrounding the face with more application state and user workflow.

That can include:

1. panels and controls around the face,
2. session management,
3. comparison or diagnostics surfaces,
4. explicit mode switching,
5. app-specific feature state that is not itself part of Vizij runtime semantics.

This is still `Integrate` work as long as the question is:

`How does the face live inside my application?`

Once the question becomes:

`How do operators, devices, or deployment topologies use this endpoint?`

you are crossing into `Deploy`.

## The Four Ownership Boundaries That Matter

Keep these four boundaries visible in status language and recovery guidance:

| Boundary | Owned by | Healthy signal | Failure should be named as |
| --- | --- | --- | --- |
| runtime readiness | Vizij runtime shell | face loaded, controllers registered, ready state is true | load/initialization/runtime error |
| session readiness | external client or service layer | disconnected, connecting, connected, or error shown separately | session/auth/provider error |
| translation boundary | app-owned bridge logic | requested behavior resolves into valid runtime writes or transports | missing binding, unsupported tool action, bridge failure |
| product-surface ownership | surrounding app shell | the right UI, controls, and recovery affordances are visible | app-state or feature-shell issue |

Richer apps stay understandable when four ownership boundaries stay explicit.

### 1. Runtime readiness ownership

The Vizij runtime still owns whether the face is loaded, initialized, and ready to accept meaningful control.

Do not hide this behind app-level session state.

### 2. Session readiness ownership

If a service or live API is involved, that layer owns its own readiness.

Do not collapse session connection truth into runtime truth.

### 3. Tool or behavior translation ownership

The application owns the bridge between external intent and valid Vizij runtime action.

That includes:

1. validating requested behaviors,
2. resolving supported paths or pose bindings,
3. deciding which runtime helper to call,
4. surfacing failures honestly.

### 4. Product-surface ownership

The application also owns the surrounding user experience:

1. which controls are visible,
2. what status is shown,
3. what fallback or recovery path the user gets,
4. how the face relates to the broader feature.

If these four ownership boundaries blur together, richer apps become difficult to maintain and difficult to teach.

## What Rich Applications Still Must Not Do

A richer app still must not:

1. treat service events as direct renderer writes,
2. ignore path and face identity contracts,
3. claim the face is healthy when only the service is healthy,
4. drift into deployment concerns before the application surface is stable,
5. use optional provider-specific behavior as if it were the universal Vizij contract.

These are the most common sources of conceptual drift.

## A Practical Growth Sequence

Use this sequence when you are growing a working integration surface instead of starting from a blank architecture diagram:

| Step | Add this | Keep stable while you add it | Validate before moving on |
| --- | --- | --- | --- |
| 1 | minimal provider shell | one `VizijAssetBundle`, one `VizijRuntimeProvider`, honest loading/ready/error states | face loads and one control path visibly works |
| 2 | local interaction layer | the same provider-owned runtime shell | local hooks still respect runtime readiness and path discipline |
| 3 | service-backed behavior | the same runtime shell plus explicit session status | runtime health and session health still read as different truths |
| 4 | larger app-shell UI and diagnostics | the same face/runtime contract | user-facing panels explain the right layer when something fails |
| 5 | deployment branch | only after the app surface is stable enough to expose an endpoint | operator, endpoint, and topology questions now belong in `Deploy` |

The safest way to grow into a richer application is usually:

1. start with a minimal provider shell,
2. add local interactive behavior,
3. add a service-backed or session-backed layer if the product needs it,
4. expand surrounding UI and diagnostics only when the previous layer is already understandable.

This sequence matters because it lets the app add responsibility in layers without losing the stable runtime foundation underneath.

## Success Check

You are done with this page when:

1. you can explain what makes an app richer without calling it a different runtime,
2. you can describe the difference between runtime readiness and session readiness,
3. you can explain why the app owns the translation boundary from service or UI intent into Vizij runtime actions,
4. you know when an advanced integration question has become a deployment question.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/packages/@vizij/runtime-react/README.md`
2. `vizij-web/apps/demo-vizij-player/docs/runtime-react-walkthrough.md`
3. `vizij-web/apps/tutorial-agent-face/tutorial.md`
4. `vizij-web/apps/tutorial-agent-face/src/FaceApp.tsx`
5. `vizij-web/apps/tutorial-agent-face/src/hooks/useGeminiLive.ts`
6. `vizij-web/apps/tutorial-agent-face/src/hooks/useAgentFaceTools.ts`
7. `vizij-web/apps/demo-vizij-player/src/App.tsx`
8. `vizij-web/apps/demo-vizij-player/src/data/samples.ts`

## Recommended Next Steps

1. If you are ready to think about operator-facing endpoints and deployment choices, continue to [Operator and Deployment Model](../deploy/operator-and-deployment-model.md).
2. If you need the lighter in-bucket route before that, go back to [Application Integration Patterns](application-integration-patterns.md).
3. If you need the concrete advanced implementation example again, revisit [API-Backed Interactive Application](api-backed-interactive-application.md).
