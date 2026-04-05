'use client';

/**
 * useCanvas — manages stroke state, undo/redo stack, and serialization.
 * Consumed by NoteCanvas and DrawingLayer.
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { useNoteStore, type CanvasData, type Stroke, type TextBlock } from '@/store/noteStore';
import { nanoid } from 'nanoid';

const MAX_UNDO_STACK = 50;
const MAX_REDO_STACK = 50;

function nanoid_simple(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function useCanvas() {
  const { canvasData, updateCanvasData, markDirty } = useNoteStore();
  const undoStack = useRef<CanvasData[]>([]);
  const redoStack = useRef<CanvasData[]>([]);
  const lastSnapshotRef = useRef<CanvasData | null>(null);
  
  // Track state changes to update button UI
  const [, setStackVersion] = useState(0);

  const updateStackUI = useCallback(() => {
    setStackVersion((v) => v + 1);
  }, []);

  const snapshot = useCallback(() => {
    const current = useNoteStore.getState().canvasData;
    if (!current) return;
    
    // Avoid consecutive duplicate snapshots
    if (lastSnapshotRef.current === current) return;
    
    lastSnapshotRef.current = current;
    undoStack.current = [
      ...undoStack.current.slice(-MAX_UNDO_STACK + 1),
      current,
    ];
    redoStack.current = [];
    updateStackUI();
  }, [updateStackUI]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop()!;
    const current = useNoteStore.getState().canvasData;
    if (current) {
      redoStack.current = [...redoStack.current.slice(-MAX_REDO_STACK + 1), current];
    }
    lastSnapshotRef.current = prev;
    updateCanvasData(() => prev);
    markDirty();
    updateStackUI();
  }, [updateCanvasData, markDirty, updateStackUI]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    const current = useNoteStore.getState().canvasData;
    if (current) {
      undoStack.current = [...undoStack.current.slice(-MAX_UNDO_STACK + 1), current];
    }
    lastSnapshotRef.current = next;
    updateCanvasData(() => next);
    markDirty();
    updateStackUI();
  }, [updateCanvasData, markDirty, updateStackUI]);

  const addStroke = useCallback(
    (stroke: Omit<Stroke, 'id'>) => {
      snapshot();
      const newStroke: Stroke = { ...stroke, id: nanoid_simple() };
      updateCanvasData((prev) => ({
        ...prev,
        strokes: [...prev.strokes, newStroke],
      }));
      
      const state = useNoteStore.getState();
      if (state.isRecording) {
        state.addPendingTimestamp(newStroke.id, state.recordingElapsed);
      }
      
      markDirty();
    },
    [snapshot, updateCanvasData, markDirty],
  );

  const addTextBlock = useCallback(
    (block: Omit<TextBlock, 'id'>) => {
      snapshot();
      const newBlock: TextBlock = { ...block, id: nanoid_simple() };
      updateCanvasData((prev) => ({
        ...prev,
        textBlocks: [...prev.textBlocks, newBlock],
      }));
      
      const state = useNoteStore.getState();
      if (state.isRecording) {
        state.addPendingTimestamp(newBlock.id, state.recordingElapsed);
      }
      
      markDirty();
      return newBlock.id;
    },
    [snapshot, updateCanvasData, markDirty],
  );

  const updateTextBlock = useCallback(
    (id: string, content: string) => {
      // Don't snapshot on every keystroke - only when text is finalized
      updateCanvasData((prev) => ({
        ...prev,
        textBlocks: prev.textBlocks.map((b) => (b.id === id ? { ...b, content } : b)),
      }));
      markDirty();
    },
    [updateCanvasData, markDirty],
  );

  // Snapshot text after editing is complete (blur event)
  const finalizeTextBlock = useCallback(
    (id: string) => {
      snapshot();
    },
    [snapshot],
  );

  const removeTextBlock = useCallback(
    (id: string) => {
      snapshot();
      updateCanvasData((prev) => ({
        ...prev,
        textBlocks: prev.textBlocks.filter((b) => b.id !== id),
      }));
      markDirty();
    },
    [snapshot, updateCanvasData, markDirty],
  );

  // Batch erase snapshots - don't snapshot on every pixel
  const eraseStrokesInArea = useCallback(
    (x: number, y: number, radius: number) => {
      updateCanvasData((prev) => ({
        ...prev,
        strokes: prev.strokes.filter((s) =>
          !s.points.some(
            (p) => Math.hypot(p.x - x, p.y - y) <= radius,
          ),
        ),
      }));
      markDirty();
    },
    [updateCanvasData, markDirty],
  );

  // Snapshot after erasing is complete
  const finalizeErase = useCallback(() => {
    snapshot();
  }, [snapshot]);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  return {
    canvasData,
    undo,
    redo,
    canUndo,
    canRedo,
    addStroke,
    addTextBlock,
    updateTextBlock,
    finalizeTextBlock,
    removeTextBlock,
    eraseStrokesInArea,
    finalizeErase,
  };
}
