import { AuthPayload } from '../utils/jwt';

/**
 * Extends Express's Request type so that `req.user` is available
 * (and correctly typed) after the `authenticate` middleware runs.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
