import mongoose from 'mongoose';
import { env } from './env.js';
import { getConnectionUris } from './mongoUri.js';

mongoose.set('strictQuery', true);

const connectOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
};

const isDnsSrvError = (err) =>
  err.message?.includes('querySrv') ||
  err.message?.includes('ECONNREFUSED') ||
  err.message?.includes('ENOTFOUND');

const connectDB = async () => {
  const primaryUri = env.MONGO_URI;

  if (!primaryUri || typeof primaryUri !== 'string') {
    throw new Error(
      'MONGO_URI is undefined. Add MONGO_URI to backend/.env (see .env.example).'
    );
  }

  const uris = getConnectionUris(primaryUri, env.MONGO_URI_STANDARD);
  let lastError;

  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];
    const isFallback = i > 0;

    try {
      if (isFallback) {
        console.warn('⚠️  SRV DNS blocked — retrying with standard connection (port 27017)...');
      }

      const conn = await mongoose.connect(uri, connectOptions);

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`   Database: ${conn.connection.name}`);
      if (isFallback) {
        console.log('   Mode: standard URI (non-SRV)');
      }

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB runtime error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected.');
      });

      return conn;
    } catch (error) {
      lastError = error;
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      const canRetry = i < uris.length - 1 && isDnsSrvError(error);
      if (!canRetry) break;
    }
  }

  console.error('❌ MongoDB connection failed:', lastError.message);

  if (isDnsSrvError(lastError)) {
    console.error('\n   DNS cannot resolve MongoDB Atlas (querySrv ECONNREFUSED). Try:');
    console.error('   1. Atlas → Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0)');
    console.error('   2. Windows: set DNS to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)');
    console.error('   3. Disable VPN / antivirus blocking DNS');
    console.error('   4. Add MONGO_URI_STANDARD in .env (from Atlas → Connect → standard string)\n');
  } else if (lastError.message.includes('authentication failed')) {
    console.error('   → Check username/password in Atlas → Database Access');
  } else if (lastError.message.includes('option ') && lastError.message.includes('not supported')) {
    console.error('   → Fix MONGO_URI: use /venue_crm before ? (see .env.example)');
  }

  throw lastError;
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
};

export default connectDB;
