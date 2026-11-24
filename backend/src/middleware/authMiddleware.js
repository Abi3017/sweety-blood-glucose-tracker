const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const messages = require('../utils/messages');

/** Reads the JWT from the HttpOnly cookie, or from an Authorization: Bearer header (API clients such as Postman). */
function extractToken(req) {
  if (req.cookies && req.cookies[env.authCookieName]) return req.cookies[env.authCookieName];
  const header = req.get('Authorization');
  if (header && header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/**
 * Protects private routes. The user id always comes from the verified token –
 * never from the URL or request body – and is exposed as req.user.
 */
async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return next(new AppError(messages.AUTH_REQUIRED, 401, { code: 'UNAUTHORIZED' }));
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(messages.SESSION_EXPIRED, 401, { code: 'TOKEN_EXPIRED' }));
    }
    return next(new AppError(messages.SESSION_INVALID, 401, { code: 'INVALID_TOKEN' }));
  }

  // Make sure the account still exists (it may have been deleted after the token was issued).
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true },
  });
  if (!user) {
    return next(new AppError(messages.SESSION_INVALID, 401, { code: 'INVALID_TOKEN' }));
  }

  req.user = user;
  return next();
}

module.exports = { requireAuth, extractToken };
