import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);

export async function detectChangedPaths(base?: string): Promise<string[]> {
  // Try to infer base from the CI environment if not provided
  const baseRef = base || process.env.GITHUB_BASE_REF || 'origin/main';
  try {
    await exec('git', ['fetch', '--depth=200', 'origin', baseRef]);
  } catch {}
  const { stdout } = await exec('git', ['diff', '--name-only', `${baseRef}...HEAD`], { maxBuffer: 10*1024*1024 });
  return stdout.split('
').filter(Boolean);
}
