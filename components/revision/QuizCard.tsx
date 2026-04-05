'use client';

/**
 * QuizCard — multiple choice question with option selection + reveal.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuizCardProps {
  question: string;
  answer: string;
  options: string[];
  noteTitle: string;
  onRate: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
}

export function QuizCard({ question, answer, options, noteTitle, onRate }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const isRevealed = selected !== null;
  const isCorrect = selected === answer;

  return (
    <div className="w-full max-w-lg mx-auto">
      <p className="text-[10px] text-[#F0EDE6]/20 text-center mb-3 uppercase tracking-wider">
        From: {noteTitle}
      </p>

      <div className="rounded-2xl border border-[#AF52DE]/20 bg-gradient-to-br from-[#1A1A1C] to-[#1E1820] p-8">
        <span className="text-[10px] uppercase tracking-wider text-[#AF52DE]/60 mb-4 block text-center">
          Quiz
        </span>

        <p className="text-lg text-[#F0EDE6]/80 text-center leading-relaxed mb-6">
          {question}
        </p>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {options.map((opt, i) => {
            const isThis = selected === opt;
            const isAnswer = opt === answer;

            return (
              <motion.button
                key={i}
                onClick={() => !isRevealed && setSelected(opt)}
                disabled={isRevealed}
                whileHover={!isRevealed ? { scale: 1.02 } : {}}
                whileTap={!isRevealed ? { scale: 0.98 } : {}}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors',
                  isRevealed && isAnswer
                    ? 'bg-[#30D158]/10 border-[#30D158]/30 text-[#30D158]'
                    : isRevealed && isThis && !isAnswer
                      ? 'bg-[#FF453A]/10 border-[#FF453A]/30 text-[#FF453A]'
                      : 'bg-white/[0.02] border-white/[0.06] text-[#F0EDE6]/70 hover:bg-white/[0.04] hover:border-white/[0.12]',
                )}
              >
                <span className="text-[#F0EDE6]/30 mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
                {isRevealed && isAnswer && ' ✓'}
                {isRevealed && isThis && !isAnswer && ' ✗'}
              </motion.button>
            );
          })}
        </div>

        {/* Rating buttons */}
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 pt-2"
          >
            {([
              { key: 'again', label: 'Again', color: 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20' },
              { key: 'hard', label: 'Hard', color: 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20' },
              { key: 'good', label: 'Good', color: 'bg-[#4F6EF7]/10 text-[#4F6EF7] border-[#4F6EF7]/20' },
              { key: 'easy', label: 'Easy', color: 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20' },
            ] as const).map((btn) => (
              <motion.button
                key={btn.key}
                onClick={() => onRate(btn.key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${btn.color}`}
              >
                {btn.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
