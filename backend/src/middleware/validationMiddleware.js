const AppError = require('../utils/AppError');

/**
 * Validates req[source] against a Zod schema and replaces it with the parsed
 * (trimmed / coerced) value. The first issue becomes the main error message;
 * all issues are returned as field-level `details`. `statusCode`/`code` can be
 * overridden, e.g. a malformed :id is reported as 404 rather than 400.
 */
function validate(schema, source = 'body', { statusCode = 400, code = 'VALIDATION_ERROR' } = {}) {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(new AppError(details[0].message, statusCode, { code, details }));
    }
    // Express 5 makes req.query a getter, so store parsed values separately.
    req.validated = { ...(req.validated || {}), [source]: result.data };
    return next();
  };
}

module.exports = { validate };
