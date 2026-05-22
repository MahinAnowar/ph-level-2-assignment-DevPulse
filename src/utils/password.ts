import bcrypt from 'bcrypt';

// Salt rounds must be between 8 and 12 per the assignment spec.
const SALT_ROUNDS = 10;

/** Hashes a plain-text password before storing it in the database. */
export const hashPassword = (plain: string): Promise<string> => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

/** Compares a plain-text password against a stored bcrypt hash. */
export const comparePassword = (
  plain: string,
  hashed: string,
): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};
