import mongoose from "mongoose";

const structure = mongoose.Schema;

const gymSchema = new structure({
  title: { type: String, required: true },
  venue: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  dateTime: { type: Date, required: true },
  gymlocation: { type: String, required: true },
  skillLevel: {
    type: String,
    required: true,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  workoutType: {
    type: String,
    required: true,
    enum: ["Cardio", "Weight Training", "Yoga", "Other"]
  },
  createdAt: { type: Date, default: Date.now },
  hostedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default mongoose.model("Gym", gymSchema);
