'use strict';

const mongoose = require('mongoose');

/**
 * Connect to MongoDB using MONGO_URI from environment variables.
 * Exits the process on failure so the server doesn't silently run without a DB.
 */
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8 has these defaults built-in, but keeping them explicit
      // makes the intent clear.
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌  MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
