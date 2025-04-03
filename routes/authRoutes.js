import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("auth/signup");
});

router.get("/login", (req, res) => {
  res.render("auth/login");
});

export default router;
