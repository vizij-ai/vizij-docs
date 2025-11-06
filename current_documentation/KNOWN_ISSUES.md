# Known Issues (Mar 2025)

## Node Graph
- **Variadic outputs expose handles late**  
  - *Evidence*: The schema provides variadic metadata but output handles for nodes like `Split` are synthesised only after runtime evaluation, so editor UIs lack `partN` pins until the graph executes (tracked in `vizij_docs/bugs.md:3-4`).  
  - *Proposed fix*: Extend registry metadata to predeclare variadic handles (size hints + naming) and update wasm/React adapters to materialise them when loading the schema.
- **Website still on scalar blend logic**  
  - *Evidence*: `apps/website/src/components/VizijExpressionsDemo.tsx:150-205` calls `useBlendTree` with manually weighted scalar poses rather than consuming node-graph outputs; viseme overlay uses React-only logic.  
  - *Proposed fix*: Complete the website node-graph migration — load expression/viseme specs via `NodeGraphProvider`, map outputs to `VizijLowRig`, and remove the bespoke blend tree.
