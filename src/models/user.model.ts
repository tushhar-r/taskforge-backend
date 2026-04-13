// ---------------------------------------------------------
// Mongoose User model
// ---------------------------------------------------------

import mongoose, { Document, Schema, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';
import { UserRole } from '../constants';

// ─── Interfaces ─────────────────────────────────────────

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUserDocument> {
  /** Check whether an email is already taken (optionally excluding a specific user ID). */
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
}

// ─── Schema ─────────────────────────────────────────────

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = ret['_id'];
        delete ret['_id'];
        delete ret['__v'];
        delete ret['password'];
        return ret;
      },
    },
  },
);

// ─── Indexes ────────────────────────────────────────────

userSchema.index({ createdAt: -1 });

// ─── Pre-save hook: hash password ───────────────────────

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcryptjs.genSalt(12);
  this.password = await bcryptjs.hash(this.password, salt);
});

// ─── Instance methods ───────────────────────────────────

userSchema.methods['comparePassword'] = async function (
  this: IUserDocument,
  candidatePassword: string,
): Promise<boolean> {
  return bcryptjs.compare(candidatePassword, this.password);
};

// ─── Static methods ─────────────────────────────────────

userSchema.statics['isEmailTaken'] = async function (
  email: string,
  excludeUserId?: string,
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

// ─── Export ─────────────────────────────────────────────

export const User: IUserModel = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
