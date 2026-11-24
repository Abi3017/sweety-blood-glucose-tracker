const { Prisma } = require('@prisma/client');
const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const messages = require('../utils/messages');
const { duplicateSlotMessage } = require('../utils/timeSlots');
const { toDbDate, formatDate } = require('../utils/dateUtils');

const MAX_READINGS_PER_DAY = 4;

/** Shapes a database row for the API (date as YYYY-MM-DD, no userId). */
function toReadingDto(reading) {
  return {
    id: reading.id,
    readingDate: formatDate(reading.readingDate),
    timeSlot: reading.timeSlot,
    glucoseValue: reading.glucoseValue,
    createdAt: reading.createdAt,
    updatedAt: reading.updatedAt,
  };
}

function duplicateSlotError(timeSlot) {
  const message = duplicateSlotMessage(timeSlot);
  return new AppError(message, 409, { code: 'DUPLICATE_TIME_SLOT', details: [{ field: 'timeSlot', message }] });
}

function dailyLimitError() {
  return new AppError(messages.DAILY_LIMIT, 409, {
    code: 'DAILY_LIMIT_REACHED',
    details: [{ field: 'readingDate', message: messages.DAILY_LIMIT }],
  });
}

/**
 * Checks the per-day rules inside a transaction for the final date and slot.
 * `excludeId` is the reading being edited, so it is not counted against itself.
 *
 * The daily limit is checked before the duplicate-slot rule so that a fifth
 * reading always gets the "only 4 readings" message.
 */
async function assertDayRules(tx, { userId, readingDate, timeSlot, excludeId }) {
  // Serialize writes for this user + date. Concurrent requests for the same day wait
  // here until the first transaction commits, so the count below is always accurate.
  const lockKey = `${userId}:${formatDate(readingDate)}`;
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))::text AS locked`;

  const notThisReading = excludeId ? { id: { not: excludeId } } : {};

  const readingsThatDay = await tx.reading.count({
    where: { userId, readingDate, ...notThisReading },
  });
  if (readingsThatDay >= MAX_READINGS_PER_DAY) throw dailyLimitError();

  const sameSlot = await tx.reading.findFirst({
    where: { userId, readingDate, timeSlot, ...notThisReading },
    select: { id: true },
  });
  if (sameSlot) throw duplicateSlotError(timeSlot);
}

/** The unique index is the final safety net; translate its error into the friendly message. */
function translateUniqueViolation(error, timeSlot) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return duplicateSlotError(timeSlot);
  }
  return error;
}

async function createReading(userId, { readingDate, timeSlot, glucoseValue }) {
  const date = toDbDate(readingDate);
  try {
    const reading = await prisma.$transaction(async (tx) => {
      await assertDayRules(tx, { userId, readingDate: date, timeSlot });
      return tx.reading.create({ data: { userId, readingDate: date, timeSlot, glucoseValue } });
    });
    return toReadingDto(reading);
  } catch (error) {
    throw translateUniqueViolation(error, timeSlot);
  }
}

/** Finds a reading only if it belongs to the user; otherwise 404 (existence is not revealed). */
async function findOwnedReading(client, userId, id) {
  const reading = await client.reading.findFirst({ where: { id, userId } });
  if (!reading) throw new AppError(messages.READING_NOT_FOUND, 404, { code: 'READING_NOT_FOUND' });
  return reading;
}

async function getReading(userId, id) {
  return toReadingDto(await findOwnedReading(prisma, userId, id));
}

async function listReadings(userId, { startDate, endDate, timeSlot, page, limit }) {
  const where = { userId };
  if (startDate || endDate) {
    where.readingDate = {};
    if (startDate) where.readingDate.gte = toDbDate(startDate);
    if (endDate) where.readingDate.lte = toDbDate(endDate);
  }
  if (timeSlot) where.timeSlot = timeSlot;

  const [total, readings] = await prisma.$transaction([
    prisma.reading.count({ where }),
    prisma.reading.findMany({
      where,
      // Newest date first; within a day, slots in chronological order (enum order).
      orderBy: [{ readingDate: 'desc' }, { timeSlot: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    readings: readings.map(toReadingDto),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

async function updateReading(userId, id, { readingDate, timeSlot, glucoseValue }) {
  const date = toDbDate(readingDate);
  try {
    const reading = await prisma.$transaction(async (tx) => {
      await findOwnedReading(tx, userId, id);
      await assertDayRules(tx, { userId, readingDate: date, timeSlot, excludeId: id });
      return tx.reading.update({ where: { id }, data: { readingDate: date, timeSlot, glucoseValue } });
    });
    return toReadingDto(reading);
  } catch (error) {
    throw translateUniqueViolation(error, timeSlot);
  }
}

async function deleteReading(userId, id) {
  // deleteMany scoped by userId: deletes nothing if the reading belongs to someone else.
  const { count } = await prisma.reading.deleteMany({ where: { id, userId } });
  if (count === 0) throw new AppError(messages.READING_NOT_FOUND, 404, { code: 'READING_NOT_FOUND' });
}

module.exports = {
  MAX_READINGS_PER_DAY,
  toReadingDto,
  createReading,
  getReading,
  listReadings,
  updateReading,
  deleteReading,
};
