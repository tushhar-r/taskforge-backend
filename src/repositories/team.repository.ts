// ---------------------------------------------------------
// Team repository – data-access layer
// ---------------------------------------------------------

import { Team, ITeamDocument } from '../models';
import type { CreateTeamDto, UpdateTeamDto, PaginationQuery, PaginationMeta } from '../types';
import { Pagination } from '../constants';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

class TeamRepository {
  async create(dto: CreateTeamDto): Promise<ITeamDocument> {
    const team = new Team(dto);
    return team.save();
  }

  async findById(id: string): Promise<ITeamDocument | null> {
    return Team.findById(id).exec();
  }

  async findByName(name: string): Promise<ITeamDocument | null> {
    return Team.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }).exec();
  }

  async findAll(query: PaginationQuery = {}): Promise<PaginatedResult<ITeamDocument>> {
    const page = query.page ?? Pagination.DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? Pagination.DEFAULT_LIMIT, Pagination.MAX_LIMIT);
    const sortField = query.sort ?? 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Team.find().sort({ [sortField]: sortOrder }).skip(skip).limit(limit).exec(),
      Team.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async findByList(ids: string[]): Promise<ITeamDocument[]> {
    return Team.find({ _id: { $in: ids } }).exec();
  }

  async updateById(id: string, dto: UpdateTeamDto): Promise<ITeamDocument | null> {
    return Team.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).exec();
  }

  async deleteById(id: string): Promise<ITeamDocument | null> {
    return Team.findByIdAndDelete(id).exec();
  }

  async isNameTaken(name: string, excludeTeamId?: string): Promise<boolean> {
    return Team.isNameTaken(name, excludeTeamId);
  }
}

export const teamRepository = new TeamRepository();
