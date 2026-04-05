import 'dotenv/config'; // must be first — loads .env before any other module reads process.env

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';

import feedbackRoutes from './routes/feedback.routes';
import authRoutes from './routes/auth.routes';

const app = express();

// Security & middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (_req, res) =>
  res.json({
    success: true,
    data: { status: 'OK' },
    error: null,
    message: 'Running',
  })
);

// Config
const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/feedpulse';

// Only connect and listen when run directly (not when imported by tests)
if (require.main === module) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
      );
    })
    .catch((err) => {
      console.error('MongoDB error:', err);
      process.exit(1);
    });
}

export default app;