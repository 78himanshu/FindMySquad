import mongoose from "mongoose";

const structure = mongoose.Schema;

const gameStructure = new structure({
  title: { type: String, required: true },
  sport: { type: String, required: true, trim: true },
  //Removed Venue
  //venue: { type: String, required: true, trim: true },
  playersRequired: { type: Number, required: true, min: 1 },
  playersGoing: { type: Number, default: 1 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  description: { type: String, trim: true },
  costPerHead: { type: Number, min: 0 },
  skillLevel: {
    type: String,
    required: true,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userlist",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  location: { type: String, required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Userlist" }],
  //Adding Geolocation part for our Map Integration
  geoLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

gameStructure.index({ geoLocation: "2dsphere" });

export default mongoose.model("Game", gameStructure);
