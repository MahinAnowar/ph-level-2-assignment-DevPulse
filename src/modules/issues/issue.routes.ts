import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { createIssue, getAllIssues } from './issue.controller';

const router = Router();

// POST /api/issues — authenticated (contributor or maintainer)
router.post('/', authenticate, createIssue);

// GET /api/issues — public
router.get('/', getAllIssues);

export default router;
