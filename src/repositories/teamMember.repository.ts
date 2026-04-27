// ---------------------------------------------------------
// TeamMember repository – data-access layer
// ---------------------------------------------------------

import mongoose from 'mongoose';
import { TeamMember } from '../models';
import type { ITeamMemberDocument } from '../models';

class TeamMemberRepository {
  /** Add a user to a team with a given role. */
  async create(teamId: string, userId: string, role: 'manager' | 'employee'): Promise<ITeamMemberDocument> {
    const member = new TeamMember({ teamId, userId, role });
    return member.save();
  }

  /** Find a specific membership record. */
  async findOne(teamId: string, userId: string): Promise<ITeamMemberDocument | null> {
    return TeamMember.findOne({ 
      teamId: new mongoose.Types.ObjectId(teamId), 
      userId: new mongoose.Types.ObjectId(userId) 
    }).exec();
  }

  /** All memberships for a given team, optionally filtered by role. */
  async findByTeam(teamId: string, role?: 'manager' | 'employee'): Promise<ITeamMemberDocument[]> {
    const filter: Record<string, unknown> = { teamId };
    if (role) filter.role = role;
    return TeamMember.find(filter).populate('userId', 'name email role').exec();
  }

  /** All teams a given user belongs to. */
  async findByUser(userId: string): Promise<ITeamMemberDocument[]> {
    return TeamMember.find({ userId }).populate('teamId', 'name description').exec();
  }

  /** Remove a user from a team. */
  async deleteOne(teamId: string, userId: string): Promise<ITeamMemberDocument | null> {
    return TeamMember.findOneAndDelete({ teamId, userId }).exec();
  }

  /** Check if a user is a member of a team. */
  async exists(teamId: string, userId: string): Promise<boolean> {
    const doc = await TeamMember.exists({ teamId, userId });
    return !!doc;
  }
}

export const teamMemberRepository = new TeamMemberRepository();
