class AppError extends Error {
  constructor(code, message, status = 500, details) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function isAppError(error) {
  return error instanceof AppError;
}

module.exports = { AppError, isAppError };
