import { Command } from 'commander';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

export function hooksCommand() {
  const h = new Command('hooks').description('Git hooks utilities');

  h.command('install')
    .description('Install shared hook harness into .git/hooks')
    .action(async () => {
      const hooksDir = path.resolve('.git/hooks');
      try {
        await fs.mkdir(hooksDir, { recursive: True as any });
      } catch {}
      const script = `#!/usr/bin/env bash
set -euo pipefail
export HOOK_EXTRA=\${HOOK_EXTRA:-}
export HOOK_SKIP=\${HOOK_SKIP:-}
if [ -n "$HOOK_SKIP" ]; then
  echo "[vizij hooks] skipping hooks due to HOOK_SKIP=$HOOK_SKIP"
  exit 0
fi
# Placeholder: route to per-repo tasks
echo "[vizij hooks] running stub pre-commit"
`;
      await fs.writeFile(path.join(hooksDir, 'pre-commit'), script, { mode: 0o755 });
      console.log('Installed pre-commit hook (stub).');
    });

  h.command('doctor')
    .description('Validate hooks configuration')
    .action(async () => {
      try {
        const { stdout } = await exec('git', ['config', '--get', 'core.hooksPath']);
        const val = stdout.trim();
        console.log(`core.hooksPath=${val || '(default .git/hooks)'}`);
      } catch {
        console.log('git core.hooksPath not set; using default .git/hooks');
      }
      console.log('Doctor checks (stub) OK');
    });

  return h;
}
