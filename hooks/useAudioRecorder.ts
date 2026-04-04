'use client';

/**
 * useAudioRecorder — React hook wrapping AudioRecorderManager.
 * Returns { isRecording, elapsed, start, stop, blob }
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioRecorderManager } from '@/lib/audio/recorder';

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  elapsed: number; // seconds
  start: () => Promise<void>;
  stop: () => void;
  blob: Blob | null;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const managerRef = useRef<AudioRecorderManager | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setError(null);
    setBlob(null);
    setElapsed(0);

    try {
      managerRef.current = new AudioRecorderManager();
      await managerRef.current.start({
        onStop: (b) => {
          setBlob(b);
          setIsRecording(false);
        },
      });

      setIsRecording(true);

      // Elapsed timer
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microphone access denied');
    }
  }, []);

  const stop = useCallback(() => {
    managerRef.current?.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      managerRef.current?.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { isRecording, elapsed, start, stop, blob, error };
}
