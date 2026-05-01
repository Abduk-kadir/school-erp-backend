const saveError = require('../utils/saveError');

function globalError(err, req, res, _next) {
  const status = Number(err?.statusCode || err?.status) || 500;
  void saveError(err, req, { status_code: status }).catch((e) =>
    console.error('saveError failed:', e)
  )
  res.status(status).json({
    success: false,
    message: err?.message || 'Internal Server Error',
  });
  
}

module.exports = globalError;
