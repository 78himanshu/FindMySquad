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
    bio: { type: String },
    // gender: (type: String, enum: ['male', 'female', 'others']),
    avatar: { type: String }, //photo
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  sportsInterests: [
    {
      sport: {
        type: String,
        enum: ['Football', 'Basketball', 'Tennis', 'Cricket', 'Badminton', 'Volleyball', 'Other']
      },
      skillLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced']
      }
    }
  ],
  gymPreferences: {
    gymLocation: String,
    workoutTypes: [String],
    frequency: String, //questionable
    gym_skillLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced']
      } // 
  },
  gamingInterests: [
    {
      game: String,
      platform: String, // dropdowmn (moile, desktop, PS, Xbox)
      gaming_skillLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced']
      }
    }
  ],
  karmaPoints: { type: Number, default: 0 },
  achievements: [String], //have to define
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
