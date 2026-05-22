import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AppError } from '../../utils/AppError';
import * as issueService from './issue.service';

/** POST /api/issues — create a new issue (authenticated users only). */
export const createIssue = catchAsync(async (req: Request, res: Response) => {
  // `authenticate` middleware guarantees req.user; this check satisfies TypeScript.
  if (!req.user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  const issue = await issueService.createIssue(req.body, req.user.id);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    message: 'Issue created successfully',
    data: issue,
  });
});

/** GET /api/issues — list all issues with optional filtering/sorting (public). */
export const getAllIssues = catchAsync(async (req: Request, res: Response) => {
  const issues = await issueService.getAllIssues(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    data: issues,
  });
});
