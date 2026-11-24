const env = require('./config/env');
const app = require('./app');
const prisma = require('./config/database');

async function start() {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('Could not connect to PostgreSQL. Check DATABASE_URL and that the database is running.');
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`Sweety API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down…`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
