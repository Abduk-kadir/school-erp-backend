const { errorlogs } = require('../models');

async function saveError(err, req, options = {}) {
  const statusCode =
    options.status_code != null
      ? options.status_code
      : err?.statusCode ?? err?.status ?? 500;
  const type = options.type != null
    ? String(options.type).slice(0, 50)
    : (err?.name && String(err.name).slice(0, 50)) || 'Error';

  let bodyStr = null;
  if (req?.body != null) {
    try {
      bodyStr =
        typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body);
    } catch {
      bodyStr = null;
    }
  }

  const urlRaw = (req?.originalUrl || req?.url || '').toString();
  const methodRaw = (req?.method || '').toString().slice(0, 10);

  await errorlogs.create({
    message: err?.message != null ? String(err.message) : null,
    stack: err?.stack != null ? String(err.stack) : null,
    url: urlRaw.slice(0, 255),
    method: methodRaw,
    body: bodyStr,
    status_code: statusCode,
    type: type,
  });
}

module.exports = saveError;
