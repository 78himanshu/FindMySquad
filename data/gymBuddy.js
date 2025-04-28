import Gym from "../models/Gym.js";
import { ObjectId } from "mongodb";
import { checkString } from "../utils/helper.js";
import UserProfile from "../models/userProfile.js";

import "../models/User.js"

export const createGymSession = async (title, gym, description, date, startTime, endTime, gymlocation, experience, workoutType, hostedBy, maxMembers) => {
  if (
    !title ||
    !gym ||
    !date ||
    !startTime ||
    !endTime ||
    !gymlocation ||
    !experience ||
    !workoutType ||
    !hostedBy ||
    !maxMembers
  ) {
    throw "All required fields must be provided.";
  }

  if (!ObjectId.isValid(hostedBy)) throw "Invalid hostedBy ID";

  const trimmedTitle = checkString(title, "Title", 1);
  const trimmedGym = checkString(gym, "Gym", 1);
  const trimmedLocation = checkString(gymlocation, "Gym Location", 1);
  const trimmedExperience = checkString(experience, "Experience", 1);
  const trimmedWorkout = checkString(workoutType, "Workout Type", 1);
  const trimmedDescription = description
    ? checkString(description, "Description", 1)
    : "";

  // ⚡ Combine date and time for internal validation
  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(`${date}T${endTime}`);

  if (isNaN(startDateTime) || isNaN(endDateTime)) {
    throw "Invalid Date or Time format.";
  }

  if (startDateTime >= endDateTime) {
    throw "End Time must be after Start Time.";
  }

  // ⚡ Save new Session
  const newSession = new Gym({
    title: trimmedTitle,
    gym: trimmedGym,
    description: trimmedDescription,
    date: date,                // e.g., "2025-05-01"
    startTime: startTime,       // e.g., "19:00"
    endTime: endTime,           // e.g., "21:00"
    gymlocation: trimmedLocation,
    experience: trimmedExperience,
    workoutType: trimmedWorkout,
    hostedBy,
    maxMembers: parseInt(maxMembers),
    currentMembers: 0
  });

  const saved = await newSession.save();

  if (!saved) {
    throw "Failed to create new gym session.";
  }

  const updatedUserProfile = await UserProfile.findOneAndUpdate(
    { userId: hostedBy },
    { $inc: { karmaPoints: 15 } },
    { new: true }
  );

  if (updatedUserProfile) {
    console.log("✅ Karma Points Updated:", updatedUserProfile.karmaPoints);
  } else {
    console.error("❌ Failed to update karma points for user:", hostedBy);
  }

  // ⚡ Add the session to the user's hosted sessions
  // const user = await UserProfile.findById(hostedBy);
  // if (!user) throw "User not found";
  // user.hostedSessions.push(saved._id);
  // await user.save();
  // console.log("saved", saved);
  // console.log("user", user);


  return saved;
};

export const updateGymSession = async (sessionId, updates) => {
  if (!ObjectId.isValid(sessionId)) throw "Invalid session ID";

  const allowedFields = [
    "title",
    "gym",
    "description",
    "dateTime",
    "gymlocation",
    "experience",
    "workoutType",
    "maxMembers",
  ];

  const updateData = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      const value = updates[key];

      try {
        if (key === "dateTime" && value) {
          updateData.dateTime = new Date(value);
        } else if (typeof value === "string") {
          const checked = checkString(value, key);
          updateData[key] = checked;
        }
      } catch (e) {
        console.error(`Validation failed for ${key}:`, e);
      }
    }
  }
  console.log("updated successfully");

  const updated = await Gym.findByIdAndUpdate(
    sessionId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updated) throw "Gym session not found or update failed";
  return updated;
};

export const deleteGymSession = async (sessionId) => {
  if (!ObjectId.isValid(sessionId)) throw "Invalid session ID";

  const deleted = await Gym.findByIdAndDelete(sessionId);
  if (!deleted) throw "Gym session not found or already deleted";
  return deleted;
};

export const getAllGymSessions = async () => {
  return await Gym.find({}).populate("hostedBy", "username");
};


// NEW: get all gym sessions where this user is a member
export const getJoinedSessionsByUser = async (userId) => {
  if (!ObjectId.isValid(userId)) throw "Invalid user ID";
  // Assumes your Gym schema has a `members: [ObjectId]` field
  return await Gym.find({ members: userId }).populate("hostedBy", "username");
};
