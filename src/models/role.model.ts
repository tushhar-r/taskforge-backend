// ---------------------------------------------------------
// Mongoose Role model for Dynamic RBAC
// ---------------------------------------------------------

import mongoose, { Document, Schema, Model } from 'mongoose';
import { Permission } from '../constants';

// ─── Interfaces ─────────────────────────────────────────

export interface IRole {
  name: string;
  permissions: Permission[];
  description?: string;
  isSystem: boolean;
}

export interface IRoleDocument extends IRole, Document {
  createdAt: Date;
  updatedAt: Date;
}

interface IRoleModel extends Model<IRoleDocument> {
  /** Check if a role name is taken globally (optionally excluding a given id) */
  isNameTaken(name: string, excludeId?: string): Promise<boolean>;
}

// ─── Schema ─────────────────────────────────────────────

const roleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      minlength: [2, 'Role name must be at least 2 characters'],
      maxlength: [50, 'Role name must not exceed 50 characters'],
    },
    permissions: {
      type: [String],
      enum: Object.values(Permission),
      default: [],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description must not exceed 200 characters'],
    },
    isSystem: {
      type: Boolean,
      default: false,
      // true means this role is a default framework role and cannot be deleted by users
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

roleSchema.index({ name: 1 }, { unique: true });

// ─── Static methods ─────────────────────────────────────

roleSchema.statics['isNameTaken'] = async function (
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const query = { name: new RegExp(`^${name}$`, 'i') };
  if (excludeId) {
    Object.assign(query, { _id: { $ne: excludeId } });
  }
  const role = await this.findOne(query);
  return !!role;
};

// ─── Export ─────────────────────────────────────────────

export const Role: IRoleModel = mongoose.model<IRoleDocument, IRoleModel>('Role', roleSchema);
