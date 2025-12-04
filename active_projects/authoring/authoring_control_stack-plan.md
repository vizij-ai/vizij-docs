# Authoring Control Stack – Plan & Tracking
<!-- tags: status=completed-with-follow-ups; topics=ui-ux,workflow,persistence,automation-testing,documentation -->

> **Related documents:** [Proposal](authoring_control_stack-proposal.md) · [Reference](authoring_control_stack-reference.md) · [Project summary](summary.md)

## Objective & Scope

Deliver the “Stabilise Core Inputs & UI” milestone by auto-generating standard inputs, refreshing the Standard Inputs panel, and ensuring persistence/export parity. Content migrated from `archive/stabilise_core_inputs_plan.md`.

## Workstreams & Status

### 1. Auto-Generated Standard Inputs

- ✅ Catalogue emits fully qualified entries with animatable IDs, constraints, and metadata. *(archive/stabilise_core_inputs_plan.md §1.1)*
- ✅ Auto-input blueprint builder maps catalogue entries to deterministic `/Shape/feature/property` paths. *(see `autoInputs.ts`)*
- ✅ Controller tracks `{source: "auto"|"custom"}`, removes deprecated disabled flag, and copies overrides forward.
- ✅ Reconciliation handles scene changes (add/prune/override merge) and triggers migration alerts when IDs normalise.
- ✅ Persistence/export schema updated; legacy arrays migrate transparently with mismatch warnings.

### 2. Standard Inputs Panel Refresh

- ✅ Replaced add/delete UX with enable/disable toggles and disabled-state styling.
- ✅ Display hierarchical metadata (shape badge + feature/property).
- ✅ Added root filter dropdown with persisted selection state.
- ✅ Wire refined empty-state messaging and tooltip polish. *(See `vizij-web/apps/vizij-authoring/src/components/animatable-panel/StandardInputsSection.tsx:781-2096` for the new copy, badges, and helper text.)*
- 🚧 Document UX patterns and screenshot updates for contributor guide.

### 3. Nested Feature Tree Layout

- ✅ Tree data shape extended to nested nodes with animatable metadata.
- ✅ Reducer-driven collapse state persisted to local storage.
- ✅ Control panels reordered (metadata → properties → mapping → slider preview).
- ✅ Styling tightened for dense layout.

### 4. Rig Mapping Filter & Preview

- ✅ Filter state plumbed through controller and preview components.
- ✅ Derived selectors respect active roots; usage chips update live.
- ✅ Empty-state messaging refinement shipped alongside the mapping preview (`StandardInputsSection.tsx:1450-1504`).

### 5. QA & Docs

- ✅ Expand Vitest coverage for auto-input reconciliation edge cases (rename chains, duplicate slugs). *(Covered by `rig/legacyMigration.test.ts` + `rig/state.test.ts`.)*
- ⏳ Add RTL smoke tests for toggle workflow and filter interactions.
- ☐ Capture annotated screenshots and update authoring README/AGENTS.

## Timeline & Stages

1. **Stage 1 – Foundations** *(Complete)*: Feature catalogue, auto-input engine, persistence migrations.
2. **Stage 2 – UI Refresh** *(Complete)*: Toggled panel, hierarchical metadata, filter dropdown.
3. **Stage 3 – Tree & Styling** *(Complete)*: Nested layout, reducer state, styling overhaul.
4. **Stage 4 – QA & Docs** *(In Progress)*: Automation, screenshots, polish.

## Immediate Next Steps

1. ⏳ Draft RTL smoke tests for enable/disable + filter workflows (owner: QA).
2. 🚧 Capture annotated Standard Inputs screenshots and thread them into the README/AGENTS refresh (owner: Design).
3. ☐ Publish the contributor doc update that explains the new empty states, badges, and toggle UX (owner: Docs).

## Risks & Mitigations

- **Automation gap** – Without RTL coverage, regressions may slip. *Mitigation:* prioritise smoke tests once toggle UX finalised.
- **Migration alert fatigue** – Frequent normalisation prompts could overwhelm authors. *Mitigation:* throttle alerts per session; document acceptance workflow in reference guide.

## Decision & Change Log

- Normalisation alerts raised via modal instead of toast (2024‑10‑18).
- Root filters persist per face ID to match author expectations (2024‑10‑22).

## Validation Checklist

- `pnpm --filter vizij-authoring test`
- `pnpm --filter vizij-authoring typecheck`
- Manual run-through: load legacy rig → verify migrations → toggle inputs → export/import diff.
