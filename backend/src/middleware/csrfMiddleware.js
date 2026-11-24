const AppError = require('../utils/AppError');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF protection for cookie-based auth (defence in depth on top of SameSite=Strict).
 * State-changing requests must carry `X-Requested-With: XMLHttpRequest`. Browsers
 * do not let other sites add custom headers to cross-site form posts, and the CORS
 * policy rejects preflights from origins other than CLIENT_URL.
 */
function requireCsrfHeader(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.get('X-Requested-With') === 'XMLHttpRequest') return next();
  return next(new AppError('Missing or invalid CSRF header.', 403, { code: 'CSRF_REJECTED' }));
}

module.exports = { requireCsrfHeader };
