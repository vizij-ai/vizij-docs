# DEVELOPMENT_PATTERNS.md

## FFI Boundary (Rust ⇄ JS)

Keep the JS-facing API small and stable in `vizij-*-wasm`:

```rust
#[wasm_bindgen]
pub struct Animation { /* engine state */ }

#[wasm_bindgen]
impl Animation {
  #[wasm_bindgen(constructor)]
  pub fn new(config: JsValue) -> Result<Animation, JsError>;

  #[wasm_bindgen]
  pub fn update(&mut self, dt: f32, inputs: JsValue) -> Result<JsValue, JsError>;

  #[wasm_bindgen(js_name = set_frequency)]
  pub fn set_frequency(&mut self, hz: f32);
}

#[wasm_bindgen]
pub fn abi_version() -> String;
```

- Use `serde_wasm_bindgen` for config/inputs/outputs.
- Map errors to `JsError` and avoid panics.
- For high-rate numeric I/O later, add **TypedArray** methods.

---

## npm Wrapper Pattern (`vizij-rs/npm/@vizij/<thing>-wasm`)

- Re-export the wasm-pack `pkg` with a clean ESM entry (`src/index.ts`).
- Include `pkg` in **package tarball** via `"files": ["dist","pkg","README.md"]`.
- **Do not commit** `pkg/` to git; generate it prepublish in CI.

---

## React Wrapper Pattern (in `vizij-web`)

- Provide a Provider + hooks (`@vizij/animation-react`) that depend on `@vizij/animation-wasm` (from npm).
- Hide WASM init and the `requestAnimationFrame` loop inside the provider.
- Consider a Worker-backed variant when perf requires it.

---

## Bevy Plugin Pattern

- Wrap the core logic in a `Plugin` with clean resources/events.
- Compose multiple controllers with a thin orchestrator if needed.

---

## Versioning & Compatibility

- `abi_version()` in WASM; check it in wrappers/apps.
- SemVer for crates and npm packages.
- Publish order for crates: **core first**, then plugin.

---

## Troubleshooting

- **Web CI can’t find Rust** → Don’t build WASM there; consume published npm.
- **Missing `pkg/`** → Build WASM in `vizij-rs` and republish the npm package.
- **Local dev mismatch** → `npm link` both repos, or `npm pack` and install tarball.
