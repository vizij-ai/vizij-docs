# vizij-web npm Readiness Plan

## Status

🚀 All action items below have been implemented in this branch (packages now share consistent builds/metadata, peer dependency contracts, Changesets-driven releases, and render-size guards).

## Observations

- Packages use a mix of build tooling (`tsup` for `@vizij/utils` and `@vizij/render`, raw `tsc` elsewhere), so emitted module formats and metadata are inconsistent.
- Only some packages expose modern `exports` maps; others rely on legacy `main`/`module` fields, which can break Node 18+ resolution and forbid tree-shaking guarantees.
- React-facing packages do not all declare `peerDependencies` (`@vizij/render` ships React components but only lists `tailwindcss` as a peer, while `@vizij/utils` ships React-free utilities yet depends on `react` directly).
- Version numbers differ widely (`@vizij/utils` and `@vizij/render` remain at `0.0.0`), which makes tag-driven releases brittle and complicates semver expectations for consumers.
- There is no shared changelog or automated versioning workflow, so guidance for consumers on breaking changes or addition of new APIs is thin.

## Suggested Improvements

1. **Standardise packaging metadata**
   - Give every package an `exports` map that mirrors the pattern already used in `@vizij/node-graph-react`/`@vizij/orchestrator-react`; this locks down public entrypoints and removes reliance on legacy resolution.
   - Add `sideEffects: false` where applicable (e.g., `@vizij/animation-react`, `@vizij/config`, `@vizij/rig`) to help bundlers perform tree-shaking.
   - Ensure `files` only ships `dist/` (and `README.md` when needed) so consumers are not exposed to uncompiled sources unless explicitly required.

2. **Align dependency contracts**
   - Promote `react` (and `react-dom` where needed) to `peerDependencies` for every React package, including `@vizij/render`, to prevent duplicate React copies downstream.
   - Remove the orphaned `react` dependency from `@vizij/utils`; if any React helpers are added later, export them from a dedicated entrypoint with an explicit peer dependency.
   - Review `three`, `@react-three/fiber`, and `@react-three/drei` usage in `@vizij/render` --mark them as peers as well so host apps can align versions and avoid bundle bloat.

3. **Unify build artefacts**
   - Move the `tsc`-compiled packages (`@vizij/animation-react`, `@vizij/node-graph-react`, `@vizij/orchestrator-react`, `@vizij/config`, `@vizij/rig`) onto `tsup` (or another bundler) to emit dual ESM/CJS bundles plus `.d.ts` files. This mirrors `@vizij/utils`/`@vizij/render` and produces smaller, tree-shakeable outputs.
   - (Not needed unless switching to tsc failes) If retaining `tsc`, ensure `tsconfig` targets modern ESM and emits `.d.ts` + `.d.ts.map` files, and set `moduleResolution` to `bundler` to match Node 18 expectations.

4. **Versioning and release hygiene**
   - Adopt `changesets` (or similar) so version bumps and changelog entries are generated per PR, making the new tag-triggered workflow safer.
   - Normalise versions across related packages (e.g., move `@vizij/utils` and `@vizij/render` off `0.0.0`) and define dependency ranges that match the published semver.
   - Introduce a shared `CHANGELOG.md` template (at least per package) so consumers can audit behavioural changes alongside the README updates.

5. **Consumer-facing documentation**
   - Augment each package README with installation matrices (`npm`, `pnpm`, `yarn`), peer dependency requirements, and minimal code samples (some packages already have this; expand to the rest).

6. **DX guards before publish**
   - Add `prepack`/`prepublishOnly` scripts that run `pnpm --filter "<pkg>"... run build && pnpm --filter "<pkg>" run test` so manual publishes cannot skip the build.
   - Wire bundle size checks (e.g., `size-limit`) for the render package to monitor regressions that would impact downstream consumers.
   - copy scripts from vizij-rs for building dry run for publishing.

Implementing the above will leave the packages with predictable entrypoints, explicit consumer contracts, and automated release notes—making the new tag-driven publish flow safer and more transparent for npm users.
