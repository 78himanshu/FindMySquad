import mongoose from "mongoose";
import "../models/User.js";

const structure = mongoose.Schema;

const gymSchema = new structure({
  title: { type: String, required: true },
  gym: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  date: { type: String, required: true }, // e.g., "2025-05-01"
  startTime: { type: String, required: true }, // e.g., "19:00"
  endTime: { type: String, required: true }, // e.g., "21:00"
  geoLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  gymlocation: { type: String, required: true },
  experience: {
    type: String,
    required: true,
    enum: ["newcomer", "1+ year", "3+ year", "5+ year", "10+ year"],
  },
  workoutType: {
    type: String,
    required: true,
    enum: [
      "Cardio",
      "Body Building",
      "Power Lifting",
      "Calisthenics",
      "Yoga",
      "Other",
    ],
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  currentMembers: {
    type: Number,
    default: 0,
  },
  maxMembers: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
  },
  createdAt: { type: Date, default: Date.now },
  hostedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userlist",
    required: true,
  },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Userlist" }],
});

gymSchema.index({ geoLocation: "2dsphere" });

export default mongoose.model("Gym", gymSchema);
