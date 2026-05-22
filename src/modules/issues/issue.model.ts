import pool from '../../config/db';
import { IssueType, IssueStatus, Role } from '../../types';

// Full issue row as stored in the database.
export interface IssueRecord {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

// Minimal reporter info embedded in issue responses.
export interface ReporterInfo {
  id: number;
  name: string;
  role: Role;
}

// Filters/sorting accepted by the "get all issues" query.
export interface IssueQueryFilters {
  sort: 'newest' | 'oldest';
  type?: IssueType;
  status?: IssueStatus;
}

/** Inserts a new issue and returns the created row. */
export const insertIssue = async (
  title: string,
  description: string,
  type: IssueType,
  reporterId: number,
): Promise<IssueRecord> => {
  const result = await pool.query<IssueRecord>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporterId],
  );
  return result.rows[0];
};

/**
 * Returns all issues, optionally filtered by type/status and sorted
 * by creation date. Filter values are parameterized; the sort direction
 * is a fixed string chosen from a validated value (no SQL injection).
 */
export const findAllIssues = async (
  filters: IssueQueryFilters,
): Promise<IssueRecord[]> => {
  const conditions: string[] = [];
  const values: string[] = [];

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause =
    filters.sort === 'oldest'
      ? 'ORDER BY created_at ASC'
      : 'ORDER BY created_at DESC';

  const result = await pool.query<IssueRecord>(
    `SELECT * FROM issues ${whereClause} ${orderClause}`,
    values,
  );
  return result.rows;
};

/**
 * Fetches multiple reporters in a single batched query using `IN (...)`.
 * This is how we attach reporter details WITHOUT using a SQL JOIN.
 */
export const findReportersByIds = async (
  ids: number[],
): Promise<ReporterInfo[]> => {
  if (ids.length === 0) {
    return [];
  }
  const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');
  const result = await pool.query<ReporterInfo>(
    `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
    ids,
  );
  return result.rows;
};

/** Finds a single issue by id, or returns null if none exists. */
export const findIssueById = async (
  id: number,
): Promise<IssueRecord | null> => {
  const result = await pool.query<IssueRecord>(
    'SELECT * FROM issues WHERE id = $1',
    [id],
  );
  return result.rows[0] ?? null;
};

/** Finds a single reporter (user) by id, or returns null. */
export const findReporterById = async (
  id: number,
): Promise<ReporterInfo | null> => {
  const result = await pool.query<ReporterInfo>(
    'SELECT id, name, role FROM users WHERE id = $1',
    [id],
  );
  return result.rows[0] ?? null;
};

// Fields that may be changed by an update (all optional — PATCH semantics).
export interface IssueUpdateFields {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}

/**
 * Updates only the provided fields of an issue and returns the updated row.
 * The SET clause is built dynamically; column names come from a fixed
 * whitelist (set in the service) and all values are parameterized,
 * so this is safe from SQL injection.
 */
export const updateIssueById = async (
  id: number,
  fields: IssueUpdateFields,
): Promise<IssueRecord> => {
  const setClauses: string[] = [];
  const values: (string | number)[] = [];

  for (const [column, value] of Object.entries(fields)) {
    if (value !== undefined) {
      values.push(value);
      setClauses.push(`${column} = $${values.length}`);
    }
  }

  // The id goes last and is referenced by the WHERE clause.
  values.push(id);

  const result = await pool.query<IssueRecord>(
    `UPDATE issues SET ${setClauses.join(', ')}
     WHERE id = $${values.length}
     RETURNING *`,
    values,
  );
  return result.rows[0];
};

/** Deletes an issue by id. Returns true if a row was actually removed. */
export const deleteIssueById = async (id: number): Promise<boolean> => {
  const result = await pool.query('DELETE FROM issues WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
};
