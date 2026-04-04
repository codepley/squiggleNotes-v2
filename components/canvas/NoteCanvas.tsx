'use client';

/**
 * NoteCanvas — orchestrates DrawingLayer + TypingLayer + Toolbar.
 * Manages mode switching and canvas initialization.
 */

import { useEffect } from 'react';
import { useNoteStore, type CanvasData } from '@/store/noteStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { DrawingLayer } from './DrawingLayer';
import { TypingLayer } from './TypingLayer';
import { Toolbar } from './Toolbar';

interface NoteCanvasProps {
  noteId: string;
  initialCanvasData: CanvasData | null;
  initialTitle: string;
}

export function NoteCanvas({ noteId, initialCanvasData, initialTitle }: NoteCanvasProps) {
  const { setActiveNoteId, setCanvasData, isDirty } = useNoteStore();

  // Initialize store with note data
  useEffect(() => {
    setActiveNoteId(noteId);
    setCanvasData(initialCanvasData ?? { strokes: [], textBlocks: [] });

    return () => {
      setActiveNoteId(null);
    };
  }, [noteId, initialCanvasData, setActiveNoteId, setCanvasData]);

  // Enable auto-save
  useAutoSave();

  return (
    <div className="flex h-full flex-col">
      {/* ── Title bar ─── */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 bg-[#0E0E0F]">
        <h1 className="text-lg font-medium text-[#F0EDE6]/90 truncate">
          {initialTitle}
        </h1>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-[#F5A623]/60 animate-pulse">Unsaved</span>
          )}
          <span className="text-xs text-[#F0EDE6]/20">
            {initialCanvasData
              ? `${initialCanvasData.strokes.length} strokes · ${initialCanvasData.textBlocks.length} texts`
              : 'Empty canvas'}
          </span>
        </div>
      </div>

      {/* ── Canvas area ─── */}
      <div className="relative flex-1 overflow-hidden canvas-paper">
        {/* Drawing canvas */}
        <DrawingLayer />

        {/* Text blocks overlay */}
        <TypingLayer />
      </div>

      {/* ── Floating toolbar ─── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
        <Toolbar />
      </div>
    </div>
  );
}
