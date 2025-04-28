// 🛠 FIX 1: Import mongoose and get ObjectId properly
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

import UserProfile from "../models/userProfile.js";
import { checkString } from "../utils/helper.js";
import Userlist from "../models/User.js";

export const createProfile = async (userId, data) => {
  console.log(">>>", userId);
  const existing = await UserProfile.findOne({ userId });
  if (existing) throw "Profile already exists";
  // Validation (can add validateProfileData(data) here if you want)

  const newProfile = new UserProfile({ userId, ...data });
  await newProfile.save();

  if (newProfile) {
    // Update profileCompleted in Userlist
    await Userlist.updateOne(
      { _id: userId },
      { $set: { profileCompleted: true } }
    );
  }
  return newProfile;
};

export const getProfile = async (userId) => {
  const profile = await UserProfile.findOne({ userId }).populate(
    "userId",
    "username email"
  );
  if (!profile) throw "Profile not found";
  return profile;
};

export const updateProfile = async (userId, data) => {
  const updated = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true }
  );
  if (!updated) throw "Profile not found";
  return updated;
};

export const deleteProfile = async (userId) => {
  const deleted = await UserProfile.findOneAndDelete({ userId });
  if (!deleted) throw "Profile not found";
  return true;
};

export const ratePlayers = async (raterId, ratingsArray) => {
  for (let { userId, score } of ratingsArray) {
    if (!ObjectId.isValid(userId)) throw "Invalid rated user ID";

    const profile = await UserProfile.findOne({ userId: new ObjectId(userId) });
    if (!profile) throw `No profile for user ${userId}`;

    profile.ratings.push({ rater: new ObjectId(raterId), score });

    profile.ratingCount++;

    profile.averageRating =
      (profile.averageRating * (profile.ratingCount - 1) + score) /
      profile.ratingCount;

    await profile.save();
  }
};

/**
 * Have userId follow targetUserId.
 * Updates both profiles’ followers / following lists.
 * Returns the new followers count of the target profile.
 */
export const followUser = async (userId, targetUserId) => {
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(targetUserId)) {
    throw "Invalid user ID";
  }

  if (userId.toString() === targetUserId.toString()) {
    throw "Cannot follow yourself";
  }

  const followerProfile = await UserProfile.findOne({
    userId: new ObjectId(userId),
  });
  const targetProfile = await UserProfile.findOne({
    userId: new ObjectId(targetUserId),
  });

  if (!followerProfile || !targetProfile) {
    throw "Profile not found";
  }

  // Already following?
  if (targetProfile.followers.some((f) => f.toString() === userId.toString())) {
    throw "Already following";
  }

  targetProfile.followers.push(new ObjectId(userId)); // <-- FIXED
  followerProfile.following.push({ userId: new ObjectId(targetUserId) }); // <-- FIXED

  await targetProfile.save();
  await followerProfile.save();

  return targetProfile.followers.length;
};

/**
 * Have userId unfollow targetUserId.
 * Returns the new followers count of the target profile.
 */
export const unfollowUser = async (userId, targetUserId) => {
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(targetUserId)) {
    throw "Invalid user ID";
  }

  if (userId.toString() === targetUserId.toString()) {
    throw "Cannot unfollow yourself";
  }

  const followerProfile = await UserProfile.findOne({
    userId: new ObjectId(userId),
  });
  const targetProfile = await UserProfile.findOne({
    userId: new ObjectId(targetUserId),
  });

  if (!followerProfile || !targetProfile) {
    throw "Profile not found";
  }

  // Not following?
  if (
    !targetProfile.followers.some((f) => f.toString() === userId.toString())
  ) {
    throw "Not following";
  }

  targetProfile.followers = targetProfile.followers.filter(
    (f) => f.toString() !== userId.toString()
  );
  followerProfile.following = followerProfile.following.filter(
    (f) => f.userId.toString() !== targetUserId.toString()
  );

  await targetProfile.save();
  await followerProfile.save();

  return targetProfile.followers.length;
};
