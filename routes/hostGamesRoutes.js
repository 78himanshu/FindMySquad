import express from 'express';
import {Router} from 'express';
const router = Router();
import {hostGameData} from '../data/index.js'
import { checkString,checkNumber } from '../utils/helper.js';
import { requireAuth } from '../middleware/auth.js';

router
    .route('/')
    // .get(requireAuth,(req,res)=>{
    //     const hostID = req.user.userID
    //     res.render('hostGameForm',{hostID})
    // })
    //Need to uncomment after we create the login id part completely 
    .get((req, res) => {
        const hostId = '6613814234b35400bb3b4d88';
        res.render('hostGame/hostGameForm', { hostId });
      })
    .post(async(req,res) =>{
        const x = req.body;
        if (!x || Object.keys(x).length === 0){
            return res
            .status(400)
            .json({error: 'There are no fields in the request body'});
        }
        if( !x.title || !x.sport || !x.venue || !x.playersRequired || !x.dateTime || !x.costPerHead || !x.skillLevel || !x.host || !x.location){
            return res
            .status(400)
            .json({error: 'All fields need to have valid values'});
        }
        try {
            checkString(x.title,'Title')
            checkString(x.sport,'Sport')
            checkString(x.venue,'Venue')
            checkString(x.skillLevel,'Skill Level')
            checkString(x.location,'Location')
            checkString(x.description,'Description')
            checkNumber(x.playersRequired,'Players Required',1)
            checkNumber(x.costPerHead,'Cost per Head',0)
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }
        try {
            const newGame = await hostGameData.createGame(
                x.title,
                x.sport,
                x.venue,
                x.playersRequired,
                x.dateTime,
                x.description,
                x.costPerHead,
                x.skillLevel,
                x.host,
                x.location
            )
            return res.redirect('/host/success');
        } catch (e) {
            res.status(400).json({error: e.message})
        }
    })

router
    .route('/success')
    .get((req, res) => {
        res.render('hostGame/hostGameSuccess');
    });
      
    export default router;