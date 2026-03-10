# Vizij Code Quality & Performance Program Summary
<!-- tags: type=summary; status=planned; topics=testing,performance,qa,documentation -->

Last updated: 2026-03-10

## Goals

Keep Vizij's runtime, web, and documentation surfaces trustworthy through validation discipline, contract hardening, performance review, and clear operational documentation.

## Authority Note

This file is the canonical cross-repo summary for quality/performance work. Detailed implementation checks remain in the owning repos.

## Document Families

| Project | Status | Proposal | Plan | Reference |
| --- | --- | --- | --- | --- |
| JSON Cloning Replacement | `archived` | [`json_cloning-proposal.md`](../../archive/json_cloning/json_cloning-proposal.md) | [`json_cloning-plan.md`](../../archive/json_cloning/json_cloning-plan.md) | [`json_cloning-reference.md`](../../archive/json_cloning/json_cloning-reference.md) |
| WASM Hardening | `planned` | [`wasm_hardening-proposal.md`](../../backlog/backlog_proposals/wasm_hardening-proposal.md) | — | — |
| Refactoring | `planned` | [`refactoring-proposal.md`](../../backlog/active_projects/code_quality/refactoring/refactoring-proposal.md) | [`refactoring-plan.md`](../../backlog/active_projects/code_quality/refactoring/refactoring-plan.md) | — |
| WASM Boundary Optimization | `planned` | [`wasm_boundary_optimization-proposal.md`](../../backlog/active_projects/code_quality/wasm_boundary_optimization/wasm_boundary_optimization-proposal.md) | [`wasm_boundary_optimization-plan.md`](../../backlog/active_projects/code_quality/wasm_boundary_optimization/wasm_boundary_optimization-plan.md) | — |

## Current Verified State

- The current cross-repo quality gap is not only runtime correctness; it also includes documentation/source-of-truth drift between repos and public-facing surfaces.
- `vizij-rs` and `vizij-web` already have substantial build/test/release workflows, but the docs/issue/release-note layer needed explicit canonicalization.
- Performance-benchmark and hardening work still exists, but much of it remains backlog or archived material rather than an actively refreshed current pillar.
- The current phase is not a hardening-first phase; hardening and refactoring should support the public onboarding/build/deploy path unless they become blocking risks.

## Near-Term Focus

- Keep documentation, release-note policy, known-issue tracking, and example validation aligned with the public golden path.
- Elevate wasm hardening, perf, and refactoring work when they directly block the maintained onboarding/build/deploy system.
- Preserve existing archived quality work as historical context rather than leaving broken links in active summaries.

## Archived Projects

- [Testing Strategy](../../archive/code_quality/testing_strategy/testing_strategy-plan.md)
- [Performance Baselines](../../archive/code_quality/performance_baselines/performance_baselines-plan.md)
- [JSON Cloning Replacement](../../archive/json_cloning/json_cloning-reference.md)

## Deferred Follow-Up

The later comprehensive roadmap review should decide which hardening/performance items become the next dedicated push after the current public-system phase lands.
