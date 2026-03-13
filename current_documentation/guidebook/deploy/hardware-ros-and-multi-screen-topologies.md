<!-- tags: type=guidebook-module; status=written; topics=guidebook,deploy,topologies,hardware,ros,multi-screen -->

> **Last updated:** 2026-03-12
> **Purpose:** compare deeper deployment topologies without overstating what the current standalone and operator surfaces already guarantee

# Hardware, ROS, and Multi-Screen Topologies

## Guidebook Context

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Integrate](../integrate/README.md)<br>Current: [Deploy](README.md)<br>Next: End of guidebook route |
| Depth ladder in this bucket | Above: [Easiest Standalone Deployment](easiest-standalone-deployment.md), [Operator and Deployment Model](operator-and-deployment-model.md), [Deployment Checks and Recovery](deployment-checks-and-recovery.md)<br>Current: `Advanced`<br>Below: none, this is the deepest current depth in this bucket |
| Module position in this bucket | Previous in bucket: [Deployment Checks and Recovery](deployment-checks-and-recovery.md)<br>Current module: `Hardware, ROS, and Multi-Screen Topologies`<br>Next in bucket: none, this is the last module in the bucket sequence |
| Reference bridges | [Animation, Integration, and Deployment Reference](../reference/animation-integration-and-deployment-reference.md)<br>[Validation Checkpoints](../support/validation-checkpoints.md)<br>[Troubleshooting Matrix](../support/troubleshooting-matrix.md) |
| Module type | comparison |
| Bucket overview | [Deploy](README.md) |

## Reader Outcome

After this page, you should be able to compare the main advanced deployment topology directions around Vizij:

1. single-host multi-monitor deployments,
2. split control-surface and display workflows,
3. robot or ROS-adjacent control paths.

You should also be able to explain which parts are current implementation truth, which parts are planned next-step deployment work, and which parts are still future-facing.

## Module Notes

### Intended Audience

This page is for readers who already understand:

1. [Easiest Standalone Deployment](easiest-standalone-deployment.md),
2. [Operator and Deployment Model](operator-and-deployment-model.md),
3. [Deployment Checks and Recovery](deployment-checks-and-recovery.md).

It is not a first deployment page. It is for readers who are choosing a deeper topology after the simple deployment path already makes sense.

### Why This Page Exists

The earlier deploy pages establish the first believable endpoint and the operator model.

That still leaves one advanced decision space:

how the endpoint, operator, and surrounding hardware are arranged.

Without this page, readers tend to make one of three mistakes:

1. treating advanced topologies as if they are the required next step for everyone,
2. assuming multi-screen and ROS are already the same maturity level,
3. reading aspirational docs language as if it were guaranteed by the current implementation.

This page exists to prevent that.

### Artifact Being Touched

The artifact here is the deployed runtime endpoint plus its control and display topology:

1. where the rendered face lives,
2. where the operator controls live,
3. how many screens or devices participate,
4. what kind of control connection exists between them.

This is different from earlier deploy pages because the main question is no longer:

`Can I deploy it?`

It is now:

`What deployment shape am I actually choosing?`

### What This Page Does And Does Not Cover

This page does cover:

1. the major advanced topology directions,
2. the distinction between current support and planned direction,
3. the tradeoffs around host, display, and control-surface arrangement.

This page does not cover:

1. a full ROS package or middleware walkthrough,
2. distributed security and network hardening,
3. multi-face shared-runtime architecture,
4. a complete remote-control production runbook.

Those would require deeper implementation docs than this guidebook module should claim.

## What You Need

It helps if you can inspect:

1. `vizij-web/apps/vizij-standalone/README.md`,
2. `vizij-web/apps/vizij-standalone/src/App.tsx`,
3. `vizij-web/apps/vizij-standalone/src-tauri/src/lib.rs`,
4. `vizij-web/apps/vizij-standalone/src-tauri/src/connection_manager.rs`,
5. `vizij-web/apps/vizij-standalone/src/hooks/useWebSocketSync.ts`,
6. `vizij-docs/active_projects/runtime/multi_screen/multi_screen-plan.md`.

You do not need full ROS integration knowledge to use this page well.

## The Three Topology Directions

> TODO(content-model): Add a comparison diagram here to show single-host multi-monitor, split control-surface planning, and ROS or hardware-oriented topologies side by side. Best fit because this module is comparing advanced deployment directions and readers need a visual topology map before they choose among them.

The current advanced deployment space is best understood as three directions rather than one ladder.

### 1. Single-host multi-monitor deployment

This is the most concrete advanced step in the current implementation.

`vizij-standalone` already supports:

1. fullscreen launch,
2. display selection,
3. always-on-top and kiosk-style window options.

That makes multi-monitor deployment the cleanest currently grounded advanced topology:

1. one machine,
2. one runtime endpoint,
3. the face on one display,
4. optional operator or utility surfaces on another display.

This is advanced, but it is still close to the simple deployment story.

### 2. Split control-surface and display workflows

This is the next topology direction.

The current standalone stack clearly aims toward operator-control workflows:

1. there is a built-in control-panel concept,
2. the multi-screen runtime plan explicitly calls out split-screen operator control,
3. `useWebSocketSync` and the connection-manager model show how slot discovery and input control are meant to work.

At the same time, the current implementation has boundaries that matter:

1. the Tauri layer currently binds the server to `127.0.0.1`,
2. the connection manager enforces an exclusive-client policy,
3. the strongest current truth is therefore same-host control first, not fully general distributed control.

That means split control-surface workflows are real as a topology direction, but readers should treat broader device separation as planned and partially normalized rather than fully assumed.

### 3. Robot or ROS-adjacent deployment

This is the farthest-reaching topology direction discussed in current roadmap language.

It matters because Vizij is often imagined as part of a robotics or embodied-system surface.

The guidebook should still be honest:

the current maintained deploy path is anchored in standalone runtime and typed control endpoints, not in a full ROS deployment playbook.

So this page treats ROS and hardware topologies as comparative deployment directions, not as a promise that the whole robotics middleware story is already packaged for the reader.

## What The Current Implementation Truth Supports Best

The current implementation truth supports these claims most strongly:

1. a standalone runtime can be packaged and launched on a selected display,
2. the runtime can expose typed input slots through the standalone stack,
3. the control system currently enforces exclusive active-client behavior,
4. same-host multi-screen arrangements are more directly grounded than remote distributed ones.

That is the stable center of the page.

## Important Current Boundary: Localhost Versus Broader Remote Control

This page needs to state one operational truth very clearly.

The current `src-tauri/src/lib.rs` implementation binds the connection server to `127.0.0.1:{port}`.

That means localhost-only by current code.

Some surrounding docs still describe broader LAN or phone-based remote control flows. Those descriptions are useful as topology intent, but they are not the strongest current implementation truth if the bind behavior remains local-only.

So the clean rule for this page is:

1. treat same-host control as current truth,
2. treat broader remote-device flows as a normalization target rather than a guaranteed default.

## Important Current Boundary: Exclusive Client Policy

The current connection manager allows only one active client across connections at a time.

That matters because it changes the topology tradeoff:

1. operator panels are simpler to reason about,
2. multi-client collaboration is not the default behavior,
3. advanced remote workflows need to account for handoff and exclusivity rather than assuming many simultaneous controllers.

This is a topology constraint, not just an implementation footnote.

## How To Choose Among These Topologies

> TODO(content-model): Add a decision guide here to map common deployment constraints to the topology direction they favor. Best fit because this section is already structured as a choice surface and a compact chooser would make the tradeoffs easier to reuse later.

Use this decision framing:

### Choose single-host multi-monitor when

1. you already trust the standalone deployment path,
2. you need clearer operator visibility or kiosk presentation,
3. you want the simplest advanced topology that still changes the physical deployment shape.

### Choose split control-surface planning when

1. operator control is central to the deployment concept,
2. you need to think about separated controls and renderer views,
3. you are willing to treat some parts of the workflow as still being normalized.

### Choose ROS or hardware-oriented comparison when

1. your main concern is long-term system shape,
2. the deployment is part of a larger robotics or embodied environment,
3. you need topology framing before a deeper implementation plan exists.

That last choice is strategic, not a shortcut around current deployment maturity.

## Success Check

You are done with this page when:

1. you can explain why multi-monitor deployment is the most concrete current advanced topology,
2. you can explain why split control-surface workflows are real but still bounded by current implementation details,
3. you can explain why ROS and hardware deployment are comparative directions rather than the main maintained walkthrough,
4. you know when a topology question should route back into recovery or support pages.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-docs/current_documentation/ROADMAP.md`
2. `vizij-docs/current_documentation/ARCHITECTURE.md`
3. `vizij-docs/active_projects/runtime/multi_screen/multi_screen-plan.md`
4. `vizij-web/apps/vizij-standalone/README.md`
5. `vizij-web/apps/vizij-standalone/src/App.tsx`
6. `vizij-web/apps/vizij-standalone/src-tauri/src/lib.rs`
7. `vizij-web/apps/vizij-standalone/src-tauri/src/connection_manager.rs`
8. `vizij-web/apps/vizij-standalone/src/hooks/useWebSocketSync.ts`

## Recommended Next Steps

If you need to return to the stable deployment model, go back to [Operator and Deployment Model](operator-and-deployment-model.md).

If you need operational recovery and validation after choosing a topology, continue to [Deployment Checks and Recovery](deployment-checks-and-recovery.md).

If topology questions are really failure questions, continue to [Troubleshooting Matrix](../support/troubleshooting-matrix.md).
