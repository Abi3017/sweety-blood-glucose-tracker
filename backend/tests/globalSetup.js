const { execSync } = require('child_process');
const path = require('path');

/**
 * Runs once before the test suite: applies migrations to the isolated test
 * database (DATABASE_URL from .env.test, injected by `npm test`).
 */
module.exports = async () => {
  const url = process.env.DATABASE_URL || '';
  if (process.env.NODE_ENV !== 'test' || !/test/i.test(url)) {
    throw new Error(
      'Refusing to run tests: NODE_ENV must be "test" and DATABASE_URL must point to a database whose name contains "test". ' +
        'Create backend/.env.test (see README).',
    );
  }
  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'ignore',
    env: process.env,
  });
};
