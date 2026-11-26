import { daysUntil, describeWhen, startsAt } from './appointments';
import { TIME_SLOTS, TIME_SLOT_LABELS } from './timeSlots';
import { todayISO } from './dates';

/** When each reading becomes "due" during the day (local time). */
export const READING_DUE_TIMES = {
  MORNING: '07:00',
  AFTER_BREAKFAST: '10:00',
  AFTER_LUNCH: '14:30',
  AFTER_DINNER: '21:00',
};

const minutesOf = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/**
 * The reminder for today's most recent slot that is due but has no reading yet, or null.
 * `readings` are today's readings. Only one is returned so the screen is not flooded.
 */
export function readingReminder(readings, now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const logged = new Set(readings.map((r) => r.timeSlot));
  const due = TIME_SLOTS.filter((slot) => minutesOf(READING_DUE_TIMES[slot]) <= minutes && !logged.has(slot));
  if (due.length === 0) return null;
  const slot = due[due.length - 1];
  return {
    id: `reading-${slot}-${todayISO(now)}`,
    kind: 'reading',
    title: `Time to log your ${TIME_SLOT_LABELS[slot]} reading`,
    detail: 'It only takes a moment.',
    to: `/readings/new?slot=${slot}`,
  };
}

/** Reminders for appointments that are today (and still ahead) or tomorrow. */
export function appointmentReminders(appointments, now = new Date()) {
  return appointments
    .filter((a) => startsAt(a) >= now && daysUntil(a, now) <= 1)
    .map((a) => ({
      id: `appointment-${a.id}-${todayISO(now)}`,
      kind: 'appointment',
      title: `Appointment with ${a.doctor}`,
      detail: describeWhen(a, now),
      to: '/appointments',
    }));
}
