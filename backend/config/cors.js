import cors from 'cors';
import { env } from './env.js';

/** Production frontend + local dev */
const DEFAULT_ORIGINS = [
  'https://venue-crm-ten.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const buildAllowedOrigins = () => {
  const fromEnv = (env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o && o !== '*');

  return [...new Set([...DEFAULT_ORIGINS, ...fromEnv])];
};

const allowedOrigins = buildAllowedOrigins();

/** Vercel preview deployments: venue-crm-xxx.vercel.app */
const isVercelPreview = (origin) =>
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Postman, server-to-server, mobile
  if (allowedOrigins.includes(origin)) return true;
  if (isVercelPreview(origin)) return true;
  return false;
};

export const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 204,
  maxAge: 86400,
};

export const corsMiddleware = cors(corsOptions);

/** Apply CORS to every route including preflight */
export const setupCors = (app) => {
  app.use(corsMiddleware);
  app.options('*', corsMiddleware);
};

export const logCorsConfig = () => {
  console.log('   CORS allowed origins:');
  allowedOrigins.forEach((o) => console.log(`     - ${o}`));
  console.log('     - https://*.vercel.app (preview deployments)');
};
