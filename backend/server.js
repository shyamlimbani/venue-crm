import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env, validateEnv } from './config/env.js';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Venue CRM API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  if (!validateEnv()) {
    process.exit(1);
  }

  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`✅ Server running on port ${env.PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down...`);
  const { disconnectDB } = await import('./config/db.js');
  await disconnectDB();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
