// ---------------------------------------------------------
// Mongoose TeamMember model
// Junction table: User <-> Team (many-to-many)
// A user can belong to multiple teams.
// Each membership stores the user's role in that team
// and which clients (from that team's pool) are assigned.
// ---------------------------------------------------------

import mongoose, { Document, Schema, Model } from 'mongoose';

// ─── Interfaces ─────────────────────────────────────────

export interface ITeamMember {
  teamId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  /** Role within this specific team */
  role: 'manager' | 'employee';
  joinedAt: Date;
}

export interface ITeamMemberDocument extends ITeamMember, Document {
  createdAt: Date;
  updatedAt: Date;
}

type ITeamMemberModel = Model<ITeamMemberDocument>;

// ─── Schema ─────────────────────────────────────────────

const teamMemberSchema = new Schema<ITeamMemberDocument>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    role: {
      type: String,
      enum: ['manager', 'employee'],
      default: 'employee',
    },
    joinedAt: {
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

// Unique membership per user per team
teamMemberSchema.index({ teamId: 1, userId: 1 }, { unique: true });
teamMemberSchema.index({ userId: 1 });
teamMemberSchema.index({ teamId: 1, role: 1 });

// ─── Export ─────────────────────────────────────────────

export const TeamMember: ITeamMemberModel = mongoose.model<ITeamMemberDocument>('TeamMember', teamMemberSchema);
