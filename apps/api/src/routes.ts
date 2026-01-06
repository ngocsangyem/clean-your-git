/**
 * API route handlers for branch cleanup operations
 */
import type { Request, Response, NextFunction, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import {
  GitOperations,
  BranchAnalyzer,
  BranchManager,
  validateRepoPath,
  type AnalyzeResult,
  type DeleteResult,
  type ValidationResult,
  type FilterOptions,
} from '@branch-cleanup/core';
import {
  validateRepoSchema,
  analyzeSchema,
  deleteSchema,
  listBranchesSchema,
  type ValidateRepoRequest,
  type AnalyzeRequest,
  type DeleteRequest,
  type ListBranchesRequest,
} from './schemas.js';
import { validateRequest, validateQuery } from './middleware.js';

export const router: ExpressRouter = Router();

/**
 * Health check endpoint
 * GET /health
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Validate repository path
 * POST /api/validate-repo
 * Body: { repoPath: string }
 * Returns: { valid: boolean, error?: string }
 */
router.post(
  '/api/validate-repo',
  validateRequest(validateRepoSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { repoPath } = req.body as ValidateRepoRequest;
      const result: ValidationResult = await validateRepoPath(repoPath);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Analyze branches in repository
 * POST /api/analyze
 * Body: { repoPath: string, targetBranch: string, filters?: FilterOptions }
 * Returns: AnalyzeResult
 */
router.post(
  '/api/analyze',
  validateRequest(analyzeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { repoPath, targetBranch, filters } = req.body as AnalyzeRequest;

      // Convert olderThan string to Date if provided
      const parsedFilters: FilterOptions | undefined = filters
        ? {
            ...filters,
            olderThan: filters.olderThan ? new Date(filters.olderThan) : undefined,
          }
        : undefined;

      const gitOps = new GitOperations(repoPath);
      const analyzer = new BranchAnalyzer(gitOps);

      const result: AnalyzeResult = await analyzer.analyzeMergedBranches(targetBranch, parsedFilters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Delete branches from repository
 * POST /api/delete
 * Body: { repoPath: string, branches: string[], dryRun?: boolean }
 * Returns: DeleteResult
 */
router.post(
  '/api/delete',
  validateRequest(deleteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { repoPath, branches, dryRun = false } = req.body as DeleteRequest;

      const gitOps = new GitOperations(repoPath);
      const manager = new BranchManager(gitOps);

      const result: DeleteResult = await manager.deleteBranches(branches, dryRun);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * List all branches in repository
 * GET /api/branches?repoPath=<path>
 * Returns: { branches: string[], current: string }
 */
router.get(
  '/api/branches',
  validateQuery(listBranchesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { repoPath } = req.query as unknown as ListBranchesRequest;

      const gitOps = new GitOperations(repoPath);
      const branches = await gitOps.getBranches();
      const current = await gitOps.getCurrentBranch();

      res.json({ branches, current });
    } catch (error) {
      next(error);
    }
  }
);
