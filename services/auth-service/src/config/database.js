const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is required');

  await mongoose.connect(uri);
  logger.info('MongoDB connected');
}

module.exports = { connectDB };
