import UserProfile from "../models/userProfile.js";
import Game from "../models/hostGame.js";
import Gym from "../models/Gym.js";
import Tournament from "../models/tournament.js";
import mongoose from "mongoose";

const countHostedGames = async (userId) => {
  return await Game.countDocuments({ host: userId });
};

const countJoinedGames = async (userId) => {
  const userObjId = new mongoose.Types.ObjectId(userId);
  return await Game.countDocuments({
    players: userObjId,
    host: { $ne: userObjId }, // Only count games joined but not hosted
  });
};

const countHostedGymSessions = async (userId) => {
  return await Gym.countDocuments({ hostedBy: userId });
};

const countJoinedGymSessions = async (userId) => {
  return await Gym.countDocuments({ members: userId });
};

const countHostedTournaments = async (userId) => {
  return await Tournament.countDocuments({ creator: userId });
};

const countRegisteredTournaments = async (userId) => {
  return await Tournament.countDocuments({ "teams.players": userId });
};

export const evaluateAchievements = async (userId) => {
  const profile = await UserProfile.findOne({ userId });
  if (!profile) return;

  const hostedGameCount = await countHostedGames(userId);
  const joinedGameCount = await countJoinedGames(userId);
  const hostedGymCount = await countHostedGymSessions(userId);
  const joinedGymCount = await countJoinedGymSessions(userId);
  const hostedTournamentCount = await countHostedTournaments(userId);
  const registeredTournamentCount = await countRegisteredTournaments(userId);

  console.log("Achievement Evaluation for:", userId);
  console.log("Hosted Games:", hostedGameCount);
  console.log("Joined Games (not hosted):", joinedGameCount);
  console.log("Hosted Gyms:", hostedGymCount);
  console.log("Joined Gyms:", joinedGymCount);
  console.log("Hosted Tournaments:", hostedTournamentCount);
  console.log("Registered Tournaments:", registeredTournamentCount);

  const newAchievements = new Set(profile.achievements || []);

  // Host
  if (hostedGameCount > 0 || hostedGymCount > 0 || hostedTournamentCount > 0) {
    newAchievements.add("Host");
  } else {
    newAchievements.delete("Host");
  }

  // Rookie: Must have joined at least 2 combined across all
  const totalJoins =
    joinedGameCount + joinedGymCount + registeredTournamentCount;
  if (totalJoins >= 1) {
    newAchievements.add("Rookie");
  } else {
    newAchievements.delete("Rookie");
  }

  // Pro Host
  if (hostedGameCount + hostedGymCount + hostedTournamentCount >= 5) {
    newAchievements.add("Pro Host");
  } else {
    newAchievements.delete("Pro Host");
  }

  // Advanced
  if (joinedGameCount + joinedGymCount + registeredTournamentCount >= 5) {
    newAchievements.add("Advanced");
  } else {
    newAchievements.delete("Advanced");
  }

  // Leader (Top 5 Karma)
  const top5 = await UserProfile.find({})
    .sort({ karmaPoints: -1 })
    .limit(5)
    .select("userId");

  const isInTop5 = top5.some((u) => u.userId.toString() === userId.toString());

  if (isInTop5) {
    newAchievements.add("Leader");
  } else {
    newAchievements.delete("Leader");
  }

  // Only update DB if there's a change
  const finalAchievements = Array.from(newAchievements);
  if (
    !profile.achievements ||
    profile.achievements.sort().join() !== finalAchievements.sort().join()
  ) {
    profile.achievements = finalAchievements;
    await profile.save();
  }
};
