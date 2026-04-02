# Release Guide

This document walks through the end-to-end process for shipping a new release of the Vizij Rust workspace, with a focus on the
new orchestrator stack and the shared `@vizij/value-json` package. Follow the steps in order to avoid publishing artifacts that
depend on stale versions.

---

## 1. Preparation

1. **Create a release branch** from `main` and give it a descriptive name (e.g., `release/orchestrator-0.1.1`).
2. **Decide on version bumps** for every artifact you plan to publish:
   - Rust crates (`Cargo.toml`)
   - npm packages under `npm/@vizij/*`
   - Companion packages in `vizij-web/packages/**` that will be republished
3. **Update changelogs/readmes** as needed so consumers know what changed.

## 2. Bump Versions

1. Rust crates:
   - Ensure every crate that will publish has its `version` updated.
   - Update dependent crates so their `Cargo.toml` entries point at the new versions (keep both `version =` and `path =` in place).
2. npm packages (`vizij-rs`):
   - Bump the `version` field in the relevant `npm/@vizij/*/package.json` files.
   - Update `peerDependencies`/`dependencies` to the new versions, especially `@vizij/value-json`, `@vizij/wasm-loader`, and the
     new `@vizij/orchestrator-wasm`.
3. npm packages (`vizij-web`):
   - Align each package’s `package.json` dependency ranges with the new versions you intend to publish.
4. Regenerate lockfiles if required (`pnpm install`, `npm install`) so version bumps are captured consistently.

## 3. Sanity Checks

1. Run the consolidated format + lint pass:
   ```bash
   pnpm run format
   ```
2. Run the full project check (Rust first, then npm):
   ```bash
   pnpm run check
   ```
3. Confirm the orchestrator stack builds cleanly:
   ```bash
   pnpm run build:wasm:orchestrator
   pnpm --filter @vizij/orchestrator-wasm run test
   ```

Fix any failures before continuing.

## 4. Dry Run the Release

Use the helper script to simulate publishing every artifact. This covers:
  * Rust crates (animation, graph, orchestrator, Bevy adapters, wasm bindings)
  * npm packages in `vizij-rs` (`@vizij/value-json`, `@vizij/wasm-loader`, and all wasm wrappers)
  * npm packages in `vizij-web` (React bindings, config, rig, shared utilities)

```bash
./scripts/dry-run-release.sh
```

Ensure the script exits successfully. If a step fails, fix the underlying issue, re-run the checks above, and repeat the dry run.

## 5. Publish Rust Crates

Publish crates in dependency order (core first, then wasm adapters, then Bevy crates).

```bash
cargo publish -p vizij-animation-core
cargo publish -p vizij-graph-core
cargo publish -p vizij-orchestrator-wasm
cargo publish -p vizij-animation-wasm
cargo publish -p vizij-graph-wasm
cargo publish -p bevy_vizij_animation
cargo publish -p bevy_vizij_graph
```

Notes:
- `vizij-orchestrator-core` is currently marked `publish = false`; only publish the wasm surface (`vizij-orchestrator-wasm`).
- Wait for each publish to complete (and the crate to appear on crates.io) before moving to the next dependency.

## 6. Publish npm Packages (vizij-rs)

For each package under `npm/@vizij`, run:

```bash
cd npm/@vizij/<package>
npm run build
npm publish --access public
cd ../../..
```

Recommended order:
1. `value-json`
2. `wasm-loader`
3. `animation-wasm`
4. `node-graph-wasm`
5. `orchestrator-wasm`

Confirm `npm publish` succeeds and that the expected version appears on npmjs.com.

## 7. Publish Companion Packages (vizij-web)

From the `vizij-web` repo:

1. Install dependencies (`pnpm install`).
2. Build and publish packages that depend on the orchestrator/value-json updates, e.g.:
   ```bash
   pnpm run --filter @vizij/animation-react build
   pnpm publish --filter @vizij/animation-react --access public
   # Repeat for the remaining workspaces that are part of the release:
   # @vizij/node-graph-react, @vizij/orchestrator-react, @vizij/config, @vizij/rig,
   # @vizij/render, @vizij/utils
   ```
3. Ensure every package is published in ascending dependency order (shared utilities first, React adapters last).

## 8. Validation

1. Pull fresh copies of the crates and npm packages in a clean environment.
2. Confirm the orchestrator demos and other integration tests still work (e.g., via `vizij-web` demo apps).
3. Tag the release commits in both repositories once everything looks good.

## 9. Wrap Up

1. Merge the release branch into `main`.
2. Push tags and create GitHub releases with summaries of the changes.
3. Notify stakeholders and update any downstream documentation or changelog entries.

---

Following this playbook ensures orchestrator and `@vizij/value-json` releases stay in lockstep with the rest of the Vizij stack.
