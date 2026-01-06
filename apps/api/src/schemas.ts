/**
 * Zod validation schemas for API request/response validation
 */
import { z } from 'zod';

/**
 * Schema for validating repository path
 */
export const validateRepoSchema = z.object({
  repoPath: z.string().min(1, 'Repository path is required'),
});

/**
 * Schema for analyzing branches
 */
export const analyzeSchema = z.object({
  repoPath: z.string().min(1, 'Repository path is required'),
  targetBranch: z.string().min(1, 'Target branch is required'),
  filters: z
    .object({
      pattern: z.string().optional(),
      excludePattern: z.string().optional(),
      olderThan: z.string().datetime().optional(),
    })
    .optional(),
});

/**
 * Schema for deleting branches
 */
export const deleteSchema = z.object({
  repoPath: z.string().min(1, 'Repository path is required'),
  branches: z.array(z.string().min(1)).min(1, 'At least one branch is required'),
  dryRun: z.boolean().optional().default(false),
});

/**
 * Schema for listing branches
 */
export const listBranchesSchema = z.object({
  repoPath: z.string().min(1, 'Repository path is required'),
});

export type ValidateRepoRequest = z.infer<typeof validateRepoSchema>;
export type AnalyzeRequest = z.infer<typeof analyzeSchema>;
export type DeleteRequest = z.infer<typeof deleteSchema>;
export type ListBranchesRequest = z.infer<typeof listBranchesSchema>;
