# Implementation Plan

[Overview]
Add a new URDF forward-kinematics node that reuses the existing optional `k` + `urdf-rs` stack to compute the pose of a chosen tip link from provided joint states. The node will parse the URDF string once, cache the kinematic chain, and on evaluation apply incoming joint values to produce both position and orientation outputs. The feature gate introduced for IK (`urdf_ik`) already enables these dependencies, so the FK node will ship under the same gate with no additional dependency churn.

[Types]
Introduce one new node variant plus minor parameter extensions to support default joint values.

1) `NodeType` additions (`vizij-rs/crates/node-graph/vizij-graph-core/src/types.rs`)
   - `UrdfFk` – evaluates URDF chain forward kinematics.

2) `NodeParams` additions (same file)
   - Reuse existing fields (`urdf_xml`, `root_link`, `tip_link`).
   - Add `joint_defaults: Option<Vec<(String, f32)>>`
     - Optional fallback list used when an input joint is missing; preserves order for deterministic fills.

3) Runtime state (`vizij-rs/crates/node-graph/vizij-graph-core/src/eval/graph_runtime.rs` + `eval/urdfik.rs`)
   - Reuse the IK cache by generalising `UrdfIkState` into `UrdfKinematicsState` (or similar) that stores:
     - `hash`, `dofs`, `joint_names`, `chain` (cfg-gated), and any solver-free metadata.
   - Update `NodeRuntimeState` to hold `UrdfKinematics(UrdfKinematicsState)` and migrate IK callers.

[Files]
No new files; extend existing modules with FK support.

- `vizij-rs/crates/node-graph/vizij-graph-core/src/types.rs`
  - Add `NodeType::UrdfFk`.
  - Append `joint_defaults` to `NodeParams` with serde defaults.

- `vizij-rs/crates/node-graph/vizij-graph-core/src/schema.rs`
  - Under the `urdf_ik` (renamed `urdf_kinematics` if we broaden the gate) feature list, register a new `NodeSignature` in the "Robotics" category:
    - Inputs:
      - `joints`: `PortType::Any` (document: record map joint → angle radians). Accept lists/vectors via coercion.
    - Outputs:
      - `position`: `PortType::Vec3`
      - `rotation`: `PortType::Quat`
      - `transform`: `PortType::Transform` (optional convenience output).
    - Params:
      - `urdf_xml`, `root_link`, `tip_link` (reuse IK defaults/doc strings).
      - `joint_defaults`: `PortType::Any` with default `{ "list": [] }`.
    - Describe expected input record schema in docs for graph editor.

- `vizij-rs/crates/node-graph/vizij-graph-core/src/eval/graph_runtime.rs`
  - Generalise the shared URDF cache state (IK + FK) and update IK code paths to use the renamed struct/variant.

- `vizij-rs/crates/node-graph/vizij-graph-core/src/eval/urdfik.rs`
  - Extend existing helpers so both IK and FK share chain construction, joint coercion, and caching utilities.
  - Introduce FK-oriented functions (e.g., `apply_joint_positions`, `forward_pose`) that reuse the parsed `SerialChain` produced today by `build_chain_from_urdf`.
  - Keep solver-specific logic (Jacobian IK) isolated while exposing read-only accessors the FK evaluator can call without dragging in solver state.

- `vizij-rs/crates/node-graph/vizij-graph-core/src/eval/eval_node.rs`
  - Add `cfg(feature = "urdf_ik")` dispatch for `NodeType::UrdfFk`:
    1. Fetch cached URDF chain via the shared helper, rebuilding when hash changes.
    2. Gather joint values:
       - Accept `Value::Record`, `Value::Vector`, or `Value::List/Tuple` by coercing to `Vec<f32>`.
       - Align values to the chain’s joint order; fall back to `joint_defaults` or zeros if missing.
       - Surface errors for extra joints when strict mode (future) or silently ignore (document choice).
    3. Apply angles to the chain, compute the global transform for `tip_link` relative to `root_link`.
    4. Produce outputs:
       - `position`: `Value::Vec3([x, y, z])`
       - `rotation`: `Value::Quat([x, y, z, w])` (k crate returns `UnitQuaternion` as `[i, j, k, w]`).
       - `transform`: `Value::Transform { pos, rot, scale: [1.0; 3] }`.
  - Under `cfg(not(feature = "urdf_ik"))`, mirror the IK behaviour by returning a descriptive `Err` when the node is evaluated.
  - Extract shared helpers if not already present:
       - `fn build_chain_from_urdf(...)` (already available from IK work).
       - `fn apply_joint_values(chain: &mut Chain, joint_names: &[String], values: &[f32])`.
       - `fn fetch_joint_vector(value: &Value, expected: usize, defaults: Option<&[(String, f32)]>, joint_names: &[String]) -> Result<Vec<f32>, EvalError>` – handles record/array coercions and merges defaults.

- `vizij-rs/crates/node-graph/vizij-graph-core/src/lib.rs` (if the feature alias is renamed)
  - Update re-exported features (`pub use`) to match any new `urdf_kinematics` identifier.

- `vizij-rs/npm/@vizij/node-graph-wasm/src/types.d.ts`
  - Extend the generated/handwritten type definitions so JS bindings know about the FK node (`NodeType` union, params, output typings).

[Dependencies]
No new dependencies. Reuse the existing optional `k` and `urdf-rs` crates already enabled by the `urdf_ik` feature.

[Testing]
Add cfg-gated unit tests alongside the IK tests using the same lightweight URDF fixture.

- `vizij-rs/crates/node-graph/vizij-graph-core/src/eval/tests.rs`
  - `fk_returns_correct_pose`: build a simple 2-link planar arm, provide joint angles, and assert the returned position/rotation matches analytic expectations within tolerance.
  - `fk_handles_missing_joint_with_default`: omit one joint entry and rely on `joint_defaults` to backfill; verify output is correct.
  - `fk_errors_on_bad_input_type`: supply malformed inputs (e.g., string) and expect a descriptive error.

- (Optional) `vizij-web` smoke test
  - If there is a demo graph bundle for robotics, add/extend a preset graph referencing the new FK node and ensure TypeScript types compile.

[Implementation Order]
1) Generalise runtime cache struct/feature naming (if renaming) and adjust IK callers to compile.
2) Add `NodeType::UrdfFk`, extend `NodeParams`, and expose schema signature for the new node.
3) Implement FK evaluation logic in `eval.rs`, reusing helpers from the IK path for URDF parsing and joint alignment.
4) Update TypeScript bindings (if applicable) for the new node type and params.
5) Add forward-kinematics unit tests under the existing feature flag.
6) Run `cargo fmt`, `cargo clippy --tests`, and `cargo test -p vizij-graph-core --features urdf_ik`.
7) (Optional) Rebuild WASM artifacts or demo apps with `pnpm run build --filter demo-graph` if FK integration is exposed in the web UI.
