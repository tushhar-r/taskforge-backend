// ---------------------------------------------------------
// JWT authentication middleware
// ---------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AppError, logger } from '../utils';
import { Messages, ErrorCode } from '../constants';
import { userRepository } from '../repositories';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * Extracts and verifies the Bearer token from the Authorization header,
 * then attaches the full user document to `req.user`.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized(Messages.TOKEN_REQUIRED);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw AppError.unauthorized(Messages.INVALID_TOKEN);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(AppError.unauthorized(Messages.TOKEN_EXPIRED, ErrorCode.TOKEN_EXPIRED));
    } else if (error instanceof JsonWebTokenError) {
      next(AppError.unauthorized(Messages.INVALID_TOKEN, ErrorCode.INVALID_TOKEN));
    } else if (error instanceof AppError) {
      next(error);
    } else {
      logger.error('Authentication middleware error', error);
      next(AppError.unauthorized(Messages.INVALID_TOKEN));
    }
  }
}
