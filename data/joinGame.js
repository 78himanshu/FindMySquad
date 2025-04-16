import Game from "../models/hostGame.js";
import { ObjectId } from 'mongodb';

export const joinGame = async (gameId,userId) =>{
    if (!ObjectId.isValid(gameId) || !ObjectId.isValid(userId)) {
        throw new Error('Invalid gameId or userId');
    }
    const game = await Game.findById(gameId)

    if (!game){
        throw new Error('Game doesnt exist, Please try another game');
    } 

    if (game.players.includes(userId)) {
        throw new Error('User has already joined this game');
    }

    if (game.playersGoing >= game.playersRequired) {
        throw new Error('This game is already full');
    }

    game.players.push(userId)
    game.playersGoing = game.playersGoing + 1
    await game.save()

    return game
}