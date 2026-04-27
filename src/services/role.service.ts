// ---------------------------------------------------------
// Role service – business logic for dynamic custom roles
// ---------------------------------------------------------

import { roleRepository } from '../repositories';
import { AppError } from '../utils';
import type { CreateRoleDto, UpdateRoleDto, SanitizedRole, PaginationQuery, PaginationMeta } from '../types';
import type { IRoleDocument } from '../models';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

class RoleService {
  async createRole(dto: CreateRoleDto): Promise<SanitizedRole> {
    const nameTaken = await roleRepository.isNameTaken(dto.name);
    if (nameTaken) throw AppError.conflict('A role with this name already exists');

    const role = await roleRepository.create({ ...dto, isSystem: false });
    return this.sanitizeRole(role);
  }

  async getRole(roleId: string): Promise<SanitizedRole> {
    const role = await roleRepository.findById(roleId);
    if (!role) throw AppError.notFound('Role not found');
    return this.sanitizeRole(role);
  }

  async listRoles(query: PaginationQuery): Promise<PaginatedResult<SanitizedRole>> {
    const result = await roleRepository.findAll(query);
    return { data: result.data.map((r) => this.sanitizeRole(r)), meta: result.meta };
  }

  async updateRole(roleId: string, dto: UpdateRoleDto): Promise<SanitizedRole> {
    const existing = await roleRepository.findById(roleId);
    if (!existing) throw AppError.notFound('Role not found');

    if (existing.isSystem && dto.permissions) {
      // System roles can be updated but we might want to restrict deleting them entirely. 
      // For now, let's allow admins to modify system role permissions if needed,
      // but prevent renaming.
      if (dto.name && dto.name !== existing.name) {
         throw AppError.badRequest('System roles cannot be renamed');
      }
    }

    if (dto.name && dto.name !== existing.name) {
      const nameTaken = await roleRepository.isNameTaken(dto.name, roleId);
      if (nameTaken) throw AppError.conflict('A role with this name already exists');
    }

    const role = await roleRepository.updateById(roleId, dto);
    if (!role) throw AppError.notFound('Role not found');
    return this.sanitizeRole(role);
  }

  async deleteRole(roleId: string): Promise<void> {
    const existing = await roleRepository.findById(roleId);
    if (!existing) throw AppError.notFound('Role not found');
    
    if (existing.isSystem) {
      throw AppError.forbidden('System roles cannot be deleted');
    }

    // TODO: before deleting, ensure no users are currently assigned to this role.
    // If there are, block the deletion or re-assign them. Since this involves userRepository,
    // we would do that check here. We can implement it if needed.

    await roleRepository.deleteById(roleId);
  }

  private sanitizeRole(role: IRoleDocument): SanitizedRole {
    return {
      id: role._id.toString(),
      name: role.name,
      permissions: role.permissions,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}

export const roleService = new RoleService();
