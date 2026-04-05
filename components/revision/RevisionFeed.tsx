'use client';

/**
 * RevisionFeed — card-by-card feed with progress bar and completion summary.
 * Renders FlashCard, QuizCard, or FillInBlank based on card type.
 */

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRevisionSchedule, type RevisionCard } from '@/hooks/useRevisionSchedule';
import { FlashCard } from './FlashCard';
import { QuizCard } from './QuizCard';
import { FillInBlank } from './FillInBlank';

export function RevisionFeed() {
  const { cards, isLoading, error, submitRating, refresh } = useRevisionSchedule();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const totalCards = cards.length;
  const currentCard = cards[currentIndex] ?? null;
  const progress = totalCards > 0 ? ((currentIndex) / totalCards) * 100 : 0;

  // ── Handle rating ───────────────────────────────────────────────────────────
  const handleRate = useCallback(
    async (rating: 'again' | 'hard' | 'good' | 'easy') => {
      if (!currentCard) return;

      // Submit to backend
      await submitRating(currentCard.sessionId, currentCard.contentId, rating);
      setRatings((prev) => [...prev, rating]);

      // Next card or complete
      if (currentIndex + 1 >= totalCards) {
        setIsComplete(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [currentCard, currentIndex, totalCards, submitRating],
  );

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          className="w-10 h-10 border-3 border-[#4F6EF7]/30 border-t-[#4F6EF7] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-sm text-[#F0EDE6]/40">Loading revision cards…</p>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <span className="text-3xl">⚠️</span>
        <p className="text-sm text-[#FF453A]/80">{error}</p>
        <button onClick={refresh} className="text-xs text-[#4F6EF7] hover:underline">
          Try again
        </button>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (totalCards === 0 && !isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl"
        >
          🎉
        </motion.div>
        <h2 className="text-xl font-semibold text-[#F0EDE6]/80">All caught up!</h2>
        <p className="text-sm text-[#F0EDE6]/30 text-center max-w-xs">
          No revision cards due right now. Create notes and generate content to build your revision schedule.
        </p>
      </div>
    );
  }

  // ── Completion summary ──────────────────────────────────────────────────────
  if (isComplete) {
    const goodCount = ratings.filter((r) => r === 'good' || r === 'easy').length;
    const accuracy = totalCards > 0 ? Math.round((goodCount / totalCards) * 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="text-7xl"
        >
          {accuracy >= 80 ? '🏆' : accuracy >= 50 ? '💪' : '📚'}
        </motion.div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#F0EDE6]/90 mb-1">Session Complete!</h2>
          <p className="text-sm text-[#F0EDE6]/40">
            You reviewed {totalCards} card{totalCards !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#30D158]">{accuracy}%</p>
            <p className="text-[10px] text-[#F0EDE6]/25 uppercase tracking-wider">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#4F6EF7]">{totalCards}</p>
            <p className="text-[10px] text-[#F0EDE6]/25 uppercase tracking-wider">Reviewed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#F5A623]">
              {ratings.filter((r) => r === 'again').length}
            </p>
            <p className="text-[10px] text-[#F0EDE6]/25 uppercase tracking-wider">To Review</p>
          </div>
        </div>

        <motion.button
          onClick={() => {
            setCurrentIndex(0);
            setRatings([]);
            setIsComplete(false);
            refresh();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-6 py-2.5 rounded-xl bg-[#4F6EF7] text-white text-sm font-medium"
        >
          Done
        </motion.button>
      </motion.div>
    );
  }

  // ── Card feed ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-[#F0EDE6]/90">Daily Revision</h2>
          <p className="text-xs text-[#F0EDE6]/30">
            Card {currentIndex + 1} of {totalCards}
          </p>
        </div>
        <span className="text-xs text-[#F0EDE6]/20">
          📖 {totalCards - currentIndex} remaining
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/[0.04]">
        <motion.div
          className="h-full bg-[#4F6EF7]"
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {currentCard && renderCard(currentCard, handleRate)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Card renderer ────────────────────────────────────────────────────────────

function renderCard(
  card: RevisionCard,
  onRate: (rating: 'again' | 'hard' | 'good' | 'easy') => void,
) {
  switch (card.type) {
    case 'flashcard':
      return (
        <FlashCard
          question={card.question}
          answer={card.answer}
          noteTitle={card.noteTitle}
          onRate={onRate}
        />
      );
    case 'quiz':
      return (
        <QuizCard
          question={card.question}
          answer={card.answer}
          options={card.options ?? []}
          noteTitle={card.noteTitle}
          onRate={onRate}
        />
      );
    case 'fill_in_blank':
      return (
        <FillInBlank
          blankedSentence={card.blankedSentence ?? ''}
          answer={card.answer}
          noteTitle={card.noteTitle}
          onRate={onRate}
        />
      );
    default:
      return null;
  }
}
