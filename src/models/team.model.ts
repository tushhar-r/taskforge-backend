// ---------------------------------------------------------
// Mongoose Team model
// ---------------------------------------------------------

import mongoose, { Document, Schema, Model } from 'mongoose';

// ─── Interfaces ─────────────────────────────────────────

export interface ITeam {
  name: string;
  description?: string;
}

export interface ITeamDocument extends ITeam, Document {
  createdAt: Date;
  updatedAt: Date;
}

interface ITeamModel extends Model<ITeamDocument> {
  isNameTaken(name: string, excludeTeamId?: string): Promise<boolean>;
}

// ─── Schema ─────────────────────────────────────────────

const teamSchema = new Schema<ITeamDocument>(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      minlength: [2, 'Team name must be at least 2 characters'],
      maxlength: [100, 'Team name must not exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
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

teamSchema.index({ name: 1 });
teamSchema.index({ createdAt: -1 });

// ─── Static methods ─────────────────────────────────────

teamSchema.statics['isNameTaken'] = async function (
  name: string,
  excludeTeamId?: string,
): Promise<boolean> {
  const team = await this.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: excludeTeamId } });
  return !!team;
};

// ─── Export ─────────────────────────────────────────────

export const Team: ITeamModel = mongoose.model<ITeamDocument, ITeamModel>('Team', teamSchema);
