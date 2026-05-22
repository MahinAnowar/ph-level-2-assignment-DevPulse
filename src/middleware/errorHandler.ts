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

    // Some framework/library errors carry their own HTTP status code —
    // e.g. a malformed JSON request body rejected by express.json().
    const httpError = err as {
      status?: unknown;
      statusCode?: unknown;
      type?: unknown;
    };
    if (typeof httpError.statusCode === 'number') {
      statusCode = httpError.statusCode;
    } else if (typeof httpError.status === 'number') {
      statusCode = httpError.status;
    }
    if (httpError.type === 'entity.parse.failed') {
      message = 'Invalid JSON in request body';
      errors = 'Invalid JSON in request body';
    }
  }

  // Log full error server-side for debugging (never sent to the client)
  console.error('❌ Error:', err);

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
