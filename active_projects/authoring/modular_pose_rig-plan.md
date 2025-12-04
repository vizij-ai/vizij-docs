# Modular Pose Rig · Plan & Tracking
<!-- tags: status=tracking; topics=authoring,state-management,refactor -->

> **Related documents:** [Proposal](modular_pose_rig-proposal.md) · [Reference](modular_pose_rig-reference.md) · [Project summary](summary.md)

## Objective & Scope
Refactor the monolithic `usePoseRigAuthoring` hook into a testable, Zustand-based store (`poseRig/store.ts`) with a dedicated service layer for IO and math operations. This will improve maintainability, performance, and testability of the pose rig authoring tools.

## Workstreams / Deliverables

### 1. Foundation (Store & Services)
- [ ] Create `poseRig/services/poseConfigService.ts` (IO/Normalization)
- [ ] Create `poseRig/services/poseGraphService.ts` (Graph building)
- [ ] Create `poseRig/services/poseSnapshotService.ts` (Capture logic)
- [ ] Implement `poseRig/store.ts` (Zustand store with actions)
- [ ] Add unit tests for Store and Services

### 2. Hook Rewrite & Migration
- [ ] Create `usePoseRigStore` hooks/selectors
- [ ] Refactor `usePoseRigAuthoring` to wrap the new store (Bridge phase)
- [ ] Migrate `PoseRigWorkbench` to use selectors
- [ ] Migrate `ImportExportWorkbench` to use selectors
- [ ] Migrate `useVizijExport` to use selectors

### 3. Cleanup & Polish
- [ ] Remove legacy `usePoseRigAuthoring` hook
- [ ] Remove redundant JSON clone helpers (post-store migration)
- [ ] Update `AGENTS.md` with new store patterns

## Timeline / Stages
- **Stage 1: Foundation**: Implement store and services. (Target: Immediate)
- **Stage 2: Migration**: Move components to new selectors.
- **Stage 3: Cleanup**: Delete legacy code.

## Immediate Next Steps
1. Create the service layer files.
2. Scaffold the Zustand store.

## Risks & Mitigations
- **Regression Risk**: Pose rig is complex. **Mitigation**: Keep the old hook as a wrapper initially to ensure existing consumers work without changes.
