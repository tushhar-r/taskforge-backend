// ---------------------------------------------------------
// User repository – data-access layer
// ---------------------------------------------------------

import { User, IUserDocument } from '../models';
import type { CreateUserDto, UpdateUserDto, PaginationQuery, PaginationMeta } from '../types';
import { Pagination } from '../constants';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

class UserRepository {
  /**
   * Create a new user document.
   */
  async create(dto: CreateUserDto): Promise<IUserDocument> {
    const user = new User(dto);
    return user.save();
  }

  /**
   * Find a user by ID. Optionally include the password field.
   */
  async findById(id: string, includePassword = false): Promise<IUserDocument | null> {
    const query = User.findById(id);
    if (includePassword) query.select('+password');
    return query.exec();
  }

  /**
   * Find a user by email. Optionally include the password field.
   */
  async findByEmail(email: string, includePassword = false): Promise<IUserDocument | null> {
    const query = User.findOne({ email });
    if (includePassword) query.select('+password');
    return query.exec();
  }

  /**
   * Return a paginated list of users.
   */
  async findAll(query: PaginationQuery = {}): Promise<PaginatedResult<IUserDocument>> {
    const page = query.page ?? Pagination.DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? Pagination.DEFAULT_LIMIT, Pagination.MAX_LIMIT);
    const sortField = query.sort ?? 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      User.find()
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      User.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update a user by ID. Returns the updated document.
   */
  async updateById(id: string, dto: UpdateUserDto): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).exec();
  }

  /**
   * Delete a user by ID. Returns the deleted document.
   */
  async deleteById(id: string): Promise<IUserDocument | null> {
    return User.findByIdAndDelete(id).exec();
  }

  /**
   * Check whether an email is already taken.
   */
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    return User.isEmailTaken(email, excludeUserId);
  }
}

export const userRepository = new UserRepository();
