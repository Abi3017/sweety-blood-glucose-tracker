import { addDays } from './dates';

/**
 * Consecutive days with at least one reading, counted back from `endDate`.
 * If `endDate` itself has no reading yet, counting starts from the day before so the
 * streak is not shown as broken before today's first reading.
 */
export function calculateStreak(readingDates, endDate) {
  const days = new Set(readingDates);
  let cursor = days.has(endDate) ? endDate : addDays(endDate, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
