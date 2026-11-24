const {
  isValidDateString,
  monthToDateRange,
  previousMonthRange,
  todayString,
  isFutureDate,
} = require('../src/utils/dateUtils');
const { calculateStats } = require('../src/services/reportService');
const { duplicateSlotMessage } = require('../src/utils/timeSlots');

describe('date utilities', () => {
  it('validates real calendar dates', () => {
    expect(isValidDateString('2024-02-29')).toBe(true);
    expect(isValidDateString('2023-02-29')).toBe(false);
    expect(isValidDateString('2026-13-01')).toBe(false);
    expect(isValidDateString('2026-1-01')).toBe(false);
  });

  it.each([
    ['2026-10-15', '2026-09-01', '2026-09-30'],
    ['2026-03-31', '2026-02-01', '2026-02-28'],
    ['2024-03-01', '2024-02-01', '2024-02-29'],
    ['2026-01-01', '2025-12-01', '2025-12-31'],
    ['2026-08-31', '2026-07-01', '2026-07-31'],
  ])('previous month of %s is %s..%s', (date, startDate, endDate) => {
    expect(previousMonthRange(date)).toEqual({ startDate, endDate });
  });

  it('month-to-date starts on the 1st', () => {
    expect(monthToDateRange('2026-10-15')).toEqual({ startDate: '2026-10-01', endDate: '2026-10-15' });
    expect(monthToDateRange('2026-10-01')).toEqual({ startDate: '2026-10-01', endDate: '2026-10-01' });
  });

  it('computes "today" in the configured time zone', () => {
    const instant = new Date('2026-10-15T20:00:00Z'); // already 16 Oct in India
    expect(todayString('Asia/Kolkata', instant)).toBe('2026-10-16');
    expect(todayString('UTC', instant)).toBe('2026-10-15');
    expect(isFutureDate('2026-10-16', '2026-10-15')).toBe(true);
    expect(isFutureDate('2026-10-15', '2026-10-15')).toBe(false);
  });
});

describe('calculateStats', () => {
  it('returns null for no readings', () => {
    expect(calculateStats([])).toBeNull();
  });

  it('computes highest, lowest, 1-decimal average and count', () => {
    const stats = calculateStats([{ glucoseValue: 100 }, { glucoseValue: 101 }, { glucoseValue: 101 }]);
    expect(stats).toEqual({ highest: 101, lowest: 100, average: 100.7, count: 3 });
  });
});

describe('duplicateSlotMessage', () => {
  it('uses the right article for each slot', () => {
    expect(duplicateSlotMessage('AFTER_LUNCH')).toBe('You already have an After lunch reading for this date.');
    expect(duplicateSlotMessage('MORNING')).toBe('You already have a Morning (fasting) reading for this date.');
  });
});
