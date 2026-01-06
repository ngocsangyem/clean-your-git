#!/usr/bin/env node

/**
 * Entry point for the branch-cleanup CLI
 */
import { Command } from 'commander';
import { runCLI } from './cli.js';

const program = new Command();

program
  .name('branch-cleanup')
  .description('Clean up merged git branches interactively')
  .version('0.1.0')
  .option('-r, --repo-path <path>', 'Path to git repository')
  .option('-t, --target-branch <branch>', 'Target branch to compare against')
  .option('-p, --pattern <pattern>', 'Regex pattern to match branch names')
  .option('-e, --exclude-pattern <pattern>', 'Regex pattern to exclude branch names')
  .option(
    '-o, --older-than <date>',
    'Only include branches older than this date (YYYY-MM-DD)'
  )
  .option('-d, --dry-run', 'Preview changes without deleting branches', false)
  .option(
    '-i, --interactive',
    'Interactive mode with prompts for all options',
    true
  )
  .option(
    '--no-interactive',
    'Non-interactive mode (use command-line options only)'
  )
  .action(async (options) => {
    try {
      await runCLI({
        repoPath: options.repoPath,
        targetBranch: options.targetBranch,
        pattern: options.pattern,
        excludePattern: options.excludePattern,
        olderThan: options.olderThan,
        dryRun: options.dryRun,
        interactive: options.interactive,
      });
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  });

program.parse();
