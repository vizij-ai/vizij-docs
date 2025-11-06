# Publishing Pipeline Proposal
<!-- tags: status=proposal; topics=ci-cd,publishing,automation -->

> **Related documents:** Plan (pending) · Reference (pending) · [Project summary](summary.md)

## Context & Current State

### `vizij-web`
- Uses Changesets with `pnpm changeset`, `version:packages`, and tag-triggered GitHub Action (`release-*`) to publish npm packages selectively.
- Local helper `scripts/release-tag.sh` validates clean working tree, applies version bumps, commits, and pushes an annotated tag.
- Workflow ensures only `@vizij/*` packages built via `build:packages` are published; CI verifies via `verify:packages`.
- Packages depend on one another via `workspace:^` ranges. Changesets rewrites these during `changeset version`, but any missed rewrite leaves `workspace:` strings in published manifests and causes npm install failures. Publishing order (dependency before consumer) is enforced manually by the release sequence.

### `vizij-rs`
- Provides `scripts/dry-run-release.sh` to build/test Rust workspace, run pnpm builds, and `npm pack --dry-run` for wasm/npm packages; parts of the script are commented out, indicating manual steps for cargo publishing.
- Changesets is configured but release automation for crates/nodes is less codified compared to vizij-web.
- Tag-triggered pipeline for npm packages is documented in `../tag_trigger_publishing.md`, but cross-repo coordination is not covered.

Gaps:
- No unified release process that handles npm packages across repos plus crates.
- Dry-run script lacks automation for cargo publishing order, version coordination, and verifying tags.
- Release tagging conventions differ between repositories, making auditing harder.
- Publishing order for interdependent npm packages (A→B) is fragile; if A is published before B is available on npm, installs fail. CI must coordinate workspace version rewrites, lockfile updates, and publish sequencing.

## Goals

1. **Cross-Repo Release Orchestration** – Standardise release tagging, dry-run validation, and publish commands for npm packages (vizij-web, vizij-rs) and Rust crates.
2. **Automated Verification** – Ensure CI performs cargo publish dry-runs (or `cargo package`) and npm pack checks prior to tagging.
3. **Metadata & Changelog Generation** – Consolidate release notes across repos, optionally bundling them into GitHub Releases.
4. **Dependency Safety** – Guarantee `workspace:^` ranges are resolved to concrete semver versions before publish, and that dependent packages are bumped and released in the correct order.
5. **Documentation & Rollback** – Define rollback procedures, release checklists, and troubleshooting guides.

## Proposed Approach

1. **Unified Release CLI**
   - Extend the shared automation toolkit (see Automation Scripting pillar) with commands like `vizij release prepare`, `vizij release tag`, `vizij release publish`.
   - Support subcommands for npm (`changeset publish`) and cargo (`cargo publish`).
   - Include dependency graph inspection to compute publish order and detect unresolved workspace dependencies prior to tagging.

2. **Dry-Run & Verification Enhancements**
   - Update `dry-run-release.sh` to:
     - Run `cargo package` for each crate in dependency order.
     - Use pnpm filters to build/test wasm/npm packages.
     - Validate pose rig graph exports via new CLI.
   - Add CI job that runs dry-run on pull requests touching release scripts.

3. **Dependency Graph & Workspace Resolution**
   - Build tooling (`vizij release graph`) that reads workspace manifests and Changesets state to produce a topologically sorted publish plan (dependencies -> consumers).
   - Before publishing, run a validation step that executes `pnpm changeset version` in a scratch workspace, checks for `workspace:` strings in publishable package `package.json` files, and fails if any remain.
   - Update CI to publish packages in dependency order: publish B, wait for success, then publish A. Consider staging tags or sequential workflows to avoid timing issues.
   - Update release scripts to regenerate lockfiles after versioning and before publishing to ensure consumers pick up new ranges.

4. **Tagging & Releases**
   - Adopt consistent tag format (e.g., `release/<repo>/<YYYYMMDDHHMM>`).
   - Automatically create GitHub Releases with aggregated changelog from Changesets + manual entries.

5. **Documentation**
   - Update `tag_trigger_publishing.md` or split into reference doc covering multi-repo releases.
   - Provide step-by-step checklist for maintainers (pre-flight, tag, monitor, rollback).

## Risks & Mitigations

- **Complexity** – Combining npm/cargo/pose rig workflows can be complex; keep CLI modular and support per-repo execution.
- **Credential Management** – Publishing requires npm and crates.io tokens; ensure GitHub Actions secrets are scoped appropriately.
- **Dependency Ordering Failures** – Publishing consumer packages before dependencies land can break downstream installs. Mitigation: enforce dependency-aware publish order, add verification after each publish, and implement retry/rollback strategies if publish fails mid-chain.
- **Workspace Range Leakage** – If `workspace:^` remains in manifests, npm publish fails. Mitigation: add CI checks that run versioning in a clean workspace and block tag creation when ranges persist.

## Next Steps

1. Audit current release pipelines (GitHub Actions, scripts) in both repos.
2. Document npm dependency graphs for publishable packages, noting required publish order.
3. Define target tag naming and GitHub Release structure.
4. Prototype unified release CLI with dry-run support, including dependency sorting and workspace validation.
