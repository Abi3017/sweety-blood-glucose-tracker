/**
 * An expected, user-facing error. The centralized error handler sends
 * `message` (and optional field `details`) to the client with `statusCode`.
 */
class AppError extends Error {
  constructor(message, statusCode = 400, { code = 'BAD_REQUEST', details } = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

module.exports = AppError;
