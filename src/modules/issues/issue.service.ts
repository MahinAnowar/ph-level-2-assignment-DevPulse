import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../utils/AppError';
import { isNonEmptyString } from '../../utils/validators';
import { IssueType, IssueStatus } from '../../types';
import {
  IssueRecord,
  ReporterInfo,
  insertIssue,
  findAllIssues,
  findIssueById,
  findReportersByIds,
  findReporterById,
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
 * Shapes a raw DB issue row + its reporter into the API response object.
 * Centralizing this keeps every issue response identical (DRY).
 */
const toIssueWithReporter = (
  issue: IssueRecord,
  reporter: ReporterInfo | null,
): IssueWithReporter => ({
  id: issue.id,
  title: issue.title,
  description: issue.description,
  type: issue.type,
  status: issue.status,
  reporter,
  created_at: issue.created_at,
  updated_at: issue.updated_at,
});

/** Parses and validates a route `:id` param into a positive integer. */
const parseIssueId = (idParam: string): number => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid issue ID');
  }
  return id;
};

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
  return issues.map((issue) =>
    toIssueWithReporter(issue, reporterMap.get(issue.reporter_id) ?? null),
  );
};

/**
 * Returns a single issue (with its reporter) by id.
 * Throws 400 for an invalid id and 404 when the issue does not exist.
 */
export const getIssueById = async (
  idParam: string,
): Promise<IssueWithReporter> => {
  const id = parseIssueId(idParam);

  const issue = await findIssueById(id);
  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Issue not found');
  }

  const reporter = await findReporterById(issue.reporter_id);
  return toIssueWithReporter(issue, reporter);
};
