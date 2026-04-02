# Refactoring Proposal
<!-- tags: family=project; type=proposal; project_status=proposal; topics=refactoring,code-quality,maintenance,rust,typescript -->
> **Last updated:** 2026-03-31

## 1. Summary
This project focuses on simplifying, modularizing, and adhering to "Don't Repeat Yourself" (DRY) principles across the entire codebase. The goal is to reduce technical debt, improve readability, and make the system easier to extend.

## 2. Problem Statement
As Vizij has evolved, certain patterns have been duplicated, and some components have become monolithic. This increases the cognitive load for developers, makes testing harder, and increases the risk of bugs when changes are made in one place but not another. Specific areas of concern include duplicated logic between Rust and TS (where not strictly necessary) and large, complex functions in the Orchestrator and Graph stacks.

## 3. Goals
*   **Modularization**: Break down large crates and packages into smaller, focused units.
*   **DRY**: Identify and eliminate code duplication.
*   **Simplification**: Refactor complex logic flows to be more linear and understandable.
*   **Standardization**: Enforce consistent coding patterns and naming conventions.

## 4. Proposed Solution
1.  **Audit**: Conduct a code audit to identify the largest sources of duplication and complexity.
2.  **Rust Refactor**: Focus on the `vizij-orchestrator-core` and `vizij-graph-core` crates to ensure clean separation of concerns.
3.  **Web Refactor**: Review React hooks and contexts in `vizij-web` to ensure they are composable and not monolithic.
4.  **Shared Utils**: Promote common utility functions to shared libraries (`vizij-utils`, `vizij-api-core`).

## 5. Risks & Unknowns
*   **Regressions**: Large-scale refactoring carries a high risk of introducing subtle bugs. Comprehensive testing is essential.
*   **Merge Conflicts**: Long-running refactoring branches can be difficult to merge.

## 6. Success Metrics
*   **Code Size**: Reduction in overall lines of code (LOC) for equivalent functionality.
*   **Cyclomatic Complexity**: Reduction in complexity scores for key functions.
*   **Developer Velocity**: Subjective improvement in the ease of adding new features.
