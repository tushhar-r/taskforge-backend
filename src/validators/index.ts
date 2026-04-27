// ---------------------------------------------------------
// Zod validation schemas for all request bodies / params / queries
// ---------------------------------------------------------

import { z } from 'zod';
import { Permission, TimesheetStatus } from '../constants';

// ─── Helpers ─────────────────────────────────────────────

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

const idParam = z.object({ params: z.object({ id: mongoId }) });

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
    roleId: mongoId.optional(),
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

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    roleId: mongoId.optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),
    email: z.string().trim().email('Please provide a valid email').toLowerCase().optional(),
    roleId: mongoId.optional(),
  }),
  params: z.object({ id: mongoId }),
});

export const userIdParamSchema = idParam;

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sort: z.enum(['name', 'email', 'createdAt', 'updatedAt', 'date', 'totalHours']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

// ─── Roles ──────────────────────────────────────────────

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(50),
    permissions: z.array(z.nativeEnum(Permission)),
    description: z.string().trim().max(200).optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(50).optional(),
    permissions: z.array(z.nativeEnum(Permission)).optional(),
    description: z.string().trim().max(200).optional(),
  }),
  params: z.object({ id: mongoId }),
});

export const roleIdParamSchema = idParam;

// ─── Teams ──────────────────────────────────────────────

export const createTeamSchema = z.object({
  body: z.object({
    name: z
      .string({ error: 'Team name is required' })
      .trim()
      .min(2, 'Team name must be at least 2 characters')
      .max(100, 'Team name must not exceed 100 characters'),
    description: z.string().trim().max(500, 'Description must not exceed 500 characters').optional(),
  }),
});

export const updateTeamSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).optional(),
  }),
  params: z.object({ id: mongoId }),
});

export const teamIdParamSchema = idParam;

export const addMemberSchema = z.object({
  body: z.object({
    userId: mongoId,
    role: z.enum(['manager', 'employee'], { error: 'Role must be manager or employee' }),
  }),
  params: z.object({ id: mongoId }),
});

export const memberParamSchema = z.object({
  params: z.object({ id: mongoId, userId: mongoId }),
});

export const linkClientSchema = z.object({
  body: z.object({ clientId: mongoId }),
  params: z.object({ id: mongoId }),
});

export const assignClientSchema = z.object({
  params: z.object({ id: mongoId, userId: mongoId, clientId: mongoId }),
});

// ─── Clients ────────────────────────────────────────────

export const createClientSchema = z.object({
  body: z.object({
    name: z
      .string({ error: 'Client name is required' })
      .trim()
      .min(2, 'Client name must be at least 2 characters')
      .max(150, 'Client name must not exceed 150 characters'),
    email: z.string().trim().email('Please provide a valid email').optional(),
    phone: z.string().trim().max(30, 'Phone number must not exceed 30 characters').optional(),
    companyName: z.string().trim().max(150, 'Company name must not exceed 150 characters').optional(),
  }),
});

export const updateClientSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(150).optional(),
    email: z.string().trim().email('Please provide a valid email').optional(),
    phone: z.string().trim().max(30).optional(),
    companyName: z.string().trim().max(150).optional(),
  }),
  params: z.object({ id: mongoId }),
});

export const clientIdParamSchema = idParam;

// ─── Timesheet ──────────────────────────────────────────

const taskLogSchema = z.object({
  title: z
    .string({ error: 'Task title is required' })
    .trim()
    .min(1, 'Task title cannot be empty')
    .max(200, 'Task title must not exceed 200 characters'),
  description: z.string().trim().max(1000, 'Task description must not exceed 1000 characters').optional(),
  durationMinutes: z
    .number({ error: 'Duration is required' })
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration cannot exceed 1440 minutes'),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export const createTimesheetSchema = z.object({
  body: z
    .object({
      teamId: mongoId,
      clientIds: z.array(mongoId).min(1, 'At least one client must be selected'),
      date: z.coerce.date({ error: 'Date is required' }),
      totalHours: z.number().min(0).max(24).optional(),
      notes: z.string().trim().max(2000, 'Notes must not exceed 2000 characters').optional(),
      tasks: z.array(taskLogSchema).max(50, 'Cannot have more than 50 tasks per entry').optional(),
    })
    .refine((data) => data.totalHours !== undefined || (data.tasks && data.tasks.length > 0), {
      message: 'Either totalHours or at least one task is required',
    }),
});

export const updateTimesheetSchema = z.object({
  body: z.object({
    totalHours: z.number().min(0).max(24).optional(),
    notes: z.string().trim().max(2000).optional(),
    tasks: z.array(taskLogSchema).max(50).optional(),
  }),
  params: z.object({ id: mongoId }),
});

export const timesheetIdParamSchema = idParam;

export const timesheetFilterQuerySchema = paginationQuerySchema.extend({
  query: paginationQuerySchema.shape.query.extend({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    clientId: mongoId.optional(),
    teamId: mongoId.optional(),
    employeeId: mongoId.optional(),
    status: z.nativeEnum(TimesheetStatus).optional(),
  }),
});
