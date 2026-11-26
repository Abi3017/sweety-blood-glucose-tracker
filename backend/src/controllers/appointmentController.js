const appointmentService = require('../services/appointmentService');
const { sendSuccess } = require('../utils/apiResponse');

async function listAppointments(req, res) {
  const appointments = await appointmentService.listAppointments(req.user.id);
  return sendSuccess(res, { data: { appointments } });
}

async function createAppointment(req, res) {
  const appointment = await appointmentService.createAppointment(req.user.id, req.validated.body);
  return sendSuccess(res, { statusCode: 201, message: 'Appointment saved.', data: { appointment } });
}

async function updateAppointment(req, res) {
  const appointment = await appointmentService.updateAppointment(req.user.id, req.validated.params.id, req.validated.body);
  return sendSuccess(res, { message: 'Appointment updated.', data: { appointment } });
}

async function deleteAppointment(req, res) {
  await appointmentService.deleteAppointment(req.user.id, req.validated.params.id);
  return sendSuccess(res, { message: 'Appointment deleted.' });
}

module.exports = { listAppointments, createAppointment, updateAppointment, deleteAppointment };
