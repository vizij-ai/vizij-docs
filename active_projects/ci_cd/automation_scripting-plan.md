# Automation Scripting – Plan & Tracking
<!-- tags: status=tracking; topics=ci-cd,tooling,automation -->
> **Related documents:** [Proposal](automation_scripting-proposal.md) · [Reference](automation_scripting-reference.md) · [Project summary](summary.md)

## Objective & Scope Recap
Consolidate repo-specific Bash helpers into the `vizij` CLI so CI and developers share the same diff-aware commands for validation, release prep, and safety checks.

## Workstreams & Deliverables
| Workstream | Owner | Status | Notes |
| --- | --- | --- | --- |
| **W1 – Discovery & diff resolver** | Platform eng | 🚧 In progress | Harden globbing + base ref detection shared with hooks module. |
| **W2 – Task adapters (`run-affected`)** | JS/Rust maintainers | 📝 Planned | Map `lint`, `typecheck`, `test`, `build`, `validate` to per-ecosystem commands with grouped logs. |
| **W3 – Release utilities** | Release WG | 📝 Planned | `vizij release graph`, `validate-workspace-ranges`, future `release prepare`. |
| **W4 – Config schema & validation** | DX writer | 📝 Planned | Zod schema, examples, docs; ensure CI fails on invalid config. |
| **W5 – Test & docs** | QA + Platform | 📝 Planned | Vitest coverage, CLI help text, reference doc updates. |

## Timeline & Milestones
| Stage | Milestone |
| --- | --- |
| Stage 1 | Discovery + diff resolver merged with tests. |
| Stage 2 | `run-affected` parity achieved; workflows consuming CLI (ci-web, ci-rs) switched over. |
| Stage 3 | Release utilities + config schema published; `_release-dry-run.yml` using the CLI end-to-end. |
| Stage 4 | Documentation complete, legacy scripts archived, CLI considered GA. |

## Immediate Next Steps
1. Share the updated diff resolver with the hooks team to avoid duplicate logic.
2. Implement JSON summary output for `vizij run-affected` and pipe it into `workflows/ci-web.yml` for debugging.
3. Prototype `vizij release graph --format json` and feed it into `_publish-crates.yml`.

## Risks & Mitigations
- **Edge cases in workspace layouts:** support custom include/exclude globs and document how to extend them.
- **Toolchain mismatches:** enforce Node ≥20 and documented Rust toolchain versions; doctor command lists missing prerequisites.
- **CLI regressions affecting CI:** pin CLI versions in repos until GA; add integration tests that run representative workflows locally.

## Decision & Change Log
- 2025-11-05 – Agreed to house CLI inside `@vizij/dev-tools` and publish via npm (decision with CI/CD + DX leads).

## Validation / QA Checklist
- [ ] `vizij run-affected validate` matches legacy script results on sample PRs for both repos.
- [ ] JSON summary consumed by workflows without parsing errors; failures surface clear context.
- [ ] `vizij release graph` matches manual dependency order for npm packages and Rust crates.
- [ ] `vizij release validate-workspace-ranges` fails when `workspace:` ranges leak into publishable manifests.

## References
- Implementation: [`vizij-dev-tools`](vizij-dev-tools)
- Workflows consuming CLI output: [`workflows/ci-web.yml`](workflows/ci-web.yml), [`workflows/_release-dry-run.yml`](workflows/_release-dry-run.yml), [`workflows/_publish-npm.yml`](workflows/_publish-npm.yml), [`workflows/_publish-crates.yml`](workflows/_publish-crates.yml), [`workflows/release.yml`](workflows/release.yml)
