// ---------------------------------------------------------
// Team controller – thin layer delegating to TeamService
// ---------------------------------------------------------

import { Request, Response } from 'express';
import { teamService } from '../services';
import { asyncHandler, sendSuccess } from '../utils';
import { HttpStatus, Messages } from '../constants';

class TeamController {
  /** POST /api/teams */
  create = asyncHandler(async (req: Request, res: Response) => {
    const team = await teamService.createTeam(req.body);
    sendSuccess(res, HttpStatus.CREATED, Messages.TEAM_CREATED, team);
  });

  /** GET /api/teams */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await teamService.listTeams({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order as 'asc' | 'desc' | undefined,
    }, (req.user as any)?.id || (req.user as any)?._id?.toString(), ((req.user as any)?.roleId as any)?.name === 'admin');
    sendSuccess(res, HttpStatus.OK, Messages.TEAMS_FETCHED, data, meta);
  });

  /** GET /api/teams/:id */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const team = await teamService.getTeam(req.params.id as string);
    sendSuccess(res, HttpStatus.OK, Messages.TEAM_FETCHED, team);
  });

  /** PUT /api/teams/:id */
  update = asyncHandler(async (req: Request, res: Response) => {
    const team = await teamService.updateTeam(req.params.id as string, req.body);
    sendSuccess(res, HttpStatus.OK, Messages.TEAM_UPDATED, team);
  });

  /** DELETE /api/teams/:id */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await teamService.deleteTeam(req.params.id as string);
    sendSuccess(res, HttpStatus.OK, Messages.TEAM_DELETED, null);
  });

  // ── Members ──────────────────────────────────────────

  /** POST /api/teams/:id/members */
  addMember = asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = req.body as { userId: string; role: 'manager' | 'employee' };
    await teamService.addMember(req.params.id as string, userId, role);
    sendSuccess(res, HttpStatus.OK, Messages.MEMBER_ADDED, null);
  });

  /** DELETE /api/teams/:id/members/:userId */
  removeMember = asyncHandler(async (req: Request, res: Response) => {
    await teamService.removeMember(req.params.id as string, req.params.userId as string);
    sendSuccess(res, HttpStatus.OK, Messages.MEMBER_REMOVED, null);
  });

  /** GET /api/teams/:id/members */
  getMembers = asyncHandler(async (req: Request, res: Response) => {
    const role = req.query.role as 'manager' | 'employee' | undefined;
    const members = await teamService.getMembers(req.params.id as string, role);
    sendSuccess(res, HttpStatus.OK, Messages.USERS_FETCHED, members);
  });

  // ── Clients ───────────────────────────────────────────

  /** POST /api/teams/:id/clients */
  linkClient = asyncHandler(async (req: Request, res: Response) => {
    await teamService.linkClient(req.params.id as string, req.body.clientId as string);
    sendSuccess(res, HttpStatus.OK, Messages.CLIENT_LINKED, null);
  });

  /** DELETE /api/teams/:id/clients/:clientId */
  unlinkClient = asyncHandler(async (req: Request, res: Response) => {
    await teamService.unlinkClient(req.params.id as string, req.params.clientId as string);
    sendSuccess(res, HttpStatus.OK, Messages.CLIENT_UNLINKED, null);
  });

  getTeamClients = asyncHandler(async (req: Request, res: Response) => {
    const clients = await teamService.getTeamClients(
      req.params.id as string, 
      (req.user as any)?.id || (req.user as any)?._id?.toString(),
      ((req.user as any)?.roleId as any)?.name === 'admin'
    );
    sendSuccess(res, HttpStatus.OK, Messages.CLIENTS_FETCHED, clients);
  });
}

export const teamController = new TeamController();
