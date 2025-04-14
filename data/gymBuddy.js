import Gym from "../models/Gym.js";
import { ObjectId } from "mongodb";
import { checkString } from "../utils/Helper.js";

export const createGymSession = async (
  title,
  venue,
  description,
  dateTime,
  gymlocation,
  skillLevel,
  workoutType,
  hostedBy
) => {
  if (
    !title ||
    !venue ||
    !dateTime ||
    !gymlocation ||
    !skillLevel ||
    !workoutType ||
    !hostedBy
  ) {
    throw "All required fields must be provided.";
  }

  if (!ObjectId.isValid(hostedBy)) throw "Invalid hostedBy ID";

  const trimmedTitle = checkString(title, "Title", 1);
  const trimmedVenue = checkString(venue, "Venue", 1);
  const trimmedLocation = checkString(gymlocation, "Gym Location", 1);
  const trimmedSkill = checkString(skillLevel, "Skill Level", 1);
  const trimmedWorkout = checkString(workoutType, "Workout Type", 1);
  const trimmedDescription = description
    ? checkString(description, "Description", 1)
    : "";

  const newSession = new Gym({
    title: trimmedTitle,
    venue: trimmedVenue,
    description: trimmedDescription,
    dateTime: new Date(dateTime),
    gymlocation: trimmedLocation,
    skillLevel: trimmedSkill,
    workoutType: trimmedWorkout,
    hostedBy,
  });

  const saved = await newSession.save();
  return saved;
};

export const updateGymSession = async (sessionId, updates) => {
  if (!ObjectId.isValid(sessionId)) throw "Invalid session ID";

  const allowedFields = [
    "title",
    "venue",
    "description",
    "dateTime",
    "gymlocation",
    "skillLevel",
    "workoutType",
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
