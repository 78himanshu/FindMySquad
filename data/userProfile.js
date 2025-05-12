const { ObjectId } = mongoose.Types;
import { geocodeCity } from "../utils/geocode.js";

import UserProfile from "../models/userProfile.js";
import { checkString } from "../utils/helper.js";
import Userlist from "../models/User.js";
import mongoose from "mongoose";
import HostGame    from "../models/hostGame.js";


export const createProfile = async (userId, data) => {
  console.log(">>>", userId);
  const existing = await UserProfile.findOne({ userId });
  if (existing) throw "Profile already exists";
  // Validation (can add validateProfileData(data) here if you want)

  if (data.city) {
    const geoLocation = await geocodeCity(data.city);
    if (geoLocation) {
      data.location = {
        city: data.city.trim(),
        latitude: geoLocation.coordinates[1], // lat
        longitude: geoLocation.coordinates[0], // lng
      };
      data.geoLocation = {
        type: "Point",
        coordinates: geoLocation.coordinates, // [lng, lat]
      };
    }
  }

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

// export const getProfile = async (userId) => {
//   const profile = await UserProfile.findOne({ userId }).populate(
//     "userId",
//     "username email"
//   );
//   if (!profile) throw "Profile not found";
//   return profile;
// };

export const getProfile = async (userId) => {
  const profile = await UserProfile.findOne({ userId })
    // still pull in the user’s own account data
    .populate("userId", "username email")
    // pull in each rating’s rater → firstName, lastName
    .populate({
      path: "ratings.rater",        // the path in YOUR doc
      model: "UserProfile",         // which model to pull from
      localField: "ratings.rater",  // the ObjectId stored
      foreignField: "userId",       // match against this field in UserProfile
      select: "profile.firstName profile.lastName"
    })
    // pull in each rating’s bookingId → the HostGame’s title
    .populate({
      path: "ratings.bookingId",
      model: "Game",
      select: "title startTime"
    });

  if (!profile) throw "Profile not found";

  console.log("profile>>>>",profile.ratings)
  return profile;
};


export const updateProfile = async (userId, data) => {
  const update = {};

  if (data.profile) {
    if (data.profile.firstName)
      update["profile.firstName"] = data.profile.firstName.trim();
    if (data.profile.lastName)
      update["profile.lastName"] = data.profile.lastName.trim();
    if (data.profile.gender)
      update["profile.gender"] = data.profile.gender.trim();
    if (data.profile.bio) update["profile.bio"] = data.profile.bio.trim();
  }

  if (data.location && data.location.city) {
    update["location.city"] = data.location.city.trim();
  }

  if (data.phoneNumber) {
    update["phoneNumber"] = data.phoneNumber.trim();
  }

  if (typeof data.showContactInfo === "boolean") {
    update["showContactInfo"] = data.showContactInfo;
  }

  if (Object.keys(update).length === 0) {
    throw new Error("No valid fields provided for update.");
  }

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: update },
    { new: true }
  );

  if (!updatedProfile) throw new Error("Profile not found");

  return updatedProfile;
};

export const deleteProfile = async (userId) => {
  const deleted = await UserProfile.findOneAndDelete({ userId });
  if (!deleted) throw "Profile not found";
  return true;
};


export const ratePlayers = async (raterId, ratingsArray, bookingId) => {
  if (!ObjectId.isValid(raterId)) throw "Invalid rater ID";
  if (!ObjectId.isValid(bookingId)) throw "Invalid booking ID";

  const results = [];

  for (let { userId, rating, review } of ratingsArray) {
    if (!ObjectId.isValid(userId)) {
      results.push({ userId, success: false, error: "Invalid userId" });
      continue;
    }

    const profile = await UserProfile.findOne({ userId: new ObjectId(userId) });
    if (!profile) {
      results.push({ userId, success: false, error: "Profile not found" });
      continue;
    }

    // Check for duplicate rating
    const alreadyRated = profile.ratings.find(
      (r) =>
        r.rater.toString() === raterId &&
        r.bookingId.toString() === bookingId.toString()
    );

    if (alreadyRated) {
      results.push({ userId, success: false, error: "Already rated" });
      continue;
    }

    // Add new rating
    profile.ratings.push({
      rater: new ObjectId(raterId),
      score: rating,
      review: review || "",
      bookingId: new ObjectId(bookingId),
    });

    // Update counts
    profile.ratingCount = profile.ratings.length;
    profile.averageRating =
      profile.ratings.reduce((sum, r) => sum + r.score, 0) / profile.ratingCount;

    await profile.save();

    results.push({ userId, success: true });
  }

  return results;
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

  targetProfile.followers.push(new ObjectId(userId));
  followerProfile.following.push({ userId: new ObjectId(targetUserId) });

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

export const getTopKarmaUsers = async () => {
  try {
    const topUsers = await UserProfile.find(
      {},
      {
        "profile.firstName": 1,
        "profile.lastName": 1,
        "profile.avatar": 1,
        userId: 1,
        karmaPoints: 1,
        _id: 0,
      }
    )
      .sort({ karmaPoints: -1 })
      .limit(5);

    return topUsers;
  } catch (err) {
    console.error("Error fetching top karma users:", err);
    return [];
  }
};
