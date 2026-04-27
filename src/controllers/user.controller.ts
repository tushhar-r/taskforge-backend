// ---------------------------------------------------------
// User controller – thin layer delegating to UserService
// ---------------------------------------------------------

import { Request, Response } from 'express';
import { userService } from '../services';
import { asyncHandler, sendSuccess } from '../utils';
import { HttpStatus, Messages } from '../constants';

class UserController {
  /**
   * POST /api/users
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.create(req.body);
    sendSuccess(res, HttpStatus.CREATED, Messages.USER_CREATED, user);
  });

  /**
   * GET /api/users
   */
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await userService.getAll({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order as 'asc' | 'desc' | undefined,
    });
    sendSuccess(res, HttpStatus.OK, Messages.USERS_FETCHED, result.data, result.meta);
  });

  /**
   * GET /api/users/:id
   */
  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.getById(req.params.id as string);
    sendSuccess(res, HttpStatus.OK, Messages.USER_FETCHED, user);
  });

  /**
   * PUT /api/users/:id
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.update(req.params.id as string, req.body);
    sendSuccess(res, HttpStatus.OK, Messages.USER_UPDATED, user);
  });

  /**
   * DELETE /api/users/:id
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await userService.delete(req.params.id as string);
    sendSuccess(res, HttpStatus.OK, Messages.USER_DELETED, null);
  });
}

export const userController = new UserController();
