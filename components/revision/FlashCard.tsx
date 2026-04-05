'use client';

/**
 * FlashCard — tap to flip with 3D rotateY animation.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FlashCardProps {
  question: string;
  answer: string;
  noteTitle: string;
  onRate: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
}

export function FlashCard({ question, answer, noteTitle, onRate }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Note source */}
      <p className="text-[10px] text-[#F0EDE6]/20 text-center mb-3 uppercase tracking-wider">
        From: {noteTitle}
      </p>

      {/* Card container */}
      <div
        className="relative h-[280px] cursor-pointer"
        style={{ perspective: 1000 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border border-[#4F6EF7]/20 bg-gradient-to-br from-[#1A1A1C] to-[#1E1E22] p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-[10px] uppercase tracking-wider text-[#4F6EF7]/60 mb-4">
              Question
            </span>
            <p className="text-lg text-[#F0EDE6]/80 text-center leading-relaxed">
              {question}
            </p>
            <span className="text-xs text-[#F0EDE6]/15 mt-6">Tap to reveal</span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-[#30D158]/20 bg-gradient-to-br from-[#1A1A1C] to-[#1A2018] p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="text-[10px] uppercase tracking-wider text-[#30D158]/60 mb-4">
              Answer
            </span>
            <p className="text-lg text-[#F0EDE6]/80 text-center leading-relaxed">
              {answer}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Rating buttons (show after flip) */}
      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mt-6"
        >
          {([
            { key: 'again', label: 'Again', color: 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20' },
            { key: 'hard', label: 'Hard', color: 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20' },
            { key: 'good', label: 'Good', color: 'bg-[#4F6EF7]/10 text-[#4F6EF7] border-[#4F6EF7]/20' },
            { key: 'easy', label: 'Easy', color: 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20' },
          ] as const).map((btn) => (
            <motion.button
              key={btn.key}
              onClick={(e) => {
                e.stopPropagation();
                onRate(btn.key);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${btn.color} transition-colors`}
            >
              {btn.label}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
