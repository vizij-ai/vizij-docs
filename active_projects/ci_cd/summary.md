# CI/CD Workflow Programme Summary
<!-- tags: status=tracking; topics=ci-cd,automation,workflow,tooling -->

## Document Families

| Pillar | Status | Proposal | Plan & Tracking | Reference |
| --- | --- | --- | --- | --- |
| **Commit Hooks & Guardrails** | 📝 Proposal | [`commit_hooks-proposal.md`](commit_hooks-proposal.md) | — | — |
| **Automation Scripting** | 📝 Proposal | [`automation_scripting-proposal.md`](automation_scripting-proposal.md) | — | — |
| **Publishing Pipeline** | 📝 Proposal | [`publishing_pipeline-proposal.md`](publishing_pipeline-proposal.md) | — | — |

> See [`../project_documenting_guide.md`](../project_documenting_guide.md) for the documentation conventions we follow.

## Pillar Status Notes

- **Commit Hooks & Guardrails** – Evaluate and unify Git hook behaviour across repos while improving developer experience (skip flags, partial runs, onboarding).
- **Automation Scripting** – Review shared Bash/Node scripts in `vizij-rs` and `vizij-web`, reduce duplication, and ensure cross-repo consistency.
- **Publishing Pipeline** – Extend change-driven release automation to cover reusable pose rig artifacts, npm/crate dry-runs, and improved tagging strategy.

## Architecture Overview

- **Hooks**: Both `vizij-web` and `vizij-rs` set `core.hooksPath` and rely on local scripts; we plan to converge on shared conventions and onboarding.
- **Task Runners**: `vizij-rs/scripts/hook-tasks.sh` centralises lint/build/test commands; `vizij-web/scripts/run-affected.sh` scopes pnpm jobs to changed workspaces. Harmonising these patterns will ease maintenance.
- **Publishing**: Tag-triggered Changesets publishing in `vizij-web` and dry-run release scripts in `vizij-rs` form the baseline; new work will introduce reusable pose rig exports and improve multi-registry releases.
