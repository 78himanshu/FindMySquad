import express from 'express';
const router = express.Router();

import { hostGameData, joinGameData} from '../data/index.js'
import auth from '../middleware/auth.js';
import User from '../models/User.js';
//import userProfile from '../models/userProfile.js';
router
    .get('/', auth,async(req,res) => {
        try {
            //const userId = '6613814234b35400bb3b4d88';
            if(!req.user || !req.user.userId){
                return res.redirect('/login?error=Please login to view games');
            }
            const userId= req.user.userId;

            //need to verify if it is working correctly with userprofile created by himanshu
            // const profile = await userProfile.findOne({userId})
            // //Need to addback line 15 after we get userprofile
            // if (!profile){
            //     return res.status(404).send('User profile not found')
            // }
            // else{
            //     const filters = {
            //         location: profile.profile.city,
            //         sport: { $in: profile.sportsInterests.map((s) => s.sport) }
            //     };
            //     let recommendedGames = await hostGameData.getAllGames(filters);
            // }

            // const filters = {
            //     location: 'Jersey City',
            //     sport: { $in: ['Football', 'Basketball', 'Tennis'] }
            // };
            let recommendedGames = [];
        


            const allGames=await hostGameData.getAllGames(filters)
            const plainRecommended = games.map(game => game.toObject());
            const plainAll =allGames.map(g => g.toObject());
            res.render('joinGame/joinGameForm', { recommendedGames: plainRecommended, allGames: plainAll, userId });     

        } catch (e) {
            res.status(500).send(e.message)
        }
    })
    .post('/', auth, async(req,res) => {
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
    get('/filter',auth,async(req,res)=>{
        try {
            const { city, sport, minPlayers, maxCost, skillLevel  } = req.query;
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
    get('/:id',auth,async(req,res)=>{
        try {
            const gameId = req.params.id;
            const game = await hostGameData.getGameById(gameId);
        
            if (!game) return res.status(404).send('Game not found');
        
            res.render('joinGame/gameDetails', { game: game.toObject(), userLoggedIn: req.user ? true : false });
        
        } catch (error) {
            res.status(500).send(e.message)
        }
    })


    export default router;