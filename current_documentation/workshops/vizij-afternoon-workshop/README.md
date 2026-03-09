# Vizij Afternoon Workshop Kit

Status: `in progress`
Last updated: 2026-03-09

This folder is the committed, facilitator-ready package for the Vizij afternoon workshop running from 2:30 pm to 6:00 pm. It is being built against the current `vizij-web`, `vizij-docs`, and related runtime surfaces so the workshop materials stay tied to the code that exists today.

## Target Outcomes

By the end of the workshop, participants should be able to:

1. Load and control a Vizij face with the React runtime.
2. Inspect the renderer data model and reason about rig input paths.
3. Author or adjust rigging in `vizij-authoring`.
4. Trigger poses, animations, and runtime helpers in a live face app.
5. Understand how a conversation engine drives visemes and expressions.
6. Explain the path from local demo to robot-facing deployment.
7. Contribute informed roadmap, research, and strategy feedback.

## Deliverables

This workshop kit is being assembled as:

1. `planning/` for execution plan, progress tracking, and source audit.
2. `facilitator/` for run-of-show, presenter notes, and support playbooks.
3. `participant/` for quickstarts and workshop guidance.
4. `slides/` for the presentation deck and slide notes.
5. `handouts/` for printable or shareable references.
6. `exercises/` for activity sheets and breakout prompts.
7. `checklists/` for setup, AV, troubleshooting, and deployment readiness.
8. `breakouts/` for roadmap, research, and strategy planning artifacts.
9. `assets/` for screenshots and other presenter-facing visuals.

## Source of Truth

The workshop is anchored to these current surfaces:

1. `vizij-web/apps/vizij-authoring`
2. `vizij-web/apps/tutorial-fullscreen-face`
3. `vizij-web/apps/tutorial-agent-face`
4. `vizij-web/apps/demo-vizij-player`
5. `vizij-web/apps/vizij-standalone`
6. `vizij-docs/current_documentation/ROADMAP.md`

See `planning/source-audit.md` for the initial repository audit and reuse strategy.
