<!-- tags: family=workshop; type=workshop-kit; workshop_kind=evidence; workshop_status=archived; topics=workshop,workshops,vizij-afternoon-workshop,archive -->

# Vizij Afternoon Workshop Kit

Status: `archived event snapshot`
Last updated: 2026-03-13

This folder is the archived event-specific snapshot of the Vizij afternoon workshop package that was previously assembled as a live delivery kit.

Use `workshops/` for live workshop creation guidance and templates. Use this archived package only as historical reference or inspiration for future workshop builds.

The output of this workshop is the feedback that will inform the roadmap, saved in [`feedback_for_roadmap.md`](feedback_for_roadmap.md).

## Ephemeral Copy Policy

This workshop package is an ephemeral delivery kit, not a canonical documentation surface.

Use these rules when editing it:

1. Handouts and participant-facing references may intentionally duplicate maintained guidebook or reference docs.
2. Canonical technical updates belong in the maintained source docs outside this workshop tree, not in the duplicated workshop copies.
3. Workshop-local wording, pacing, simplifications, and facilitator tweaks are allowed when they help delivery in the room.
4. Those workshop-local tweaks do not automatically flow back into the canonical docs.
5. After the workshop run is complete, archive this full workshop package rather than treating it as an evergreen maintained surface.

## Operating Defaults

This kit currently assumes:

1. a facilitator-led room with participant coding encouraged,
2. participants working in pairs or trios,
3. mixed setup readiness across attendee laptops,
4. at least three helpers,
5. `tutorial-agent-face` as a facilitator-led live segment rather than a required participant app,
6. the guidebook as facilitator infrastructure and post-session follow-up, not the main live participant script.

## Target Outcomes

By the end of the workshop, participants should be able to:

1. Load and control a Vizij face with the React runtime.
2. Inspect the renderer data model and reason about rig input paths.
3. Author or adjust rigging in `vizij-authoring`.
4. Trigger poses, animations, and runtime helpers in a live face app.
5. Understand how a conversation engine drives visemes and expressions.
6. Explain the path from local demo to robot-facing deployment.
7. Contribute informed roadmap, research, and strategy feedback.

## Start Here

Use the packet in this order:

1. `checklists/pre-event-prep-checklist.md`
2. `facilitator/prework-message-template.md`
3. `facilitator/helper-briefing.md`
4. `facilitator/materials-walkthrough.md`
5. `checklists/day-of-facilitator-checklist.md`
6. `slides/vizij-afternoon-workshop-deck.html` or `slides/vizij-afternoon-workshop-deck.pdf`
7. `facilitator/facilitator-guide.md`
8. `participant/vizij-afternoon-workbook.pdf`
9. `participant/participant-guide.md`

## Deliverables

This workshop kit is being assembled as:

1. `planning/` for execution plan, progress tracking, and source audit.
2. `facilitator/` for run-of-show, presenter notes, support playbooks, prework, and helper briefing.
3. `participant/` for quickstarts and workshop guidance.
4. `slides/` for the presentation deck and slide notes.
5. `handouts/` for printable or shareable references.
6. `exercises/` for activity sheets and breakout prompts.
7. `checklists/` for setup, AV, troubleshooting, and deployment readiness.
8. `breakouts/` for roadmap, research, and strategy planning artifacts.
9. `assets/` for screenshots and other presenter-facing visuals.
10. `planning/validation.md` for smoke-check and build evidence.

## Presentation Files

1. `slides/vizij-afternoon-workshop-deck.html` for the live browser-based deck
2. `slides/vizij-afternoon-workshop-deck.pdf` for a portable export
3. `slides/speaker-notes.md` for presenter notes

## Participant Handout

1. `participant/vizij-afternoon-workbook.html`
2. `participant/vizij-afternoon-workbook.pdf`
3. `participant/participant-guide.md`

## Guidebook Role

Use the guidebook behind this workshop in three ways:

1. facilitator prep and helper briefing before the room opens,
2. terminology and mental-model backup during the session when deeper explanation is needed,
3. follow-up reading after the tutorial for participants who want the broader self-study path.

Do not treat the guidebook as the primary live participant packet during the 2:30 pm to 6:00 pm block. The participant guide, workbook, activity sheets, and compact handouts are the primary in-room surfaces.

The handouts in this workshop package are delivery copies. If a technical explanation needs an evergreen correction, update the maintained guidebook or other canonical source first.

## Visual Assets

Presenter screenshots live under:

1. `assets/screenshots/`

## Canonical Sources

The workshop is anchored to these current surfaces:

1. `vizij-web/apps/vizij-authoring`
2. `vizij-web/apps/tutorial-fullscreen-face`
3. `vizij-web/apps/tutorial-agent-face`
4. `vizij-web/apps/demo-vizij-player`
5. `vizij-web/apps/vizij-standalone`
6. `vizij-docs/current_documentation/ROADMAP.md`
7. `vizij-docs/current_documentation/guidebook/`

See `planning/source-audit.md` for the initial repository audit and reuse strategy.
