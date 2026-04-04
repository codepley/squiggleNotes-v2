/**
 * SM-2 Spaced Repetition Scheduler
 *
 * Based on the SuperMemo SM-2 algorithm.
 *
 * Ratings:
 *   0 = again (complete blackout)
 *   1 = hard
 *   2 = good
 *   3 = easy
 *
 * Interval progression: 1 → 2 → 4 → 7 → ... (multiplied by easeFactor)
 * EaseFactor starts at 2.5, minimum 1.3
 */

export type Rating = 0 | 1 | 2 | 3;

export interface ScheduleResult {
  nextIntervalDays: number;
  newEaseFactor: number;
  newRepetition: number;
}

/**
 * Compute the next review interval using SM-2.
 *
 * @param repetition - How many times this item has been successfully reviewed
 * @param easeFactor - Current ease factor (default 2.5, min 1.3)
 * @param rating     - User rating: 0=again, 1=hard, 2=good, 3=easy
 */
export function getNextInterval(
  repetition: number,
  easeFactor: number,
  rating: Rating,
): ScheduleResult {
  // EF adjustment formula (SM-2)
  const efDelta = 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02);
  const newEaseFactor = Math.max(1.3, easeFactor + efDelta);

  // If rating < 1 (again), reset repetition counter
  if (rating < 1) {
    return {
      nextIntervalDays: 1,
      newEaseFactor,
      newRepetition: 0,
    };
  }

  let nextIntervalDays: number;
  const newRepetition = repetition + 1;

  if (repetition === 0) {
    nextIntervalDays = 1;
  } else if (repetition === 1) {
    nextIntervalDays = 2;
  } else {
    // Previous interval × easeFactor
    const prevInterval = repetition <= 1 ? 1 : Math.round(Math.pow(easeFactor, repetition - 1));
    nextIntervalDays = Math.round(prevInterval * newEaseFactor);
  }

  return { nextIntervalDays, newEaseFactor, newRepetition };
}

/**
 * Utility: compute the next due Date from today + intervalDays.
 */
export function computeNextDue(intervalDays: number): Date {
  const next = new Date();
  next.setDate(next.getDate() + intervalDays);
  next.setHours(0, 0, 0, 0); // midnight of next due day
  return next;
}
