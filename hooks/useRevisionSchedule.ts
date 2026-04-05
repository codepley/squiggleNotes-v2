'use client';

/**
 * useRevisionSchedule — fetch due sessions, submit ratings.
 */

import { useCallback, useEffect, useState } from 'react';
import type { GeneratedItem } from '@/lib/ai/generator';

export interface DueSession {
  id: string;
  noteId: string;
  noteTitle: string;
  scheduledAt: string;
  nextDue: string;
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number;
}

export interface RevisionCard extends GeneratedItem {
  contentId: string;
  sessionId: string;
  noteTitle: string;
}

export function useRevisionSchedule() {
  const [dueSessions, setDueSessions] = useState<DueSession[]>([]);
  const [cards, setCards] = useState<RevisionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/revision/schedule');
      const { data, error: apiError } = await res.json();

      if (apiError) {
        setError(apiError);
        setIsLoading(false);
        return;
      }

      setDueSessions(data ?? []);

      const allCards: RevisionCard[] = [];

      for (const session of (data ?? []) as DueSession[]) {
        try {
          const contentRes = await fetch(`/api/notes/${session.noteId}/content`);
          const { data: content } = await contentRes.json();

          if (content && Array.isArray(content)) {
            for (const item of content) {
              allCards.push({
                contentId: item._id,
                sessionId: session.id,
                noteTitle: session.noteTitle,
                type: item.type,
                question: item.payload?.question ?? '',
                answer: item.payload?.answer ?? '',
                options: item.payload?.options ?? null,
                blankedSentence: item.payload?.blankedSentence ?? null,
              });
            }
          }
        } catch {
          // Skip
        }
      }

      // Shuffle
      for (let i = allCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
      }

      setCards(allCards);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitRating = useCallback(
    async (sessionId: string, contentId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
      try {
        await fetch('/api/revision/session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, contentId, rating }),
        });
      } catch (err) {
        console.error('Failed to submit rating:', err);
      }
    },
    [],
  );

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return { dueSessions, cards, isLoading, error, submitRating, refresh: fetchSchedule };
}
