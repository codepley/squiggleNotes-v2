'use client';

/**
 * ContextPanel — slide-up panel showing audio player + AI insight
 * for a tapped canvas element in Review mode.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AudioPlayback } from '@/components/audio/AudioPlayback';

interface ContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  audioUrl: string | null;
  audioOffset: number | null;
  elementType: 'stroke' | 'text' | null;
  elementContent: string | null;
}

export function ContextPanel({
  isOpen,
  onClose,
  audioUrl,
  audioOffset,
  elementType,
  elementContent,
}: ContextPanelProps) {
  const hasAudioLink = audioUrl && audioOffset !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/20"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-[60] rounded-t-2xl border-t border-white/[0.08] bg-[#1A1A1C]/95 backdrop-blur-xl shadow-2xl"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-white/[0.15]" />
            </div>

            <div className="px-5 pb-5 space-y-4 max-h-[40vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {elementType === 'stroke' ? '🎨' : '📝'}
                  </span>
                  <h3 className="text-sm font-medium text-[#F0EDE6]/90">
                    Context Retrieval
                  </h3>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[#F0EDE6]/40 hover:text-[#F0EDE6]/80 text-xs"
                >
                  ×
                </motion.button>
              </div>

              {/* Audio section */}
              {hasAudioLink ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
                    <p className="text-xs text-[#F5A623]/70">
                      Linked at {Math.floor(audioOffset / 60)}:{String(Math.floor(audioOffset % 60)).padStart(2, '0')}
                    </p>
                  </div>
                  <AudioPlayback audioUrl={audioUrl} seekTo={audioOffset} />
                </div>
              ) : (
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <p className="text-xs text-[#F0EDE6]/30 text-center">
                    🔇 No audio linked to this element
                  </p>
                  <p className="text-[10px] text-[#F0EDE6]/15 text-center mt-1">
                    Record audio while taking notes to create timestamp links
                  </p>
                </div>
              )}

              {/* Element content preview */}
              {elementContent && (
                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-wider text-[#F0EDE6]/25 font-medium">
                    Content
                  </p>
                  <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                    <p className="text-sm text-[#F0EDE6]/70 whitespace-pre-wrap">
                      {elementContent}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Insight placeholder */}
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wider text-[#F0EDE6]/25 font-medium">
                  AI Insight
                </p>
                <div className="rounded-lg border border-[#4F6EF7]/10 bg-[#4F6EF7]/[0.03] p-3">
                  <p className="text-xs text-[#F0EDE6]/40 text-center">
                    🧠 AI-powered explanations coming in the next update
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
