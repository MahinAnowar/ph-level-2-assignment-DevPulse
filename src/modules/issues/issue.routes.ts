import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from './issue.controller';

const router = Router();

// POST /api/issues — authenticated (contributor or maintainer)
router.post('/', authenticate, createIssue);

// GET /api/issues — public
router.get('/', getAllIssues);

// GET /api/issues/:id — public
router.get('/:id', getIssueById);

// PATCH /api/issues/:id — authenticated
// (maintainer: any issue; contributor: own issue while status is open)
router.patch('/:id', authenticate, updateIssue);

// DELETE /api/issues/:id — maintainer only
router.delete('/:id', authenticate, authorize('maintainer'), deleteIssue);

export default router;
