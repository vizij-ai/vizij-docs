import { Command } from 'commander';
import { runAffectedCommand } from './commands/run-affected.js';
import { releaseCommand } from './commands/release.js';
import { hooksCommand } from './commands/hooks.js';

const program = new Command();
program.name('vizij').description('vizij dev-tools CLI').version('0.1.0');

program.addCommand(runAffectedCommand());
program.addCommand(releaseCommand());
program.addCommand(hooksCommand());

program.parseAsync().catch((err) => {
  console.error(err);
  process.exit(1);
});
