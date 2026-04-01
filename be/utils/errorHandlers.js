function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'fail',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Validation errors from express-validator often come as arrays
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    errors: err.errors || undefined,
  });
}

module.exports = { notFoundHandler, errorHandler };

