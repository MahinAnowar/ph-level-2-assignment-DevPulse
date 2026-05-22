import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';

/**
 * Handles requests to routes that do not exist (404).
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errors: 'The requested endpoint does not exist',
  });
};

/**
 * Centralized error handler. Express identifies this as an error handler
 * because it declares four parameters. Every error thrown in the app
 * (sync or async, via catchAsync) ends up here and gets a consistent shape.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // `next` is unused but required so Express treats this as an error handler
  _next: NextFunction,
): void => {
  let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let errors: unknown = 'Internal server error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors ?? err.message;
  } else if (err instanceof Error) {
    message = err.message;
    errors = err.message;
  }

  // Log full error server-side for debugging (never sent to the client)
  console.error('❌ Error:', err);

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
