# Vizij Authoring Program Summary
<!-- tags: type=summary; status=in_progress; topics=authoring,workflow,runtime-correctness,ui-ux -->

Last updated: 2026-03-10

## Goals

Deliver the blocking creator/build spine for the maintained Vizij path: import a supported face, author and rig it, export a bundled GLB, and run it successfully in the maintained runtime flow.

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
- The app currently depends on real current workspace packages including `@vizij/runtime-react`, `@vizij/node-graph-authoring`, `@vizij/node-graph-react`, `@vizij/orchestrator-react`, `@vizij/render`, and `@vizij/utils`.
- The local authoring docs remain the authoritative detailed tracker for stage-by-stage execution.
- The local authoring tracker currently reports:
  - foundational pose/IR and policy work completed through the earlier `A0` through `E4` lanes
  - reference-face reliability work `R6.1` through `R6.4` complete
  - `R6.5` still open for final dual-face perf/audit signoff
  - import-reliability work `F5.*` still planned
  - workspace clarity `U8.*` remains active but non-blocking
  - sample-asset standardization `V9.*` is part of the blocking creator spine
  - speech/viseme `P10.*` remains a supporting runtime line rather than a creator blocker
- The current creator-phase success gate is `import -> author/export -> runtime`.
- The intended canonical sample set is `Quori / Hugo / Toasty`, even though the currently visible asset inventory still needs reconciliation to fully match that intent.

## Near-Term Focus

- Keep the blocking creator spine explicit:
  - `F5.*` import reliability contracts
  - `V9.*` canonical sample assets and standard-rig validation
  - `R6.5` dual-face perf and auditability signoff
- Keep `U8.*` workspace clarity active, but do not let it block creator-phase completion.
- Keep authoring exports and runtime bundle behavior aligned with the public tutorial spine and deployment branch.

## Secondary Creator Programs

These are active secondary creator programs for the current phase, but they do not block the main creator signoff:

- **Face Editing** — [`face_editing-proposal.md`](../../backlog/backlog_proposals/face_editing-proposal.md)
- **Pose Rig Library** — [`pose_rig_library-proposal.md`](../../backlog/backlog_proposals/pose_rig_library-proposal.md)

## Cross-Repo Relevance

- Authoring status directly determines whether the public website/tutorial spine is trustworthy.
- Runtime and sample-asset work should be reflected here only at the summary level; detailed implementation remains in `vizij-web` and related runtime docs.

## Deferred Follow-Up

The later comprehensive roadmap review should revisit whether additional authoring projects belong in `active_projects/`, `backlog/`, or `archive/`, and whether new proposal/plan/reference triads should be created or promoted.
