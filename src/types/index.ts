// ---------------------------------------------------------
// Global type declarations for the Express.js application
// ---------------------------------------------------------

import { IUserDocument } from '../models/user.model';
import { Permission, TimesheetStatus } from '../constants';

/**
 * Extend Express Request with authenticated user payload.
 */
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

// ─── Standard API Envelope ──────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Pagination ─────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ─── Auth ───────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  roleId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: SanitizedUser;
  tokens: TokenPair;
}

// ─── User DTOs ──────────────────────────────────────────

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  role: SanitizedRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  roleId?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  roleId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ─── Role DTOs ──────────────────────────────────────────

export interface SanitizedRole {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDto {
  name: string;
  permissions: Permission[];
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  permissions?: Permission[];
  description?: string;
}

// ─── Team DTOs ──────────────────────────────────────────

export interface SanitizedTeam {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
}

export interface AddMemberDto {
  userId: string;
  role: 'manager' | 'employee';
}

// ─── Client DTOs ────────────────────────────────────────

export interface SanitizedClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDto {
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
}

export interface UpdateClientDto {
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
}

// ─── Timesheet DTOs ─────────────────────────────────────

export interface TaskLogDto {
  title: string;
  description?: string;
  durationMinutes: number;
  tags?: string[];
}

export interface SanitizedTaskLog {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  tags: string[];
}

export interface SanitizedTimesheetEntry {
  id: string;
  employeeId: string;
  employeeName?: string;
  teamId: string;
  teamName?: string;
  clientId: string;
  clientName?: string;
  date: Date;
  totalHours: number;
  notes?: string;
  status: TimesheetStatus;
  tasks: SanitizedTaskLog[];
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTimesheetEntryDto {
  teamId: string;
  clientIds: string[];
  date: string | Date;
  totalHours?: number;
  notes?: string;
  tasks?: TaskLogDto[];
}

export interface UpdateTimesheetEntryDto {
  totalHours?: number;
  notes?: string;
  tasks?: TaskLogDto[];
}

export interface TimesheetFilterQuery extends PaginationQuery {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  teamId?: string;
  employeeId?: string;
  status?: TimesheetStatus;
}
