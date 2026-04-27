// ---------------------------------------------------------
// Mongoose TeamClient model
// Junction table: Team <-> Client (many-to-many)
// A client can be served by multiple teams.
// A team can serve multiple clients.
// ---------------------------------------------------------

import mongoose, { Document, Schema, Model } from 'mongoose';

// ─── Interfaces ─────────────────────────────────────────

export interface ITeamClient {
  teamId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  linkedAt: Date;
}

export interface ITeamClientDocument extends ITeamClient, Document {
  createdAt: Date;
  updatedAt: Date;
}

type ITeamClientModel = Model<ITeamClientDocument>;

// ─── Schema ─────────────────────────────────────────────

const teamClientSchema = new Schema<ITeamClientDocument>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team ID is required'],
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
    },
    linkedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = ret['_id'];
        delete ret['_id'];
        delete ret['__v'];
        return ret;
      },
    },
  },
);

// ─── Indexes ────────────────────────────────────────────

// Unique link per team-client pair
teamClientSchema.index({ teamId: 1, clientId: 1 }, { unique: true });
teamClientSchema.index({ teamId: 1 });
teamClientSchema.index({ clientId: 1 });

// ─── Export ─────────────────────────────────────────────

export const TeamClient: ITeamClientModel = mongoose.model<ITeamClientDocument>('TeamClient', teamClientSchema);
