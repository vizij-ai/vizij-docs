# Vizij Code Quality & Performance Program Summary
<!-- tags: status=tracking; topics=testing,performance,qa,architecture -->

## Document Families

| Pillar | Status | Proposal | Plan & Tracking | Reference |
| --- | --- | --- | --- | --- |
| **JSON Cloning Replacement** | ✅ Complete | [`json_cloning-proposal.md`](json_cloning/json_cloning-proposal.md) | [`json_cloning-plan.md`](json_cloning/json_cloning-plan.md) | [`json_cloning-reference.md`](json_cloning/json_cloning-reference.md) |
| **WASM Hardening** | 📝 Planned | [`wasm_hardening-proposal.md`](../backlog/backlog_proposals/wasm_hardening-proposal.md) | *TBD* | *TBD* |

## Active Projects

### Core QA & Review
- **Documentation**: Keep architectural and usage docs in sync with code.

### Optimization & Refactoring
- **WASM Boundary Optimization**: Minimize JS/WASM boundary crossings (serialization overhead).
- **Refactoring**: Simplify, modularize, and DRY out code across Rust and Web.

## Planned Initiatives
- **WASM Hardening**: Ensure ABI compatibility and stability (Medium-Term).
- **Automated Performance Regression Testing**: CI pipelines that block on performance regressions (Long-Term).

## Upcoming Milestones
1. **Refactoring**: Begin modularization of core components.

## Archived Projects
- **Testing Strategy** (moved to `archive/code_quality/testing_strategy/` on 2026-02-04)
- **Performance Baselines** (moved to `archive/code_quality/performance_baselines/` on 2026-02-04)
