# Reference: Safe Deep Cloning
<!-- tags: status=draft; topics=code-quality,utility -->

## API Reference

### `cloneDeepSafe<T>(value: T, options?: CloneOptions): T`

Performs a deep clone of the given value, preserving `Map`, `Set`, `Date`, `RegExp`, `TypedArray`, and `ArrayBuffer`.

**Parameters:**
- `value`: The value to clone.
- `options`:
  - `transfer`: An array of `Transferable` objects (e.g., `ArrayBuffer`) to transfer ownership of, rather than cloning.

**Returns:**
- A deep copy of `value`.

**Example:**
```typescript
import { cloneDeepSafe } from '@vizij/utils';

const original = {
  date: new Date(),
  map: new Map([['key', 'value']]),
  buffer: new Uint8Array([1, 2, 3])
};

const copy = cloneDeepSafe(original);
// copy.date is a Date object
// copy.map is a Map
// copy.buffer is a Uint8Array
```

## Implementation Details
- **Primary Strategy**: `structuredClone` (native).
- **Fallback Strategy**: Recursive traversal with type-specific cloning logic.
- **Limitations**: Does not clone functions or DOM nodes (throws error).
