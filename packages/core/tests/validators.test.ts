import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync } from 'fs';
import { validateRepoPath, validateBranchName } from '../src/validators.js';

describe('Validators', () => {
  describe('validateRepoPath', () => {
    let testPath: string;

    beforeEach(() => {
      testPath = `/tmp/test-path-${Date.now()}`;
      mkdirSync(testPath, { recursive: true });
    });

    afterEach(() => {
      if (testPath) {
        try {
          rmSync(testPath, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
      }
    });

    it('should validate existing directory path', () => {
      const result = validateRepoPath(testPath);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty path', () => {
      const result = validateRepoPath('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('empty');
    });

    it('should reject whitespace-only path', () => {
      const result = validateRepoPath('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject non-existent path', () => {
      const result = validateRepoPath('/tmp/non-existent-path-xyz-123-456');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('does not exist');
    });

    it('should handle relative paths', () => {
      const result = validateRepoPath('./');
      expect(result.valid).toBe(true);
    });

    it('should handle home directory paths', () => {
      const homeDir = process.env.HOME || '/root';
      const result = validateRepoPath(homeDir);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateBranchName', () => {
    it('should accept valid branch names', () => {
      const validNames = [
        'main',
        'develop',
        'feature/my-feature',
        'bugfix/issue-123',
        'release/v1.0.0',
        'hotfix/critical',
        'feature-without-slash',
        'v1.2.3',
      ];

      validNames.forEach((name) => {
        const result = validateBranchName(name);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject empty branch name', () => {
      const result = validateBranchName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject whitespace-only branch name', () => {
      const result = validateBranchName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names with spaces', () => {
      const result = validateBranchName('feature with spaces');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('forbidden');
    });

    it('should reject names with double dots', () => {
      const result = validateBranchName('feature..name');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names starting with dot', () => {
      const result = validateBranchName('.feature');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names ending with dot', () => {
      const result = validateBranchName('feature.');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names with double slashes', () => {
      const result = validateBranchName('feature//name');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names with @{', () => {
      const result = validateBranchName('feature@{name}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names with backslashes', () => {
      const result = validateBranchName('feature\\name');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names with asterisks', () => {
      const result = validateBranchName('feature*name');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names with question marks', () => {
      const result = validateBranchName('feature?name');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names with brackets', () => {
      const result = validateBranchName('feature[name]');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names with tildes', () => {
      const result = validateBranchName('feature~name');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names with carets', () => {
      const result = validateBranchName('feature^name');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names with colons', () => {
      const result = validateBranchName('feature:name');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names ending with slash', () => {
      const result = validateBranchName('feature/');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names ending with .lock', () => {
      const result = validateBranchName('feature.lock');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
