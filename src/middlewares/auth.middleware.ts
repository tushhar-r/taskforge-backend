// ---------------------------------------------------------
// JWT authentication + RBAC authorization middleware
// ---------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AppError, logger } from '../utils';
import { Messages, ErrorCode, Permission } from '../constants';
import { userRepository } from '../repositories';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { IRoleDocument } from '../models';

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

    // Populate the role so that req.user.roleId is actually an IRoleDocument
    const userOrNull = await userRepository.findById(payload.userId);
    if (!userOrNull) {
      throw AppError.unauthorized(Messages.INVALID_TOKEN);
    }
    const user = await userOrNull.populate<{ roleId: IRoleDocument }>('roleId');

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

/**
 * Dynamic Role-based custom access control middleware factory.
 * Usage: router.get('/...', authenticate, requirePermissions(Permission.TEAM_WRITE), handler)
 *
 * @param requiredPermissions - one or more Permission enums. The user role must have ALL of them.
 */
export function requirePermissions(...requiredPermissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.roleId) {
      return next(AppError.unauthorized(Messages.TOKEN_REQUIRED));
    }

    const role = req.user.roleId as IRoleDocument;
    
    // Check if user's role contains all required permissions
    const hasAll = requiredPermissions.every((perm) => role.permissions.includes(perm));
    
    if (!hasAll) {
      return next(AppError.forbidden(Messages.INSUFFICIENT_PERMISSIONS));
    }

    next();
  };
}
