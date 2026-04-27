// ---------------------------------------------------------
// Client repository – data-access layer
// ---------------------------------------------------------

import { Client, IClientDocument } from '../models';
import type { CreateClientDto, UpdateClientDto, PaginationQuery, PaginationMeta } from '../types';
import { Pagination } from '../constants';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

class ClientRepository {
  async create(dto: CreateClientDto): Promise<IClientDocument> {
    const client = new Client(dto);
    return client.save();
  }

  async findById(id: string): Promise<IClientDocument | null> {
    return Client.findById(id).exec();
  }

  async findByIds(ids: string[]): Promise<IClientDocument[]> {
    return Client.find({ _id: { $in: ids } }).exec();
  }

  async findAll(query: PaginationQuery = {}): Promise<PaginatedResult<IClientDocument>> {
    const page = query.page ?? Pagination.DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? Pagination.DEFAULT_LIMIT, Pagination.MAX_LIMIT);
    const sortField = query.sort ?? 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Client.find().sort({ [sortField]: sortOrder }).skip(skip).limit(limit).exec(),
      Client.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async updateById(id: string, dto: UpdateClientDto): Promise<IClientDocument | null> {
    return Client.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).exec();
  }

  async deleteById(id: string): Promise<IClientDocument | null> {
    return Client.findByIdAndDelete(id).exec();
  }
}

export const clientRepository = new ClientRepository();
