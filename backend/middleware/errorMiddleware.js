const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors = [];

  // Mongoose bad objectId
  if (err.name === 'CastError') {
    message = 'Resource not found or invalid ID format';
    statusCode = 404;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    message = 'Data validation failed';
    statusCode = 400;
    errors = Object.values(err.errors).map(val => val.message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
