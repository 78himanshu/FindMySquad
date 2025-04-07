import express from 'express';
import { Router } from 'express';
const router = Router();
import { authUserData } from '../data/index.js'
import { checkString, checkNumber } from '../utils/helper.js';

router
    .route('/signup')
    .post(async (req, res) => {
        const x = req.body;
        // console.log("xx", x)

        if (!x || Object.keys(x).length === 0) {
            return res.status(400).json({ error: 'There are no fields in the request body' });
        }

        if (!x.username || !x.email || !x.password) {
            return res.status(400).json({ error: 'All fields need to have valid values' });
        }

        //console.log("==>>", x.username, x.email, x.password);

        try {
            checkString(x.username, 'username');
            checkString(x.email, 'email');
            checkString(x.password, 'password');
            console.log(">>>>")
        } catch (e) {
            return res.status(400).json({ error: e.toString() });
        }

        try {
            const newUser = await authUserData.register(x.username, x.email, x.password);
            console.log("newUser", newUser);
            return res.status(200).json(newUser);
        } catch (e) {
            return res.status(400).json({ error: e.toString() });
        }
    });

router
    .route('/signin')
    .post(async (req, res) => {
        const x = req.body;

        if (!x || Object.keys(x).length === 0) {
            return res.status(400).json({ error: 'There are no fields in the request body' });
        }

        if (!x.email || !x.password) {
            return res.status(400).json({ error: 'All fields need to have valid values' });
        }

        try {
            checkString(x.email, 'email');
            checkString(x.password, 'password');
        } catch (e) {
            return res.status(400).json({ error: e.toString() });
        }

        try {
            const user = await authUserData.login(x.email, x.password);
            return res.status(200).json(user);
        } catch (e) {
            return res.status(400).json({ error: e.message || e.toString() });
        }
    });


export default router;
