import Gym from "../models/Gym.js";
import { ObjectId } from "mongodb";
import { checkString } from "../utils/helper.js";
import UserProfile from "../models/userProfile.js";
import { updateKarmaPoints } from "../utils/karmaHelper.js";
import { evaluateAchievements } from "../utils/achievementHelper.js";
// import GymSession from "../models/Gym.js";

import "../models/User.js";
import fetch from "node-fetch";

export const createGymSession = async (
  title,
  gym,
  description,
  date,
  startTime,
  endTime,
  gymlocation,
  experience,
  workoutType,
  hostedBy,
  maxMembers
) => {
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

  const encodedLocation = encodeURIComponent(trimmedLocation);
  const apiURL = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;

  const response = await fetch(apiURL, {
    headers: {
      "User-Agent": "FindMySquad-GymBuddy",
    },
  });
  const geoData = await response.json();

  if (!geoData.length) throw "Could not geocode gym location.";

  const latitude = parseFloat(geoData[0].lat);
  const longitude = parseFloat(geoData[0].lon);

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
    date: date, // e.g., "2025-05-01"
    startTime: startTime, // e.g., "19:00"
    endTime: endTime, // e.g., "21:00"
    gymlocation: trimmedLocation,
    experience: trimmedExperience,
    workoutType: trimmedWorkout,
    hostedBy,
    maxMembers: parseInt(maxMembers),
    currentMembers: 0,
    geoLocation: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
  });

  const saved = await newSession.save();

  if (!saved) {
    throw "Failed to create new gym session.";
  }

  await updateKarmaPoints(hostedBy, 15);
  await evaluateAchievements(hostedBy);

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

  const deleted = await Gym.findById(sessionId);
  if (!deleted) throw "Gym session not found or already deleted";

  const hostedBy = deleted.hostedBy.toString();

  await updateKarmaPoints(hostedBy, -15);
  await Gym.findByIdAndDelete(sessionId);
  await evaluateAchievements(hostedBy);

  return deleted;
};

export const getAllGymSessions = async () => {
  return await Gym.find({}).populate("hostedBy", "username");
};

export const getJoinedSessionsByUser = async (userId) => {
  if (!ObjectId.isValid(userId)) throw "Invalid user ID";
  return await Gym.find({ members: userId }).populate("hostedBy", "username");
};

export const getUpcomingSessions = async () => {
  const now = new Date();

  const sessions = await Gym.find({})
    .populate("hostedBy", "username")
    .lean();

  const withDates = sessions.map((s) => ({
    ...s,
    __startDate: new Date(`${s.date}T${s.startTime}`)
  }));

  const upcoming = withDates
    .filter((s) => s.__startDate > now)
    .sort((a, b) => a.__startDate - b.__startDate)
    .slice(0, 15);

  const enriched = await Promise.all(
    upcoming.map(async (session) => {
      const profile = await UserProfile.findOne(
        { userId: session.hostedBy._id },
        { "profile.avatar": 1, "profile.firstName": 1, "profile.lastName": 1 }
      )
        .lean();

      return {
        ...session,
        host: {
          _id: session.hostedBy._id,
          username: session.hostedBy.username,
          avatarUrl:
            profile?.profile?.avatar || "/images/default-avatar.png",
          firstName: profile?.profile?.firstName || "",
          lastName: profile?.profile?.lastName || ""
        }
      };
    })
  );

  return enriched;
}


export const getHostedSessionsByUser = async (userId) => {
  if (!ObjectId.isValid(userId)) throw "Invalid user ID";

  return await Gym.find({ hostedBy: userId }).populate("hostedBy", "username");
};
