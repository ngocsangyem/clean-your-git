/**
 * Inquirer prompt functions for CLI interaction
 */
import { input, select, checkbox, confirm } from '@inquirer/prompts';
import { validateRepoPath } from '@branch-cleanup/core';
import type { BranchInfo } from '@branch-cleanup/core';

/**
 * Prompt for repository path with validation
 */
export async function promptRepoPath(): Promise<string> {
  return await input({
    message: 'Enter the path to the git repository:',
    default: process.cwd(),
    validate: (value: string) => {
      const result = validateRepoPath(value);
      return result.valid ? true : (result.error ?? 'Invalid repository path');
    },
  });
}

/**
 * Prompt for target branch selection
 */
export async function promptTargetBranch(branches: string[]): Promise<string> {
  return await select({
    message: 'Select the target branch to compare against:',
    choices: branches.map((branch) => ({
      name: branch,
      value: branch,
    })),
    default: branches.includes('main') ? 'main' : branches.includes('master') ? 'master' : branches[0],
  });
}

/**
 * Prompt for branches to delete with multi-select
 */
export async function promptBranchesToDelete(
  branches: BranchInfo[],
  currentBranch: string,
  targetBranch: string
): Promise<string[]> {
  if (branches.length === 0) {
    return [];
  }

  return await checkbox({
    message: 'Select branches to delete (space to select, enter to confirm):',
    choices: branches.map((branch) => ({
      name: `${branch.name} (last commit: ${new Date(branch.lastCommitDate).toLocaleDateString()})`,
      value: branch.name,
      checked: false,
      disabled: branch.name === currentBranch || branch.name === targetBranch,
    })),
  });
}

/**
 * Prompt for deletion confirmation
 */
export async function confirmDeletion(
  branches: string[],
  dryRun: boolean
): Promise<boolean> {
  if (branches.length === 0) {
    return false;
  }

  const action = dryRun ? 'preview deletion of' : 'delete';
  return await confirm({
    message: `Are you sure you want to ${action} ${branches.length} branch(es)?`,
    default: false,
  });
}

/**
 * Prompt for pattern filter (optional)
 */
export async function promptPattern(): Promise<string | undefined> {
  const pattern = await input({
    message: 'Enter a regex pattern to filter branches (or press enter to skip):',
    default: '',
  });
  return pattern.trim() || undefined;
}

/**
 * Prompt for exclude pattern (optional)
 */
export async function promptExcludePattern(): Promise<string | undefined> {
  const pattern = await input({
    message: 'Enter a regex pattern to exclude branches (or press enter to skip):',
    default: '',
  });
  return pattern.trim() || undefined;
}

/**
 * Prompt for date filter (optional)
 */
export async function promptOlderThan(): Promise<Date | undefined> {
  const dateStr = await input({
    message: 'Only include branches older than (YYYY-MM-DD, or press enter to skip):',
    default: '',
    validate: (value: string) => {
      if (!value.trim()) return true;
      const date = new Date(value);
      return !isNaN(date.getTime()) || 'Invalid date format. Use YYYY-MM-DD';
    },
  });

  if (!dateStr.trim()) return undefined;
  return new Date(dateStr);
}
