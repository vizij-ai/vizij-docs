# Publishing Pipeline Reference
<!-- tags: status=reference; topics=ci-cd,publishing,release-engineering -->
> **Related documents:** [Proposal](publishing_pipeline-proposal.md) · [Plan](publishing_pipeline-plan.md) · [Project summary](summary.md)

## Summary
The vizij release pipeline converts protected `release/<repo>/<timestamp>` tags into audited npm and crates.io publishes. It relies on reusable GitHub workflows (`workflows/`) plus the `vizij` CLI to compute publish plans, validate manifests, and produce provenance.

## System Overview
1. **Tag Trigger (`workflows/release.yml`)** – listens for `release/**` tags, fans out to preflight jobs (`plan-web`, `plan-rs`), conditional publish jobs, and an attestation step.
2. **Preflight (`workflows/_release-dry-run.yml`)** – runs `vizij release graph --format json` to compute order, checks npm manifests for `workspace:` leakage, and executes `cargo publish --dry-run` when targeting Rust crates.
3. **npm Publish (`workflows/_publish-npm.yml`)** – installs Node 22 + pnpm, runs `vizij release prepare --tag …`, and calls `pnpm changeset publish` with npm Trusted Publishing + provenance.
4. **Crates Publish (`workflows/_publish-crates.yml`)** – iterates through the JSON `sequence`, dry-runs each crate, publishes sequentially with verification pauses, and records output.
5. **Dev Tools (`vizij-dev-tools`)** – implement the CLI commands used throughout the workflows (`release graph`, `release validate-workspace-ranges`, future `release prepare`).
6. **Environments & Approvals** – `npm-publish` and `crates-publish` enforce reviewer approvals, logging approvers for compliance.

## Key Decisions & Trade-offs
- **Sequential publish** prevents dependency race conditions at the cost of slower releases.
- **OIDC/Trusted Publishing** removes long-lived npm tokens but requires correct repository metadata; fallback tokens remain documented for emergencies.
- **Single tag per release** keeps provenance simple; multi-tag releases would add flexibility but complicate rollbacks.

## Usage Guide (Operators)
1. Ensure all expected Changesets/PRs are merged and CI is green.
2. From the target repo (`vizij-web` or `vizij-rs`), run the release helper (see `../tag_trigger_publishing.md` for npm) to version, commit, and push a tag like `release/web/20251107-1530`.
3. Monitor the `release` workflow run:
   - `plan-web` / `plan-rs` generate publish plan artifacts (download for audit).
   - Approve `npm-publish` / `crates-publish` environments when prompted.
   - Watch `_publish-npm` and `_publish-crates` logs for sequential status.
   - Confirm attestation completes.
4. Verify packages/crates on npm & crates.io; update Release notes if required.
5. Announce completion and record any deviations in the change log.

## Maintenance & Extension
- Update workflows whenever CLI flags change; keep versions pinned via `package.json`/lockfiles.
- Expand `vizij release graph` to fully parse `cargo metadata` for accurate crate ordering as the workspace grows.
- Document repo-specific nuances (e.g., pose rig bundles) in appendices linked from this reference.

## Testing & Validation
- Run `_release-dry-run.yml` on every PR touching release tooling (via `workflow_call`).
- For npm: use a dry-run registry or `changeset publish --no-git-tag` in a sandbox to validate new steps.
- For crates: rely on `cargo publish --dry-run` and consider publishing to a test crate name when practicing rollbacks.
- Exercise rollback quarterly: simulate npm deprecate + crates yank flows and record steps/outcomes.

## Rollback Procedures
- **npm:** prefer `npm deprecate @vizij/pkg@x.y.z "Reason"`; only `npm unpublish` within the 72-hour window when necessary; follow with a fixed release tag.
- **crates.io:** run `cargo yank --vers x.y.z crate-name`; publish a patched version and tag a new release.
- **Hotfix:** cherry-pick fixes onto a stable branch, push a new `release/<repo>/<timestamp>` tag, and rerun the orchestrator. Document the linkage between the failed and hotfix tags in the summary table.

## Further Reading
- Shared workflows: [`workflows/_release-dry-run.yml`](workflows/_release-dry-run.yml), [`workflows/_publish-npm.yml`](workflows/_publish-npm.yml), [`workflows/_publish-crates.yml`](workflows/_publish-crates.yml), [`workflows/release.yml`](workflows/release.yml)
- CLI implementation: [`vizij-dev-tools`](vizij-dev-tools)
- npm tag-trigger doc: [`../tag_trigger_publishing.md`](../tag_trigger_publishing.md)
