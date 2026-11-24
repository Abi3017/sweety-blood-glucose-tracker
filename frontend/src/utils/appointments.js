/** Helpers for doctor appointments. Dates are local "YYYY-MM-DD", times local "HH:MM". */

export function startsAt(appointment) {
  return new Date(`${appointment.date}T${appointment.time}:00`);
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Whole calendar days from `now` to the appointment (0 = today, 1 = tomorrow, negative = past). */
export function daysUntil(appointment, now = new Date()) {
  return Math.round((startOfDay(startsAt(appointment)) - startOfDay(now)) / 86400000);
}

/** "4:30 PM" from "16:30". */
export function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** "Today at 4:30 PM", "Tomorrow at 9:00 AM", "In 5 days · 4:30 PM", or "2 days ago". */
export function describeWhen(appointment, now = new Date()) {
  const days = daysUntil(appointment, now);
  const time = formatTime(appointment.time);
  if (days === 0) return `Today at ${time}`;
  if (days === 1) return `Tomorrow at ${time}`;
  if (days > 1) return `In ${days} days · ${time}`;
  if (days === -1) return `Yesterday at ${time}`;
  return `${-days} days ago`;
}

export function sortAppointments(list) {
  return [...list].sort((a, b) => startsAt(a) - startsAt(b));
}

/** Upcoming (soonest first) and past (most recent first). An appointment is upcoming until its start time passes. */
export function splitAppointments(list, now = new Date()) {
  const sorted = sortAppointments(list);
  return {
    upcoming: sorted.filter((a) => startsAt(a) >= now),
    past: sorted.filter((a) => startsAt(a) < now).reverse(),
  };
}

/** Returns an object of field errors (empty when valid). */
export function validateAppointment(values) {
  const errors = {};
  if (!values.doctor.trim()) errors.doctor = 'Enter the doctor’s name.';
  else if (values.doctor.trim().length > 80) errors.doctor = 'Keep the name under 80 characters.';
  if (values.specialty.trim().length > 60) errors.specialty = 'Keep this under 60 characters.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || Number.isNaN(new Date(`${values.date}T00:00:00`).getTime())) errors.date = 'Choose a date.';
  if (!/^\d{2}:\d{2}$/.test(values.time)) errors.time = 'Choose a time.';
  if (values.location.trim().length > 120) errors.location = 'Keep this under 120 characters.';
  if (values.notes.trim().length > 500) errors.notes = 'Keep notes under 500 characters.';
  return errors;
}
