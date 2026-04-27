// ---------------------------------------------------------
// Client controller – thin layer delegating to ClientService
// ---------------------------------------------------------

import { Request, Response } from 'express';
import { clientService } from '../services';
import { asyncHandler, sendSuccess } from '../utils';
import { HttpStatus, Messages } from '../constants';

class ClientController {
  /** POST /api/clients */
  create = asyncHandler(async (req: Request, res: Response) => {
    const client = await clientService.create(req.body);
    sendSuccess(res, HttpStatus.CREATED, Messages.CLIENT_CREATED, client);
  });

  /** GET /api/clients */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await clientService.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order as 'asc' | 'desc' | undefined,
    });
    sendSuccess(res, HttpStatus.OK, Messages.CLIENTS_FETCHED, data, meta);
  });

  /** GET /api/clients/:id */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const client = await clientService.getById(req.params.id as string);
    sendSuccess(res, HttpStatus.OK, Messages.CLIENT_FETCHED, client);
  });

  /** PUT /api/clients/:id */
  update = asyncHandler(async (req: Request, res: Response) => {
    const client = await clientService.update(req.params.id as string, req.body);
    sendSuccess(res, HttpStatus.OK, Messages.CLIENT_UPDATED, client);
  });

  /** DELETE /api/clients/:id */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await clientService.delete(req.params.id as string);
    sendSuccess(res, HttpStatus.OK, Messages.CLIENT_DELETED, null);
  });
}

export const clientController = new ClientController();
