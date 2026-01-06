import type { DeleteResult } from './types.js';
import { GitOperations } from './git-operations.js';
import { GitOperationError } from './errors.js';

/**
 * Manages branch deletion operations
 */
export class BranchManager {
  constructor(private gitOps: GitOperations) {}

  /**
   * Delete multiple branches
   * @param branches - Array of branch names to delete
   * @param dryRun - If true, simulate deletion without actually deleting
   * @returns Deletion result with successful and failed deletions
   */
  async deleteBranches(
    branches: string[],
    dryRun = false
  ): Promise<DeleteResult> {
    const deleted: string[] = [];
    const failed: Array<{ branch: string; error: string }> = [];

    // In dry-run mode, just return what would be deleted
    if (dryRun) {
      return {
        deleted: branches,
        failed: [],
      };
    }

    // Attempt to delete each branch
    for (const branch of branches) {
      try {
        await this.gitOps.deleteBranch(branch);
        deleted.push(branch);
      } catch (error) {
        const errorMessage =
          error instanceof GitOperationError
            ? error.getFullMessage()
            : error instanceof Error
              ? error.message
              : 'Unknown error';

        failed.push({
          branch,
          error: errorMessage,
        });
      }
    }

    return { deleted, failed };
  }

  /**
   * Check if branches can be deleted safely
   * @param branches - Branches to check
   * @returns true if all branches can be deleted
   */
  async canDeleteBranches(branches: string[]): Promise<boolean> {
    try {
      const currentBranch = await this.gitOps.getCurrentBranch();

      // Cannot delete current branch
      if (branches.includes(currentBranch)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
