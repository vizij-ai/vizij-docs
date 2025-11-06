# Derived Input Hierarchy – Plan & Tracking
<!-- tags: status=completed-with-follow-ups; topics=graph-ir,ui-ux,workflow,automation-testing,documentation -->

> **Related documents:** [Proposal](derived_input_hierarchy-proposal.md) · [Reference](derived_input_hierarchy-reference.md) · [Project summary](summary.md)

## Objective & Scope

Track delivery of derived standard input capabilities, including parent bindings, UI integration, and export lineage. Content sourced from `archive/graph_extension.md` and relevant sections of `archive/stabilise_core_inputs_plan.md`.

## Workstreams & Status

### 1. Binding & Data Model Foundations

- ✅ `StandardRigInput` extended with `parentBinding` and `derivedChildren`.
- ✅ Controller (`useRigController`) manages parent binding CRUD, dependency graph, and pruning when inputs disappear.
- ✅ Persistence stores `inputBindingDefinitions` with legacy mirrors; migrations transparent.
- ⚠️ Need additional regression tests for nested parent chains and migration edge cases.

### 2. Graph Builder & Validation

- ✅ `buildRigGraphSpec` materialises parent aggregators, records lineage, and raises cycle diagnostics.
- ✅ Summaries include both parent and child slots for exports/imports.
- 🚧 Add parity tests for vector/time-based parent bindings once IR extensions land (dependency: Graph IR plan).

### 3. Authoring UI Integration

- ✅ `BindingEditor` reused for parent bindings (inline editors, slot management).
- ✅ Standard Inputs panel surfaces lineage, usage chips, and child creation workflow.
- 🚧 UI polish (badges, tooltips, layout refinements) tracked with design.
- ⏳ Accessibility review outstanding.

### 4. Documentation & Enablement

- ⚠️ Need narrative docs + screenshots for derived control workflows.
- ☐ Update internal wiki and AGENTS with troubleshooting tips (cycles, missing parents).
- ☐ Produce quickstart video or animated walkthrough (optional stretch).

### 5. Automation & QA

- 🚧 Expand Vitest coverage for cycle detection, dependency pruning, and migration scenarios.
- ⏳ Add RTL smoke test covering create → edit → delete for parent bindings.
- ☐ Integrate plan into CI dashboards (tracking pipeline).

## Timeline / Stages

1. **Stage 1 – Data Model & Controller** *(Complete)*
2. **Stage 2 – Graph Builder & Exports** *(Complete)*
3. **Stage 3 – UI Integration** *(Complete except polish)*
4. **Stage 4 – Docs & Automation** *(In progress)*

## Immediate Next Steps

1. 🚧 Finalise UI polish tasks with design sign-off.
2. ⚠️ Draft derived input documentation (owner: Tech Writing).
3. ⏳ Implement RTL smoke tests once UI stabilises.

## Risks & Mitigations

- **Cycle Handling UX** – Alerts may confuse authors; include contextual help and remediation steps in docs.
- **Pending IR Enhancements** – Vector/time node support deferred to Graph IR pillar; coordinate timelines to avoid blocking advanced parents.

## Decision / Change Log

- Parent aggregators reuse `AnimatableBinding` schema (2024‑07‑12).
- Cycle detection moved to controller for earlier feedback (2024‑08‑30).

## Validation Checklist

- `pnpm --filter vizij-authoring test derived-input`
- Manual QA: create nested parent chains, verify export/import round-trip, ensure cycle warnings trigger.
