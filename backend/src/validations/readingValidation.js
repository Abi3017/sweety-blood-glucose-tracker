const { z } = require('zod');
const messages = require('../utils/messages');
const { TIME_SLOTS } = require('../utils/timeSlots');
const { isValidDateString, isFutureDate } = require('../utils/dateUtils');

/**
 * Glucose value rules:
 *  - missing / null / empty string            -> "Please enter a glucose value."
 *  - non-numeric, decimal, < 40 or > 600      -> "Value must be between 40 and 600 mg/dl."
 * Numeric strings such as "120" are accepted (HTML inputs send strings); "120.5" or "12a" are not.
 */
const glucoseValue = z.any().transform((value, ctx) => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.GLUCOSE_REQUIRED });
    return z.NEVER;
  }

  let number = value;
  if (typeof value === 'string') {
    number = /^\s*-?\d+(\.\d+)?\s*$/.test(value) ? Number(value) : NaN;
  }

  if (typeof number !== 'number' || !Number.isInteger(number) || number < 40 || number > 600) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.GLUCOSE_RANGE });
    return z.NEVER;
  }
  return number;
});

/** A real calendar date in YYYY-MM-DD format. */
const dateString = (requiredMessage = messages.DATE_REQUIRED) =>
  z
    .string({ required_error: requiredMessage, invalid_type_error: messages.DATE_INVALID })
    .trim()
    .min(1, requiredMessage)
    .refine(isValidDateString, messages.DATE_INVALID);

/** Same as dateString but also rejects dates later than today. */
const pastOrTodayDate = (requiredMessage) =>
  dateString(requiredMessage).refine((value) => !isFutureDate(value), messages.FUTURE_DATE);

const timeSlot = z
  .string({ required_error: messages.SLOT_REQUIRED, invalid_type_error: messages.SLOT_INVALID })
  .min(1, messages.SLOT_REQUIRED)
  .refine((value) => TIME_SLOTS.includes(value), messages.SLOT_INVALID);

/** Used for both create (POST) and full update (PUT). Unknown fields such as userId are stripped. */
const readingSchema = z.object({
  readingDate: pastOrTodayDate(),
  timeSlot,
  glucoseValue,
});

const readingIdSchema = z.object({
  id: z.string().uuid(messages.READING_NOT_FOUND),
});

const positiveInt = (fallback, max) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((value, ctx) => {
      if (value === undefined || value === '') return fallback;
      const number = Number(value);
      if (!Number.isInteger(number) || number < 1 || (max && number > max)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: max ? `Must be a whole number between 1 and ${max}.` : 'Must be a positive whole number.',
        });
        return z.NEVER;
      }
      return number;
    });

const listReadingsQuerySchema = z
  .object({
    startDate: dateString().optional(),
    endDate: dateString().optional(),
    timeSlot: timeSlot.optional(),
    page: positiveInt(1),
    limit: positiveInt(20, 100),
  })
  .refine((q) => !q.startDate || !q.endDate || q.startDate <= q.endDate, {
    message: 'Start date must be on or before the end date.',
    path: ['startDate'],
  });

/** ?date=YYYY-MM-DD for reports. Optional: defaults to today. Cannot be in the future. */
const reportQuerySchema = z.object({
  date: pastOrTodayDate().optional(),
});

module.exports = {
  readingSchema,
  readingIdSchema,
  listReadingsQuerySchema,
  reportQuerySchema,
};
