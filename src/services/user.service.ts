// ---------------------------------------------------------
// User service – business logic for user CRUD
// ---------------------------------------------------------

import { userRepository, roleRepository, PaginatedResult } from '../repositories';
import { AppError } from '../utils';
import { Messages, SystemRoles } from '../constants';
import type { CreateUserDto, UpdateUserDto, PaginationQuery, SanitizedUser } from '../types';
import type { IUserDocument, IRoleDocument } from '../models';

class UserService {
  /**
   * Create a new user from admin panel.
   */
  async create(dto: CreateUserDto): Promise<SanitizedUser> {
    const emailTaken = await userRepository.isEmailTaken(dto.email);
    if (emailTaken) {
      throw AppError.conflict(Messages.EMAIL_ALREADY_EXISTS);
    }

    if (!dto.roleId) {
      const defaultRole = await roleRepository.findByName(SystemRoles.EMPLOYEE);
      if (!defaultRole) throw AppError.internal('Default role missing from database');
      dto.roleId = defaultRole._id.toString();
    }

    const userEntry = await userRepository.create(dto);
    const user = await userEntry.populate<{ roleId: IRoleDocument }>('roleId');
    return this.sanitize(user as any);
  }

  /**
   * Get all users with pagination.
   */
  async getAll(query: PaginationQuery): Promise<PaginatedResult<SanitizedUser>> {
    const result = await userRepository.findAll(query);
    return {
      // @ts-expect-error - Mongoose population bypasses strict TS type merging here
      data: result.data.map(this.sanitize),
      meta: result.meta,
    };
  }

  /**
   * Get a single user by ID.
   */
  async getById(id: string): Promise<SanitizedUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw AppError.notFound(Messages.USER_NOT_FOUND);
    }
    return this.sanitize(user as any);
  }

  /**
   * Update a user by ID.
   */
  async update(id: string, dto: UpdateUserDto): Promise<SanitizedUser> {
    // If email is being changed, check uniqueness
    if (dto.email) {
      const emailTaken = await userRepository.isEmailTaken(dto.email, id);
      if (emailTaken) {
        throw AppError.conflict(Messages.EMAIL_ALREADY_EXISTS);
      }
    }

    const user = await userRepository.updateById(id, dto);
    if (!user) {
      throw AppError.notFound(Messages.USER_NOT_FOUND);
    }
    return this.sanitize(user as any);
  }

  /**
   * Delete a user by ID.
   */
  async delete(id: string): Promise<void> {
    const user = await userRepository.deleteById(id);
    if (!user) {
      throw AppError.notFound(Messages.USER_NOT_FOUND);
    }
  }

  // ── Helpers ────────────────────────────────────────────

  private sanitize(user: Omit<IUserDocument, 'roleId'> & { roleId: IRoleDocument; _id: any; name: string; email: string; createdAt: Date; updatedAt: Date }): SanitizedUser {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: {
        id: user.roleId._id.toString(),
        name: user.roleId.name,
        permissions: user.roleId.permissions,
        description: user.roleId.description,
        isSystem: user.roleId.isSystem,
        createdAt: user.roleId.createdAt,
        updatedAt: user.roleId.updatedAt,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const userService = new UserService();
