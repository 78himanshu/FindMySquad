import express from "express";
const router = express.Router();
import { signup, login } from "../controllers/authController.js";

router.get("/", (req, res) => {
  res.render("index", { title: "FindMySquad" });
});

router.post("/signup", signup);
router.post("/login", login);

export default router;
