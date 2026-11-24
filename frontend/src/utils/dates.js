/** Calendar-date helpers working with "YYYY-MM-DD" strings (no time zones involved). */

const pad = (n) => String(n).padStart(2, '0');

/** Today in the browser's local time zone as YYYY-MM-DD. */
export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function isValidISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function isFutureISODate(value, today = todayISO()) {
  return value > today;
}

export function addDays(value, days) {
  const d = new Date(`${value}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Every date from start to end inclusive. */
export function eachDate(startDate, endDate) {
  const dates = [];
  for (let d = startDate; d <= endDate; d = addDays(d, 1)) dates.push(d);
  return dates;
}

/** "2026-10-15" -> "15 Oct 2026" */
export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  return new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
}

/** "2026-10-15" -> "Thursday, 15 October 2026" */
export function formatLongDate(value) {
  return formatDate(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** ISO timestamp -> "15 Oct 2026, 09:30" in local time. */
export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRange({ startDate, endDate }) {
  return startDate === endDate ? formatDate(startDate) : `${formatDate(startDate)} – ${formatDate(endDate)}`;
}
