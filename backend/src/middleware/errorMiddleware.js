const { Prisma } = require('@prisma/client');
const AppError = require('../utils/AppError');
const env = require('../config/env');

/** 404 for unknown API routes. */
function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, { code: 'NOT_FOUND' }));
}

/** Converts known library errors into user-facing AppErrors. */
function normalizeError(err) {
  if (err instanceof AppError) return err;

  // Malformed JSON body.
  if (err.type === 'entity.parse.failed') {
    return new AppError('Request body must be valid JSON.', 400, { code: 'INVALID_JSON' });
  }
  if (err.type === 'entity.too.large') {
    return new AppError('Request body is too large.', 413, { code: 'PAYLOAD_TOO_LARGE' });
  }

  // Database unreachable / not started.
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    (err instanceof Prisma.PrismaClientKnownRequestError && ['P1001', 'P1002', 'P1017'].includes(err.code))
  ) {
    return new AppError('The service is temporarily unavailable. Please try again shortly.', 503, {
      code: 'DATABASE_UNAVAILABLE',
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return new AppError('Record not found.', 404, { code: 'NOT_FOUND' });
  }

  return null;
}

/**
 * Centralized error handler. Unexpected errors are logged on the server and
 * reported to the client as a generic 500 – stack traces, SQL and connection
 * details never leave the server.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const appError = normalizeError(err);

  if (!appError || appError.statusCode >= 500) {
    if (!env.isTest || !appError) {
      // Log only the name/message/stack – never request bodies (they can hold passwords).
      console.error(`[error] ${req.method} ${req.originalUrl}:`, err.stack || err.message);
    }
  }

  const statusCode = appError ? appError.statusCode : 500;
  const error = {
    code: appError ? appError.code : 'INTERNAL_SERVER_ERROR',
    message: appError ? appError.message : 'Something went wrong on our side. Please try again later.',
  };
  if (appError && appError.details) error.details = appError.details;

  res.status(statusCode).json({ success: false, error });
}

module.exports = { notFound, errorHandler };
