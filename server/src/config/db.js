import mongoose from 'mongoose';

export async function connectDb() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    // eslint-disable-next-line no-console
    console.warn('MONGODB_URI is not set; skipping MongoDB connection');
    return false;
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri);

    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('MongoDB connection failed:', err?.message || err);
    if (process.env.MONGODB_REQUIRED === 'true') {
      throw err;
    }
    return false;
  }
}
