# Execution Plan

Last updated: 2026-03-09

## Mission

Create a complete, polished, facilitator-ready workshop kit for the Vizij afternoon tutorial. The output must be runnable against the current codebase, visually grounded in current app screenshots, and organized so the facilitator can move from introduction through hands-on activities, support windows, break, and strategy breakouts without improvising missing materials.

## Scope

In scope:

1. Run-of-show aligned to the exact 2:30 pm to 6:00 pm schedule.
2. Facilitator guide with timing, demos, and fallback paths.
3. Participant-facing quickstarts, handouts, and exercises.
4. Slide deck with speaker notes.
5. Screenshot set and evidence for current UI surfaces.
6. Breakout prompts and capture templates for roadmap/research/planning.
7. Setup, troubleshooting, AV, and deployment checklists.
8. Validation against current `vizij-web` apps and docs.

Out of scope:

1. Broad product refactors unrelated to workshop readiness.
2. New production app features unless required to unblock workshop reliability.
3. Long-form marketing collateral.

## Workshop Mapping

1. 2:30 pm: Tutorial introduction
2. 2:45 pm: Activity 1, face design and control
3. 3:30 pm: Technical support or exploration time
4. 3:45 pm: Activity 2, animation, integration, deployment
5. 4:30 pm: Technical support or exploration time
6. 4:45 pm: Coffee break
7. 5:00 pm: Vizij roadmap, research, and strategic planning breakouts
8. 6:00 pm: Tutorial concludes

## Delivery Phases

### Phase 1: Source audit and structure

1. Audit existing tutorial materials and app surfaces.
2. Map each workshop segment to current code and docs.
3. Stand up this committed workshop-kit folder and tracking docs.

### Phase 2: Core materials

1. Write the facilitator guide and run-of-show.
2. Write participant quickstarts and activity sheets.
3. Build setup, troubleshooting, and deployment references.
4. Build breakout packets for the 5:00 pm session.

### Phase 3: Presentation and visuals

1. Create a presentation deck from the current outline.
2. Capture screenshots from the live apps.
3. Align slide visuals and references with the docs.

### Phase 4: Validation and refinement

1. Run the relevant apps and confirm current UI matches the instructions.
2. Review the packet for consistency, timing, and clarity.
3. Tighten fallback paths where a live dependency is fragile.

## Validation Plan

1. Confirm `tutorial-fullscreen-face` runs and is screenshot-ready.
2. Confirm `vizij-authoring` is usable for the activity walkthrough.
3. Confirm `demo-vizij-player` is sufficient for animation concepts.
4. Confirm `vizij-standalone` replaces outdated deployment references.
5. Confirm `tutorial-agent-face` guidance clearly handles API-key and fallback conditions.
6. Review every workshop doc for consistent terminology and paths.
7. Render and inspect slide previews before final export.

## Risks

1. `tutorial-agent-face` depends on `VITE_GEMINI_API_KEY`, which makes hands-on reliability sensitive to credentials and network conditions.
2. Existing workshop material outside the git repos is useful source material but not a safe final home for committed workshop assets.
3. The deployment section in older workshop notes points at `vizij-ws-app`, while the current repo surface is `vizij-standalone`.

## Mitigations

1. Provide a facilitator-led path and a fallback path for the conversation segment.
2. Keep the committed workshop kit in `vizij-docs` and only reuse external draft content as source.
3. Rewrite deployment guidance around `vizij-standalone` and its WebSocket control path.
