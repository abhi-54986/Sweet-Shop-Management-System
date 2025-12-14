import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Connect to the in-memory database before tests
export const connectDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
};

// Clear all test data after each test
export const clearDB = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Disconnect and close connection after all tests
export const closeDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};