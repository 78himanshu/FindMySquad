import express from "express";
const router = express.Router();
import hostGamesRoutes from "./hostGamesRoutes.js";
import joinGameRoutes from "./joinGameRoutes.js";
import authRoutes from "./authRoutes.js";
import userProfileRoutes from "./userProfileRoutes.js";
import esportsRoutes from "./esports.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import gymBuddyRoutes from "./gymBuddyRoutes.js";
import tournamentRoutes from "./tournamentRoutes.js";
import { hostGameData } from "../data/index.js";
import { userProfileData } from "../data/index.js";

const configRoutesFunction = (app) => {
  // Base route - simplified since we're using middleware
  app.get("/", async (req, res) => {
    console.log("req,", req.user);
    const topUsers = await userProfileData.getTopKarmaUsers();
    console.log("TOP USERS FOR HOMEPAGE:", topUsers);
    const upcomingGames = await hostGameData.upcomingGames();
    console.log("upcomingGames", upcomingGames);

    res.render("index", {
      title: "FindMySquad",
      user: req.user || null,
      layout: "main",
      upcomingGames: upcomingGames,
      topUsers: topUsers,
    });
  });

  // Auth routes
  app.use("/", authRoutes);

  // Host games routes
  app.use("/host", hostGamesRoutes);
  app.use("/tournaments", tournamentRoutes);
  app.use("/gymBuddy", gymBuddyRoutes);
  //Join game routes
  app.use("/join", joinGameRoutes);

  app.use("/profile", userProfileRoutes);
};

export default configRoutesFunction;
