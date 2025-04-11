import express from 'express';
const router = express.Router();

import { hostGameData, joinGameData} from '../data/index.js'
import userProfile from '../models/userProfil.js'
import { requireAuth } from '../middleware/authMiddleware.js';

router
    .get('/', requireAuth,async(req,res) => {
        try {
            const userId= req.user.userId;
            //need to verify if it is working correctly with userprofile created by himanshu
            const profile = await userProfile.findOne({userId})
            if (!profile){
                return res.status(404).send('User profile not found')
            }
            const filters = {
                location: profile.profile.city,
                sport: { $in: profile.sportsInterests.map((s) => s.sport) }
            };
            const games=await hostGameData.getAllGames(filters)

            

        } catch (e) {
            
        }
    })