const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { appointmentSchema, appointmentIdSchema } = require('../validations/appointmentValidation');

const router = express.Router();

// A malformed id can never match an appointment, so it is reported as "not found".
const validId = validate(appointmentIdSchema, 'params', { statusCode: 404, code: 'APPOINTMENT_NOT_FOUND' });

router.use(requireAuth);

router.route('/').get(appointmentController.listAppointments).post(validate(appointmentSchema), appointmentController.createAppointment);

router
  .route('/:id')
  .put(validId, validate(appointmentSchema), appointmentController.updateAppointment)
  .delete(validId, appointmentController.deleteAppointment);

module.exports = router;
