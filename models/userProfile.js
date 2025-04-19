import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Userlist',
    required: true,
    unique: true
  },
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    bio: String,
    avatar: String,
    city: { type: String },
    state: { type: String },
    zipCode: { type: String }
  },
  sportsInterests: [String],
  gymPreferences: [String],
  gamingInterests: [
    String
  ],
  karmaPoints: { type: Number, default: 0 },
  achievements: [String],
  averageRating: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Userlist' }],
  following: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Userlist' }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('UserProfile', userProfileSchema);
