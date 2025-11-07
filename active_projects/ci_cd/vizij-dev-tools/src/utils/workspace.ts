import fg from 'fast-glob';
import path from 'node:path';

type Target = { type: 'workspace' | 'crate'; path: string; display: string };

export async function filterTargets({ changed }: { changed: string[] | null }): Promise<Target[]> {
  const ws = (await fg(['packages/*/package.json'])).map((p) => ({ type: 'workspace' as const, path: path.dirname(p), display: path.dirname(p) }));
  const crates = (await fg(['crates/*/Cargo.toml'])).map((p) => ({ type: 'crate' as const, path: path.dirname(p), display: path.dirname(p) }));
  const all = [...ws, ...crates];
  if (!changed) return all;
  const matched = new Set<Target>();
  for (const t of all) {
    const prefix = t.path.endsWith('/') ? t.path : t.path + '/';
    if (changed.some((c) => c.startsWith(prefix) || c === t.path)) {
      matched.add(t);
    }
  }
  return Array.from(matched);
}
