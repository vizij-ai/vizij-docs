# Automation Scripting Proposal
<!-- tags: status=proposal; topics=ci-cd,tooling,automation -->
> **Related documents:** [Plan](automation_scripting-plan.md) · [Reference](automation_scripting-reference.md) · [Project summary](summary.md)

## 1. Context & Problem Statement
- `vizij-web` and `vizij-rs` each maintain bespoke Bash and Node helpers for tasks such as diff-scoped validation (`scripts/run-affected.sh`), hook orchestration (`scripts/hook-tasks.sh`), release dry-runs, and install scripts. Logic diverges quickly and lacks shared tests.
- CI workflows (`workflows/ci-web.yml`, `workflows/ci-rs.yml`, `workflows/release.yml`) now expect commands like `pnpm exec vizij run-affected validate` or `vizij release graph`, but the underlying CLI is still a thin prototype.
- Base-ref detection, workspace discovery, and logging differ per script. Windows/WSL compatibility and typed config are missing, increasing onboarding friction.

## 2. Goals & Non-goals
**Goals**
1. Deliver a **single TypeScript CLI** (`@vizij/dev-tools`) that exposes `vizij run-affected`, `vizij release graph`, `vizij release validate-workspace-ranges`, and related helpers used by both developers and CI.
2. Provide **accurate diff-scoping** across pnpm workspaces and Rust crates with caching, `--base` overrides, and JSON output for CI consumers.
3. **Codify configuration** via `ci.config.json` (schema + validation) so per-repo behavior lives in data, not shell scripts.
4. Ship **tests and documentation** so the CLI is trustworthy and easy to extend.
5. Keep **developer ergonomics high** with clear logs, exit codes, and troubleshooting guidance.

**Non-goals**
- Replacing specialized tooling (Changesets, cargo, pnpm). The CLI orchestrates those tools.
- Building a full build graph system (Nx/Turborepo); we remain lightweight and repo-agnostic.

## 3. Architectural Design
- **CLI Framework:** Implementation in TypeScript under `vizij-dev-tools/src`, compiled to ESM and distributed via npm. `bin/vizij.mjs` registers commands using Commander.
- **Discovery Layer:** Fast-glob + manifest parsing to enumerate pnpm workspaces (`packages/*`) and Rust crates (`crates/*`). Supports includes/excludes from config.
- **Diff Resolver:** Shared git helper infers `--base` (defaults to `origin/main` or `PNPM_BASE_REF`) and caches file lists for repeated invocations.
- **Task Adapters:** Declarative mapping from logical tasks (`lint`, `test`, `validate`, `build`) to actual commands per ecosystem. Adapters stream grouped logs suitable for GitHub Actions.
- **Release Utilities:** `vizij release graph` outputs topological publish order; `vizij release validate-workspace-ranges` ensures npm manifests have concrete semver ranges before publishing workflows run.
- **Integration Points:** Workflows under `workflows/ci-web.yml`, `_release-dry-run.yml`, `_publish-npm.yml`, `_publish-crates.yml`, and `release.yml` call the CLI directly.

## 4. Risks & Trade-offs
- **Graph accuracy:** start with manifest heuristics and add richer parsing (e.g., `cargo metadata`) once needed. Provide `--all` escape hatch.
- **Performance:** running multiple commands per target can be slow; plan for batched execution and caching while prioritizing correctness.
- **Change management:** centralising logic means CLI regressions can affect many workflows. Mitigate with semantic versioning, changelog, and pinning in repos until confidence is high.

## 5. Approval & Decision Log
- 2025-11-07 – Proposal drafted; awaiting approval from CI/CD program lead and repo maintainers.

## 6. High-level Execution Plan
1. **Stage 1 – Discovery & diff:** harden workspace/crate discovery and base-ref resolver; add unit tests.
2. **Stage 2 – Task adapters & JSON output:** finish `run-affected` parity for pnpm & Rust, plus machine-readable summaries for CI.
3. **Stage 3 – Release utilities & config schema:** implement `release graph`, `validate-workspace-ranges`, and publish the `ci.config.json` schema/examples.
4. **Stage 4 – Docs & rollout:** integrate CLI into `workflows/*.yml`, deprecate legacy scripts, and publish reference documentation.
