# Deferred Hardening Backlog Summary
<!-- tags: family=project; type=summary; project_status=planning; topics=testing,performance,qa,architecture -->

> **Last updated:** 2026-03-31

## Goals

Keep the deferred hardening and optimization lines visible without confusing them for the primary hardening work in the current phase.

## Status Note

This file is the deferred hardening summary under `backlog/code_quality/`. It should not be read as the canonical current code-quality summary.

Current hardening truth now lives in:

- [`../../active_projects/code_quality/summary.md`](../../active_projects/code_quality/summary.md)
- [`../../current_documentation/ROADMAP.md`](../../current_documentation/ROADMAP.md)

This backlog summary now tracks the broader optimization and refactoring lines that stay visible but subordinate unless they become direct blockers.

## Backlog Lines

### Contract and hardening follow-on

- **WASM Hardening**: strengthen ABI compatibility, runtime stability, and boundary failure behavior. See [WASM Hardening Proposal](proposals/wasm_hardening-proposal.md).

### Optimization and refactoring

- **Refactoring**: simplify, modularize, and reduce duplication across Rust and Web where there is a concrete blocker or contract payoff. See [Refactoring Proposal](refactoring/refactoring-proposal.md).
- **WASM Boundary Optimization**: reduce JS/WASM boundary overhead and serialization costs where hot paths justify it. See [WASM Boundary Optimization Proposal](wasm_boundary_optimization/wasm_boundary_optimization-proposal.md).

## Current-Framing Rule

These lines are visible, but they are not the lead story for the current phase. Elevate them when they:

1. block the maintained public path
2. weaken cross-repo contracts
3. undermine runtime or deployment credibility
