<!-- tags: type=guidebook-module; status=in_progress; topics=guidebook,deploy,operator,standalone -->

> **Last updated:** 2026-03-11
> **Purpose:** explain what a deployed Vizij runtime consists of and how an operator actually interacts with it

# Operator and Deployment Model

## Reader Outcome

After this page, you should be able to explain the operational shape of the first Vizij deployment endpoint: what is running, who controls it, what signals move through it, and what counts as a healthy operator path.

## Intended Audience

This page is for readers who already understand the first standalone deployment walkthrough and now need the operating model behind it.

## What You Need

It helps if you have already completed:

1. [Minimal Web Player](../integrate/minimal-web-player.md),
2. [Easiest Standalone Deployment](easiest-standalone-deployment.md),
3. [Loading, Playback, and Embedding](../integrate/loading-playback-and-embedding.md).

## Artifact Being Touched

The deployment artifact here is not just a face file.

The first operator-facing deployment consists of:

1. a standalone runtime app,
2. a loaded face asset,
3. a running WebSocket control service,
4. a built-in or external control client,
5. a person or system operating the endpoint.

The maintained implementation anchor is `vizij-standalone`.

## The First Deployment Model

For the guidebook's first deployment path, the model is intentionally simple:

1. load a face into `vizij-standalone`,
2. expose a control surface over WebSocket,
3. optionally use the built-in web control panel,
4. validate that runtime and control are both healthy.

This keeps deployment concrete without immediately pulling the reader into ROS, custom robotics bridges, or multi-screen topology decisions.

## What The Operator Actually Needs

An operator does not need every internal detail of the runtime.

They do need clarity on:

1. whether the face asset loaded successfully,
2. whether the runtime is ready,
3. what port or endpoint the control client should use,
4. whether a control client is connected,
5. whether the face is actually responding to inputs,
6. how to reset or recover when something goes wrong.

That is the practical deployment model.

## Control Surface Model

The first deployed control path is WebSocket-driven.

Important operational facts from the current standalone app:

1. the default endpoint is `ws://localhost:9000`,
2. the server can accept LAN clients,
3. the built-in web control panel is served on the same port,
4. the control panel behaves like a regular WebSocket client,
5. the app uses slots and typed values as the control contract.

This is why deployment is not just about rendering. The runtime has to expose a believable control surface for an operator or external system.

## Slot-Centric Thinking

Inside the standalone deployment model, the guidebook should teach readers to think in slots:

1. the deployment surface exposes controllable paths,
2. those paths are synchronized into the backend,
3. external clients write typed values against them,
4. the runtime updates the face accordingly,
5. reset and value-query behavior are part of normal operation.

That slot model is the deployment-facing expression of the same path-and-value ideas the reader already saw in `Control`.

## Built-In Web Control Panel

The built-in control panel is important because it lowers the first deployment barrier.

It gives the reader:

1. a no-extra-installation operator surface,
2. dynamic slot discovery,
3. real-time slider control,
4. reset behavior,
5. a believable phone-or-tablet control path for demos or installations.

The guidebook should treat this as part of the first deployment story, not as a side note.

## What Counts As A Healthy Deployment

A healthy first deployment has all of these:

1. the face is loaded,
2. the runtime is ready,
3. the WebSocket server is up,
4. a control client or the built-in panel can connect,
5. the face responds predictably to operator input,
6. the operator can recognize status and recover from obvious failures.

If one of those is missing, the result may still be a useful demo, but it is not yet a robust deployment story.

## Boundary To Advanced Deployment

This page deliberately stops before:

1. ROS integration,
2. custom network topologies,
3. multi-screen control setups,
4. hardware-specific transport decisions.

Those are real deployment topics, but they belong in the advanced deployment branch.

## Current Useful Visuals

Wave 2 still needs dedicated standalone screenshots or operator diagrams promoted into guidebook assets.

For now, the strongest current visual candidates are:

1. the standalone app status UI,
2. the built-in web control panel,
3. a simple diagram showing runtime app, WebSocket server, and control client.

## Success Check

You are done with this page when:

1. you can explain the first operator-facing deployment model in plain language,
2. you understand the role of the WebSocket service and the built-in control panel,
3. you can name the minimum conditions for a healthy deployed endpoint.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/vizij-standalone/README.md`
2. `vizij-web/apps/vizij-standalone/src/App.tsx`
3. `vizij-web/apps/vizij-standalone/src/hooks/useWebSocketSync.ts`
4. `current_documentation/workshops/vizij-afternoon-workshop/handouts/animation-integration-deployment-reference.md`
5. `current_documentation/workshops/vizij-afternoon-workshop/checklists/troubleshooting-playbook.md`

## Next Step

1. For reusable readiness checks across the route, continue to [Validation Checkpoints](../support/validation-checkpoints.md).
2. For failure recovery patterns, continue to [Troubleshooting Matrix](../support/troubleshooting-matrix.md).
