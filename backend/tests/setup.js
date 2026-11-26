const prisma = require('../src/config/database');

// Every test starts from an empty database.
beforeEach(async () => {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "appointments", "readings", "users" CASCADE');
});

afterAll(async () => {
  await prisma.$disconnect();
});
