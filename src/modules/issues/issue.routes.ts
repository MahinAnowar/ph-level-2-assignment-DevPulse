import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { createIssue, getAllIssues, getIssueById } from './issue.controller';

const router = Router();

// POST /api/issues — authenticated (contributor or maintainer)
router.post('/', authenticate, createIssue);

// GET /api/issues — public
router.get('/', getAllIssues);

// GET /api/issues/:id — public
router.get('/:id', getIssueById);

export default router;
