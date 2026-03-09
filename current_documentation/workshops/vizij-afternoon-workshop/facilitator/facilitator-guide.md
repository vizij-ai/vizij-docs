# Facilitator Guide

Last updated: 2026-03-09

This guide is the primary operating document for the workshop host. Use it alongside `run-of-show.md`, the slide deck in `slides/`, the participant guide, and the lab sheets in `exercises/`.

## Teaching Model

Use the same rhythm in every workshop segment:

1. Orient: state the objective in one sentence and show what success looks like.
2. Demo: perform the smallest meaningful live walkthrough.
3. Try: give participants a short, concrete task with a visible checkpoint.
4. Debrief: ask what changed, what broke, and what pattern they noticed.

Keep the workshop hands-on. Slides should frame the activity, not replace it.

## Materials Map

Use these documents in this order:

1. `README.md` for the kit overview.
2. `facilitator/run-of-show.md` for exact timing.
3. `slides/slide-plan.md` and the exported deck for presentation flow.
4. `participant/participant-guide.md` for the participant-facing handout.
5. `exercises/activity-1-face-design-control.md` during the first hands-on block.
6. `exercises/activity-2-animation-integration-deployment.md` during the second hands-on block.
7. `checklists/day-of-facilitator-checklist.md` before the workshop begins.
8. `checklists/troubleshooting-playbook.md` during support windows.
9. `breakouts/roadmap-research-strategy-breakout-kit.md` during the 5:00 pm breakout block.

## Room Plan

Recommended layout:

1. Facilitator station with `vizij-web` checked out and dependencies installed.
2. Large display for the slide deck and live demos.
3. Participant pods of two or three for support and observation.
4. One whiteboard or shared notes surface for breakout report-backs.

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

Success signal:

1. Participants can name the three main surfaces they will touch: authoring, runtime face, and deployment/runtime control.

### 2:45 pm to 3:30 pm: Activity 1

Primary job:

1. Move participants from inspection to control to rig reasoning.

Recommended order:

1. `vizij-authoring` for face inspection and standard inputs.
2. `tutorial-fullscreen-face` for runtime wiring and immediate control.
3. Short return to authoring for rigging and pose-group reasoning.

Success signal:

1. Participants can make a face move on purpose and explain at least one `rig/{face}/...` path.

### 3:30 pm Support Window

Primary job:

1. Unblock stuck setups without stalling the room.

How to run it:

1. Cluster issues by type: install, asset loading, path mismatch, runtime confusion.
2. Give unblocked participants one stretch task from `exercises/support-and-exploration-menu.md`.

### 3:45 pm to 4:30 pm: Activity 2

Primary job:

1. Show that Vizij supports animations, live control, and deployment-oriented control surfaces.

Recommended order:

1. `demo-vizij-player` for animation and orchestration concepts.
2. `tutorial-agent-face` for live viseme and emotional control.
3. `vizij-standalone` for deployment and WebSocket control.

Success signal:

1. Participants understand the difference between authored animation, live control, and deployment/runtime packaging.

### 4:30 pm Support Window

Primary job:

1. Recover blocked demos and reinforce concepts.

How to use the time:

1. Offer one lane for troubleshooting.
2. Offer one lane for deeper experimentation with animation or control paths.

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

Success signal:

1. Each group reports one prioritized opportunity, one blocker, and one next experiment.

## Fallback Paths

### If `tutorial-agent-face` cannot connect

Use this order:

1. Show the disconnected UI and explain the intended controls.
2. Demonstrate mouth, pose, and expression concepts with the rest of the packet.
3. Use `demo-vizij-player` to reinforce animation and orchestration without live audio.
4. Treat the live conversation segment as facilitator-led rather than participant-led.

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
