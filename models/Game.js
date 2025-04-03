import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  hostUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  location: String,
  category: String,
  time: String,
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Game", gameSchema);
