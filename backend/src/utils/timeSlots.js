/** Time slots in the order they occur during the day. */
const TIME_SLOTS = ['MORNING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER'];

const TIME_SLOT_LABELS = {
  MORNING: 'Morning (fasting)',
  AFTER_BREAKFAST: 'After breakfast',
  AFTER_LUNCH: 'After lunch',
  AFTER_DINNER: 'After dinner',
};

/** e.g. "You already have an After lunch reading for this date." */
function duplicateSlotMessage(timeSlot) {
  const label = TIME_SLOT_LABELS[timeSlot] || timeSlot;
  const article = /^[aeiou]/i.test(label) ? 'an' : 'a';
  return `You already have ${article} ${label} reading for this date.`;
}

module.exports = { TIME_SLOTS, TIME_SLOT_LABELS, duplicateSlotMessage };
