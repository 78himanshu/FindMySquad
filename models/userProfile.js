import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    bio: String,
    avatar: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  sportsInterests: [
    {
      sport: { type: String },
      skillLevel: { type: String }
    }
  ],
  gymPreferences: {
    gymLocation: String,
    workoutTypes: [String],
    frequency: String,
    skillLevel: String
  },
  gamingInterests: [
    {
      game: String,
      platform: String,
      skillLevel: String
    }
  ],
  karmaPoints: { type: Number, default: 0 },
  achievements: [String],
  averageRating: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('UserProfile', userProfileSchema);
