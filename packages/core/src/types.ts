/**
 * Represents information about a git branch
 */
export interface BranchInfo {
  /** Branch name */
  name: string;
  /** Last commit date in ISO format */
  lastCommitDate: string;
  /** Last commit hash (short or full) */
  lastCommitHash: string;
  /** Whether this branch is merged into target */
  isMerged: boolean;
  /** Author name (creator of first commit on branch) */
  createdBy?: string;
  /** Author email */
  createdByEmail?: string;
  /** Date of first commit on branch (ISO format) */
  createdDate?: string;
}

/**
 * Result of analyzing branches in a repository
 */
export interface AnalyzeResult {
  /** Target branch used for merge comparison */
  targetBranch: string;
  /** Branches that are fully merged into target */
  mergedBranches: BranchInfo[];
  /** Branches that are not merged */
  unmergedBranches: BranchInfo[];
  /** Total number of branches analyzed */
  totalBranches: number;
}

/**
 * Result of branch deletion operations
 */
export interface DeleteResult {
  /** Successfully deleted branch names */
  deleted: string[];
  /** Failed deletions with error messages */
  failed: Array<{
    branch: string;
    error: string;
  }>;
}

/**
 * Options for filtering branches
 */
export interface FilterOptions {
  /** Regex pattern to match branch names */
  pattern?: string;
  /** Regex pattern to exclude branch names */
  excludePattern?: string;
  /** Only include branches older than this date */
  olderThan?: Date;
}

/**
 * Validation result for input validation
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
}
