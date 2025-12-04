# Vizij Code Quality & Performance Program Summary
<!-- tags: status=tracking; topics=testing,performance,qa,architecture -->

## Document Families

| Pillar | Status | Proposal | Plan & Tracking | Reference |
| --- | --- | --- | --- | --- |
| **JSON Cloning Replacement** | ✅ Complete | [`json_cloning-proposal.md`](json_cloning-proposal.md) | [`json_cloning-plan.md`](json_cloning-plan.md) | [`json_cloning-reference.md`](json_cloning-reference.md) |
| **WASM Hardening** | 📝 Planned | *TBD* | *TBD* | *TBD* |
| **Performance Baselines** | 📝 Planned | *TBD* | *TBD* | *TBD* |

## Active Projects

### Core QA & Review
- **Testing**: Expand unit and integration test coverage across `vizij-rs` and `vizij-web`.
- **Documentation**: Keep architectural and usage docs in sync with code.

### Performance Optimization
- **Node Graph Speed**: Investigate lookup optimizations and evaluation speedups.

## Planned Initiatives
- **Speed Benchmarks**: Establish automated baselines for graph evaluation and rendering.

## Upcoming Milestones
1. **JSON Cloning**: Complete implementation of `cloneDeepSafe` and migrate call sites.
2. **WASM Tests**: Add integration tests for WASM packages.
3. **Benchmarks**: Initial set of performance benchmarks for node graph evaluation.
