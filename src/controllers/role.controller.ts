// ---------------------------------------------------------
// Role controller – handles dynamic role HTTP requests
// ---------------------------------------------------------

import { Request, Response } from 'express';
import { roleService } from '../services';
import { asyncHandler, sendSuccess } from '../utils';
import { HttpStatus } from '../constants';

class RoleController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const role = await roleService.createRole(req.body);
    sendSuccess(res, HttpStatus.CREATED, 'Role created successfully', role);
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await roleService.listRoles({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order as 'asc' | 'desc' | undefined,
    });
    sendSuccess(res, HttpStatus.OK, 'Roles fetched successfully', data, meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const role = await roleService.getRole(req.params.id as string);
    sendSuccess(res, HttpStatus.OK, 'Role fetched successfully', role);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const role = await roleService.updateRole(req.params.id as string, req.body);
    sendSuccess(res, HttpStatus.OK, 'Role updated successfully', role);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await roleService.deleteRole(req.params.id as string);
    sendSuccess(res, HttpStatus.OK, 'Role deleted successfully', null);
  });
}

export const roleController = new RoleController();
