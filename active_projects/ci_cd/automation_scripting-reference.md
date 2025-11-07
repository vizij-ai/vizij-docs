# Automation Scripting Reference
<!-- tags: status=reference; topics=ci-cd,tooling,automation -->
> **Related documents:** [Proposal](automation_scripting-proposal.md) · [Plan](automation_scripting-plan.md) · [Project summary](summary.md)

## Summary
`@vizij/dev-tools` packages the `vizij` CLI used across vizij repositories to run diff-aware validation, build release graphs, and enforce safety checks ahead of publishing. This reference captures command behavior, configuration, and integration points with GitHub Actions workflows.

## System Overview
- **CLI Binary:** `bin/vizij.mjs` registers all commands using Commander; source lives in `vizij-dev-tools/src`.
- **Command Families:**
  - `vizij run-affected <task>` – runs logical tasks (`lint`, `typecheck`, `test`, `build`, `validate`) only on workspaces/crates touched by a change.
  - `vizij release graph [--format json]` – prints publish order derived from workspace manifests and (basic) crate metadata.
  - `vizij release validate-workspace-ranges` – ensures `workspace:` ranges resolve before npm publishing.
  - `vizij release prepare --tag <release/**>` – (planned) hydrate versions/builds before `_publish-npm.yml` runs.
- **Supporting Assets:** JSON schema for `ci.config.json`, Vitest coverage, and README documentation at `vizij-dev-tools/README.md`.

## Key Decisions & Trade-offs
- **Lightweight graphing:** chosen over adopting Nx/Turborepo to keep Rust + pnpm coverage without heavyweight config.
- **Node-based tooling:** improves portability vs. Bash scripts but requires Node ≥20 on CI and developer machines.
- **Config-first strategy:** ensures repo-specific behavior lives in data, at the cost of slightly more upfront modeling work.

## Usage Guide
1. **Install dependencies** – `pnpm install` (or `npm|yarn` if using the published package) to ensure `vizij` is available.
2. **Run diff-scoped tasks** – e.g., `pnpm exec vizij run-affected validate --base origin/main`. Use `--all` to ignore diff scoping.
3. **Inspect targets** – pass `--json` (planned) or `--dry-run` to list calculated targets without executing commands.
4. **Generate release plan** – `pnpm exec vizij release graph --format json > plan.json` and feed into publishing workflows.
5. **Verify workspace ranges** – `pnpm exec vizij release validate-workspace-ranges` in CI to fail early when `workspace:` strings leak.
6. **Configuration** – add `ci.config.json`:
   ```json
   {
     "workspaces": {"include": ["packages/*"], "exclude": ["packages/*-examples"]},
     "crates": {"include": ["crates/*"]},
     "tasks": {"lint": "pnpm lint", "typecheck": "pnpm typecheck", "test": "pnpm test"}
   }
   ```
   Optional overrides exist per repo; omit keys you do not need.

## Maintenance & Extension
- Keep CLI dependencies patched (`commander`, `execa`, `fast-glob`, `zod`).
- Add tests whenever new commands or flags are introduced.
- Update workflows (`workflows/ci-web.yml`, `workflows/ci-rs.yml`, `_release-dry-run.yml`, `_publish-*.yml`) to consume new capabilities instead of duplicating logic.

## Testing & Validation
- Run `pnpm test` inside `vizij-dev-tools` for unit coverage.
- Add integration snapshots by invoking `vizij run-affected` against fixture repositories in `tests/`.
- Smoke-test release commands locally before promoting to shared workflows; capture expected JSON in `_release-dry-run.yml` outputs.

## Further Reading
- Implementation repo: [`vizij-dev-tools`](vizij-dev-tools)
- CI consumers: [`workflows/ci-web.yml`](workflows/ci-web.yml), [`workflows/ci-rs.yml`](workflows/ci-rs.yml)
- Release consumers: [`workflows/_release-dry-run.yml`](workflows/_release-dry-run.yml), [`workflows/_publish-npm.yml`](workflows/_publish-npm.yml), [`workflows/_publish-crates.yml`](workflows/_publish-crates.yml), [`workflows/release.yml`](workflows/release.yml)
