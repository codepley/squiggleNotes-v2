'use client';

/**
 * useAutoSave — debounced save of canvasData to /api/notes/[id].
 * Triggers save 2 seconds after last canvas change.
 */

import { useEffect, useRef } from 'react';
import { useNoteStore } from '@/store/noteStore';

const DEBOUNCE_MS = 2000;

export function useAutoSave() {
  const { activeNoteId, canvasData, isDirty, markClean } = useNoteStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!isDirty || !activeNoteId || !canvasData) return;

    // Clear any pending timer
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        const storeState = useNoteStore.getState();
        const pendingTimestamps = storeState.pendingTimestamps;

        const res = await fetch(`/api/notes/${activeNoteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ canvasData, pendingTimestamps }),
        });

        if (res.ok) {
          markClean();
          if (pendingTimestamps.length > 0) {
             storeState.clearPendingTimestamps();
          }
        } else {
          console.error('[useAutoSave] Save failed:', res.status);
        }
      } catch (err) {
        console.error('[useAutoSave] Network error:', err);
      } finally {
        isSavingRef.current = false;
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, activeNoteId, canvasData, markClean]);
}
