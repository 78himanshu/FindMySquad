import express from "express";
const router = express.Router();
import landingRoutes from "./landingRoutes.js";
import hostGamesRoutes from "./hostGamesRoutes.js"
import authRoutes from './authRoutes.js';

router.get("/", (req, res) => {
  res.render("index", { title: "FindMySquad" });
});

const configRoutesFunction = (app) => {

  app.use('/host', hostGamesRoutes);
  app.use('/api/auth', authRoutes);
};


export default configRoutesFunction;
