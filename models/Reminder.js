import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  gameId: { type: mongoose.Schema.Types.ObjectId, required: true },
  gameTitle: { type: String, required: true },
  gameStartTime: { type: Date, required: true },
  gameLocation: { type: String, required: true },
  reminderTime: { type: Date, required: true },
  sent: { type: Boolean, default: false },
});

export default mongoose.model("Reminder", ReminderSchema);
