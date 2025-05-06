import Game from "../models/hostGame.js";
import { ObjectId } from "mongodb";
import { updateKarmaPoints } from "../utils/karmaHelper.js"; 


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

  if (game.players.some((id) => id.toString() === userId.toString())) {
    throw new Error("User has already joined this game");
  }

  if (game.playersGoing >= game.playersRequired) {
    throw new Error("This game is already full");
  }

  game.players.push(userId);
  game.playersGoing = game.playersGoing + 1;

  await updateKarmaPoints(userId, 10);

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
    const game = await hostGameData.getGameById(gameId);
    return res.render("joinGame/gameDetails", {
      game: game.toObject(),
      isLoggedIn: true,
      userId,
      hostId: req.user.userID,
      hasJoined: true,
      error: "Host cannot leave their own game",
      layout: "main",
      head: `<link rel="stylesheet" href="/css/joinGame.css">`,
    });
  }

  game.players = game.players.filter(
    (id) => id.toString() !== userId.toString()
  );
  game.playersGoing = game.players.length;

  await updateKarmaPoints(userId, -10);
  await game.save();
};
