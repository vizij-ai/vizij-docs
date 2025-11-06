# Derived Input Hierarchy Reference
<!-- tags: status=reference; topics=graph-ir,workflow,ui-ux,persistence -->

> **Related documents:** [Proposal](derived_input_hierarchy-proposal.md) · [Plan](derived_input_hierarchy-plan.md) · [Project summary](summary.md)

> Adapted from `archive/hierarchical_graph.md` with updates reflecting current implementation.

## Summary

Derived standard inputs let authors create virtual controls that blend upstream inputs before values reach animatable slots. They share the same binding tooling as animatable outputs, ensuring expressions, remaps, and operators behave consistently across the rig.

## Data Model

- `StandardRigInput`
  - `parentBinding`: Optional `AnimatableBinding` describing upstream slots (including `self`).
  - `derivedChildren`: Cached child IDs for quick traversal.
- `BindingTarget`: Abstracts remappable entities so animatable and parent bindings share logic.
- `inputBindings`: Controller map keyed by standard input ID storing parent binding defs.
- Persistence: `inputBindingDefinitions` (plus legacy `derivedStandardInputs`) persisted with schema versioning.

## Controller Behaviour

- CRUD helpers (`handleEnsureParentBinding`, `handleParentBindingInputChange`, etc.).
- Dependency map maintains child relationships; pruning occurs when parents disappear or become disabled.
- Cycle detection raises issues fed into `bindingIssues`, surfaced in UI alerts.
- Legacy saves load with empty parent maps and migrate seamlessly on save.

## Graph Builder Integration

- `buildRigGraphSpec` inserts parent aggregators before animatable bindings.
- Exports capture lineage in summaries, enabling downstream runtimes to reconstruct control provenance.
- Cycle issues flagged early to prevent invalid graph emission.

## Authoring Workflow

1. Select a standard input in the panel.
2. Use inline parent editor to add/remove upstream controls (slots).
3. Configure remaps and expressions; same UX as animatable bindings.
4. Optional: create derived child input from existing parent for branching control.
5. Review lineage chips and usage badges to understand flow.

## Troubleshooting

- **Cycle Detected:** UI displays warning with involved IDs. Break loop by removing the offending parent.
- **Missing Parent Input:** Controller highlights missing references after auto-input reconciliation; re-enable or recreate inputs.
- **Export Mismatch:** Rebuild graph and diff; ensure parent bindings saved before export.

## Testing

- Vitest suites cover remap migration, parent aggregation, cycle warnings.
- Upcoming: automation for UI workflows (see plan).

## Further Reading

- Proposal: `derived_input_hierarchy-proposal.md`
- Plan & Tracking: `derived_input_hierarchy-plan.md`
- Archived source: `archive/hierarchical_graph.md`, `archive/graph_extension.md`
