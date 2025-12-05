# WASM Boundary Optimization Proposal
<!-- tags: status=proposal; topics=wasm,performance,rust,optimization -->

## 1. Summary
This project aims to improve the runtime performance of Vizij by minimizing the overhead associated with crossing the JavaScript/WebAssembly (WASM) boundary. The primary focus is on reducing serialization/deserialization costs and batching operations.

## 2. Problem Statement
Currently, the Vizij runtime interacts with the Rust core via WASM. While WASM execution is fast, the "bridge" between JS and WASM can be a bottleneck, especially when transferring large amounts of data (like animation frames or graph updates) or making frequent small calls. Excessive serialization (e.g., `serde_wasm_bindgen`) and frequent context switching can degrade frame rates and increase latency.

## 3. Goals
*   **Reduce Serialization Overhead**: Identify and optimize "hot paths" where data serialization is a bottleneck.
*   **Batch Operations**: Replace frequent, granular calls with batched operations (e.g., `WriteBatch`).
*   **Memory Management**: Optimize how memory is shared or copied between JS and WASM to reduce GC pressure.
*   **Move Logic to Rust**: Identify logic currently in JS that requires frequent WASM calls and move it entirely into Rust.

## 4. Proposed Solution
1.  **Profiling**: Use browser profiling tools to identify the most expensive JS/WASM boundary crossings.
2.  **`WriteBatch` Optimization**: Ensure the `WriteBatch` mechanism is used effectively for all state updates.
3.  **Shared Memory (Future)**: Explore `SharedArrayBuffer` or direct memory access patterns where safe and applicable.
4.  **API Refactoring**: Redesign WASM APIs to accept and return flat arrays or pointers rather than complex objects requiring deep serialization.

## 5. Risks & Unknowns
*   **Complexity**: Direct memory management or "unsafe" WASM interactions can introduce bugs and crashes.
*   **Browser Compatibility**: Advanced features like `SharedArrayBuffer` have security requirements (COOP/COEP).

## 6. Success Metrics
*   **Frame Time Reduction**: Measurable decrease in the time spent in the "WASM Bridge" portion of the frame loop.
*   **Garbage Collection**: Reduction in minor GC cycles during playback.
