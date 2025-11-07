# Commit Hooks & Guardrails Reference
<!-- tags: status=reference; topics=ci-cd,tooling,developer-experience -->
> **Related documents:** [Proposal](commit_hooks-proposal.md) · [Plan](commit_hooks-plan.md) · [Project summary](summary.md)

## Summary
The `vizij hooks` harness (shipped via `@vizij/dev-tools`) standardises Git hook installation, verification, and execution for vizij repositories. It keeps pre-commit checks lightweight, aligns pre-push checks with CI, and provides a doctor command plus documentation so developers can self-serve fixes.

## System Overview
1. **CLI Module** – `vizij-dev-tools/src/hooks` exposes `vizij hooks install|doctor|pre-commit|pre-push` with structured logging and diff-aware target selection.
2. **Config Surface** – Optional `ci.config.json` files define workspace/crate globs, task mappings, and hook-specific flags. Defaults cover both `vizij-web` and `vizij-rs`.
3. **Diff Resolver** – Shared git helper matches the behavior of `vizij run-affected` to determine which JS/TS workspaces or Rust crates should run during hook execution.
4. **CI Guard** – Lightweight workflow step (see `workflows/ci-web.yml` and `workflows/ci-rs.yml`) runs `pnpm exec vizij hooks doctor` to ensure hooks stay installed and healthy on default branches.

## Key Decisions & Trade-offs
- **Single CLI vs. per-repo scripts:** centralising in `@vizij/dev-tools` removes duplication but requires coordinated releases; mitigated by semantic versioning and changelog entries.
- **Diff-scoped defaults:** keeps hooks fast but may miss global issues; a documented `--all` flag lets developers force full coverage when necessary.
- **Skip flags (`HOOK_SKIP`, `HOOK_MINIMAL`, `HOOK_EXTRA`):** allow escape hatches without editing scripts; CI duplication protects policy.

## Usage Guide
1. **Install hooks** after cloning: `pnpm exec vizij hooks install` (adds/updates `.git/hooks/*` or `core.hooksPath`).
2. **Doctor** the setup whenever hooks misbehave: `pnpm exec vizij hooks doctor` outputs toolchain status, detected hooks path, and remediation hints.
3. **Pre-commit / pre-push** run automatically. To run manually (e.g., on CI agents):
   ```bash
   pnpm exec vizij hooks pre-commit
   pnpm exec vizij hooks pre-push --base origin/main
   ```
4. **Configuration** (optional): place a `ci.config.json` at the repo root to override includes/excludes or map tasks (see template in the automation reference). Commit changes alongside feature work to keep the harness deterministic.
5. **Skip or extend**: `HOOK_SKIP=1` bypasses all hooks; `HOOK_EXTRA=wasm` adds heavy tasks (documented per repo); `HOOK_MINIMAL=1` enforces the smallest viable set during emergencies.

## Maintenance & Extension
- Keep CLI dependencies updated with the rest of `@vizij/dev-tools`; publish a new version whenever hook logic changes.
- When repositories add new tasks, extend `ci.config.json` rather than editing the harness.
- Archive legacy scripts by replacing their bodies with `pnpm exec vizij hooks <cmd>` so long-lived branches continue working.

## Testing & Validation
- Cover critical helpers (diff resolver, config loader, doctor) with Vitest in `vizij-dev-tools/tests`.
- Run hooks inside CI using `pnpm exec vizij hooks pre-push --base origin/main` on representative diffs before enabling enforcement.
- Monitor CI guard runs for increasing failure counts and triage via the troubleshooting appendix.

## Further Reading & Assets
- Source & README: [`vizij-dev-tools`](vizij-dev-tools/README.md)
- Workflows referencing hook parity: [`workflows/ci-web.yml`](workflows/ci-web.yml), [`workflows/ci-rs.yml`](workflows/ci-rs.yml)
- Project summary entry: [`summary.md`](summary.md)
