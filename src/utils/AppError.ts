/**
 * A custom error type that carries an HTTP status code.
 * Throw this anywhere in the app (e.g. `throw new AppError(404, 'Not found')`)
 * and the centralized error handler will turn it into a proper response.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: unknown;

  constructor(statusCode: number, message: string, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    // Required so `instanceof AppError` works when extending built-in Error
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
