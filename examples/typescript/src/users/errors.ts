/**
 * Error hierarchy for user domain.
 * 
 * Typed errors enable categorical error handling and provide
 * diagnostic context for debugging.
 * 
 * @module users/errors
 */

// =============================================================================
// BASE ERROR
// =============================================================================

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  abstract readonly retryable: boolean;
  cause?: Error;
  
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      retryable: this.retryable,
      context: this.context,
    };
  }
}

// =============================================================================
// DOMAIN ERRORS
// =============================================================================

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly retryable = false;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(`Validation failed: ${message}`, context);
  }
}

export class UserNotFoundError extends AppError {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;
  readonly retryable = false;
  
  constructor(userId: number) {
    super(`User not found: ${userId}`, { userId });
  }
}

export class DuplicateEmailError extends AppError {
  readonly code = 'DUPLICATE_EMAIL';
  readonly statusCode = 409;
  readonly retryable = false;
  
  constructor(email: string) {
    super(`Email already exists: ${email}`, { email });
  }
}

export class DatabaseError extends AppError {
  readonly code = 'DATABASE_ERROR';
  readonly statusCode = 500;
  readonly retryable = true;
  
  constructor(
    operation: string,
    cause?: Error
  ) {
    super(`Database operation failed: ${operation}`, {
      operation,
      cause: cause?.message,
    });
    this.cause = cause;
  }
}
