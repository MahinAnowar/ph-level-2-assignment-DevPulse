import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../utils/AppError';
import { hashPassword } from '../../utils/password';
import { isNonEmptyString, isValidEmail } from '../../utils/validators';
import { Role } from '../../types';
import { findUserByEmail, insertUser, SafeUser } from './auth.model';

/**
 * Validates registration input, ensures the email is unique,
 * hashes the password, and creates the user.
 */
export const registerUser = async (
  body: Record<string, unknown>,
): Promise<SafeUser> => {
  const { name, email, password, role } = body;

  // ----- Validation -----
  if (!isNonEmptyString(name)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Name is required');
  }
  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'A valid email is required');
  }
  if (!isNonEmptyString(password)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Password is required');
  }

  // role is optional and defaults to 'contributor'
  let finalRole: Role = 'contributor';
  if (role !== undefined) {
    if (role !== 'contributor' && role !== 'maintainer') {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Role must be either 'contributor' or 'maintainer'",
      );
    }
    finalRole = role;
  }

  // ----- Ensure email is not already taken -----
  const existingUser = await findUserByEmail(email.trim());
  if (existingUser) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Email is already registered',
    );
  }

  // ----- Hash the password and store the user -----
  const hashedPassword = await hashPassword(password);
  const newUser = await insertUser(
    name.trim(),
    email.trim(),
    hashedPassword,
    finalRole,
  );

  return newUser;
};
