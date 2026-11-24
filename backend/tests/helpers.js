const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');
const { formatDate, todayString, toDbDate } = require('../src/utils/dateUtils');

const PASSWORD = 'Passw0rd!';

/** A supertest agent that keeps cookies and sends the CSRF header like the React app. */
function createAgent() {
  return request.agent(app).set('X-Requested-With', 'XMLHttpRequest');
}

function registerPayload(overrides = {}) {
  return {
    name: 'Asha Patient',
    email: 'asha@example.com',
    password: PASSWORD,
    confirmPassword: PASSWORD,
    ...overrides,
  };
}

/** Registers a user and returns a logged-in agent plus the user. */
async function loggedInAgent(overrides = {}) {
  const agent = createAgent();
  const res = await agent.post('/api/auth/register').send(registerPayload(overrides));
  if (res.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(res.body)}`);
  return { agent, user: res.body.data.user };
}

/** Inserts readings directly (bypassing the API) for report fixtures. */
async function insertReadings(userId, rows) {
  await prisma.reading.createMany({
    data: rows.map(([readingDate, timeSlot, glucoseValue]) => ({
      userId,
      readingDate: toDbDate(readingDate),
      timeSlot,
      glucoseValue,
    })),
  });
}

/** Today +/- n days as YYYY-MM-DD in the app time zone. */
function daysFromToday(n) {
  const date = toDbDate(todayString());
  date.setUTCDate(date.getUTCDate() + n);
  return formatDate(date);
}

module.exports = { PASSWORD, createAgent, registerPayload, loggedInAgent, insertReadings, daysFromToday, prisma };
