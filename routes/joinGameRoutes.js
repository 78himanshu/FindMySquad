import express from 'express';
const router = express.Router();

import { hostGameData, joinGameData } from '../data/index.js'
import auth from '../middleware/auth.js';
import User from '../models/User.js';
//import userProfile from '../models/userProfile.js';
router
    .get('/', async (req, res) => {    // get http://localhost:8080/join  get all games
        try {
            let userId=null
            let recommendation=[]

            if (req.user && req.user.userId){
                userId=req.user.userId
            const filtering ={
                //need to change this and get it from userProfile
                location: 'Jersey City',
                sport: { $in: ['Football', 'Basketball'] }
            }
            recommendation= await hostGameData.getAllGames(filtering)
            }
            const allGames= await hostGameData.getAllGames({})

            const plainRecommendation = recommendation.map(x => x.toObject());
            const plainAllGames = allGames.map(x => x.toObject());
            res.render('joinGame/joinGameForm',{
                recommendedGames: plainRecommendation,
                allGames: plainAllGames,
                userLoggedIn: !!userId,
                userId
            })

        } catch (e) {
            res.status(500).send(e.message)
        }
    })
    .post('/', auth, async (req, res) => {   // post http://localhost:8080/join  join the  games
        const { gameId } = req.body;
        const userId = '6613814234b35400bb3b4d89';
        // const userId = req.user.userId;

        try {
            await joinGameData.joinGame(gameId, userId);
            res.redirect('/join/success');
        } catch (e) {
            res.status(400).send(e.message)
        }
    })

router.
    get('/filter', auth, async (req, res) => {
        try {
            const { city, sport, minPlayers, maxCost, skillLevel } = req.query;
            const filters = {}

            if (city) filters.location = city;
            if (sport) filters.sport = sport;
            if (minPlayers) filters.playersRequired = { $gte: Number(minPlayers) }
            if (maxCost) filters.costPerHead = { $lte: Number(maxCost) }
            if (skillLevel) filters.skillLevel = skillLevel;

            filters.dateTime = { $gte: new Date() }

            const allGames = await hostGameData.getAllGames(filters);
            const plainAll = allGames.map(g => g.toObject());

            res.render('joinGame/joinGameForm', { recommendedGames: [], allGames: plainAll, userId: req.user.userId })

        } catch (error) {
            res.status(500).send(e.message)
        }
    })

router.
    get('/:id', async (req, res) => { //http://localhost:8080/join/67f970e5d5c97b58736c31be
        try {
            const gameId = req.params.id;
            const game = await hostGameData.getGameById(gameId);

            if (!game) return res.status(404).send('Game not found');

            res.render('joinGame/gameDetails', { 
                game: game.toObject(), 
                userLoggedIn: !!req.user
            });

        } catch (error) {
            res.status(500).send(e.message)
        }
    })


export default router;