/**
 * Venue CRM API — ES Module entry point (Render / production ready)
 */
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Load environment variables first (local .env + Render dashboard vars)
import { env, validateEnv } from './config/env.js';
import connectDB, { disconnectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

// Render sets PORT automatically — always prefer process.env.PORT
const PORT = Number(process.env.PORT) || env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// ─── Middleware ───────────────────────────────────────────────────────────────
const corsOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : true;

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Test / health routes (Render health checks) ──────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Venue CRM API is online',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  res.status(dbState === 1 ? 200 : 503).json({
    success: dbState === 1,
    message: 'Venue CRM API health check',
    database: dbStatus,
    uptime: process.uptime(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Server startup ───────────────────────────────────────────────────────────
let httpServer;

const startServer = async () => {
  if (!validateEnv()) {
    process.exit(1);
  }

  try {
    await connectDB();

    httpServer = app.listen(PORT, HOST, () => {
      console.log('✅ Server running successfully');
      console.log(`   URL: http://${HOST}:${PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Health: http://${HOST}:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// ─── Graceful shutdown (Render sends SIGTERM) ─────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  try {
    if (httpServer) {
      await new Promise((resolve) => httpServer.close(resolve));
    }
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Shutdown error:', err.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  if (env.NODE_ENV === 'production') {
    shutdown('unhandledRejection');
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
