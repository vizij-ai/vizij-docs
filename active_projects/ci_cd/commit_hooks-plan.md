# Commit Hooks & Guardrails – Plan & Tracking
<!-- tags: status=tracking; topics=ci-cd,tooling,developer-experience -->
> **Related documents:** [Proposal](commit_hooks-proposal.md) · [Reference](commit_hooks-reference.md) · [Project summary](summary.md)

## Objective & Scope Recap
Deliver a shared hook harness (`vizij hooks`) across vizij repositories so developers install, verify, and run consistent pre-commit/pre-push checks that mirror CI yet stay fast enough for daily use.

## Workstreams & Deliverables
| Workstream | Owner | Status | Notes |
| --- | --- | --- | --- |
| **W1 – Harness foundation** (CLI wiring, install, doctor) | CI/CD lead | 🚧 In progress | CLI skeleton in `vizij-dev-tools/src/hooks` plus smoke tests. |
| **W2 – Task adapters & diff scoping** | JS & Rust maintainers | 📝 Planned | Reuse `vizij run-affected` graph for pnpm/Rust targets; add `--base` overrides. |
| **W3 – Config schema (`ci.config.json`)** | Automation WG | 📝 Planned | Document includes/excludes, task mapping, feature flags. |
| **W4 – CI guard workflow** | Platform eng | 📝 Planned | GitHub Action invoking `pnpm exec vizij hooks doctor` + policy enforcement timeline. |
| **W5 – Docs & rollout** | DX writer | 📝 Planned | Reference doc, onboarding checklists, CONTRIBUTING snippets, troubleshooting appendix. |

## Timeline & Milestones
| Stage | Milestone |
| --- | --- |
| Stage 1 | Harness foundation merged, doctor command usable locally. |
| Stage 2 | Diff-scoped tasks + config schema implemented; pilot branch running in `vizij-web`. |
| Stage 3 | Rollout to `vizij-rs`, CI guard running in warning mode. |
| Stage 4 | CI guard enforced, legacy scripts archived, docs finalized. |

## Immediate Next Steps
1. Finish CLI wiring for `vizij hooks pre-commit|pre-push` and align logging/exit codes with `workflows/ci-web.yml` expectations.
2. Port git diff resolver from `vizij run-affected` into the hooks module and add crate/workspace filters.
3. Draft the initial `ci.config.json` schema + examples and circulate for review with repo owners.

## Risks & Mitigations
- **Performance regressions:** capture benchmark data before rollout, keep `HOOK_MINIMAL` fallback, and document when to use `--all` to bust caches.
- **Partial adoption:** add CI guard plus onboarding docs to keep adoption high; legacy scripts remain as thin shims exporting to the new CLI.
- **Platform parity issues:** test hooks via `pnpm exec vizij hooks doctor` on macOS, Linux, and WSL; capture known gaps in the reference.

## Decision & Change Log
- 2025-11-06 – Confirmed that hook harness will live inside `@vizij/dev-tools` and share its release cadence with the automation tooling (decision with platform + DX leads).

## Validation / QA Checklist
- [ ] `pnpm exec vizij hooks doctor` passes on clean clones of `vizij-web` and `vizij-rs`.
- [ ] Pre-commit runtime ≤3s on a single file change; pre-push ≤30s on representative PRs.
- [ ] CI guard workflow (`.github/workflows/ci-web.yml` + `.github/workflows/ci-rs.yml`) verifies parity by rerunning the same tasks for changed targets.
- [ ] Reference doc and troubleshooting steps published.

## References
- CLI implementation: [`vizij-dev-tools`](vizij-dev-tools)
- Workflows consuming hook parity: [`workflows/ci-web.yml`](workflows/ci-web.yml), [`workflows/ci-rs.yml`](workflows/ci-rs.yml)
