// ---------------------------------------------------------
// TimesheetEntry repository – data-access layer
// ---------------------------------------------------------

import { TimesheetEntry, ITimesheetEntryDocument } from '../models';
import type { CreateTimesheetEntryDto, UpdateTimesheetEntryDto, TimesheetFilterQuery, PaginationMeta } from '../types';
import { Pagination, TimesheetStatus } from '../constants';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

class TimesheetEntryRepository {
  /** Create a new timesheet entry. */
  async create(employeeId: string, teamId: string, dto: Omit<CreateTimesheetEntryDto, 'clientIds'> & { clientId: string }): Promise<ITimesheetEntryDocument> {
    // Normalize date to midnight UTC
    const date = this.normalizeDate(dto.date);
    const entry = new TimesheetEntry({ ...dto, employeeId, teamId, date });
    return entry.save();
  }

  /** Find by ID. */
  async findById(id: string): Promise<ITimesheetEntryDocument | null> {
    return TimesheetEntry.findById(id).exec();
  }

  /** Find by ID with populated employee/team/client names. */
  async findByIdPopulated(id: string): Promise<ITimesheetEntryDocument | null> {
    return TimesheetEntry.findById(id)
      .populate('employeeId', 'name email')
      .populate('teamId', 'name')
      .populate('clientId', 'name companyName')
      .exec();
  }

  /** Check for a duplicate entry (same employee + client + day). */
  async findDuplicate(employeeId: string, clientId: string, date: Date | string, excludeId?: string): Promise<ITimesheetEntryDocument | null> {
    const normalizedDate = this.normalizeDate(date);
    const filter: Record<string, unknown> = { employeeId, clientId, date: normalizedDate };
    if (excludeId) filter._id = { $ne: excludeId };
    return TimesheetEntry.findOne(filter).exec();
  }

  /** All entries for a specific employee, with filters and pagination. */
  async findByEmployee(employeeId: string, query: TimesheetFilterQuery = {}): Promise<PaginatedResult<ITimesheetEntryDocument>> {
    const filter: Record<string, unknown> = { employeeId };
    this.applyDateFilters(filter, query);
    if (query.clientId) filter.clientId = query.clientId;
    if (query.teamId) filter.teamId = query.teamId;
    if (query.status) filter.status = query.status;

    return this.paginate(filter, query);
  }

  /** All entries for a team (manager view), with filters and pagination. */
  async findByTeam(teamId: string, query: TimesheetFilterQuery = {}): Promise<PaginatedResult<ITimesheetEntryDocument>> {
    const filter: Record<string, unknown> = { teamId };
    this.applyDateFilters(filter, query);
    if (query.clientId) filter.clientId = query.clientId;
    if (query.employeeId) filter.employeeId = query.employeeId;
    if (query.status) filter.status = query.status;

    return this.paginate(filter, query);
  }

  /** All entries for a team in a date range (CSV export). */
  async findByTeamForExport(teamId: string, query: TimesheetFilterQuery = {}): Promise<ITimesheetEntryDocument[]> {
    const filter: Record<string, unknown> = { teamId };
    this.applyDateFilters(filter, query);
    if (query.clientId) filter.clientId = query.clientId;
    if (query.employeeId) filter.employeeId = query.employeeId;
    if (query.status) filter.status = query.status;

    return TimesheetEntry.find(filter)
      .populate('employeeId', 'name email')
      .populate('clientId', 'name companyName')
      .sort({ date: -1 })
      .exec();
  }

  /** Update entry fields (only allowed while status = draft). */
  async updateById(id: string, dto: UpdateTimesheetEntryDto): Promise<ITimesheetEntryDocument | null> {
    return TimesheetEntry.findOneAndUpdate(
      { _id: id, status: TimesheetStatus.DRAFT },
      { $set: dto },
      { new: true, runValidators: true },
    ).exec();
  }

  /** Mark entry as submitted. */
  async submitById(id: string): Promise<ITimesheetEntryDocument | null> {
    return TimesheetEntry.findOneAndUpdate(
      { _id: id, status: TimesheetStatus.DRAFT },
      { $set: { status: TimesheetStatus.SUBMITTED, submittedAt: new Date() } },
      { new: true },
    ).exec();
  }

  /** Delete a draft entry. */
  async deleteById(id: string): Promise<ITimesheetEntryDocument | null> {
    return TimesheetEntry.findOneAndDelete({ _id: id, status: TimesheetStatus.DRAFT }).exec();
  }

  // ── Helpers ───────────────────────────────────────────

  private normalizeDate(date: Date | string): Date {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private applyDateFilters(filter: Record<string, unknown>, query: TimesheetFilterQuery) {
    if (query.startDate || query.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (query.startDate) dateFilter.$gte = this.normalizeDate(query.startDate);
      if (query.endDate) dateFilter.$lte = this.normalizeDate(query.endDate);
      filter.date = dateFilter;
    }
  }

  private async paginate(
    filter: Record<string, unknown>,
    query: TimesheetFilterQuery,
  ): Promise<PaginatedResult<ITimesheetEntryDocument>> {
    const page = query.page ?? Pagination.DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? Pagination.DEFAULT_LIMIT, Pagination.MAX_LIMIT);
    const skip = (page - 1) * limit;

    let q = TimesheetEntry.find(filter).sort({ date: -1 }).skip(skip).limit(limit);
    
    // Always populate names for visibility in tables
    q = q
      .populate('employeeId', 'name email')
      .populate('teamId', 'name')
      .populate('clientId', 'name companyName');

    const [data, total] = await Promise.all([q.exec(), TimesheetEntry.countDocuments(filter).exec()]);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }
}

export const timesheetEntryRepository = new TimesheetEntryRepository();
