// ---------------------------------------------------------
// Application-wide constants – messages, enums, defaults
// ---------------------------------------------------------

/** HTTP status codes used throughout the API */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/** Standardised error codes returned in ApiErrorResponse.error.code */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
} as const;

/** User-facing messages */
export const Messages = {
  // ─── Auth ───────────────────────────────────────────
  REGISTER_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_REQUIRED: 'Authentication token is required',
  TOKEN_EXPIRED: 'Authentication token has expired',
  INVALID_TOKEN: 'Authentication token is invalid',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',

  // ─── Users ──────────────────────────────────────────
  USER_FETCHED: 'User fetched successfully',
  USERS_FETCHED: 'Users fetched successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'A user with this email already exists',

  // ─── Generic ────────────────────────────────────────
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred',
  VALIDATION_ERROR: 'Validation failed',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  ROUTE_NOT_FOUND: 'The requested resource was not found',

  // ─── Tasks ──────────────────────────────────────────
  TASK_CREATED: 'Task created successfully',
  TASK_FETCHED: 'Task fetched successfully',
  TASKS_FETCHED: 'Tasks fetched successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  TASK_NOT_FOUND: 'Task not found',
} as const;

/** User roles */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/** Task statuses */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

/** Pagination defaults */
export const Pagination = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
