<!-- tags: type=guidebook-bucket; status=written; topics=guidebook,integrate,player,embedding -->

> **Last updated:** 2026-03-13
> **Purpose:** explain how a face gets loaded, played back, embedded, and turned into a usable runtime surface

# Integrate

`Integrate` is the bucket where a face becomes something usable in a player or application context.

This bucket is the bridge between having a face or asset and having a runtime surface that can actually be used in a browser, app, or richer interactive experience.

The current maintained examples in this bucket are React applications built on `@vizij/runtime-react`.

That scope matters:

1. the integration lessons about lifecycle, ownership, and validation apply broadly,
2. the concrete code patterns in this bucket are React-first,
3. if you are not building in React, use [Loading, Playback, and Embedding](loading-playback-and-embedding.md) plus [Application Integration Patterns](application-integration-patterns.md) for the portable mental model, then switch to repo-local implementation docs for framework-specific assembly.

## Early Handoff Rules

Use these two handoffs to avoid lingering in the wrong part of the bucket:

| If this describes you... | Stay in `Integrate` long enough to... | Then open... |
| --- | --- | --- |
| you are not building in React | understand the asset-to-runtime shell model, the provider-owned readiness states, and one believable control path | repo-local implementation docs for your framework after [Loading, Playback, and Embedding](loading-playback-and-embedding.md) |
| your next real question is operator control, exposed endpoints, or topology | prove one healthy player-stage shell and one working control path | [Deploy](../deploy/README.md), then [Easiest Standalone Deployment](../deploy/easiest-standalone-deployment.md) or [Hardware, ROS, and Multi-Screen Topologies](../deploy/hardware-ros-and-multi-screen-topologies.md) |

## Process Position

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Control](../control/README.md) on the fast route or [Customize](../customize/README.md) on the customization route<br>Current: [Integrate](README.md)<br>Next: [Deploy](../deploy/README.md) |
| Depth ladder in this bucket | Surface: [Minimal Web Player](minimal-web-player.md)<br>Fundamentals: [Loading, Playback, and Embedding](loading-playback-and-embedding.md), [Application Integration Patterns](application-integration-patterns.md)<br>Advanced: [API-Backed Interactive Application](api-backed-interactive-application.md), [Rich Interactive Applications](rich-interactive-applications.md) |
| Reference bridges | [Runtime Quickstart Reference](../reference/runtime-quickstart-reference.md)<br>[Animation, Integration, and Deployment Reference](../reference/animation-integration-and-deployment-reference.md)<br>[Validation Checkpoints](../support/validation-checkpoints.md) |
| Route relationship | Converging bucket where both the fast route and the customization route meet before [Deploy](../deploy/README.md). |

## Bucket Overview

This bucket should help a reader:

1. get a face into a minimal useful player quickly,
2. understand loading, playback, and embedding basics,
3. see how richer applications build on the same underlying ideas,
4. move toward deployment with a real integrated artifact rather than a disconnected sample.

## Integration Route Chooser

Use this when you know you are in `Integrate` but are not sure which page fits:

| If your immediate goal is... | Open this next | Why |
| --- | --- | --- |
| the smallest believable face in an app shell | [Minimal Web Player](minimal-web-player.md) | fastest route-faithful React example |
| understand the portable runtime model before leaving the React examples behind | [Loading, Playback, and Embedding](loading-playback-and-embedding.md) | captures the transferable artifact, readiness, and ownership model first |
| understand lifecycle, loading, playback, and embedding terms | [Loading, Playback, and Embedding](loading-playback-and-embedding.md) | definitions before pattern choice |
| choose among simple app shapes | [Application Integration Patterns](application-integration-patterns.md) | compare ownership boundaries |
| build a service-backed or session-backed face app | [API-Backed Interactive Application](api-backed-interactive-application.md) | advanced pattern with explicit session boundary |
| think about broader product shells before deployment | [Rich Interactive Applications](rich-interactive-applications.md) | advanced ownership and status model |
| you already know deployment is the next real branch | [Minimal Web Player](minimal-web-player.md), then [Deploy](../deploy/README.md) | use one player-stage proof before moving into operator endpoints or topology choices |

## Depth Ladder

### Surface

**Teaching objective:** give the quickest useful integration success through a minimal player or equivalent simple runtime surface.

**Misunderstandings to prevent:**

1. thinking integration requires a large application before anything can run,
2. confusing integration with deployment,
3. assuming the minimal player is only a demo rather than a real bridge stage.

**Often useful content:**

1. step-by-step tutorials,
2. screenshots,
3. command examples,
4. code snippets,
5. validation checks.

### Fundamentals

**Teaching objective:** establish the basic mechanics of loading, playback, embedding, and application-level integration.

**Misunderstandings to prevent:**

1. not knowing what artifact is being loaded,
2. confusing playback and embedding responsibilities,
3. not understanding how simple integration patterns differ from one another.

**Often useful content:**

1. concept explainers,
2. diagrams,
3. code snippets,
4. config fragments,
5. comparisons,
6. implementation bridges.

### Advanced

**Teaching objective:** support richer interactive applications and deeper implementation patterns that go beyond the minimal player.

**Misunderstandings to prevent:**

1. treating richer applications as unrelated to the basic integration path,
2. assuming advanced integration is just more UI,
3. confusing application behavior with deployment topology.

**Often useful content:**

1. code snippets,
2. API examples,
3. diagrams,
4. screenshots,
5. troubleshooting,
6. repo and package links.

## Bucket Modules

| Module | Depth | Module type | Teaching focus |
| --- | --- | --- | --- |
| [Minimal Web Player](minimal-web-player.md) | Surface | walkthrough | get to the first useful integration success quickly |
| [Loading, Playback, and Embedding](loading-playback-and-embedding.md) | Fundamentals | concept page | explain the core mechanics of simple integration |
| [Application Integration Patterns](application-integration-patterns.md) | Fundamentals | comparison | compare common simple embedding patterns |
| [API-Backed Interactive Application](api-backed-interactive-application.md) | Advanced | walkthrough | teach a richer API-backed application pattern |
| [Rich Interactive Applications](rich-interactive-applications.md) | Advanced | operational guide | teach broader advanced application patterns |

## Recommended Teaching Approaches

1. Keep the minimal player path as small and believable as possible.
2. Make the artifact flow explicit: what comes in, what gets loaded, and what the runtime is now responsible for.
3. Use code only where it actually clarifies the integration pattern.
4. Treat richer API-backed examples as advanced build tutorials, not as the mandatory next step for everyone.

## Cross-Links

1. [Guidebook Learning Model](../learning-model.md)
2. [Guidebook Content Model Reference](../content-model-reference.md)
3. [Guidebook Module Inventory](../module_inventory-reference.md)
4. [Experience](../experience/README.md)
5. [Customize](../customize/README.md)
6. [Deploy](../deploy/README.md)
7. [Animation, Integration, and Deployment Reference](../reference/animation-integration-and-deployment-reference.md)
