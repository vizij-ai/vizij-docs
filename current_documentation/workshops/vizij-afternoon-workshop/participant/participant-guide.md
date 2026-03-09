# Participant Guide

Last updated: 2026-03-09

Welcome to the Vizij afternoon workshop. This guide is the participant-facing companion to the live session.

## What You Will Learn

By the end of the session, you should be able to:

1. Load and control a Vizij face in a React app.
2. Identify standard face-control paths and pose-weight paths.
3. Understand how authoring, runtime control, animation, and deployment fit together.
4. Explain how a conversation engine or external controller can drive a face.

## Workshop Agenda

1. 2:30 pm: Introduction and teaser demo
2. 2:45 pm: Activity 1, face design and control
3. 3:30 pm: Technical support or exploration
4. 3:45 pm: Activity 2, animation, integration, and deployment
5. 4:30 pm: Technical support or exploration
6. 4:45 pm: Coffee break
7. 5:00 pm: Roadmap, research, and strategy breakouts
8. 6:00 pm: Close

## Repo Setup

From `vizij-web`:

```bash
pnpm install
```

Core launch commands:

```bash
pnpm run dev:vizij-authoring
pnpm run dev:tutorial-fullscreen-face
pnpm run dev:demo-vizij-player
```

The live-conversation demo is optional for most participants and requires a facilitator-provided or locally configured `VITE_GEMINI_API_KEY`.

## Core Concepts

Remember these path patterns:

1. Standard rig input:
   `rig/{face}/standard/{channel}/{track}/{attribute}`
2. Pose weight:
   `rig/{face}/poses/{pose_name}.weight`
3. Viseme weight:
   `rig/{face}/visemes/{viseme_id}.weight`

## Activity 1 Success Checks

You are done with Activity 1 when:

1. You can load or inspect a face asset in `vizij-authoring`.
2. You can point to one or more standard control paths.
3. You can run `tutorial-fullscreen-face` and trigger a visible change with the mouse or a hotkey.

## Activity 2 Success Checks

You are done with Activity 2 when:

1. You can explain how a stored animation differs from live input control.
2. You can identify how `tutorial-agent-face` drives visemes and emotion.
3. You can explain how `vizij-standalone` exposes a WebSocket control surface for deployment.

## If You Get Stuck

1. Use the facilitator’s live demo as the reference path.
2. Pair with a neighbor and compare which step diverged.
3. Use the support windows to recover setup or ask for a walkthrough.
4. Keep moving through the worksheet even if one live dependency does not cooperate.

## Suggested Reading During the Session

1. `handouts/vizij-runtime-quickstart.md`
2. `handouts/renderer-rigging-reference.md`
3. `handouts/animation-integration-deployment-reference.md`

## Breakout Preparation

During the 5:00 pm breakout, come ready to answer:

1. What feels most promising in Vizij right now?
2. What is still missing for your use case?
3. What experiment or milestone should happen next?
