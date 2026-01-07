/**
 * Type definitions for Git branch cleanup web app
 */

export interface BranchInfo {
  name: string;
  lastCommitDate: string;
  lastCommitHash: string;
  isMerged: boolean;
  createdBy?: string;
  createdByEmail?: string;
  createdDate?: string;
}

export interface AnalyzeResult {
  targetBranch: string;
  mergedBranches: BranchInfo[];
  unmergedBranches: BranchInfo[];
  totalBranches: number;
}

export interface DeleteResult {
  deleted: string[];
  failed: Array<{ branch: string; error: string }>;
}

export interface FilterOptions {
  pattern?: string;
  excludePattern?: string;
  olderThan?: Date;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface BranchListResponse {
  branches: string[];
  current: string;
}

export interface AnalyzeRequest {
  repoPath: string;
  targetBranch: string;
  filters?: {
    pattern?: string;
    excludePattern?: string;
    olderThan?: string;
  };
}

export interface DeleteRequest {
  repoPath: string;
  branches: string[];
  dryRun?: boolean;
}
