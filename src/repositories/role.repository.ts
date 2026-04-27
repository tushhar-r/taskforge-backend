// ---------------------------------------------------------
// Role repository – data access logic for custom roles
// ---------------------------------------------------------

import { Role } from '../models';
import type { IRoleDocument } from '../models';
import type { CreateRoleDto, UpdateRoleDto, PaginationQuery, PaginationMeta } from '../types';
import { Pagination } from '../constants';

interface PaginatedRoles {
  data: IRoleDocument[];
  meta: PaginationMeta;
}

class RoleRepository {
  async create(dto: CreateRoleDto & { isSystem?: boolean }): Promise<IRoleDocument> {
    return Role.create(dto);
  }

  async findById(id: string): Promise<IRoleDocument | null> {
    return Role.findById(id);
  }

  async findByName(name: string): Promise<IRoleDocument | null> {
    return Role.findOne({ name: new RegExp(`^${name}$`, 'i') });
  }

  async isNameTaken(name: string, excludeId?: string): Promise<boolean> {
    return Role.isNameTaken(name, excludeId);
  }

  async findAll(query: PaginationQuery): Promise<PaginatedRoles> {
    const page = query.page ?? Pagination.DEFAULT_PAGE;
    const limit = query.limit ?? Pagination.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const sortConfig: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortConfig[query.sort] = query.order === 'desc' ? -1 : 1;
    } else {
      sortConfig.createdAt = -1; // Default
    }

    const [data, total] = await Promise.all([
      Role.find().sort(sortConfig).skip(skip).limit(limit),
      Role.countDocuments(),
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

  async updateById(id: string, dto: UpdateRoleDto): Promise<IRoleDocument | null> {
    return Role.findByIdAndUpdate(id, { $set: dto }, { new: true });
  }

  async deleteById(id: string): Promise<IRoleDocument | null> {
    return Role.findByIdAndDelete(id);
  }
}

export const roleRepository = new RoleRepository();
