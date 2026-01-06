/**
 * Display and formatting utilities for CLI output
 */
import chalk from 'chalk';
import Table from 'cli-table3';
import type { BranchInfo, AnalyzeResult, DeleteResult } from '@branch-cleanup/core';

/**
 * Display branches in a formatted table
 */
export function displayBranches(
  branches: BranchInfo[],
  title: string,
  currentBranch: string
): void {
  if (branches.length === 0) {
    console.log(chalk.yellow(`\n${title}: None`));
    return;
  }

  console.log(chalk.bold(`\n${title}:`));

  const table = new Table({
    head: [
      chalk.cyan('Branch'),
      chalk.cyan('Last Commit Date'),
      chalk.cyan('Commit Hash'),
      chalk.cyan('Status'),
    ],
    colWidths: [30, 25, 15, 15],
  });

  branches.forEach((branch) => {
    const isCurrent = branch.name === currentBranch;
    const branchName = isCurrent ? chalk.green(`${branch.name} *`) : branch.name;
    const date = new Date(branch.lastCommitDate).toLocaleString();
    const status = branch.isMerged ? chalk.green('Merged') : chalk.yellow('Unmerged');

    table.push([branchName, date, branch.lastCommitHash, status]);
  });

  console.log(table.toString());
}

/**
 * Display analysis summary
 */
export function displayAnalysisSummary(result: AnalyzeResult): void {
  console.log(chalk.bold('\n📊 Analysis Summary:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`${chalk.cyan('Target Branch:')} ${result.targetBranch}`);
  console.log(`${chalk.cyan('Total Branches:')} ${result.totalBranches}`);
  console.log(`${chalk.green('Merged Branches:')} ${result.mergedBranches.length}`);
  console.log(`${chalk.yellow('Unmerged Branches:')} ${result.unmergedBranches.length}`);
  console.log(chalk.gray('─'.repeat(50)));
}

/**
 * Display deletion results
 */
export function displayDeletionResults(result: DeleteResult, dryRun: boolean): void {
  const action = dryRun ? 'Would delete' : 'Deleted';

  console.log(chalk.bold('\n🗑️  Deletion Results:'));
  console.log(chalk.gray('─'.repeat(50)));

  if (result.deleted.length > 0) {
    console.log(chalk.green(`\n✓ ${action} ${result.deleted.length} branch(es):`));
    result.deleted.forEach((branch) => {
      console.log(chalk.green(`  • ${branch}`));
    });
  }

  if (result.failed.length > 0) {
    console.log(chalk.red(`\n✗ Failed to delete ${result.failed.length} branch(es):`));
    result.failed.forEach(({ branch, error }) => {
      console.log(chalk.red(`  • ${branch}: ${error}`));
    });
  }

  console.log(chalk.gray('─'.repeat(50)));
}

/**
 * Display error message
 */
export function displayError(message: string, error?: Error): void {
  console.error(chalk.red('\n✗ Error:'), message);
  if (error) {
    console.error(chalk.gray(error.message));
    if (process.env.DEBUG) {
      console.error(chalk.gray(error.stack));
    }
  }
}

/**
 * Display success message
 */
export function displaySuccess(message: string): void {
  console.log(chalk.green(`\n✓ ${message}`));
}

/**
 * Display warning message
 */
export function displayWarning(message: string): void {
  console.log(chalk.yellow(`\n⚠ ${message}`));
}

/**
 * Display info message
 */
export function displayInfo(message: string): void {
  console.log(chalk.blue(`\nℹ ${message}`));
}

/**
 * Display a loading spinner message
 */
export function displayLoading(message: string): void {
  process.stdout.write(chalk.cyan(`⏳ ${message}...`));
}

/**
 * Clear the current line (for loading messages)
 */
export function clearLine(): void {
  process.stdout.write('\r\x1b[K');
}

/**
 * Display header with app name and version
 */
export function displayHeader(version: string): void {
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║     Git Branch Cleanup Tool            ║'));
  console.log(chalk.bold.cyan(`║     Version ${version.padEnd(28)}║`));
  console.log(chalk.bold.cyan('╔════════════════════════════════════════╗\n'));
}
