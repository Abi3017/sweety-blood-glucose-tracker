const { z } = require('zod');
const messages = require('../utils/messages');
const { isValidDateString } = require('../utils/dateUtils');

const optionalText = (max, label) =>
  z
    .string({ invalid_type_error: `${label} must be text.` })
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .optional()
    .default('');

/** Used for both create (POST) and full update (PUT). Unknown fields such as userId are stripped. */
const appointmentSchema = z.object({
  doctor: z
    .string({ required_error: messages.DOCTOR_REQUIRED, invalid_type_error: messages.DOCTOR_REQUIRED })
    .trim()
    .min(1, messages.DOCTOR_REQUIRED)
    .max(80, 'Doctor name must be 80 characters or fewer.'),
  specialty: optionalText(60, 'Specialty'),
  date: z
    .string({ required_error: messages.DATE_REQUIRED, invalid_type_error: messages.DATE_INVALID })
    .trim()
    .min(1, messages.DATE_REQUIRED)
    .refine(isValidDateString, messages.DATE_INVALID),
  time: z
    .string({ required_error: messages.TIME_INVALID, invalid_type_error: messages.TIME_INVALID })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, messages.TIME_INVALID),
  location: optionalText(120, 'Location'),
  notes: optionalText(500, 'Notes'),
});

const appointmentIdSchema = z.object({
  id: z.string().uuid(messages.APPOINTMENT_NOT_FOUND),
});

module.exports = { appointmentSchema, appointmentIdSchema };
