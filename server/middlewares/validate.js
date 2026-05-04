const { z } = require('zod');
const { AppError } = require('../utils/errors');

function validate({ body, params, query }) {
  return (req, _res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (params) req.params = params.parse(req.params);
      if (query) req.query = query.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new AppError('VALIDATION_ERROR', '요청 값이 올바르지 않습니다.', 400, error.flatten()),
        );
      }
      return next(error);
    }
  };
}

module.exports = { validate };
