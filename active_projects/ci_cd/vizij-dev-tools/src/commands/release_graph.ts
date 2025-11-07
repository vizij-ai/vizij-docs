import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type NodeKind = 'npm' | 'crate';
type Node = { kind: NodeKind; name: string; dir: string; deps: string[] };

export async function releaseGraph(): Promise<string[]> {
  const nodes: Node[] = [];
  // npm packages
  for (const pkgJson of await fg(['packages/*/package.json'], { dot: false })) {
    const full = path.resolve(pkgJson);
    const pkg = JSON.parse(await readFile(full, 'utf8'));
    const name = pkg.name as string;
    const dir = path.dirname(full);
    const deps = Object.assign({}, pkg.dependencies || {}, pkg.peerDependencies || {}, pkg.optionalDependencies || {});
    const workspaceDeps = Object.keys(deps).filter((k) => String(deps[k]).startsWith('workspace:'));
    nodes.push({ kind: 'npm', name, dir, deps: workspaceDeps });
  }
  // crates
  for (const cargo of await fg(['crates/*/Cargo.toml'], { dot: false })) {
    const full = path.resolve(cargo);
    const dir = path.dirname(full);
    const name = path.basename(dir);
    // naive: assume workspace crates depend on each other by path; a real impl would parse Cargo.toml
    nodes.push({ kind: 'crate', name, dir, deps: [] });
  }
  // simple toposort: ensure dependencies come first for npm nodes
  const names = nodes.map((n) => (n.kind === 'npm' ? n.name : `crate:${n.name}`));
  const edges: [string, string][] = [];
  for (const n of nodes) {
    if (n.kind === 'npm') {
      for (const d of n.deps) edges.push([d, n.name]);
    }
  }
  const order = topoSort(names, edges);
  return order;
}

function topoSort(nodes: string[], edges: [string, string][]): string[] {
  const incoming = new Map(nodes.map((n) => [n, 0]));
  const out = new Map<string, string[]>();
  for (const [from, to] of edges) {
    incoming.set(to, (incoming.get(to) || 0) + 1);
    out.set(from, [...(out.get(from) || []), to]);
  }
  const q = nodes.filter((n) => (incoming.get(n) || 0) === 0);
  const res: string[] = [];
  while (q.length) {
    const n = q.shift()!;
    res.push(n);
    for (const m of out.get(n) || []) {
      incoming.set(m, (incoming.get(m) || 0) - 1);
      if ((incoming.get(m) || 0) === 0) q.push(m);
    }
  }
  if (res.length !== nodes.length) {
    throw new Error('Cycle detected in dependency graph');
  }
  return res;
}
