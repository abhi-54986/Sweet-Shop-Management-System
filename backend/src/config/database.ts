import mongoose from 'mongoose';

let isConnected = false;
let connectPromise: Promise<void> | null = null;

const connectDB = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    throw new Error('MONGODB_URI is not set');
  }

  connectPromise = (async () => {
  try {
    await mongoose.connect(mongoURI);
    isConnected = true;
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    isConnected = false;
    throw error;
  } finally {
    connectPromise = null;
  }
  })();

  return connectPromise;
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB Error:', error);
});

export default connectDB;