import { Command } from 'commander';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { detectChangedPaths } from '../utils/git.js';
import { filterTargets } from '../utils/workspace.js';

const exec = promisify(execFile);

export function runAffectedCommand() {
  const cmd = new Command('run-affected')
    .argument('<task>', 'task name to run (e.g., lint, test, build)')
    .option('--base <ref>', 'base ref for diff (default auto)')
    .option('--all', 'ignore diff and run across all targets', false)
    .description('Run a task across changed workspaces/crates')
    .action(async (task, opts) => {
      const changed = opts.all ? null : await detectChangedPaths(opts.base);
      const targets = await filterTargets({ changed });
      const failures: string[] = [];
      for (const t of targets) {
        const { type, path, display } = t;
        const run = taskCommand(type, task);
        if (!run) continue;
        console.log(`::group::${display} -> ${task}`);
        try {
          await exec(run.cmd, run.args, { cwd: path, shell: true, maxBuffer: 10 * 1024 * 1024 });
        } catch (e) {
          failures.push(display);
        } finally {
          console.log('::endgroup::');
        }
      }
      if (failures.length) {
        console.error(`Failed targets: ${failures.join(', ')}`);
        process.exit(1);
      }
    });

  return cmd;
}

function taskCommand(type: 'workspace' | 'crate', task: string) {
  if (type === 'workspace') {
    const map: Record<string, { cmd: string; args: string[] }> = {
      lint: { cmd: 'pnpm', args: ['lint'] },
      test: { cmd: 'pnpm', args: ['test'] },
      build: { cmd: 'pnpm', args: ['build'] },
      validate: { cmd: 'pnpm', args: ['-w', 'run', 'lint', '&&', 'pnpm', 'run', 'typecheck', '&&', 'pnpm', 'run', 'test'] },
    };
    return map[task];
  } else {
    const map: Record<string, { cmd: string; args: string[] }> = {
      lint: { cmd: 'cargo', args: ['clippy', '--all-targets', '--all-features', '--', '-D', 'warnings'] },
      test: { cmd: 'cargo', args: ['nextest', 'run', '--all'] },
      build: { cmd: 'cargo', args: ['build', '--all'] },
      validate: { cmd: 'bash', args: ['-lc', 'rustup component add rustfmt >/dev/null 2>&1 || true; cargo fmt --all -- --check && cargo clippy --all-targets --all-features -- -D warnings && cargo nextest run --all'] },
    };
    return map[task];
  }
}
