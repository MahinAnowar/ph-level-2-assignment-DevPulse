import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

/**
 * Protects a route: verifies the JWT from the Authorization header
 * and attaches the decoded user to `req.user`.
 *
 * Per the spec the header is `Authorization: <token>` (raw token).
 * We also tolerate an optional "Bearer " prefix for convenience.
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Authentication required: no token provided',
    );
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Invalid or expired token',
    );
  }
};
