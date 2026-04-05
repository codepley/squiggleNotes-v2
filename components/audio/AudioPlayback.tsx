'use client';

/**
 * AudioPlayback — playback controls for reviewing linked audio.
 * Play/pause, seek, current time display, and timestamp jump support.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AudioPlaybackProps {
  audioUrl: string;
  /** If set, auto-seek to this offset on mount */
  seekTo?: number;
  onTimeUpdate?: (currentTime: number) => void;
}

export function AudioPlayback({ audioUrl, seekTo, onTimeUpdate }: AudioPlaybackProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // ─── Auto-seek on mount or seekTo change ────────────────────────────────────
  useEffect(() => {
    if (seekTo !== undefined && audioRef.current) {
      audioRef.current.currentTime = seekTo;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [seekTo]);

  // ─── Play / Pause ──────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // ─── Time update handler ────────────────────────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    onTimeUpdate?.(audio.currentTime);
  }, [onTimeUpdate]);

  // ─── Public method: seek to offset ──────────────────────────────────────────
  const jumpTo = useCallback((offset: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = offset;
    audio.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  // ─── Format time ───────────────────────────────────────────────────────────
  const formatTime = (s: number) => {    // Handle invalid values (NaN, Infinity, negative)
    if (!isFinite(s) || s < 0) return '0:00';    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-[#1A1A1C]/90 backdrop-blur-xl border border-white/[0.08] rounded-xl px-3 py-2 h-10"
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            const dur = audioRef.current.duration;
            // Only set duration if it's a valid number
            setDuration(isFinite(dur) ? dur : 0);
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play/Pause button */}
      <motion.button
        onClick={togglePlay}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="w-7 h-7 rounded-lg bg-[#4F6EF7] flex items-center justify-center flex-shrink-0"
      >
        {isPlaying ? (
          <div className="flex gap-[2px]">
            <div className="w-[3px] h-3 bg-white rounded-full" />
            <div className="w-[3px] h-3 bg-white rounded-full" />
          </div>
        ) : (
          <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-0.5" />
        )}
      </motion.button>

      {/* Time - current time only */}
      <span className="text-xs font-mono text-[#F0EDE6]/50 w-[30px] text-center flex-shrink-0">
        {formatTime(currentTime)}
      </span>
    </motion.div>
  );
}
