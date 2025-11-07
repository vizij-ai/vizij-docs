# Vizij CI/CD Programme Summary
<!-- tags: status=tracking; topics=ci-cd,automation,workflow,tooling -->

## Document Families

| Pillar | Status | Proposal | Plan & Tracking | Reference |
| --- | --- | --- | --- | --- |
| **Commit Hooks & Guardrails** | 🚧 In progress (pilot) | [`commit_hooks-proposal.md`](commit_hooks-proposal.md) | [`commit_hooks-plan.md`](commit_hooks-plan.md) | [`commit_hooks-reference.md`](commit_hooks-reference.md) |
| **Automation Scripting** | 🚧 In progress (CLI hardening) | [`automation_scripting-proposal.md`](automation_scripting-proposal.md) | [`automation_scripting-plan.md`](automation_scripting-plan.md) | [`automation_scripting-reference.md`](automation_scripting-reference.md) |
| **Publishing Pipeline** | 📝 Planning → buildout | [`publishing_pipeline-proposal.md`](publishing_pipeline-proposal.md) | [`publishing_pipeline-plan.md`](publishing_pipeline-plan.md) | [`publishing_pipeline-reference.md`](publishing_pipeline-reference.md) |

> Conventions follow [`project_documenting_guide.md`](../project_documenting_guide.md); referenced implementations live under [`workflows/`](workflows) and [`vizij-dev-tools`](vizij-dev-tools).

## Pillar Status Notes
- **Commit Hooks & Guardrails** – Unified `vizij hooks` CLI replaces divergent Bash scripts, adds a doctor command, and keeps hooks diff-scoped. Pilot work is underway with CLI wiring and configuration schema authoring.
- **Automation Scripting** – The `vizij` CLI now fronts diff-aware validation (`run-affected`) and release helpers consumed by `workflows/ci-web.yml`, `_release-dry-run.yml`, and `_publish-*`. Remaining work covers JSON output, config validation, and expanded release commands.
- **Publishing Pipeline** – Shared workflows orchestrate `_release-dry-run`, `_publish-npm`, `_publish-crates`, and release attestations. Focus is on wiring CLI publish plans, enforcing environment approvals, and documenting rollback drills.

## Architecture Overview
- **Shared CLI (`@vizij/dev-tools`)** delivers `vizij run-affected`, `vizij hooks`, and `vizij release *` commands. Workflows call the CLI directly to avoid diverging logic.
- **Reusable GitHub Actions** in `workflows/` standardise CI (ci-web/ci-rs), CodeQL scanning, dry-run validation, and release/publish orchestration with environment gates and provenance.
- **Policy Surfaces** – Tag protection (`release/<repo>/<timestamp>`), `ci.config.json`, and hook skip/extra flags document the supported levers for developers and operators.

## Active Focus Areas
1. Align hook diff-scoping and CLI logging with the automation module before enabling CI guard enforcement.
2. Implement JSON output + plan caching for `vizij run-affected` and `vizij release graph`, then plumb it through `_release-dry-run.yml` and `_publish-crates.yml`.
3. Finalise trusted publishing + provenance in `_publish-npm.yml` and document rollback drills in the publishing reference.

## Upcoming Milestones
1. **Stage 1 (targeting Nov 10–14)** – Hook harness + doctor merged; automation diff resolver shared across modules.
2. **Stage 2 (targeting Nov 17–21)** – `run-affected` replaces legacy scripts in CI; `_release-dry-run.yml` emits deterministic publish plans.
3. **Stage 3 (targeting Nov 24–28)** – Publishing workflows gated by environments, rollback playbook validated, and references updated with operator notes.

## Reference Assets
- Workflows: [`workflows/ci-web.yml`](workflows/ci-web.yml), [`workflows/ci-rs.yml`](workflows/ci-rs.yml), [`workflows/codeql.yml`](workflows/codeql.yml), [`workflows/_release-dry-run.yml`](workflows/_release-dry-run.yml), [`workflows/_publish-npm.yml`](workflows/_publish-npm.yml), [`workflows/_publish-crates.yml`](workflows/_publish-crates.yml), [`workflows/release.yml`](workflows/release.yml)
- Tooling implementation: [`vizij-dev-tools/README.md`](vizij-dev-tools/README.md)
- Legacy publishing guide (context only): [`../tag_trigger_publishing.md`](../tag_trigger_publishing.md)
