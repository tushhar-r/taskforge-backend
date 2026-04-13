// ---------------------------------------------------------
// Zod validation schemas for auth & user requests
// ---------------------------------------------------------

import { z } from 'zod';
import { UserRole } from '../constants';

// ─── Auth ───────────────────────────────────────────────

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    email: z
      .string({ error: 'Email is required' })
      .trim()
      .email('Please provide a valid email')
      .toLowerCase(),
    password: z
      .string({ error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    role: z.nativeEnum(UserRole).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ error: 'Email is required' })
      .trim()
      .email('Please provide a valid email')
      .toLowerCase(),
    password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ error: 'Refresh token is required' }).min(1),
  }),
});

// ─── Users ──────────────────────────────────────────────

export const updateUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),
    email: z.string().trim().email('Please provide a valid email').toLowerCase().optional(),
    role: z.nativeEnum(UserRole).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
  }),
});

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sort: z.enum(['name', 'email', 'createdAt', 'updatedAt', 'title', 'status']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

// ─── Tasks ──────────────────────────────────────────────

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string({ error: 'Title is required' })
      .trim()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title must not exceed 200 characters'),
    description: z.string().trim().max(2000, 'Description must not exceed 2000 characters').optional(),
    status: z.nativeEnum({ TODO: 'todo', IN_PROGRESS: 'in_progress', DONE: 'done' }).optional(),
    priority: z.nativeEnum({ LOW: 'low', MEDIUM: 'medium', HIGH: 'high' }).optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    dueDate: z.coerce.date().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    status: z.nativeEnum({ TODO: 'todo', IN_PROGRESS: 'in_progress', DONE: 'done' }).optional(),
    priority: z.nativeEnum({ LOW: 'low', MEDIUM: 'medium', HIGH: 'high' }).optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    dueDate: z.coerce.date().nullable().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid task ID'),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid task ID'),
  }),
});

export const taskFilterQuerySchema = paginationQuerySchema.extend({
  query: paginationQuerySchema.shape.query.extend({
    status: z.nativeEnum({ TODO: 'todo', IN_PROGRESS: 'in_progress', DONE: 'done' }).optional(),
    priority: z.nativeEnum({ LOW: 'low', MEDIUM: 'medium', HIGH: 'high' }).optional(),
    search: z.string().optional(),
  }),
});
