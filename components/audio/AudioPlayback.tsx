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
  const progressRef = useRef<HTMLDivElement>(null);

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

  // ─── Seek via progress bar click ────────────────────────────────────────────
  const handleSeek = useCallback(
    (e: React.MouseEvent) => {
      const bar = progressRef.current;
      const audio = audioRef.current;
      if (!bar || !audio || !duration) return;

      const rect = bar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      audio.currentTime = pct * duration;
    },
    [duration],
  );

  // ─── Public method: seek to offset ──────────────────────────────────────────
  const jumpTo = useCallback((offset: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = offset;
    audio.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  // ─── Format time ───────────────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-[#1A1A1C]/90 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-2"
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play/Pause button */}
      <motion.button
        onClick={togglePlay}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-8 h-8 rounded-full bg-[#4F6EF7] flex items-center justify-center flex-shrink-0"
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

      {/* Time */}
      <span className="text-xs font-mono text-[#F0EDE6]/50 w-[70px] text-center flex-shrink-0">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Progress bar */}
      <div
        ref={progressRef}
        onClick={handleSeek}
        className="flex-1 h-1.5 bg-white/[0.06] rounded-full cursor-pointer relative group"
      >
        <motion.div
          className="h-full bg-[#4F6EF7] rounded-full relative"
          style={{ width: `${progress}%` }}
        >
          {/* Scrubber dot */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#4F6EF7] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>
    </motion.div>
  );
}
