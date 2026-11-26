import api from './api';

/** Appointments live in the user's account (server). */
export async function listAppointments() {
  const { data } = await api.get('/appointments');
  return data.data.appointments;
}

/** Creates the appointment, or updates it when `values.id` is set. Returns the saved appointment. */
export async function saveAppointment(values) {
  const { id, ...fields } = values;
  const { data } = id ? await api.put(`/appointments/${id}`, fields) : await api.post('/appointments', fields);
  return data.data.appointment;
}

export async function deleteAppointment(id) {
  await api.delete(`/appointments/${id}`);
}

/** Adds about four weeks of sample readings and two appointments to an account with no readings. */
export async function addSampleData() {
  const { data } = await api.post('/demo/sample-data');
  return data.data;
}

// ---- one-time move of appointments saved in this browser by the earlier version ----

const legacyKey = (userId) => `sweety.appointments.${userId}`;

function readLegacy(userId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(legacyKey(userId)) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Uploads appointments that were saved only in this browser, then removes the local copy.
 * Items that fail validation or upload are skipped, and the local copy is kept if anything failed
 * so nothing is lost. Returns how many were moved.
 */
export async function importLegacyAppointments(userId) {
  const legacy = readLegacy(userId);
  if (legacy.length === 0) return 0;

  let moved = 0;
  let failed = 0;
  for (const item of legacy) {
    try {
      await saveAppointment({
        doctor: item.doctor,
        specialty: item.specialty || '',
        date: item.date,
        time: item.time,
        location: item.location || '',
        notes: item.notes || '',
      });
      moved += 1;
    } catch {
      failed += 1;
    }
  }
  if (failed === 0) {
    try {
      localStorage.removeItem(legacyKey(userId));
    } catch {
      /* nothing to clean up */
    }
  }
  return moved;
}
