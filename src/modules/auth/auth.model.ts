import pool from '../../config/db';
import { Role } from '../../types';

// Full user row as stored in the database (includes the password hash).
export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
}

// A user safe to send in API responses — never includes the password.
export type SafeUser = Omit<UserRecord, 'password'>;

/** Finds a single user by email, or returns null if none exists. */
export const findUserByEmail = async (
  email: string,
): Promise<UserRecord | null> => {
  const result = await pool.query<UserRecord>(
    'SELECT * FROM users WHERE email = $1',
    [email],
  );
  return result.rows[0] ?? null;
};

/**
 * Inserts a new user and returns it WITHOUT the password column
 * (the RETURNING clause deliberately omits `password`).
 */
export const insertUser = async (
  name: string,
  email: string,
  hashedPassword: string,
  role: Role,
): Promise<SafeUser> => {
  const result = await pool.query<SafeUser>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role],
  );
  return result.rows[0];
};
