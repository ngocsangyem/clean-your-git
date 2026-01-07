import simpleGit, { type SimpleGit } from 'simple-git';
import type { BranchInfo } from './types.js';
import { GitOperationError } from './errors.js';

/**
 * Handles all git operations using simple-git
 */
export class GitOperations {
  private git: SimpleGit;
  private repoPath: string;

  /**
   * @param repoPath - Absolute path to git repository
   */
  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  /**
   * Check if the path is a valid git repository
   * @returns true if valid git repository
   */
  async isValidRepo(): Promise<boolean> {
    try {
      await this.git.checkIsRepo();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get list of all local branches
   * @returns Array of branch names
   */
  async getBranches(): Promise<string[]> {
    try {
      const summary = await this.git.branchLocal();
      return summary.all;
    } catch (error) {
      throw new GitOperationError(
        'Failed to get branch list',
        'getBranches',
        error as Error
      );
    }
  }

  /**
   * Get the currently checked out branch
   * @returns Current branch name
   */
  async getCurrentBranch(): Promise<string> {
    try {
      const summary = await this.git.branchLocal();
      return summary.current;
    } catch (error) {
      throw new GitOperationError(
        'Failed to get current branch',
        'getCurrentBranch',
        error as Error
      );
    }
  }

  /**
   * Check if a branch is fully merged into target branch
   * @param branch - Branch to check
   * @param target - Target branch to compare against
   * @returns true if branch is merged
   */
  async isBranchMerged(branch: string, target: string): Promise<boolean> {
    try {
      const result = await this.git.raw(['branch', '--merged', target]);
      const mergedBranches = result
        .split('\n')
        .map((b) => b.trim().replace(/^\*\s*/, ''))
        .filter(Boolean);

      return mergedBranches.includes(branch);
    } catch (error) {
      throw new GitOperationError(
        `Failed to check if branch '${branch}' is merged`,
        'isBranchMerged',
        error as Error
      );
    }
  }

  /**
   * Get detailed information about a branch
   * @param branch - Branch name
   * @returns Branch information
   */
  async getBranchDetails(branch: string): Promise<BranchInfo> {
    try {
      // Get last commit info: hash|date|subject
      const logResult = await this.git.raw([
        'log',
        '-1',
        '--format=%H|%aI|%s',
        branch,
      ]);

      const [hash, date] = logResult.trim().split('|');

      return {
        name: branch,
        lastCommitHash: hash?.substring(0, 7) ?? 'unknown',
        lastCommitDate: date ?? new Date().toISOString(),
        isMerged: false, // Will be set by analyzer
      };
    } catch (error) {
      throw new GitOperationError(
        `Failed to get details for branch '${branch}'`,
        'getBranchDetails',
        error as Error
      );
    }
  }

  /**
   * Delete a local branch
   * @param branch - Branch name to delete
   * @param force - Force deletion even if not merged
   */
  async deleteBranch(branch: string, force = false): Promise<void> {
    try {
      await this.git.deleteLocalBranch(branch, force);
    } catch (error) {
      throw new GitOperationError(
        `Failed to delete branch '${branch}'`,
        'deleteBranch',
        error as Error
      );
    }
  }

  /**
   * Get the author of first commit on branch
   * Uses merge-base to find branch point, then first commit after
   * @param branch - Branch name
   * @param targetBranch - Target branch to compare against
   * @returns Author information (name, email, date)
   */
  async getBranchAuthor(
    branch: string,
    targetBranch: string
  ): Promise<{ name: string; email: string; date: string }> {
    try {
      // Find merge base (where branch diverged)
      const mergeBase = await this.git.raw([
        'merge-base',
        targetBranch,
        branch,
      ]);

      // Get first commit on branch after merge base
      const result = await this.git.raw([
        'log',
        '--format=%an|%ae|%aI',
        '--reverse',
        `${mergeBase.trim()}..${branch}`,
        '-1',
      ]);

      if (!result.trim()) {
        // Fallback: use last commit author
        const fallback = await this.git.raw([
          'log',
          '-1',
          '--format=%an|%ae|%aI',
          branch,
        ]);
        const [name, email, date] = fallback.trim().split('|');
        return {
          name: name || 'Unknown',
          email: email || '',
          date: date || '',
        };
      }

      const [name, email, date] = result.trim().split('|');
      return {
        name: name || 'Unknown',
        email: email || '',
        date: date || '',
      };
    } catch {
      return { name: 'Unknown', email: '', date: '' };
    }
  }

  /**
   * Get repository path
   */
  getRepoPath(): string {
    return this.repoPath;
  }
}
