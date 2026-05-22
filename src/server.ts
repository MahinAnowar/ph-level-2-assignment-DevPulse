import dotenv from 'dotenv';
import app from './app';
import initDb from './config/initDb';

// Load environment variables from .env
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Make sure the database tables exist before accepting requests
    await initDb();

    app.listen(PORT, () => {
      console.log(`✅ DevPulse server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
