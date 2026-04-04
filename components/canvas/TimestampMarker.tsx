'use client';

/**
 * TimestampMarker — placeholder for audio-linked markers (Step 3.3/3.4).
 * Small colored dots on the canvas at positions of linked elements.
 * Tap → jump audio playback to that offset.
 */

import { motion } from 'framer-motion';

interface TimestampMarkerProps {
  x: number;
  y: number;
  audioOffset: number;
  onTap?: (offset: number) => void;
}

export function TimestampMarker({ x, y, audioOffset, onTap }: TimestampMarkerProps) {
  return (
    <motion.button
      className="absolute z-30 w-3 h-3 rounded-full bg-[#F5A623] border border-[#F5A623]/60 shadow-lg shadow-[#F5A623]/20"
      style={{ left: x - 6, top: y - 6 }}
      whileHover={{ scale: 1.5 }}
      whileTap={{ scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      onClick={() => onTap?.(audioOffset)}
      title={`Jump to ${Math.floor(audioOffset / 60)}:${String(Math.floor(audioOffset % 60)).padStart(2, '0')}`}
    >
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-[#F5A623]"
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.button>
  );
}
