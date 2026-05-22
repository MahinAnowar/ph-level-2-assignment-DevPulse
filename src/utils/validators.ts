// Basic email shape check: something@something.something
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns true when the value is a non-empty (non-whitespace) string. */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/** Returns true when the string looks like a valid email address. */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};
