// ---------------------------------------------------------
// TimesheetEntry service – business logic
// ---------------------------------------------------------

import { timesheetEntryRepository, teamMemberRepository } from '../repositories';
import { AppError } from '../utils';
import { Messages, TimesheetStatus } from '../constants';
import type {
  CreateTimesheetEntryDto,
  UpdateTimesheetEntryDto,
  SanitizedTimesheetEntry,
  SanitizedTaskLog,
  TimesheetFilterQuery,
  PaginationMeta,
} from '../types';
import type { ITimesheetEntryDocument, ITaskLog } from '../models';

interface PaginatedTimesheets {
  data: SanitizedTimesheetEntry[];
  meta: PaginationMeta;
}

class TimesheetEntryService {
  /**
   * Create new timesheet entries (Batch).
   * Validates: employee belongs to team.
   */
  async createEntries(employeeId: string, dto: CreateTimesheetEntryDto): Promise<SanitizedTimesheetEntry[]> {
    // Validate team membership
    const membership = await teamMemberRepository.findOne(dto.teamId, employeeId);
    if (!membership) {
      throw AppError.forbidden(Messages.INSUFFICIENT_PERMISSIONS);
    }

    // Auto-compute totalHours from tasks if not provided
    const totalHours = dto.totalHours ?? this.computeHoursFromTasks(dto.tasks ?? []);

    const createdEntries: SanitizedTimesheetEntry[] = [];

    // Create an entry for each client
    for (const clientId of dto.clientIds) {
      // Check for duplicate (same employee + client + day)
      const duplicate = await timesheetEntryRepository.findDuplicate(employeeId, clientId, dto.date);
      if (duplicate) continue; // Skip duplicates in batch

      const entry = await timesheetEntryRepository.create(employeeId, dto.teamId, { 
        date: dto.date,
        totalHours,
        notes: dto.notes,
        tasks: dto.tasks,
        clientId 
      } as any);
      createdEntries.push(this.sanitize(entry));
    }

    return createdEntries;
  }

  /**
   * Get a single entry (ownership verified).
   */
  async getEntry(entryId: string, employeeId: string): Promise<SanitizedTimesheetEntry> {
    const entry = await timesheetEntryRepository.findByIdPopulated(entryId);
    if (!entry) throw AppError.notFound(Messages.TIMESHEET_NOT_FOUND);
    if (entry.employeeId.toString() !== employeeId) {
      throw AppError.forbidden(Messages.INSUFFICIENT_PERMISSIONS);
    }
    return this.sanitize(entry);
  }

  /**
   * Get paginated entries for an employee.
   */
  async getMyEntries(employeeId: string, query: TimesheetFilterQuery): Promise<PaginatedTimesheets> {
    const result = await timesheetEntryRepository.findByEmployee(employeeId, query);
    return { 
      data: result.data.map(entry => this.sanitize(entry)), 
      meta: result.meta 
    };
  }

  /**
   * Update a draft entry (ownership verified).
   */
  async updateEntry(entryId: string, employeeId: string, dto: UpdateTimesheetEntryDto): Promise<SanitizedTimesheetEntry> {
    const existing = await timesheetEntryRepository.findById(entryId);
    if (!existing) throw AppError.notFound(Messages.TIMESHEET_NOT_FOUND);
    if (existing.employeeId.toString() !== employeeId) {
      throw AppError.forbidden(Messages.INSUFFICIENT_PERMISSIONS);
    }
    if (existing.status === TimesheetStatus.SUBMITTED) {
      throw AppError.badRequest(Messages.TIMESHEET_ALREADY_SUBMITTED);
    }

    // Auto-compute totalHours if tasks are updated and totalHours not explicitly provided
    const updatePayload: UpdateTimesheetEntryDto = { ...dto };
    if (dto.tasks && dto.totalHours === undefined) {
      updatePayload.totalHours = this.computeHoursFromTasks(dto.tasks);
    }

    const entry = await timesheetEntryRepository.updateById(entryId, updatePayload);
    if (!entry) throw AppError.notFound(Messages.TIMESHEET_NOT_FOUND);
    return this.sanitize(entry);
  }

  /**
   * Submit a draft entry (ownership verified).
   */
  async submitEntry(entryId: string, employeeId: string): Promise<SanitizedTimesheetEntry> {
    const existing = await timesheetEntryRepository.findById(entryId);
    if (!existing) throw AppError.notFound(Messages.TIMESHEET_NOT_FOUND);
    if (existing.employeeId.toString() !== employeeId) {
      throw AppError.forbidden(Messages.INSUFFICIENT_PERMISSIONS);
    }
    if (existing.status === TimesheetStatus.SUBMITTED) {
      throw AppError.badRequest(Messages.TIMESHEET_ALREADY_SUBMITTED);
    }

    const entry = await timesheetEntryRepository.submitById(entryId);
    if (!entry) throw AppError.notFound(Messages.TIMESHEET_NOT_FOUND);
    return this.sanitize(entry);
  }

  /**
   * Delete a draft entry (ownership verified).
   */
  async deleteEntry(entryId: string, employeeId: string): Promise<void> {
    const existing = await timesheetEntryRepository.findById(entryId);
    if (!existing) throw AppError.notFound(Messages.TIMESHEET_NOT_FOUND);
    if (existing.employeeId.toString() !== employeeId) {
      throw AppError.forbidden(Messages.INSUFFICIENT_PERMISSIONS);
    }
    if (existing.status === TimesheetStatus.SUBMITTED) {
      throw AppError.badRequest(Messages.TIMESHEET_ALREADY_SUBMITTED);
    }

    await timesheetEntryRepository.deleteById(entryId);
  }

  /**
   * Manager: get paginated team entries with filters.
   * Validates that the requesting user is a manager of that team.
   */
  async getTeamEntries(managerId: string, teamId: string, query: TimesheetFilterQuery): Promise<PaginatedTimesheets> {
    const membership = await teamMemberRepository.findOne(teamId, managerId);
    if (!membership) throw AppError.forbidden(Messages.INSUFFICIENT_PERMISSIONS);

    const result = await timesheetEntryRepository.findByTeam(teamId, query);
    return { 
      data: result.data.map(entry => this.sanitize(entry)), 
      meta: result.meta 
    };
  }

  /**
   * Manager: export team entries as an array (serialized for CSV).
   */
  async exportTeamEntries(managerId: string, teamId: string, query: TimesheetFilterQuery): Promise<SanitizedTimesheetEntry[]> {
    const membership = await teamMemberRepository.findOne(teamId, managerId);
    if (!membership) throw AppError.forbidden(Messages.INSUFFICIENT_PERMISSIONS);

    const entries = await timesheetEntryRepository.findByTeamForExport(teamId, query);
    return entries.map(entry => this.sanitize(entry));
  }

  // ── Helpers ───────────────────────────────────────────

  private computeHoursFromTasks(tasks: { durationMinutes: number }[]): number {
    const totalMinutes = tasks.reduce((sum, t) => sum + (t.durationMinutes ?? 0), 0);
    return Math.round((totalMinutes / 60) * 100) / 100; // 2 decimal places
  }

  private sanitizeTaskLog(task: ITaskLog): SanitizedTaskLog {
    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      durationMinutes: task.durationMinutes,
      tags: task.tags ?? [],
    };
  }

  private idToString(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    
    // If it's a populated document with an id string
    if (val.id && typeof val.id === 'string') return val.id;
    if (val._id && typeof val._id === 'string') return val._id;
    
    // If it's a Mongoose ObjectId or populated document with _id object
    if (val.toString && typeof val.toString === 'function' && !Buffer.isBuffer(val)) {
      const str = val.toString();
      // Mongoose ObjectId.toString() returns the 24-char hex string
      // If it looks like [object Object] or similar, it's not what we want
      if (str !== '[object Object]') return str;
    }

    // If it's a raw Buffer (common for binary ObjectIDs in some drivers)
    if (Buffer.isBuffer(val)) {
      return val.toString('hex');
    }

    // Fallback for ObjectId-like objects that might have _id
    if (val._id) return this.idToString(val._id);

    return String(val);
  }

  private sanitize(entry: ITimesheetEntryDocument): SanitizedTimesheetEntry {
    const employeeId = this.idToString(entry.employeeId);
    const employeeName = entry.employeeId && (entry.employeeId as any).name;

    const teamId = this.idToString(entry.teamId);
    const teamName = entry.teamId && (entry.teamId as any).name;

    const clientId = this.idToString(entry.clientId);
    const clientName = entry.clientId && (entry.clientId as any).name;

    return {
      id: entry._id.toString(),
      employeeId,
      employeeName,
      teamId,
      teamName,
      clientId,
      clientName,
      date: entry.date,
      totalHours: entry.totalHours,
      notes: entry.notes,
      status: entry.status,
      tasks: (entry.tasks ?? []).map((t) => this.sanitizeTaskLog(t)),
      submittedAt: entry.submittedAt,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
}

export const timesheetEntryService = new TimesheetEntryService();
