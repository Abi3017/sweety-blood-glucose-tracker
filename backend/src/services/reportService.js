const prisma = require('../config/database');
const { toReadingDto } = require('./readingService');
const { toDbDate, monthToDateRange, previousMonthRange } = require('../utils/dateUtils');

/**
 * Highest, lowest, average (1 decimal) and count for a list of readings.
 * Returns null when there are no readings so the client can show an empty state
 * instead of misleading zeros.
 */
function calculateStats(readings) {
  if (readings.length === 0) return null;

  const values = readings.map((r) => r.glucoseValue);
  const sum = values.reduce((total, value) => total + value, 0);
  // Integer arithmetic before dividing avoids floating-point rounding surprises
  // (e.g. 245 / 2 = 122.5 stays 122.5).
  const average = Math.round((sum * 10) / values.length) / 10;

  return {
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average,
    count: values.length,
  };
}

async function buildReport(userId, type, { startDate, endDate }) {
  const rows = await prisma.reading.findMany({
    where: { userId, readingDate: { gte: toDbDate(startDate), lte: toDbDate(endDate) } },
    orderBy: [{ readingDate: 'asc' }, { timeSlot: 'asc' }],
  });

  const stats = calculateStats(rows);
  return {
    type,
    range: { startDate, endDate },
    isEmpty: stats === null,
    stats,
    readings: rows.map(toReadingDto),
  };
}

/** Readings for the selected date only. */
function getDailyReport(userId, date) {
  return buildReport(userId, 'daily', { startDate: date, endDate: date });
}

/** 1st of the selected month through the selected date (inclusive). */
function getMonthToDateReport(userId, date) {
  return buildReport(userId, 'month-to-date', monthToDateRange(date));
}

/** The whole calendar month before the reference date's month. */
function getPreviousMonthReport(userId, referenceDate) {
  return buildReport(userId, 'monthly', previousMonthRange(referenceDate));
}

module.exports = { calculateStats, getDailyReport, getMonthToDateReport, getPreviousMonthReport };
