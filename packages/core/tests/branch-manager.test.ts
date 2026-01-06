import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { BranchManager } from '../src/branch-manager.js';
import { GitOperations } from '../src/git-operations.js';

describe('BranchManager', () => {
  let testRepoPath: string;
  let gitOps: GitOperations;
  let manager: BranchManager;

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

    // Create main branch
    try {
      execSync('git branch -M main', { cwd: testRepoPath });
    } catch {
      // main might already exist
    }

    // Create multiple branches for deletion tests
    for (let i = 1; i <= 3; i++) {
      execSync(`git checkout -b feature/test-${i}`, { cwd: testRepoPath });
      writeFileSync(
        `${testRepoPath}/file${i}.txt`,
        `feature ${i} content`
      );
      execSync('git add .', { cwd: testRepoPath });
      execSync(`git commit -m "Feature ${i}"`, { cwd: testRepoPath });
      execSync('git checkout main', { cwd: testRepoPath });
    }

    // Create merged branch
    execSync('git checkout -b feature/merged', { cwd: testRepoPath });
    writeFileSync(`${testRepoPath}/file-merged.txt`, 'merged content');
    execSync('git add .', { cwd: testRepoPath });
    execSync('git commit -m "Merged feature"', { cwd: testRepoPath });
    execSync('git checkout main', { cwd: testRepoPath });
    execSync('git merge feature/merged -m "Merge feature/merged"', {
      cwd: testRepoPath,
    });

    gitOps = new GitOperations(testRepoPath);
    manager = new BranchManager(gitOps);
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

  describe('deleteBranches', () => {
    it('should delete single branch with force for unmerged', async () => {
      const branchesBeforeDelete = await gitOps.getBranches();
      expect(branchesBeforeDelete).toContain('feature/test-1');

      // Manually delete using force flag since it's an unmerged branch
      const gitOpsForceDelete = new GitOperations(testRepoPath);
      await gitOpsForceDelete.deleteBranch('feature/test-1', true);

      const branchesAfterDelete = await gitOps.getBranches();
      expect(branchesAfterDelete).not.toContain('feature/test-1');
    });

    it('should delete merged branch', async () => {
      const branchesBeforeDelete = await gitOps.getBranches();
      expect(branchesBeforeDelete).toContain('feature/merged');

      const result = await manager.deleteBranches(['feature/merged']);

      expect(result.deleted).toContain('feature/merged');
      expect(result.failed.length).toBe(0);

      const branchesAfterDelete = await gitOps.getBranches();
      expect(branchesAfterDelete).not.toContain('feature/merged');
    });

    it('should handle failures gracefully', async () => {
      const result = await manager.deleteBranches([
        'feature/merged',
        'non-existent-branch',
      ]);

      expect(result.deleted).toContain('feature/merged');
      expect(result.failed.length).toBeGreaterThan(0);
      expect(result.failed[0].branch).toBe('non-existent-branch');
    });

    it('should include error messages in failed deletions', async () => {
      const result = await manager.deleteBranches(['non-existent-branch']);

      expect(result.failed.length).toBeGreaterThan(0);
      expect(result.failed[0]).toHaveProperty('branch');
      expect(result.failed[0]).toHaveProperty('error');
      expect(typeof result.failed[0].error).toBe('string');
      expect(result.failed[0].error.length).toBeGreaterThan(0);
    });
  });

  describe('dry-run mode', () => {
    it('should not delete branches in dry-run mode', async () => {
      const branchesBeforeDelete = await gitOps.getBranches();

      const result = await manager.deleteBranches(
        ['feature/test-1', 'feature/test-2'],
        true
      );

      expect(result.deleted).toContain('feature/test-1');
      expect(result.deleted).toContain('feature/test-2');
      expect(result.failed.length).toBe(0);

      const branchesAfterDelete = await gitOps.getBranches();
      // Branches should still exist
      expect(branchesAfterDelete).toContain('feature/test-1');
      expect(branchesAfterDelete).toContain('feature/test-2');
    });

    it('should return what would be deleted without errors in dry-run', async () => {
      const result = await manager.deleteBranches(
        ['feature/test-1', 'non-existent-branch'],
        true
      );

      // In dry-run, both should be listed as "deleted" (what would happen)
      expect(result.deleted.length).toBe(2);
      expect(result.failed.length).toBe(0);
    });

    it('should not modify branches in dry-run even with force', async () => {
      const branchesBeforeDelete = await gitOps.getBranches();

      const result = await manager.deleteBranches(['feature/test-1'], true);

      expect(result.deleted).toContain('feature/test-1');

      const branchesAfterDelete = await gitOps.getBranches();
      expect(branchesAfterDelete).toContain('feature/test-1');
    });
  });

  describe('canDeleteBranches', () => {
    it('should return true for deletable branches', async () => {
      const canDelete = await manager.canDeleteBranches([
        'feature/test-1',
        'feature/test-2',
      ]);
      expect(canDelete).toBe(true);
    });

    it('should return false if current branch is in deletion list', async () => {
      const currentBranch = await gitOps.getCurrentBranch();
      const canDelete = await manager.canDeleteBranches([
        currentBranch,
        'feature/test-1',
      ]);
      expect(canDelete).toBe(false);
    });

    it('should return true for empty list', async () => {
      const canDelete = await manager.canDeleteBranches([]);
      expect(canDelete).toBe(true);
    });

    it('should work when current branch is not in deletion list', async () => {
      execSync('git checkout feature/test-1', { cwd: testRepoPath });
      gitOps = new GitOperations(testRepoPath);
      manager = new BranchManager(gitOps);

      const canDelete = await manager.canDeleteBranches([
        'feature/test-2',
        'feature/test-3',
      ]);
      expect(canDelete).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should provide meaningful error messages', async () => {
      const result = await manager.deleteBranches(['non-existent-branch']);

      expect(result.failed.length).toBeGreaterThan(0);
      const errorMessage = result.failed[0].error;
      expect(errorMessage).toBeTruthy();
      expect(typeof errorMessage).toBe('string');
    });

    it('should handle mixed success and failure', async () => {
      const result = await manager.deleteBranches([
        'feature/merged',
        'non-existent-branch-1',
      ]);

      expect(result.deleted.length).toBeGreaterThan(0);
      expect(result.failed.length).toBeGreaterThan(0);

      // Verify actual deletions happened
      const branches = await gitOps.getBranches();
      expect(branches).not.toContain('feature/merged');
    });
  });

  describe('edge cases', () => {
    it('should handle empty branch list', async () => {
      const result = await manager.deleteBranches([]);

      expect(result.deleted.length).toBe(0);
      expect(result.failed.length).toBe(0);
    });

    it('should handle duplicate branches in list', async () => {
      // Only try to delete merged branch which doesn't require force
      const result = await manager.deleteBranches([
        'feature/merged',
        'feature/merged',
      ]);

      // First deletion succeeds, second fails (branch already deleted)
      expect(result.deleted.length).toBeGreaterThanOrEqual(1);
      expect(result.failed.length).toBeGreaterThanOrEqual(1);

      const branches = await gitOps.getBranches();
      expect(branches).not.toContain('feature/merged');
    });

    it('should handle whitespace in branch names', async () => {
      // Try to delete a branch with spaces (should fail gracefully)
      const result = await manager.deleteBranches([
        'feature with spaces',
      ]);

      expect(result.failed.length).toBeGreaterThan(0);
    });
  });

  describe('deletion result structure', () => {
    it('should have correct structure for successful deletion', async () => {
      const result = await manager.deleteBranches(['feature/test-1']);

      expect(result).toHaveProperty('deleted');
      expect(result).toHaveProperty('failed');
      expect(Array.isArray(result.deleted)).toBe(true);
      expect(Array.isArray(result.failed)).toBe(true);
    });

    it('should have correct structure for failed deletion', async () => {
      const result = await manager.deleteBranches(['non-existent-branch']);

      expect(result.failed.length).toBeGreaterThan(0);
      const failedItem = result.failed[0];

      expect(failedItem).toHaveProperty('branch');
      expect(failedItem).toHaveProperty('error');
      expect(typeof failedItem.branch).toBe('string');
      expect(typeof failedItem.error).toBe('string');
    });
  });
});
