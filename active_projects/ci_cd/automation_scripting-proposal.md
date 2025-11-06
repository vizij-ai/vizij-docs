# Automation Scripting Proposal
<!-- tags: status=proposal; topics=ci-cd,tooling,scripting -->

> **Related documents:** Plan (pending) · Reference (pending) · [Project summary](summary.md)

## Context & Current State

### `vizij-web`
- `package.json` scripts delegate lint/test/typecheck to `scripts/run-affected.sh`, which determines the upstream base (`PNPM_BASE_REF` or git upstream) and runs `pnpm --filter "...[$BASE]..." run <script>`. This scopes checks to impacted workspaces.
- Release automation relies on `scripts/release-tag.sh`, plus helper scripts (`install-git-hooks.sh`, `run-affected.sh`) and pnpm tasks (`verify:packages`, `publish:packages`).
- Scripts are Bash-based; there is no shared logging/argument parsing framework. Windows support depends on WSL.

### `vizij-rs`
- `scripts/hook-tasks.sh` centralises Rust and pnpm commands, providing descriptive logging, environment-driven toggles (`HOOK_RUN_WASM`), and a single entry point used by Git hooks and npm scripts.
- Additional Node scripts (`build-*-wasm.mjs`, `generate-node-registry.mjs`) manage WASM builds and metadata export, but orchestration across commands is ad-hoc.
- `scripts/dry-run-release.sh` runs caretaked build/test/pack steps, but the commented sections hint at manual steps and incomplete automation.

Pain points:
- Each repo invents its own helper patterns (filtering, logging). There's duplication and inconsistent ergonomics.
- Base-ref detection in `run-affected.sh` lacks caching and may fail when upstream tracking branches aren't configured.
- There is no single source of truth for environment variables (e.g., `PNPM_BASE_REF`, `HOOK_RUN_WASM`, `SKIP_GIT_HOOKS`).
- Hardcoded paths (e.g., `packages`) make scripts brittle when workspace layout changes.
- Bash scripts are harder to test and maintain; Node/TS alternatives could improve cross-platform support and testability.

## Goals

1. **Shared Automation Toolkit** – Build a reusable script library (Node/TypeScript CLI or pnpm workspace package) to standardise logging, argument parsing, and repo discovery.
2. **Unified “Run Affected” Utility** – Extract diff-scoping logic into a shared module with caching, error handling, and consistent filtering for both repos (Rust crates + pnpm workspaces).
3. **Configuration-Driven Tasks** – Allow automation scripts to read configuration (`ci.config.json`) so per-repo details live in config, not script code.
4. **Testing & Validation** – Add unit/integration tests for critical CLIs (dry-run release, run-affected) to prevent regressions.
5. **Developer Experience** – Document environment variables, provide `--help` output, and add verbose/debug modes for diagnosing CI issues.

## Proposed Approach

1. **Create `@vizij/dev-tools` Package**
   - Implement utilities in TypeScript (compiled to ESM) for logging, git diff analysis, workspace discovery, and command execution with spinner/timing support.
   - Provide CLIs: `vizij run-affected`, `vizij hook`, `vizij release dry-run`, etc.
   - Publish package for reuse in both repos (or symlink via pnpm workspace).

2. **Refactor Existing Scripts**
   - Replace `scripts/run-affected.sh` with `pnpm exec vizij run-affected lint`.
   - Port `hook-tasks.sh` logic into the shared tool, allowing custom task definitions via JSON.
   - Migrate release automation to use shared library for git status checks, tagging, and npm/cargo invocation.

3. **Configuration**
   - Introduce `ci.config.json` per repo describing:
     - Workspaces/crates to include/exclude.
     - Command mappings (lint, test, build).
     - Optional extras (WASM checks, pack dry-runs).
   - CLI reads config and executes tasks accordingly.

4. **Testing & CI**
   - Add Vitest/Jest tests for CLI modules.
   - Provide CI job running `pnpm exec vizij run-affected --dry-run` to ensure config stays valid.
   - Document manual testing steps for developers.

5. **Developer Rollout**
   - Deprecate legacy scripts with console warnings before removal.
   - Update documentation, adjust npm scripts, and communicate changes via release notes.

## Risks & Mitigations

- **Scope Creep** – Keep initial version focused on parity; avoid rewriting all automation at once.
- **Cross-language Support** – Ensure Rust-specific commands remain first-class.
- **Adoption** – Provide compatibility layer (e.g., old scripts call new CLI) during transition.

## Next Steps

1. Audit all scripts in `vizij-web` and `vizij-rs` to catalogue required tasks.
2. Draft proposal for CLI interface and configuration format.
3. Prototype shared package and test in one repo before onboarding the other.
