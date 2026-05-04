const { isAppError } = require('../utils/errors');

function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: '요청한 경로를 찾을 수 없습니다.',
      requestId: req.requestId,
    },
  });
}

function errorHandler(err, req, res, _next) {
  if (res.headersSent) return;

  if (isAppError(err)) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId: req.requestId,
      },
    });
  }

  console.error('[UNHANDLED ERROR]', {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    message: err?.message,
  });

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '서버 오류가 발생했습니다.',
      requestId: req.requestId,
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
