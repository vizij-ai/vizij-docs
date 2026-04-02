# WASM Hardening Proposal
<!-- tags: family=project; type=proposal; project_status=proposal; topics=wasm,security,stability,abi -->
> **Last updated:** 2026-03-31

> **Related documents:** Plan (not yet written) · Reference (not yet written) · [Code Quality Summary](../summary.md)

## 1. Summary

This project focuses on ensuring the stability, security, and compatibility of the WebAssembly (WASM) artifacts produced by the Rust core. It aims to prevent runtime crashes due to ABI mismatches, make panics and edge cases observable and recoverable where possible, and ensure robust type safety across the boundary. Some foundational pieces (e.g., `abi_version()` and shared loaders) already exist; this project formalizes and extends them.

## 2. Problem Statement

The interface between Rust (WASM) and JavaScript is a critical failure point. If the JS side expects a different version of the WASM module than what is loaded, or if the WASM module panics, the entire application can crash. Historically, we relied on manual version syncing and ad-hoc error handling. As more features ship and more packages consume WASM, we need:

- A consistent, enforced ABI versioning strategy.
- Clear panic and error handling behavior across all WASM entry points.
- Stronger type guarantees for values crossing the boundary.

## 3. Goals

*   **ABI Versioning**: Enforce strict version checking between JS and WASM, using `abi_version()` and shared loader utilities.
*   **Panic Handling**: Ensure that Rust panics are caught and translated into meaningful JS errors or structured error states, rather than crashing the WASM instance wherever possible.
*   **Type Safety**: Improve the type definitions and JSON conversion helpers generated for the WASM boundary to catch errors at compile time and provide clear runtime diagnostics.
*   **Consistent Loader Behavior**: Make sure all `@vizij/*-wasm` wrappers and the shared loader behave consistently with respect to errors and version mismatches.

## 4. Proposed Solution

1.  **Version Handshake**
    - Standardize on an `abi_version()` contract for all WASM crates.
    - Ensure the shared loader (e.g., `@vizij/wasm-loader`) performs a runtime check on initialization and throws or rejects with a clear error if versions do not match.
    - Provide guidance and tooling for bumping ABI versions and coordinating releases across `vizij-rs` and `vizij-web`.
2.  **Panic & Error Handling**
    - Ensure `console_error_panic_hook` (or equivalent) is configured for all WASM entry points.
    - Identify critical entry points where `catch_unwind` is appropriate, and wrap them to prevent full-instance crashes.
    - Standardize error shapes (e.g., error codes, messages, optional context) returned to JS on failure.
3.  **Error Boundaries in JS**
    - Wrap WASM calls in JS `try/catch` blocks or promise rejections, surfacing errors to callers rather than allowing unhandled exceptions.
    - Provide helper utilities in the `@vizij/*-wasm` wrappers to encourage consistent patterns (e.g., `safeCall` wrappers).
4.  **Type Safety & Tooling**
    - Tighten or generate TypeScript definitions for WASM-bound APIs, ensuring that invalid shapes cannot be passed without explicit casting.
    - Use `@vizij/value-json` and related helpers to standardize JSON/value coercion at the boundary.
    - Explore using `wasm-bindgen` fuzzing tools or property-based tests to stress-test edge cases at the boundary.

## 5. Risks & Unknowns

*   **Performance**: Excessive error checking or `catch_unwind` can have performance costs; we need to focus on critical entry points and keep hot paths lean.
*   **Tooling Limitations**: `wasm-bindgen` and related tooling have limits on what types can be safely passed; we must work within these constraints and document any sharp edges.
*   **Compatibility**: Tightening type and version enforcement may surface previously silent mismatches; this is desirable, but could initially cause friction for downstream consumers.

## 6. Success Metrics

*   **Crash Rate**: Reduction in "unrecoverable" WASM crashes in demos and applications.
*   **Developer Experience**: Clear, actionable error messages when version mismatches or boundary issues occur.
*   **Release Confidence**: Ability to bump ABI versions and ship new WASM builds with confidence that mismatches will be detected early and reported cleanly.
