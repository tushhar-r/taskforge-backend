// ---------------------------------------------------------
// Timesheet controller – thin layer delegating to TimesheetEntryService
// ---------------------------------------------------------

import { Request, Response } from 'express';
import { timesheetEntryService } from '../services';
import { asyncHandler, sendSuccess, AppError } from '../utils';
import { HttpStatus, Messages } from '../constants';
import type { TimesheetFilterQuery } from '../types';

class TimesheetController {
  /** POST /api/timesheet */
  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);
    const entries = await timesheetEntryService.createEntries(
      req.user._id.toString(), 
      req.body
    );
    sendSuccess(res, HttpStatus.CREATED, Messages.TIMESHEET_CREATED, entries);
  });

  /** GET /api/timesheet/me */
  getMyEntries = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);
    const query = this.extractFilterQuery(req);
    const { data, meta } = await timesheetEntryService.getMyEntries(req.user._id.toString(), query);
    sendSuccess(res, HttpStatus.OK, Messages.TIMESHEETS_FETCHED, data, meta);
  });

  /** GET /api/timesheet/:id */
  getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);
    const entry = await timesheetEntryService.getEntry(req.params.id as string, req.user._id.toString());
    sendSuccess(res, HttpStatus.OK, Messages.TIMESHEET_FETCHED, entry);
  });

  /** PUT /api/timesheet/:id */
  update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);
    const entry = await timesheetEntryService.updateEntry(req.params.id as string, req.user._id.toString(), req.body);
    sendSuccess(res, HttpStatus.OK, Messages.TIMESHEET_UPDATED, entry);
  });

  /** POST /api/timesheet/:id/submit */
  submit = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);
    const entry = await timesheetEntryService.submitEntry(req.params.id as string, req.user._id.toString());
    sendSuccess(res, HttpStatus.OK, Messages.TIMESHEET_SUBMITTED, entry);
  });

  /** DELETE /api/timesheet/:id */
  delete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);
    await timesheetEntryService.deleteEntry(req.params.id as string, req.user._id.toString());
    sendSuccess(res, HttpStatus.OK, Messages.TIMESHEET_DELETED, null);
  });

  // ── Manager endpoints ─────────────────────────────────

  /** GET /api/timesheet/team/:teamId */
  getTeamEntries = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);
    const query = this.extractFilterQuery(req);
    const { data, meta } = await timesheetEntryService.getTeamEntries(
      req.user._id.toString(),
      req.params.teamId as string,
      query,
    );
    sendSuccess(res, HttpStatus.OK, Messages.TIMESHEETS_FETCHED, data, meta);
  });

  /** GET /api/timesheet/team/:teamId/export */
  exportTeamEntries = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized(Messages.TOKEN_REQUIRED);
    const query = this.extractFilterQuery(req);
    const entries = await timesheetEntryService.exportTeamEntries(
      req.user._id.toString(),
      req.params.teamId as string,
      query,
    );

    // Build CSV
    const csv = this.buildCsv(entries);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="timesheet-export-${req.params.teamId}-${Date.now()}.csv"`,
    );
    res.status(HttpStatus.OK).send(csv);
  });

  // ── Helpers ───────────────────────────────────────────

  private extractFilterQuery(req: Request): TimesheetFilterQuery {
    return {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order as 'asc' | 'desc' | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      clientId: req.query.clientId as string | undefined,
      teamId: req.query.teamId as string | undefined,
      employeeId: req.query.employeeId as string | undefined,
      status: req.query.status as any,
    };
  }

  private buildCsv(entries: any[]): string {
    const headers = [
      'Date',
      'Employee',
      'Team',
      'Client',
      'Total Hours',
      'Status',
      'Notes',
      'Task Count',
      'Tasks (Title | Duration mins)',
    ];

    const rows = entries.map((e) => {
      const date = new Date(e.date).toISOString().split('T')[0];
      const tasks = (e.tasks ?? [])
        .map((t: any) => `${t.title} (${t.durationMinutes} min)`)
        .join(' | ');

      return [
        date,
        e.employeeName ?? e.employeeId,
        e.teamName ?? e.teamId,
        e.clientName ?? e.clientId,
        e.totalHours,
        e.status,
        (e.notes ?? '').replace(/,/g, ';'),
        e.tasks?.length ?? 0,
        tasks.replace(/,/g, ';'),
      ]
        .map((v) => `"${v}"`)
        .join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export const timesheetController = new TimesheetController();
