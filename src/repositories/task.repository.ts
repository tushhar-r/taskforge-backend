// ---------------------------------------------------------
// Task repository – data-access layer
// ---------------------------------------------------------

import { Task, ITaskDocument } from '../models';
import type { CreateTaskDto, UpdateTaskDto, TaskFilterQuery } from '../types';
import { Pagination } from '../constants';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class TaskRepository {
  /**
   * Create a new task document.
   */
  async create(userId: string, dto: CreateTaskDto): Promise<ITaskDocument> {
    const task = new Task({ ...dto, userId });
    return task.save();
  }

  /**
   * Find a single task by ID and the owner ID.
   */
  async findByIdAndOwner(id: string, userId: string): Promise<ITaskDocument | null> {
    return Task.findOne({ _id: id, userId }).exec();
  }

  /**
   * Return a paginated list of tasks for a specific user, with optional filters.
   */
  async findAllByOwner(
    userId: string,
    query: TaskFilterQuery = {},
  ): Promise<PaginatedResult<ITaskDocument>> {
    const page = query.page ?? Pagination.DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? Pagination.DEFAULT_LIMIT, Pagination.MAX_LIMIT);
    const sortField = query.sort ?? 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    // Filters
    const filter: Record<string, any> = { userId };
    
    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      // Simple exact match or text search for title if using mongoose search
      // Using regex for partial text search
      filter.title = { $regex: query.search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      Task.countDocuments(filter).exec(),
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
   * Update a task by ID ensuring it belongs to the user.
   */
  async updateByIdAndOwner(
    id: string,
    userId: string,
    dto: UpdateTaskDto,
  ): Promise<ITaskDocument | null> {
    return Task.findOneAndUpdate({ _id: id, userId }, { $set: dto }, { new: true, runValidators: true }).exec();
  }

  /**
   * Delete a task by ID ensuring it belongs to the user.
   */
  async deleteByIdAndOwner(id: string, userId: string): Promise<ITaskDocument | null> {
    return Task.findOneAndDelete({ _id: id, userId }).exec();
  }
}

export const taskRepository = new TaskRepository();
