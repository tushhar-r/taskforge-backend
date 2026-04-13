// ---------------------------------------------------------
// Custom application error with HTTP status semantics
// ---------------------------------------------------------

import { ErrorCode, HttpStatus } from '../constants';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    code: string = ErrorCode.INTERNAL_ERROR,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // distinguishes expected errors from bugs
    this.details = details;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory helpers ────────────────────────────────────

  static badRequest(message: string, details?: Record<string, string[]>): AppError {
    return new AppError(message, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, details);
  }

  static unauthorized(message: string, code: string = ErrorCode.AUTHENTICATION_ERROR): AppError {
    return new AppError(message, HttpStatus.UNAUTHORIZED, code);
  }

  static forbidden(message: string): AppError {
    return new AppError(message, HttpStatus.FORBIDDEN, ErrorCode.AUTHORIZATION_ERROR);
  }

  static notFound(message: string): AppError {
    return new AppError(message, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  static conflict(message: string): AppError {
    return new AppError(message, HttpStatus.CONFLICT, ErrorCode.CONFLICT);
  }

  static internal(message: string): AppError {
    return new AppError(message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
  }
}
