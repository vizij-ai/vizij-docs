# CI & Publishing Guide

## What’s the big picture?

* **`vizij-rs`** (Rust workspace) is the **producer**:

  * Lints/tests all Rust crates.
  * Builds the WASM artifact via `wasm-pack`.
  * Builds the npm wrapper **`@vizij/animation-wasm`**.
  * Publishes the npm package (and optionally the Rust crates).

* **`vizij-web`** (npm workspaces) is the **consumer**:

  * Pure Node build (no Rust toolchain).
  * Depends on `@vizij/animation-wasm` **from npm** in CI.
  * Builds the React package(s) and the demo/website.

This separation keeps CI fast, secure, and predictable. Developers can still use `npm link` locally for a tight Rust→WASM→Web loop, but CI never relies on links or cross-repo checkouts.

---

## Workflows at a glance

### In `vizij-rs`

1. **`ci.yml`** – runs on `push` and `pull_request`

   * **rust** job: `cargo fmt` (check), `clippy` (warnings as errors), `test` (all targets/features).
   * **wasm** job: installs `wasm-pack`, runs `scripts/build-wasm.mjs` to put `pkg/` in `npm/@vizij/animation-wasm`, then builds the wrapper (`npm ci && npm run build`) and does `npm pack --dry-run` to verify publish contents.

2. **`publish-npm.yml`** – runs on tag `npm-v*.*.*` or `workflow_dispatch`

   * Builds WASM → builds wrapper → `npm publish --access public --provenance` from `vizij-rs/npm/@vizij/animation-wasm`.
   * Uses `id-token: write` for npm **provenance** (supply-chain integrity).
   * Requires repo/org secret: **`NPM_TOKEN`**.

3. **`publish-crates.yml`** (optional) – `workflow_dispatch`

   * Publishes Rust crates **in dependency order**:

     1. `vizij-animation-core`
     2. `bevy_vizij_animation` (must depend on core with **version + path**).
   * Requires secret: **`CARGO_REGISTRY_TOKEN`**.

### In `vizij-web`

1. **`ci.yml`** – runs on `push` and `pull_request`

   * Node-only build: `npm ci`, build React package(s), build demo/website.
   * Assumes `package.json` depends on **released** `@vizij/animation-wasm` (no `npm link` in CI).

---

## Why this design?

* **Reproducibility:** CI always builds from published npm versions, not local links or cross-repo state.
* **Performance:** the web pipeline never installs Rust or runs `wasm-pack`.
* **Security:** npm publish uses **attestations** (`--provenance`) and CI has least-privilege secrets.
* **Clear ownership:** Rust repos own WASM artifacts; web repos consume them.

---

## Triggers & versioning

* Cut an npm release by bumping the wrapper’s `version` and pushing a tag like **`npm-v0.1.4`** to `vizij-rs`. That triggers `publish-npm.yml`.
* Update `vizij-web` to consume the new version (e.g., `"@vizij/animation-wasm": "^0.1.4"`) and open a PR; `vizij-web` CI will build and (if configured) deploy.
* For **canary** builds, you can publish from `vizij-rs` with `npm publish --tag canary` (version like `0.2.0-canary.<sha>`). In `vizij-web`, set the dep to `"canary"` to test.

---

## What’s in each job (and why)

### `vizij-rs/ci.yml`

* **Checkout** + **Rust toolchain**: get the workspace and a stable toolchain.
* **Cache**: cache cargo registry + git + `target/` to speed up lint/test.
* **`cargo fmt`, `clippy`, `test`**: enforce code style, keep warnings out, and protect behavior.
* **`wasm-pack` step**: compile the wasm-bindgen crate to `pkg/` where the npm wrapper expects it.
* **Wrapper build**: compiles the TypeScript entry to `dist/` and verifies the npm tarball with `npm pack --dry-run`.

### `vizij-rs/publish-npm.yml`

* **Provenance**: requires `id-token: write` and sets `--provenance` so consumers can verify the build origin.
* **Single-source artifacts**: build `pkg/` and `dist/` in CI; never commit them to git. The wrapper’s `package.json` must include:

  ```json
  "files": ["dist", "pkg", "README.md"]
  ```

  so the tarball contains the compiled JS and the WASM.

### `vizij-web/ci.yml`

* **Node only**: uses `actions/setup-node` with caching against `package-lock.json`.
* **Build order**: builds React package(s) first, then the app(s).
* **No wasm**: it pulls `@vizij/animation-wasm` from npm like any consumer app would.

---

## Secrets & permissions

* **`vizij-rs`**

  * `NPM_TOKEN`: npm automation token (2FA disabled for publish).
  * `CARGO_REGISTRY_TOKEN`: crates.io API token (only if publishing crates).
  * `permissions` for `publish-npm.yml`:

    ```yaml
    permissions:
      contents: read
      id-token: write
    ```

    (needed for npm provenance)
* **`vizij-web`**

  * Usually **no secrets** needed unless you deploy from CI (then add your host’s token).

---

## Caching strategy

* **Rust**: cache cargo registry, cargo git, and `target/`. Keyed by hash of all `Cargo.lock` files.
* **Node**: use `actions/setup-node` cache keyed by the **root** `package-lock.json` of the repo being built.

This keeps rebuilds fast but deterministic. If you change cache-critical files, CI will miss the cache automatically.

---

## Cutting a release (step-by-step)

### NPM (WASM package)

1. In `vizij-rs/npm/@vizij/animation-wasm/package.json`, bump `"version"`.
2. Commit and **tag**:

   ```bash
   git commit -am "chore: release @vizij/animation-wasm v0.1.4"
   git tag npm-v0.1.4
   git push && git push --tags
   ```
3. `publish-npm.yml` runs, builds `pkg/` & `dist/`, publishes with provenance.

### Consuming the new version in `vizij-web`

1. In `vizij-web/packages/@vizij/animation-react/package.json`, update:

   ```json
   "@vizij/animation-wasm": "^0.1.4"
   ```
2. Open a PR; `vizij-web` CI builds and (if configured) deploys.

### Crates (optional)

1. Bump versions in `vizij-rs` crates.
2. Run `publish-crates` workflow (or the `cargo publish` commands locally).

---

## How this differs from local dev

* **Local dev**: you can `npm link @vizij/animation-wasm` into `vizij-web` and use the Vite dev server with our watch config.
* **CI**: never uses links. It always consumes the **published** npm package so builds are reproducible and don’t depend on your filesystem.

---

## Common questions

**Q: Why not build the WASM in `vizij-web` CI?**
A: That would require Rust + `wasm-pack` and access to `vizij-rs` sources, coupling the repos and slowing web CI. Publishing the WASM to npm gives us a clean, versioned boundary.

**Q: Where do the `.wasm` and glue JS live in CI?**
A: They’re generated into `vizij-rs/npm/@vizij/animation-wasm/pkg/`, then included in the npm tarball. Consumers import from `@vizij/animation-wasm`, and bundlers load the `.wasm` file from that package at runtime.

**Q: How do we ensure supply-chain integrity?**
A: npm **provenance** is enabled by default in our publish workflow (OIDC + `--provenance`). You could also pin exact versions in `vizij-web` for extra safety when needed.

---

## Failure modes & how to diagnose

* **Publish failed: 403 unauthorized**
  → Check `NPM_TOKEN` scope, repo permissions, and that `id-token: write` is set.

* **Published package missing `pkg/` or `dist/`**
  → Ensure wrapper `package.json` includes `"files": ["dist","pkg","README.md"]` and that the build steps ran (see logs).

* **`vizij-web` cannot resolve `@vizij/animation-wasm`**
  → Make sure you bumped the dependency version and ran `npm ci`. In CI, check the `npm ci` logs for download of the expected version.

* **Crate publish fails for dependency resolution**
  → Verify `bevy_vizij_animation` depends on `vizij-animation-core` with **both** `version` and `path`. crates.io needs a version; Cargo uses the path locally.

---

## Future enhancements (nice to have)

* **Changesets** in `vizij-rs` to manage npm versioning & changelogs via PRs.
* **cargo-release** to automate Rust crate version bumps, tagging, and publishing order.
* **Reusable workflows** in an org `.github` repo (called from each project) to DRY up CI logic.
* **Canary pipeline** that auto-publishes `@vizij/animation-wasm@canary` on every merge to `main` and runs a `vizij-web` integration build against it.
