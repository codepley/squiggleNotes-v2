'use client';

/**
 * GenerateModal — shows progress spinner → generated content preview → interactive cards.
 * Triggered from NoteCanvas "Generate" button.
 */

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GeneratedItem } from '@/lib/ai/generator';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
}

type ModalState = 'loading' | 'results' | 'error' | 'empty';

export function GenerateModal({ isOpen, onClose, noteId }: GenerateModalProps) {
  const [state, setState] = useState<ModalState>('loading');
  const [items, setItems] = useState<GeneratedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'flashcard' | 'quiz' | 'fill_in_blank'>('all');

  // ── Fetch generated content ─────────────────────────────────────────────────
  const generate = useCallback(async () => {
    setState('loading');
    setError(null);
    setFlippedCards(new Set());

    try {
      // Grab visual snapshot of handwriting
      const canvasEl = document.getElementById('drawing-canvas') as HTMLCanvasElement | null;
      const imageData = canvasEl ? canvasEl.toDataURL('image/png') : null;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, imageData }),
      });

      const { data, error: apiError } = await res.json();

      if (apiError) {
        setError(apiError);
        setState('error');
        return;
      }

      const generated: GeneratedItem[] = (data ?? []).map((d: any) => ({
        type: d.type ?? d.payload?.type ?? 'flashcard',
        question: d.payload?.question ?? d.question ?? '',
        answer: d.payload?.answer ?? d.answer ?? '',
        options: d.payload?.options ?? d.options ?? null,
        blankedSentence: d.payload?.blankedSentence ?? d.blankedSentence ?? null,
      }));

      setItems(generated);
      setState(generated.length === 0 ? 'empty' : 'results');
    } catch (err) {
      setError((err as Error).message);
      setState('error');
    }
  }, [noteId]);

  useEffect(() => {
    if (isOpen) generate();
  }, [isOpen, generate]);

  // ── Card flip ───────────────────────────────────────────────────────────────
  const toggleFlip = (index: number) => {
    const key = String(index);
    setFlippedCards((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── Filtered items ──────────────────────────────────────────────────────────
  const filteredItems =
    activeTab === 'all' ? items : items.filter((i) => i.type === activeTab);

  // ── Tab counts ──────────────────────────────────────────────────────────────
  const counts = {
    all: items.length,
    flashcard: items.filter((i) => i.type === 'flashcard').length,
    quiz: items.filter((i) => i.type === 'quiz').length,
    fill_in_blank: items.filter((i) => i.type === 'fill_in_blank').length,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-[101] rounded-2xl border border-white/[0.08] bg-[#161618] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <h2 className="text-base font-semibold text-[#F0EDE6]/90">
                  Generated Study Content
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {state === 'results' && (
                  <motion.button
                    onClick={generate}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-xs text-[#4F6EF7] hover:text-[#4F6EF7]/80 transition-colors"
                  >
                    ↻ Regenerate
                  </motion.button>
                )}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[#F0EDE6]/40 hover:text-[#F0EDE6]/80 text-sm"
                >
                  ×
                </motion.button>
              </div>
            </div>

            {/* Tabs (shown when results) */}
            {state === 'results' && (
              <div className="flex items-center gap-1 px-5 py-2 border-b border-white/[0.04]">
                {(
                  [
                    { key: 'all', label: 'All' },
                    { key: 'flashcard', label: '📇 Cards' },
                    { key: 'fill_in_blank', label: '📝 Fill-in' },
                    { key: 'quiz', label: '❓ Quiz' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1 rounded-md text-xs transition-colors ${
                      activeTab === tab.key
                        ? 'bg-[#4F6EF7]/20 text-[#4F6EF7]'
                        : 'text-[#F0EDE6]/30 hover:text-[#F0EDE6]/60'
                    }`}
                  >
                    {tab.label}
                    {counts[tab.key] > 0 && (
                      <span className="ml-1 text-[10px] opacity-50">
                        {counts[tab.key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Loading */}
              {state === 'loading' && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <motion.div
                    className="w-10 h-10 border-3 border-[#4F6EF7]/30 border-t-[#4F6EF7] rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-sm text-[#F0EDE6]/40">
                    Analyzing your notes and generating content…
                  </p>
                </div>
              )}

              {/* Error */}
              {state === 'error' && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <span className="text-3xl">⚠️</span>
                  <p className="text-sm text-[#FF453A]/80">{error}</p>
                  <motion.button
                    onClick={generate}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-xs text-[#4F6EF7] hover:underline"
                  >
                    Try again
                  </motion.button>
                </div>
              )}

              {/* Empty */}
              {state === 'empty' && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <span className="text-3xl">📝</span>
                  <p className="text-sm text-[#F0EDE6]/40">
                    No content generated — add text to your notes first.
                  </p>
                  <p className="text-xs text-[#F0EDE6]/20">
                    Use the Text tool (𝐓) to add notes, then try again.
                  </p>
                </div>
              )}

              {/* Results */}
              {state === 'results' && (
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.06 } },
                  }}
                >
                  {filteredItems.map((item, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <GeneratedCard
                        item={item}
                        isFlipped={flippedCards.has(String(i))}
                        onFlip={() => toggleFlip(i)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Card component ───────────────────────────────────────────────────────────

function GeneratedCard({
  item,
  isFlipped,
  onFlip,
}: {
  item: GeneratedItem;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  const typeColors = {
    flashcard: { bg: 'bg-[#4F6EF7]/5', border: 'border-[#4F6EF7]/15', badge: 'bg-[#4F6EF7]/20 text-[#4F6EF7]' },
    quiz: { bg: 'bg-[#AF52DE]/5', border: 'border-[#AF52DE]/15', badge: 'bg-[#AF52DE]/20 text-[#AF52DE]' },
    fill_in_blank: { bg: 'bg-[#F5A623]/5', border: 'border-[#F5A623]/15', badge: 'bg-[#F5A623]/20 text-[#F5A623]' },
  };

  const colors = typeColors[item.type];
  const typeLabels = { flashcard: 'Flashcard', quiz: 'Quiz', fill_in_blank: 'Fill-in-the-Blank' };

  return (
    <motion.div
      onClick={onFlip}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`rounded-xl border ${colors.border} ${colors.bg} p-4 cursor-pointer transition-colors`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
          {typeLabels[item.type]}
        </span>
        <span className="text-[10px] text-[#F0EDE6]/20">
          {isFlipped ? 'Click to hide' : 'Click to reveal'}
        </span>
      </div>

      {/* Question */}
      <p className="text-sm text-[#F0EDE6]/80 mb-2">
        {item.type === 'fill_in_blank' && item.blankedSentence
          ? item.blankedSentence
          : item.question}
      </p>

      {/* Answer (hidden/shown) */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 mt-2 border-t border-white/[0.06]">
              <p className="text-xs text-[#30D158] font-medium mb-1">Answer:</p>
              <p className="text-sm text-[#F0EDE6]/70">{item.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
