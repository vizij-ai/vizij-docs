# Vizij Code Quality & Performance Program Summary
<!-- tags: status=tracking; topics=testing,performance,qa,architecture -->

## Document Families

| Pillar | Status | Proposal | Plan & Tracking | Reference |
| --- | --- | --- | --- | --- |
| **JSON Cloning Replacement** | ✅ Complete | [`json_cloning-proposal.md`](json_cloning/json_cloning-proposal.md) | [`json_cloning-plan.md`](json_cloning/json_cloning-plan.md) | [`json_cloning-reference.md`](json_cloning/json_cloning-reference.md) |
| **Testing Strategy** | 📝 Planned | — | [`testing_strategy-plan.md`](testing_strategy/testing_strategy-plan.md) | — |
| **WASM Hardening** | 📝 Planned | [`wasm_hardening-proposal.md`](../../backlog_proposals/wasm_hardening-proposal.md) | *TBD* | *TBD* |
| **Performance Baselines** | 📝 Planned | [`performance_baselines-proposal.md`](../../backlog_proposals/performance_baselines-proposal.md) | *TBD* | *TBD* |

## Active Projects

### Core QA & Review
- **Testing**: Expand unit and integration test coverage across `vizij-rs` and `vizij-web`.
- **Documentation**: Keep architectural and usage docs in sync with code.

### Optimization & Refactoring
- **WASM Boundary Optimization**: Minimize JS/WASM boundary crossings (serialization overhead).
- **Refactoring**: Simplify, modularize, and DRY out code across Rust and Web.

## Planned Initiatives
- **WASM Hardening**: Ensure ABI compatibility and stability (Medium-Term).
- **Automated Performance Regression Testing**: CI pipelines that block on performance regressions (Long-Term).

## Upcoming Milestones
1. **JSON Cloning**: Complete implementation of `cloneDeepSafe` and migrate call sites.
2. **Benchmarks**: Initial set of performance benchmarks for node graph evaluation.
3. **Refactoring**: Begin modularization of core components.
