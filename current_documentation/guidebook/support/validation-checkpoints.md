<!-- tags: type=guidebook-module; status=written; topics=guidebook,support,validation,checkpoints -->

> **Last updated:** 2026-03-11
> **Purpose:** define reusable success checks across the maintained guidebook route

# Validation Checkpoints

## Guidebook Context

1. **Bucket:** [Guidebook Support](README.md)
2. **Depth role:** cross-cutting reusable support layer
3. **Module type:** support guide
4. **Bucket overview:** [Guidebook Support](README.md)
5. **Useful previous module:** [Guidebook Quality Criteria](guidebook-quality-criteria.md)
6. **Useful next module:** [Troubleshooting Matrix](troubleshooting-matrix.md)

## Reader Outcome

After this page, you should be able to validate whether a reader has actually succeeded at each major stage of the maintained route rather than only reading along conceptually.

## Module Notes

### Intended Audience

This page is for guidebook authors, workshop facilitators, and builders who want a stable definition of success for the current maintained path.

### Why This Page Exists

Vizij pages should not stop at explanation. They should help a reader confirm that the system is actually doing what the page claims.

Validation checkpoints keep the guidebook honest in three ways:

1. they reduce false positives where a reader thinks they succeeded but did not,
2. they make workshop facilitation easier,
3. they expose when a page needs stronger recovery guidance.

### Artifact Being Touched

The artifact here is the validation layer itself:

1. success criteria,
2. observable runtime states,
3. small practical checks,
4. stage-by-stage confidence that the route is working.

## What You Need

This page is most useful alongside:

1. [Hello Face Quickstart](../experience/hello-face-quickstart.md),
2. [Minimal Web Player](../integrate/minimal-web-player.md),
3. [Easiest Standalone Deployment](../deploy/easiest-standalone-deployment.md),
4. [Operator and Deployment Model](../deploy/operator-and-deployment-model.md).

## Interactive Lifecycle

A healthy Vizij implementation follows a predictable lifecycle. Use this state machine to validate whether your current stage is behaving correctly.

```mermaid
state_diagram
    [*] --> Initializing: Bundle loaded
    Initializing --> NoModel: Runtime ready
    Initializing --> Error: Bundle/Provider failure
    NoModel --> LoadingModel: GLB/GLTF requested
    LoadingModel --> Ready: Face active & published
    LoadingModel --> Error: Asset load failure
    Ready --> Degraded: Network/WebGL hitch
    Degraded --> Ready: Auto-recovery
    Ready --> [*]: Shutdown
    Error --> NoModel: Reset/Recovery
```

### Route-Level Checkpoints

| Stage | Minimum Success Signal | Likely Failure Clue | Fallback Page |
| :--- | :--- | :--- | :--- |
| **Experience** | Gaze follows mouse | Face is static or invisible | Troubleshooting Matrix |
| **Control** | Path-based writes work | Controls have no effect | Control Reference |
| **Integrate** | Runtime reports health | "Provider not found" | Minimal Web Player |
| **Deploy** | Client can connect | "Connection refused" | Standalone Deployment |

### Experience: Hello Face

Treat the `Experience` stage as successful when:

1. the face renders,
2. the mouse changes gaze,
3. number keys trigger visible pose changes,
4. the reader can point to the bundle, provider, and face component.

### Control: Runtime Understanding

Treat the first `Control` stage as successful when:

1. the reader can read a standard control path,
2. the reader can distinguish pose weights from standard controls,
3. the reader can explain that visible behavior is driven through path-based writes rather than one-off UI state.

### Integrate: Minimal Player

Treat the `Integrate` stage as successful when:

1. the runtime shell shows clear loading, ready, and error states,
2. the face viewer renders a working face,
3. the reader can identify the artifact-loading and runtime-health surfaces,
4. the reader understands why the player is a restrained application shell rather than a deployment endpoint.

### Deploy: Standalone

Treat the first `Deploy` stage as successful when:

1. the standalone app loads a face,
2. runtime health is visible,
3. the WebSocket endpoint is running,
4. a control client or the built-in web control panel can connect,
5. the face responds to control input.

## Observable Signals That Matter

Validation should prefer observable signals over vague impressions.

Strong signals:

1. explicit loading, ready, and error states,
2. visible cause and effect on the face,
3. declared runtime or connection status,
4. a known endpoint or port,
5. repeatable controls that work more than once.

Weak signals:

1. “it looked like it worked once,”
2. “the face was on screen but nothing else was clear,”
3. “the code probably loaded the right thing.”

## Current Known Validation Caveats

> TODO(content-model): Add a troubleshooting note here to connect each caveat to the checkpoint it can invalidate and the fastest recovery path. Best fit because this section already names concrete caveats and would be stronger if it immediately turned them into recovery guidance.

The current workshop validation pass already found caveats that guidebook pages should keep in mind:

1. a polluted shell environment can break Vite dev runtime behavior,
2. `tutorial-agent-face` remains disconnected until `VITE_GEMINI_API_KEY` is configured,
3. runtime-heavy apps may show WebGL performance warnings without being functionally broken,
4. some app builds emit large chunk warnings without failing.

These caveats do not invalidate the route, but they should influence how support pages explain healthy versus unhealthy behavior.

## How To Use This Page In Practice

Use this page in one of three ways:

1. as a final section in learner-facing modules,
2. as a facilitator checklist during workshops,
3. as a baseline before escalating into troubleshooting.

If a reader cannot pass a checkpoint, route them to [Troubleshooting Matrix](troubleshooting-matrix.md) instead of letting them silently drift into later modules.

## Current Useful Visuals

The strongest current visual evidence across the route:

1. **Experience**: [fullscreen-face](../assets/screenshots/tutorial-fullscreen-face.png) and [agent-face](../assets/screenshots/tutorial-agent-face.png)
2. **Integrate**: [vizij-player](../assets/screenshots/demo-vizij-player.png)
3. **Authoring**: [vizij-authoring](../assets/screenshots/vizij-authoring.png)
4. **Deploy**: [standalone-endpoint](../assets/screenshots/vizij-standalone-endpoint.png), [standalone-status](../assets/screenshots/vizij-standalone-status-ui.png) and [web-control-panel](../assets/screenshots/vizij-standalone-web-control-panel.png)

These captured states provide concrete proof of a healthy deployment and integration surface.

## Success Check

You are done with this page when:

1. you can state the minimum success criteria for each major route stage,
2. you know which observable signals matter most,
3. you know when to escalate from validation into troubleshooting.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `current_documentation/workshops/vizij-afternoon-workshop/planning/validation.md`
2. `current_documentation/workshops/vizij-afternoon-workshop/checklists/troubleshooting-playbook.md`
3. `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
4. `vizij-web/apps/demo-vizij-player/src/App.tsx`
5. `vizij-web/apps/vizij-standalone/README.md`

## Next Step

1. If a reader is failing one of these checkpoints, continue to [Troubleshooting Matrix](troubleshooting-matrix.md).
2. If a learner still needs route context, return to [How To Use This Guidebook](../introduction/how-to-use-this-guidebook.md).
