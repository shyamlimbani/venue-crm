import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const isProduction = process.env.NODE_ENV === 'production';

// Local: load .env file | Render: uses dashboard env vars (dotenv won't override them)
if (!isProduction) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn(`[env] No .env file at ${envPath} — using system environment variables`);
  }
} else {
  dotenv.config({ path: envPath });
}

const MONGO_URI = process.env.MONGO_URI?.trim() || process.env.MONGODB_URI?.trim();
const MONGO_URI_STANDARD = process.env.MONGO_URI_STANDARD?.trim();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  HOST: process.env.HOST || '0.0.0.0',
  MONGO_URI,
  MONGO_URI_STANDARD,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.CLIENT_URL || '*',
};

export function validateEnv() {
  const missing = [];

  if (!env.MONGO_URI) missing.push('MONGO_URI');
  if (!env.JWT_SECRET) missing.push('JWT_SECRET');

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    if (isProduction) {
      console.error('\n   → Add these in Render Dashboard → Environment\n');
    } else {
      console.error(`\n   → Add to backend/.env (see .env.example)\n`);
    }
    return false;
  }

  return true;
}
