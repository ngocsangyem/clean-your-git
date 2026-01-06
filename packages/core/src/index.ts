/**
 * @branch-cleanup/core
 *
 * Shared core library for git branch cleanup operations.
 * Provides git operations, branch analysis, and branch management functionality.
 */

// Export all types
export type {
  BranchInfo,
  AnalyzeResult,
  DeleteResult,
  FilterOptions,
  ValidationResult,
} from './types.js';

// Export classes
export { GitOperations } from './git-operations.js';
export { BranchAnalyzer } from './branch-analyzer.js';
export { BranchManager } from './branch-manager.js';

// Export errors
export { GitOperationError } from './errors.js';

// Export validators
export { validateRepoPath, validateBranchName } from './validators.js';
