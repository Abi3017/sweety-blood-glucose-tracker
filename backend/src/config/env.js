const path = require('path');
const dotenv = require('dotenv');

// Load backend/.env unless variables were already injected (e.g. by dotenv-cli for tests).
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  appTimezone: process.env.APP_TIMEZONE || 'Asia/Kolkata',
  authCookieName: 'sweety_token',
  // Secure cookies by default in production; COOKIE_SECURE=false allows plain-HTTP local Docker runs.
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : nodeEnv === 'production',
};
