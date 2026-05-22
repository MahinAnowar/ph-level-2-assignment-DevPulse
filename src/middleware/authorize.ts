import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

/**
 * Restricts a route to specific roles. Use after `authenticate`, e.g.:
 *   router.delete('/:id', authenticate, authorize('maintainer'), handler)
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'Authentication required',
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'You do not have permission to perform this action',
      );
    }

    next();
  };
};
