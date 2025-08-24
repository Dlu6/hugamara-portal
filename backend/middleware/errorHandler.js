export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let error = 'Internal Server Error';

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    error = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate Entry';
    error = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`,
      value: e.value
    }));
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid Reference';
    error = `Referenced ${err.fields.join(', ')} does not exist`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
    error = 'The provided token is invalid';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token Expired';
    error = 'The provided token has expired';
  }

  // Custom validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    error = err.message;
  }

  // Custom authorization errors
  if (err.name === 'AuthorizationError') {
    statusCode = 403;
    message = 'Access Denied';
    error = err.message;
  }

  // Custom not found errors
  if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
    error = err.message;
  }

  // Rate limit errors
  if (err.status === 429) {
    statusCode = 429;
    message = 'Too Many Requests';
    error = 'Rate limit exceeded. Please try again later.';
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    message: error,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

// Custom error classes
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class BusinessLogicError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}