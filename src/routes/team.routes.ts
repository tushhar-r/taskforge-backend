// ---------------------------------------------------------
// Team routes
// ---------------------------------------------------------

import { Router } from 'express';
import { teamController } from '../controllers';
import { authenticate, requirePermissions, validate } from '../middlewares';
import { Permission } from '../constants';
import {
  createTeamSchema,
  updateTeamSchema,
  teamIdParamSchema,
  addMemberSchema,
  memberParamSchema,
  linkClientSchema,
  paginationQuerySchema,
} from '../validators';

const router = Router();

// All team routes require authentication
router.use(authenticate);

// ── Team CRUD (manage only) ─────────────────────────────
router.post('/', requirePermissions(Permission.TEAM_WRITE), validate(createTeamSchema), teamController.create);
router.get('/', requirePermissions(Permission.TEAM_READ), validate(paginationQuerySchema), teamController.getAll);
router.get('/:id', requirePermissions(Permission.TEAM_READ), validate(teamIdParamSchema), teamController.getById);
router.put('/:id', requirePermissions(Permission.TEAM_WRITE), validate(updateTeamSchema), teamController.update);
router.delete('/:id', requirePermissions(Permission.TEAM_WRITE), validate(teamIdParamSchema), teamController.delete);

// ── Members ───────────────────────────────────────────
router.post('/:id/members', requirePermissions(Permission.TEAM_WRITE), validate(addMemberSchema), teamController.addMember);
router.delete('/:id/members/:userId', requirePermissions(Permission.TEAM_WRITE), validate(memberParamSchema), teamController.removeMember);
router.get('/:id/members', requirePermissions(Permission.TEAM_READ), validate(teamIdParamSchema), teamController.getMembers);

// ── Client links ──────────────────────────────────────
router.post('/:id/clients', requirePermissions(Permission.TEAM_WRITE), validate(linkClientSchema), teamController.linkClient);
router.delete('/:id/clients/:clientId', requirePermissions(Permission.TEAM_WRITE), teamController.unlinkClient);
router.get('/:id/clients', requirePermissions(Permission.TEAM_READ), validate(teamIdParamSchema), teamController.getTeamClients);

export default router;
