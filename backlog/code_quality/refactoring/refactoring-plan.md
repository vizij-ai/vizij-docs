# Refactoring – Plan & Tracking
<!-- tags: family=project; type=plan; project_status=planning; topics=refactoring,code-quality,maintenance,rust,typescript -->
> **Last updated:** 2026-03-31

> **Related documents:** [Proposal](refactoring-proposal.md) · [Project summary](../summary.md)

## Objective & Scope

Systematically reduce duplication and complexity in key parts of the Vizij codebase, starting with the orchestrator and graph stacks and selected web packages. This plan focuses on small, incremental refactors that are easy to review and test, rather than large rewrites.

## Plan

The following steps provide a linear sequence of concrete refactoring tasks suitable for a junior developer, with acceptance criteria for each phase.

### 1. Identify and document specific refactoring targets

1.1 Run basic complexity and size checks:
- [ ] Use `cargo clippy` and `cargo fmt` on `vizij-rs` to ensure the codebase is in a clean state.
- [ ] Use simple tools (e.g., `rg`, `wc -l`, or IDE metrics) to identify:
    - Rust modules in `vizij-orchestrator-core` and `vizij-graph-core` with very long files or functions.
    - Large React components or hooks in `vizij-web` (e.g., `RigControllerProvider`, large panels).

1.2 Create a short target list:
- [ ] Write down 3–5 concrete refactoring targets, such as:
    - A specific long function to break up.
    - A duplicated piece of logic between two modules.
    - A monolithic React component that can be split.

Acceptance criteria:
- There is a short, prioritized list of concrete refactoring targets with file paths and function/component names.

### 2. Refactor a small Rust target in `vizij-orchestrator-core` or `vizij-graph-core`

2.1 Choose one function or module to simplify:
- [ ] Pick a function identified in step 1 that:
    - Contains clearly separable logic blocks.
    - Has existing tests (or can be tested via nearby tests).

2.2 Apply a minimal refactor:
- [ ] Extract helper functions for logically distinct operations (e.g., parsing, validation, evaluation).
- [ ] Ensure the refactor does not change external behavior:
    - Run `cargo test -p vizij-orchestrator-core` or `cargo test -p vizij-graph-core` after changes.

Acceptance criteria:
- The chosen function is shorter and easier to read, with helpers named after their responsibilities.
- All tests for the affected crate pass.

### 3. Refactor a small React/TypeScript target in `vizij-web`

3.1 Choose a component or hook:
- [ ] Select a component or hook called out in `vizij-web/apps/vizij-authoring/docs/ui-component-inventory.md` or similar documentation that is:
    - Overly long.
    - Handling multiple responsibilities (e.g., complex state and UI rendering).

3.2 Apply a minimal refactor:
- [ ] Extract presentational subcomponents or helper hooks to:
    - Separate data fetching/state management from rendering.
    - Reuse common UI patterns (e.g., repeated sections or rows).
- [ ] Run `pnpm --filter vizij-authoring typecheck` and `pnpm --filter vizij-authoring test` after changes.

Acceptance criteria:
- The chosen component/hook is shorter and has clearer responsibilities.
- Typecheck and tests for `vizij-authoring` continue to pass.

### 4. Consolidate shared utilities

4.1 Identify duplicated utility logic:
- [ ] Search for repeated helper functions across `vizij-web` and `vizij-rs` (e.g., value coercion, typed path parsing, simple math utilities) using `rg`.

4.2 Move appropriate utilities into shared packages:
- [ ] For TypeScript:
    - Move common utilities into `@vizij/utils` where appropriate.
- [ ] For Rust:
    - Consider moving shared logic into `vizij-api-core` when it crosses multiple crates.

4.3 Update imports and run tests:
- [ ] Update all call sites to import from the new shared location.
- [ ] Run relevant tests (`pnpm run test` in `vizij-web`, `pnpm run test:rust` in `vizij-rs`).

Acceptance criteria:
- At least one clearly duplicated utility is consolidated into a shared module.
- All affected tests continue to pass.

### 5. Document refactoring patterns and future targets

5.1 Record before/after notes:
- [ ] For each refactor performed, add a short note (e.g., in this plan or a `CHANGELOG`/doc comment) describing:
    - The original issue (e.g., long function, duplicated code).
    - The refactoring approach taken.

5.2 Update the target list:
- [ ] Based on experience from the initial refactors, add or adjust items in the target list created in step 1 for future work.

Acceptance criteria:
- There is a record of what has been refactored and why, helping future contributors continue in the same style.

## Acceptance Criteria (Overall)

- Specific, high-impact refactoring targets have been identified across Rust and TypeScript code.
- At least one non-trivial refactor has been applied in `vizij-orchestrator-core` or `vizij-graph-core`, and one in `vizij-web`, without regressions.
- Some duplicated utilities have been consolidated into shared modules.
- Documentation exists that captures the patterns and priorities for future refactoring work.

