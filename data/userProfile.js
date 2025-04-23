import UserProfile from '../models/userProfile.js';
import { checkString } from '../utils/helper.js';
import Userlist from "../models/User.js";


export const createProfile = async (userId, data) => {

  console.log(">>>",userId);
  const existing = await UserProfile.findOne({ userId });
  if (existing) throw 'Profile already exists';
  // add add profile data validation here 



  const newProfile = new UserProfile({ userId, ...data });
  await newProfile.save();
  if (newProfile) {
    // Update profileCompleted in userList
    await Userlist.updateOne({ _id: userId }, { $set: { profileCompleted: true } });
  }
  return newProfile;
};

export const getProfile = async (userId) => {
  const profile = await UserProfile.findOne({ userId }).populate('userId', 'username email');
  if (!profile) throw 'Profile not found';
  return profile;
};

export const updateProfile = async (userId, data) => {
  const updated = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true }
  );
  if (!updated) throw 'Profile not found';
  return updated;
};

export const deleteProfile = async (userId) => {
  const deleted = await UserProfile.findOneAndDelete({ userId });
  if (!deleted) throw 'Profile not found';
  return true;
};

export const ratePlayers = async (raterId, bookingId, ratingsArray) => {
  // ratingsArray = [{ userId, score }, …]
  for (let { userId, score } of ratingsArray) {
    if (!ObjectId.isValid(userId)) throw "Invalid rated user ID";
    const profile = await UserProfile.findOne({ userId });
    if (!profile) throw `No profile for user ${userId}`;

    // append the rating
    profile.ratings.push({ rater: raterId, score, bookingId });
    profile.ratingCount++;
    // recompute average
    profile.averageRating =
      ((profile.averageRating * (profile.ratingCount - 1)) + score)
      / profile.ratingCount;

    await profile.save();
  }
};