import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';

const app: Application = express();

// ----- Global middleware -----
app.use(cors());
app.use(express.json());

// ----- Health check route -----
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'DevPulse API is running 🚀',
  });
});

// ----- API routes -----
app.use('/api/auth', authRoutes);

// ----- 404 handler for unknown routes (must come after all routes) -----
app.use(notFoundHandler);

// ----- Centralized error handler (must be the very last middleware) -----
app.use(errorHandler);

export default app;
