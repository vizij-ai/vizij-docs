# npm package recommendations

## Goal
Eliminate Vite’s “node:\* externalized” warnings by shipping an updated `@vizij/animation-wasm` that never exposes hard-coded Node imports, then consuming that release inside Vizij web apps.

## Planned changes in `vizij-rs`
- **Confirm source parity**: Ensure `npm/@vizij/animation-wasm/src/index.ts` still delegates all Node-specific behavior to `@vizij/wasm-loader` so the compiled `dist/src/index.js` only contains the `/* @vite-ignore */` indirection (no literal `node:` specifiers).
- **Rebuild published artefacts**: Run the package build (`pnpm --filter @vizij/animation-wasm build`) so `dist/` matches the current TypeScript source, commit the regenerated output, and verify tests if available.
- **Bump package metadata**: Increment the package version (e.g. to `0.3.1`) and update any workspace manifests or changelog entries that refer to the old version so the release is publishable.
- **Publish to npm**: After validating that the generated bundle no longer contains direct `node:` imports, publish the new version to npm and tag the release if that’s part of the usual process.

## Planned changes in `vizij-web`
- **Update dependency pins**: Replace all references to `@vizij/animation-wasm@^0.3.0` with the newly published version across workspace packages (e.g. `packages/@vizij/animation-react/package.json`) and refresh `pnpm-lock.yaml`.
- **Optional tweaks**: Once the updated package is installed, re-run a representative `vite build` to confirm the warnings disappear. If the warning persists, check for global pnpm overrides or cached links and fall back to `pnpm install` without the `link` overrides before re-testing.
- **Docs & scripts**: If README instructions or helper scripts mention the exact version (or suggest relinking the npm package), update those references so they point at the fixed release.

## Why this is worth doing
- **Clean browser builds**: The current warnings appear on every production build, obscuring genuine issues. Eliminating them keeps CI logs and local builds trustworthy.
- **Safer bundling defaults**: Keeping Node-only logic behind indirect `import()` calls ensures bundlers never attempt to include unavailable modules when targeting browsers.
- **Shared loader simplification**: Centralizing the file-URL handling in `@vizij/wasm-loader` reduces duplication across the wasm packages and makes future tweaks (e.g. supporting other toolchains) easier.

## Verification checklist
- Run `pnpm --filter demo-animation build` (and another app that previously warned) inside `vizij-web` to confirm the warning is gone.
- Optionally run the TypeScript tests or smoke tests for `@vizij/animation-wasm` to ensure the new loader path still resolves file URLs correctly in Node.
- After publishing, install the updated package in a clean clone to verify the dist artifacts match expectations and no stale `node:` imports reappear.
