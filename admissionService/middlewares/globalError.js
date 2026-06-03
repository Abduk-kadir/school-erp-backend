const saveError = require('../utils/saveError');

function globalError(err, req, res, _next) {
  if (err?.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: `Unexpected file field "${err.field}"`,
    });
  }

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
