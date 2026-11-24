import { sortAppointments } from '../utils/appointments';

/**
 * Appointments are stored in this browser (localStorage), one list per signed-in user.
 * They are not synced to the server or other devices.
 */
const keyFor = (userId) => `sweety.appointments.${userId}`;

function read(userId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(keyFor(userId)) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Returns false when the browser refuses to store (private mode, quota, blocked storage). */
function write(userId, list) {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

const newId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export const listAppointments = (userId) => sortAppointments(read(userId));

/** Adds the appointment, or replaces the one with the same id. Returns the saved list, or null if it could not be stored. */
export function saveAppointment(userId, appointment) {
  const list = read(userId);
  const saved = { ...appointment, id: appointment.id || newId() };
  const next = list.some((a) => a.id === saved.id) ? list.map((a) => (a.id === saved.id ? saved : a)) : [...list, saved];
  return write(userId, next) ? sortAppointments(next) : null;
}

export function deleteAppointment(userId, id) {
  const next = read(userId).filter((a) => a.id !== id);
  return write(userId, next) ? sortAppointments(next) : null;
}
