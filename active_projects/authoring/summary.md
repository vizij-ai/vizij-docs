# Vizij Authoring Program Summary
<!-- tags: family=project; type=summary; project_status=tracking; topics=authoring,workflow,runtime-correctness,ui-ux -->

> **Last updated:** 2026-04-02

## Goals

Deliver the blocking creator/build spine for the maintained Vizij path: import a supported face, author and rig it, export a bundled GLB, and run it successfully in the maintained runtime flow.

## Role In Current Roadmap

This program is the authoring owner inside the creator/build reliability gate defined in [ROADMAP.md](../../current_documentation/ROADMAP.md).

The roadmap owns the full creator-phase gate, blocking spine, and cross-program ordering.

This summary owns the current authoring-side execution view:

- what the authoring program is directly carrying
- what is open vs complete
- what depends on runtime, assets, and code-quality support
- where detailed execution tracking lives

## Authority Note

This file is the canonical cross-repo summary for authoring status and strategic framing.

Detailed execution tracking, stage gates, and feature-level backlog detail live in:

- `vizij-web/apps/vizij-authoring/docs/README.md`
- `vizij-web/apps/vizij-authoring/docs/plans/ROADMAP.md`
- `vizij-web/apps/vizij-authoring/docs/plans/BACKLOG.md`
- `vizij-web/apps/vizij-authoring/docs/plans/TRACKER.md`

## Document Families

| Project | Status | Proposal | Plan | Reference |
| --- | --- | --- | --- | --- |
| Animator Feedback | `planned` | — | [`animator_feedback-plan.md`](animator_feedback/animator_feedback-plan.md) | — |
| Organize Rigging & Posing | `in_progress` | [`organize_rigging_posing-proposal.md`](organize_rigging_posing/organize_rigging_posing-proposal.md) | [`organize_rigging_posing-plan.md`](organize_rigging_posing/organize_rigging_posing-plan.md) | — |

## Current Verified State

- `vizij-authoring` is a real current workspace app in `vizij-web/apps/vizij-authoring`.
- The app currently depends on real current workspace packages including `@vizij/runtime-react`, `@vizij/node-graph-authoring`, `@vizij/node-graph-react`, `@vizij/render`, and `@vizij/utils`. (The motiongraph tooling has migrated off `@vizij/orchestrator-react`, which is retired.)
- The local authoring docs remain the authoritative detailed tracker for stage-by-stage execution.
- The local authoring docs were trimmed on 2026-03-30 so the active set now centers on the tracker trio (`README.md`, `ROADMAP.md`, `BACKLOG.md`, `TRACKER.md`), active local contracts, and a smaller set of living implementation references; several completed goal/implementation plans were archived locally instead of remaining in the active path.
- The local authoring tracker currently reports:
  - foundational pose/IR and policy work completed through the earlier `A0` through `E4` lanes
  - reference-face reliability work `R6.1` through `R6.4` complete
  - `R6.5` still open for final dual-face perf/audit signoff
  - import-reliability work `F5.*` still planned
  - workspace clarity `U8.*` remains active and should now be understood as creator-path trust and workflow clarity work, not merely cosmetic polish
  - sample-asset standardization `V9.*` is part of the blocking creator spine
  - face-editing correctness remains a primary creator concern because broken editing affordances will be read as broken product behavior
  - speech/viseme `P10.*` remains a supporting runtime line rather than a creator blocker
- The current creator-phase success gate is `import -> author/export -> runtime`.
- The official supported sample set for the maintained creator path is `Quori / Toasty`, even though the currently visible asset inventory still needs reconciliation to fully match that policy.
- The remaining creator work is now more about product trust and workflow reliability than about missing deep authoring architecture.

## Current Execution

- The active execution center is still the maintained creator path in `vizij-authoring`, not secondary tooling or later-horizon UX.
- Current authoring-owned execution is concentrated in:
  - workflow clarity, UI legibility, and regression lock-in for the canonical creator path
  - face-editing correctness where the main surface visibly implies support
  - workspace clarity and first-time usability under `U8.*`
  - organizing rigging and posing flows through the active project work
- Open items still being carried or prepared from the local tracker are:
  - `R6.5` final dual-face perf and audit signoff
  - `F5.*` import-reliability work
  - authoring-side alignment between exported bundles and the maintained runtime/deployment path
- Completed or substantially stabilized groundwork includes:
  - foundational pose/IR and policy work through the earlier `A0` through `E4` lanes
  - reference-face reliability work `R6.1` through `R6.4`
  - the local tracker trim that reduced the active authoring docs to the current maintained execution set

## Current Risks And Dependencies

- `R6.5` is not purely an authoring concern; final signoff depends on runtime and performance validation aligning with the authoring surface.
- `F5.*` import reliability is an authoring responsibility, but it depends on real asset coverage and stable import contracts.
- `V9.*` sample-asset standardization is a dependency rather than a wholly local authoring task; the authoring path cannot read as stable if the canonical sample set and standard-rig expectations remain ambiguous.
- Authoring exports only count as done when the maintained runtime and deployment surfaces can consume them without hidden caveats.
- Workflow trust depends on code-quality support for acceptance coverage and regression lock-in; visible creator-path regressions will be read as product instability, not internal polish debt.
- The current canonical sample set is `Quori / Toasty`, so any lingering mismatch between that supported set and the visible asset inventory remains a real dependency on the authoring program.

## Detailed Tracking Surfaces

Use these for execution detail rather than expanding this summary into a second roadmap or tracker:

- `vizij-web/apps/vizij-authoring/docs/README.md`
- `vizij-web/apps/vizij-authoring/docs/plans/ROADMAP.md`
- `vizij-web/apps/vizij-authoring/docs/plans/BACKLOG.md`
- `vizij-web/apps/vizij-authoring/docs/plans/TRACKER.md`

## Secondary Creator Programs

These are active secondary creator programs for the current phase, but they do not block the main creator signoff unless they intersect directly with the primary creator path:

- **Pose Rig Library** — [`pose_rig_library-proposal.md`](../../backlog/authoring/proposals/pose_rig_library-proposal.md)

## Cross-Repo Relevance

- Authoring status directly determines whether the public website/tutorial spine is trustworthy.
- Runtime and sample-asset work should be reflected here only at the summary level; detailed implementation remains in `vizij-web` and related runtime docs.

## Deferred Follow-Up

The later comprehensive roadmap review should revisit whether additional authoring projects belong in `active_projects/`, `backlog/`, or `archive/`, and whether new proposal/plan/reference triads should be created or promoted.
