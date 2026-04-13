// ---------------------------------------------------------
// Centralised error-handling middleware
// ---------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { AppError, logger, sendError } from '../utils';
import { HttpStatus, ErrorCode, Messages } from '../constants';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

/**
 * Global error handler – catches all errors thrown or passed via next().
 * Converts known error types into the standard ApiErrorResponse envelope.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── Operational (expected) errors ──────────────────────
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.code, err.details);
    return;
  }

  // ── Zod validation errors ─────────────────────────────
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.');
      if (!details[key]) details[key] = [];
      details[key].push(issue.message);
    }
    sendError(
      res,
      HttpStatus.UNPROCESSABLE_ENTITY,
      Messages.VALIDATION_ERROR,
      ErrorCode.VALIDATION_ERROR,
      details,
    );
    return;
  }

  // ── Mongoose validation errors ────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const details: Record<string, string[]> = {};
    for (const [field, error] of Object.entries(err.errors)) {
      details[field] = [error.message];
    }
    sendError(
      res,
      HttpStatus.UNPROCESSABLE_ENTITY,
      Messages.VALIDATION_ERROR,
      ErrorCode.VALIDATION_ERROR,
      details,
    );
    return;
  }

  // ── Mongoose cast errors (e.g. invalid ObjectId) ──────
  if (err instanceof mongoose.Error.CastError) {
    sendError(
      res,
      HttpStatus.BAD_REQUEST,
      `Invalid ${err.path}: ${String(err.value)}`,
      ErrorCode.VALIDATION_ERROR,
    );
    return;
  }

  // ── Mongoose duplicate key (code 11000) ───────────────
  if (isDuplicateKeyError(err)) {
    const field = Object.keys((err as MongoServerError).keyValue)[0];
    sendError(
      res,
      HttpStatus.CONFLICT,
      `Duplicate value for field: ${field}`,
      ErrorCode.CONFLICT,
    );
    return;
  }

  // ── Unexpected / programming errors ───────────────────
  logger.error('Unhandled error:', { message: err.message, stack: err.stack });

  sendError(
    res,
    HttpStatus.INTERNAL_SERVER_ERROR,
    Messages.INTERNAL_SERVER_ERROR,
    ErrorCode.INTERNAL_ERROR,
  );
}

// ── Type guard for Mongo duplicate key errors ───────────

interface MongoServerError extends Error {
  code: number;
  keyValue: Record<string, unknown>;
}

function isDuplicateKeyError(err: unknown): err is MongoServerError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as MongoServerError).code === 11000
  );
}
