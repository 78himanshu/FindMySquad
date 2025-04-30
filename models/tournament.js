import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  creator:   { type: mongoose.Schema.Types.ObjectId, ref: 'Userlist', required: true },
  game:      { type: String, required: true },
  format:    { type: String, required: true },
  date:      { type: Date,   required: true },
  startTime: { type: String, required: true },  // e.g. "14:00"
  endTime:   { type: String, required: true },  // e.g. "16:00"
  description: { type: String, required: true, minlength: 10, maxlength: 200 },
  skillLevel:    { type: String, required: true },
  maxTeams:      { type: Number, required: true, min: 1, max: 100 },
  teams: [
    {
      teamName:    { type: String, required: true },
      description: { type: String, required: true, minlength: 5, maxlength: 200 },
      players:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Userlist' }]
    }
  ],
  prizeDescription: { type: String, required: true, minlength: 5, maxlength: 50 },
  createdAt:        { type: Date, default: Date.now }
});

export default mongoose.model('Tournament', tournamentSchema);
