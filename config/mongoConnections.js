import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb+srv://hpaithan:fQoTlFKT0uAueUi3@findmysquad.onaci48.mongodb.net/",
      {}
    );
    console.log("✅ MongoDB connected!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
