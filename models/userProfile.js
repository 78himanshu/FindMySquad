import { strings } from '@material/snackbar';
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
    gender: String,
  },
  sportsInterests: [String],
  gymPreferences: [String],
  gamingInterests: [
    String
  ],
  location: {
    latitude: { type: Number, default: "" },
    longitude: { type: Number, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" }
    , default: {}
  },
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
