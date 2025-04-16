import express from "express";
const router = express.Router();
import hostGamesRoutes from "./hostGamesRoutes.js";
import joinGameRoutes from "./joinGameRoutes.js"
import authRoutes from "./authRoutes.js";
import userProfileRoutes from "./userProfileRoutes.js";  // <-- ADD THIS

import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
    res.render("index", {
      title: "FindMySquad",
      user: req.user || null
    });
  });

  // Auth routes
  app.use("/", authRoutes);

  // Host games routes
  app.use("/host", hostGamesRoutes);

  //Join game routes
  app.use('/join', joinGameRoutes);


  app.use("/userProfile", userProfileRoutes);  // <-- ADD THIS LINE


};

export default configRoutesFunction; 