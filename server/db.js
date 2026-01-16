const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (lo_error) {
    console.error('❌ MongoDB connection error:', lo_error);
    process.exit(1);
  }
};

module.exports = connectDB;
