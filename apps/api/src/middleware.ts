/**
 * Express middleware for CORS, error handling, and validation
 */
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { GitOperationError } from '@branch-cleanup/core';
import { z } from 'zod';

/**
 * CORS middleware configuration
 * Allow requests from Vite dev server (localhost:5173)
 */
export const corsMiddleware = cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
});

/**
 * Structured error response interface
 */
interface ErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Global error handling middleware
 * Catches and formats errors into consistent JSON responses
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  // Handle GitOperationError from core library
  if (err instanceof GitOperationError) {
    const response: ErrorResponse = {
      error: err.message,
    };
    res.status(400).json(response);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    const response: ErrorResponse = {
      error: 'Validation error',
      details: err.errors,
    };
    res.status(400).json(response);
    return;
  }

  // Handle generic errors
  const response: ErrorResponse = {
    error: err.message || 'Internal server error',
  };
  res.status(500).json(response);
}

/**
 * Validation middleware factory
 * Creates middleware that validates request body against a Zod schema
 */
export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validation middleware for query parameters
 */
export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
}
