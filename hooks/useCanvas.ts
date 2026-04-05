'use client';

/**
 * useCanvas — manages stroke state, undo/redo stack, and serialization.
 * Consumed by NoteCanvas and DrawingLayer.
 */

import { useCallback } from 'react';
import { useNoteStore, type CanvasData, type Stroke, type TextBlock } from '@/store/noteStore';
import { nanoid } from 'nanoid';

function nanoid_simple(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function useCanvas() {
  const { canvasData, updateCanvasData, markDirty, undoStack, redoStack, pushUndo, popUndo, pushRedo, popRedo, clearRedo } = useNoteStore();

  const snapshot = useCallback(() => {
    const current = useNoteStore.getState().canvasData;
    if (!current) return;
    
    pushUndo(current);
    clearRedo();
  }, [pushUndo, clearRedo]);

  const undo = useCallback(() => {
    const prev = popUndo();
    if (!prev) return;
    
    const current = useNoteStore.getState().canvasData;
    if (current) pushRedo(current);
    
    updateCanvasData(() => prev);
    markDirty();
  }, [popUndo, pushRedo, updateCanvasData, markDirty]);

  const redo = useCallback(() => {
    const next = popRedo();
    if (!next) return;
    
    const current = useNoteStore.getState().canvasData;
    if (current) pushUndo(current);
    
    updateCanvasData(() => next);
    markDirty();
  }, [popRedo, pushUndo, updateCanvasData, markDirty]);

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

  return {
    canvasData,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    addStroke,
    addTextBlock,
    updateTextBlock,
    finalizeTextBlock,
    removeTextBlock,
    eraseStrokesInArea,
    finalizeErase,
  };
}
