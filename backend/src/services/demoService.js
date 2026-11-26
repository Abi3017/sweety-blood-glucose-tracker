const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const messages = require('../utils/messages');
const { toDbDate, formatDate, todayString } = require('../utils/dateUtils');

// Typical sample ranges per slot (mg/dL). Illustrative only, not medical data.
const SLOT_RANGES = {
  MORNING: [85, 130],
  AFTER_BREAKFAST: [120, 190],
  AFTER_LUNCH: [125, 210],
  AFTER_DINNER: [115, 195],
};
const DAYS = 28;

function addDays(dateString, days) {
  const d = toDbDate(dateString);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDate(d);
}

/**
 * Fills an account that has no readings with about four weeks of sample readings (some slots
 * skipped, like real life) plus one past and one upcoming appointment. Refuses if the account
 * already has readings so real data is never mixed with samples.
 */
async function addSampleData(userId, random = Math.random) {
  if ((await prisma.reading.count({ where: { userId } })) > 0) {
    throw new AppError(messages.SAMPLE_DATA_EXISTS, 409, { code: 'SAMPLE_DATA_EXISTS' });
  }

  const today = todayString();
  const readings = [];
  for (let offset = DAYS; offset >= 0; offset -= 1) {
    const day = addDays(today, -offset);
    for (const [slot, [min, max]] of Object.entries(SLOT_RANGES)) {
      const isToday = offset === 0;
      if (isToday && (slot === 'AFTER_LUNCH' || slot === 'AFTER_DINNER')) continue; // leave today's later slots open
      if (!isToday && random() < 0.15) continue;
      readings.push({ userId, readingDate: toDbDate(day), timeSlot: slot, glucoseValue: Math.round(min + random() * (max - min)) });
    }
  }
  await prisma.reading.createMany({ data: readings });

  const appointments = [
    { userId, doctor: 'Dr. Meera Rao', specialty: 'Endocrinologist', date: addDays(today, 3), time: '16:30', location: 'City Care Hospital', notes: 'Bring this month’s readings.' },
    { userId, doctor: 'Dr. Arun Kumar', specialty: 'General physician', date: addDays(today, -12), time: '10:00', location: 'Green Valley Clinic', notes: '' },
  ];
  const hasAppointments = (await prisma.appointment.count({ where: { userId } })) > 0;
  if (!hasAppointments) await prisma.appointment.createMany({ data: appointments });

  return { readings: readings.length, appointments: hasAppointments ? 0 : appointments.length };
}

module.exports = { addSampleData };
