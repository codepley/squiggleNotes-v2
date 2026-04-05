'use client';

/**
 * FillInBlank — sentence with ___ gap, text input, submit to reveal.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FillInBlankProps {
  blankedSentence: string;
  answer: string;
  noteTitle: string;
  onRate: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
}

export function FillInBlank({ blankedSentence, answer, noteTitle, onRate }: FillInBlankProps) {
  const [userInput, setUserInput] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const isCorrect = userInput.trim().toLowerCase() === answer.trim().toLowerCase();

  const handleSubmit = useCallback(() => {
    setIsRevealed(true);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto">
      <p className="text-[10px] text-[#F0EDE6]/20 text-center mb-3 uppercase tracking-wider">
        From: {noteTitle}
      </p>

      <div className="rounded-2xl border border-[#F5A623]/20 bg-gradient-to-br from-[#1A1A1C] to-[#201E18] p-8">
        <span className="text-[10px] uppercase tracking-wider text-[#F5A623]/60 mb-4 block text-center">
          Fill in the Blank
        </span>

        {/* Sentence with blank */}
        <p className="text-lg text-[#F0EDE6]/80 text-center leading-relaxed mb-6">
          {blankedSentence}
        </p>

        {/* Input */}
        {!isRevealed ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Type your answer…"
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE6]/80 placeholder-[#F0EDE6]/20 outline-none focus:border-[#F5A623]/40 transition-colors"
              autoFocus
            />
            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2.5 rounded-lg bg-[#F5A623]/20 text-[#F5A623] text-sm font-medium border border-[#F5A623]/20"
            >
              Check
            </motion.button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Result */}
              <div className={`rounded-lg p-3 text-center ${isCorrect ? 'bg-[#30D158]/10 border border-[#30D158]/20' : 'bg-[#FF453A]/10 border border-[#FF453A]/20'}`}>
                <p className={`text-sm font-medium ${isCorrect ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                  {isCorrect ? '✓ Correct!' : '✗ Not quite'}
                </p>
                {!isCorrect && (
                  <p className="text-xs text-[#F0EDE6]/50 mt-1">
                    Your answer: <span className="text-[#FF453A]">{userInput || '(empty)'}</span> → Correct: <span className="text-[#30D158]">{answer}</span>
                  </p>
                )}
              </div>

              {/* Rating buttons */}
              <div className="flex items-center justify-center gap-2">
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
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
