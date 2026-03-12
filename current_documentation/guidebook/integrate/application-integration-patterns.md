<!-- tags: type=guidebook-module; status=written; topics=guidebook,integrate,application-patterns,runtime-react,orchestrator -->

> **Last updated:** 2026-03-11
> **Purpose:** help readers choose the right simple Vizij application integration pattern without confusing pattern choice with a different runtime model

# Application Integration Patterns

## Reader Outcome

After this page, you should be able to choose a simple Vizij application integration pattern for your use case and explain the tradeoffs between:

1. readiness visibility,
2. control ownership,
3. orchestration ownership,
4. embedding surface scope,
5. extensibility,
6. complexity cost.

## Intended Audience

This page is for readers who already understand the basic ideas from:

1. [Minimal Web Player](minimal-web-player.md),
2. [Loading, Playback, and Embedding](loading-playback-and-embedding.md),
3. [Orchestration and Diagnostics](../control/orchestration-and-diagnostics.md) if they want the most control-heavy pattern.

It is a comparison-and-selection page, not a build tutorial.

## What You Need

You do not need to run every app to use this page, but it helps if you can inspect the current maintained anchors in `vizij-web`:

1. `packages/@vizij/runtime-react`
2. `apps/tutorial-fullscreen-face`
3. `apps/tutorial-agent-face`
4. `apps/demo-vizij-player`

## Artifact Being Touched

The artifact here is not a single component. It is the application shell around the same underlying Vizij runtime chain:

1. an asset bundle or loaded face asset,
2. renderer plus orchestrator state,
3. a readiness model,
4. a visible face surface,
5. optional controls, hooks, services, or diagnostics.

## Why This Page Exists

This page needs to exist separately because readers often make two opposite mistakes:

1. they assume every richer app is using a completely different runtime system,
2. they assume every app should start from the most manual, diagnostics-heavy shell.

Both are wrong.

The current repo shows one stable runtime model with different ownership boundaries. The main thing that changes from pattern to pattern is not "what Vizij is." It is what your app chooses to own directly.

## One Stable Runtime Model

> TODO(content-model): Add a code snippet here to show the smallest shared provider-plus-face shell before the four patterns diverge. Best fit because this section argues that the runtime contract stays stable across patterns and a tiny common snippet would ground that claim in executable form.

Across all four patterns, the same core idea stays intact:

```text
face asset or bundle
-> runtime setup
-> orchestrator-managed updates
-> renderer-facing output
-> visible face in an app shell
```

In the lighter patterns, `@vizij/runtime-react` owns more of that wiring for you.

In the more manual pattern, your app owns more of the orchestration bootstrap, graph merging, and diagnostics surfaces directly.

That is a change in ownership, not a different conceptual system.

## What This Page Covers And Does Not Cover

This page covers:

1. four simple integration patterns already represented in the repo,
2. what each pattern is good at,
3. which pattern to choose first,
4. the operational tradeoffs between them.

This page does not cover:

1. full service orchestration design,
2. advanced authentication,
3. multi-view or multi-route application architecture,
4. complete API-backed production builds,
5. deployment topology.

Those belong in later `Integrate` or `Deploy` modules.

## Quick Selection Guide

> TODO(content-model): Add a decision matrix here to map common goals like “simple embed,” “local interactivity,” “service-backed behavior,” and “deep diagnostics” to the four patterns. Best fit because this module is a comparison page and readers need a fast chooser before reading each pattern in detail.

Choose:

1. `Minimal Provider Shell` if you need the calmest believable embedded face surface.
2. `Provider + Runtime Hooks` if you need local interaction, simple controls, or lightweight behavior on top of the provider.
3. `Service-Backed Face App` if an external service or live session should drive the face while the app still keeps the provider/runtime surface.
4. `Manual Orchestrator/Diagnostics Shell` if your main goal is explicit orchestration ownership, graph merging visibility, or deep runtime diagnostics.

If you are unsure, start with `Minimal Provider Shell` and move one step right only when the previous pattern becomes a real constraint.

## Pattern 1: Minimal Provider Shell

### What It Is

This is the smallest app-shaped React pattern built around:

1. `VizijAssetBundle`,
2. `VizijRuntimeProvider`,
3. `VizijRuntimeFace`,
4. a small readiness or error surface.

This is the default shape taught by the `@vizij/runtime-react` README.

### What It Optimizes For

It optimizes for:

1. low setup cost,
2. honest loading and error handling,
3. a narrow embedding surface,
4. a clean starting point for later growth.

### Readiness Model

Readiness is provider-owned and usually exposed through `loading`, `ready`, and `error`.

That means the app can stay simple while still showing truthful state.

### Control Ownership

Control ownership stays light. The shell is mostly a host.

It can show status or simple surrounding UI, but it is not yet trying to own rich behavior.

### Orchestration Ownership

Orchestration ownership stays mostly inside `@vizij/runtime-react`.

That is the key benefit of this pattern.

### Embedding Surface Scope

The face is embedded as one focused feature inside a page or app shell.

This pattern is best when the embedding surface should stay restrained.

### Current Anchor

The runtime README shows the canonical provider-plus-face pattern, and `tutorial-fullscreen-face` keeps close to that shape.

### Choose This When

Choose this when:

1. you need one face on screen,
2. you want visible readiness states,
3. you do not need deep manual orchestration control yet,
4. you want the easiest path toward a real application shell.

## Pattern 2: Provider + Runtime Hooks

### What It Is

This pattern keeps the same provider-owned runtime shell, but adds app behavior through `useVizijRuntime()` and related hooks.

In the current repo, `tutorial-fullscreen-face` and `tutorial-agent-face` both use this shape. They add behavior such as:

1. gaze input,
2. pose hotkeys,
3. neutral-pose staging,
4. animation or value writes through runtime helpers.

### What It Optimizes For

It optimizes for:

1. keeping the runtime shell stable,
2. adding interaction without dropping to manual orchestrator wiring,
3. incremental extension from a simple provider shell.

### Readiness Model

Readiness is still provider-owned, but the app now reacts to it directly.

That is why both tutorial face apps gate their behavior on `ready` and present distinct loading, initialization, and error states before interaction.

### Control Ownership

Control ownership shifts toward the app layer.

Your hooks decide when to call `setInput`, `animateValue`, `playAnimation`, or `stagePoseNeutral`, but they still do so through the runtime interface rather than bypassing it.

### Orchestration Ownership

Orchestration ownership is still mostly runtime-owned.

The app is shaping inputs and behavior, not manually bootstrapping or merging controller graphs.

### Embedding Surface Scope

The embedding surface grows from "face plus status" into "face plus local behavior."

That can still be a single view, fullscreen experience, or focused app feature.

### Current Anchors

`tutorial-fullscreen-face` is the cleanest fundamentals anchor for this pattern.

`tutorial-agent-face` is a richer version of the same shape.

### Choose This When

Choose this when:

1. you want the provider to remain the runtime backbone,
2. you need lightweight interactions or local app behaviors,
3. you want to extend one face view without taking over orchestration internals.

## Pattern 3: Service-Backed Face App

### What It Is

This pattern still uses the provider and runtime hooks, but the high-level behavior is now influenced by an external service session.

In the current repo, `tutorial-agent-face` is the maintained example: the face remains a `VizijRuntimeProvider` plus `VizijRuntimeFace` app, while live service logic, audio handling, and tool-driven reactions sit around that runtime shell.

### What It Optimizes For

It optimizes for:

1. keeping the face embedded inside a larger interactive experience,
2. letting service events drive expression and behavior,
3. preserving the provider/runtime model while broadening app ownership.

### Readiness Model

Readiness now has at least two layers:

1. runtime readiness for the face itself,
2. service/session readiness for the external behavior loop.

That distinction matters. A face can be runtime-ready even while the live service is disconnected.

### Control Ownership

Control ownership is split.

The local app still owns how service events map into runtime calls, but the service influences what the face should do next.

### Orchestration Ownership

Orchestration ownership remains mostly runtime-owned.

The app is composing service behavior on top of the runtime, not replacing the underlying runtime model.

### Embedding Surface Scope

The embedding surface is now a full feature experience rather than just a face viewer.

That usually includes status, controls, and session UX around the face.

### Current Anchor

`tutorial-agent-face` is the fundamentals anchor for this pattern because it clearly shows that service-backed behavior still sits on top of the same runtime provider.

### Choose This When

Choose this when:

1. a live service or external session is part of the product experience,
2. the face is one subsystem inside a broader interaction flow,
3. you want to keep runtime-react as the base rather than dropping immediately to manual orchestrator ownership.

### Important Boundary

This page only teaches the pattern choice.

It does not teach how to design the service contract, secure credentials, or build a full API-backed production system.

## Pattern 4: Manual Orchestrator/Diagnostics Shell

### What It Is

This pattern moves more ownership into the application shell itself.

In the current repo, `demo-vizij-player` is the main anchor. It explicitly owns:

1. orchestrator bootstrap,
2. autostep behavior,
3. GLB loading state,
4. graph merging and controller visibility,
5. diagnostic panels,
6. the bridge between orchestrator outputs and rendered face state.

### What It Optimizes For

It optimizes for:

1. orchestration visibility,
2. manual control over runtime setup,
3. graph and merge diagnostics,
4. explicit operational introspection.

### Readiness Model

Readiness is app-owned and more granular.

Instead of a single provider abstraction owning most lifecycle steps, the app exposes separate states such as GLB loading, orchestrator creation, registered controllers, and merge errors.

### Control Ownership

Control ownership is more direct.

The app writes to the orchestrator-facing surfaces itself and can expose richer diagnostics alongside those controls.

### Orchestration Ownership

This is the main distinguishing feature of the pattern.

The shell owns much more of orchestration setup and inspection directly.

### Embedding Surface Scope

The embedding surface is no longer just "a face in an app." It becomes an integration workspace or diagnostic shell.

That is why this pattern is powerful but heavier.

### Current Anchor

`demo-vizij-player` is the maintained comparison anchor for this pattern.

### Choose This When

Choose this when:

1. you need visibility into controllers, merges, and outputs,
2. you are building a diagnostic or tooling surface,
3. runtime-react abstraction is no longer exposing the ownership boundary you need.

### Important Warning

Do not choose this first just because it looks more powerful.

It has the highest complexity cost of the four patterns and is the easiest way to turn a simple face integration task into a runtime-tooling project.

## Comparison Table

| Pattern | Readiness visibility | Control ownership | Orchestration ownership | Embedding surface scope | Extensibility | Complexity cost |
| --- | --- | --- | --- | --- | --- | --- |
| Minimal Provider Shell | simple, provider-exposed lifecycle | minimal app-owned control | mostly runtime-owned | narrow face host | enough for straightforward growth | lowest |
| Provider + Runtime Hooks | clear provider lifecycle plus hook gating | app-owned local behavior through runtime helpers | mostly runtime-owned | focused interactive face surface | good for local behaviors and feature growth | low to medium |
| Service-Backed Face App | runtime readiness plus service/session readiness | shared between app logic and service-driven events | mostly runtime-owned | broader feature surface around the face | high at the app layer, without taking over runtime internals | medium |
| Manual Orchestrator/Diagnostics Shell | most explicit and granular | directly app-owned against orchestration surfaces | largely app-owned in practice | diagnostic workspace or tooling shell | highest operational flexibility | highest |

## A Practical Selection Rule

Ask these questions in order:

1. Do I just need a trustworthy embedded face surface?
2. Do I need local hooks and lightweight interaction?
3. Do I need the face to participate in a larger service-driven experience?
4. Do I actually need manual orchestration ownership and diagnostics?

Stop at the first `yes`.

That usually keeps the integration architecture proportional to the problem.

## What Misunderstanding This Prevents

The main misunderstanding this page prevents is thinking that a richer app automatically means a different runtime model.

It does not.

The richer patterns still build on the same basic runtime chain. The meaningful difference is which layer owns:

1. readiness,
2. control translation,
3. orchestration setup,
4. surrounding application scope.

## Success Check

You are done with this page when:

1. you can name the four patterns without treating them as different systems,
2. you can explain which layer owns readiness and orchestration in each pattern,
3. you can choose the lightest pattern that fits a given use case,
4. you know which concerns this page intentionally defers.

## Implementation Anchors

Use these when you need implementation truth:

1. `vizij-web/packages/@vizij/runtime-react/README.md`
2. `vizij-web/apps/tutorial-fullscreen-face/src/FaceApp.tsx`
3. `vizij-web/apps/tutorial-agent-face/src/FaceApp.tsx`
4. `vizij-web/apps/demo-vizij-player/src/App.tsx`
5. `current_documentation/guidebook/integrate/minimal-web-player.md`
6. `current_documentation/guidebook/integrate/loading-playback-and-embedding.md`
7. `current_documentation/guidebook/control/orchestration-and-diagnostics.md`

## Next Step

1. If you are still choosing the smallest credible shell, return to [Minimal Web Player](minimal-web-player.md).
2. If you are ready for deployment-facing thinking, continue to [Operator and Deployment Model](../deploy/operator-and-deployment-model.md).
3. If you need richer service-backed or API-backed integration details, continue to the later advanced `Integrate` modules rather than stretching this fundamentals page beyond scope.
