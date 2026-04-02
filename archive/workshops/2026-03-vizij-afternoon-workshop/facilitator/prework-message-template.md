<!-- tags: family=workshop; type=facilitator-note; workshop_kind=reusable; workshop_status=ready; topics=workshop,workshops,vizij-afternoon-workshop,facilitator,prework-message-template -->

# Participant Prework Message Template

Last updated: 2026-03-13

Use this 3 to 5 days before the tutorial. Send it as email, conference chat, or a pinned event message.

---

Subject: Vizij HRI 2026 afternoon tutorial prework

Hello everyone,

Thanks for joining the Vizij afternoon tutorial at HRI 2026. We will run a hands-on session from 2:30 pm to 6:00 pm focused on face authoring, runtime control, animation, integration, and deployment concepts.

To arrive ready, please do the following before the session if you can:

1. Check out the repo and open the `vizij-web` workspace.
2. Run:

```bash
pnpm install
```

3. If you want to arrive with the core apps already working, try launching:

```bash
pnpm run dev:vizij-authoring
pnpm run dev:tutorial-fullscreen-face
pnpm run dev:demo-vizij-player
```

What to expect in the room:

1. We will work in pairs or trios if setup lags.
2. You are welcome to code on your own machine.
3. The facilitator demo will remain the canonical reference path if your local setup does not cooperate.
4. The live conversation segment using `tutorial-agent-face` will be facilitator-led, so you do not need participant credentials for that portion.

Please bring:

1. a laptop,
2. your preferred editor,
3. anything you need for local Node/pnpm development,
4. questions about your own robot-face use case.

If you cannot get the apps running beforehand, still come. The tutorial is designed to remain useful even if some participants stay on the facilitator-led path.

See you there.

---

## Send Checklist

Before sending, make sure the message includes:

1. the three core participant-run apps,
2. the `pnpm install` requirement,
3. the pair/trio fallback rule,
4. the facilitator-led nature of the live conversation demo.
