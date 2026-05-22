// Vercel serverless entry point.
//
// Vercel runs each file inside the /api folder as a serverless function.
// Exporting the Express app here lets the entire API run on Vercel
// without calling app.listen() (which is only used for local development
// in src/server.ts).
import app from '../src/app';

export default app;
