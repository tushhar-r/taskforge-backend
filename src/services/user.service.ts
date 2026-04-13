// ---------------------------------------------------------
// User service – business logic for user CRUD
// ---------------------------------------------------------

import { userRepository, PaginatedResult } from '../repositories';
import { AppError } from '../utils';
import { Messages } from '../constants';
import type { UpdateUserDto, PaginationQuery, SanitizedUser } from '../types';
import type { IUserDocument } from '../models';

class UserService {
  /**
   * Get all users with pagination.
   */
  async getAll(query: PaginationQuery): Promise<PaginatedResult<SanitizedUser>> {
    const result = await userRepository.findAll(query);
    return {
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
    return this.sanitize(user);
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
    return this.sanitize(user);
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

  private sanitize(user: IUserDocument): SanitizedUser {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const userService = new UserService();
