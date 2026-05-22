import express, { Application, Request, Response } from 'express';
import cors from 'cors';

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

export default app;
