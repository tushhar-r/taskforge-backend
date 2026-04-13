// ---------------------------------------------------------
// Task controller – thin layer delegating to TaskService
// ---------------------------------------------------------

import { Request, Response } from 'express';
import { taskService } from '../services';
import { asyncHandler, sendSuccess, AppError } from '../utils';
import { HttpStatus, Messages } from '../constants';

class TaskController {
  /**
   * POST /api/tasks
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // req.user is guaranteed to be populated by the auth middleware
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);

    const result = await taskService.create(req.user._id.toString(), req.body);
    sendSuccess(res, HttpStatus.CREATED, Messages.TASK_CREATED, result);
  });

  /**
   * GET /api/tasks
   */
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);

    const result = await taskService.getAllForUser(req.user._id.toString(), {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order as 'asc' | 'desc' | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    });
    sendSuccess(res, HttpStatus.OK, Messages.TASKS_FETCHED, result.data, result.meta);
  });

  /**
   * GET /api/tasks/:id
   */
  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);

    const task = await taskService.getById(req.params.id as string, req.user._id.toString());
    sendSuccess(res, HttpStatus.OK, Messages.TASK_FETCHED, task);
  });

  /**
   * PUT /api/tasks/:id
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);

    const task = await taskService.update(req.params.id as string, req.user._id.toString(), req.body);
    sendSuccess(res, HttpStatus.OK, Messages.TASK_UPDATED, task);
  });

  /**
   * DELETE /api/tasks/:id
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);

    await taskService.delete(req.params.id as string, req.user._id.toString());
    sendSuccess(res, HttpStatus.OK, Messages.TASK_DELETED, null);
  });
}

export const taskController = new TaskController();
