// ---------------------------------------------------------
// Timesheet routes
// ---------------------------------------------------------

import { Router } from 'express';
import { timesheetController } from '../controllers';
import { authenticate, requirePermissions, validate } from '../middlewares';
import { Permission } from '../constants';
import {
  createTimesheetSchema,
  updateTimesheetSchema,
  timesheetIdParamSchema,
  timesheetFilterQuerySchema,
} from '../validators';

const router = Router();

router.use(authenticate);

// ── Employee endpoints ────────────────────────────────
router.post(
  '/',
  requirePermissions(Permission.TIMESHEET_SUBMIT),
  validate(createTimesheetSchema),
  timesheetController.create,
);

router.get(
  '/me',
  requirePermissions(Permission.TIMESHEET_VIEW_PERSONAL),
  validate(timesheetFilterQuerySchema),
  timesheetController.getMyEntries,
);

router.get(
  '/:id',
  requirePermissions(Permission.TIMESHEET_SUBMIT),
  validate(timesheetIdParamSchema),
  timesheetController.getById,
);

router.put(
  '/:id',
  requirePermissions(Permission.TIMESHEET_SUBMIT),
  validate(updateTimesheetSchema),
  timesheetController.update,
);

router.patch(
  '/:id/submit',
  requirePermissions(Permission.TIMESHEET_SUBMIT),
  validate(timesheetIdParamSchema),
  timesheetController.submit,
);

router.delete(
  '/:id',
  requirePermissions(Permission.TIMESHEET_SUBMIT),
  validate(timesheetIdParamSchema),
  timesheetController.delete,
);

// ── Manager endpoints ─────────────────────────────────
router.get(
  '/team/:teamId',
  requirePermissions(Permission.TIMESHEET_MANAGE_TEAM),
  validate(timesheetFilterQuerySchema),
  timesheetController.getTeamEntries,
);

router.get(
  '/team/:teamId/export',
  requirePermissions(Permission.TIMESHEET_MANAGE_TEAM),
  validate(timesheetFilterQuerySchema),
  timesheetController.exportTeamEntries,
);

export default router;
