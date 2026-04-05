'use client';

/**
 * RevisionBanner — checks for due revision sessions on mount and shows
 * a dismissable notification banner with card count and link to /revision.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface DueInfo {
  count: number;
  sessionCount: number;
}

export function RevisionBanner() {
  const router = useRouter();
  const [dueInfo, setDueInfo] = useState<DueInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Check for due revisions on mount
  const checkDue = useCallback(async () => {
    try {
      const res = await fetch('/api/revision/schedule');
      const { data } = await res.json();

      if (data && Array.isArray(data) && data.length > 0) {
        setDueInfo({
          sessionCount: data.length,
          count: data.length, // sessions due
        });
      }
    } catch {
      // Silently fail — notification is non-critical
    }
  }, []);

  useEffect(() => {
    checkDue();
  }, [checkDue]);

  // Don't render if nothing due or dismissed
  if (!dueInfo || dismissed || dueInfo.count === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] max-w-md w-[calc(100%-2rem)]"
      >
        <div className="flex items-center gap-3 rounded-xl border border-[#F5A623]/20 bg-[#1A1A1C]/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
          {/* Pulse dot */}
          <div className="relative flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#F5A623] animate-ping opacity-50" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F0EDE6]/80">
              📖 {dueInfo.sessionCount} revision{dueInfo.sessionCount !== 1 ? 's' : ''} due
            </p>
            <p className="text-[11px] text-[#F0EDE6]/30">
              Keep your streak — review now for better retention
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <motion.button
              onClick={() => router.push('/revision')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 rounded-lg bg-[#F5A623]/20 text-[#F5A623] text-xs font-medium border border-[#F5A623]/20 hover:bg-[#F5A623]/30 transition-colors"
            >
              Review
            </motion.button>
            <button
              onClick={() => setDismissed(true)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#F0EDE6]/20 hover:text-[#F0EDE6]/50 text-xs transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
