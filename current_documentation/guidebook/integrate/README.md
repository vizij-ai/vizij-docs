<!-- tags: type=guidebook-bucket; status=in_progress; topics=guidebook,integrate,player,embedding -->

> **Last updated:** 2026-03-11
> **Purpose:** explain how a face gets loaded, played back, embedded, and turned into a usable runtime surface

# Integrate

`Integrate` is the bucket where a face becomes something usable in a player or application context.

This bucket is the bridge between having a face or asset and having a runtime surface that can actually be used in a browser, app, or richer interactive experience.

## Bucket Overview

This bucket should help a reader:

1. get a face into a minimal useful player quickly,
2. understand loading, transfer, playback, and embedding basics,
3. see how richer applications build on the same underlying ideas,
4. move toward deployment with a real integrated artifact rather than a disconnected sample.

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

**Teaching objective:** establish the basic mechanics of loading, transfer, playback, embedding, and application-level integration.

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

## Planned Modules

| Module | Depth | Module type | Teaching focus |
| --- | --- | --- | --- |
| Minimal Web Player | Surface | walkthrough | get to the first useful integration success quickly |
| Loading, Transfer, Playback, and Embedding | Fundamentals | concept page | explain the core mechanics of simple integration |
| Application Integration Patterns | Fundamentals | comparison | compare common simple embedding patterns |
| API-Backed Interactive Application | Advanced | walkthrough | teach a richer API-backed application pattern |
| Rich Interactive Applications | Advanced | operational guide | teach broader advanced application patterns |

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
