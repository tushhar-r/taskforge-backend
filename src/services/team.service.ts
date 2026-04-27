// ---------------------------------------------------------
// Team service – business logic for teams
// ---------------------------------------------------------

import { teamRepository, teamMemberRepository, teamClientRepository, clientRepository } from '../repositories';
import { AppError } from '../utils';
import { Messages } from '../constants';
import type {
  CreateTeamDto,
  UpdateTeamDto,
  SanitizedTeam,
  PaginationQuery,
  PaginationMeta,
} from '../types';
import type { ITeamDocument } from '../models';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

class TeamService {
  // ── Teams ─────────────────────────────────────────────

  async createTeam(dto: CreateTeamDto): Promise<SanitizedTeam> {
    const nameTaken = await teamRepository.isNameTaken(dto.name);
    if (nameTaken) throw AppError.conflict(Messages.TEAM_NAME_TAKEN);
    const team = await teamRepository.create(dto);
    return this.sanitizeTeam(team);
  }

  async getTeam(teamId: string): Promise<SanitizedTeam> {
    const team = await teamRepository.findById(teamId);
    if (!team) throw AppError.notFound(Messages.TEAM_NOT_FOUND);
    return this.sanitizeTeam(team);
  }

  async listTeams(query: PaginationQuery, userId?: string, isAdmin?: boolean): Promise<PaginatedResult<SanitizedTeam>> {
    if (!isAdmin && userId) {
      const memberships = await teamMemberRepository.findByUser(userId);
      const teamIds = memberships.map(m => (m.teamId as any)._id || m.teamId);
      const teams = await teamRepository.findByList(teamIds);
      return { data: teams.map(this.sanitizeTeam), meta: { page: 1, limit: teams.length, total: teams.length, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    }
    const result = await teamRepository.findAll(query);
    return { data: result.data.map(this.sanitizeTeam), meta: result.meta };
  }

  async updateTeam(teamId: string, dto: UpdateTeamDto): Promise<SanitizedTeam> {
    if (dto.name) {
      const nameTaken = await teamRepository.isNameTaken(dto.name, teamId);
      if (nameTaken) throw AppError.conflict(Messages.TEAM_NAME_TAKEN);
    }
    const team = await teamRepository.updateById(teamId, dto);
    if (!team) throw AppError.notFound(Messages.TEAM_NOT_FOUND);
    return this.sanitizeTeam(team);
  }

  async deleteTeam(teamId: string): Promise<void> {
    const team = await teamRepository.deleteById(teamId);
    if (!team) throw AppError.notFound(Messages.TEAM_NOT_FOUND);
  }

  // ── Members ───────────────────────────────────────────

  async addMember(teamId: string, userId: string, role: 'manager' | 'employee'): Promise<void> {
    const team = await teamRepository.findById(teamId);
    if (!team) throw AppError.notFound(Messages.TEAM_NOT_FOUND);

    const already = await teamMemberRepository.exists(teamId, userId);
    if (already) throw AppError.conflict(Messages.MEMBER_ALREADY_EXISTS);

    await teamMemberRepository.create(teamId, userId, role);
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    const team = await teamRepository.findById(teamId);
    if (!team) throw AppError.notFound(Messages.TEAM_NOT_FOUND);

    const deleted = await teamMemberRepository.deleteOne(teamId, userId);
    if (!deleted) throw AppError.notFound(Messages.MEMBER_NOT_FOUND);
  }

  async getMembers(teamId: string, role?: 'manager' | 'employee'): Promise<any[]> {
    const team = await teamRepository.findById(teamId);
    if (!team) throw AppError.notFound(Messages.TEAM_NOT_FOUND);
    return teamMemberRepository.findByTeam(teamId, role);
  }

  // ── Client links ─────────────────────────────────────

  async linkClient(teamId: string, clientId: string): Promise<void> {
    const team = await teamRepository.findById(teamId);
    if (!team) throw AppError.notFound(Messages.TEAM_NOT_FOUND);

    const client = await clientRepository.findById(clientId);
    if (!client) throw AppError.notFound(Messages.CLIENT_NOT_FOUND);

    const already = await teamClientRepository.exists(teamId, clientId);
    if (already) throw AppError.conflict(Messages.CLIENT_ALREADY_IN_TEAM);

    await teamClientRepository.create(teamId, clientId);
  }

  async unlinkClient(teamId: string, clientId: string): Promise<void> {
    const deleted = await teamClientRepository.deleteOne(teamId, clientId);
    if (!deleted) throw AppError.notFound(Messages.CLIENT_NOT_IN_TEAM);
  }

  async getTeamClients(teamId: string, userId?: string, isAdmin?: boolean) {
    const team = await teamRepository.findById(teamId);
    if (!team) throw AppError.notFound(Messages.TEAM_NOT_FOUND);

    // If userId provided and not admin, verify membership before returning clients
    if (userId && !isAdmin) {
      const isMember = await teamMemberRepository.exists(teamId, userId);
      if (!isMember) throw AppError.forbidden(Messages.INSUFFICIENT_PERMISSIONS);
    }

    return teamClientRepository.findByTeam(teamId);
  }

  // ── Client assignment to employee ────────────────────
  // (DEPRECATED - Clients are now team-wide)

  // (Methods removed to simplify system)

  // ── Sanitizer ─────────────────────────────────────────

  private sanitizeTeam(team: ITeamDocument): SanitizedTeam {
    return {
      id: team._id.toString(),
      name: team.name,
      description: team.description,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }
}

export const teamService = new TeamService();
