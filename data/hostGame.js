import Game from "../models/hostGame.js";
import { ObjectId } from "mongodb";
import { checkNumber, checkString } from "../utils/helper.js";

export const createGame = async (
  title,
  sport,
  venue,
  playersRequired,
  startTime,
  endTime,
  description,
  costPerHead,
  skillLevel,
  host,
  location
) => {
  if (
    !title ||
    !sport ||
    !venue ||
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
  const trimmedVenue = checkString(venue, "Venue", 1);
  const trimmedSkillLevel = checkString(skillLevel, "Skill Level", 1);
  const trimmedLocation = checkString(location, "Location", 1);
  let trimmedDescription = "";
  if (description) {
    trimmedDescription = checkString(description, "Description", 1);
  }
  checkNumber(playersRequired, "Players Required", 1);
  checkNumber(costPerHead, "Cost per Head", 0);

  const newGame = new Game({
    title: trimmedTitle,
    sport: trimmedSport,
    venue: trimmedVenue,
    playersRequired: playersRequired,
    startTime,
    endTime,
    description: trimmedDescription,
    costPerHead: costPerHead,
    skillLevel: trimmedSkillLevel,
    host,
    location: trimmedLocation,
    players: [host],
  });

  const savedGame = await newGame.save();
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
  return Game.find({ startTime: { $gte: new Date() } }) // upcoming only
    .sort({ startTime: 1 })
    .limit(4);
};
