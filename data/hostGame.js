import Game from "../models/hostGame.js";
import { ObjectId } from "mongodb";
import { checkNumber, checkString } from "../utils/helper.js";
import UserProfile from "../models/userProfile.js";
import { updateKarmaPoints } from "../utils/karmaHelper.js";

export const createGame = async (
  title,
  sport,
  playersRequired,
  startTime,
  endTime,
  description,
  costPerHead,
  skillLevel,
  host,
  location,
  geoLocation,
  bringEquipment = false,
  costShared = false,
  extraInfo = ""
) => {
  if (
    title === undefined ||
    sport === undefined ||
    playersRequired === undefined ||
    startTime === undefined ||
    endTime === undefined ||
    costPerHead === undefined ||
    skillLevel === undefined ||
    host === undefined ||
    location === undefined ||
    description === undefined
  ) {
    throw new Error("All fields must be provided.");
  }

  if (!ObjectId.isValid(host)) {
    throw new Error("Host ID is invalid.");
  }

  const trimmedTitle = checkString(title, "Title", 1);
  const trimmedSport = checkString(sport, "Sport", 1);
  const trimmedSkillLevel = checkString(skillLevel, "Skill Level", 1);
  const trimmedLocation = checkString(location, "Location", 1);
  const trimmedDescription = checkString(description, "Description", 1);
  const trimmedExtraInfo = typeof extraInfo === "string" ? extraInfo.trim() : "";

  checkNumber(playersRequired, "Players Required", 1);
  checkNumber(costPerHead, "Cost per Head", 0);

  if (
    !geoLocation ||
    typeof geoLocation !== "object" ||
    !Array.isArray(geoLocation.coordinates) ||
    geoLocation.coordinates.length !== 2 ||
    isNaN(geoLocation.coordinates[0]) ||
    isNaN(geoLocation.coordinates[1])
  ) {
    throw new Error("Invalid or missing geoLocation");
  }

  if (!(startTime instanceof Date) || isNaN(startTime.getTime())) throw new Error("Invalid start time");
  if (!(endTime instanceof Date) || isNaN(endTime.getTime())) throw new Error("Invalid end time");
  if (startTime >= endTime) throw new Error("End time must be after start time");

  const newGame = new Game({
    title: trimmedTitle,
    sport: trimmedSport,
    playersRequired,
    startTime,
    endTime,
    description: trimmedDescription,
    costPerHead,
    skillLevel: trimmedSkillLevel,
    host,
    location: trimmedLocation,
    geoLocation,
    bringEquipment: Boolean(bringEquipment),
    costShared: Boolean(costShared),
    extraInfo: trimmedExtraInfo,
    players: [host],
    playersGoing: 1
  });

  const savedGame = await newGame.save();
  await updateKarmaPoints(host, 15);

  return savedGame;
};



export const getAllGames = async (filters = {}) => {
  return await Game.find(filters);
};

export const getGameById = async (gameId) => {
  return await Game.findById(gameId);
};

export const getGamesByIds = async (ids) => {
  if (!Array.isArray(ids)) throw new Error("ids must be an array");
  const validIds = ids
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));
  return await Game.find({ _id: { $in: validIds } });
};

export const getRecentGames = async () => {
  try {
    const now = new Date();
    const games = await Game.find({
      endTime: { $gte: now },
    })
      .sort({ startTime: 1 })
      .limit(10)
      .populate("host", "username")
      .exec();
    return games;
  } catch (error) {
    console.error("Error fetching recent games:", error);
    return [];
  }
};

export const updateGame = async (gameId, updates, hostId) => {
  if (!ObjectId.isValid(gameId)) throw new Error("Invalid game ID");

  const game = await Game.findById(gameId);
  if (!game) throw new Error("Game not found");
  if (game.host.toString() !== hostId) throw new Error("Unauthorized edit attempt");

  if (updates.geoLocation) {
    const g = updates.geoLocation;
    if (
      typeof g !== "object" ||
      !Array.isArray(g.coordinates) ||
      g.coordinates.length !== 2 ||
      isNaN(g.coordinates[0]) ||
      isNaN(g.coordinates[1])
    ) throw "Invalid geoLocation";
    game.geoLocation = g;
  }

  const allowedFields = [
    "title",
    "sport",
    "playersRequired",
    "startTime",
    "endTime",
    "description",
    "costPerHead",
    "skillLevel",
    "location",
    "bringEquipment",
    "costShared",
    "extraInfo"
  ];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      if (["title", "sport", "skillLevel", "location"].includes(field)) {
        game[field] = checkString(updates[field], field);
      } else if (["playersRequired", "costPerHead"].includes(field)) {
        const val = checkNumber(updates[field], field);
        if (val === undefined || val === null || isNaN(val)) {
          throw `${field} must be a valid number`;
        }
        game[field] = val;
      } else if (["startTime", "endTime"].includes(field)) {
        const date = new Date(updates[field]);
        if (isNaN(date.getTime())) throw `${field} is not a valid date`;
        game[field] = date;
      } else if (field === "description") {
        game[field] = checkString(updates[field], field, 1);
      } else if (["bringEquipment", "costShared"].includes(field)) {
        game[field] = Boolean(updates[field]);
      } else if (field === "extraInfo") {
        game[field] = typeof updates[field] === "string" ? updates[field].trim() : "";
      }
    }
  });

  await game.save();
  return game;
};


export async function deleteGame(gameId, userID) {
  if (!gameId) throw new Error("Game ID is required");
  await updateKarmaPoints(userID, -15);
  await Game.findByIdAndDelete(gameId);
}

export const upcomingGames = async () => {

  const upcomingGames = await Game.find({
    startTime: { $gte: new Date() } // games starting now or in future
  }).sort({ startTime: 1 });

  return upcomingGames;
}
