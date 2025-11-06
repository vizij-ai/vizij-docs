# 2025-02 — Authoring Drivers Refresh

## Highlights
- Drivers generated from animatable features now ship with enable/disable toggles, hierarchical labels, and a “Show disabled” filter so authors can curate dense rigs without losing overrides.
- Graph exports embed `source` (`preset`, `auto`, `custom`) and `root` metadata for every driver; imports preserve the hierarchy and parent/child bindings even after renames.
- Auto-generated standard inputs, custom drivers, and derived controls share the same disable pipeline, ensuring bindings, parent slots, and cached defaults stay in sync.

## Author Workflow Notes
- **Toggling drivers** – Use the pill button in the Drivers panel header to disable a driver. The slider/number entry will grey out, bindings drop away, and the card is parked until re-enabled.
- **Reviewing disabled entries** – Toggle `Show disabled` in the toolbar to surface dormant drivers; each card lists its owning shape plus `feature • property` so you can triage quickly.
- **Re-enabling** – Turn a driver back on to restore cached parent bindings and rehydrate sliders. If the graph changed, new metadata keeps exports/imports aligned.

## QA & Automation
- New Vitest suites cover driver export metadata and the `useAnimatableTreeState` reducer. UI automation for toggles is still in the backlog; please add manual QA notes during validation.

## Testing Checklist
- `pnpm --filter vizij-authoring test`
- `pnpm --filter vizij-authoring typecheck`
- Manual smoke: disable/enable drivers across multiple groups, export/import graph, confirm metadata round-trips without duplicates.
