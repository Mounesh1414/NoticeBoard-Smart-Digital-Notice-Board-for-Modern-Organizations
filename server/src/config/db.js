import mongoose from 'mongoose';

export async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log('MongoDB not configured. Running with in-memory data store.');
    return false;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
  return true;
}
