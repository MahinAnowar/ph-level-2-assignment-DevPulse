import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { registerUser } from './auth.service';

/** POST /api/auth/signup — register a new user account. */
export const signup = catchAsync(async (req: Request, res: Response) => {
  const user = await registerUser(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    message: 'User registered successfully',
    data: user,
  });
});
