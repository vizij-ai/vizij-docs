# Vizij API: Shape & Value Synthesis Report

## 1. Motivation and Context

The `vizij-rs` repository currently defines overlapping but inconsistent data types in its **animation** and **node graph** crates:

* **Animation core** defines `ValueKind` and `Value` enums that represent scalars, vectors, quaternions, colors, and transforms. These are central to keyframing and blending.
* **Node graph core** defines its own `Value` enum, with floats, booleans, vectors, and other constructs. These values flow between nodes, evaluated per-frame or on demand.

This divergence creates duplicated logic, inconsistent handling of precision and composites, and a lack of support for addressing sub-values (e.g., `Transform.translation.x`) or dynamically grouping primitives into higher-level structures.

The goal is to design a unified **Shape & Value API** that provides a shared language across all Vizij modules, including animation, node graph, behavior trees, physics, and future extensions.

The API must support:

* **Bevy ECS integration** with typed writers and reflection fallback.
* **Front-end/JavaScript compatibility**, including JSON serialization and TypeScript typings.
* **Dynamic composition**, so primitives can stand alone or participate in composites.
* **Instance management**, so multiple robot instances can share the same type system without conflict.
* **Blackboard/memory layer integration**, to enable interoperation between heterogeneous engines and modules.

---

## 2. Core Concepts: Shape and Value

### 2.1 Shape (Schema/Type)

`Shape` defines the schema of data. Shapes include primitives, composites, and metadata that describe semantics and constraints.

**Primitive Shapes:**

* `Scalar` (f64)
* `Bool`
* `Vec2`, `Vec3`, `Vec4`
* `Quat`
* `ColorRgba` (linear or sRGB)
* `Int`, `Uint` (optional for discrete or index values)

**Composite Shapes:**

* `Transform` (record of {pos: vec3, rot: quat, scale: vec3})
* `Record` (named fields: `record{pos:vec3,rot:quat,scale:vec3}`)
* `Array<T>[N]` (fixed size)
* `List<T>` (variable length)
* `Tuple` (ordered heterogeneous types)

**Extended Schema (potential):**

* `Matrix3`, `Matrix4`
* `DualQuat`
* `Curve` (e.g. cubic bezier, Hermite spline)
* `Enum` (tagged choice type)
* `Text` (string)

**Metadata:**

* Units (e.g., meters, radians, seconds)
* Ranges (min/max values)
* Spaces (world, local, normalized)
* Color models (RGB, HSV, linear vs gamma)

**Compatibility Rules:**

* Scalar → VecN coercion (broadcast)
* Bool → Scalar coercion (false=0.0, true=1.0)
* Vec3 ↔ Color (with explicit conversion)
* Quaternion blending by slerp, vector blending by lerp, transform blending by decomposition

Rust sketch:

```rust
pub enum ShapeId {
    Scalar,
    Bool,
    Int,
    Uint,
    Vec2,
    Vec3,
    Vec4,
    Quat,
    ColorRgba,
    Transform,
    Matrix3,
    Matrix4,
    Record(Vec<Field>),
    Array(Box<Shape>, usize),
    List(Box<Shape>),
    Tuple(Vec<Shape>),
    Enum(Vec<(String, Shape)>),
    Text,
}

pub struct Shape {
    pub id: ShapeId,
    pub meta: HashMap<String, String>,
}
```

### 2.2 Value (Runtime Instance)

`Value` represents a runtime instance that conforms to a `Shape`. Small primitives are copyable; large composites are heap-allocated.

```rust
pub enum Value {
    Float(f64),
    Bool(bool),
    Int(i64),
    Uint(u64),
    Vec2([f64;2]),
    Vec3([f64;3]),
    Vec4([f64;4]),
    Quat([f64;4]),
    ColorRgba([f64;4]),
    Transform { pos:[f64;3], rot:[f64;4], scale:[f64;3] },
    Matrix3([[f64;3];3]),
    Matrix4([[f64;4];4]),
    Record(HashMap<String, Value>),
    Array(Vec<Value>),
    Tuple(Vec<Value>),
    Enum(String, Box<Value>),
    Text(String),
}
```

### 2.3 Typed Paths

Typed paths provide structured addressing of sub-values, e.g.:

* `Transform.translation.x`
* `rig/Spine/Chest/RightArm.rotation`
* `robot1/Camera0/Intrinsics.fx`

These paths resolve against Shape registries to enable efficient and safe sub-field access.

### 2.4 Coercion and Blending

* **Coercion**: defines safe implicit conversions (e.g. scalar → vec3, bool → scalar).
* **Blending**: defined by Shape semantics. Quaternions use slerp, transforms decompose, arrays blend elementwise.

---

## 3. API Architecture

```
vizij-rs/
  crates/api/
    vizij-api-core/         # Shape, Value, Path, Coercion, Blend, Serialize
    bevy_vizij_api/         # Bevy ECS adapters
    vizij-api-wasm/         # WASM JSON + TS typings
```

### Core responsibilities:

* Define Shape, Value, Path.
* Implement coercion, blending, and serialization.
* Maintain registries for shapes and typed writers.

### Bevy adapter:

* Maps `(ComponentTypeId, PropertyPath)` → setter functions.
* Fallback to reflection when no typed setter is registered.

### WASM adapter:

* JSON encoding for Values.
* TypeScript declarations for ShapeJSON/ValueJSON.

---

## 4. Blackboard/Memory Layer Architecture

The **blackboard** (also called memory) is the hub through which modules communicate. It uses Shape & Value as its universal interface.

### Core design:

* Central registry of key-value pairs, where keys are typed paths and values are `Value` instances.
* Supports hierarchical namespaces (e.g., per-robot, per-entity).
* Provides transactional read/write per frame.
* Allows subscriptions to path updates.

### Module interaction:

* **Animation player**: samples tracks, produces Values, writes them to blackboard paths.
* **Node graph**: evaluates nodes per frame, consumes and produces Values via paths.
* **Behavior tree**: reads/writes state values to blackboard to make decisions.
* **Physics**: updates transforms and forces in blackboard Values.
* **Front-end UI**: subscribes to blackboard updates via WASM/JSON to render state or drive UI.

### Example:

```
robot1/Transform.pos → Value::Vec3([0.0, 1.0, 0.0])
robot1/Arm/Joint3.angle → Value::Float(0.5)
```

Modules read/write through a unified API:

```rust
blackboard.write("robot1/Arm/Joint3.angle", Value::Float(0.5));
let v = blackboard.read("robot1/Transform.pos");
```

### Benefits:

* Consistent interface for all modules.
* Decouples internal engine representations from shared state.
* Supports multiple instances through namespace isolation.
* Enables serialization and replay of memory state.

---

## 5. Applying Across Modules

### Node Graph

* Ports declare input/output Shapes.
* Values flow as runtime Values.
* Coercion applied when necessary.
* WASM returns `Record<NodeId, ValueJSON>` each tick.

### Animation Player

* Tracks map to paths and Shapes.
* Sampling yields Values, blended by Shape semantics.
* Outputs written to ECS or blackboard.

### Behavior Trees (TBD)

* Nodes read/write Values in blackboard.
* Decisions based on typed data, not raw strings.

### Physics (TBD)

* Outputs transforms, forces, velocities as Values.
* Blackboards serve as synchronization layer across modules.

---

## 6. Serialization and Tooling

**ValueJSON examples:**

```json
{ "float": 1.0 }
{ "vec3": [1,2,3] }
{ "quat": [0,0,0,1] }
{ "transform": {"pos": [0,0,0], "rot": [0,0,0,1], "scale": [1,1,1]} }
```

**ShapeJSON examples:**

```json
{ "id": "transform", "meta": {"space": "world"} }
{ "id": "vec3", "meta": {"units": "meters"} }
```

**Tooling Benefits:**

* Editors validate port compatibility.
* Auto-completion for paths.
* UI generation (sliders, color pickers, dropdowns) from Shape metadata.
* Debugging tools can inspect the blackboard directly.

---

## 7. Recommendation

Adopt the **Shape & Value API** as the lingua franca across Vizij crates. This ensures:

* Shared type system across all engines and modules.
* Dynamic grouping of primitives into composites.
* Stable serialization for WASM/JavaScript.
* Efficient ECS integration with typed writers.
* Unified blackboard/memory layer for inter-module communication.
* Namespace isolation for multi-robot scenarios.

This API provides the coherence, extensibility, and interoperability needed for Vizij to scale across animation, control, physics, and beyond.
