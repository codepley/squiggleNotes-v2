'use client';

/**
 * NoteCanvas — orchestrates DrawingLayer + TypingLayer + Toolbar + Audio + Review.
 * Manages mode switching, canvas initialization, audio, and context retrieval.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNoteStore, type CanvasData } from '@/store/noteStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { DrawingLayer } from './DrawingLayer';
import { TypingLayer } from './TypingLayer';
import { Toolbar } from './Toolbar';
import { ReviewOverlay } from './ReviewOverlay';
import { ContextPanel } from './ContextPanel';
import { AudioRecorder } from '@/components/audio/AudioRecorder';
import { AudioPlayback } from '@/components/audio/AudioPlayback';
import { GenerateModal } from './GenerateModal';

interface NoteCanvasProps {
  noteId: string;
  initialCanvasData: CanvasData | null;
  initialTitle: string;
  initialAudioUrl?: string | null;
}

export function NoteCanvas({
  noteId,
  initialCanvasData,
  initialTitle,
  initialAudioUrl,
}: NoteCanvasProps) {
  const { setActiveNoteId, setCanvasData, isDirty, audioUrl, setAudioUrl, activeTool } =
    useNoteStore();

  // Context panel state
  const [contextOpen, setContextOpen] = useState(false);
  const [contextInfo, setContextInfo] = useState<{
    elementType: 'stroke' | 'text' | null;
    elementContent: string | null;
    audioOffset: number | null;
  }>({ elementType: null, elementContent: null, audioOffset: null });

  // Timestamp links loaded asynchronously
  const [timestampLinks, setTimestampLinks] = useState<Record<string, number>>({});
  const [linksLoaded, setLinksLoaded] = useState(false);

  // Generate modal state
  const [generateOpen, setGenerateOpen] = useState(false);

  // Initialize store with note data
  useEffect(() => {
    setActiveNoteId(noteId);
    setCanvasData(initialCanvasData ?? { strokes: [], textBlocks: [] });
    if (initialAudioUrl) setAudioUrl(initialAudioUrl);

    return () => {
      setActiveNoteId(null);
      setAudioUrl(null);
    };
  }, [noteId, initialCanvasData, initialAudioUrl, setActiveNoteId, setCanvasData, setAudioUrl]);

  // Fetch timestamp links lazily when entering review mode
  useEffect(() => {
    if (activeTool === 'review') {
      fetch(`/api/notes/${noteId}/timestamps`)
        .then(res => res.json())
        .then(({ data }) => {
          if (data && Array.isArray(data)) {
            const map: Record<string, number> = {};
            data.forEach((link: any) => {
              map[link.canvasElementId] = link.audioOffsetSeconds;
            });
            setTimestampLinks(map);
          }
          setLinksLoaded(true);
        })
        .catch(err => console.error("Failed to fetch timestamps", err));
    }
  }, [activeTool, noteId]);

  // Enable auto-save
  useAutoSave();

  const currentAudioUrl = audioUrl || initialAudioUrl;

  // Handle element tap in review mode
  const handleElementTap = useCallback(
    (info: { elementType: 'stroke' | 'text'; elementId: string; content: string | null }) => {
      // Look up TimestampLink for this element to get audioOffset
      const storeState = useNoteStore.getState();
      const pendingMatch = storeState.pendingTimestamps.find(pt => pt.elementId === info.elementId);
      const offset = pendingMatch ? pendingMatch.offset : (timestampLinks[info.elementId] ?? null);
      
      setContextInfo({
        elementType: info.elementType,
        elementContent: info.content,
        audioOffset: offset, 
      });
      setContextOpen(true);
    },
    [timestampLinks],
  );

  return (
    <div className="flex h-full flex-col">
      {/* ── Title bar ─── */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 bg-[#0E0E0F]">
        <h1 className="text-lg font-medium text-[#F0EDE6]/90 truncate">
          {initialTitle}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGenerateOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-[#4F6EF7]/10 text-[#4F6EF7] hover:bg-[#4F6EF7]/20 transition-colors"
          >
            🧠 Generate
          </button>
          {activeTool === 'review' && (
            <span className="text-xs text-[#4F6EF7] font-medium">Review Mode</span>
          )}
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
      <div className="relative flex-1 overflow-auto canvas-paper">
        {/* Drawing canvas */}
        <DrawingLayer />

        {/* Text blocks overlay */}
        <TypingLayer />

        {/* Review mode overlay (clickable hit zones) */}
        <ReviewOverlay onElementTap={handleElementTap} />

        {/* Context panel (slides up) */}
        <ContextPanel
          isOpen={contextOpen}
          onClose={() => setContextOpen(false)}
          audioUrl={currentAudioUrl ?? null}
          audioOffset={contextInfo.audioOffset}
          elementType={contextInfo.elementType}
          elementContent={contextInfo.elementContent}
        />
      </div>

      {/* ── Bottom controls ─── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
        {/* Audio playback (if audio exists and not in review with context panel) */}
        {currentAudioUrl && !contextOpen && (
          <AudioPlayback audioUrl={currentAudioUrl} />
        )}

        {/* Toolbar + Audio recorder side by side */}
        <div className="flex items-center gap-2">
          <Toolbar />
          <AudioRecorder noteId={noteId} />
        </div>
      </div>

      {/* ── Generate modal ─── */}
      <GenerateModal
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        noteId={noteId}
      />
    </div>
  );
}
