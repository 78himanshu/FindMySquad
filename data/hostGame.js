import Game from "../models/hostGame.js";
import { ObjectId } from "mongodb";
import { checkNumber, checkString } from "../utils/helper.js";
import UserProfile from "../models/userProfile.js";
import { updateKarmaPoints } from "../utils/karmaHelper.js"; 


export const createGame = async (
  title,
  sport,
  //venue,
  playersRequired,
  startTime,
  endTime,
  description,
  costPerHead,
  skillLevel,
  host,
  location,
  geoLocation
) => {
  if (
    !title ||
    !sport ||
    //!venue ||
    !playersRequired ||
    !startTime ||
    !endTime ||
    !costPerHead ||
    !skillLevel ||
    !host ||
    !location
  ) {
    throw "All fields must be provided";
  }
  if (!ObjectId.isValid(host)) throw "Host ID is invalid";
  const trimmedTitle = checkString(title, "Title", 1);
  const trimmedSport = checkString(sport, "Sport", 1);
  //const trimmedVenue = checkString(venue, "Venue", 1);
  const trimmedSkillLevel = checkString(skillLevel, "Skill Level", 1);
  const trimmedLocation = checkString(location, "Location", 1);
  let trimmedDescription = "";
  if (description) {
    trimmedDescription = checkString(description, "Description", 1);
  }
  checkNumber(playersRequired, "Players Required", 1);
  checkNumber(costPerHead, "Cost per Head", 0);

  //Adding geo location validatio
  if (
    !geoLocation ||
    typeof geoLocation !== "object" ||
    !Array.isArray(geoLocation.coordinates) ||
    geoLocation.coordinates.length !== 2 ||
    isNaN(geoLocation.coordinates[0]) ||
    isNaN(geoLocation.coordinates[1])
  ) {
    throw "Invalid or missing geoLocation";
  }

  //Adding Date Check for start time and end time
  if (!(startTime instanceof Date) || isNaN(startTime.getTime())) throw "Invalid start time";
  if (!(endTime instanceof Date) || isNaN(endTime.getTime())) throw "Invalid end time";
  if (new Date(startTime) >= new Date(endTime)) throw "End time must be after start time";

  const newGame = new Game({
    title: trimmedTitle,
    sport: trimmedSport,
    //venue: trimmedVenue,
    playersRequired: playersRequired,
    startTime,
    endTime,
    description: trimmedDescription,
    costPerHead: costPerHead,
    skillLevel: trimmedSkillLevel,
    host,
    location: trimmedLocation,
    players: [host],
    geoLocation,
    playersGoing: 1,
  });

  const savedGame = await newGame.save();

  // const updatedUserProfile = await UserProfile.findOneAndUpdate(
  //   { userId: "6806c40d8e65a501855cdfa0" },
  //   { $inc: { karmaPoints: 15 } },
  //   { new: true }
  // );

  // if (updatedUserProfile) {
  //   console.log("✅ Karma Points Updated:", updatedUserProfile.karmaPoints);
  // } else {
  //   console.error("❌ Failed to update karma points for user:", hostedBy);
  // }

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
  if (game.host.toString() !== hostId)
    throw new Error("Unauthorized edit attempt");
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
    //"venue",
    "playersRequired",
    "startTime",
    "endTime",
    "description",
    "costPerHead",
    "skillLevel",
    "location",
  ];

  allowedFields.forEach((field) => {
    //Checking if allowedFields have valid values and then assigning
    if (updates[field] !== undefined) {
      if (["title", "sport", "skillLevel", "location"].includes(field)) {
        console.log(`💬 Setting ${field}:`, updates[field]);
        game[field] = checkString(updates[field], field);
      } else if (["playersRequired", "costPerHead"].includes(field)) {
        console.log(`💬 Setting ${field}:`, updates[field]);
        const val = checkNumber(updates[field], field);
        if (val === undefined || val === null || isNaN(val)) {
          throw `${field} is required and must be a number`;
        }
        game[field] = val;
      } else if (["startTime", "endTime"].includes(field)) {
        console.log(`💬 Setting ${field}:`, updates[field]);
        if (isNaN(Date.parse(updates[field]))) throw `${field} is not a valid date`;
        game[field] = updates[field];
      } else if (field === "description") {
        console.log(`💬 Setting ${field}:`, updates[field]);
        game[field] = checkString(updates[field], field, 1);
      }
    }
    // if (updates[field] !== undefined) {
    //   game[field] = updates[field];
    // }
  });
  console.log("🧨 Final game before save:", game);
  await game.save();
  return game;
};

export async function deleteGame(gameId,userID) {
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
