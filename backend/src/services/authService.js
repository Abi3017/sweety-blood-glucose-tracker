const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
const prisma = require('../config/database');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const messages = require('../utils/messages');

const SALT_ROUNDS = 12;
// Compared against when an email is unknown so that response time does not reveal
// whether an account exists.
const DUMMY_HASH = bcrypt.hashSync('sweety-timing-safe-dummy-password', SALT_ROUNDS);

/** Fields that are safe to return to the client (never the password hash). */
const publicUserSelect = { id: true, name: true, email: true, createdAt: true, updatedAt: true };

function signToken(userId) {
  return jwt.sign({}, env.jwtSecret, {
    subject: userId,
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  });
}

async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new AppError(messages.EMAIL_TAKEN, 409, {
      code: 'EMAIL_TAKEN',
      details: [{ field: 'email', message: messages.EMAIL_TAKEN }],
    });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: publicUserSelect,
    });
    return { user, token: signToken(user.id) };
  } catch (error) {
    // Two simultaneous sign-ups with the same email: the unique index wins.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(messages.EMAIL_TAKEN, 409, { code: 'EMAIL_TAKEN' });
    }
    throw error;
  }
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  if (!user || !passwordMatches) {
    throw new AppError(messages.INVALID_CREDENTIALS, 401, { code: 'INVALID_CREDENTIALS' });
  }

  const { password: _hash, ...publicUser } = user;
  return { user: publicUser, token: signToken(user.id) };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ...publicUserSelect, _count: { select: { readings: true } } },
  });
  if (!user) throw new AppError(messages.SESSION_INVALID, 401, { code: 'INVALID_TOKEN' });

  const { _count, ...profile } = user;
  return { ...profile, totalReadings: _count.readings };
}

module.exports = { register, login, getProfile, signToken, publicUserSelect };
