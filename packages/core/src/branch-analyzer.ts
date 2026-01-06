import type { AnalyzeResult, BranchInfo, FilterOptions } from './types.js';
import { GitOperations } from './git-operations.js';
import { GitOperationError } from './errors.js';

/**
 * Analyzes branches and determines merge status
 */
export class BranchAnalyzer {
  constructor(private gitOps: GitOperations) {}

  /**
   * Analyze all branches and determine which are merged into target
   * @param targetBranch - Branch to compare against
   * @param filters - Optional filters to apply
   * @returns Analysis result with merged and unmerged branches
   */
  async analyzeMergedBranches(
    targetBranch: string,
    filters?: FilterOptions
  ): Promise<AnalyzeResult> {
    try {
      const allBranches = await this.gitOps.getBranches();
      const currentBranch = await this.gitOps.getCurrentBranch();

      // Get details for all branches
      const branchDetails = await Promise.all(
        allBranches.map((branch) => this.gitOps.getBranchDetails(branch))
      );

      // Check merge status for each branch
      const branchesWithMergeStatus = await Promise.all(
        branchDetails.map(async (branch) => {
          const isMerged = await this.gitOps.isBranchMerged(
            branch.name,
            targetBranch
          );
          return { ...branch, isMerged };
        })
      );

      // Exclude current branch and target branch from results
      let filteredBranches = branchesWithMergeStatus.filter(
        (b) => b.name !== currentBranch && b.name !== targetBranch
      );

      // Apply additional filters if provided
      if (filters) {
        filteredBranches = this.filterBranches(filteredBranches, filters);
      }

      const mergedBranches = filteredBranches.filter((b) => b.isMerged);
      const unmergedBranches = filteredBranches.filter((b) => !b.isMerged);

      return {
        targetBranch,
        mergedBranches,
        unmergedBranches,
        totalBranches: filteredBranches.length,
      };
    } catch (error) {
      if (error instanceof GitOperationError) {
        throw error;
      }
      throw new GitOperationError(
        'Failed to analyze branches',
        'analyzeMergedBranches',
        error as Error
      );
    }
  }

  /**
   * Filter branches based on provided options
   * @param branches - Branches to filter
   * @param filters - Filter criteria
   * @returns Filtered branches
   */
  filterBranches(branches: BranchInfo[], filters: FilterOptions): BranchInfo[] {
    let filtered = branches;

    // Apply pattern filter (include)
    if (filters.pattern) {
      try {
        const regex = new RegExp(filters.pattern);
        filtered = filtered.filter((b) => regex.test(b.name));
      } catch (error) {
        throw new GitOperationError(
          `Invalid regex pattern: ${filters.pattern}`,
          'filterBranches',
          error as Error
        );
      }
    }

    // Apply exclude pattern filter
    if (filters.excludePattern) {
      try {
        const excludeRegex = new RegExp(filters.excludePattern);
        filtered = filtered.filter((b) => !excludeRegex.test(b.name));
      } catch (error) {
        throw new GitOperationError(
          `Invalid exclude regex pattern: ${filters.excludePattern}`,
          'filterBranches',
          error as Error
        );
      }
    }

    // Apply date filter
    if (filters.olderThan) {
      filtered = filtered.filter((b) => {
        const commitDate = new Date(b.lastCommitDate);
        return commitDate < filters.olderThan!;
      });
    }

    return filtered;
  }
}
