import { Command } from 'commander';
import { releaseGraph } from './release_graph.js';
import { validateWorkspaceRanges } from './release_validate_workspace_ranges.js';
import { releasePrepare } from './release_prepare.js';

export function releaseCommand() {
  const r = new Command('release').description('Release utilities');

  r.command('graph')
    .description('Output topological publish order as JSON')
    .option('--format <fmt>', 'json|text', 'json')
    .action(async (opts) => {
      const g = await releaseGraph();
      if (opts.format === 'text') {
        for (const n of g) console.log(n);
      } else {
        console.log(JSON.stringify(g));
      }
    });

  r.command('validate-workspace-ranges')
    .description('Fail if workspace: ranges leak into publish manifests')
    .action(async () => {
      await validateWorkspaceRanges();
    });

  r.command('prepare')
    .description('Apply version from tag and build in a scratchable way (stub)')
    .option('--tag <tag>', 'release tag (e.g., release/web/20250101-1200)')
    .action(async (opts) => {
      await releasePrepare(opts.tag);
    });

  return r;
}
