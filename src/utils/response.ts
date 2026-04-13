// ---------------------------------------------------------
// Helpers for building standardised API responses
// ---------------------------------------------------------

import { Response } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse, PaginationMeta } from '../types';

/**
 * Send a success response with optional pagination metadata.
 */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: PaginationMeta,
): void {
  const body: ApiSuccessResponse<T> = { success: true, data, message };
  if (meta) {
    body.meta = meta;
  }
  res.status(statusCode).json(body);
}

/**
 * Send an error response matching the standard envelope.
 */
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  code: string,
  details?: Record<string, string[]>,
): void {
  const body: ApiErrorResponse = {
    success: false,
    error: { message, code, ...(details && { details }) },
  };
  res.status(statusCode).json(body);
}
