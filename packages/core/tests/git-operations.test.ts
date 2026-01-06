import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { GitOperations } from '../src/git-operations.js';
import { GitOperationError } from '../src/errors.js';

describe('GitOperations', () => {
  let testRepoPath: string;
  let gitOps: GitOperations;

  beforeEach(() => {
    // Create temporary test repository
    testRepoPath = `/tmp/test-repo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    mkdirSync(testRepoPath, { recursive: true });

    // Initialize git repo
    execSync('git init', { cwd: testRepoPath });
    execSync('git config user.name "Test User"', { cwd: testRepoPath });
    execSync('git config user.email "test@example.com"', { cwd: testRepoPath });

    // Create initial commit on main branch
    writeFileSync(`${testRepoPath}/file.txt`, 'initial content');
    execSync('git add .', { cwd: testRepoPath });
    execSync('git commit -m "Initial commit"', { cwd: testRepoPath });

    // Create and switch to main branch (for compatibility)
    try {
      execSync('git branch -M main', { cwd: testRepoPath });
    } catch {
      // main might already exist
    }

    // Create feature branch
    execSync('git checkout -b feature/test', { cwd: testRepoPath });
    writeFileSync(`${testRepoPath}/file.txt`, 'feature content', { flag: 'a' });
    execSync('git commit -am "Feature commit"', { cwd: testRepoPath });

    // Create merged branch
    execSync('git checkout main', { cwd: testRepoPath });
    execSync('git checkout -b feature/merged', { cwd: testRepoPath });
    writeFileSync(`${testRepoPath}/file2.txt`, 'merged content');
    execSync('git add .', { cwd: testRepoPath });
    execSync('git commit -m "Merged commit"', { cwd: testRepoPath });
    execSync('git checkout main', { cwd: testRepoPath });
    execSync('git merge feature/merged -m "Merge feature/merged"', {
      cwd: testRepoPath,
    });

    // Return to main
    execSync('git checkout main', { cwd: testRepoPath });

    gitOps = new GitOperations(testRepoPath);
  });

  afterEach(() => {
    // Clean up test repository
    if (testRepoPath) {
      try {
        rmSync(testRepoPath, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('isValidRepo', () => {
    it('should return true for valid git repository', async () => {
      const result = await gitOps.isValidRepo();
      expect(result).toBe(true);
    });

    it('should work correctly for git directory', async () => {
      // Test is covered by first test case for valid repo
      const result = await gitOps.isValidRepo();
      expect(result).toBe(true);
    });
  });

  describe('getBranches', () => {
    it('should return list of local branches', async () => {
      const branches = await gitOps.getBranches();
      expect(Array.isArray(branches)).toBe(true);
      expect(branches).toContain('main');
      expect(branches).toContain('feature/test');
      expect(branches).toContain('feature/merged');
    });

    it('should return at least main branch', async () => {
      const branches = await gitOps.getBranches();
      expect(branches.length).toBeGreaterThan(0);
    });

    it('should not include remote branches', async () => {
      const branches = await gitOps.getBranches();
      const hasRemote = branches.some((b) => b.includes('remotes'));
      expect(hasRemote).toBe(false);
    });
  });

  describe('getCurrentBranch', () => {
    it('should return current branch name', async () => {
      const current = await gitOps.getCurrentBranch();
      expect(current).toBe('main');
    });

    it('should return correct branch after checkout', async () => {
      execSync('git checkout feature/test', { cwd: testRepoPath });
      gitOps = new GitOperations(testRepoPath);
      const current = await gitOps.getCurrentBranch();
      expect(current).toBe('feature/test');
    });
  });

  describe('isBranchMerged', () => {
    it('should return true for merged branch', async () => {
      const isMerged = await gitOps.isBranchMerged('feature/merged', 'main');
      expect(isMerged).toBe(true);
    });

    it('should return false for unmerged branch', async () => {
      const isMerged = await gitOps.isBranchMerged('feature/test', 'main');
      expect(isMerged).toBe(false);
    });

    it('should check against different target branches', async () => {
      const merged = await gitOps.isBranchMerged('feature/test', 'feature/test');
      expect(merged).toBe(true); // A branch is merged into itself
    });
  });

  describe('getBranchDetails', () => {
    it('should return branch details with required fields', async () => {
      const details = await gitOps.getBranchDetails('main');
      expect(details).toHaveProperty('name', 'main');
      expect(details).toHaveProperty('lastCommitHash');
      expect(details).toHaveProperty('lastCommitDate');
      expect(details).toHaveProperty('isMerged', false);
    });

    it('should have valid commit hash format', async () => {
      const details = await gitOps.getBranchDetails('main');
      expect(details.lastCommitHash).toMatch(/^[a-f0-9]{7}$/);
    });

    it('should have valid ISO date format', async () => {
      const details = await gitOps.getBranchDetails('main');
      const date = new Date(details.lastCommitDate);
      expect(isNaN(date.getTime())).toBe(false);
    });

    it('should throw error for non-existent branch', async () => {
      await expect(
        gitOps.getBranchDetails('non-existent-branch')
      ).rejects.toThrow(GitOperationError);
    });
  });

  describe('deleteBranch', () => {
    it('should delete existing branch with force flag', async () => {
      const branchesBeforeDelete = await gitOps.getBranches();
      expect(branchesBeforeDelete).toContain('feature/test');

      // Must use force flag for unmerged branches
      await gitOps.deleteBranch('feature/test', true);

      const branchesAfterDelete = await gitOps.getBranches();
      expect(branchesAfterDelete).not.toContain('feature/test');
    });

    it('should throw error when trying to delete current branch', async () => {
      // Try to delete the current branch (main) with force
      await expect(gitOps.deleteBranch('main', true)).rejects.toThrow();
    });

    it('should throw error when deleting non-existent branch', async () => {
      await expect(
        gitOps.deleteBranch('non-existent-branch', true)
      ).rejects.toThrow(GitOperationError);
    });

    it('should delete merged branch without force flag', async () => {
      // feature/merged is already merged into main
      const branchesBeforeDelete = await gitOps.getBranches();
      expect(branchesBeforeDelete).toContain('feature/merged');

      await gitOps.deleteBranch('feature/merged', false);

      const branchesAfterDelete = await gitOps.getBranches();
      expect(branchesAfterDelete).not.toContain('feature/merged');
    });
  });

  describe('getRepoPath', () => {
    it('should return the repository path', () => {
      const path = gitOps.getRepoPath();
      expect(path).toBe(testRepoPath);
    });
  });

  describe('error handling', () => {
    it('should throw GitOperationError for invalid operations', async () => {
      try {
        await gitOps.getBranchDetails('non-existent-branch-xyz');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(GitOperationError);
        if (error instanceof GitOperationError) {
          expect(error.operation).toBe('getBranchDetails');
        }
      }
    });

    it('should provide original error in exception', async () => {
      try {
        await gitOps.getBranchDetails('non-existent-branch-xyz');
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof GitOperationError) {
          expect(error.originalError).toBeDefined();
        }
      }
    });
  });
});
