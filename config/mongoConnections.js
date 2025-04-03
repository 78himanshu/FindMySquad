// import {MongoClient} from 'mongodb';
// import {mongoConfig} from './settings.js';

// let _connection = undefined;
// let _db = undefined;

// export const dbConnection = async () => {
//   if (!_connection) {
//     _connection = await MongoClient.connect(mongoConfig.serverUrl);
//     _db = _connection.db(mongoConfig.database);
//   }

//   return _db;
// };
// export const closeConnection = async () => {
//   await _connection.close();
// };


import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://hpaithan:fQoTlFKT0uAueUi3@findmysquad.onaci48.mongodb.net/', {

    });
    console.log('✅ MongoDB connected!');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
