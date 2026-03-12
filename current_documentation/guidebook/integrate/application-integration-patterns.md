<!-- tags: type=guidebook-module; status=written; topics=guidebook,integrate,application-patterns,runtime-react,orchestrator -->

> **Last updated:** 2026-03-12
> **Purpose:** help readers choose the right simple Vizij application integration pattern without confusing pattern choice with a different runtime model

# Application Integration Patterns

## Guidebook Context

1. **Bucket:** [Integrate](README.md)
2. **Depth:** `Fundamentals`
3. **Module type:** comparison
4. **Bucket overview:** [Integrate](README.md)
5. **Useful previous module:** [Loading, Playback, and Embedding](loading-playback-and-embedding.md)
6. **Useful next module:** [API-Backed Interactive Application](api-backed-interactive-application.md)

## Reader Outcome

After this page, you should be able to choose a simple Vizij application integration pattern for your use case and explain the tradeoffs between:

1. readiness visibility,
2. control ownership,
3. orchestration ownership,
4. embedding surface scope,
5. extensibility,
6. complexity cost.

## Module Notes

### Intended Audience

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

| Your Goal | Recommended Pattern | Control Ownership | Complexity |
| :--- | :--- | :--- | :--- |
| **Simple Embed** | Minimal Provider Shell | Provider (Automatic) | Low |
| **Local Interactivity** | Provider + Runtime Hooks | App (Hooks/writes) | Medium |
| **Service-Backed AI** | Service-Backed Face App | External Session / Tool calls | High |
| **Deep Diagnostics** | Manual Orchestrator Shell | App (Total ownership) | High |

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

## Pattern 4: Manual Orchestrator / Diagnostics Shell

This pattern moves more ownership into the application shell itself.

In the current repo, `demo-vizij-player` is the main anchor. It explicitly owns:

1. orchestrator bootstrap,
2. autostep behavior,
3. GLB loading state,
4. graph merging and controller visibility,
5. diagnostic panels,
6. the bridge between orchestrator outputs and rendered face state.

Choose this when:

1. orchestration visibility is the main requirement,
2. you need explicit control over runtime setup,
3. diagnostic clarity matters more than minimal surface area.

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
2. `vizij-web/apps/tutorial-fullscreen-face/README.md`
3. `vizij-web/apps/tutorial-agent-face/README.md`
4. `vizij-web/apps/demo-vizij-player/README.md`

## Next Step

1. If you want one concrete advanced pattern explained in detail, continue to [API-Backed Interactive Application](api-backed-interactive-application.md).
2. If you want the calmest maintained shell first, go back to [Minimal Web Player](minimal-web-player.md).
