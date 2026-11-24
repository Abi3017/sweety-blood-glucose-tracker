const readingService = require('../services/readingService');
const { sendSuccess } = require('../utils/apiResponse');

async function createReading(req, res) {
  const reading = await readingService.createReading(req.user.id, req.validated.body);
  return sendSuccess(res, { statusCode: 201, message: 'Reading saved.', data: { reading } });
}

async function listReadings(req, res) {
  const { readings, meta } = await readingService.listReadings(req.user.id, req.validated.query);
  return sendSuccess(res, { data: { readings }, meta });
}

async function getReading(req, res) {
  const reading = await readingService.getReading(req.user.id, req.validated.params.id);
  return sendSuccess(res, { data: { reading } });
}

async function updateReading(req, res) {
  const reading = await readingService.updateReading(req.user.id, req.validated.params.id, req.validated.body);
  return sendSuccess(res, { message: 'Reading updated.', data: { reading } });
}

async function deleteReading(req, res) {
  await readingService.deleteReading(req.user.id, req.validated.params.id);
  return sendSuccess(res, { message: 'Reading deleted.' });
}

module.exports = { createReading, listReadings, getReading, updateReading, deleteReading };
