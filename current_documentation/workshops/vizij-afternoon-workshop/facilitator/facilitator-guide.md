# Facilitator Guide

Last updated: 2026-03-13

This guide is the primary operating document for the workshop host. Use it alongside `run-of-show.md`, the slide deck in `slides/`, the participant guide, and the lab sheets in `exercises/`.

## Operating Defaults

This guide currently assumes:

1. facilitator-led delivery with participant coding encouraged,
2. participant work in pairs or trios,
3. mixed readiness across attendee laptops,
4. at least three helpers,
5. `tutorial-agent-face` as a facilitator-led live segment,
6. the guidebook as facilitator infrastructure and post-session follow-up, not the main live participant packet.

## Teaching Model

Use the same rhythm in every workshop segment:

1. Orient: state the objective in one sentence and show what success looks like.
2. Demo: perform the smallest meaningful live walkthrough.
3. Try: give participants a short, concrete task with a visible checkpoint.
4. Debrief: ask what changed, what broke, and what pattern they noticed.

Keep the workshop hands-on. Slides should frame the activity, not replace it.

## Guidebook Role

Use the guidebook in three specific ways:

1. before the event, to align your own mental model and helper language,
2. during the session, to answer deeper terminology or architecture questions,
3. after the session, as the main follow-up reading path for advanced participants.

Do not send the room into the guidebook as the default live activity flow. In the room, keep participants on:

1. `participant/participant-guide.md`,
2. `participant/vizij-afternoon-workbook.pdf` when you want one printable packet,
3. the activity sheets in `exercises/`,
4. the compact handouts in `handouts/`,
5. the facilitator demo.

## Materials Map

Use these documents in this order:

1. `checklists/pre-event-prep-checklist.md` for the 3-to-5-day and day-before tasks.
2. `facilitator/prework-message-template.md` for the participant prework note.
3. `facilitator/helper-briefing.md` for staff coordination.
4. `README.md` for the kit overview.
5. `facilitator/run-of-show.md` for exact timing.
6. `slides/slide-plan.md` and the exported deck for presentation flow.
7. `participant/participant-guide.md` for the participant-facing handout.
8. `exercises/activity-1-face-design-control.md` during the first hands-on block.
9. `exercises/activity-2-animation-integration-deployment.md` during the second hands-on block.
10. `checklists/day-of-facilitator-checklist.md` before the workshop begins.
11. `checklists/troubleshooting-playbook.md` during support windows.
12. `breakouts/roadmap-research-strategy-breakout-kit.md` during the 5:00 pm breakout block.

## Room Plan

Recommended layout:

1. Facilitator station with `vizij-web` checked out and dependencies installed.
2. Large display for the slide deck and live demos.
3. Participant pods of two or three for support and observation.
4. One whiteboard or shared notes surface for breakout report-backs.
5. One helper near the front for AV and app reset.
6. The remaining helpers circulating in the room by support lane.

## Staffing Model

Default role split:

1. You: pacing owner, main presenter, transition owner, debrief owner.
2. Helper 1: install and environment lane.
3. Helper 2: authoring and runtime-control lane during Activity 1.
4. Helper 3: animation, integration, and deployment lane during Activity 2.
5. Helper 4 if available: floater plus breakout note coordinator.

## Pre-Event Preparation

### 3 to 5 Days Before

1. Send the participant prework note.
2. Make it explicit that laptops are welcome but pairs or trios are expected if setup lags.
3. Ask participants to try `vizij-authoring`, `tutorial-fullscreen-face`, and `demo-vizij-player` ahead of time if possible.
4. Make it explicit that `tutorial-agent-face` will be facilitator-led and does not require participant credentials.

### Day Before

1. Smoke-check all five live demo surfaces on the presenter machine.
2. Confirm the deck, participant packet, handouts, and fallback screens are locally available.
3. Stage sample assets and keep one terminal per app ready for fast restarts.

## Required Repo Surfaces

These are the live demo anchors for the day:

1. `vizij-authoring`
2. `tutorial-fullscreen-face`
3. `demo-vizij-player`
4. `tutorial-agent-face`
5. `vizij-standalone`

## Segment Guidance

### 2:30 pm: Tutorial Introduction

Primary job:

1. Set outcomes and reduce anxiety.

What to show:

1. One short capstone teaser with `tutorial-agent-face`.
2. The schedule and what each app is for.
3. The fallback rule: if a live dependency fails, the facilitator demo remains the reference path.
4. The room rule: work in pairs or trios, keep coding if ready, keep learning even if local setup fails.

Success signal:

1. Participants can name the three main surfaces they will touch: authoring, runtime face, and deployment/runtime control.
2. Helpers are already moving toward the setup cluster without delaying the introduction.

### 2:45 pm to 3:30 pm: Activity 1

Primary job:

1. Move participants from inspection to control to rig reasoning.

Recommended order:

1. `2:45-2:55` `vizij-authoring` for face inspection and standard inputs.
2. `2:55-3:10` `tutorial-fullscreen-face` for runtime wiring and immediate control.
3. `3:10-3:20` short return to authoring plus code anchors for rigging and pose-group reasoning.
4. `3:20-3:30` recap and checkpoint.

Success signal:

1. Participants can make a face move on purpose and explain at least one `rig/{face}/...` path.
2. Most pairs can explain one path and one visible effect by the end of the block.

Room rule:

1. Keep the whole room on one step at a time.
2. Do not let fast participants disappear into deep authoring edits.
3. Use stretch tasks only after the core checkpoint is met.

### 3:30 pm Support Window

Primary job:

1. Unblock stuck setups without stalling the room.

How to run it:

1. Run two visible lanes:
   - Lane A: setup and app-launch recovery
   - Lane B: path-model and authoring exploration
2. Cluster issues by type inside those lanes: install, asset loading, path mismatch, runtime confusion.
3. Give unblocked participants one stretch task from `exercises/support-and-exploration-menu.md`.
4. Log recurring pain points for the breakout hour.

### 3:45 pm to 4:30 pm: Activity 2

Primary job:

1. Show that Vizij supports animations, live control, and deployment-oriented control surfaces.

Recommended order:

1. `demo-vizij-player` for animation and orchestration concepts.
2. `tutorial-agent-face` for facilitator-led live viseme and emotional control.
3. `vizij-standalone` for deployment and WebSocket control.

Success signal:

1. Participants understand the difference between authored animation, live control, and deployment/runtime packaging.
2. Most pairs can explain that difference by 4:30 pm even if they never ran the live conversation app themselves.

Room rule:

1. Participants may run `demo-vizij-player`.
2. Participants do not need to run `tutorial-agent-face`.
3. Teach `vizij-standalone` as guided architecture plus control-path understanding, not a participant binary-shipping exercise.

### 4:30 pm Support Window

Primary job:

1. Recover blocked demos and reinforce concepts.

How to use the time:

1. Offer one lane for troubleshooting and recovery.
2. Offer one lane for deeper experimentation with animation or control paths.
3. Reserve at least one helper to start breakout setup near the end of the block.

### 5:00 pm Breakouts

Primary job:

1. Convert the workshop into actionable product feedback and strategic input.

How to run it:

1. Split the room into three groups:
   - roadmap and product priorities
   - research and technical opportunities
   - deployment and adoption risks
2. Assign one reporter and one note-taker per group.
3. Use the breakout packet and the roadmap doc as the source of truth.
4. Call groups back at 5:40 pm.
5. Use 5:45 pm to 6:00 pm for report-backs and close.

Success signal:

1. Each group reports one prioritized opportunity, one blocker, and one next experiment.

## Fallback Paths

### If `tutorial-agent-face` cannot connect

Use this order:

1. Show the disconnected UI and explain the intended controls.
2. Demonstrate mouth, pose, and expression concepts with the rest of the packet.
3. Use `demo-vizij-player` to reinforce animation and orchestration without live audio.
4. Keep the live conversation segment facilitator-led rather than participant-led.

### If `vizij-authoring` is slow on participant machines

1. Run the authoring walkthrough from the facilitator machine.
2. Ask participants to use screenshots and handouts for the path-identification tasks.
3. Shift participant practice toward `tutorial-fullscreen-face`, which is lighter-weight.

### If deployment tooling is too heavy for full hands-on

1. Treat `vizij-standalone` as a show-and-explain segment.
2. Use the deployment checklist and WebSocket message examples as the participant artifact.

## Close

End on three questions:

1. What can you now control or explain that you could not before?
2. What part of Vizij feels most ready for real use?
3. What is the next missing piece for your team?

Then point participants to the guidebook as the main follow-up reading path, not the primary in-room script they should have used during the tutorial.
