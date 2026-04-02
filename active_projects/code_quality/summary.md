# Vizij Code Quality & Performance Program Summary
<!-- tags: family=project; type=summary; project_status=planning; topics=testing,performance,qa,documentation -->

> **Last updated:** 2026-04-02

## Goals

Keep Vizij's runtime, web, and documentation surfaces trustworthy through validation discipline, contract hardening, performance review, and clear operational documentation.

## Authority Note

This file is the canonical cross-repo summary for quality/performance work. Detailed implementation checks remain in the owning repos.

## Document Families

| Project | Status | Proposal | Plan | Reference |
| --- | --- | --- | --- | --- |
| JSON Cloning Replacement | `archived` | [`json_cloning-proposal.md`](../../archive/code_quality/legacy-undated/json_cloning/json_cloning-proposal.md) | [`json_cloning-plan.md`](../../archive/code_quality/legacy-undated/json_cloning/json_cloning-plan.md) | [`json_cloning-reference.md`](../../archive/code_quality/legacy-undated/json_cloning/json_cloning-reference.md) |
| WASM Hardening | `planned` | [`wasm_hardening-proposal.md`](../../backlog/code_quality/proposals/wasm_hardening-proposal.md) | — | — |
| Refactoring | `planned` | [`refactoring-proposal.md`](../../backlog/code_quality/refactoring/refactoring-proposal.md) | [`refactoring-plan.md`](../../backlog/code_quality/refactoring/refactoring-plan.md) | — |
| WASM Boundary Optimization | `planned` | [`wasm_boundary_optimization-proposal.md`](../../backlog/code_quality/wasm_boundary_optimization/wasm_boundary_optimization-proposal.md) | [`wasm_boundary_optimization-plan.md`](../../backlog/code_quality/wasm_boundary_optimization/wasm_boundary_optimization-plan.md) | — |

## Current Verified State

- The current cross-repo quality gap is not only runtime correctness; it also includes documentation/source-of-truth drift between repos and public-facing surfaces.
- `vizij-rs` and `vizij-web` already have substantial build/test/release workflows, but the docs/issue/release-note layer needed explicit canonicalization.
- Performance-benchmark and hardening work still exists, but much of it remains backlog or archived material rather than an actively refreshed current pillar.
- The stabilized performance reference surface now lives under `current_documentation/performance_tracking/`, with current summary and process docs separated from archived raw evidence.
- The current phase is not a hardening-first phase; hardening and refactoring should support the public onboarding/build/deploy path unless they become blocking risks.
- The current hardening problem is best understood as trust preservation across maintained workflows rather than a broad generic cleanup push.

## Near-Term Focus

- Keep workflow lock-in and acceptance coverage aligned with the maintained public and product-defining paths:
  - canonical authoring flows
  - deployment/operator flows
  - public tutorials/examples that are treated as maintained
- Keep documentation, release-note policy, known-issue tracking, and example validation aligned with the public golden path.
- Elevate ABI, protocol, bundle, and runtime-interface hardening when boundary failures would erode contributor or operator trust.
- Elevate wasm hardening, performance review, and refactoring only when they directly block the maintained onboarding/build/deploy system or a clearly owned cross-repo contract.
- Preserve existing archived quality work as historical context rather than leaving broken links in active summaries.

## Current Lane Framing

- Treat this program as a cross-cutting support lane, not a competing product pillar.
- Prioritize:
  - workflow lock-in and acceptance validation
  - cross-repo contract hardening
  - operational hygiene
  - blocker-class performance review
- Keep broad refactoring and generic optimization visible, but subordinate unless they become direct blockers.

## Current Reference Surfaces

- [Performance Baselines](../../current_documentation/performance_tracking/perf_baselines.md)
- [Performance Baseline Process](../../current_documentation/performance_tracking/perf_baseline_process.md)

## Archived Projects

- [Testing Strategy](../../archive/code_quality/legacy-undated/testing_strategy/testing_strategy-plan.md)
- [Performance Baselines](../../archive/code_quality/legacy-undated/performance_baselines/performance_baselines-plan.md)
- [JSON Cloning Replacement](../../archive/code_quality/legacy-undated/json_cloning/json_cloning-reference.md)

## Deferred Follow-Up

The later comprehensive roadmap review should decide which hardening/performance items become the next dedicated push after the current public-system phase lands.
