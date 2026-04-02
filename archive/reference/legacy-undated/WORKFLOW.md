# WORKFLOW.md (New Layout)

## CI Overview

- **`vizij-rs` CI** (Rust + WASM + npm publish)
  - Checks: `fmt`, `clippy`, `test`.
  - Build WASM: `wasm-pack build ... --out-dir npm/@vizij/animation-wasm/pkg`.
  - Build wrapper: `npm ci && npm run build` (in the wrapper dir).
  - Publish: `npm publish --access public --provenance` (needs `NPM_TOKEN`).

- **`vizij-web` CI** (Node only)
  - `actions/setup-node`
  - `npm ci`
  - `npm run build` (builds React packages/apps using the published `@vizij/animation-wasm`).

This decouples web builds from Rust toolchains and cross-repo checkouts.

---

## Release Flow

### NPM (from `vizij-rs`)
1) Bump versions in `npm/@vizij/animation-wasm/package.json`.
2) CI (or local):
   ```bash
   wasm-pack build crates/animation/vizij-animation-wasm --target web --out-dir npm/@vizij/animation-wasm/pkg --release
   cd npm/@vizij/animation-wasm
   npm ci && npm run build
   npm publish --access public --provenance
   ```

### Crates (from `vizij-rs`)
```bash
cargo publish -p vizij-animation-core
sleep 20
cargo publish -p bevy_vizij_animation
```
(Ensure plugin depends on core with **version + path**.)

### Website (from `vizij-web`)
```bash
npm ci
npm run build
# deploy dist output (Vite serves .wasm with correct MIME on common hosts)
```

---

## Local Cross-Repo Dev (via `npm link`)

**Build & link in `vizij-rs`:**
```bash
wasm-pack build crates/animation/vizij-animation-wasm --target web --out-dir npm/@vizij/animation-wasm/pkg --release
cd npm/@vizij/animation-wasm
npm i
npm run build
npm link
```

**Consume link in `vizij-web`:**
```bash
cd vizij-web
npm link @vizij/animation-wasm
npm i
npm run --workspace @vizij/animation-react build
npm run --workspace demo-animation dev
```

**Unlink when done:**
```bash
cd vizij-web && npm unlink @vizij/animation-wasm && npm i
cd ../vizij-rs/npm/@vizij/animation-wasm && npm unlink
```

---

## External Usage (Consumers)

- React:
  ```bash
  npm i @vizij/animation-react
  ```
- Vanilla web:
  ```bash
  npm i @vizij/animation-wasm
  ```
- Native Bevy:
  ```toml
  bevy_vizij_animation = "0.1"
  ```
