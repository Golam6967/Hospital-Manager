const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err.message, err.stack);

  const status = err.status || err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
