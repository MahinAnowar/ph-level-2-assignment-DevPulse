import { Router } from 'express';
import { signup } from './auth.controller';

const router = Router();

// POST /api/auth/signup — public
router.post('/signup', signup);

export default router;
