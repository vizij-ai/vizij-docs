<!-- tags: type=plan; status=planned; topics=website,documentation,guidebook,tutorials,workshops -->

> **Related documents:** [Website & Ecosystem summary](../summary.md) · [Documentation Strategy & Content - Plan & Tracking](documentation_strategy-plan.md) · [Public Page Teaching Sourcebook](public_page_content_brief-reference.md) · [Public Teaching Gap Audit](public_teaching_gap_audit-reference.md) · [Public Quality Upgrade Plan](public_quality_upgrade_plan-plan.md) · [Vizij Roadmap & Active Programs](../../../../current_documentation/ROADMAP.md) · [Vizij Architecture & Documentation Guide](../../../../current_documentation/ARCHITECTURE.md) · [Vizij Afternoon Workshop Kit](../../../../current_documentation/workshops/vizij-afternoon-workshop/README.md)
>
> **Last updated:** 2026-03-11
> **Scope:** plan the canonical content spine that feeds public docs, tutorials, workshop materials, and linked implementation references

# Guidebook-First Documentation System Plan

## 1. Objective

Create one canonical Vizij guidebook content system that explains the maintained builder journey end to end, then repackage that material into:

1. evergreen public docs,
2. walkthrough tutorials,
3. workshop participant and facilitator materials,
4. event pages,
5. linked repo-local implementation references.

The goal is not one giant page. The goal is one maintained content spine with clear audience-specific outputs.

## 2. Core Decision

The upstream content model should be:

`one canonical guidebook -> many audience-shaped outputs`

Not:

`many partially overlapping guides, workshop packets, pages, and repo notes`

This follows the current rule that Vizij should present:

1. website as the landing and routing layer,
2. one mandatory builder spine:
   `Hello Face -> Authoring -> Player -> Deployment`
3. optional richer examples after `Player`, kept clearly secondary to the main route.

## 3. Scope Boundaries

### In scope

1. Define the master guidebook structure.
2. Define which content modules should exist once and be reused.
3. Define the output formats for website docs, tutorials, demos, workshops, and events.
4. Define authoring and maintenance rules so internal truth, public teaching, and workshop packaging stay aligned.

### Out of scope

1. Full crate or package API reference documentation.
2. Detailed repo-local engineering trackers.
3. Event scheduling and facilitation operations as part of the evergreen guidebook.
4. Marketing copy beyond what is needed to route readers into the right learning path.

## 4. Audience Model

The system should serve these audiences explicitly:

1. **Evaluators / newcomers**
   - Want the shortest path to understanding what Vizij is and how to get a face running.
2. **Builders / practitioners**
   - Want step-by-step workflows with exact commands, code, assets, validation, and troubleshooting.
3. **Integrators / contributors**
   - Want conceptual contracts plus reliable links to repo-local implementation details.
4. **Operators / deployment owners**
   - Want browser vs standalone guidance, control-surface expectations, and recovery paths.
5. **Workshop participants**
   - Want a time-boxed learning path built from the same core modules.
6. **Workshop facilitators**
   - Want operational wrappers around the core modules: timing, fallback paths, and support playbooks.

## 5. Canonical Guidebook Shape

The guidebook should be organized around one face-bundle lifecycle rather than repo boundaries.

### Part A: Orientation

1. What Vizij is
2. Who it is for
3. The maintained public path
4. What success looks like at each stage
5. Prerequisites and sample assets

### Part B: Core Concepts

1. Runtime and bundle mental model
2. Renderer data model
3. Rigging and control model
4. Animation model
5. Runtime integration model
6. Deployment and operator model

### Part C: Core Workflows

1. Hello Face
2. Inspect and reason about paths and inputs
3. Author and rig a face
4. Export a bundle
5. Run the bundle in a player/runtime
6. Add animation and orchestration
7. Add speech, visemes, and conversation behavior
8. Deploy in browser or standalone mode

### Part D: Validation and Support

1. Success checkpoints for each workflow
2. Troubleshooting by likely failure mode
3. Known limitations and current caveats
4. Where deeper repo-local detail lives

### Part E: Reference and Follow-On

1. Glossary and terminology
2. Canonical path families and examples
3. Sample asset set and expected bundle contents
4. Links to local implementation references
5. Release notes and known-issues pointers

## 6. Canonical Modules That Should Exist Once

These modules should be authored once, then repackaged:

1. Maintained public route overview
2. Setup and prerequisites
3. Canonical sample asset guidance
4. Bundle lifecycle overview
5. Runtime quickstart
6. Renderer data model
7. Rigging and control model
8. Authoring and export workflow
9. Animation and orchestration
10. Agent-face or conversation extension
11. Deployment and operator control
12. Validation and troubleshooting
13. Known limitations and current caveats
14. Glossary and deeper references

The workshop kit should mainly wrap these modules rather than rewrite them.

## 7. Output Architecture

### 7.1 `vizij-docs`

Role:

1. Internal canonical strategy and governance layer.
2. Home for the master guidebook source modules and planning docs.
3. Home for decisions, known issues, roadmap framing, and release-note policy.

### 7.2 `vizij-ai.github.io`

Role:

1. Public front door.
2. Home for evergreen conceptual docs under `/docs`.
3. Home for walkthrough tutorials under `/tutorials`.
4. Home for experiential live behavior under `/demos`.
5. Home for event pages under `/events`, which must point back to evergreen guides.

### 7.3 Workshop kit in `vizij-docs`

Role:

1. Package the same guidebook modules into facilitator and participant flows.
2. Add event-specific timing, sequencing, fallback paths, and breakout prompts.
3. Avoid becoming a second canonical tutorial system.

### 7.4 Repo-local docs

Role:

1. Own implementation detail, engineering trackers, and source-level contracts.
2. Remain linked from the guidebook when readers need lower-level detail.

## 8. Output Matrix

| Output surface | Primary job | Built from canonical modules | Excludes by default |
| --- | --- | --- | --- |
| `/docs/*` | Explain and orient | Concepts, comparisons, mental models, key contracts | Long procedural walkthroughs, event logistics |
| `/tutorials/*` | Help user do the work | Ordered workflows, code, commands, screenshots, validation, troubleshooting | Deep internal history, facilitator pacing |
| `/demos/*` | Let user inspect live behavior | Thin explainers, reproducible links, state/path callouts | Full walkthrough narrative |
| `/events/*` | Announce or record an event | Short route map into evergreen pages | Canonical evergreen guidance |
| Workshop participant kit | Time-boxed learning path | Tutorials, handouts, checkpoints, recovery tasks | Full implementation reference depth |
| Workshop facilitator kit | Session operations | Same core modules plus run-of-show and fallback notes | Public-facing page completeness requirements |

## 9. Packaging Rules

### 9.1 One page, one job

Every public page should primarily do one of these:

1. orient,
2. explain,
3. guide a workflow,
4. expose a live behavior,
5. route to deeper references.

### 9.2 Keep concepts and workflows separate

- Concept pages should teach mental models and comparisons.
- Tutorial pages should teach task completion and artifact production.
- Demo pages should show behavior and explain how to reproduce it.

### 9.3 Workshop content is a wrapper, not a parallel canon

- Workshop handouts, exercises, and facilitator notes should adapt canonical guidebook modules.
- Event-specific pacing, support windows, and breakouts stay outside the evergreen guidebook.

### 9.4 Public pages must not mirror internal docs verbatim

- `vizij-ai.github.io` should stay curated and audience-shaped.
- Internal docs remain the place for roadmap framing, decisions, known issues, and internal planning detail.

## 10. Reuse Strategy for Current Material

### Strong evergreen reuse candidates

1. Workshop handouts for runtime, renderer/rigging, and animation/deployment references.
2. Activity sheets that already encode checkpoints and practical tasks.
3. The public page teaching sourcebook and teaching-gap audit.
4. The existing docs/tutorial route split in `vizij-ai.github.io`.

### Event-specific material to keep separate

1. Facilitator run-of-show
2. Day-of checklists
3. Breakout packets
4. Slide deck timing and presenter operations
5. Participant workbook packaging tied to a specific session

### Transitional material to harvest, then de-emphasize

1. top-level `/docs`
2. older tutorial/workshop packs
3. event pages that currently carry teaching content better moved into evergreen docs/tutorials

## 11. Delivery Phases

### Phase 1: Lock the content architecture

1. Approve this guidebook-first model.
2. Confirm the canonical module list.
3. Confirm which current workshop/public materials map to each module.
4. Define owners for internal modules, public pages, and workshop packaging.

### Phase 2: Stand up the master guidebook scaffold

1. Create the canonical guidebook table of contents.
2. Create one markdown source module per major concept/workflow.
3. Add metadata for:
   - audience
   - page type
   - prerequisites
   - dependent outputs
   - implementation anchors

### Phase 3: Align the public site

1. Ensure every `/docs/*` page maps to a concept module.
2. Ensure every `/tutorials/*` page maps to a workflow module.
3. Ensure `/demos/*` sections link back to the exact tutorial or docs page that explains them.
4. Ensure `/events/*` pages behave as entry or archive points, not canonical tutorial homes.

### Phase 4: Refactor workshop materials around the modules

1. Rebuild participant handouts from the same workflow modules.
2. Rebuild facilitator materials as wrappers around the same sequence.
3. Keep only event-only material in workshop operations docs.

### Phase 5: Validation and maintenance

1. Validate that every published workflow still matches the real apps and commands.
2. Update public pages when known issues or releases materially affect them.
3. Keep implementation detail local and summary truth cross-repo.

## 12. Acceptance Criteria

1. The guidebook-first content model is documented and approved.
2. Each core Vizij topic has one canonical module, not multiple competing explanations.
3. Public docs, tutorials, demos, and workshops have clearly different jobs.
4. Workshop materials no longer function as a parallel canonical tutorial set.
5. Event pages point readers toward evergreen learning paths.
6. Repo-local references remain linked but not duplicated into the public layer.

## 13. Risks

1. The guidebook could become an overloaded monolith if module boundaries are weak.
2. Public pages could drift back toward internal engineering prose if the curation rule is not enforced.
3. Workshop needs could leak into evergreen pages unless event packaging stays separate.
4. Validation cost will rise if module ownership and refresh rules are not explicit.
5. The sample asset set and maintained app sequence must stay aligned with what the docs teach.

## 14. Next Recommended Deliverables

1. A canonical guidebook table of contents document.
2. A module inventory that maps current files to the new guidebook structure.
3. A public-route mapping sheet for `/docs`, `/tutorials`, `/demos`, and `/events`.
4. A workshop extraction sheet marking which files are evergreen, reusable, or event-only.
