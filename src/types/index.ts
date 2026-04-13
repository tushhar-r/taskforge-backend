// ---------------------------------------------------------
// Global type declarations for the Express.js application
// ---------------------------------------------------------

import { IUserDocument } from '../models/user.model';

/**
 * Extend Express Request with authenticated user payload.
 * This avoids polluting the global namespace with loose `any` types.
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
  role: string;
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
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ─── Task DTOs ──────────────────────────────────────────

export interface SanitizedTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  tags: string[];
  dueDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  dueDate?: string | Date;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  dueDate?: string | Date;
}

export interface TaskFilterQuery extends PaginationQuery {
  status?: string;
  search?: string;
}

