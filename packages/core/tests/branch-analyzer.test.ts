import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { BranchAnalyzer } from '../src/branch-analyzer.js';
import { GitOperations } from '../src/git-operations.js';
import { GitOperationError } from '../src/errors.js';

describe('BranchAnalyzer', () => {
  let testRepoPath: string;
  let gitOps: GitOperations;
  let analyzer: BranchAnalyzer;

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

    // Create merged branch
    execSync('git checkout -b feature/merged', { cwd: testRepoPath });
    writeFileSync(`${testRepoPath}/file.txt`, 'merged content', { flag: 'a' });
    execSync('git commit -am "Merged feature"', { cwd: testRepoPath });
    execSync('git checkout main', { cwd: testRepoPath });
    execSync('git merge feature/merged -m "Merge feature/merged"', {
      cwd: testRepoPath,
    });

    // Create unmerged branch
    execSync('git checkout -b feature/unmerged', { cwd: testRepoPath });
    writeFileSync(`${testRepoPath}/file2.txt`, 'unmerged content');
    execSync('git add .', { cwd: testRepoPath });
    execSync('git commit -m "Unmerged feature"', { cwd: testRepoPath });

    // Create old unmerged branch (dated)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100);
    execSync('git checkout -b feature/old', { cwd: testRepoPath });
    writeFileSync(`${testRepoPath}/file3.txt`, 'old content');
    execSync('git add .', { cwd: testRepoPath });
    execSync(`GIT_AUTHOR_DATE="${oldDate.toISOString()}" GIT_COMMITTER_DATE="${oldDate.toISOString()}" git commit -m "Old feature"`, {
      cwd: testRepoPath,
    });

    execSync('git checkout main', { cwd: testRepoPath });

    gitOps = new GitOperations(testRepoPath);
    analyzer = new BranchAnalyzer(gitOps);
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

  describe('analyzeMergedBranches', () => {
    it('should analyze branches and categorize as merged/unmerged', async () => {
      const result = await analyzer.analyzeMergedBranches('main');

      expect(result).toHaveProperty('targetBranch', 'main');
      expect(result).toHaveProperty('mergedBranches');
      expect(result).toHaveProperty('unmergedBranches');
      expect(result).toHaveProperty('totalBranches');
    });

    it('should categorize merged branches correctly', async () => {
      const result = await analyzer.analyzeMergedBranches('main');

      const mergedNames = result.mergedBranches.map((b) => b.name);
      expect(mergedNames).toContain('feature/merged');
    });

    it('should categorize unmerged branches correctly', async () => {
      const result = await analyzer.analyzeMergedBranches('main');

      const unmergedNames = result.unmergedBranches.map((b) => b.name);
      expect(unmergedNames).toContain('feature/unmerged');
      expect(unmergedNames).toContain('feature/old');
    });

    it('should exclude current branch from results', async () => {
      const result = await analyzer.analyzeMergedBranches('main');

      const allNames = [
        ...result.mergedBranches.map((b) => b.name),
        ...result.unmergedBranches.map((b) => b.name),
      ];
      expect(allNames).not.toContain('main');
    });

    it('should exclude target branch from results', async () => {
      const result = await analyzer.analyzeMergedBranches('main');

      const allNames = [
        ...result.mergedBranches.map((b) => b.name),
        ...result.unmergedBranches.map((b) => b.name),
      ];
      expect(allNames).not.toContain('main');
    });

    it('should include branch details in results', async () => {
      const result = await analyzer.analyzeMergedBranches('main');

      const allBranches = [
        ...result.mergedBranches,
        ...result.unmergedBranches,
      ];

      allBranches.forEach((branch) => {
        expect(branch).toHaveProperty('name');
        expect(branch).toHaveProperty('lastCommitHash');
        expect(branch).toHaveProperty('lastCommitDate');
        expect(branch).toHaveProperty('isMerged');
      });
    });

    it('should calculate total branches correctly', async () => {
      const result = await analyzer.analyzeMergedBranches('main');

      const expected =
        result.mergedBranches.length + result.unmergedBranches.length;
      expect(result.totalBranches).toBe(expected);
    });
  });

  describe('filterBranches', () => {
    it('should filter by pattern', async () => {
      const allBranches = await gitOps.getBranches();
      const branchDetails = await Promise.all(
        allBranches.map((b) => gitOps.getBranchDetails(b))
      );

      const filtered = analyzer.filterBranches(branchDetails, {
        pattern: '^feature/.*',
      });

      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((b) => {
        expect(b.name).toMatch(/^feature\//);
      });
    });

    it('should filter by exclude pattern', async () => {
      const allBranches = await gitOps.getBranches();
      const branchDetails = await Promise.all(
        allBranches.map((b) => gitOps.getBranchDetails(b))
      );

      const filtered = analyzer.filterBranches(branchDetails, {
        excludePattern: '^feature/old$',
      });

      const names = filtered.map((b) => b.name);
      expect(names).not.toContain('feature/old');
    });

    it('should filter by date', async () => {
      const allBranches = await gitOps.getBranches();
      const branchDetails = await Promise.all(
        allBranches.map((b) => gitOps.getBranchDetails(b))
      );

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filtered = analyzer.filterBranches(branchDetails, {
        olderThan: thirtyDaysAgo,
      });

      const names = filtered.map((b) => b.name);
      expect(names).toContain('feature/old');
    });

    it('should combine multiple filters', async () => {
      const allBranches = await gitOps.getBranches();
      const branchDetails = await Promise.all(
        allBranches.map((b) => gitOps.getBranchDetails(b))
      );

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filtered = analyzer.filterBranches(branchDetails, {
        pattern: '^feature/.*',
        excludePattern: 'merged',
        olderThan: thirtyDaysAgo,
      });

      filtered.forEach((b) => {
        expect(b.name).toMatch(/^feature\//);
        expect(b.name).not.toContain('merged');
      });
    });

    it('should handle empty filters', async () => {
      const allBranches = await gitOps.getBranches();
      const branchDetails = await Promise.all(
        allBranches.map((b) => gitOps.getBranchDetails(b))
      );

      const filtered = analyzer.filterBranches(branchDetails, {});

      expect(filtered.length).toBe(branchDetails.length);
    });

    it('should throw error for invalid regex pattern', async () => {
      const allBranches = await gitOps.getBranches();
      const branchDetails = await Promise.all(
        allBranches.map((b) => gitOps.getBranchDetails(b))
      );

      expect(() => {
        analyzer.filterBranches(branchDetails, {
          pattern: '[invalid(regex',
        });
      }).toThrow(GitOperationError);
    });

    it('should throw error for invalid exclude pattern', async () => {
      const allBranches = await gitOps.getBranches();
      const branchDetails = await Promise.all(
        allBranches.map((b) => gitOps.getBranchDetails(b))
      );

      expect(() => {
        analyzer.filterBranches(branchDetails, {
          excludePattern: '[invalid(regex',
        });
      }).toThrow(GitOperationError);
    });
  });

  describe('analyzeMergedBranches with filters', () => {
    it('should analyze with pattern filter', async () => {
      const result = await analyzer.analyzeMergedBranches('main', {
        pattern: '^feature/.*',
      });

      const allNames = [
        ...result.mergedBranches.map((b) => b.name),
        ...result.unmergedBranches.map((b) => b.name),
      ];

      allNames.forEach((name) => {
        expect(name).toMatch(/^feature\//);
      });
    });

    it('should analyze with date filter', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await analyzer.analyzeMergedBranches('main', {
        olderThan: thirtyDaysAgo,
      });

      expect(
        result.unmergedBranches.some((b) => b.name === 'feature/old')
      ).toBe(true);
    });
  });
});
