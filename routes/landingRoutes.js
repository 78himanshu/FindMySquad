import express from "express";
import { login, signup } from "../controllers/authController.js";

const router = express.Router();

// Home route with session handling
router.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

export default router;
