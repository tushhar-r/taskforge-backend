// ---------------------------------------------------------
// Client service – business logic for clients
// ---------------------------------------------------------

import { clientRepository } from '../repositories';
import { AppError } from '../utils';
import { Messages } from '../constants';
import type { CreateClientDto, UpdateClientDto, SanitizedClient, PaginationQuery } from '../types';
import type { IClientDocument } from '../models';

class ClientService {
  async create(dto: CreateClientDto): Promise<SanitizedClient> {
    const client = await clientRepository.create(dto);
    return this.sanitize(client);
  }

  async getById(id: string): Promise<SanitizedClient> {
    const client = await clientRepository.findById(id);
    if (!client) throw AppError.notFound(Messages.CLIENT_NOT_FOUND);
    return this.sanitize(client);
  }

  async list(query: PaginationQuery) {
    const result = await clientRepository.findAll(query);
    return { data: result.data.map(this.sanitize), meta: result.meta };
  }

  async update(id: string, dto: UpdateClientDto): Promise<SanitizedClient> {
    const client = await clientRepository.updateById(id, dto);
    if (!client) throw AppError.notFound(Messages.CLIENT_NOT_FOUND);
    return this.sanitize(client);
  }

  async delete(id: string): Promise<void> {
    const client = await clientRepository.deleteById(id);
    if (!client) throw AppError.notFound(Messages.CLIENT_NOT_FOUND);
  }

  private sanitize(client: IClientDocument): SanitizedClient {
    return {
      id: client._id.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone,
      companyName: client.companyName,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}

export const clientService = new ClientService();
