# Links → Edges Migration

## Intent
- Rename the node graph surface so JSON specs, Rust types, and wasm bindings expose `edges` instead of `links`.
- Drop the legacy `links` terminology entirely; any incoming payload that still uses `links` should produce an actionable validation error.
- Standardise variadic arithmetic/aggregation nodes (`add`, `multiply`, `join`, `case`, `default_blend`) to use `operand_*` input ids with unique suffixes (numeric or non-overlapping strings).
- Ship the structural renames alongside the variadic input schema tweak in one coordinated change set.

## Affected Surfaces
- **Graph core (Rust)** – `crates/node-graph/vizij-graph-core/src/types.rs` defines `GraphSpec.edges`, `EdgeSpec`, and related endpoint structs; `src/eval/mod.rs`, `src/topo.rs`, and the unit tests under `src/eval/` all consume the `edges` collection.
- **Graph JSON normalizer** – `crates/api/vizij-api-core/src/json/mod.rs:224` materialises and validates the top-level `edges` array and emits it during `normalize_graph_spec_json[_string]`; it must begin rejecting `links` with a targeted error and rewrite variadic input keys to the `operand_*` form when normalising.
- **Orchestrator runtime (Rust)** – `crates/orchestrator/vizij-orchestrator-core/src/controllers/graph.rs:332` (and the surrounding merge helpers) construct `EdgeSpec` values, expect `spec.edges`, and persist them; the JSON blobs in `examples/` and `tests/` mirror the same field.
- **Fixtures** – Every node graph in `fixtures/node_graphs/*.json` and the generated npm bundle `npm/@vizij/test-fixtures/dist/generated/browser-fixtures.json` contain `edges` and the existing variadic input ids; the Rust fixture loader re-exports them unchanged.
- **Node graph wasm + TypeScript** – `crates/node-graph/vizij-graph-wasm/src/lib.rs:125` deserialises `GraphSpec` from JSON, while the npm wrapper `npm/@vizij/node-graph-wasm/src/types.d.ts:170`, `samples.ts`, and `samples_extra.ts` expose `edges` on the public API and reference variadic inputs by their current names.
- **Orchestrator wasm + docs** – Consumer-facing examples in `npm/@vizij/orchestrator-wasm/README.md:113`, `tutorial.md`, and `merge_tutorial.md`, plus Jest specs under `npm/@vizij/orchestrator-wasm/tests/`, all rely on `edges`.
- **Rust + npm documentation** – `crates/api/vizij-api-core/README.md:96`, `crates/orchestrator/vizij-orchestrator-core/tutorial.md:61`, and `npm/@vizij/node-graph-wasm/README.md:33` describe `edges` as the canonical wiring term.
- **Downstream repos** – `vizij-web` and any other consumer ingesting graph specs (through wasm, fixtures, or raw JSON) must be updated in lockstep to send and expect `edges`.
- **Unrelated “link” terms** – The URDF schema (`crates/node-graph/vizij-graph-core/src/schema.rs:1708`) and general prose use “link” for robotics joints or documentation hyperlinks; these references should stay untouched during the rename.

## Migration Plan
1. **Rename core Rust types**  
   - Update `GraphSpec.links` → `edges` and rename `LinkSpec`/`LinkInputEndpoint`/`LinkOutputEndpoint` to their `Edge*` counterparts across `vizij-graph-core`, `vizij-orchestrator-core`, and dependent crates.  
   - Adjust constructors, helper functions, and tests to the new identifiers (`edge(...)` helpers, etc.).
2. **Revise JSON normalisation**  
   - Change `normalize_graph_spec_json[_string]` to emit and require `edges`, removing any code paths that backfill or accept `links`.  
   - Emit a dedicated error when `links` is present so callers immediately learn about the rename.
3. **Standardise variadic inputs**  
   - Update graph schema definitions (`vizij-graph-core/src/schema.rs` and related enums) so `add`, `multiply`, `join`, `case`, and `default_blend` advertise `operand_*` inputs.  
   - Adjust runtime evaluation logic to iterate these operand lists in deterministic order and fall back gracefully if callers omit suffixes.
4. **Refresh orchestrator logic**  
   - Migrate merge strategies, runtime controller state, and example specs to `edges`.  
   - Ensure serialization/deserialization round-trips via `GraphSpec` use the new field.
5. **Rewrite fixtures and samples**  
   - Replace `"links"` with `"edges"` in `fixtures/node_graphs/*.json` and re-run the fixture bundler that produces `npm/@vizij/test-fixtures/dist/generated/browser-fixtures.json`.  
   - Update variadic input ids to the `operand_*` pattern throughout fixtures and inline graph JSON embedded in tests.
6. **Update wasm bindings and npm surfaces**  
   - Adjust wasm-facing structs and regenerate TypeScript declarations to expose `edges` and the new input naming.  
   - Rewrite sample specs, README snippets, and tests in `@vizij/node-graph-wasm` and `@vizij/orchestrator-wasm`.
7. **Documentation sweep**  
   - Replace narrative references to `links` with `edges` across crate READMEs, tutorials, and agent guides.  
   - Double-check for straggling snippets or code fences that still show `links`.
8. **Validation**  
   - Run the git hooks (`./.githooks/pre-commit`, `./.githooks/pre-push`) to ensure fmt/clippy/tests pass.  
   - Re-run wasm builds (`pnpm run build:wasm:graph`, `pnpm run build:wasm:orchestrator`) and fixture builds (`pnpm run build:shared`) to verify generated assets contain `edges`.

## Deferred Release Tasks
- Bump crate/npm versions and update dependency pins once manual coordination begins.
- Publish release notes, changelog entries, and roadmap updates after verifying dependent repositories.
- Decide whether `abi_version()` increments are needed post-migration; skip during the initial rename unless downstream tooling requires the signal.

## Open Considerations
- Audit downstream repositories for hand-written specs; coordinate PRs to keep them green during the breaking rollout.
- Confirm no tooling (internal or CI) relies on JSON diffs that assume `links` ordering; the rename may surface hidden assumptions.
- Ensure the new `operand_*` convention aligns with UI builders and schema inspectors; update any generated docs or tooling visualisations that currently hard-code legacy input ids.
