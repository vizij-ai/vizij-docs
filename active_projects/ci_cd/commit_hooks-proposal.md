# Commit Hooks & Guardrails Proposal
<!-- tags: status=proposal; topics=ci-cd,workflow,tooling -->

> **Related documents:** Plan (pending) · Reference (pending) · [Project summary](summary.md)

## Context & Problem Statement

- **vizij-web** installs Git hooks via `scripts/install-git-hooks.sh`, sets `core.hooksPath` to `.githooks`, and provides a `pre-commit` hook that runs `pnpm exec lint-staged` plus a `pre-push` hook that executes `pnpm run validate` (scoped by `run-affected.sh`). Developers can skip hooks using `SKIP_GIT_HOOKS`, and optionally run full builds via `HOOK_RUN_WEB_BUILD`.
- **vizij-rs** uses `scripts/install-git-hooks.sh` to point at `.githooks`, but delegates hook work to `pnpm run hook:pre-commit` / `hook:pre-push`, which invoke `scripts/hook-tasks.sh`. That script orchestrates Rust fmt/clippy/tests and optionally WASM packaging when `HOOK_RUN_WASM=1`.

Challenges:
- Onboarding requires running install scripts manually; there is no safeguard to ensure hooks remain configured.
- Behaviour diverges per repo (lint-staged vs. full task runner). Environment variables and messaging differ.
- Hooks do not surface a consistent summary or link to remediation docs.
- There's no shared strategy for partial runs (e.g., running only affected Rust crates) or detecting missing dependencies before running expensive tasks.

## Goals

1. **Unified Hook Harness** – Provide a shared helper (possibly a pnpm package or script template) that both repos can use for install, skip flags, and logging.
2. **Onboarding & Verification** – Integrate hook installation into setup scripts (e.g., `pnpm install` postinstall or documented `pnpm exec hooks/install`) and add CI checks that fail if `core.hooksPath` is misconfigured.
3. **Consistent Behaviour** – Align skip flags, environment variables, and output format. Provide guidance on how to opt into heavier checks (`HOOK_RUN_*` flags).
4. **Performance Improvements** – Explore git diff scoping for Rust (similar to `run-affected.sh`) and caching for lint-staged to minimise pre-push overhead.
5. **Documentation & Troubleshooting** – Publish a reference explaining hook expectations, skip workflows, and how to recover from failures.

## Proposed Approach

1. **Shared Hook Runner Package**
   - Extract reusable logic (argument parsing, logging, skip handling) into a cross-repo `pnpm` workspace package (e.g., `packages/tools/git-hooks`) that exports a CLI.
   - Provide wrappers for repo-specific tasks (Rust checks, pnpm validate, lint-staged).
   - Versioned package ensures both repos stay in sync.

2. **Installation & Verification**
   - Add `postinstall` step (guarded by `CI`) that runs `pnpm exec hooks install`.
   - Add a `pnpm run hooks:doctor` script to confirm configuration and minimal prerequisites (pnpm, cargo fmt/clippy, lint-staged).
   - Document in CONTRIBUTING.md.

3. **Task Harmonisation**
   - Adopt consistent environment variables (`HOOK_SKIP`, `HOOK_EXTRA=build|wasm`).
   - Provide per-task config (JSON/YAML) that the runner reads, rather than hard-coded behaviour.
   - Consider leveraging `git diff --name-only` + `cargo nextest --tests` for selective Rust runs.

4. **Developer Feedback**
   - Improve hook output formatting (clear headers, durations, actionable failure guidance).
   - Add detection for missing toolchains (Rustup components, pnpm) with hints.

5. **Rollout Plan**
   - Pilot in `vizij-web`, update docs, then port to `vizij-rs`.
   - Provide migration instructions for touching developers (run new install command).

## Risks & Mitigations

- **Over-automation** – Hooks may become fragile if too many assumptions baked in. Keep commands simple and configurable.
- **Cross-platform Support** – Ensure scripts run on macOS/Linux; test on Windows WSL.
- **Adoption** – Provide escape hatches (`HOOK_MINIMAL=1`) and communicate benefits.

## Next Steps

1. Collect developer feedback on current hook pain points.
2. Draft shared runner interface and config schema.
3. Spike implementation and measure runtime compared to current hooks.
