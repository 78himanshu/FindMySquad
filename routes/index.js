import express from "express";
const router = express.Router();
import hostGamesRoutes from "./hostGamesRoutes.js";
import authRoutes from "./authRoutes.js";
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
      user: req.user || null,
      success: req.query.success
    });
  });

  // Auth routes
  app.use("/", authRoutes);

  // Host games routes
  app.use("/host", hostGamesRoutes);

};

export default configRoutesFunction;