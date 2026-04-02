# Modularizing Pose Rig Authoring · Detailed Plan

## 1. Current State Snapshot

- **Hook**: `apps/vizij-authoring/src/poseRig/usePoseRigAuthoring.ts`
  - Owns all pose rig state (poses, neutral inputs, warnings, filenames, imported configs, summaries).
  - Mixes IO (reading JSON via `readJsonFile`), math helpers (clamping, snapshot normalization), and React state (useState/useEffect) in a single ~1k LOC file.
- **Consumers**:
  - `PoseRigProvider` (new) instantiates the hook and exposes it via context.
  - `PoseRigWorkbench`, `ImportExportWorkbench`, and export helpers destructure dozens of properties/actions.
- **Utilities**: `poseRig/utils.ts`, `poseRig/persistence.ts`, `poseRig/graphBuilder.ts` already contain reusable pieces but import cycles risk creeping in.

## 2. Target Architecture

1. **Pose Rig Store**
   - Create `apps/vizij-authoring/src/poseRig/store.ts` exporting `createPoseRigStore` (zustand-style) and selectors.
   - Store state: `neutralInputs`, `currentValues`, `poses`, `selectedPoseId`, `rigName`, `poseGraphSpec`, `poseGraphSummary`, `poseConfigDraft`, filenames, warnings, `ready` flag, `lastImportedConfig` metadata.
   - Actions mirror current hook methods (capture/apply neutral, create/duplicate/delete pose, update values, batch group operations, import pose graph/config, set filenames, reset state).

2. **Service Layer**
   - Break IO-heavy helpers into `poseRig/services`:
     - `poseConfigService.ts`: `readPoseConfig`, `writePoseConfig`, `normalizePoseConfig`.
     - `poseGraphService.ts`: wraps `parsePoseGraphSpec`, `buildPoseGraphSpec`, summary helpers.
     - `poseSnapshotService.ts`: capture + normalize from `@vizij/render` input values.
   - These services accept plain data + callbacks, returning pure results so store actions stay lean.

### 2.1 Detailed Interface Specifications

**Store State (`PoseRigState`)**
```typescript
interface PoseRigState {
  // Core Data
  rigName: string;
  neutralInputs: Record<string, number>; // Baseline values
  currentValues: Record<string, number>; // Live values from rig
  poses: Record<string, PoseDefinition>; // The authored poses
  
  // UI State
  selectedPoseId: string | null;
  activePoseId: string | null; // For "preview" mode
  
  // Graph/Config State
  poseGraphSpec: GraphSpec | null;
  poseGraphSummary: GraphSummary | null;
  poseConfigDraft: PoseConfig | null; // The config being edited
  lastImportedConfig: PoseConfig | null; // For diffing/dirty checks
  
  // Metadata
  filenames: {
    config: string;
    graph: string;
  };
  warnings: string[];
  isReady: boolean;
}
```

**Service Interfaces**

*   **`PoseConfigService`**
    *   `normalize(config: unknown): PoseConfig`
    *   `serialize(config: PoseConfig): string`
    *   `diff(a: PoseConfig, b: PoseConfig): boolean`

*   **`PoseGraphService`**
    *   `buildSpec(config: PoseConfig): GraphSpec`
    *   `generateSummary(spec: GraphSpec): GraphSummary`
    *   `validate(spec: GraphSpec): string[]` (returns warnings)

*   **`PoseSnapshotService`**
    *   `capture(inputs: Record<string, number>, neutral: Record<string, number>): PoseDefinition`
    *   `apply(pose: PoseDefinition, current: Record<string, number>): Record<string, number>`

3. **Hook Rewrite**
   - Replace `usePoseRigAuthoring` with `usePoseRigStore` + convenience selectors (e.g., `usePoseRigState(selector)`), backed by the new store.
   - `PoseRigProvider` becomes a simple store provider (similar to existing graph/binding stores).

4. **Consumer Migration**
   - Update `PoseRigWorkbench` to select only the slices it needs (poses, selection, capture/apply actions).
   - Update `ImportExportWorkbench` + export hooks to use selectors for filenames/specs/warnings instead of destructuring the entire hook.
   - Ensure `useVizijExport` receives the minimal pose export contract (pose graph spec/file names + import handler) via the store selectors.

5. **Testing**
   - Add reducer/store tests covering: pose CRUD, neutral capture, value clamping, pose graph import warnings, config import, filename auto-updates.
   - Service-layer tests for pose config + pose graph helpers with representative fixtures.

6. **Migration Strategy**
   - Step 1: Implement store + provider, keep old hook as thin wrapper to ease rollout.
   - Step 2: Migrate consumers to the new store selectors incrementally.
   - Step 3: Remove the old hook once no direct references remain.
   - Step 4: Delete redundant JSON clone helpers once the store uses the new cloning API (ties back to replace_json_cloning_plan).

7. **Documentation**
   - Update `audit.md` with the new store description after migration.
   - Extend `apps/vizij-authoring/AGENTS.md` with guidance on using the pose-rig store and selectors.

This plan keeps IO/math logic isolated, mirrors the existing graph/binding store pattern, and makes pose-rig behavior testable without React. Let me know if you’d like adjustments before implementation. EOF
