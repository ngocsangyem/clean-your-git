/**
 * Error thrown when git operations fail
 */
export class GitOperationError extends Error {
  /**
   * @param message - Human-readable error message
   * @param operation - Name of the git operation that failed
   * @param originalError - Original error if available
   */
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'GitOperationError';

    // Maintain proper stack trace (only works in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GitOperationError);
    }
  }

  /**
   * Get full error details including original error
   */
  getFullMessage(): string {
    if (this.originalError) {
      return `${this.message}\nOriginal error: ${this.originalError.message}`;
    }
    return this.message;
  }
}
