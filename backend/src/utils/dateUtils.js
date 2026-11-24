/**
 * Date helpers for calendar dates ("YYYY-MM-DD").
 *
 * Reading dates are stored in a PostgreSQL DATE column, which Prisma maps to a
 * JavaScript Date at 00:00 UTC. All arithmetic here is therefore done in UTC so
 * that server time zones and daylight-saving changes can never shift a date.
 */
const env = require('../config/env');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** True when the string is a real calendar date such as 2024-02-29 (not 2023-02-29). */
function isValidDateString(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** "YYYY-MM-DD" -> Date at 00:00 UTC. */
function toDbDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

/** Date (00:00 UTC) -> "YYYY-MM-DD". */
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

/** Today's calendar date in the application's time zone (APP_TIMEZONE). */
function todayString(timeZone = env.appTimezone, now = new Date()) {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** True when the date string is later than today. ISO date strings compare lexicographically. */
function isFutureDate(value, today = todayString()) {
  return value > today;
}

/** First day of the month of the given date through the date itself (inclusive). */
function monthToDateRange(value) {
  const date = toDbDate(value);
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return { startDate: formatDate(start), endDate: value };
}

/**
 * The complete calendar month before the month of the given date.
 * Date.UTC normalises month -1 to December of the previous year, and day 0 of a
 * month to the last day of the month before it, which handles month lengths,
 * February in leap years and year boundaries.
 */
function previousMonthRange(value) {
  const date = toDbDate(value);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return { startDate: formatDate(start), endDate: formatDate(end) };
}

module.exports = {
  isValidDateString,
  toDbDate,
  formatDate,
  todayString,
  isFutureDate,
  monthToDateRange,
  previousMonthRange,
};
