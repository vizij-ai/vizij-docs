# Publishing Pipeline Proposal
<!-- tags: status=proposal; topics=ci-cd,publishing,release-engineering -->
> **Related documents:** [Plan](publishing_pipeline-plan.md) · [Reference](publishing_pipeline-reference.md) · [Project summary](summary.md)

## 1. Context & Problem Statement
- `vizij-web` publishes npm packages using Changesets, a local `scripts/release-tag.sh`, and tag-triggered workflows (see `../tag_trigger_publishing.md`). Ordering and `workspace:` leakage checks are manual, and provenance/trusted publishing is only partially configured.
- `vizij-rs` provides `scripts/dry-run-release.sh` plus ad-hoc cargo commands. There is no automated dependency ordering or sequential publish with verification.
- GitHub workflows in `workflows/` now define `_release-dry-run`, `_publish-npm`, `_publish-crates`, and `release`, but these require a clear reference doc plus a reliable CLI (`vizij release graph`, `vizij release validate-workspace-ranges`, `vizij release prepare`).
- Tag protection, environment approvals, rollback procedures, and operator runbooks remain fragmented across docs.

## 2. Goals & Non-goals
**Goals**
1. Deliver a **repeatable release orchestration** triggered by `release/**` tags with human approval gates and provenance.
2. Provide **preflight validation** (scratch versioning, workspace-range checks, `cargo publish --dry-run`) before any publish job runs.
3. Generate **deterministic publish order** for npm packages and Rust crates using `vizij release graph` outputs consumed by workflows.
4. Ensure **post-publish verification & reporting** (registry checks, release notes, artifact attestations).
5. Document **rollback + hotfix paths** so operators can respond quickly to failed releases.

**Non-goals**
- Changing package managers/registries or semver policy; we integrate with npm + crates.io as-is.
- Force-synchronizing `vizij-web` and `vizij-rs` releases; orchestration supports independent or coordinated tags.

## 3. Architectural Design
- **Tag-triggered workflow (`workflows/release.yml`)** orchestrates preflight, npm publish, crates publish, and attestation jobs.
- **Reusable components:** `_release-dry-run.yml`, `_publish-npm.yml`, `_publish-crates.yml` run via `workflow_call` so repos can import shared logic.
- **CLI tooling:** `vizij release graph` (JSON), `vizij release validate-workspace-ranges`, and forthcoming `vizij release prepare` supply publish plans and guardrails.
- **Environments & approvals:** `npm-publish` and `crates-publish` environments enforce reviewer approval before secrets/permissions are granted.
- **Observability:** Each job emits grouped logs and summary artifacts (publish plan JSON, verification output) that attach to workflow runs.

## 4. Risks & Trade-offs
- **Registry propagation delays:** sequential publishing slows throughput but avoids customers installing broken dependency chains.
- **Secret management:** relying on OIDC/trusted publishing reduces token management overhead but requires additional setup; fallback tokens documented as contingency.
- **Complexity:** multi-stage workflows increase cognitive load; mitigated by documentation and reuse across repos.

## 5. Approval & Decision Log
- 2025-11-07 – Proposal drafted; awaiting release manager approval to finalize workflow ownership and environment reviewers.

## 6. High-level Execution Plan
1. **Stage 1:** Harden `_release-dry-run.yml` (CLI integration, workspace-range check, cargo dry-run) and finalize CLI support.
2. **Stage 2:** Finish `_publish-npm.yml` (trusted publishing, provenance) and `_publish-crates.yml` (sequenced publish + verification) wiring.
3. **Stage 3:** Complete `release.yml` orchestration, tag protections, release notes integration, and documentation updates.
4. **Stage 4:** Test rollback drills, publish runbook, and enable environment enforcement.
