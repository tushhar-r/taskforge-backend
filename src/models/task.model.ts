// ---------------------------------------------------------
// Mongoose Task model
// ---------------------------------------------------------

import mongoose, { Document, Schema, Model } from 'mongoose';
import { TaskStatus } from '../constants';

// ─── Interfaces ─────────────────────────────────────────

export interface ITask {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: string;
  tags: string[];
  dueDate?: Date;
  userId: mongoose.Types.ObjectId;
}

export interface ITaskDocument extends ITask, Document {
  createdAt: Date;
  updatedAt: Date;
}

interface ITaskModel extends Model<ITaskDocument> {
  // Add static methods here if necessary in the future
}

// ─── Schema ─────────────────────────────────────────────

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must not exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
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

// Optimized for: finding tasks by user, filtering by status, and sorting by creation date
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, status: 1 });

// ─── Export ─────────────────────────────────────────────

export const Task: ITaskModel = mongoose.model<ITaskDocument, ITaskModel>('Task', taskSchema);
