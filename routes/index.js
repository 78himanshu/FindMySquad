import express from "express";
const router = express.Router();
import hostGamesRoutes from "./hostGamesRoutes.js";
import joinGameRoutes from "./joinGameRoutes.js"
import authRoutes from "./authRoutes.js";
import userProfileRoutes from "./userProfileRoutes.js";  // <-- ADD THIS

import jwt from "jsonwebtoken";
import User from "../models/User.js"; 
import gymBuddyRoutes from './gymBuddyRoutes.js';

const configRoutesFunction = (app) => {
  // Authentication middleware (runs before all routes)
  //   app.use(async (req, res, next) => {
  //     try {
  //       const token = req.cookies?.token;
  //       if (token) {
  //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //         req.user = await User.findById(decoded.userId);
  //       }
  //     } catch (err) {
  //       console.error('Authentication error:', err);
  //     }
  //     next();
  //   });

  // Base route - simplified since we're using middleware
  app.get("/", (req, res) => {
    console.log("req,", req.user);
    res.render("index", {
      title: "FindMySquad",
      user: req.user || null,
      layout: "main",
    });
  });

  // Auth routes
  app.use("/", authRoutes);

  // Host games routes
  app.use("/host", hostGamesRoutes);
  app.use("/gymBuddy", gymBuddyRoutes);

  //Join game routes
  app.use('/join', joinGameRoutes);

  app.use("/profile", userProfileRoutes);


};

export default configRoutesFunction; 