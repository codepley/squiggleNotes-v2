'use client';

/**
 * NoteCanvas — orchestrates DrawingLayer + TypingLayer + Toolbar + Audio + Review.
 * Manages mode switching, canvas initialization, audio, and context retrieval.
 */

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNoteStore, type CanvasData } from '@/store/noteStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { DrawingLayer } from './DrawingLayer';
import { TypingLayer } from './TypingLayer';
import { Toolbar } from './Toolbar';
import { ReviewOverlay } from './ReviewOverlay';
import { ContextPanel } from './ContextPanel';
import { BoardPanel } from './BoardSelector';
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

  // Board panel collapse state
  const [isBoardPanelCollapsed, setIsBoardPanelCollapsed] = useState(false);

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
    <div className="flex h-full">
      {/* ── Left sidebar: Boards ─── */}
      <motion.div
        initial={false}
        animate={{ width: isBoardPanelCollapsed ? 0 : 224 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-[#0A0A0C] border-r border-white/[0.06] flex flex-col overflow-hidden"
        style={{ minWidth: 0 }}
      >
        <BoardPanel />
      </motion.div>

      {/* Toggle button - always visible */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsBoardPanelCollapsed(!isBoardPanelCollapsed)}
        className="w-10 h-10 flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.1] text-[#F0EDE6]/60 hover:text-[#F0EDE6] transition-colors text-sm flex-shrink-0"
        title={isBoardPanelCollapsed ? 'Expand boards' : 'Collapse boards'}
      >
        {isBoardPanelCollapsed ? '›' : '‹'}
      </motion.button>

      {/* ── Main canvas area ─── */}
      <div className="flex-1 flex flex-col">
        {/* ── Title bar ─── */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 bg-[#0E0E0F]">
          <h1 className="text-lg font-medium text-[#F0EDE6]/90 truncate">
            {initialTitle}
          </h1>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGenerateOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-[#4F6EF7]/10 text-[#4F6EF7] hover:bg-[#4F6EF7]/20 transition-colors"
            >
              🧠 Generate
            </motion.button>
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
          {/* Toolbar + Audio playback + Audio recorder side by side */}
          <div className="flex items-center gap-2">
            <Toolbar />
            
            {/* Audio playback (if audio exists and not in review with context panel) */}
            {currentAudioUrl && !contextOpen && (
              <AudioPlayback audioUrl={currentAudioUrl} />
            )}
            
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
    </div>
  );
}
