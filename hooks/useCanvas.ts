'use client';

/**
 * useCanvas — manages stroke state, undo/redo stack, and serialization.
 * Consumed by NoteCanvas and DrawingLayer.
 */

import { useCallback, useRef, useState } from 'react';
import { useNoteStore, type CanvasData, type Stroke, type TextBlock } from '@/store/noteStore';
import { nanoid } from 'nanoid';

const MAX_UNDO_STACK = 50;

function nanoid_simple(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function useCanvas() {
  const { canvasData, updateCanvasData, markDirty } = useNoteStore();
  const undoStack = useRef<CanvasData[]>([]);
  const redoStack = useRef<CanvasData[]>([]);

  const snapshot = useCallback(() => {
    if (!canvasData) return;
    undoStack.current = [
      ...undoStack.current.slice(-MAX_UNDO_STACK + 1),
      canvasData,
    ];
    redoStack.current = [];
  }, [canvasData]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop()!;
    if (canvasData) redoStack.current.push(canvasData);
    updateCanvasData(() => prev);
    markDirty();
  }, [canvasData, updateCanvasData, markDirty]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    if (canvasData) undoStack.current.push(canvasData);
    updateCanvasData(() => next);
    markDirty();
  }, [canvasData, updateCanvasData, markDirty]);

  const addStroke = useCallback(
    (stroke: Omit<Stroke, 'id'>) => {
      snapshot();
      const newStroke: Stroke = { ...stroke, id: nanoid_simple() };
      updateCanvasData((prev) => ({
        ...prev,
        strokes: [...prev.strokes, newStroke],
      }));
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
      markDirty();
      return newBlock.id;
    },
    [snapshot, updateCanvasData, markDirty],
  );

  const updateTextBlock = useCallback(
    (id: string, content: string) => {
      updateCanvasData((prev) => ({
        ...prev,
        textBlocks: prev.textBlocks.map((b) => (b.id === id ? { ...b, content } : b)),
      }));
      markDirty();
    },
    [updateCanvasData, markDirty],
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
    removeTextBlock,
    eraseStrokesInArea,
  };
}
