import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Userlist', required: true },
    game: { type: String, required: true },
    format: { type: String, required: true }, 
    date: { type: Date, required: true },
    time: { type: String, required: true },
    description: String,
    skillLevel: { type: String, required: true },
    maxTeams: { type: Number, max: 100, required: true },
    teams: [
      {
        teamName: { type: String, required: true },
        players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Userlist' }]
      }
    ],
    prizePool: {
      total: { type: Number, required: true },
      first: { type: Number, required: true },
      second: { type: Number, required: true },
      third: { type: Number, required: true }
    },
    createdAt: { type: Date, default: Date.now }
  });
  

export default mongoose.model('Tournament', tournamentSchema);
