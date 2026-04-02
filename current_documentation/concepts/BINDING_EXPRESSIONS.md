# Binding Expressions — Canonical Guide

<!-- tags: family=reference; type=concept; topics=authoring,bindings,expressions,rigs,graphs -->
> **Last updated:** 2026-03-31

This guide explains how Vizij binding expressions work today (schema, parsing, normalization, compilation) and how they should integrate with the authoring UI and runtime-backed execution.

It is intended to provide “runtime-react-docs-level” clarity for expressions.

## 1) What a “binding expression” is

A **binding** connects a target (an animatable component or an input) to one or more upstream sources (standard inputs, other slots, self, etc.).

A **binding expression** is a small expression language used to combine the values of binding slots into a final value.

Key idea:

- Slots are the *inputs* to the binding expression.
- The expression is the *program* that combines them.
- The expression ultimately compiles down into graph nodes/edges in the rig graph.

## 2) Where binding expressions live (source of truth)

### 2.1 Canonical implementation

Binding expression tooling lives in `vizij-web`:

- Expression parser + AST:
  - `vizij-web/packages/@vizij/node-graph-authoring/src/expression.ts`
- Function vocabulary:
  - `vizij-web/packages/@vizij/node-graph-authoring/src/expressionFunctions.ts`
- Expression variables (slot/reserved variables, missing-variable detection):
  - `vizij-web/packages/@vizij/node-graph-authoring/src/expressionVariables.ts`
  - `vizij-web/packages/@vizij/node-graph-authoring/src/expressionVocabulary.ts`
- Binding state + normalization (slot ids/aliases, legacy rewrite):
  - `vizij-web/packages/@vizij/node-graph-authoring/src/state.ts`
- Graph/IR builder that turns bindings + expressions into a rig graph:
  - `vizij-web/packages/@vizij/node-graph-authoring/src/graphBuilder.ts`

### 2.2 Authoring UI surfaces

In `apps/vizij-authoring`, expressions are edited in multiple places:

- Binding editor component:
  - `apps/vizij-authoring/src/components/binding/BindingEditor.tsx`
- Inspector surfaces that embed BindingEditor:
  - `apps/vizij-authoring/src/components/inspector/DriverBindingSection.tsx`
  - `apps/vizij-authoring/src/components/inspector/FeatureList.tsx`
- Standard feature space mapping editor exposes expression editing:
  - `apps/vizij-authoring/src/components/app/StdFeatureSpacesMappingEditor.tsx`

## 3) Expression language (what’s supported)

### 3.1 AST model

The parser produces a `ControlExpressionNode` AST, including:

- `Literal` (number)
- `VectorLiteral` (array of numbers)
- `Reference` (variable name)
- `Unary` (`+`, `-`, `!`)
- `Binary` (`+`, `-`, `*`, `/`, `>`, `<`, `==`, `!=`, `&&`, `||`)
- `Function` (name + args)

See:

- `packages/@vizij/node-graph-authoring/src/expression.ts`

Important limitation (current behavior):

- `>=` and `<=` are explicitly rejected as “not supported”.

### 3.2 Functions

Function vocabulary is defined in:

- `packages/@vizij/node-graph-authoring/src/expressionFunctions.ts`

This defines:

- function names/aliases
- categories (e.g. math/logic)
- arg constraints
- semantic descriptions

### 3.3 Variables

Variables in expressions come from two sources:

1) **Slot variables** — references to binding slots (e.g. `s1`, `s2`, etc.)
2) **Reserved variables** — special identifiers like:
   - `self` (binding scope)
   - `time`, `deltaTime`, `frame` (graph scope)

Reserved variables are defined in:

- `packages/@vizij/node-graph-authoring/src/expressionVocabulary.ts`

Variable resolution and “missing variable” detection are handled by:

- `packages/@vizij/node-graph-authoring/src/expressionVariables.ts`

## 4) Normalization and legacy compatibility

Binding expressions have to stay stable even if:

- slots are renamed
- slot aliases change
- old binding formats are imported

The binding state module includes logic to:

- normalize legacy slot ids like `slot_1` → `s1`
- sanitize aliases
- rewrite expressions containing `slot_#` into canonical aliases (`s#`) or updated aliases

Key file:

- `packages/@vizij/node-graph-authoring/src/state.ts`

Practical implication:

- The authoring UI should treat expression strings as “user-authored”, but it must run them through normalization when:
  - slots change
  - aliases change
  - imported data is reconciled

## 5) Compilation: expressions → graph nodes/edges

Binding expressions compile as part of rig graph compilation.

The core builder:

- evaluates each binding
- parses the expression
- resolves variables
- emits issues for missing variables or invalid syntax
- generates graph nodes for expression functions/ops

Key file:

- `packages/@vizij/node-graph-authoring/src/graphBuilder.ts`

Outputs of interest:

- IR summary contains `expression` and `expressionNodeId` per binding summary.
- Issues are captured as strings/issue lists which should be mapped into IR issues.

## 6) Current tooling guidance

Current authoring/runtime expectations:

- Parse expressions before apply and block invalid syntax from reaching graph compilation.
- Resolve slot variables and reserved variables from the current binding scope rather than from hardcoded UI assumptions.
- Normalize legacy slot aliases during import, rename, and save flows so authored expressions stay stable.
- Surface compile-time issues and generated `expressionNodeId` metadata anywhere the UI needs binding traceability.
