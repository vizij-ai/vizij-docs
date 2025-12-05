# Testing Strategy & Infrastructure – Plan & Tracking
<!-- tags: status=planning; topics=testing,qa,automation,infrastructure -->

> **Related documents:** [Project summary](../summary.md)

## Objective & Scope

Establish a robust, multi-layer testing strategy for the Vizij ecosystem. This project centralizes testing initiatives that cross-cut feature pillars, ensuring consistent quality, coverage, and tooling. It specifically targets the introduction of React Testing Library (RTL) for UI smoke tests and the expansion of integration tests for critical workflows.

## Plan

The steps below are intended to be executable by a junior developer in order, with clear acceptance criteria.

### 1. Set up testing dependencies and configuration for `vizij-authoring`

1.1 Add React Testing Library dependencies to `vizij-authoring`:
- [ ] Update `vizij-web/apps/vizij-authoring/package.json` to include:
    - `@testing-library/react` as a dev dependency (align the version with other workspaces).
    - `@testing-library/user-event` as a dev dependency (same major version used elsewhere in `vizij-web`).
- [ ] Run `pnpm install` at the `vizij-web` root to update the lockfile.

1.2 Ensure Vitest is configured to run React tests:
- [ ] Confirm that `vizij-web/apps/vizij-authoring/vite.config.ts` or shared Vite config enables JSX/TSX testing with Vitest.
- [ ] If necessary, add a basic `vitest.config` section or extend the existing Vite config so that `pnpm --filter vizij-authoring test` runs React tests in `src/**/*.test.tsx`.

Acceptance criteria:
- Running `pnpm --filter vizij-authoring test` from the `vizij-web` root executes Vitest and recognizes a dummy React test under `apps/vizij-authoring/src`.

### 2. Create shared React Testing Library utilities for `vizij-authoring`

2.1 Create a test utilities module:
- [ ] Add `apps/vizij-authoring/src/test/test-utils.tsx` (or similar path) that exports:
    - A `renderWithProviders` helper wrapping components in the same providers used by the app (e.g., `RigControllerProvider`, any theme/layout providers).
    - Any common mock data or fixture loaders needed for typical pages/panels.
- [ ] Import provider implementations from existing app code (e.g., `src/state/RigControllerProvider`).

2.2 Document the helper:
- [ ] Add a short doc comment at the top of `test-utils.tsx` explaining:
    - When to use `renderWithProviders`.
    - How to pass initial state or props when needed.

Acceptance criteria:
- A simple test using `renderWithProviders` compiles and can render a trivial component without runtime errors.

### 3. Add UI smoke tests for key panels in `vizij-authoring`

3.1 Standard Inputs Panel smoke tests:
- [ ] Locate the Standard Inputs panel component (see `vizij-web/apps/vizij-authoring/docs/ui-component-inventory.md` for file paths).
- [ ] Add a test file (e.g., `StandardInputsPanel.test.tsx`) that:
    - Renders the panel using `renderWithProviders` with a small set of mock standard inputs.
    - Verifies basic behaviors:
        - Enabling/disabling inputs through the UI.
        - Filtering/searching inputs.
        - Display of hierarchical badges and empty states when no inputs match.

3.2 Derived Inputs panel smoke tests:
- [ ] Locate the Derived Inputs panel component.
- [ ] Add tests that:
    - Create a small mock graph where one input depends on another.
    - Verify that creating and deleting a parent binding updates the UI correctly.
    - Verify that cycle detection warnings appear when a cycle is introduced.

3.3 Driver Panel smoke tests:
- [ ] Use `src/components/inspector/DriverPanel.tsx` as the subject under test.
- [ ] Write tests (e.g., `DriverPanel.test.tsx`) that:
    - Render a mock `SceneObjectNode` with features and bindings.
    - Verify:
        - "Add Driver" workflow (e.g., creating a new custom standard input) using dialogs.
        - "Show Hidden"/"Hide" behavior for drivers.
        - Collapse/expand behavior of driver groups.

Acceptance criteria:
- All three panel test files compile and pass under `pnpm --filter vizij-authoring test`.
- Tests exercise real UI flows (not just shallow rendering) and fail meaningfully if core behaviors regress.

### 4. Add integration and regression tests for import/export and IR parity

4.1 Import/Export Round-Trip harness:
- [ ] Identify or create a minimal GLB + bundle fixture suitable for round-trip testing (import → export).
- [ ] Add a test file under `apps/vizij-authoring/src/__tests__/` (e.g., `importExportRoundTrip.test.ts`) that:
    - Uses existing hooks/utilities (`useVizijExport`, import helpers) to:
        - Load a fixture.
        - Perform an import into the app’s state.
        - Export back to Vizij bundle/graph formats.
    - Compares key parts of the result:
        - Graph IDs.
        - Standard input IDs and bindings.
        - Any known invariants around normalization.

4.2 Graph IR parity tests:
- [ ] Locate the existing IR parity test suite (e.g., `irParity.test.ts` in `vizij-web`).
- [ ] Add or extend tests so that new node types and graph features are covered as they are introduced.

Acceptance criteria:
- The round-trip test passes for at least one representative asset and fails if IDs/normalization drift unexpectedly.
- IR parity tests cover all currently supported node types and are easy to extend for new nodes.

### 5. Integrate new tests with CI and developer workflow

5.1 Wire tests into local scripts:
- [ ] Ensure `pnpm --filter vizij-authoring test` is run by at least one of:
    - The existing `pnpm run validate` path.
    - A dedicated script used by CI (e.g., `test:apps`).

5.2 Confirm CI coverage:
- [ ] Verify that the GitHub Actions workflow(s) for `vizij-web` execute the new tests on PRs.
- [ ] Update documentation (e.g., `vizij-web/README.md` or a short note in `vizij_docs`) to mention the new tests and how to run them locally.

Acceptance criteria:
- A PR that breaks one of the new tests is caught in CI without additional configuration.
- Developers have a documented way to run the authoring tests locally.

### Acceptance Criteria (Overall)

- A developer can run `pnpm --filter vizij-authoring test` and see:
  - At least one test suite for each of: Standard Inputs Panel, Derived Inputs, Driver Panel.
  - At least one integration test for import/export round-tripping.
- The tests are stable (no flaky behavior under repeated runs) and reasonably fast.
- CI runs the tests automatically, and failures are clearly reported.
