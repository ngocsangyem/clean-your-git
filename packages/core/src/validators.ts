import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ValidationResult } from './types.js';

/**
 * Validates a repository path
 * @param path - Path to validate
 * @returns Validation result
 */
export function validateRepoPath(path: string): ValidationResult {
  if (!path || path.trim().length === 0) {
    return {
      valid: false,
      error: 'Repository path cannot be empty',
    };
  }

  const resolvedPath = resolve(path);

  if (!existsSync(resolvedPath)) {
    return {
      valid: false,
      error: `Path does not exist: ${resolvedPath}`,
    };
  }

  return { valid: true };
}

/**
 * Validates a branch name
 * @param name - Branch name to validate
 * @returns Validation result
 */
export function validateBranchName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: 'Branch name cannot be empty',
    };
  }

  // Git branch name rules
  const invalidPatterns = [
    /\s/, // No spaces
    /\.\./, // No double dots
    /^\./, // Cannot start with dot
    /\.$/, // Cannot end with dot
    /\/\//, // No double slashes
    /@{/, // No @{
    /\\/, // No backslashes
    /\*/, // No asterisks
    /\?/, // No question marks
    /\[/, // No brackets
    /~/, // No tildes
    /\^/, // No carets
    /:/, // No colons
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(name)) {
      return {
        valid: false,
        error: `Invalid branch name: contains forbidden characters or patterns`,
      };
    }
  }

  if (name.endsWith('/') || name.endsWith('.lock')) {
    return {
      valid: false,
      error: 'Branch name cannot end with / or .lock',
    };
  }

  return { valid: true };
}
