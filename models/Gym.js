import mongoose from "mongoose";
import "../models/User.js";

const structure = mongoose.Schema;

const gymSchema = new structure({
  title: { type: String, required: true },
  gym: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  dateTime: { type: Date, required: true },
  gymlocation: { type: String, required: true },
  experience: {
    type: String,
    required: true,
    enum: ["newcomer", "1+ year", "3+ year", "5+ year", "10+ year"],
  },
  workoutType: {
    type: String,
    required: true,
    enum: ["Cardio", "Body Building", "Power Lifting", "Calisthenics", "Yoga", "Other"]
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  currentMembers: {
    type: Number,
    default: 0
  },
  maxMembers: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  createdAt: { type: Date, default: Date.now },
  hostedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userlist",
    required: true,
  },
});

export default mongoose.model("Gym", gymSchema);
