// ---------------------------------------------------------
// Mongoose TimesheetEntry model
// One entry = one employee + one client + one calendar day.
// Contains embedded task logs (title + duration in minutes).
// ---------------------------------------------------------

import mongoose, { Document, Schema, Model } from 'mongoose';
import { TimesheetStatus } from '../constants';

// ─── Sub-document interface ─────────────────────────────

export interface ITaskLog {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  durationMinutes: number;
  tags: string[];
}

// ─── Main interfaces ─────────────────────────────────────

export interface ITimesheetEntry {
  employeeId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  /** Stored as midnight UTC for the calendar day */
  date: Date;
  /** Total hours for this entry (auto-computed from tasks if tasks are provided) */
  totalHours: number;
  notes?: string;
  status: TimesheetStatus;
  tasks: ITaskLog[];
  submittedAt?: Date;
}

export interface ITimesheetEntryDocument extends ITimesheetEntry, Document {
  createdAt: Date;
  updatedAt: Date;
}

type ITimesheetEntryModel = Model<ITimesheetEntryDocument>;

// ─── Task log sub-schema ────────────────────────────────

const taskLogSchema = new Schema<ITaskLog>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title must not exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Task description must not exceed 1000 characters'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 1440 minutes (24 hours)'],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { _id: true },
);

// ─── Main schema ────────────────────────────────────────

const timesheetEntrySchema = new Schema<ITimesheetEntryDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
    },
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
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    totalHours: {
      type: Number,
      required: [true, 'Total hours is required'],
      min: [0, 'Total hours cannot be negative'],
      max: [24, 'Total hours cannot exceed 24'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes must not exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(TimesheetStatus),
      default: TimesheetStatus.DRAFT,
    },
    tasks: {
      type: [taskLogSchema],
      default: [],
    },
    submittedAt: {
      type: Date,
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

// Unique: one entry per employee + client + day
timesheetEntrySchema.index({ employeeId: 1, clientId: 1, date: 1 }, { unique: true });
// Manager queries: team + date range
timesheetEntrySchema.index({ teamId: 1, date: -1 });
// Employee's own entries sorted by date
timesheetEntrySchema.index({ employeeId: 1, date: -1 });
// Status filtering within a team
timesheetEntrySchema.index({ teamId: 1, status: 1 });

// ─── Export ─────────────────────────────────────────────

export const TimesheetEntry: ITimesheetEntryModel = mongoose.model<ITimesheetEntryDocument>(
  'TimesheetEntry',
  timesheetEntrySchema,
);
