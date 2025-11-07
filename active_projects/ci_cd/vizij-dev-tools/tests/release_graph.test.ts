import { describe, it, expect } from 'vitest';
import { releaseGraph } from '../src/commands/release_graph';

describe('releaseGraph', () => {
  it('returns an array even when no packages exist', async () => {
    const g = await releaseGraph();
    expect(Array.isArray(g)).toBe(true);
  });
});
