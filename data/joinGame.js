import Game from "../models/hostGame.js";
import { ObjectId } from "mongodb";
import { updateKarmaPoints } from "../utils/karmaHelper.js";
import { evaluateAchievements } from "../utils/achievementHelper.js";

export const joinGame = async (gameId, userId) => {
  if (!ObjectId.isValid(gameId) || !ObjectId.isValid(userId)) {
    throw new Error("Invalid gameId or userId");
  }
  const game = await Game.findById(gameId);

  if (game.players.length >= game.playersRequired) {
    throw new Error("Session is Full");
  }

  if (!game) {
    throw new Error("Game doesnt exist, Please try another game");
  }

  //checking in the data layer also abouyt the start time check
  if (new Date(game.startTime) < new Date()) {
    throw new Error("Cannot join a game that's already over");
  }

  if (game.players.some((id) => id.toString() === userId.toString())) {
    throw new Error("User has already joined this game");
  }

  if (game.playersGoing >= game.playersRequired) {
    throw new Error("This game is already full");
  }

  game.players.push(userId);
  game.playersGoing = game.playersGoing + 1;

  await updateKarmaPoints(userId, 10);
  await evaluateAchievements(userId);

  await game.save();

  return game;
};

export const getJoinedGamesByUser = async (userId) => {
  if (!ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  const joinedGames = await Game.find({ players: userId });
  return joinedGames;
};

export const leaveGame = async (gameId, userId) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found.");
  }
  if (game.host.toString() === userId.toString()) {
    throw new Error("Host cannot leave their own game");
  }

  const isInGame = game.players.some(
    (id) => id.toString() === userId.toString()
  );
  if (!isInGame) {
    throw new Error("You have not joined this game");
  }

  //checking if a player is part of the game or not
  game.players = game.players.filter(
    (id) => id.toString() !== userId.toString()
  );
  game.playersGoing = game.players.length;

  await updateKarmaPoints(userId, -10);
  await game.save();
  await evaluateAchievements(userId);
  //adding return statement
  return game;
};

export const getHostedGamesByUser = async (userId) => {
  if (!ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  const hostedGames = await Game.find({ host: userId });
  return hostedGames;
};
