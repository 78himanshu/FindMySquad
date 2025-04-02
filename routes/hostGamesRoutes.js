import express from 'express'
import {createGameController } from "../controllers/hostGameControllers.js";

const router = express.Router();

router
    .post('/', createGameController);

export default router;