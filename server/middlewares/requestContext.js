const { randomUUID } = require('crypto');

function requestContext(req, res, next) {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const startedAt = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `[REQ] id=${requestId} method=${req.method} path=${req.originalUrl} status=${res.statusCode} durationMs=${durationMs}`,
    );
  });

  next();
}

module.exports = { requestContext };
