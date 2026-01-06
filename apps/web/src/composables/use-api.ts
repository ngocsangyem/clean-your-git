/**
 * API composable for branch cleanup operations
 */
import axios, { type AxiosError } from 'axios';
import type {
  ValidationResult,
  BranchListResponse,
  AnalyzeResult,
  DeleteResult,
  AnalyzeRequest,
  DeleteRequest,
} from '@/types';

// Base API URL - uses Vite proxy in dev, direct URL in prod
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Handle API errors and extract error message
 */
function handleError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    return axiosError.response?.data?.error || axiosError.response?.data?.message || axiosError.message;
  }
  return error instanceof Error ? error.message : 'Unknown error occurred';
}

export function useApi() {
  /**
   * Validate repository path
   */
  async function validateRepo(repoPath: string): Promise<ValidationResult> {
    try {
      const response = await api.post<ValidationResult>('/api/validate-repo', { repoPath });
      return response.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  /**
   * Get list of branches from repository
   */
  async function getBranches(repoPath: string): Promise<BranchListResponse> {
    try {
      const response = await api.get<BranchListResponse>('/api/branches', {
        params: { repoPath },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  /**
   * Analyze branches in repository
   */
  async function analyzeBranches(request: AnalyzeRequest): Promise<AnalyzeResult> {
    try {
      const response = await api.post<AnalyzeResult>('/api/analyze', request);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  /**
   * Delete branches from repository
   */
  async function deleteBranches(request: DeleteRequest): Promise<DeleteResult> {
    try {
      const response = await api.post<DeleteResult>('/api/delete', request);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  return {
    validateRepo,
    getBranches,
    analyzeBranches,
    deleteBranches,
  };
}
