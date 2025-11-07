import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function validateWorkspaceRanges(): Promise<void> {
  const pkgFiles = await fg(['packages/*/package.json'], { dot: false });
  let bad = 0;
  for (const file of pkgFiles) {
    const full = path.resolve(file);
    const json = JSON.parse(await readFile(full, 'utf8'));
    const deps = Object.assign({}, json.dependencies || {}, json.devDependencies || {}, json.peerDependencies || {});
    const offenders = Object.entries(deps).filter(([_, v]) => String(v).startsWith('workspace:'));
    if (offenders.length) {
      bad++;
      console.error(`Workspace ranges found in ${file}: ${offenders.map(([k]) => k).join(', ')}`);
    }
  }
  if (bad) {
    process.exit(1);
  }
}
