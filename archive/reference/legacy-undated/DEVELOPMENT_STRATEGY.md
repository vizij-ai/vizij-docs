# DEVELOPMENT_STRATEGY.md (New Layout)

## Goals
- Build WASM where the Rust lives (`vizij-rs`).
- Publish npm packages from `vizij-rs` CI.
- Consume those packages in `vizij-web`, keeping web CI Node-only.
- During local dev across both repos, use **`npm link`** to wire them together.

---

## Local Dev — Working on the Animation Player (Rust → Web)

### 1) In `vizij-rs`: iterate & test
```bash
cd vizij-rs
cargo fmt --all
cargo clippy --all-targets -- -D warnings
cargo test --all-features --all-targets
```

### 2) Build the WASM into the wrapper
```bash
# From vizij-rs root (adjust paths if you put a helper script somewhere):
wasm-pack build crates/animation/vizij-animation-wasm   --target web   --out-dir npm/@vizij/animation-wasm/pkg   --release
```

### 3) Prepare & link the npm wrapper (one-time per session)
```bash
cd npm/@vizij/animation-wasm
npm i
npm run build        # tsc if you have it
npm link             # makes a global link: @vizij/animation-wasm
```

### 4) In `vizij-web`: consume the link
```bash
cd ../../../../vizij-web
npm link @vizij/animation-wasm
npm i
npm run --workspace @vizij/animation-react build
npm run --workspace demo-animation dev
```
- Re-run step **2** whenever you change Rust; the link keeps `vizij-web` up to date.
- To **unlink** later:
  ```bash
  cd vizij-web && npm unlink @vizij/animation-wasm && npm i
  cd vizij-rs/npm/@vizij/animation-wasm && npm unlink
  ```

> Alternative to `npm link`: `npm pack` in the wrapper and `npm i /path/to/tarball.tgz` in `vizij-web`.

---

## Local Dev — Working on Website/React Only

If you are changing only React/TS:
```bash
cd vizij-web
npm i
npm run --workspace @vizij/animation-react build
npm run --workspace demo-animation dev
```
(Ensure you’ve linked or installed a version of `@vizij/animation-wasm` first.)

---

## External Usage

- **React apps**: `npm i @vizij/animation-react`
- **Non-React web**: `npm i @vizij/animation-wasm`; `await init(); new Animation(...)`
- **Native Bevy**: add `bevy_vizij_animation` from crates.io
