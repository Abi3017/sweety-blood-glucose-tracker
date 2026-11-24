const { PrismaClient } = require('@prisma/client');
const env = require('./env');

// A single PrismaClient instance is shared by the whole application.
const prisma = new PrismaClient({
  log: env.isProduction || env.isTest ? ['error'] : ['warn', 'error'],
});

module.exports = prisma;
