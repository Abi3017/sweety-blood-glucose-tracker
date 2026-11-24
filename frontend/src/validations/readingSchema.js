import { z } from 'zod';
import { MESSAGES } from '../utils/messages';
import { TIME_SLOTS } from '../utils/timeSlots';
import { isFutureISODate, isValidISODate } from '../utils/dates';

/**
 * Mirrors the backend rules. The glucose input is kept as a string so that an
 * empty field, decimals and non-numeric text can each get the right message.
 * Duplicate-slot and 4-per-day checks need the database and are reported by the API.
 */
export const readingSchema = z.object({
  readingDate: z
    .string()
    .min(1, MESSAGES.DATE_REQUIRED)
    .refine(isValidISODate, MESSAGES.DATE_INVALID)
    .refine((value) => !isFutureISODate(value), MESSAGES.FUTURE_DATE),
  timeSlot: z
    .string()
    .min(1, MESSAGES.SLOT_REQUIRED)
    .refine((value) => TIME_SLOTS.includes(value), MESSAGES.SLOT_REQUIRED),
  glucoseValue: z
    .union([z.string(), z.number()])
    .transform((value) => String(value ?? '').trim())
    .refine((value) => value !== '', MESSAGES.GLUCOSE_REQUIRED)
    .refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) >= 40 && Number(value) <= 600), MESSAGES.GLUCOSE_RANGE)
    .transform(Number),
});
