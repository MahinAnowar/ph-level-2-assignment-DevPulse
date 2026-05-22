import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../utils/AppError';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
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

/**
 * Validates login input, checks the password against the stored hash,
 * and returns a signed JWT together with the safe user object.
 */
export const loginUser = async (
  body: Record<string, unknown>,
): Promise<{ token: string; user: SafeUser }> => {
  const { email, password } = body;

  // ----- Validation -----
  if (!isNonEmptyString(email)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Email is required');
  }
  if (!isNonEmptyString(password)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Password is required');
  }

  // ----- Look up the user -----
  const user = await findUserByEmail(email.trim());
  if (!user) {
    // Same message whether the email or password is wrong (avoids leaking info)
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  // ----- Verify the password -----
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  // ----- Sign a JWT carrying id, name, and role -----
  const token = signToken({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  // Never send the password hash back to the client
  const { password: _password, ...safeUser } = user;

  return { token, user: safeUser };
};
