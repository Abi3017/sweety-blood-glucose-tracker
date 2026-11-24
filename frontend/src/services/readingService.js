import api from './api';

/** params: { startDate, endDate, timeSlot, page, limit } – empty values are dropped. */
export async function getReadings(params = {}) {
  const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const { data } = await api.get('/readings', { params: query });
  return { readings: data.data.readings, meta: data.meta };
}

export async function getReading(id) {
  const { data } = await api.get(`/readings/${id}`);
  return data.data.reading;
}

export async function createReading(payload) {
  const { data } = await api.post('/readings', payload);
  return data.data.reading;
}

export async function updateReading(id, payload) {
  const { data } = await api.put(`/readings/${id}`, payload);
  return data.data.reading;
}

export async function deleteReading(id) {
  await api.delete(`/readings/${id}`);
}
