// ---------------------------------------------------------
// TeamClient repository – data-access layer
// ---------------------------------------------------------

import { TeamClient, ITeamClientDocument } from '../models';

class TeamClientRepository {
  /** Link a client to a team. */
  async create(teamId: string, clientId: string): Promise<ITeamClientDocument> {
    const link = new TeamClient({ teamId, clientId });
    return link.save();
  }

  /** Check if a client is linked to a team. */
  async exists(teamId: string, clientId: string): Promise<boolean> {
    const doc = await TeamClient.exists({ teamId, clientId });
    return !!doc;
  }

  /** All client records for a team. */
  async findByTeam(teamId: string): Promise<ITeamClientDocument[]> {
    return TeamClient.find({ teamId }).populate('clientId').exec();
  }

  /** All teams a client is linked to. */
  async findByClient(clientId: string): Promise<ITeamClientDocument[]> {
    return TeamClient.find({ clientId }).populate('teamId', 'name description').exec();
  }

  /** Get client IDs linked to a team (for quick lookup). */
  async getClientIds(teamId: string): Promise<string[]> {
    const docs = await TeamClient.find({ teamId }, { clientId: 1 }).exec();
    return docs.map((d) => d.clientId.toString());
  }

  /** Unlink a client from a team. */
  async deleteOne(teamId: string, clientId: string): Promise<ITeamClientDocument | null> {
    return TeamClient.findOneAndDelete({ teamId, clientId }).exec();
  }
}

export const teamClientRepository = new TeamClientRepository();
