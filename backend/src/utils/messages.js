/** User-facing validation messages, shared by validation schemas and services. */
module.exports = {
  GLUCOSE_REQUIRED: 'Please enter a glucose value.',
  GLUCOSE_RANGE: 'Value must be between 40 and 600 mg/dl.',
  DAILY_LIMIT: 'You can add only 4 readings per day.',
  FUTURE_DATE: 'Date cannot be in the future.',
  DATE_REQUIRED: 'Please select a date.',
  DATE_INVALID: 'Please enter a valid date (YYYY-MM-DD).',
  SLOT_REQUIRED: 'Please select a time slot.',
  SLOT_INVALID: 'Please select a valid time slot.',
  READING_NOT_FOUND: 'Reading not found.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_TAKEN: 'An account with this email already exists.',
  AUTH_REQUIRED: 'Please log in to continue.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  SESSION_INVALID: 'Your session is invalid. Please log in again.',
};
