import express from 'express';
import {Router} from 'express';
const router = Router();
import {hostGameData} from '../data/index.js'
import { checkString,checkNumber } from '../utils/Helper.js';

router
    .route('/')
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
            res.status(200).json(newGame);
        } catch (e) {
            res.status(400).json({error: e.message})
        }
    })

    export default router;