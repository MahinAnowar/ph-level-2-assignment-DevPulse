import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Role } from '../types';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const JWT_SECRET: Secret = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ??
  '7d') as SignOptions['expiresIn'];

/**
 * The data we embed inside every JWT. Per the spec hint, the token
 * carries the user's id, name, and role so later requests can identify
 * the requester and enforce permissions without another DB lookup.
 */
export interface AuthPayload {
  id: number;
  name: string;
  role: Role;
}

/** Creates a signed JWT for the given user payload. */
export const signToken = (payload: AuthPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
};

/** Verifies a JWT and returns the decoded payload. Throws if invalid/expired. */
export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, JWT_SECRET) as unknown as AuthPayload;
};
