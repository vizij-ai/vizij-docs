<!-- tags: type=guidebook-module; status=written; topics=guidebook,integrate,application-patterns,runtime-react,orchestrator -->

> **Last updated:** 2026-03-12
> **Purpose:** help readers choose the right simple Vizij application integration pattern without confusing pattern choice with a different runtime model

# Application Integration Patterns

## Guidebook Context

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Control](../control/README.md) on the fast route or [Customize](../customize/README.md) on the customization route<br>Current: [Integrate](README.md)<br>Next: [Deploy](../deploy/README.md) |
| Depth ladder in this bucket | Above: [Minimal Web Player](minimal-web-player.md)<br>Current: `Fundamentals`<br>Below: [API-Backed Interactive Application](api-backed-interactive-application.md), [Rich Interactive Applications](rich-interactive-applications.md) |
| Module position in this bucket | Previous in bucket: [Loading, Playback, and Embedding](loading-playback-and-embedding.md)<br>Current module: `Application Integration Patterns`<br>Next in bucket: [API-Backed Interactive Application](api-backed-interactive-application.md) |
| Reference bridges | [Runtime Quickstart Reference](../reference/runtime-quickstart-reference.md)<br>[Animation, Integration, and Deployment Reference](../reference/animation-integration-and-deployment-reference.md)<br>[Validation Checkpoints](../support/validation-checkpoints.md) |
| Module type | comparison |
| Bucket overview | [Integrate](README.md) |

## Reader Outcome

After this page, you should be able to choose a simple Vizij application integration pattern for your use case and explain the tradeoffs between:

1. readiness visibility,
2. control ownership,
3. orchestration ownership,
4. embedding surface scope,
5. extensibility,
6. complexity cost.

## Module Notes

This page is for readers who already understand the basic ideas from [Minimal Web Player](minimal-web-player.md), [Loading, Playback, and Embedding](loading-playback-and-embedding.md), and optionally [Orchestration and Diagnostics](../control/orchestration-and-diagnostics.md) if they want the most control-heavy pattern.

It is a comparison-and-selection page, not a build tutorial.

## What You Need

You do not need to run every app to use this page, but it helps if you can inspect the current maintained anchors in `vizij-web`:

1. `packages/@vizij/runtime-react`
2. `apps/tutorial-fullscreen-face`
3. `apps/tutorial-agent-face`
4. `apps/demo-vizij-player`

## One Stable Runtime Model

All maintained patterns still reduce to the same core shell:

```tsx
<VizijRuntimeProvider assetBundle={assetBundle}>
  <VizijRuntimeFace />
</VizijRuntimeProvider>
```

What changes from pattern to pattern is not “what Vizij is.”

What changes is what your app chooses to own directly around that shell.

## Integration Decision Matrix

| If you mainly need... | Start with this pattern | Runtime lifecycle owner | New ownership your app takes on | First example to inspect |
| :--- | :--- | :--- | :--- | :--- |
| one face in a small app shell with honest loading, ready, and error states | **Minimal Provider Shell** | `VizijRuntimeProvider` | page-level UI only | `tutorial-fullscreen-face` |
| local face behavior such as gaze, hotkeys, or lightweight HUD controls | **Provider + Runtime Hooks** | `VizijRuntimeProvider` | hook-level input writes and local timing | `tutorial-fullscreen-face` hooks |
| bundle selection, diagnostics, and transport panels around the same runtime shell | **Provider + Diagnostics Shell** | `VizijRuntimeProvider` | sample/library state, diagnostics panels, transport UI | `demo-vizij-player` |
| external session, tool calls, or service-driven face behavior | **Service-Backed Face App** | `VizijRuntimeProvider` plus a separate session layer | session state and the translation bridge into runtime actions | `tutorial-agent-face` |

If you are unsure, start with the left-most pattern that solves the problem.
Move toward higher complexity only when a real requirement forces you to own more of the runtime lifecycle.

## Pattern 1: Minimal Provider Shell

This is the smallest app-shaped React pattern built around:

1. `VizijAssetBundle`,
2. `VizijRuntimeProvider`,
3. `VizijRuntimeFace`,
4. a small readiness or error surface.

Choose this when:

1. you need one face on screen,
2. you want visible readiness states,
3. you do not need deep manual orchestration control yet,
4. you want the easiest path toward a real application shell.

Current anchor:

1. `tutorial-fullscreen-face`
2. `@vizij/runtime-react`

## Pattern 2: Provider + Runtime Hooks

This pattern keeps the same provider-owned runtime shell, but adds app behavior through `useVizijRuntime()` and related hooks.

In the current repo, `tutorial-fullscreen-face` uses this shape for gaze and pose hotkeys.

Choose this when:

1. you want the provider to remain the runtime backbone,
2. you need lightweight interactions or local app behaviors,
3. you want to extend one face view without taking over orchestration internals.

Current anchor:

1. `tutorial-fullscreen-face`

## Pattern 3: Service-Backed Face App

This pattern still uses the provider and runtime hooks, but the high-level behavior is influenced by an external session.

In the current repo, `tutorial-agent-face` is the maintained example: the face remains a `VizijRuntimeProvider` plus `VizijRuntimeFace` app, while live service logic, audio handling, tool calls, and status surfaces sit around that runtime shell.

Choose this when:

1. a live service or external session is part of the product experience,
2. the face is one subsystem inside a broader interaction flow,
3. you want to keep `runtime-react` as the base rather than dropping to manual orchestrator ownership.

Current anchor:

1. `tutorial-agent-face`

## Pattern 4: Provider + Diagnostics Shell

This pattern still keeps the provider-owned runtime shell, but the application owns more of the surrounding inspection surface.

In the current repo, `demo-vizij-player` is the main anchor. It explicitly owns:

1. sample selection and uploaded-GLB selection,
2. bundle metadata displayed around the face,
3. diagnostic panels and controller visibility,
4. transport controls for bundled animations and programs,
5. metadata-driven face-control panels built from runtime state.

Choose this when:

1. diagnostic visibility is a primary requirement,
2. you need bundle or sample selection in the same app shell,
3. you want clip/program transport and controller inspection without dropping below the provider layer.

Current anchor:

1. `demo-vizij-player`

## The Important Boundary

These patterns are not four different Vizij architectures.

They are four different ownership boundaries around the same runtime model.

That is the main lesson this page should leave behind.

## Success Check

You are done with this page when:

1. you can name the four maintained patterns,
2. you can choose the lightest one that fits a given need,
3. you can explain what your app owns in each pattern,
4. you do not confuse pattern choice with a different runtime model.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/packages/@vizij/runtime-react/README.md`
2. `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
3. `vizij-web/apps/demo-vizij-player/docs/runtime-react-walkthrough.md`
4. `vizij-web/apps/tutorial-agent-face/tutorial.md`

## Recommended Next Steps

1. If you want one concrete advanced pattern explained in detail, continue to [API-Backed Interactive Application](api-backed-interactive-application.md).
2. If you want the calmest maintained shell first, go back to [Minimal Web Player](minimal-web-player.md).
