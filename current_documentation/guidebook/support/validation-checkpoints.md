<!-- tags: type=guidebook-module; status=written; topics=guidebook,support,validation,checkpoints -->

> **Last updated:** 2026-03-13
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

- This page is for guidebook authors, facilitators, and builders who need a stable definition of success for the maintained route.
- Validation checkpoints are here to reduce false positives, support facilitation, and expose where a page still needs stronger recovery guidance.
- The artifact is the validation layer itself: success criteria, observable runtime states, practical checks, and stage-by-stage confidence.

## What You Need

This page is most useful alongside:

1. [Hello Face Quickstart](../experience/hello-face-quickstart.md),
2. [First Control Interactions](../control/first-control-interactions.md),
3. [Tweak an Existing Face](../customize/tweak-an-existing-face.md),
4. [Minimal Web Player](../integrate/minimal-web-player.md),
5. [Easiest Standalone Deployment](../deploy/easiest-standalone-deployment.md),
6. [Operator and Deployment Model](../deploy/operator-and-deployment-model.md).

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
| **Control** | Mouse gaze and pose hotkeys both work | Controls have no effect or feel inconsistent | Troubleshooting Matrix |
| **Customize** | one authored change can be described clearly and survives into export or preview | reader cannot tell whether they changed rig structure, an expression, or runtime behavior | Troubleshooting Matrix |
| **Integrate** | Runtime reports health | "Provider not found" | Minimal Web Player |
| **Deploy** | Client can connect | "Connection refused" | Standalone Deployment |

## Proof Before You Advance

Use these "not enough yet" checks to avoid false confidence:

| Stage | Not enough to claim success | Better proof |
| --- | --- | --- |
| Experience | the face is merely on screen once | gaze follows mouse and hotkeys cause visible pose changes more than once |
| Control | the reader can repeat path words from memory | the reader can say why a standard path and a pose-weight path mean different things |
| Customize | one panel changed but the reader cannot name which layer changed | the reader can say whether they changed import, rigging, pose, animation, or procedural behavior and why |
| Integrate | the component tree compiles | the app shows honest loading, ready, and error states and one maintained control path still reaches the face |
| Deploy | the socket responds once | slot discovery works, one visible write lands, and reset returns the face toward defaults |

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

### Customize: One Chosen Authoring Layer

Treat the first `Customize` stage as successful when:

1. the reader can say which authoring layer they are in,
2. they can explain why that layer fits their immediate goal,
3. one authored change has a believable preview, export, or route into runtime use.

### Integrate: Minimal Player

Treat the `Integrate` stage as successful when:

1. the runtime shell shows clear loading, ready, and error states,
2. the face viewer renders a working face,
3. the reader can identify the artifact-loading and runtime-health surfaces,
4. at least one maintained control path visibly reaches the face,
5. the reader understands why the player is a restrained application shell rather than a deployment endpoint.

### Deploy: Standalone

Treat the first `Deploy` stage as successful when:

1. the standalone app loads a face,
2. runtime health is visible,
3. the WebSocket endpoint is running,
4. a control client or the built-in web control panel can connect,
5. the face responds to control input.

The strongest first proof is still:

1. slot discovery returns a real slot name,
2. one small write succeeds against that exact discovered slot,
3. reset returns the face toward defaults.

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

The current workshop validation pass already found caveats that guidebook pages should keep in mind:

1. a polluted shell environment can break Vite dev runtime behavior,
2. `tutorial-agent-face` remains disconnected until `VITE_GEMINI_API_KEY` is configured,
3. runtime-heavy apps may show WebGL performance warnings without being functionally broken,
4. some app builds emit large chunk warnings without failing.

Fast recovery mapping:

1. shell or Vite problems that block the app from opening invalidate `Experience` and `Integrate` immediately, so recover there before interpreting runtime behavior
2. a missing `VITE_GEMINI_API_KEY` invalidates only the live-session branch of `tutorial-agent-face`, not the runtime shell itself
3. WebGL performance warnings matter only when they block visible interaction or make the face non-responsive
4. large build chunk warnings matter only when the build actually fails or the runtime never becomes healthy afterward

## How To Use This Page In Practice

Use this page in one of three ways:

1. as a final section in learner-facing modules,
2. as a facilitator checklist during workshops,
3. as a baseline before escalating into troubleshooting.

If a reader cannot pass a checkpoint, route them to [Troubleshooting Matrix](troubleshooting-matrix.md) instead of letting them silently drift into later modules.

## Current Useful Visuals

The strongest current visual evidence across the route:

1. **Experience**: [fullscreen-face](../assets/screenshots/tutorial-fullscreen-face.png), [fullscreen-demo](../assets/screenshots/fullscreen-demo.png), and [agent-face](../assets/screenshots/tutorial-agent-face.png)
2. **Integrate**: [player-demo](../assets/screenshots/player-demo.png), [player-demo-controls](../assets/screenshots/player-demo-controls.png), and [player-demo-details](../assets/screenshots/player-demo-details.png)
3. **Authoring**: [vizij-authoring](../assets/screenshots/vizij-authoring.png), [authoring-panel-face-elements](../assets/screenshots/authoring-panel-face-elements.png), and [authoring-inspector-face-elements](../assets/screenshots/authoring-inspector-face-elements.png)
4. **Deploy**: the maintained standalone route currently depends more on explicit runtime, endpoint, and connection-state checks than on a reusable screenshot set

These captured states provide concrete proof of the maintained experience, authoring, and integration surfaces without relying on dead legacy screenshot names. For deployment, the reliable evidence is still the operator checklist in [Easiest Standalone Deployment](../deploy/easiest-standalone-deployment.md).

## Success Check

You are done with this page when:

1. you can state the minimum success criteria for each major route stage,
2. you know which observable signals matter most,
3. you know when to escalate from validation into troubleshooting.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/packages/@vizij/runtime-react/README.md`
2. `vizij-web/apps/tutorial-fullscreen-face/tutorial.md`
3. `vizij-web/apps/demo-vizij-player/docs/runtime-react-walkthrough.md`
4. `vizij-web/apps/vizij-standalone/README.md`
5. `vizij-web/apps/vizij-standalone/src-tauri/src/lib.rs`

## Next Step

1. If a reader is failing one of these checkpoints, continue to [Troubleshooting Matrix](troubleshooting-matrix.md).
2. If a learner still needs route context, return to [How To Use This Guidebook](../introduction/how-to-use-this-guidebook.md).
