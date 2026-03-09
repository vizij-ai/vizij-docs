# Activity 2 Lab: Animation, Integration, and Deployment

Last updated: 2026-03-09

Time block: `3:45 pm to 4:30 pm`

## Goal

Understand how Vizij handles stored animation, live conversational control, and deployment-oriented runtime control.

## Part A: Animation Concepts in `demo-vizij-player`

1. Launch:

```bash
pnpm run dev:demo-vizij-player
```

2. Identify the key panels:
   - bootstrap checklist
   - rig controls
   - animations
   - diagnostics
3. Explain to a partner what the app is merging or coordinating.
4. Find one example of how manual control and animation could both affect the face.

Checkpoint:

1. You can explain why `demo-vizij-player` is useful even if you are not editing the code.

## Part B: Conversation Integration in `tutorial-agent-face`

Facilitator-led default path:

1. The facilitator launches the app and connects the conversation engine.
2. Participants observe the mouth-source selector, emotion buttons, and status chips.
3. The facilitator demonstrates how blend window and lead affect the mouth timing.

Participant path if credentials are available:

```bash
export VITE_GEMINI_API_KEY="<set locally>"
pnpm --filter tutorial-agent-face run dev
```

Checkpoint:

1. You can explain the difference between text-only baseline, synth, and align mouth modes.

Fallback if no API key is available:

1. Study the UI state and the facilitator demo.
2. Read `apps/tutorial-agent-face/src/FaceApp.tsx`.
3. Explain how the app combines live conversation, visemes, and expression tools.

## Part C: Deployment in `vizij-standalone`

1. Review `apps/vizij-standalone/README.md`.
2. Note the WebSocket port default and the purpose of the web control panel.
3. Review the example flow:
   - load a GLB
   - expose a control surface
   - send typed slot values over WebSocket

Checkpoint:

1. You can describe how Vizij moves from a local demo app to a robot-facing runtime.

## Stretch Tasks

1. Sketch a simple gesture or animation you would want to add to a face.
2. Propose one input or diagnostic you would add to the deployment story.
3. Write down one risk in moving from desktop demo to robot integration.

## Debrief Questions

1. Which surface felt closest to a real deployment?
2. What is still missing for your use case?
3. What concept became clearer when you saw animation and live control side by side?
