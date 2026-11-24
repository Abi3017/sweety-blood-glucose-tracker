/**
 * Seeds a demo account with sample readings covering the previous two months
 * and the current month up to today, so every report has data to show.
 *
 * Values are illustrative sample data only – not medical data.
 *
 * Demo login: demo@sweety.app / Demo@1234
 * Re-running the seed resets the demo user's readings.
 */
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ quiet: true });

const prisma = new PrismaClient();

const DEMO_USER = { name: 'Demo Patient', email: 'demo@sweety.app', password: 'Demo@1234' };
const TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Kolkata';

// Typical sample ranges per slot (mg/dL).
const SLOT_RANGES = {
  MORNING: [85, 130],
  AFTER_BREAKFAST: [120, 190],
  AFTER_LUNCH: [125, 210],
  AFTER_DINNER: [115, 195],
};

// Small deterministic pseudo-random generator so the seed is repeatable.
function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function todayInTimezone() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());
}

async function main() {
  const random = createRandom(20261015);
  const hashedPassword = await bcrypt.hash(DEMO_USER.password, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: { name: DEMO_USER.name, password: hashedPassword },
    create: { name: DEMO_USER.name, email: DEMO_USER.email, password: hashedPassword },
  });

  await prisma.reading.deleteMany({ where: { userId: user.id } });

  const today = new Date(`${todayInTimezone()}T00:00:00.000Z`);
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 2, 1));

  const readings = [];
  for (let day = new Date(start); day <= today; day.setUTCDate(day.getUTCDate() + 1)) {
    const isToday = day.getTime() === today.getTime();
    for (const [slot, [min, max]] of Object.entries(SLOT_RANGES)) {
      if (isToday) {
        // Only the first two slots today, so the dashboard shows missing slots.
        if (slot === 'AFTER_LUNCH' || slot === 'AFTER_DINNER') continue;
      } else if (random() < 0.18) {
        continue; // some readings are skipped, like real life
      }
      readings.push({
        userId: user.id,
        readingDate: new Date(day),
        timeSlot: slot,
        glucoseValue: Math.round(min + random() * (max - min)),
      });
    }
  }

  await prisma.reading.createMany({ data: readings });

  console.log(`Seeded ${readings.length} readings for ${DEMO_USER.email} (password: ${DEMO_USER.password}).`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
