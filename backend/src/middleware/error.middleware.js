import { AppError } from '../utils/appError.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // Handle Prisma Known Errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const targetField = err.meta?.target?.[0] || 'field';
    message = `A record with this ${targetField} already exists.`;
    code = 'DUPLICATE_RECORD';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record was not found.';
    code = 'NOT_FOUND';
  }

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    console.error('💥 UNHANDLED ERROR:', err);
  }

  return res.status(statusCode).json({
    error: {
      message,
      code,
    },
  });
};
