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

// ─── Board Types ──────────────────────────────────────────────────────────────

export interface Board {
  id: string;
  name: string;
  canvasData: CanvasData;
  createdAt: number;
}

// ─── Tool Types ───────────────────────────────────────────────────────────────

export type ActiveTool = 'pen' | 'highlighter' | 'eraser' | 'text' | 'review';

// ─── Store Interface ──────────────────────────────────────────────────────────

interface NoteState {
  // Active note
  activeNoteId: string | null;
  boards: Board[];
  activeBoardId: string | null;
  
  // Current board's canvas data (cached from boards array)
  canvasData: CanvasData | null;
  isDirty: boolean;

  // Undo/Redo stacks
  undoStack: CanvasData[];
  redoStack: CanvasData[];

  // Viewport transform (for infinite canvas)
  viewportOffsetX: number;
  viewportOffsetY: number;
  viewportScale: number;

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

  // Board actions
  createBoard: () => void;
  deleteBoard: (boardId: string) => void;
  switchBoard: (boardId: string) => void;
  renameBoard: (boardId: string, newName: string) => void;
  duplicateBoard: (boardId: string) => void;

  // Undo/Redo actions
  pushUndo: (data: CanvasData) => void;
  popUndo: () => CanvasData | null;
  pushRedo: (data: CanvasData) => void;
  popRedo: () => CanvasData | null;
  clearRedo: () => void;

  // Viewport actions
  panViewport: (dx: number, dy: number) => void;
  setViewportScale: (scale: number) => void;
  resetViewport: () => void;

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

export const useNoteStore = create<NoteState>((set, get) => ({
  // Active note
  activeNoteId: null,
  boards: [],
  activeBoardId: null,
  canvasData: null,
  isDirty: false,

  // Undo/Redo stacks
  undoStack: [],
  redoStack: [],

  // Viewport transform (for infinite canvas)
  viewportOffsetX: 0,
  viewportOffsetY: 0,
  viewportScale: 1,

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
  setActiveNoteId: (id) => {
    if (id === null) {
      set({
        activeNoteId: null,
        boards: [],
        activeBoardId: null,
        canvasData: null,
      });
    } else {
      // Create first board if switching to new note
      const newBoard: Board = {
        id: 'board-1',
        name: 'Board 1',
        canvasData: emptyCanvasData,
        createdAt: Date.now(),
      };
      set({
        activeNoteId: id,
        boards: [newBoard],
        activeBoardId: 'board-1',
        canvasData: emptyCanvasData,
      });
    }
  },
  
  setCanvasData: (data) => set({ canvasData: data }),
  updateCanvasData: (updater) =>
    set((state) => {
      const newCanvasData = updater(state.canvasData ?? emptyCanvasData);
      if (!state.activeBoardId) return { canvasData: newCanvasData };
      
      // Update the board's canvas data
      const updatedBoards = state.boards.map((board) =>
        board.id === state.activeBoardId
          ? { ...board, canvasData: newCanvasData }
          : board
      );
      
      return { canvasData: newCanvasData, boards: updatedBoards };
    }),
  
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),

  // Board management actions
  createBoard: () => {
    set((state) => {
      const newBoardId = `board-${Date.now()}`;
      const newBoard: Board = {
        id: newBoardId,
        name: `Board ${state.boards.length + 1}`,
        canvasData: emptyCanvasData,
        createdAt: Date.now(),
      };
      return {
        boards: [...state.boards, newBoard],
        activeBoardId: newBoardId,
        canvasData: emptyCanvasData,
      };
    });
  },

  deleteBoard: (boardId) => {
    set((state) => {
      const newBoards = state.boards.filter((b) => b.id !== boardId);
      if (newBoards.length === 0) {
        return {
          boards: [],
          activeBoardId: null,
          canvasData: null,
        };
      }
      
      const nextActiveBoard =
        state.activeBoardId === boardId ? newBoards[0] : state.boards.find((b) => b.id === state.activeBoardId);
      
      return {
        boards: newBoards,
        activeBoardId: nextActiveBoard?.id ?? null,
        canvasData: nextActiveBoard?.canvasData ?? null,
      };
    });
  },

  switchBoard: (boardId) => {
    set((state) => {
      const board = state.boards.find((b) => b.id === boardId);
      if (!board) return state;
      return {
        activeBoardId: boardId,
        canvasData: board.canvasData,
        undoStack: [],
        redoStack: [],
      };
    });
  },

  renameBoard: (boardId, newName) => {
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId ? { ...b, name: newName } : b
      ),
    }));
  },

  duplicateBoard: (boardId) => {
    set((state) => {
      const boardToDuplicate = state.boards.find((b) => b.id === boardId);
      if (!boardToDuplicate) return state;
      
      const newBoardId = `board-${Date.now()}`;
      const newBoard: Board = {
        id: newBoardId,
        name: `${boardToDuplicate.name} (Copy)`,
        canvasData: {
          strokes: [...boardToDuplicate.canvasData.strokes],
          textBlocks: [...boardToDuplicate.canvasData.textBlocks],
        },
        createdAt: Date.now(),
      };
      
      return {
        boards: [...state.boards, newBoard],
        activeBoardId: newBoardId,
        canvasData: newBoard.canvasData,
      };
    });
  },

  // Undo/Redo actions with 50-item limit
  pushUndo: (data) =>
    set((state) => ({
      undoStack: [...state.undoStack.slice(-49), data],
    })),
  popUndo: () => {
    let popped: CanvasData | null = null;
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const newStack = [...state.undoStack];
      popped = newStack.pop()!;
      return { undoStack: newStack };
    });
    return popped;
  },
  pushRedo: (data) =>
    set((state) => ({
      redoStack: [...state.redoStack.slice(-49), data],
    })),
  popRedo: () => {
    let popped: CanvasData | null = null;
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const newStack = [...state.redoStack];
      popped = newStack.pop()!;
      return { redoStack: newStack };
    });
    return popped;
  },
  clearRedo: () => set({ redoStack: [] }),

  // Viewport actions for infinite canvas
  panViewport: (dx, dy) =>
    set((state) => ({
      viewportOffsetX: state.viewportOffsetX + dx,
      viewportOffsetY: state.viewportOffsetY + dy,
    })),
  setViewportScale: (scale) =>
    set({
      viewportScale: Math.max(0.1, Math.min(4, scale)), // Clamp between 0.1x and 4x
    }),
  resetViewport: () =>
    set({
      viewportOffsetX: 0,
      viewportOffsetY: 0,
      viewportScale: 1,
    }),

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
      boards: [],
      activeBoardId: null,
      canvasData: null,
      isDirty: false,
      isRecording: false,
      recordingElapsed: 0,
      audioUrl: null,
      pendingTimestamps: [],
      undoStack: [],
      redoStack: [],
      viewportOffsetX: 0,
      viewportOffsetY: 0,
      viewportScale: 1,
    }),
}));
