/**
 * Shared domain types used across the application.
 */

// The two account roles defined in the assignment spec.
export type Role = 'contributor' | 'maintainer';

// Issue category.
export type IssueType = 'bug' | 'feature_request';

// Issue workflow state.
export type IssueStatus = 'open' | 'in_progress' | 'resolved';
