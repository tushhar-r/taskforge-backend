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
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'A user with this email already exists',

  // ─── Teams ──────────────────────────────────────────
  TEAM_CREATED: 'Team created successfully',
  TEAM_FETCHED: 'Team fetched successfully',
  TEAMS_FETCHED: 'Teams fetched successfully',
  TEAM_UPDATED: 'Team updated successfully',
  TEAM_DELETED: 'Team deleted successfully',
  TEAM_NOT_FOUND: 'Team not found',
  TEAM_NAME_TAKEN: 'A team with this name already exists',
  MEMBER_ADDED: 'Member added to team successfully',
  MEMBER_REMOVED: 'Member removed from team successfully',
  MEMBER_NOT_FOUND: 'Member not found in this team',
  MEMBER_ALREADY_EXISTS: 'User is already a member of this team',
  CLIENT_LINKED: 'Client linked to team successfully',
  CLIENT_UNLINKED: 'Client unlinked from team successfully',
  CLIENT_NOT_IN_TEAM: 'Client is not linked to this team',
  CLIENT_ALREADY_IN_TEAM: 'Client is already linked to this team',
  CLIENT_ASSIGNED: 'Client assigned to employee successfully',
  CLIENT_UNASSIGNED: 'Client unassigned from employee successfully',

  // ─── Clients ────────────────────────────────────────
  CLIENT_CREATED: 'Client created successfully',
  CLIENT_FETCHED: 'Client fetched successfully',
  CLIENTS_FETCHED: 'Clients fetched successfully',
  CLIENT_UPDATED: 'Client updated successfully',
  CLIENT_DELETED: 'Client deleted successfully',
  CLIENT_NOT_FOUND: 'Client not found',

  // ─── Timesheet ──────────────────────────────────────
  TIMESHEET_CREATED: 'Timesheet entry created successfully',
  TIMESHEET_FETCHED: 'Timesheet entry fetched successfully',
  TIMESHEETS_FETCHED: 'Timesheet entries fetched successfully',
  TIMESHEET_UPDATED: 'Timesheet entry updated successfully',
  TIMESHEET_DELETED: 'Timesheet entry deleted successfully',
  TIMESHEET_NOT_FOUND: 'Timesheet entry not found',
  TIMESHEET_SUBMITTED: 'Timesheet entry submitted successfully',
  TIMESHEET_ALREADY_SUBMITTED: 'This timesheet entry has already been submitted and cannot be edited',
  TIMESHEET_DUPLICATE: 'A timesheet entry already exists for this employee, client, and date',

  // ─── Generic ────────────────────────────────────────
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred',
  VALIDATION_ERROR: 'Validation failed',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  ROUTE_NOT_FOUND: 'The requested resource was not found',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
} as const;

/** Permission Flags for Dynamic RBAC */
export enum Permission {
  // System Administration
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  
  // Teams
  TEAM_WRITE = 'TEAM_WRITE',    // create, update, delete, manage members
  TEAM_READ = 'TEAM_READ',      // view teams & members

  // Clients
  CLIENT_WRITE = 'CLIENT_WRITE',    // add/edit/delete globally
  CLIENT_READ = 'CLIENT_READ',      // view globally

  // Timesheets
  TIMESHEET_SUBMIT = 'TIMESHEET_SUBMIT',        // create/edit personal timesheets
  TIMESHEET_VIEW_PERSONAL = 'TIMESHEET_VIEW_PERSONAL', // view own timesheets
  TIMESHEET_MANAGE_TEAM = 'TIMESHEET_MANAGE_TEAM', // view/export for team members
}

/** Pre-defined protected system role names */
export const SystemRoles = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const;

/** Timesheet entry status */
export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
}

/** Pagination defaults */
export const Pagination = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
