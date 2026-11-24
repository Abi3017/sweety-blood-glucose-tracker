import api from './api';

const get = async (path, date) => {
  const { data } = await api.get(`/reports/${path}`, { params: date ? { date } : {} });
  return data.data.report;
};

export const getDailyReport = (date) => get('daily', date);
export const getMonthToDateReport = (date) => get('month-to-date', date);
export const getPreviousMonthReport = (date) => get('monthly', date);
