import UserProfile from '../models/userProfile.js';
import { checkString } from '../utils/helper.js';

export const createProfile = async (userId, data) => {
  const existing = await UserProfile.findOne({ userId });
  if (existing) throw 'Profile already exists';

  const newProfile = new UserProfile({ userId, ...data });
  await newProfile.save();
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
