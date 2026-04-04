'use client';

/**
 * useRevisionSchedule — fetches due revision sessions and submits ratings.
 */

import { useCallback, useEffect, useState } from 'react';

export interface RevisionSessionSummary {
  id: string;
  noteId: string;
  noteTitle: string;
  scheduledAt: string;
  nextDue: string;
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number;
}

export type RevisionRating = 'again' | 'hard' | 'good' | 'easy';

export interface UseRevisionScheduleReturn {
  sessions: RevisionSessionSummary[];
  isLoading: boolean;
  error: string | null;
  submitRating: (sessionId: string, contentId: string, rating: RevisionRating) => Promise<void>;
  refresh: () => void;
}

export function useRevisionSchedule(): UseRevisionScheduleReturn {
  const [sessions, setSessions] = useState<RevisionSessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/revision/schedule');
      if (!res.ok) throw new Error('Failed to load revision schedule');
      const { data } = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const submitRating = useCallback(
    async (sessionId: string, contentId: string, rating: RevisionRating) => {
      const res = await fetch(`/api/revision/session`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, contentId, rating }),
      });
      if (!res.ok) throw new Error('Failed to submit rating');
    },
    [],
  );

  return {
    sessions,
    isLoading,
    error,
    submitRating,
    refresh: fetchSessions,
  };
}
