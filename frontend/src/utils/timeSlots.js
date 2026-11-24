/** Time slots in chronological order, matching the backend enum. */
export const TIME_SLOTS = ['MORNING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER'];

export const TIME_SLOT_LABELS = {
  MORNING: 'Morning (Fasting)',
  AFTER_BREAKFAST: 'After Breakfast',
  AFTER_LUNCH: 'After Lunch',
  AFTER_DINNER: 'After Dinner',
};

export const TIME_SLOT_SHORT = {
  MORNING: 'Morning',
  AFTER_BREAKFAST: 'Breakfast',
  AFTER_LUNCH: 'Lunch',
  AFTER_DINNER: 'Dinner',
};

/** Chart colours per slot (validated categorical order: blue, orange, aqua, yellow). */
export const TIME_SLOT_COLORS = {
  MORNING: '#2a78d6',
  AFTER_BREAKFAST: '#eb6834',
  AFTER_LUNCH: '#1baf7a',
  AFTER_DINNER: '#eda100',
};

export const TIME_SLOT_OPTIONS = TIME_SLOTS.map((value) => ({ value, label: TIME_SLOT_LABELS[value] }));
