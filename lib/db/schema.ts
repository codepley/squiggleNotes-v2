/**
 * Mongoose Models for SquiggleNotes
 *
 * Same schema structure as the implementation plan,
 * adapted for MongoDB with Mongoose.
 */

import mongoose, { Schema, type Document, type Model } from 'mongoose';

// ─── Users ────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional for OAuth users
  },
  { timestamps: true }
);

// ─── Folders ──────────────────────────────────────────────────────────────────

export interface IFolder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  parentId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
  },
  { timestamps: true },
);

// ─── Notes ────────────────────────────────────────────────────────────────────

export interface ICanvasData {
  strokes: {
    id: string;
    points: { x: number; y: number; pressure: number }[];
    color: string;
    width: number;
    tool: 'pen' | 'highlighter' | 'eraser';
  }[];
  textBlocks: {
    id: string;
    x: number;
    y: number;
    content: string;
    fontSize: number;
    color: string;
  }[];
}

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  folderId: mongoose.Types.ObjectId | null;
  title: string;
  canvasData: ICanvasData | null;
  audioFileUrl: string | null;
  audioDurationSeconds: number | null;
  lastStudiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    folderId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    title: { type: String, required: true, default: 'Untitled Note' },
    canvasData: { type: Schema.Types.Mixed, default: null },
    audioFileUrl: { type: String, default: null },
    audioDurationSeconds: { type: Number, default: null },
    lastStudiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ─── Timestamp Links ──────────────────────────────────────────────────────────

export interface ITimestampLink extends Document {
  noteId: mongoose.Types.ObjectId;
  canvasElementId: string;
  audioOffsetSeconds: number;
  createdAt: Date;
}

const timestampLinkSchema = new Schema<ITimestampLink>(
  {
    noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
    canvasElementId: { type: String, required: true },
    audioOffsetSeconds: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// ─── Generated Content ────────────────────────────────────────────────────────

export interface IGeneratedContentPayload {
  question: string;
  answer: string;
  options?: string[] | null;
  blankedSentence?: string | null;
}

export interface IGeneratedContent extends Document {
  noteId: mongoose.Types.ObjectId;
  type: 'flashcard' | 'quiz' | 'fill_in_blank';
  payload: IGeneratedContentPayload;
  createdAt: Date;
}

const generatedContentSchema = new Schema<IGeneratedContent>(
  {
    noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
    type: {
      type: String,
      enum: ['flashcard', 'quiz', 'fill_in_blank'],
      required: true,
    },
    payload: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// ─── Revision Sessions ────────────────────────────────────────────────────────

export interface IRevisionSession extends Document {
  noteId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  completedAt: Date | null;
  intervalDays: number;
  nextDue: Date;
  repetitionCount: number;
  easeFactor: number;
}

const revisionSessionSchema = new Schema<IRevisionSession>({
  noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
  scheduledAt: { type: Date, required: true },
  completedAt: { type: Date, default: null },
  intervalDays: { type: Number, required: true, default: 1 },
  nextDue: { type: Date, required: true },
  repetitionCount: { type: Number, required: true, default: 0 },
  easeFactor: { type: Number, required: true, default: 2.5 },
});

// ─── Revision Responses ───────────────────────────────────────────────────────

export interface IRevisionResponse extends Document {
  sessionId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  rating: 'again' | 'hard' | 'good' | 'easy';
  respondedAt: Date;
}

const revisionResponseSchema = new Schema<IRevisionResponse>({
  sessionId: { type: Schema.Types.ObjectId, ref: 'RevisionSession', required: true },
  contentId: { type: Schema.Types.ObjectId, ref: 'GeneratedContent', required: true },
  rating: {
    type: String,
    enum: ['again', 'hard', 'good', 'easy'],
    required: true,
  },
  respondedAt: { type: Date, required: true, default: Date.now },
});

// ─── Model Exports (prevent re-compilation in dev) ────────────────────────────

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export const Folder: Model<IFolder> =
  mongoose.models.Folder || mongoose.model<IFolder>('Folder', folderSchema);

export const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);

export const TimestampLink: Model<ITimestampLink> =
  mongoose.models.TimestampLink || mongoose.model<ITimestampLink>('TimestampLink', timestampLinkSchema);

export const GeneratedContent: Model<IGeneratedContent> =
  mongoose.models.GeneratedContent || mongoose.model<IGeneratedContent>('GeneratedContent', generatedContentSchema);

export const RevisionSession: Model<IRevisionSession> =
  mongoose.models.RevisionSession || mongoose.model<IRevisionSession>('RevisionSession', revisionSessionSchema);

export const RevisionResponse: Model<IRevisionResponse> =
  mongoose.models.RevisionResponse || mongoose.model<IRevisionResponse>('RevisionResponse', revisionResponseSchema);
