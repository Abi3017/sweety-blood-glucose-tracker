import { describe, expect, it } from 'vitest';
import { calculateStreak } from '../utils/streak';

describe('calculateStreak', () => {
  it('counts consecutive days ending on the given date', () => {
    expect(calculateStreak(['2026-11-22', '2026-11-23', '2026-11-24'], '2026-11-24')).toBe(3);
  });

  it('does not break the streak before the first reading of the day', () => {
    expect(calculateStreak(['2026-11-22', '2026-11-23'], '2026-11-24')).toBe(2);
  });

  it('stops at the first missing day', () => {
    expect(calculateStreak(['2026-11-20', '2026-11-23', '2026-11-24'], '2026-11-24')).toBe(2);
  });

  it('crosses month boundaries and handles duplicates', () => {
    expect(calculateStreak(['2026-10-31', '2026-11-01', '2026-11-01'], '2026-11-01')).toBe(2);
  });

  it('returns 0 with no recent readings', () => {
    expect(calculateStreak([], '2026-11-24')).toBe(0);
    expect(calculateStreak(['2026-11-20'], '2026-11-24')).toBe(0);
  });
});
