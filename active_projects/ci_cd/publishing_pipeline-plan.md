# Publishing Pipeline – Plan & Tracking
<!-- tags: status=tracking; topics=ci-cd,publishing,release-engineering -->
> **Related documents:** [Proposal](publishing_pipeline-proposal.md) · [Reference](publishing_pipeline-reference.md) · [Project summary](summary.md)

## Objective & Scope Recap
Create a dependable release pipeline that turns a protected `release/**` tag into validated npm/crates publishes with provenance, verification, and rollback guidance.

## Workstreams & Deliverables
| Workstream | Owner | Status | Notes |
| --- | --- | --- | --- |
| **W1 – Preflight workflow (`_release-dry-run.yml`)** | Release WG | 🚧 In progress | Integrate `vizij release graph` + workspace-range validation + `cargo publish --dry-run`. |
| **W2 – npm publish (`_publish-npm.yml`)** | Web maintainers | 📝 Planned | Trusted publishing, version prep via `vizij release prepare`, provenance attestation. |
| **W3 – crates publish (`_publish-crates.yml`)** | Rust maintainers | 📝 Planned | Sequenced publish with waits + registry verification. |
| **W4 – Orchestrator (`release.yml`)** | Platform eng | 📝 Planned | Tag trigger, environment approvals, attestation job, reporting. |
| **W5 – Docs & rollback playbook** | DX writer | 📝 Planned | Reference doc, quick-start, rollback drills, link to `../tag_trigger_publishing.md`. |

## Timeline & Milestones
| Stage | Milestone |
| --- | --- |
| Stage 1 | Preflight workflow catches workspace/leakage issues; cargo dry-run running in CI. |
| Stage 2 | npm publish workflow completes end-to-end dry-run in sandbox env. |
| Stage 3 | Crates publish workflow validated with staging crates; orchestrator wires preflight→publish sequences. |
| Stage 4 | Release notes + rollback doc published; environments enforced on default branches. |

## Immediate Next Steps
1. Wire `_release-dry-run.yml` outputs (JSON plan) into `_publish-crates.yml`’s `sequence` input.
2. Finalize `vizij release prepare --tag` semantics and update `_publish-npm.yml` to call it before `changeset publish`.
3. Draft rollback procedures referencing npm deprecate/unpublish windows and crates.io yank commands.

## Risks & Mitigations
- **Partial failure mid-release:** capture publish plan + status in artifacts; document resuming instructions and require operator acknowledgment before reruns.
- **Tag misuse:** protect `release/**` pattern and require approvals; add guard to ensure tag matches repository (web vs rs).
- **Trusted publishing gaps:** if OIDC configuration lags, fall back to scoped tokens with short expiry and track migration tasks.

## Decision & Change Log
- 2025-11-04 – Adopted `release/<repo>/<YYYYMMDD-HHMM>` tag convention to disambiguate repositories (decision with release managers).

## Validation / QA Checklist
- [ ] `_release-dry-run.yml` produces deterministic JSON plan and fails on `workspace:` leakage.
- [ ] `_publish-npm.yml` publishes from tag in sandbox, creates provenance, and respects environment approvals.
- [ ] `_publish-crates.yml` sequential publish tested against mock/staging crates (or `--dry-run` verification script).
- [ ] `release.yml` attaches plan + verification artifacts, posts release notes, and documents approvals.
- [ ] Rollback playbook tested (npm deprecate, crates yank, hotfix tag) and linked in reference doc.

## References
- Workflows: [`workflows/_release-dry-run.yml`](workflows/_release-dry-run.yml), [`workflows/_publish-npm.yml`](workflows/_publish-npm.yml), [`workflows/_publish-crates.yml`](workflows/_publish-crates.yml), [`workflows/release.yml`](workflows/release.yml), [`workflows/codeql.yml`](workflows/codeql.yml)
- Supporting CLI: [`vizij-dev-tools`](vizij-dev-tools)
- Legacy guide: [`../tag_trigger_publishing.md`](../tag_trigger_publishing.md)
