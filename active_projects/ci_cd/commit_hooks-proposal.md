# Commit Hooks & Guardrails Proposal
<!-- tags: status=proposal; topics=ci-cd,tooling,developer-experience -->
> **Related documents:** [Plan](commit_hooks-plan.md) · [Reference](commit_hooks-reference.md) · [Project summary](summary.md)

## 1. Context & Problem Statement
- **vizij-web** relies on `scripts/install-git-hooks.sh` to point `core.hooksPath` at `.githooks`, where `pre-commit` runs `pnpm exec lint-staged` and `pre-push` shells into `run-affected.sh`. Developers can skip runs via `SKIP_GIT_HOOKS` and opt into heavier checks using `HOOK_RUN_WEB_BUILD`, but there is no verification that hooks stay installed.
- **vizij-rs** follows a different pattern: hooks call npm scripts that in turn invoke `scripts/hook-tasks.sh` to run cargo fmt/clippy/tests and optional WASM packaging (`HOOK_RUN_WASM`). Logging, exit codes, and skip flags differ from vizij-web.
- There is no shared documentation, troubleshooting runbook, or CI signal proving hooks are installed. New maintainers frequently clone repos without running the install script, leaving hooks disabled.
- Git diffs drive scope selection in `vizij-web` but not in `vizij-rs`; Rust hooks remain “full repo” and become slow.

## 2. Goals & Non-goals
**Goals**
1. Deliver a **unified hook harness** implemented in `@vizij/dev-tools` (`vizij-dev-tools`) that exposes `vizij hooks install|doctor|pre-commit|pre-push`.
2. Provide **diff-scoped execution** for JS/TS workspaces and Rust crates so hooks stay under the target runtime (≤3s pre-commit, ≤30s pre-push for typical diffs).
3. Ship an optional **`ci.config.json` schema** so repositories can declare tasks, includes/excludes, and extra flags without forking the harness.
4. Establish **CI guardrails** (e.g., doctor jobs) to alert when hooks drift or required toolchains are missing.
5. Publish a **reference + troubleshooting guide** that links directly to implementations in `workflows/` and `vizij-dev-tools`.

**Non-goals**
- Replacing CI workflows; hooks stay focused on fast feedback while `workflows/ci-web.yml` and `workflows/ci-rs.yml` remain the source of truth for full validation.
- Managing unrelated Git client settings (signing, LFS). Those stay in repository-specific docs.

## 3. Architectural Design
- **CLI Surface:** Extend the `vizij` binary with `hooks` commands (install, doctor, pre-commit, pre-push). Command wiring and structured logging live under `vizij-dev-tools/src/hooks`.
- **Config:** Optional `ci.config.json` describes workspace/crate globs, task mappings, and flags (e.g., `HOOK_EXTRA=wasm`). Defaults cover both repos so config is additive.
- **Diff Scoping:** Shared git helper resolves a base ref (default `origin/main` or `PNPM_BASE_REF`) and maps changed paths to tasks. Rust crates reuse the same resolver used by `vizij run-affected`.
- **CI Guard:** Add a lightweight job (initially non-blocking) that runs `pnpm exec vizij hooks doctor` and ensures `core.hooksPath` matches the repo. Warnings promote to failures once adoption stabilises.
- **Docs & Workflows:** Reference how hooks integrate with `workflows/ci-web.yml` (JS/TS parity) and `workflows/ci-rs.yml` (Rust parity) plus the GitHub workflow snippets developers can copy when creating new repos.

## 4. Risks & Trade-offs
- **Runtime overhead:** mitigated by diff scoping, `HOOK_MINIMAL`, and the ability to skip heavy checks unless requested.
- **Environment drift:** doctor detects missing binaries/toolchains; docs list install commands.
- **Cross-shell portability:** CLI avoids Bash-specific constructs. We accept WSL as the supported path for Windows contributors.
- **Bypass risk:** hooks can always be skipped; therefore CI keeps enforcing required checks so policy cannot regress silently.

## 5. Approval & Decision Log
- 2025-11-07 – Draft proposal circulated to vizij maintainers (pending sign-off from JS & Rust leads).
- Decisions to capture once approved: config schema ownership, doctor enforcement date, and policy for optional heavy tasks (TBD).

## 6. High-level Execution Plan
1. **Stage 1 – Harness foundation:** implement CLI surface, logging, config parsing, and `vizij hooks install|doctor` prototypes.
2. **Stage 2 – Task adapters & diff scoping:** reach parity with current scripts for JS/TS + Rust, expose `--base` overrides, and add JSON summaries for CI guard runs.
3. **Stage 3 – Pilot & documentation:** roll out to `vizij-web`, collect feedback, then adopt in `vizij-rs`. Ship the reference doc, troubleshooting appendix, and create the CI guard job.
4. **Stage 4 – Enforcement:** switch CI guard to blocking, document the skip/override policy, and archive legacy scripts (keeping shims for a short overlap window).
