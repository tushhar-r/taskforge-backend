// ---------------------------------------------------------
// Async handler wrapper – eliminates try/catch boilerplate
// ---------------------------------------------------------

import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler so rejected promises are forwarded
 * to Express's error-handling middleware automatically.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
