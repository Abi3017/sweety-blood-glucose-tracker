const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const messages = require('../utils/messages');

const MAX_APPOINTMENTS = 200;

/** Shapes a database row for the API (no userId). */
function toAppointmentDto(a) {
  return {
    id: a.id,
    doctor: a.doctor,
    specialty: a.specialty,
    date: a.date,
    time: a.time,
    location: a.location,
    notes: a.notes,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

const notFound = () => new AppError(messages.APPOINTMENT_NOT_FOUND, 404, { code: 'APPOINTMENT_NOT_FOUND' });

async function listAppointments(userId) {
  const rows = await prisma.appointment.findMany({ where: { userId }, orderBy: [{ date: 'asc' }, { time: 'asc' }] });
  return rows.map(toAppointmentDto);
}

async function createAppointment(userId, data) {
  const count = await prisma.appointment.count({ where: { userId } });
  if (count >= MAX_APPOINTMENTS) throw new AppError(messages.APPOINTMENT_LIMIT, 409, { code: 'APPOINTMENT_LIMIT_REACHED' });
  return toAppointmentDto(await prisma.appointment.create({ data: { ...data, userId } }));
}

async function updateAppointment(userId, id, data) {
  // updateMany scoped by userId: matches nothing if the appointment belongs to someone else.
  const { count } = await prisma.appointment.updateMany({ where: { id, userId }, data });
  if (count === 0) throw notFound();
  return toAppointmentDto(await prisma.appointment.findFirst({ where: { id, userId } }));
}

async function deleteAppointment(userId, id) {
  const { count } = await prisma.appointment.deleteMany({ where: { id, userId } });
  if (count === 0) throw notFound();
}

module.exports = { MAX_APPOINTMENTS, toAppointmentDto, listAppointments, createAppointment, updateAppointment, deleteAppointment };
