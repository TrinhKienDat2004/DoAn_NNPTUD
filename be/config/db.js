const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    // Check if we should use in-memory database
    const useInMemory = process.env.USE_IN_MEMORY_DB === 'true' || process.env.NODE_ENV === 'test';

    if (useInMemory) {
      console.log('🚀 Starting in-memory MongoDB server...');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log('📍 In-memory MongoDB URI:', mongoUri);

      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to in-memory MongoDB');
    } else {
      // Use regular MongoDB connection
      const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/doan_nnptud';
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('🛑 In-memory MongoDB server stopped');
    }
  } catch (error) {
    console.error('❌ Database disconnection error:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };