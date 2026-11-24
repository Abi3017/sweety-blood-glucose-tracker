/** Consistent success envelope: { success: true, message?, data, meta? } */
function sendSuccess(res, { statusCode = 200, message, data = null, meta } = {}) {
  const body = { success: true };
  if (message) body.message = message;
  body.data = data;
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
