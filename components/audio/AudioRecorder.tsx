'use client';

/**
 * AudioRecorder — record button, elapsed timer, waveform visualizer.
 * Pulsing ring animation while recording (Framer Motion).
 */

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNoteStore } from '@/store/noteStore';
import { WaveformVisualizer } from './WaveformVisualizer';

interface AudioRecorderProps {
  noteId: string;
  onRecordingStop?: (blob: Blob) => void;
}

export function AudioRecorder({ noteId, onRecordingStop }: AudioRecorderProps) {
  const { isRecording, recordingElapsed, setRecording, setRecordingElapsed, setAudioUrl } =
    useNoteStore();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Start recording ────────────────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    try {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        onRecordingStop?.(blob);

        // Upload
        try {
          const formData = new FormData();
          formData.append('audio', blob, `note_${noteId}.webm`);
          formData.append('noteId', noteId);

          const res = await fetch('/api/audio', { method: 'POST', body: formData });
          if (res.ok) {
            const { data } = await res.json();
            setAudioUrl(data.url);
          }
        } catch (err) {
          console.error('Audio upload failed:', err);
        }

        // Cleanup stream
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start(1000);
      setRecording(true);
      setRecordingElapsed(0);

      // Elapsed timer
      intervalRef.current = setInterval(() => {
        setRecordingElapsed(useNoteStore.getState().recordingElapsed + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  }, [noteId, onRecordingStop, setRecording, setRecordingElapsed, setAudioUrl]);

  // ─── Stop recording ─────────────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [setRecording]);

  // ─── Format elapsed time ────────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <AnimatePresence mode="wait">
      {isRecording ? (
        <motion.div
          key="recording"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-3 bg-[#1A1A1C]/90 backdrop-blur-xl border border-[#FF453A]/20 rounded-xl px-4 py-2"
        >
          {/* Stop button with pulsing ring */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#FF453A]"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.button
              onClick={handleStop}
              whileTap={{ scale: 0.9 }}
              className="relative w-8 h-8 rounded-full bg-[#FF453A] flex items-center justify-center"
            >
              <div className="w-3 h-3 rounded-sm bg-white" />
            </motion.button>
          </div>

          {/* Timer */}
          <span className="text-sm font-mono text-[#FF453A]">
            {formatTime(recordingElapsed)}
          </span>

          {/* Waveform */}
          <WaveformVisualizer stream={streamRef.current} isActive={isRecording} barCount={16} />

          <span className="text-[10px] text-[#F0EDE6]/30 uppercase tracking-wider">
            Recording
          </span>
        </motion.div>
      ) : (
        <motion.button
          key="idle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onClick={handleStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-[#1A1A1C]/90 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-2 text-[#F0EDE6]/60 hover:text-[#F0EDE6]/90 transition-colors"
        >
          <div className="w-3 h-3 rounded-full bg-[#FF453A]" />
          <span className="text-sm">Record</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
