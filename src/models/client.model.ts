// ---------------------------------------------------------
// Mongoose Client model
// Clients are pure data entities — they NEVER log in.
// A client can be linked to multiple teams via TeamClient.
// ---------------------------------------------------------

import mongoose, { Document, Schema, Model } from 'mongoose';

// ─── Interfaces ─────────────────────────────────────────

export interface IClient {
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
}

export interface IClientDocument extends IClient, Document {
  createdAt: Date;
  updatedAt: Date;
}

type IClientModel = Model<IClientDocument>;

// ─── Schema ─────────────────────────────────────────────

const clientSchema = new Schema<IClientDocument>(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      minlength: [2, 'Client name must be at least 2 characters'],
      maxlength: [150, 'Client name must not exceed 150 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [30, 'Phone number must not exceed 30 characters'],
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: [150, 'Company name must not exceed 150 characters'],
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

clientSchema.index({ name: 1 });
clientSchema.index({ createdAt: -1 });

// ─── Export ─────────────────────────────────────────────

export const Client: IClientModel = mongoose.model<IClientDocument>('Client', clientSchema);
