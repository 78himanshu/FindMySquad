import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userlist",
    required: true,
    unique: true,
  },
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    gender: { type: String, default: "" },
  },
  sportsInterests: {
    type: [String],
    default: [],
  },
  gymPreferences: {
    type: [String],
    default: [],
  },
  gamingInterests: {
    type: [String],
    default: [],
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
  },
  // Ratings: individual ratings left by other users for this profile
  ratings: [
    {
      rater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Userlist",
        required: true,
      },
      score: { type: Number, min: 1, max: 5, required: true },
      bookingId: { type: mongoose.Schema.Types.ObjectId, required: true },
      review: { type: String, default: "" },
    },
  ],
  ratingCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  karmaPoints: { type: Number, default: 0 },
  achievements: { type: [String], default: [] },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Userlist",
    default: [],
  },
  following: {
    type: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "Userlist" },
      },
    ],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
  city: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  showContactInfo: { type: Boolean, default: false },
  geoLocation: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

userProfileSchema.index({ geoLocation: "2dsphere" });
export default mongoose.model("UserProfile", userProfileSchema);
