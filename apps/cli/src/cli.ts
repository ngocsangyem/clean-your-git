/**
 * Main CLI flow and orchestration
 */
import {
  GitOperations,
  BranchAnalyzer,
  BranchManager,
  type FilterOptions,
  type BranchInfo,
} from '@branch-cleanup/core';
import {
  promptRepoPath,
  promptTargetBranch,
  promptBranchesToDelete,
  confirmDeletion,
  promptPattern,
  promptExcludePattern,
  promptOlderThan,
} from './prompts.js';
import {
  displayHeader,
  displayBranches,
  displayAnalysisSummary,
  displayDeletionResults,
  displayError,
  displaySuccess,
  displayWarning,
  displayInfo,
  displayLoading,
  clearLine,
} from './display.js';

export interface CLIOptions {
  repoPath?: string;
  targetBranch?: string;
  pattern?: string;
  excludePattern?: string;
  olderThan?: string;
  dryRun: boolean;
  interactive: boolean;
}

/**
 * Main CLI execution flow
 */
export async function runCLI(options: CLIOptions): Promise<void> {
  try {
    displayHeader('0.1.0');

    // Step 1: Get repository path
    const repoPath = options.repoPath ?? (await promptRepoPath());
    displayInfo(`Using repository: ${repoPath}`);

    // Step 2: Initialize git operations
    displayLoading('Initializing git operations');
    const gitOps = new GitOperations(repoPath);
    const branchAnalyzer = new BranchAnalyzer(gitOps);
    const branchManager = new BranchManager(gitOps);
    clearLine();
    displaySuccess('Git operations initialized');

    // Step 3: Get current branch
    displayLoading('Fetching current branch');
    const currentBranch = await gitOps.getCurrentBranch();
    clearLine();
    displayInfo(`Current branch: ${currentBranch}`);

    // Step 4: Get all branches
    displayLoading('Fetching all branches');
    const allBranches = await gitOps.getBranches();
    clearLine();
    displaySuccess(`Found ${allBranches.length} branches`);

    if (allBranches.length === 0) {
      displayWarning('No branches found in repository');
      return;
    }

    // Step 5: Get target branch
    const targetBranch =
      options.targetBranch ?? (await promptTargetBranch(allBranches));
    displayInfo(`Target branch: ${targetBranch}`);

    // Step 6: Build filter options
    const filterOptions: FilterOptions = {};

    if (options.interactive) {
      // Interactive mode: prompt for filters
      filterOptions.pattern = await promptPattern();
      filterOptions.excludePattern = await promptExcludePattern();
      filterOptions.olderThan = await promptOlderThan();
    } else {
      // Non-interactive mode: use CLI options
      if (options.pattern) {
        filterOptions.pattern = options.pattern;
      }
      if (options.excludePattern) {
        filterOptions.excludePattern = options.excludePattern;
      }
      if (options.olderThan) {
        filterOptions.olderThan = new Date(options.olderThan);
      }
    }

    // Display active filters
    if (filterOptions.pattern) {
      displayInfo(`Pattern filter: ${filterOptions.pattern}`);
    }
    if (filterOptions.excludePattern) {
      displayInfo(`Exclude pattern: ${filterOptions.excludePattern}`);
    }
    if (filterOptions.olderThan) {
      displayInfo(
        `Date filter: branches older than ${filterOptions.olderThan.toLocaleDateString()}`
      );
    }

    // Step 7: Analyze branches
    displayLoading('Analyzing branches');
    const analyzeResult = await branchAnalyzer.analyzeMergedBranches(
      targetBranch,
      filterOptions
    );
    clearLine();
    displaySuccess('Branch analysis complete');

    // Step 8: Display analysis results
    displayAnalysisSummary(analyzeResult);
    displayBranches(analyzeResult.mergedBranches, 'Merged Branches', currentBranch);
    displayBranches(analyzeResult.unmergedBranches, 'Unmerged Branches', currentBranch);

    // Step 9: Filter out current and target branches
    const deletableBranches = analyzeResult.mergedBranches.filter(
      (b: BranchInfo) => b.name !== currentBranch && b.name !== targetBranch
    );

    if (deletableBranches.length === 0) {
      displayWarning('No branches available for deletion');
      return;
    }

    // Step 10: Select branches to delete
    const branchesToDelete = options.interactive
      ? await promptBranchesToDelete(deletableBranches, currentBranch, targetBranch)
      : deletableBranches.map((b: BranchInfo) => b.name);

    if (branchesToDelete.length === 0) {
      displayInfo('No branches selected for deletion');
      return;
    }

    // Step 11: Confirm deletion
    const confirmed = await confirmDeletion(branchesToDelete, options.dryRun);
    if (!confirmed) {
      displayInfo('Operation cancelled');
      return;
    }

    // Step 12: Delete branches
    if (options.dryRun) {
      displayInfo('Dry run mode: no branches will be deleted');
      const dryRunResult = {
        deleted: branchesToDelete,
        failed: [],
      };
      displayDeletionResults(dryRunResult, true);
    } else {
      displayLoading(`Deleting ${branchesToDelete.length} branch(es)`);
      const deleteResult = await branchManager.deleteBranches(branchesToDelete);
      clearLine();
      displayDeletionResults(deleteResult, false);

      if (deleteResult.deleted.length > 0) {
        displaySuccess('Branch cleanup completed successfully!');
      }
      if (deleteResult.failed.length > 0) {
        displayWarning('Some branches could not be deleted');
      }
    }
  } catch (error) {
    displayError(
      'An error occurred during branch cleanup',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}
