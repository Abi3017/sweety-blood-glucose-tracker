const reportService = require('../services/reportService');
const { sendSuccess } = require('../utils/apiResponse');
const { todayString } = require('../utils/dateUtils');

/** The ?date= query parameter, defaulting to today in the app time zone. */
const selectedDate = (req) => req.validated.query.date || todayString();

async function daily(req, res) {
  const report = await reportService.getDailyReport(req.user.id, selectedDate(req));
  return sendSuccess(res, { data: { report } });
}

async function monthToDate(req, res) {
  const report = await reportService.getMonthToDateReport(req.user.id, selectedDate(req));
  return sendSuccess(res, { data: { report } });
}

async function monthly(req, res) {
  const report = await reportService.getPreviousMonthReport(req.user.id, selectedDate(req));
  return sendSuccess(res, { data: { report } });
}

module.exports = { daily, monthToDate, monthly };
