<!-- tags: family=workshop; type=checklist; workshop_kind=reusable; workshop_status=ready; topics=workshop,workshops,vizij-afternoon-workshop,checklists,pre-event-prep-checklist -->

# Pre-Event Prep Checklist

Last updated: 2026-03-13

Use this checklist 3 to 5 days before the workshop and again the day before travel.

## 3 to 5 Days Before

1. Send the participant prework message from `facilitator/prework-message-template.md`.
2. Confirm the room plan assumes participants will work in pairs or trios.
3. Confirm you have at least three helpers or explicit fallback if one drops.
4. Share the helper briefing packet and schedule the 20 to 30 minute helper sync.
5. Confirm which machine is the presenter machine and which helper machine is the backup demo path.

## Helper Briefing

1. Walk through `facilitator/helper-briefing.md`.
2. Assign support lanes:
   - install and environment
   - authoring and runtime control
   - animation, integration, and deployment
3. Rehearse the fallback rule:
   - facilitator demo is the canonical reference path if participant machines fail
4. Confirm who will manage breakout note capture if a fourth helper is available.

## Day Before

1. Run a presenter-machine smoke pass for:
   - `vizij-authoring`
   - `tutorial-fullscreen-face`
   - `demo-vizij-player`
   - `tutorial-agent-face`
   - `vizij-standalone`
2. Confirm `VITE_GEMINI_API_KEY` is set on the presenter machine for the live demo path.
3. Confirm the slide deck, participant guide, workbook, and handouts are easy to open locally.
4. Queue one fallback screen per segment:
   - authoring screenshot or live authoring ready state
   - fullscreen face ready state
   - player shell ready state
   - agent-face disconnected or connected UI state
   - standalone README and sample control message
5. Stage the sample assets so they are easy to reach during the live demo.

## Final Readiness Standard

Treat prep as complete only when:

1. the presenter machine can carry the full room alone if needed,
2. helpers know their lane and fallback rule,
3. participants can be told exactly what to install before arrival,
4. the deck, handouts, and activity sheets are all locally available.
