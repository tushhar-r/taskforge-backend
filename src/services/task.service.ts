// ---------------------------------------------------------
// Task service – business logic for task core
// ---------------------------------------------------------

import { taskRepository, PaginatedResult } from '../repositories';
import { AppError } from '../utils';
import { Messages } from '../constants';
import type { CreateTaskDto, UpdateTaskDto, TaskFilterQuery, SanitizedTask } from '../types';
import type { ITaskDocument } from '../models';

class TaskService {
  /**
   * Create a task for a user.
   */
  async create(userId: string, dto: CreateTaskDto): Promise<SanitizedTask> {
    const task = await taskRepository.create(userId, dto);
    return this.sanitize(task);
  }

  /**
   * Get all tasks for the logged in user with pagination/filtering.
   */
  async getAllForUser(userId: string, query: TaskFilterQuery): Promise<PaginatedResult<SanitizedTask>> {
    const result = await taskRepository.findAllByOwner(userId, query);
    return {
      data: result.data.map(this.sanitize),
      meta: result.meta,
    };
  }

  /**
   * Get a single task by ID checking user ownership.
   */
  async getById(id: string, userId: string): Promise<SanitizedTask> {
    const task = await taskRepository.findByIdAndOwner(id, userId);
    if (!task) {
      throw AppError.notFound(Messages.TASK_NOT_FOUND);
    }
    return this.sanitize(task);
  }

  /**
   * Update a task by ID checking user ownership.
   */
  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<SanitizedTask> {
    const task = await taskRepository.updateByIdAndOwner(id, userId, dto);
    if (!task) {
      throw AppError.notFound(Messages.TASK_NOT_FOUND);
    }
    return this.sanitize(task);
  }

  /**
   * Delete a task by ID checking user ownership.
   */
  async delete(id: string, userId: string): Promise<void> {
    const task = await taskRepository.deleteByIdAndOwner(id, userId);
    if (!task) {
      throw AppError.notFound(Messages.TASK_NOT_FOUND);
    }
  }

  // ── Helpers ────────────────────────────────────────────

  private sanitize(task: ITaskDocument): SanitizedTask {
    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      tags: task.tags || [],
      dueDate: task.dueDate,
      userId: task.userId.toString(),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

export const taskService = new TaskService();
