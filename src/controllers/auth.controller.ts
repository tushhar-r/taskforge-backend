// ---------------------------------------------------------
// Auth controller – thin layer delegating to AuthService
// ---------------------------------------------------------

import { Request, Response } from 'express';
import { authService } from '../services';
import { asyncHandler, sendSuccess } from '../utils';
import { HttpStatus, Messages } from '../constants';

class AuthController {
  /**
   * POST /api/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.register(req.body);
    sendSuccess(res, HttpStatus.CREATED, Messages.REGISTER_SUCCESS, result);
  });

  /**
   * POST /api/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);
    sendSuccess(res, HttpStatus.OK, Messages.LOGIN_SUCCESS, result);
  });

  /**
   * POST /api/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    sendSuccess(res, HttpStatus.OK, Messages.TOKEN_REFRESHED, { tokens });
  });
}

export const authController = new AuthController();
