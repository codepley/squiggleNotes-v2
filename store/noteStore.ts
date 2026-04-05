/**
 * SquiggleNotes global state — Zustand store
 *
 * Covers:
 * - Active note + canvas data
 * - Canvas tool selection
 * - Audio recording state
 */

import { create } from 'zustand';

// ─── Canvas Data Types ────────────────────────────────────────────────────────

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  id: string;
  points: StrokePoint[];
  color: string;
  width: number;
  tool: 'pen' | 'highlighter' | 'eraser';
}

export interface TextBlock {
  id: string;
  x: number;
  y: number;
  content: string;
  fontSize: number;
  color: string;
}

export interface CanvasData {
  strokes: Stroke[];
  textBlocks: TextBlock[];
}

// ─── Tool Types ───────────────────────────────────────────────────────────────

export type ActiveTool = 'pen' | 'highlighter' | 'eraser' | 'text' | 'review';

// ─── Store Interface ──────────────────────────────────────────────────────────

interface NoteState {
  // Active note
  activeNoteId: string | null;
  canvasData: CanvasData | null;
  isDirty: boolean;

  // Audio
  isRecording: boolean;
  recordingElapsed: number; // seconds
  audioUrl: string | null;
  pendingTimestamps: { elementId: string; offset: number }[];

  // Canvas tool
  activeTool: ActiveTool;
  activeColor: string;
  strokeWidth: number;

  // Actions
  setActiveNoteId: (id: string | null) => void;
  setCanvasData: (data: CanvasData) => void;
  updateCanvasData: (updater: (prev: CanvasData) => CanvasData) => void;
  markDirty: () => void;
  markClean: () => void;

  setActiveTool: (tool: ActiveTool) => void;
  setActiveColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;

  setRecording: (recording: boolean) => void;
  setRecordingElapsed: (elapsed: number) => void;
  setAudioUrl: (url: string | null) => void;
  addPendingTimestamp: (elementId: string, offset: number) => void;
  clearPendingTimestamps: () => void;

  resetNoteState: () => void;
}

// ─── Initial canvas data ──────────────────────────────────────────────────────

const emptyCanvasData: CanvasData = { strokes: [], textBlocks: [] };

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNoteStore = create<NoteState>((set) => ({
  // Active note
  activeNoteId: null,
  canvasData: null,
  isDirty: false,

  // Audio
  isRecording: false,
  recordingElapsed: 0,
  audioUrl: null,
  pendingTimestamps: [],

  // Canvas tool
  activeTool: 'pen',
  activeColor: '#1C1C1E',
  strokeWidth: 2,

  // Actions
  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setCanvasData: (data) => set({ canvasData: data }),
  updateCanvasData: (updater) =>
    set((state) => ({
      canvasData: updater(state.canvasData ?? emptyCanvasData),
    })),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveColor: (color) => set({ activeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),

  setRecording: (recording) => set({ isRecording: recording }),
  setRecordingElapsed: (elapsed) => set({ recordingElapsed: elapsed }),
  setAudioUrl: (url) => set({ audioUrl: url }),
  addPendingTimestamp: (elementId, offset) =>
    set((state) => ({
      pendingTimestamps: [...state.pendingTimestamps, { elementId, offset }],
    })),
  clearPendingTimestamps: () => set({ pendingTimestamps: [] }),

  resetNoteState: () =>
    set({
      activeNoteId: null,
      canvasData: null,
      isDirty: false,
      isRecording: false,
      recordingElapsed: 0,
      audioUrl: null,
      pendingTimestamps: [],
    }),
}));
