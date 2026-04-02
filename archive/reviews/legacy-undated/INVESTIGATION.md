# Value Type Alignment Investigation

## Scope

The goal was to confirm that `vizij-rs` defines the Value/Shape surface once,
that the generated wasm + npm packages expose that surface directly using
TypeScript conventions, and that the React wrappers simply consume those npm
packages without performing additional schema conversions. This document
captures the current behaviour across the stack and highlights the gaps.

## Source Of Truth – `vizij-api-core`

- `vizij-rs/crates/api/vizij-api-core/src/value.rs` defines `Value` as a
  `#[serde(tag = "type", content = "data", rename_all = "lowercase")]` enum.
  The JSON representation is therefore `{"type": "float", "data": ...}` etc.
- `vizij_api_core::ValueKind` covers the same variants (float, bool, vec2/3/4,
  quat, colorRgba, transform, vector, enum, text, record, array, list, tuple).
- This enum is shared by the animation, node-graph, and orchestrator crates.

**Conclusion:** the Rust side already emits lowercase type discriminants and
should remain the single source of truth.

## Shared TypeScript Helpers (`@vizij/value-json`)

- `vizij-rs/npm/@vizij/value-json/src/index.ts` mirrors the Rust union as
  `NormalizedValue` with `type` strings in lowercase, and exposes
  `toValueJSON(...)`, `isNormalizedValue(...)`, and the various tagged helper
  shapes (`Float`, `Vec2`, `Transform`, etc.).
- All npm wasm wrappers (`@vizij/animation-wasm`, `@vizij/node-graph-wasm`,
  `@vizij/orchestrator-wasm`) depend on this package and re-export the same
  definitions; e.g. `@vizij/animation-wasm/src/types.d.ts` aliases
  `export type Value = NormalizedValue`.
- When the wrappers need to coerce raw inputs, they call the shared helpers in
  the npm layer (for example, the orchestrator wrapper calls `toValueJSON` in
  `src/index.ts:157`).

**Conclusion:** the npm wasm packages already conform to the “lowercase, shared
helpers” vision.

## Wasm Wrappers (JS side)

- `@vizij/animation-wasm` returns whatever serde emits; there is no JS-side
  post-processing of `Outputs` (see `src/index.ts` around `updateValues`).
- `@vizij/node-graph-wasm` converts host values into `ValueJSON` via the shared
  helper before staging them (`src/index.ts:161`, `:183`).
- `@vizij/orchestrator-wasm` likewise normalises inputs and exposes ValueJSON in
  its types.

**Conclusion:** the wasm packages are already emitting the canonical TypeScript
types; they do not introduce new capitalised variants.

## React Packages

### `@vizij/animation-react`

- The provider defines its own `Value` union (`src/index.tsx:36`) with capital
  discriminants (`"Float"`, `"Vec3"`, etc.) plus legacy aliases such as
  `translation`/`rotation`. The provider then converts every change coming from
  the wasm layer via a `convertValue(...)` helper (`src/index.tsx:83-182`).
- Downstream caches (`valuesRef` et al.) store these custom values, and helpers
  like `valueAsNumber` operate on the capitalised union (`src/index.tsx:1391`).
- The README documents the capitalised union (`packages/@vizij/animation-react/README.md`).

**Impact:** the React layer is performing a schema translation that duplicates
the canonical definitions and diverges from the wasm packages. Removing the
conversion currently breaks type checking, indicating that consumers still rely
on the legacy union.

### `@vizij/node-graph-react`

- Value helpers (`src/valueHelpers.ts`) work directly with the lowercase
  `ValueJSON` shape (checking `"float" in val`, `"transform" in val`, etc.).
- The provider exposes the underlying wasm runtime (`GraphRuntimeContextValue`)
  without altering the payloads.

**Status:** aligned with the desired architecture.

### `@vizij/orchestrator-react`

- Re-exports the wasm types directly (`src/index.ts`) and provides lightweight
  helpers that operate on the ValueJSON structure by checking `.data`/`.value`
  fields.
- No schema rewriting occurs.

**Status:** aligned with the desired architecture (helpers are loose but do not
  redefine the union).

## Demo Applications (vizij-web)

- The animation studio and related demos ingest the capitalised `Value` from
  `@vizij/animation-react` and assume properties like `type === "Float"` or
  `value.data.pos`. When we switch the provider to emit the shared ValueJSON
  shape, these components report type errors and runtime mismatches.
- Several demos import types straight from `@vizij/animation-wasm` (the npm
  wrapper) while relying on the capitalised React helpers for formatting, which
  signals that the type surface is still inconsistent within vizij-web.

## Summary Of Deviations

1. **Dual Value unions.** The React animation provider exports a bespoke `Value`
   with capitalised discriminants and performs runtime conversions from the
   wasm outputs. This is the primary source of drift.
2. **UI components built on the capitalised union.** Demo UIs, helpers, and
   docs still refer to `"Float"`, `"Vec3"`, etc., meaning the ecosystem is
   anchored to the legacy casing.
3. **React package documentation.** The animation React README describes the
   legacy union, which contradicts the canonical TypeScript definitions shipped
   in the npm packages.

Everything else (Rust core, shared helpers, wasm wrappers, node-graph/orchestrator
React layers) already aligns with the intended architecture.

## Recommendations

1. **Promote the shared Value union.** In `@vizij/animation-react`, re-export
   `ValueJSON` (or `NormalizedValue`) from `@vizij/value-json` rather than
   maintaining a parallel `Value` type. The provider should store the wasm
   payloads as-is instead of converting them.
2. **Move UI helpers to shared utilities.** If React needs helpers such as
   `valueAsNumber`, implement them on top of `@vizij/value-json` and re-export
   them so demos can rely on the same functions.
3. **Update demos/tests.** Refactor the animation demos to consume the shared
   ValueJSON structure (or the helpers mentioned above), removing checks like
   `value.type === "Float"`.
4. **Refresh documentation.** Update `packages/@vizij/animation-react/README.md`
   and any other guides to describe the lowercase `type/data` contract and
   point to the shared helpers instead of the bespoke union.
5. **Remove temporary conversions.** Once consumers are updated, delete the
   `convertValue` logic in the animation React provider so the data flows
   directly from the wasm APIs to React consumers.

Following these steps will realign the repo with the API review goals: a single
definition of Value in `vizij-api-core`, consistent wasm bindings that expose
TypeScript-friendly shapes via `@vizij/value-json`, and React wrappers that
focus purely on React concerns without re-specifying runtime schemas.

## Casing & Naming Conventions (Rust vs TS)

The repositories straddle Rust and TypeScript. To stay consistent and reduce
friction at boundaries, use the following conventions and mapping rules.

Rust (language and crates)
- Files/modules: `snake_case` (e.g., `value.rs`, `vizij_api_core/src/json/mod.rs`).
- Crates (Cargo `package.name`): `kebab-case` (crate id becomes `snake_case`).
- Types (struct/enum/trait): `PascalCase` (e.g., `StoredAnimation`, `Value`).
- Enum variants: `PascalCase` (e.g., `Float`, `Transform`).
- Functions/methods: `snake_case` (e.g., `update_values_and_derivatives`).
- Fields/locals: `snake_case` (e.g., `start_time`, `end_time`).
- Constants/statics: `SCREAMING_SNAKE_CASE`.
- serde for JS-facing JSON: prefer `#[serde(rename_all = "camelCase")]` for
  object field names intended for JS/TS; for discriminated unions use
  `#[serde(tag = "type", content = "data", rename_all = "lowercase")]` when
  tags are string literals consumed in TS unions.

TypeScript / JavaScript
- Files: commonly `kebab-case` (e.g., `baked-animation-plot.tsx`); React
  components often file as `PascalCase` (e.g., `PlayerCard.tsx`).
- Packages (npm): `kebab-case` or scoped `@scope/kebab-case`.
- Types/interfaces/enums: `PascalCase` (e.g., `StoredAnimation`, `ValueJSON`).
- Enum members: typically `PascalCase` (some teams use `SCREAMING_SNAKE_CASE`).
- Functions/variables/properties: `camelCase` (e.g., `updateValuesAndDerivatives`).
- JSON keys and discriminants: lowercase or `camelCase` string literals, not
  `PascalCase` words (better ergonomics in TS unions and JSON tooling).

Boundary Mapping (what we standardize on)
- Rust → JSON for JS: JSON object field names in `camelCase`; discriminant tags
  in `lowercase` with `data` content, matching `@vizij/value-json`.
- TS types: `PascalCase` type/interface names (`ValueJSON`, `NormalizedValue`),
  `camelCase` fields.
- No React-layer renaming or schema conversion — React consumes the npm package
  types/values.

Concrete Decisions for Vizij
- Keep `vizij_api_core::Value` as a serde-tagged enum with
  `rename_all = "lowercase"` on the tag (current behavior). Field names within
  JSON objects that are part of the public surface should use `camelCase` when
  they’re not single tokens. The current `transform` payload uses `pos/rot/scale`
  which are single-word and acceptable; avoid introducing `PascalCase` here.
- The wasm crates should not introduce alternative casings; they forward what
  serde produces and re-export TS definitions from `@vizij/value-json`.
- The npm packages (`@vizij/*-wasm`) remain the only place that adapts inputs
  via shared helpers (e.g., `toValueJSON`) and expose well-typed outputs.
- The React packages (`@vizij/*-react`) stop defining alternate unions; they
  re-export the shared `ValueJSON`/helpers from the npm packages and provide
  React-specific context/hooks only.
