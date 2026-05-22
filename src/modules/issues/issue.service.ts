import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../utils/AppError';
import { isNonEmptyString } from '../../utils/validators';
import { IssueType, IssueStatus } from '../../types';
import {
  IssueRecord,
  ReporterInfo,
  insertIssue,
  findAllIssues,
  findReportersByIds,
} from './issue.model';

// An issue with the reporter expanded into an object (replaces reporter_id).
export interface IssueWithReporter {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter: ReporterInfo | null;
  created_at: Date;
  updated_at: Date;
}

const TITLE_MAX_LENGTH = 150;
const DESCRIPTION_MIN_LENGTH = 20;

/**
 * Validates issue input and creates a new issue.
 * The reporter is taken from the authenticated user, never the body.
 */
export const createIssue = async (
  body: Record<string, unknown>,
  reporterId: number,
): Promise<IssueRecord> => {
  const { title, description, type } = body;

  if (!isNonEmptyString(title)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Title is required');
  }
  if (title.trim().length > TITLE_MAX_LENGTH) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Title must not exceed ${TITLE_MAX_LENGTH} characters`,
    );
  }
  if (!isNonEmptyString(description)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Description is required');
  }
  if (description.trim().length < DESCRIPTION_MIN_LENGTH) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`,
    );
  }
  if (type !== 'bug' && type !== 'feature_request') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Type must be either 'bug' or 'feature_request'",
    );
  }

  return insertIssue(title.trim(), description.trim(), type, reporterId);
};

/**
 * Returns all issues (with optional filtering/sorting), each enriched
 * with its reporter's details fetched via a separate batched query.
 */
export const getAllIssues = async (
  query: Record<string, unknown>,
): Promise<IssueWithReporter[]> => {
  const { sort, type, status } = query;

  // ----- Validate query params -----
  let sortOrder: 'newest' | 'oldest' = 'newest';
  if (sort !== undefined) {
    if (sort !== 'newest' && sort !== 'oldest') {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "sort must be either 'newest' or 'oldest'",
      );
    }
    sortOrder = sort;
  }

  let typeFilter: IssueType | undefined;
  if (type !== undefined) {
    if (type !== 'bug' && type !== 'feature_request') {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "type must be either 'bug' or 'feature_request'",
      );
    }
    typeFilter = type;
  }

  let statusFilter: IssueStatus | undefined;
  if (status !== undefined) {
    if (
      status !== 'open' &&
      status !== 'in_progress' &&
      status !== 'resolved'
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "status must be one of 'open', 'in_progress', or 'resolved'",
      );
    }
    statusFilter = status;
  }

  // ----- Fetch issues -----
  const issues = await findAllIssues({
    sort: sortOrder,
    type: typeFilter,
    status: statusFilter,
  });

  // ----- Fetch all reporters in ONE batched query (no JOIN) -----
  const uniqueReporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  const reporters = await findReportersByIds(uniqueReporterIds);
  const reporterMap = new Map(reporters.map((r) => [r.id, r]));

  // ----- Replace reporter_id with the full reporter object -----
  // Fields are listed explicitly to match the spec's response shape.
  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap.get(issue.reporter_id) ?? null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));
};
