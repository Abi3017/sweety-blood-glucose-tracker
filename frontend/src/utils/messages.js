/** Validation messages shared with the backend so both sides say the same thing. */
export const MESSAGES = {
  GLUCOSE_REQUIRED: 'Please enter a glucose value.',
  GLUCOSE_RANGE: 'Value must be between 40 and 600 mg/dl.',
  DAILY_LIMIT: 'You can add only 4 readings per day.',
  FUTURE_DATE: 'Date cannot be in the future.',
  DATE_REQUIRED: 'Please select a date.',
  DATE_INVALID: 'Please enter a valid date.',
  SLOT_REQUIRED: 'Please select a time slot.',
};

export const MAX_READINGS_PER_DAY = 4;
